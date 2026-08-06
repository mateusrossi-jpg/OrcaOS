import { db } from '../database/db';
import { supabase } from '../database/supabaseClient';
import { StorageQuotaMonitor } from './StorageQuotaMonitor';
import { MediaStorageRepository } from '../repositories/MediaStorageRepository';
import type { MediaDownloadJob, WorkOrderMedia } from '../database/schema';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export class MediaDownloadQueue {
  private static isRunning = false;

  static async enqueue(media: WorkOrderMedia, tenantId: string, priority: number): Promise<void> {
    const existing = await db.media_download_jobs.where('media_id').equals(media.id).first();
    if (existing) return;

    await db.media_download_jobs.put({
      id: crypto.randomUUID(),
      media_id: media.id,
      tenant_id: tenantId,
      status: 'queued',
      priority,
      attempts: 0,
      bytes_downloaded: 0,
      total_bytes: media.size_bytes || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  static async processNext(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const quota = await StorageQuotaMonitor.estimate();
      if (quota.state === 'BLOCKED') {
        await db.media_download_jobs.where('status').equals('downloading').modify({ status: 'blocked_quota' });
        return;
      }

      const job = await db.media_download_jobs
        .where('status')
        .anyOf('queued', 'downloading')
        .first(); // In reality we'd sort by priority, but Dexie requires compound indexes for that. For MVP, first found is fine.

      if (!job) return;

      const media = await db.work_order_media.get(job.media_id);
      if (!media || !media.storage_path) {
        await db.media_download_jobs.update(job.id, { status: 'failed', last_error: 'Media or storage_path not found' });
        return;
      }

      await db.media_download_jobs.update(job.id, { status: 'downloading' });

      let downloaded = job.bytes_downloaded;
      const total = job.total_bytes;

      while (downloaded < total) {
        // Re-check quota before each chunk
        const canDownload = await StorageQuotaMonitor.canDownloadMedia(CHUNK_SIZE);
        if (!canDownload) {
          await db.media_download_jobs.update(job.id, { status: 'blocked_quota' });
          return;
        }

        const end = Math.min(downloaded + CHUNK_SIZE - 1, total - 1);

        // Simulating the Supabase storage download with Range header
        // Since Supabase JS client doesn't directly support Range headers on download,
        // we'd typically use a direct fetch with the signed URL.
        const result = await supabase.storage.from('media').createSignedUrl(media.storage_path, 60);
        const signedUrl = result.data?.signedUrl;

        if (!signedUrl) throw new Error('Could not get signed URL');

        const response = await fetch(signedUrl, {
          headers: { Range: `bytes=${downloaded}-${end}` }
        });

        if (!response.ok && response.status !== 206) {
          throw new Error(`Failed to download chunk: ${response.status}`);
        }

        const chunkBuffer = await response.arrayBuffer();
        const chunkIndex = Math.floor(downloaded / CHUNK_SIZE);

        await MediaStorageRepository.saveChunk(media.id, chunkIndex, chunkBuffer);

        downloaded += chunkBuffer.byteLength;

        await db.media_download_jobs.update(job.id, {
          bytes_downloaded: downloaded,
          updated_at: new Date().toISOString()
        });
      }

      await db.media_download_jobs.update(job.id, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      await db.work_order_media.update(media.id, { sync_status: 'synced' });

    } catch (err: any) {
      console.error('[MediaDownloadQueue] Error', err);
      // Basic exponential backoff logic would go here
    } finally {
      this.isRunning = false;
    }
  }
}
