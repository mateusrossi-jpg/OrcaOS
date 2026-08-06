import { db } from '../database/db';
import { outboxRepository } from '../repositories/OutboxRepository';
import { workOrderMediaResolver } from './WorkOrderMediaResolver';
import type { WorkOrder } from '../database/schema';

export class WorkOrderAggregateResolver {
  async resolve(workOrderId: string, resolution: 'keep_mine' | 'use_server' | 'merge_safe') {
    const { supabase } = await import('../database/supabaseClient');

    const localWo = await db.work_orders.get(workOrderId);
    if (!localWo) return;

    let remoteWo = localWo.remote_snapshot as WorkOrder | undefined;
    let isOnline = typeof navigator !== 'undefined' && navigator.onLine;

    if (isOnline) {
       try {
          const { data: remoteWoData } = await supabase.from('work_orders').select('*').eq('id', workOrderId).maybeSingle();
          if (remoteWoData) remoteWo = remoteWoData as WorkOrder;
       } catch (e) {
          isOnline = false;
       }
    }

    if (resolution === 'use_server' && !remoteWo) {
        throw new Error("Cannot resolve 'use_server' offline without a local remote_snapshot.");
    }

    await db.transaction('rw',
      db.work_orders,
      db.work_order_items,
      db.stock_reservations,
      db.work_order_media,
      db.sync_outbox,
      async () => {
        if (resolution === 'keep_mine') {
          // Keep local root, generate new version
          const nextVersion = remoteWo && remoteWo.version ? remoteWo.version + 1 : (localWo.version || 0) + 1;
          const updatedLocal = { ...localWo, conflict_state: 'resolved' as const, version: nextVersion };

          await db.work_orders.put(updatedLocal);
          await outboxRepository.enqueue('work_orders', 'UPDATE', updatedLocal);
          // Local children (items, reservations) are preserved, pending outbox items for them remain pending.

        } else if (resolution === 'use_server' && remoteWo) {
          // Reconcile root
          const resolvedRemote = { ...remoteWo, conflict_state: 'resolved' as const };
          await db.work_orders.put(resolvedRemote);

        // Reconcile children: fetch remote children
        if (isOnline) {
          const { data: remoteItems } = await supabase.from('work_order_items').select('*').eq('work_order_id', workOrderId);
          if (remoteItems) {
            // Replace local items
            const localItems = await db.work_order_items.where('work_order_id').equals(workOrderId).toArray();
            for (const li of localItems) await db.work_order_items.delete(li.id);
            for (const ri of remoteItems) await db.work_order_items.add(ri as any);
          }

          // Stock reservations
          const { data: remoteStock } = await supabase.from('stock_reservations').select('*').eq('work_order_id', workOrderId);
          if (remoteStock) {
             const localStock = await db.stock_reservations.where('work_order_id').equals(workOrderId).toArray();
             for (const ls of localStock) await db.stock_reservations.delete(ls.id);
             for (const rs of remoteStock) await db.stock_reservations.add(rs as any);
          }
        } else {
           // We can't fetch children offline. We have to mark them pending resolution or leave as is.
           // To be safe, we'll mark root as pending resolution if children can't be fetched on use_server
           await db.work_orders.update(workOrderId, { conflict_state: 'pending_resolution' });
           throw new Error("Cannot fetch related items offline. Kept in pending_resolution.");
        }

        // Cancel pending outbox mutations for children (items/stock) to avoid re-overwriting the server
        const outboxItems = await db.sync_outbox.toArray();
          for (const item of outboxItems) {
             if (item.table_name === 'work_order_items' && item.payload.work_order_id === workOrderId) {
                if (item.id) await outboxRepository.discardMutation(item.id);
             }
             if (item.table_name === 'stock_reservations' && item.payload.work_order_id === workOrderId) {
                if (item.id) await outboxRepository.discardMutation(item.id);
             }
          }

        } else if (resolution === 'merge_safe' && remoteWo) {
          const nextVersion = (remoteWo.version || 0) + 1;
          const merged = { ...remoteWo, title: localWo.title, address: localWo.address, conflict_state: 'resolved' as const, version: nextVersion };

          await db.work_orders.put(merged);
          await outboxRepository.enqueue('work_orders', 'UPDATE', merged);

          // Safe merge implies we keep local items and don't wipe them, assuming they are safe to sync
        }

        // Resolve media
        await workOrderMediaResolver.resolve(workOrderId, resolution, isOnline);

        // Clear out the conflict_error from outbox for the root
        const pending = await db.sync_outbox.where('status').equals('dead_letter').toArray();
        const conflictItem = pending.find(i => i.uuid === workOrderId && i.table_name === 'work_orders' && i.error_category === 'conflict_error');
        if (conflictItem && conflictItem.id) {
           await db.sync_outbox.delete(conflictItem.id);
        }
      }
    );
  }
}

export const workOrderAggregateResolver = new WorkOrderAggregateResolver();
