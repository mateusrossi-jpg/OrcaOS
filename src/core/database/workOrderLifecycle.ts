import { db } from './db';
import { consumeReservationsForOrder, releaseReservationsForOrder, createReservationsForOrder, StockWarning } from './stockReservations';
import { WorkOrderStatus } from './schema';
import { createId } from '../../app/utils/idHelpers';

const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  draft: ['sent', 'approved', 'cancelled'], // Sometimes draft -> approved directly
  sent: ['approved', 'cancelled', 'draft'],
  approved: ['in_progress', 'cancelled', 'draft'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: ['draft']
};

export async function transitionWorkOrderStatus(
  workOrderId: string,
  nextStatus: WorkOrderStatus
): Promise<{ success: boolean; warnings: StockWarning[]; alreadyInState: boolean }> {
  return await db.transaction('rw', [
    db.work_orders,
    db.work_order_items,
    db.catalog_items,
    db.stock_reservations,
    db.transactions
  ], async () => {
    const os = await db.work_orders.get(workOrderId);
    if (!os) throw new Error(`Ordem de serviço não encontrada: ${workOrderId}`);

    if (os.status === nextStatus) {
      return { success: true, warnings: [], alreadyInState: true };
    }

    const allowed = VALID_TRANSITIONS[os.status].includes(nextStatus);
    if (!allowed) {
      throw new Error(`Transição de status inválida: ${os.status} -> ${nextStatus}`);
    }

    let warnings: StockWarning[] = [];

    // Ações de saída e liberação de reservas (se houver downgrade de approved/in_progress)
    if ((os.status === 'approved' || os.status === 'in_progress') && (nextStatus === 'draft' || nextStatus === 'sent' || nextStatus === 'cancelled')) {
      await releaseReservationsForOrder(workOrderId);
    }

    // Ações de entrada
    if (nextStatus === 'approved') {
      const result = await createReservationsForOrder(workOrderId);
      warnings = result.warnings;
    }

    if (nextStatus === 'completed') {
      throw new Error(`Utilize completeWorkOrderUseCase para finalizar uma Ordem de Serviço.`);
    }

    await db.work_orders.update(workOrderId, { status: nextStatus });
    await db.sync_outbox.add({
      uuid: workOrderId,
      table_name: 'work_orders',
      operation: 'UPDATE',
      payload: { ...os, status: nextStatus },
      created_at: Date.now(),
    });

    return { success: true, warnings, alreadyInState: false };
  });
}
