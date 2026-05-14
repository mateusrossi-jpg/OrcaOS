import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BudgetSyncService } from './BudgetSyncService';

// 1. Mock do Web Worker nativo do navegador
const postMessageMock = vi.fn();
class MockWorker {
  onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
  postMessage = postMessageMock;
  constructor() {}
}

describe('BudgetSyncService', () => {
  let service: BudgetSyncService;

  beforeEach(() => {
    // Intercepta a chamada `new Worker()` e injeta o nosso Mock
    vi.stubGlobal('Worker', MockWorker);
    
    // Intercepta o `localStorage`
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
    });

    // Intercepta o console.error para mantermos o terminal de testes limpo
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    service = new BudgetSyncService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve enviar apenas orçamentos pendentes para o Worker', () => {
    const mockData = [
      { id: '1', isSynced: true },
      { id: '2', isSynced: false } // Apenas este deve ir para o Worker
    ];
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

    service.syncPendingBudgets();

    expect(postMessageMock).toHaveBeenCalledWith({
      budgets: [{ id: '2', isSynced: false }]
    });
  });

  it('não deve enviar mensagens ao Worker se não houver pendências', () => {
    const mockData = [{ id: '1', isSynced: true }];
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

    service.syncPendingBudgets();

    expect(postMessageMock).not.toHaveBeenCalled();
  });

  it('deve atualizar o localStorage quando o Worker retornar sucesso', () => {
    const mockData = [{ id: '2', isSynced: false }];
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

    // Simula o Worker devolvendo uma mensagem de sucesso para a Thread Principal
    const workerInstance = (service as any).worker;
    workerInstance.onmessage({ data: { status: 'success', syncedIds: ['2'] } } as MessageEvent);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      '@aferix:budgets',
      JSON.stringify([{ id: '2', isSynced: true }]) // O status deve ter mudado
    );
  });

  it('deve lidar com falhas de rede do Worker de forma silenciosa e segura', () => {
    const workerInstance = (service as any).worker;
    workerInstance.onmessage({ data: { status: 'error', message: 'Falha de rede (Timeout)' } } as MessageEvent);

    expect(console.error).toHaveBeenCalledWith('Erro no Worker de sincronização:', 'Falha de rede (Timeout)');
    expect(localStorage.setItem).not.toHaveBeenCalled(); // Não deve alterar o storage local
  });
});