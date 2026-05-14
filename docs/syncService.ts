import { supabase } from './supabaseClient';

export interface SyncOperation {
  id: string;
  type: 'UPSERT_BUDGET' | 'DELETE_BUDGET' | 'UPSERT_CLIENT';
  payload: any;
  timestamp: number;
}

/**
 * Inicia a tentativa de processar a fila de sincronização salva localmente.
 */
export async function triggerSupabaseSync() {
  if (!navigator.onLine) {
    console.log('[SyncService] Dispositivo offline. Sincronização adiada.');
    return;
  }

  const queueRaw = localStorage.getItem('sync_queue');
  if (!queueRaw) return;

  let syncQueue: SyncOperation[] = [];
  try {
    syncQueue = JSON.parse(queueRaw);
  } catch (e) {
    console.error('[SyncService] Falha ao ler fila de sincronização', e);
    return;
  }

  if (syncQueue.length === 0) return;

  console.log(`[SyncService] Iniciando sincronização de ${syncQueue.length} itens...`);

  const failedItems: SyncOperation[] = [];

  for (const item of syncQueue) {
    try {
      await processSyncItem(item);
    } catch (error) {
      console.error(`[SyncService] Falha ao sincronizar item ${item.id}`, error);
      // Mantém na fila os itens que falharem (por erro de rede/servidor) para tentar novamente
      failedItems.push(item);
    }
  }

  // Atualiza a fila apenas com os itens que falharam
  localStorage.setItem('sync_queue', JSON.stringify(failedItems));
  
  if (failedItems.length === 0) {
    console.log('[SyncService] Sincronização concluída com sucesso.');
    // Dispara evento para atualizar a UI (Ex: acender LED Verde)
    window.dispatchEvent(new Event('sync:completed'));
  } else {
    console.log(`[SyncService] Sincronização finalizada com ${failedItems.length} falhas.`);
    // Dispara evento para atualizar a UI (Ex: acender LED Âmbar)
    window.dispatchEvent(new Event('sync:pending'));
  }
}

/**
 * Processa a operação com o backend (Supabase).
 */
async function processSyncItem(item: SyncOperation) {
  switch (item.type) {
    case 'UPSERT_BUDGET':
      const { error: errorBudget } = await supabase
        .from('budgets')
        .upsert(item.payload);
      if (errorBudget) throw new Error(`Erro Supabase (UPSERT_BUDGET): ${errorBudget.message}`);
      console.log(`[SyncService] Orçamento sincronizado com sucesso.`);
      break;
    case 'DELETE_BUDGET':
      const { error: errorDelete } = await supabase
        .from('budgets')
        .delete()
        .eq('id', item.payload.id);
      if (errorDelete) throw new Error(`Erro Supabase (DELETE_BUDGET): ${errorDelete.message}`);
      console.log(`[SyncService] Orçamento deletado com sucesso.`);
      break;
    case 'UPSERT_CLIENT':
      const { error: errorClient } = await supabase
        .from('clients')
        .upsert(item.payload);
      if (errorClient) throw new Error(`Erro Supabase (UPSERT_CLIENT): ${errorClient.message}`);
      console.log(`[SyncService] Cliente sincronizado com sucesso.`);
      break;
    default:
      console.warn(`[SyncService] Tipo de sincronização desconhecido: ${item.type}`);
  }
}

/**
 * Adiciona uma operação na fila local e já tenta sincronizar.
 */
export function addToSyncQueue(type: SyncOperation['type'], payload: any) {
  const queueRaw = localStorage.getItem('sync_queue');
  const syncQueue: SyncOperation[] = queueRaw ? JSON.parse(queueRaw) : [];
  
  const newItem: SyncOperation = {
    id: crypto.randomUUID(), // Suportado por navegadores modernos, garante um ID único
    type,
    payload,
    timestamp: Date.now()
  };
  
  syncQueue.push(newItem);
  localStorage.setItem('sync_queue', JSON.stringify(syncQueue));
  
  // Tenta sincronizar imediatamente em background
  triggerSupabaseSync().catch(console.error);
  
  // Avisa a UI que uma nova operação entrou na fila
  window.dispatchEvent(new Event('sync:pending'));
}