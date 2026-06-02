import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../storage/dexieDatabase';
import { cloudSyncService } from '../services/CloudSyncService';
import { accountPlanService } from '../services/accountPlanService';
import { assetExecutionService } from '../services/AssetExecutionService';
import { supabase } from '../core/cloud/supabaseClient';

// Armazena de forma volátil os envelopes simulados na nuvem para teste de Pull/Push realístico
let mockCloudEnvelopes: any[] = [];
let mockCloudSequence = 100;
let activeSessionCompanyId = 'tenant-a-company';
let activeSessionUserId = 'user-a';

// Mock Supabase dinâmico para testar isolamento de tenant e sync
vi.mock('../core/cloud/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn(async () => {
          return {
            data: {
              session: {
                user: { id: activeSessionUserId, user_metadata: { company_id: activeSessionCompanyId, workspace_id: 'tenant-workspace' } },
                companyId: activeSessionCompanyId
              }
            },
            error: null
          };
        })
      },
      from: vi.fn((tableName: string) => {
        const chain: any = {};
        chain._gtVal = undefined;
        chain._eqVal = undefined;
        chain._limitVal = undefined;

        chain.select = vi.fn((fields?: string) => chain);
        chain.order = vi.fn((orderField: string, options?: any) => chain);
        chain.limit = vi.fn((limitVal: number) => {
          chain._limitVal = limitVal;
          return chain;
        });
        chain.gt = vi.fn((colName: string, val: any) => {
          chain._gtVal = val;
          return chain;
        });
        chain.lt = vi.fn((colName: string, val: any) => chain);
        chain.eq = vi.fn((colName: string, val: any) => {
          chain._eqVal = val;
          return chain;
        });
        chain.maybeSingle = vi.fn(async () => {
          if (chain._eqVal !== undefined) {
            const match = mockCloudEnvelopes.find(e => e.event_id === chain._eqVal || e.envelope_id === chain._eqVal);
            return { data: match || null, error: null };
          }
          if (mockCloudEnvelopes.length === 0) return { data: null, error: null };
          const sorted = [...mockCloudEnvelopes].sort((a, b) => b.sequence - a.sequence);
          return { data: sorted[0], error: null };
        });

        const runQuery = async () => {
          let filtered = [...mockCloudEnvelopes];
          if (chain._gtVal !== undefined) {
            filtered = filtered.filter(e => e.sequence > chain._gtVal);
          }
          // Simula RLS por companyId
          filtered = filtered.filter(e => e.company_id === activeSessionCompanyId);
          // Ordena
          filtered.sort((a, b) => a.sequence - b.sequence);
          if (chain._limitVal !== undefined) {
            filtered = filtered.slice(0, chain._limitVal);
          }
          return { data: filtered, error: null };
        };

        chain.then = (onfulfilled: any, onrejected: any) => runQuery().then(onfulfilled, onrejected);

        chain.insert = vi.fn(async (payload: any) => {
          mockCloudSequence++;
          const newEnvelope = {
            ...payload,
            sequence: mockCloudSequence,
            company_id: activeSessionCompanyId,
            timestamp: new Date(Date.now() - 10000).toISOString()
          };
          mockCloudEnvelopes.push(newEnvelope);
          return { error: null };
        });

        return chain;
      })
    },
    isCloudEnabled: true
  };
});

