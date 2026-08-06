import { db } from '../database/db';
import { outboxRepository } from '../repositories/OutboxRepository';

export class WorkOrderMediaResolver {
  async resolve(workOrderId: string, resolution: 'keep_mine' | 'use_server' | 'merge_safe', isOnline: boolean) {
    const { supabase } = await import('../database/supabaseClient');
    let remoteMedia: any[] | null = null;

    if (isOnline) {
      const { data } = await supabase.from('work_order_media').select('*').eq('work_order_id', workOrderId);
      remoteMedia = data;
    }

    // We expect this to run inside a transaction or alongside one
    const localMedia = await db.work_order_media.where('work_order_id').equals(workOrderId).toArray();

    if (resolution === 'keep_mine') {
      // Preserve local media, generate mutations to upload any 'pending_upload' or re-upload others if needed
      for (const m of localMedia) {
        if (m.sync_status === 'pending_upload' || !m.sync_status) {
           await db.work_order_media.update(m.id, { sync_status: 'pending_upload' });
           await outboxRepository.enqueue('work_order_media', 'INSERT', m);
        }
      }
    } else if (resolution === 'use_server') {
      if (!isOnline) {
         throw new Error("Cannot fully use server for media while offline (need to fetch latest media list)");
      }
      if (remoteMedia) {
         // Mark locals as deleted if not on server, but do not delete physical blob if possible (cleanup process handles it)
         for (const lm of localMedia) {
            const existsOnRemote = remoteMedia.find(rm => rm.id === lm.id);
            if (!existsOnRemote) {
               await db.work_order_media.update(lm.id, { sync_status: 'deleted_pending_cleanup' });
            }
         }
         // Add remote media missing locally
         for (const rm of remoteMedia) {
            const existsLocally = localMedia.find(lm => lm.id === rm.id);
            if (!existsLocally) {
               await db.work_order_media.add({ ...rm, sync_status: 'synced' });
            }
         }
         // Cancel pending outbox media uploads
         const outboxItems = await db.sync_outbox.toArray();
         for (const item of outboxItems) {
            if (item.table_name === 'work_order_media' && item.payload.work_order_id === workOrderId) {
               if (item.id) await outboxRepository.discardMutation(item.id);
            }
         }
      }
    } else if (resolution === 'merge_safe') {
      // Keep locals, fetch remotes if online
      if (isOnline && remoteMedia) {
         for (const rm of remoteMedia) {
            const existsLocally = localMedia.find(lm => lm.id === rm.id);
            if (!existsLocally) {
               await db.work_order_media.add({ ...rm, sync_status: 'synced' });
            }
         }
      }
      for (const m of localMedia) {
        if (m.sync_status === 'pending_upload' || !m.sync_status) {
           await db.work_order_media.update(m.id, { sync_status: 'pending_upload' });
           await outboxRepository.enqueue('work_order_media', 'INSERT', m);
        }
      }
    }
  }
}

export const workOrderMediaResolver = new WorkOrderMediaResolver();
