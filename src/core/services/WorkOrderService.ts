import { workOrderRepository } from '../repositories/WorkOrderRepository';
import { db } from '../database/db';
import { MediaStorageRepository } from '../repositories/MediaStorageRepository';
import type { WorkOrder, WorkOrderItem, WorkOrderEquipment, WorkOrderMedia } from '../database/schema';
import { createId } from '../../app/utils/idHelpers';

export class WorkOrderService {
  async getWorkOrders() {
    return workOrderRepository.getAll();
  }

  async saveBudget(
    editingBudgetId: string | null,
    customer: any,
    richDraftItems: any[],
    totals: any,
    kmValue: number,
    costPerKmCents: number,
    hoursValue: number,
    hourlyRateCents: number,
    currentStatus: string,
    equipmentData?: { brand: string; model: string; serial: string },
    photos?: { id?: string; dataUrl: string; mimeType: string }[]
  ) {
    const workOrderId = editingBudgetId || createId('wo');
    const { totalCostCents, totalPriceCents, realMarginCents } = totals;

    await db.transaction('rw', db.work_orders, db.work_order_items, db.work_order_equipment, db.work_order_media, async () => {
      const itemsToSave: WorkOrderItem[] = richDraftItems.map(item => ({
        id: createId('woi'),
        work_order_id: workOrderId,
        catalog_item_id: item.catalog_item_id,
        custom_name: item.isCustom ? item.name : undefined,
        is_custom: item.isCustom || false,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        unit_price: item.unit_price,
      }));

      const workOrder: any = {
        id: workOrderId,
        customer_id: customer.id,
        title: `Orçamento — ${new Date().toLocaleDateString('pt-BR')}`,
        status: currentStatus,
        displacement_km: kmValue,
        displacement_cost_per_km_cents: costPerKmCents,
        labor_hours: hoursValue,
        labor_hourly_rate_cents: hourlyRateCents,
        total_cost_cents: totalCostCents,
        total_price_cents: totalPriceCents,
        real_margin_cents: realMarginCents,
        created_at: new Date().toISOString(),
      };

      if (editingBudgetId) {
        await workOrderRepository.update(workOrderId, workOrder);
        await db.work_order_items.where('work_order_id').equals(workOrderId).delete();
        await db.work_order_equipment.where('work_order_id').equals(workOrderId).delete();
        await db.work_order_media.where('work_order_id').equals(workOrderId).delete();
      } else {
        await workOrderRepository.create(workOrder, workOrderId);
      }

      await db.work_order_items.bulkAdd(itemsToSave);

      if (equipmentData && (equipmentData.brand || equipmentData.model || equipmentData.serial)) {
        const equipment: WorkOrderEquipment = {
          id: createId('equip'),
          work_order_id: workOrderId,
          brand: equipmentData.brand.trim(),
          model: equipmentData.model.trim(),
          serial_number: equipmentData.serial.trim(),
          created_at: new Date().toISOString(),
        };
        await db.work_order_equipment.add(equipment);
      }

      if (photos && photos.length > 0) {
        const mediaToSave: WorkOrderMedia[] = photos.map(p => {
          // Em um app real, aqui converteriamos o dataUrl para ArrayBuffer
          // e chamariamos MediaStorageRepository.saveChunk().
          // Para o mock, vamos apenas salvar os metadados.

          return {
            id: p.id || createId('media'),
            work_order_id: workOrderId,
            file_name: `photo_${Date.now()}.jpg`,
            mime_type: p.mimeType,
            size_bytes: 0, // Placeholder
            sync_status: 'pending_upload',
            created_at: new Date().toISOString(),
          };
        });
        await db.work_order_media.bulkAdd(mediaToSave);
      }
    });

    return workOrderId;
  }
}

export const workOrderService = new WorkOrderService();
