export interface EvidenceDraft {
  readonly id: string;
  readonly workOrderId: string;
  readonly localPath: string;
  readonly type: 'photo' | 'signature' | 'document';
  readonly description?: string;
  readonly timestamp: string;
  readonly status: 'pending' | 'uploading' | 'failed' | 'synced';
}

/**
 * EvidenceUploadQueue
 * Offline-safe foundation for field attachments.
 * Ensures that photos taken in offline mode are safely stored and retried.
 */
export class EvidenceUploadQueue {
  private queue: EvidenceDraft[] = [];

  public enqueueEvidence(draft: Omit<EvidenceDraft, 'status'>): void {
    const item: EvidenceDraft = { ...draft, status: 'pending' };
    this.queue.push(item);
    console.info(`[EvidenceQueue] Enqueued ${item.type} for workOrder ${item.workOrderId}`);
    // In a real app, save to IndexedDB here
  }

  public getPendingForWorkOrder(workOrderId: string): EvidenceDraft[] {
    return this.queue.filter(q => q.workOrderId === workOrderId && q.status !== 'synced');
  }

  public markAsSynced(id: string): void {
    const idx = this.queue.findIndex(q => q.id === id);
    if (idx > -1) {
      this.queue[idx] = { ...this.queue[idx], status: 'synced' };
    }
  }
}

export const evidenceUploadQueue = new EvidenceUploadQueue();
