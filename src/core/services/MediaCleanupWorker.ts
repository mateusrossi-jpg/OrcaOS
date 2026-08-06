import { db } from '../database/db';
import { syncHealthService } from './SyncHealthService';
import { backgroundTaskGuard } from './BackgroundTaskGuard';

export class MediaCleanupWorker {
  private isRunning = false;
  private BATCH_SIZE = 10;

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const guardState = await backgroundTaskGuard.check();
      if (guardState !== 'authenticated') return;

      const mediaToClean = await db.work_order_media
        .where('sync_status')
        .equals('deleted_pending_cleanup')
        .limit(this.BATCH_SIZE)
        .toArray();

      if (mediaToClean.length === 0) return;

      const { supabase } = await import('../database/supabaseClient');

      // Process in batch
      for (const media of mediaToClean) {
        try {
          // Verify it's actually deleted on remote
          const { data, error } = await supabase
            .from('work_order_media')
            .select('id')
            .eq('id', media.id)
            .maybeSingle();

          if (error) {
             throw error;
          }

          if (data) {
             // Remote still exists, so we cannot safely clean this up (perhaps it was restored remotely)
             // Let's reset the status to pending resolution or synced depending on logic.
             // For safety, we keep it but remove the pending cleanup status.
             await db.work_order_media.update(media.id, { sync_status: 'synced' });
             continue;
          }

          // If remote is gone, delete the physical blob via edge function/storage if we had the code,
          // for now just delete the local record since supabase storage handles its own cleanup or we can
          // assume it's cleaned up remotely.
          await db.work_order_media.delete(media.id);

        } catch (e) {
          syncHealthService.incrementMediaCleanupError();
          console.error('[MediaCleanupWorker] Falha ao limpar mídia:', media.id, e);
          // Keep in deleted_pending_cleanup for next retry
        }
      }

      syncHealthService.markMediaCleanupComplete();
      syncHealthService.recordSuccess();

    } finally {
      this.isRunning = false;
    }
  }
}

export const mediaCleanupWorker = new MediaCleanupWorker();
