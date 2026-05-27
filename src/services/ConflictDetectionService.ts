export type ConflictSeverity = 'low' | 'medium' | 'high';

export type ConflictRecord = {
  entityType: string;
  entityId: string;
  detectedAt: string;
  conflictType: 'modifiedAfterRead' | 'stale_entity' | 'duplicated_sync_write' | 'deleted_remotely' | 'conflicting_timestamps' | 'multiple_pending_writes';
  severity: ConflictSeverity;
};

class ConflictDetectionService {
  private conflicts: ConflictRecord[] = [];

  detectModifiedAfterRead(entityType: string, entityId: string, readTimestamp: number, currentTimestamp: number): void {
    if (currentTimestamp > readTimestamp) {
      this.conflicts.push({
        entityType,
        entityId,
        detectedAt: new Date().toISOString(),
        conflictType: 'modifiedAfterRead',
        severity: 'high'
      });
    }
  }

  detectStaleEntity(entityType: string, entityId: string, localTimestamp: number, remoteTimestamp: number): void {
    if (localTimestamp < remoteTimestamp) {
      this.conflicts.push({
        entityType,
        entityId,
        detectedAt: new Date().toISOString(),
        conflictType: 'stale_entity',
        severity: 'medium'
      });
    }
  }

  detectMultiplePendingWrites(entityType: string, entityId: string): void {
    // This could happen if sync queue receives identical items repeatedly
    this.conflicts.push({
      entityType,
      entityId,
      detectedAt: new Date().toISOString(),
      conflictType: 'multiple_pending_writes',
      severity: 'low'
    });
  }

  getConflicts(): ConflictRecord[] {
    return [...this.conflicts];
  }
}

export const conflictDetectionService = new ConflictDetectionService();
