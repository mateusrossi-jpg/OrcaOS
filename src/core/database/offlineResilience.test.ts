import 'fake-indexeddb/auto';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Mock Supabase client completely to test offline sync, retry logic, and LWW conflicts
vi.mock('../cloud/supabaseClient', () => {
  const mockInsert = vi.fn().mockResolvedValue({ error: null });
  const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  
  const mockFrom = vi.fn().mockImplementation(() => {
    return {
      insert: mockInsert,
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: mockMaybeSingle,
    };
  });

  return {
    isCloudEnabled: true, // Force true to execute syncLocalToCloud code path
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'test-user-999' }
            }
          }
        })
      },
      from: mockFrom
    }
  };
});

import { db } from '../../storage/dexieDatabase';
import { cloudSyncService } from '../../services/CloudSyncService';
import { clientService } from '../../services/clientService';
import { clientProposalService } from '../../services/clientProposalService';
import { workOrderService } from '../../services/workOrderService';
import { SimpleFinanceService } from '../../services/SimpleFinanceService';
import { operationalFacade } from '../../features/workflow/operationalFacade';
import { BUDGET_STATUS, Budget } from '../../domain/budget';
import { conflictDetectionService } from '../../services/ConflictDetectionService';
import { databaseRecoveryService } from '../../services/DatabaseRecoveryService';
import { ClientProposal, createClientProposalDraft } from '../../features/clientPortal/storage/clientProposalStorage';
import { WorkOrder } from '../../core/types/business';
import { supabase } from '../cloud/supabaseClient';
import { aferixLogger } from '../debug/aferixLogger';