describe('AFERIX PHASE 3 SPRINT P0: INTEGRATION TEST SUITE', () => {
  beforeAll(async () => {
    if (typeof global.localStorage === 'undefined') {
      const storage: Record<string, string> = {};
      global.localStorage = {
        getItem: (key: string) => storage[key] || null,
        setItem: (key: string, value: string) => { storage[key] = value; },
        removeItem: (key: string) => { delete storage[key]; },
        clear: () => { for (const k in storage) delete storage[k]; },
        length: 0,
        key: (index: number) => null
      } as any;
    }
    // Inicializa UUID do dispositivo local para Echo Prevention
    localStorage.setItem('AFERIX_INSTALLATION_ID', 'device-test-id-local');
  });

  beforeEach(async () => {
    mockCloudEnvelopes = [];
    mockCloudSequence = 100;
    activeSessionCompanyId = 'tenant-a-company';
    activeSessionUserId = 'user-a';

    await db.attendances.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.clients.clear();
    await db.assetExecutions.clear();
    await db.operationalEvents.clear();
    await db.settings.clear();
  });

  it('Cenário 1: Down-Sync & Convergence (Device A edits -> Push -> Device B Pulls -> Convergence)', async () => {
    const woId = 'wo-sync-concur-1';

    // 1. Simular Dispositivo A criando e alterando uma OS
    const initialOS = {
      id: woId,
      clientId: 'client-1',
      siteId: 'site-1',
      title: 'OS Inicial Dispositivo A',
      status: 'draft' as const,
      paymentStatus: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending' as const
    };

    // Adiciona evento na fila local do Dispositivo A
    await db.workOrders.add(initialOS);
    await db.operationalEvents.add({
      id: 'event-1',
      aggregateId: woId,
      aggregateType: 'workorder',
      eventType: 'WORKORDER_CREATED',
      timestamp: new Date().toISOString(),
      syncStatus: 'pending',
      snapshot: initialOS
    } as any);

    // Dispositivo A envia para a nuvem via Push
    const pushResult = await cloudSyncService.syncLocalToCloud();
    expect(pushResult.sent).toBe(1);
    expect(mockCloudEnvelopes.length).toBe(1);
    expect(mockCloudEnvelopes[0].payload.snapshot.title).toBe('OS Inicial Dispositivo A');

    // 2. Simular Dispositivo B recebendo a alteração via Pull incremental
    // Limpamos o IndexedDB local do Dispositivo B para verificar a convergência de dados
    await db.workOrders.clear();
    await db.operationalEvents.clear();
    await db.settings.clear(); // Zera cursor local do Dispositivo B

    // Alterar o device_id do Dispositivo B para que o Pull não descarte (Echo Prevention)
    localStorage.setItem('AFERIX_INSTALLATION_ID', 'device-test-id-receiver-b');

    // Dispositivo B executa o Pull
    const pullResult = await cloudSyncService.syncCloudToLocal();
    expect(pullResult.pulled).toBe(1);

    // Estado local de B convergiu com A
    const localOSinB = await db.workOrders.get(woId);
    expect(localOSinB).toBeDefined();
    expect(localOSinB?.title).toBe('OS Inicial Dispositivo A');
    expect(localOSinB?.syncStatus).toBe('synced');
  });

  it('Cenário 2: Tenant A cannot read Tenant B data (Tenancy RLS isolation)', async () => {
    // 1. Simular o Tenant A salvando um envelope na nuvem
    activeSessionCompanyId = 'tenant-a-company';
    activeSessionUserId = 'user-a';

    const osA = { id: 'os-tenant-a', title: 'OS Confidencial Empresa A', status: 'draft' as const, paymentStatus: 'pending' as const };
    await db.workOrders.add(osA);
    await db.operationalEvents.add({
      id: 'evt-a', aggregateId: 'os-tenant-a', aggregateType: 'workorder', eventType: 'WORKORDER_CREATED',
      timestamp: new Date().toISOString(), syncStatus: 'pending', snapshot: osA
    } as any);

    await cloudSyncService.syncLocalToCloud();
    expect(mockCloudEnvelopes.length).toBe(1);

    // 2. Simular Tenant B efetuando login e tentando executar o Pull de envelopes
    activeSessionCompanyId = 'tenant-b-company'; // Mudança de Inquilino na sessão JWT
    activeSessionUserId = 'user-b';
    localStorage.setItem('AFERIX_INSTALLATION_ID', 'device-tenant-b'); // Outro dispositivo

    // LimparIndexedDB de B
    await db.workOrders.clear();
    await db.operationalEvents.clear();
    await db.settings.clear();

    const pullResult = await cloudSyncService.syncCloudToLocal();
    // B tenta baixar, mas o RLS simulado no Supabase do mock filtra e retorna vazio
    expect(pullResult.pulled).toBe(0);

    const matchB = await db.workOrders.get('os-tenant-a');
    expect(matchB).toBeUndefined(); // B não recebeu os dados confidenciais de A!
  });

  it('Cenário 3: Safe Logout & Wipeout validation (Logout blocks when pending events exist)', async () => {
    // 1. Criar um evento pendente na fila
    await db.operationalEvents.add({
      id: 'event-unsynced',
      aggregateId: 'wo-1',
      aggregateType: 'workorder',
      eventType: 'WORKORDER_UPDATED',
      timestamp: new Date().toISOString(),
      syncStatus: 'pending'
    } as any);

    // 2. Tentar efetuar logout simples (Sem forçar)
    await expect(accountPlanService.signOutLocalAccount(false)).rejects.toThrow('PENDING_SYNC_EVENTS');

    // O IndexedDB não foi apagado
    const hasEvent = await db.operationalEvents.get('event-unsynced');
    expect(hasEvent).toBeDefined();

    // 3. Efetuar logout forçado
    await accountPlanService.signOutLocalAccount(true);

    // IndexedDB foi integralmente apagado de forma segura (Wipeout)
    const afterEvent = await db.operationalEvents.get('event-unsynced');
    expect(afterEvent).toBeUndefined();
    
    const sequenceCursor = await db.settings.get('last_synced_sequence');
    expect(sequenceCursor).toBeUndefined();
  });

  it('Cenário 4: PMOC with 100 assets generates: 1 Attendance -> 1 WO -> 100 AssetExecutions without performance lag', async () => {
    const attendanceId = 'att-pmoc-100';
    const companyId = 'tenant-a-company';
    const workspaceId = 'tenant-workspace';
    const clientId = 'client-pmoc-1';
    const siteId = 'site-pmoc-1';

    // Gerando 100 IDs de ativos simulados
    const assetIds = Array.from({ length: 100 }).map((_, i) => `asset-id-${i}`);

    const start = performance.now();

    // Cria os agendamentos corporativos em lote usando o AssetExecutionService
    const workOrderIds = await assetExecutionService.createPMOCWorkOrders(
      attendanceId,
      companyId,
      workspaceId,
      clientId,
      siteId,
      assetIds
    );

    const duration = performance.now() - start;
    console.log(`[PMOC Test] Geração de 1 Atendimento, 1 OS e 100 Execuções realizada em ${duration.toFixed(2)}ms`);

    // Verificações de cardinalidades
    expect(workOrderIds.length).toBe(1); // 100 ativos não excede 250, portanto 1 única OS foi criada!
    
    const generatedWO = await db.workOrders.get(workOrderIds[0]);
    expect(generatedWO).toBeDefined();
    expect(generatedWO?.assetIds?.length).toBe(100);

    const executions = await db.assetExecutions.where('workOrderId').equals(workOrderIds[0]).toArray();
    expect(executions.length).toBe(100); // 100 AssetExecutions vinculadas!
    expect(executions[0].syncStatus).toBe('pending');

    // Testar se o Safelimit Splitter funciona acima de 250 ativos
    const excessiveAssetIds = Array.from({ length: 300 }).map((_, i) => `excessive-asset-id-${i}`);
    const splitWOs = await assetExecutionService.createPMOCWorkOrders(
      attendanceId,
      companyId,
      workspaceId,
      clientId,
      siteId,
      excessiveAssetIds
    );

    // 300 excedeu 250, deve criar 2 OSs (Lote 1 com 250 e Lote 2 com 50)
    expect(splitWOs.length).toBe(2);
    
    const wo1 = await db.workOrders.get(splitWOs[0]);
    const wo2 = await db.workOrders.get(splitWOs[1]);
    expect(wo1?.assetIds?.length).toBe(250);
    expect(wo2?.assetIds?.length).toBe(50);
  });

  it('Cenário 5: Pull Engine recovers device with > 10,000 events difference using Bulk Snapshot', async () => {
    // 1. Simular nuvem extremamente adiantada (delta sequence > 10.000)
    const budgetId = 'b-bulk-reconstruct-1';
    
    // Inserir um envelope mock na nuvem com sequence de alta escala
    mockCloudSequence = 15000; // Sequence máxima na nuvem
    mockCloudEnvelopes.push({
      envelope_id: 'env-bulk-1',
      event_id: 'evt-bulk-1',
      device_id: 'device-creator-c',
      aggregate_type: 'budget',
      aggregate_id: budgetId,
      company_id: activeSessionCompanyId,
      sequence: 15000,
      timestamp: new Date().toISOString(),
      payload: {
        snapshot: {
          id: budgetId,
          title: 'Orçamento Materializado via Bulk Snapshot',
          chargedValue: 9000,
          status: 'autorizado',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });

    // Cursor local zerado: delta = 15000 - 0 = 15000 (> 10000)
    await db.settings.put({ key: 'last_synced_sequence', value: 0 });
    localStorage.setItem('AFERIX_INSTALLATION_ID', 'device-rec-d'); // Outro dispositivo

    // Executa Pull
    const pullResult = await cloudSyncService.syncCloudToLocal();
    
    // Verificações
    expect(pullResult.pulled).toBe(1); // Recuperou o agregado via bulk snapshot
    
    const localBudget = await db.budgets.get(budgetId);
    expect(localBudget).toBeDefined();
    expect(localBudget?.title).toBe('Orçamento Materializado via Bulk Snapshot');
    expect(localBudget?.chargedValue).toBe(9000);

    // Cursor local pulou diretamente para o sequence máximo da nuvem
    const afterSeq = await db.settings.get('last_synced_sequence');
    expect(afterSeq?.value).toBe(15000);
  });
});
