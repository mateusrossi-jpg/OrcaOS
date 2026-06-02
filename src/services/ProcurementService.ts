import { db } from '../storage/dexieDatabase';

export class ProcurementService {
  static async checkAndCreateRequest(
    companyId: string,
    workspaceId: string,
    itemId: string
  ): Promise<void> {
    const item = await db.inventoryItems.get(itemId);
    if (!item) return;

    // Verifica se já existe um pedido de compra pendente para esse item
    const pendingRequests = await db.purchaseRequests
      .where({ itemId })
      .filter(r => r.status === 'PENDING' || r.status === 'DRAFT' || r.status === 'APPROVED' || r.status === 'ORDERED')
      .toArray();

    if (pendingRequests.length > 0) return; // Já está sendo comprado

    const quantityToOrder = Math.max(item.minimumStock * 2, 1); // Mock: Pedir o dobro do minimo
    const now = new Date().toISOString();

    await db.purchaseRequests.put({
      id: `pr-${Date.now()}`,
      companyId,
      workspaceId,
      itemId,
      requestedQuantity: quantityToOrder,
      status: 'PENDING',
      reason: `Automated reorder due to ${item.status}`,
      requestedBy: 'SYSTEM',
      requestedAt: now
    });

    await db.operationalEvents.put({
      id: `evt-pr-${Date.now()}`,
      aggregateId: itemId,
      aggregateType: 'inventory',
      eventType: 'PURCHASE_REQUEST_CREATED',
      timestamp: now,
      actor: 'SYSTEM',
      source: 'ProcurementService'
    } as any);
  }
}
