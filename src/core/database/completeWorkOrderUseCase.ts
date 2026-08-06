import { db } from './db';
import { consumeReservationsForOrder, StockWarning } from './stockReservations';
import { createId } from '../../app/utils/idHelpers';

export async function completeWorkOrderUseCase(
  workOrderId: string,
  isPaid: boolean,
  paymentMethod?: 'pix' | 'cash' | 'credit_card' | 'other'
): Promise<{ success: boolean; warnings: StockWarning[] }> {
  return await db.transaction('rw', [
    db.work_orders,
    db.work_order_items,
    db.catalog_items,
    db.stock_reservations,
    db.transactions,
    db.sync_outbox
  ], async () => {
    const os = await db.work_orders.get(workOrderId);
    if (!os) throw new Error(`Ordem de serviço não encontrada: ${workOrderId}`);

    if (os.status === 'completed') {
      return { success: true, warnings: [] };
    }

    // 1. Finalizar OS
    const nextStatus = 'completed';
    await db.work_orders.update(workOrderId, { status: nextStatus });
    await db.sync_outbox.add({
      uuid: workOrderId,
      table_name: 'work_orders',
      operation: 'UPDATE',
      payload: { ...os, status: nextStatus },
      created_at: Date.now(),
    });

    // 2. Consumo de Estoque
    const stockWarnings = await consumeReservationsForOrder(workOrderId);
    const warnings = stockWarnings.map(w => ({
      itemId: '',
      itemName: w.name,
      availableAfter: w.newQty,
      requested: 0,
    }));

    // 3. Financeiro
    const incomeTx = {
      id: createId('tx'),
      type: 'income' as const,
      category: 'Faturamento OS',
      description: `Recebimento OS - ${os.title}`,
      amount_cents: os.total_price_cents,
      due_date: new Date().toISOString(),
      is_paid: isPaid,
      payment_method: paymentMethod,
      work_order_id: os.id
    };
    await db.transactions.add(incomeTx);

    // 4. Outbox
    await db.sync_outbox.add({
      uuid: incomeTx.id,
      table_name: 'transactions',
      operation: 'INSERT',
      payload: incomeTx,
      created_at: Date.now(),
    });

    // 5. Analytics
    // A query reativa (useLiveQuery) e o AnalyticsEngine atualizarão sozinhos ao enxergarem o tx no Dexie.

    return { success: true, warnings };
  });
}
