import { db } from '../storage/dexieDatabase';
import { CustomerAction } from '../domain/customerSuccess';

export class CustomerSuccessTaskService {
  static async createTask(params: {
    companyId: string;
    workspaceId: string;
    clientId: string;
    type: CustomerAction['type'];
    notes: string;
    dueDate: string;
  }): Promise<void> {
    const actionId = `csa-${Date.now()}`;
    const now = new Date().toISOString();

    await db.customerActions.put({
      id: actionId,
      companyId: params.companyId,
      workspaceId: params.workspaceId,
      clientId: params.clientId,
      type: params.type,
      status: 'PENDING',
      dueDate: params.dueDate,
      notes: params.notes,
      createdAt: now
    });

    await db.operationalEvents.put({
      id: `evt-cst-${Date.now()}`,
      aggregateId: params.clientId,
      aggregateType: 'client',
      eventType: 'RETENTION_ACTION_CREATED',
      timestamp: now,
      actor: 'SYSTEM',
      source: 'CustomerSuccessTaskService'
    } as any);
  }

  static async completeTask(actionId: string, notes?: string): Promise<void> {
    const action = await db.customerActions.get(actionId);
    if (!action) return;

    const now = new Date().toISOString();

    await db.customerActions.update(actionId, {
      status: 'COMPLETED',
      completedAt: now,
      notes: notes ? `${action.notes}\nConclusão: ${notes}` : action.notes
    });

    await db.operationalEvents.put({
      id: `evt-cst-c-${Date.now()}`,
      aggregateId: action.clientId,
      aggregateType: 'client',
      eventType: 'RETENTION_ACTION_COMPLETED',
      timestamp: now,
      actor: 'USER',
      source: 'CustomerSuccessTaskService'
    } as any);
  }
}
