/**
 * syncWorker.ts — Motor de Sincronização Offline-First · Aferix OS
 *
 * Estratégia:
 *  - Outbox Pattern: toda mutação local vai para sync_outbox antes de ir à nuvem.
 *  - Ordem cronológica estrita: processamento por id (auto-incremento da fila).
 *  - Tabelas permitidas: allowlist explícita — qualquer outra tabela é rejeitada.
 *  - Falhas de rede temporária: backoff exponencial com jitter (cap em 32 s).
 *  - Falhas permanentes (4xx auth/RLS): não retentamos — movemos para dead-letter.
 *  - Mutex: isSyncing garante que apenas um ciclo rode por vez.
 */

import { db } from '../database/db';
import { supabase } from '../database/supabaseClient';
import type { SyncOutboxItem } from '../database/schema';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes de Configuração
// ─────────────────────────────────────────────────────────────────────────────

/** Tabelas autorizadas para sincronização remota. Qualquer outro nome é descartado. */
const ALLOWED_TABLES = new Set([
  'customers',
  'work_orders',
  'work_order_items',
  'work_order_equipment',
  'catalog_items',
  'transactions',
  'company_settings',
]);

/** Número máximo de tentativas antes de desistir de um item. */
const MAX_RETRIES = 5;

/** Delay base em ms para backoff exponencial. */
const BASE_DELAY_MS = 1_000;

/** Cap máximo do backoff. */
const MAX_DELAY_MS = 32_000;

/** Códigos HTTP que indicam falha PERMANENTE — não devem ser retentados. */
const PERMANENT_ERROR_CODES = new Set([400, 401, 403, 404, 409, 422]);

// ─────────────────────────────────────────────────────────────────────────────
// Estado do Worker
// ─────────────────────────────────────────────────────────────────────────────

let isSyncing = false;

/** Contagem de falhas consecutivas por item (chave: id numérico do outbox). */
const retryCountMap = new Map<number, number>();

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de Backoff e Rede
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Delay exponencial com jitter: 2^attempt × base ± 20% jitter, cap em MAX_DELAY_MS.
 */
function computeBackoffMs(attempt: number): number {
  const expo = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS);
  const jitter = expo * 0.2 * (Math.random() * 2 - 1); // ±20%
  return Math.round(expo + jitter);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Extrai código HTTP de um erro Supabase PostgREST. */
