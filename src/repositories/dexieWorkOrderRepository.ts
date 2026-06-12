/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkOrder } from '../core/types/business';
import { WorkOrderRepository } from './workOrderRepository';
import { db } from '../storage/dexieDatabase';

import { validateWorkOrderIntegrity } from '../domain/guards';
import { aferixLogger } from '../core/debug/aferixLogger';

import { safeTransaction } from '../core/database/safeTransaction';
import { writeLock } from '../core/database/writeLock';
import { idempotency } from '../core/database/idempotency';
import { operationAudit } from '../core/audit/operationAudit';

const WORKORDER_LAST_HASH = new Map<string, string>();

export class DexieWorkOrderRepository implements WorkOrderRepository {
  async getAll(): Promise<WorkOrder[]> {
    return await db.workOrders.where('syncStatus').notEqual('deleted').toArray();
  }

  async getById(id: string): Promise<WorkOrder | undefined> {
    const workOrder = await db.workOrders.get(id);
    if (workOrder && workOrder.syncStatus === 'deleted') return undefined;
    return workOrder;
  }

  async add(workOrder: WorkOrder): Promise<void> {
    const toSave = { ...workOrder, syncStatus: 'pending', syncUpdatedAt: Date.now(), updatedAt: workOrder.updatedAt || new Date().toISOString() } as WorkOrder;
    if (!validateWorkOrderIntegrity(toSave)) {
      aferixLogger.warn('Aferix Integrity', 'Blocked invalid work order add', toSave);
      throw new Error('Invalid work order integrity');
    }

    const currentHash = idempotency.generateWriteFingerprint(toSave);
    if (WORKORDER_LAST_HASH.get(toSave.id) === currentHash) return;

    const start = Date.now();
    try {
      await writeLock.withDatabaseLock(toSave.id, async () => {
        await safeTransaction('addWorkOrder', 'rw', [db.workOrders], async () => {
          await db.workOrders.add(toSave);
        });
        WORKORDER_LAST_HASH.set(toSave.id, currentHash);
      });
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'create', entity: 'WorkOrder', entityId: toSave.id, success: true, durationMs: Date.now() - start });
    } catch (e: any) {
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'create', entity: 'WorkOrder', entityId: toSave.id, success: false, durationMs: Date.now() - start, warnings: [e.message] });
      throw e;
    }
  }

  async update(workOrder: WorkOrder): Promise<void> {
    const toSave = {
      ...workOrder,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      syncUpdatedAt: Date.now(),
    } as WorkOrder;

    if (!validateWorkOrderIntegrity(toSave)) {
      aferixLogger.warn('Aferix Integrity', 'Blocked invalid work order update', toSave);
      throw new Error('Invalid work order integrity');
    }

    const currentHash = idempotency.generateWriteFingerprint(toSave);
    if (WORKORDER_LAST_HASH.get(toSave.id) === currentHash) return;

    const start = Date.now();
    try {
      await writeLock.withDatabaseLock(toSave.id, async () => {
        await safeTransaction('updateWorkOrder', 'rw', [db.workOrders], async () => {
          await db.workOrders.put(toSave);
        });
        WORKORDER_LAST_HASH.set(toSave.id, currentHash);
      });
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'update', entity: 'WorkOrder', entityId: toSave.id, success: true, durationMs: Date.now() - start });
    } catch (e: any) {
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'update', entity: 'WorkOrder', entityId: toSave.id, success: false, durationMs: Date.now() - start, warnings: [e.message] });
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    const start = Date.now();
    try {
      await writeLock.withDatabaseLock(id, async () => {
        await safeTransaction('deleteWorkOrder', 'rw', [db.workOrders], async () => {
          const existing = await db.workOrders.get(id);
          if (existing) {
            const toSave = { ...existing, syncStatus: 'deleted', syncUpdatedAt: Date.now(), updatedAt: new Date().toISOString() } as WorkOrder;
            await db.workOrders.put(toSave);
          }
        });
        WORKORDER_LAST_HASH.delete(id);
      });
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'delete', entity: 'WorkOrder', entityId: id, success: true, durationMs: Date.now() - start });
    } catch (e: any) {
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'delete', entity: 'WorkOrder', entityId: id, success: false, durationMs: Date.now() - start, warnings: [e.message] });
      throw e;
    }
  }

  async bulkAdd(workOrders: WorkOrder[]): Promise<void> {
    const toSave = workOrders.map(w => ({ ...w, syncStatus: 'pending', syncUpdatedAt: Date.now(), updatedAt: new Date().toISOString() })) as WorkOrder[];
    const start = Date.now();
    try {
      await safeTransaction('bulkAddWorkOrders', 'rw', [db.workOrders], async () => {
        await db.workOrders.bulkAdd(toSave);
      });
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'create', entity: 'WorkOrder', entityId: 'bulk', success: true, durationMs: Date.now() - start });
    } catch (e: any) {
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'create', entity: 'WorkOrder', entityId: 'bulk', success: false, durationMs: Date.now() - start, warnings: [e.message] });
      throw e;
    }
  }
}

export const dexieWorkOrderRepository = new DexieWorkOrderRepository();
