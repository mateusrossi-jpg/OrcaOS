import { supabase } from './supabaseClient';

export class BudgetSyncService {
  private worker: Worker;
  private STORAGE_KEY = '@aferix:budgets';

  constructor() {
    // Inicialização moderna de Web Worker suportada pelo Vite e Next.js
    this.worker = new Worker(new URL('./budgetSyncWorker.ts', import.meta.url), { type: 'module' });
    this.setupListener();
  }

  private setupListener() {
    this.worker.onmessage = (event: MessageEvent) => {
      const { status, syncedIds } = event.data;
      
      if (status === 'success') {
        this.markAsSynced(syncedIds);
      } else {
        console.error('Erro no Worker de sincronização:', event.data.message);
      }
    };
  }

  public async syncPendingBudgets() {
    // 1. Lê do localStorage na thread principal
    const rawData = localStorage.getItem(this.STORAGE_KEY);
    if (!rawData) return;

    const budgets = JSON.parse(rawData);
    // Filtra apenas orçamentos que ainda não estão marcados como sincronizados
    const pending = budgets.filter((b: any) => !b.isSynced);

    if (pending.length > 0) {
      // Obtém o token de sessão JWT do usuário atual de forma segura
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // 2. Envia a carga de dados para o Worker processar sem travar a UI
      this.worker.postMessage({ budgets: pending, token });
    }
  }

  private markAsSynced(syncedIds: string[]) {
    const rawData = localStorage.getItem(this.STORAGE_KEY);
    if (!rawData) return;

    const budgets = JSON.parse(rawData);
    const updated = budgets.map((b: any) => syncedIds.includes(b.id) ? { ...b, isSynced: true } : b);

    // 3. Thread principal atualiza o Storage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }
}