describe('AFERIX SYSTEMATIC OFFLINE RESILIENCE AND CRASH RECOVERY', () => {
  const financeService = new SimpleFinanceService();

  beforeAll(async () => {
    await db.clients.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.clientProposals.clear();
    await db.simpleFinanceRecords.clear();
    await db.operationalEvents.clear();
  });

  afterAll(async () => {
    await db.clients.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.clientProposals.clear();
    await db.simpleFinanceRecords.clear();
    await db.operationalEvents.clear();
  });

  it('1. SIMULATE FULL DAY OFFLINE OPERATION & COMPLETE REVENUE LIFECYCLE', async () => {
    // Force Offline State in the Sync Master
    cloudSyncService['isOnlineState'] = false;
    expect(cloudSyncService['isOnlineState']).toBe(false);

    // STEP 1: Create Client Offline
    const client = await clientService.add({
      name: 'Empresa Alfa Comercial',
      phone: '11988887777',
      email: 'alfa@comercial.com',
      address: 'Rua Augusta, 500',
      notes: 'Entregar propostas urgentes por e-mail',
      contributorType: 'not-informed',
      creditLimit: '10000'
    });
    expect(client.id).toBeDefined();

    // STEP 2: Create Proposal Offline
    const budgetId = 'b-resil-1';
    const budgetDraft: Budget = {
      id: budgetId,
      clientId: client.id,
      siteId: 'site-1',
      clientName: client.name,
      title: 'Manutenção Hidráulica Predial',
      status: BUDGET_STATUS.INICIADO,
      chargedValue: 3500,
      materialCost: 800,
      travelCost: 200,
      helperCost: 500,
      fees: 100,
      discounts: 0,
      otherCosts: 0,
      items: [
        { id: 'it-1', description: 'Troca de Colunas de Condomínio', quantity: 1, unitPrice: 2500, category: 'labor' },
        { id: 'it-2', description: 'Tubos de Cobre Reforçado', quantity: 1, unitPrice: 1000, category: 'material' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await operationalFacade.saveBudget(budgetDraft);

    const proposalId = 'p-resil-1';
    const proposalDraft = createClientProposalDraft({
      id: proposalId,
      budgetId: budgetId,
      clientId: client.id,
      clientName: client.name,
      title: budgetDraft.title,
      total: budgetDraft.chargedValue,
      status: 'draft'
    });
    await clientProposalService.add(proposalDraft);

    // STEP 3: Edit/Update Proposal Offline
    const updatedBudget = {
      ...budgetDraft,
      chargedValue: 3800, // Price adjusted
      fees: 150,
      updatedAt: new Date().toISOString()
    };
    await operationalFacade.saveBudget(updatedBudget);

    // STEP 4: Approve Proposal Offline
    await operationalFacade.approveProposal(proposalId);

    // STEP 5: Create Work Order Offline
    const workOrderId = 'wo-resil-1';
    const workOrderDraft: WorkOrder = {
      id: workOrderId,
      clientId: client.id,
      siteId: 'site-1',
      budgetId: budgetId,
      title: budgetDraft.title,
      description: 'Executar trocas hidráulicas prediais',
      priority: 'high',
      status: 'in-progress',
      paymentStatus: 'pending',
      scheduledDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await operationalFacade.createWorkOrder(workOrderDraft);
    await operationalFacade.executeBudget(budgetId);

    // STEP 6: Complete Work Order Offline
    await operationalFacade.completeWorkOrder(workOrderId, 3800, 0);

    // STEP 7: Register Payment Offline
    await operationalFacade.registerPayment(workOrderId, 3800);
    await operationalFacade.finalizeBudgetCycle(budgetId);

    // Validate that ALL mutations executed successfully in local Dexie
    const localClient = await clientService.getById(client.id);
    const localBudget = await db.budgets.get(budgetId);
    const localWorkOrder = await workOrderService.getById(workOrderId);
    const localProposal = await clientProposalService.getById(proposalId);
    const localFinance = (await financeService.listRecords()).find(r => r.workOrderId === workOrderId);

    expect(localClient?.name).toBe('Empresa Alfa Comercial');
    expect(localBudget?.status).toBe(BUDGET_STATUS.FINALIZADO);
    expect(localWorkOrder?.status).toBe('done');
    expect(localProposal?.status).toBe('approved');
    expect(localFinance?.status).toBe('paid');

    // Verify that the Offline Event Store has captured the entire Day's queue!
    const pendingEventsCount = await cloudSyncService.countPendingEvents();
    expect(pendingEventsCount).toBeGreaterThanOrEqual(7);
    
    aferixLogger.audit('OfflineTest', 'Verified full-day offline CRUD execution is 100% resilient.');
  });

  it('2. CRASH RECOVERY: RESTORE IN-FLIGHT EVENTS TO PENDING ON STARTUP', async () => {
    // Insert a dummy event marked as 'in-flight' to simulate a crash/restart mid-sync
    const dummyEventId = 'evt-crash-1';
    await db.operationalEvents.add({
      id: dummyEventId,
      aggregateId: 'agg-crash',
      aggregateType: 'budget',
      eventType: 'BUDGET_CREATED',
      timestamp: new Date().toISOString(),
      actor: 'system',
      source: 'AferixUI',
      createdAt: new Date().toISOString(),
      syncStatus: 'in-flight'
    } as any);

    // Verify it is initially treated as pending/unsynced by the query
    const pendingCount = await cloudSyncService.countPendingEvents();
    expect(pendingCount).toBeGreaterThan(0);

    // Execute Crash Recovery
    await cloudSyncService['recoverInFlightEvents']();

    // Verify the status was reverted back to 'pending' so it can be synced again safely
    const recoveredEvent = await db.operationalEvents.get(dummyEventId);
    expect((recoveredEvent as any)?.syncStatus).toBe('pending');
  });

  it('3. RETRY LOGIC WITH EXPONENTIAL BACKOFF ON FLAKY NETWORK', async () => {
    // Turn connection state back to Online
    cloudSyncService['isOnlineState'] = true;
    
    // Simulate flaky/broken network by making Supabase insert return a connection timeout error
    const mockFrom = supabase.from as any;
    mockFrom().insert.mockResolvedValueOnce({
      error: { message: 'Connection Timeout / Gateway Error 504' }
    });

    // Reset backoff delay variables
    cloudSyncService['resetRetryDelay']();
    expect(cloudSyncService['retryCount']).toBe(0);
    expect(cloudSyncService['retryDelay']).toBe(1000);

    // Call syncLocalToCloud
    const res = await cloudSyncService.syncLocalToCloud();
    
    // Verify it registered an error
    expect(res.errors).toBeGreaterThan(0);

    // Verify exponential backoff delay is updated and next sync is scheduled
    expect(cloudSyncService['retryCount']).toBe(1);
    expect(cloudSyncService['retryDelay']).toBeGreaterThanOrEqual(2000); // 1000 * 2 + jitter
    expect(cloudSyncService['retryTimeoutId']).toBeDefined();
  });

  it('4. ORDERED BACKLOG REPLICATION ON RECOVERY', async () => {
    // Reset connection and configure Supabase to succeed
    cloudSyncService['isOnlineState'] = true;
    cloudSyncService['resetRetryDelay']();
    
    const mockFrom = supabase.from as any;
    mockFrom().insert.mockResolvedValue({ error: null }); // Always succeed

    // Synchronize all backlog changes
    const res = await cloudSyncService.syncLocalToCloud();

    expect(res.sent).toBeGreaterThan(0);
    expect(res.errors).toBe(0);

    // Verify all queue backlog is fully cleared!
    const pendingEventsCount = await cloudSyncService.countPendingEvents();
    expect(pendingEventsCount).toBe(0);
  });

  it('5. CONFLICT RESOLUTION: LAST-WRITE-WINS (LWW) ANOMALY DETECTION', async () => {
    // Create local event
    const eventId = 'evt-conflict-99';
    await db.operationalEvents.add({
      id: eventId,
      aggregateId: 'b-resil-1',
      aggregateType: 'budget',
      eventType: 'BUDGET_UPDATED',
      timestamp: new Date().toISOString(),
      actor: 'system',
      source: 'AferixUI',
      createdAt: new Date().toISOString(),
      syncStatus: 'pending'
    } as any);

    const mockFrom = supabase.from as any;
    // Simulate that the server has an even NEWER update timestamp (Server: +1 hour)
    mockFrom().maybeSingle.mockResolvedValueOnce({
      data: {
        timestamp: new Date(Date.now() + 3600000).toISOString(),
        sequence: 12
      },
      error: null
    });

    // Clear conflict log
    (conflictDetectionService as any).conflicts = [];

    // Trigger sync
    await cloudSyncService.syncLocalToCloud();

    // Verify that conflict resolution (LWW) recognized the stale local event and logged it!
    const conflicts = conflictDetectionService.getConflicts();
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].conflictType).toBe('stale_entity');
    
    // Verify that the local event was marked 'synced' (ignored in favor of server)
    const localEvent = await db.operationalEvents.get(eventId);
    expect((localEvent as any)?.syncStatus).toBe('synced');
  });

  it('6. PERSISTENCE RECOVERY: DISK TRAUMA SELF-HEALING', async () => {
    const spySoftRecovery = vi.spyOn(databaseRecoveryService, 'attemptSoftRecovery');
    
    // Simulate a db open validation failure (unaccessible IndexedDB)
    const spyValidate = vi.spyOn(databaseRecoveryService, 'validateDatabaseState').mockResolvedValueOnce(false);

    // Trigger sync
    await cloudSyncService.syncLocalToCloud();

    // Verify self-healing successfully triggered DatabaseRecoveryService's soft reindex
    expect(spySoftRecovery).toHaveBeenCalled();

    spySoftRecovery.mockRestore();
    spyValidate.mockRestore();
  });
});
