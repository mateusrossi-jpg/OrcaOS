import { db } from '../storage/dexieDatabase';
import { MovementType, StockStatus } from '../domain/inventory';
import { ProcurementService } from './ProcurementService';

export class StockService {
  static async updateStock(
    companyId: string,
    workspaceId: string,
    itemId: string,
    type: MovementType,
    quantity: number,
    reason: string,
    referenceId?: string
  ): Promise<void> {
    const item = await db.inventoryItems.get(itemId);
    if (!item) throw new Error('Item not found');

    const previousQuantity = item.quantityOnHand;
    let newQuantity = previousQuantity;

    if (type === 'IN' || type === 'ADJUSTMENT' && quantity > previousQuantity) {
      newQuantity += (type === 'IN' ? quantity : (quantity - previousQuantity));
    } else if (type === 'OUT' || type === 'ADJUSTMENT' && quantity < previousQuantity) {
      const diff = type === 'OUT' ? quantity : (previousQuantity - quantity);
      if (previousQuantity < diff) {
        throw new Error('Insufficient stock');
      }
      newQuantity -= diff;
    } else if (type === 'TRANSFER') {
      newQuantity -= quantity; // simplificando como saida local
    }

    // Calcular status
    let status: StockStatus = 'IN_STOCK';
    if (newQuantity === 0) status = 'OUT_OF_STOCK';
    else if (newQuantity <= item.minimumStock) status = 'LOW_STOCK';

    // Grava movimento
    const now = new Date().toISOString();
    await db.stockMovements.put({
      id: `mov-${Date.now()}`,
      companyId,
      workspaceId,
      itemId,
      type,
      quantity,
      previousQuantity,
      newQuantity,
      reason,
      referenceId,
      date: now
    });

    // Atualiza Item
    await db.inventoryItems.update(itemId, {
      quantityOnHand: newQuantity,
      status,
      lastUpdated: now
    });

    // Verifica necessidade de compra
    if (status === 'LOW_STOCK' || status === 'OUT_OF_STOCK') {
      await db.operationalEvents.put({
        id: `evt-stk-${Date.now()}`,
        aggregateId: itemId,
        aggregateType: 'inventory',
        eventType: 'STOCK_LOW',
        timestamp: now,
        actor: 'SYSTEM',
        source: 'StockService'
      } as any);

      await ProcurementService.checkAndCreateRequest(companyId, workspaceId, itemId);
    }
  }

  static async reserve(
    companyId: string,
    workspaceId: string,
    itemId: string,
    quantity: number,
    referenceId: string,
    type: 'PROPOSAL' | 'WORK_ORDER'
  ): Promise<void> {
    const item = await db.inventoryItems.get(itemId);
    if (!item) throw new Error('Item not found');

    const currentReservations = await db.inventoryReservations
      .where({ itemId })
      .filter(r => r.status === 'ACTIVE')
      .toArray();

    const reservedAmount = currentReservations.reduce((sum, r) => sum + r.quantity, 0);

    if (item.quantityOnHand - reservedAmount < quantity) {
      throw new Error('Not enough unreserved stock');
    }

    const now = new Date().toISOString();
    await db.inventoryReservations.put({
      id: `res-${Date.now()}`,
      companyId,
      workspaceId,
      itemId,
      quantity,
      proposalId: type === 'PROPOSAL' ? referenceId : undefined,
      workOrderId: type === 'WORK_ORDER' ? referenceId : undefined,
      status: 'ACTIVE',
      createdAt: now
    });

    await db.operationalEvents.put({
      id: `evt-res-${Date.now()}`,
      aggregateId: itemId,
      aggregateType: 'inventory',
      eventType: 'ITEM_RESERVED',
      timestamp: now,
      actor: 'SYSTEM',
      source: 'StockService'
    } as any);
  }

  static async consumeReservation(reservationId: string): Promise<void> {
    const res = await db.inventoryReservations.get(reservationId);
    if (!res || res.status !== 'ACTIVE') return;

    await db.inventoryReservations.update(reservationId, { status: 'CONSUMED' });
    await StockService.updateStock(
      res.companyId,
      res.workspaceId,
      res.itemId,
      'OUT',
      res.quantity,
      'Reservation consumed',
      res.workOrderId || res.proposalId
    );
  }
}
