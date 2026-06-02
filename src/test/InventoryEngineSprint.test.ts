import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../storage/dexieDatabase';
import { StockService } from '../services/StockService';
import { ProcurementService } from '../services/ProcurementService';

describe('Inventory & Procurement Engine P0', () => {
  beforeEach(async () => {
    await db.inventoryItems.clear();
    await db.stockMovements.clear();
    await db.purchaseRequests.clear();
    await db.purchaseOrders.clear();
    await db.inventoryReservations.clear();
    await db.operationalEvents.clear();
  });

  it('deve registrar entrada e atualizar estoque corretamente', async () => {
    const companyId = 'co-1';
    const itemId = 'item-1';

    await db.inventoryItems.put({
      id: itemId,
      companyId,
      workspaceId: 'w-1',
      sku: 'SKU-001',
      name: 'Compressor',
      category: 'HVAC',
      quantityOnHand: 0,
      minimumStock: 2,
      unitCost: 1500,
      status: 'OUT_OF_STOCK',
      lastUpdated: new Date().toISOString()
    });

    await StockService.updateStock(companyId, 'w-1', itemId, 'IN', 5, 'Compra recebida', 'po-1');

    const item = await db.inventoryItems.get(itemId);
    expect(item?.quantityOnHand).toBe(5);
    expect(item?.status).toBe('IN_STOCK');

    const movements = await db.stockMovements.where({ itemId }).toArray();
    expect(movements.length).toBe(1);
    expect(movements[0].type).toBe('IN');
  });

  it('deve criar purchase request automatica quando estoque fica critico', async () => {
    const companyId = 'co-1';
    const itemId = 'item-2';

    await db.inventoryItems.put({
      id: itemId,
      companyId,
      workspaceId: 'w-1',
      sku: 'SKU-002',
      name: 'Placa',
      category: 'Eletrônica',
      quantityOnHand: 5,
      minimumStock: 2,
      unitCost: 300,
      status: 'IN_STOCK',
      lastUpdated: new Date().toISOString()
    });

    // Saida de 4 unidades, sobrando 1 (abaixo do minimo de 2)
    await StockService.updateStock(companyId, 'w-1', itemId, 'OUT', 4, 'OS-123', 'os-123');

    const item = await db.inventoryItems.get(itemId);
    expect(item?.quantityOnHand).toBe(1);
    expect(item?.status).toBe('LOW_STOCK');

    // Verifica se gerou o PurchaseRequest
    const requests = await db.purchaseRequests.where({ itemId }).toArray();
    expect(requests.length).toBe(1);
    expect(requests[0].requestedQuantity).toBe(4); // min * 2 = 4
  });

  it('deve reservar e depois consumir reserva corretamente', async () => {
    const companyId = 'co-1';
    const itemId = 'item-3';

    await db.inventoryItems.put({
      id: itemId,
      companyId,
      workspaceId: 'w-1',
      sku: 'SKU-003',
      name: 'Contatora',
      category: 'Elétrica',
      quantityOnHand: 10,
      minimumStock: 2,
      unitCost: 50,
      status: 'IN_STOCK',
      lastUpdated: new Date().toISOString()
    });

    await StockService.reserve(companyId, 'w-1', itemId, 2, 'prop-1', 'PROPOSAL');

    const res = await db.inventoryReservations.where({ itemId }).first();
    expect(res).toBeDefined();
    expect(res?.status).toBe('ACTIVE');

    // OutOfStock erro se tentar reservar mais do que (10 - 2) = 8
    await expect(StockService.reserve(companyId, 'w-1', itemId, 9, 'prop-2', 'PROPOSAL')).rejects.toThrow('Not enough unreserved stock');

    // Consome a reserva
    await StockService.consumeReservation(res!.id);

    const consumedRes = await db.inventoryReservations.get(res!.id);
    expect(consumedRes?.status).toBe('CONSUMED');

    const item = await db.inventoryItems.get(itemId);
    expect(item?.quantityOnHand).toBe(8); // Tinha 10, consumiu 2 da reserva
  });

  it('deve suportar alta performance na criacao e atualizacao (500 insercoes / limit test)', async () => {
    const companyId = 'co-perf';
    
    // Inserindo 500 itens
    const items = [];
    for (let i = 0; i < 500; i++) {
      items.push({
        id: `i-${i}`, companyId, workspaceId: 'w', sku: `S-${i}`, name: 'I', category: 'C',
        quantityOnHand: 10, minimumStock: 2, unitCost: 10, status: 'IN_STOCK', lastUpdated: ''
      });
    }
    await db.inventoryItems.bulkPut(items as any);

    const start = performance.now();
    await StockService.updateStock(companyId, 'w', 'i-250', 'OUT', 1, 'Teste');
    const end = performance.now();

    expect(end - start).toBeLessThan(250);
  });
});