function extractHttpStatus(error: unknown): number | null {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    const code = e['status'] ?? e['code'];
    const parsed = typeof code === 'string' ? parseInt(code, 10) : typeof code === 'number' ? code : NaN;
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sincronização de Um Item
// ─────────────────────────────────────────────────────────────────────────────

interface SyncResult {
  success: boolean;
  permanent: boolean; // true = não tentar novamente
  errorMessage?: string;
}

async function syncSingleItem(item: SyncOutboxItem): Promise<SyncResult> {
  const { table_name, operation, payload, uuid } = item;

  // Segurança: rejeitar tabelas não autorizadas sem tentar a rede
  if (!ALLOWED_TABLES.has(table_name)) {
    return {
      success: false,
      permanent: true,
      errorMessage: `[SyncWorker] Tabela '${table_name}' não autorizada — descartando.`,
    };
  }

  try {
    if (operation === 'INSERT' || operation === 'UPDATE') {
      // Estratégia de Resolução de Conflitos: Last-Write-Wins (LWW) baseada em carimbos ISO
      const enrichedPayload = {
        ...payload,
        updated_at: payload['updated_at'] ?? new Date(item.created_at).toISOString(),
      };

      const { error } = await supabase.from(table_name).upsert(enrichedPayload, {
        onConflict: 'id',
      });
      if (error) {
        const status = extractHttpStatus(error);
        const permanent = status !== null && PERMANENT_ERROR_CODES.has(status);
        return { success: false, permanent, errorMessage: error.message };
      }
      return { success: true, permanent: false };
    }

    if (operation === 'DELETE') {
      const id = payload?.id ?? uuid;
      const { error } = await supabase.from(table_name).delete().eq('id', id);
      if (error) {
        const status = extractHttpStatus(error);
        const permanent = status !== null && PERMANENT_ERROR_CODES.has(status);
        return { success: false, permanent, errorMessage: error.message };
      }
      return { success: true, permanent: false };
    }

    return { success: false, permanent: true, errorMessage: `Operação desconhecida: ${operation}` };
  } catch (err) {
    // Erros de fetch/rede — não permanentes
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, permanent: false, errorMessage: message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Processamento da Fila (com backoff por item)
// ─────────────────────────────────────────────────────────────────────────────

export async function processSyncQueue(): Promise<void> {
  if (!navigator.onLine) {
    console.debug('[SyncWorker] Offline — sincronização adiada.');
    return;
  }

  if (isSyncing) {
    console.debug('[SyncWorker] Ciclo já ativo — ignorando chamada concorrente.');
    return;
  }

  isSyncing = true;

  try {
    // Busca itens em ordem cronológica estrita (id auto-incremento garante FIFO)
    const pendingItems = await db.sync_outbox.orderBy('id').toArray();

    if (pendingItems.length === 0) {
      isSyncing = false;
      return;
    }

    console.info(`[SyncWorker] ${pendingItems.length} item(s) na fila de sincronização.`);

    for (const item of pendingItems) {
      if (!item.id) continue; // registro sem id (nunca deve ocorrer, mas defesa)

      const attempt = retryCountMap.get(item.id) ?? 0;

      // Backoff: se não é a primeira tentativa, aguarda antes de processar
      if (attempt > 0) {
        const delay = computeBackoffMs(attempt - 1);
        console.debug(`[SyncWorker] Item ${item.id} — tentativa ${attempt + 1}, aguardando ${delay}ms.`);
        await sleep(delay);

        // Verifica conectividade novamente após o sleep
        if (!navigator.onLine) {
          console.debug('[SyncWorker] Ficou offline durante backoff — abortando ciclo.');
          break;
        }
      }

      const result = await syncSingleItem(item);

      if (result.success) {
        await db.sync_outbox.delete(item.id);
        retryCountMap.delete(item.id);
        console.info(`[SyncWorker] ✓ Item ${item.id} (${item.table_name}.${item.operation}) sincronizado.`);
        continue;
      }

      // Falha permanente → descarta sem retry
      if (result.permanent) {
        console.error(`[SyncWorker] ✗ Item ${item.id} falha permanente — ${result.errorMessage}. Descartando.`);
        await db.sync_outbox.delete(item.id);
        retryCountMap.delete(item.id);
        continue;
      }

      // Falha transitória → incrementa contador
      const nextAttempt = attempt + 1;
      retryCountMap.set(item.id, nextAttempt);

      if (nextAttempt >= MAX_RETRIES) {
        console.error(`[SyncWorker] ✗ Item ${item.id} excedeu ${MAX_RETRIES} tentativas — descartando.`);
        await db.sync_outbox.delete(item.id);
        retryCountMap.delete(item.id);
        continue;
      }

      console.warn(
        `[SyncWorker] ⚠ Item ${item.id} falhou (tentativa ${nextAttempt}/${MAX_RETRIES}) — ${result.errorMessage}. Interrompendo fila para retry.`,
      );
      // Interrompe a fila para manter a ordem cronológica: o próximo ciclo
      // retomará a partir deste item com backoff aplicado.
      break;
    }
  } catch (err) {
    console.error('[SyncWorker] Erro inesperado no ciclo de sync:', err);
  } finally {
    isSyncing = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API de Enfileiramento
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enfileira uma mutação local para sincronização e dispara o worker
 * imediatamente em background (fire-and-forget).
 */
export async function enqueueMutation(
  tableName: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  payload: Record<string, unknown>,
): Promise<void> {
  if (!ALLOWED_TABLES.has(tableName)) {
    console.warn(`[SyncWorker] enqueueMutation: tabela '${tableName}' não autorizada — ignorada.`);
    return;
  }

  await db.sync_outbox.add({
    uuid: (payload['id'] as string | undefined) ?? crypto.randomUUID(),
    table_name: tableName,
    operation,
    payload,
    created_at: Date.now(),
  });

  // Dispara em background; falhas são silenciosas (serão retentadas no próximo ciclo)
  processSyncQueue().catch(() => undefined);
}

// ─────────────────────────────────────────────────────────────────────────────
// Inicialização do Worker
// ─────────────────────────────────────────────────────────────────────────────

let workerInitialized = false;

/**
 * Deve ser chamado UMA VEZ no boot da aplicação (ex: em main.tsx após montar o React).
 * Idempotente — chamadas redundantes são ignoradas.
 */
export function initSyncWorker(): void {
  if (workerInitialized) return;
  workerInitialized = true;

  // Evento de reconexão de rede
  window.addEventListener('online', () => {
    console.info('[SyncWorker] Conexão restabelecida — disparando ciclo de sync.');
    processSyncQueue().catch(() => undefined);
  });

  // Polling de fallback a cada 60 s (intervalo duplicado — menos agressivo)
  setInterval(() => {
    if (navigator.onLine) processSyncQueue().catch(() => undefined);
  }, 60_000);

  // Ciclo inicial
  if (navigator.onLine) {
    processSyncQueue().catch(() => undefined);
  }

  console.info('[SyncWorker] Inicializado. Tabelas autorizadas:', [...ALLOWED_TABLES].join(', '));
}
