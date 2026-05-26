export interface EvidenceDraft {
  readonly id: string;
  readonly workOrderId: string;
  readonly localPath: string;
  readonly type: 'photo' | 'signature' | 'document';
  readonly description?: string;
  readonly timestamp: string;
  readonly status: 'pending' | 'uploading' | 'failed' | 'synced';
}
