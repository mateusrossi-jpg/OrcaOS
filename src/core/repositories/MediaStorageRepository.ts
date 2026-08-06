import { db } from '../database/db';
import type { MediaChunk } from '../database/schema';

export class MediaStorageRepository {
  static async saveChunk(mediaId: string, chunkIndex: number, data: ArrayBuffer): Promise<void> {
    const id = `${mediaId}_${chunkIndex}`;
    await db.media_chunks.put({
      id,
      media_id: mediaId,
      chunk_index: chunkIndex,
      data
    });
  }

  static async assembleBlob(mediaId: string, mimeType: string): Promise<Blob | null> {
    const chunks = await db.media_chunks
      .where('media_id')
      .equals(mediaId)
      .sortBy('chunk_index');

    if (chunks.length === 0) return null;

    const dataArray = chunks.map(c => c.data);
    return new Blob(dataArray, { type: mimeType });
  }

  static async removeBlob(mediaId: string): Promise<void> {
    const chunkIds = await db.media_chunks.where('media_id').equals(mediaId).primaryKeys();
    await db.media_chunks.bulkDelete(chunkIds);
  }
}
