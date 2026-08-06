/**
 * telemetry.ts — Registro de Eventos e Telemetria In-App (Offline-First)
 *
 * Registra erros de campo, exceções e interações de feedback em armazenamento local (localStorage/IndexedDB)
 * para auditoria durante o teste do Anel Piloto B2B.
 */

export interface PilotEventLog {
  id: string;
  type: 'error' | 'feedback' | 'onboarding' | 'audit' | 'business_event' | 'phase_start';
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

const PILOT_LOGS_STORAGE_KEY = 'aferix:pilot-logs:v1';

export function logPilotEvent(
  type: PilotEventLog['type'],
  message: string,
  details?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;

  const event: PilotEventLog = {
    id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    message,
    details,
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = window.localStorage.getItem(PILOT_LOGS_STORAGE_KEY);
    const logs: PilotEventLog[] = existing ? JSON.parse(existing) : [];
    logs.unshift(event);
    // Manter apenas os últimos 50 eventos para não inflar o storage
    window.localStorage.setItem(PILOT_LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch (err) {
    console.error('[Telemetry] Erro ao gravar log do piloto:', err);
  }
}

export function getPilotLogs(): PilotEventLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = window.localStorage.getItem(PILOT_LOGS_STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
}

export interface PilotMetricsSummary {
  totalEvents: number;
  phase: string;
  whatsappDispatches: number;
  pixKeysCopied: number;
  totalVolumeDispatchedCents: number;
  errorsRecorded: number;
}

export function getPilotMetricsSummary(): PilotMetricsSummary {
  const logs = getPilotLogs();

  let phase = 'beta_expansion';
  let whatsappDispatches = 0;
  let pixKeysCopied = 0;
  let totalVolumeDispatchedCents = 0;
  let errorsRecorded = 0;

  for (const log of logs) {
    if (log.type === 'phase_start' && log.details?.pilot_phase) {
      phase = String(log.details.pilot_phase);
    }
    if (log.type === 'error') {
      errorsRecorded++;
    }
    if (log.type === 'business_event') {
      if (log.message === 'Cobrança Disparada via WhatsApp') {
        whatsappDispatches++;
        if (typeof log.details?.totalCents === 'number') {
          totalVolumeDispatchedCents += log.details.totalCents;
        }
      }
      if (log.message === 'Chave Pix Copiada') {
        pixKeysCopied++;
      }
    }
  }

  return {
    totalEvents: logs.length,
    phase,
    whatsappDispatches,
    pixKeysCopied,
    totalVolumeDispatchedCents,
    errorsRecorded,
  };
}

export function exportPilotLogsJson(): string {
  const logs = getPilotLogs();
  const summary = getPilotMetricsSummary();
  return JSON.stringify({ summary, logs }, null, 2);
}

export function clearPilotLogs(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PILOT_LOGS_STORAGE_KEY);
}
