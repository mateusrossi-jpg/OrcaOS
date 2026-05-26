import { describe, expect, it, vi, beforeEach } from 'vitest';
import { pilotUsageMetrics } from '../metrics/PilotUsageMetrics';
import { evidenceUploadQueue } from '../storage/evidenceUploadQueue';
import { offlineReconciliationService } from '../../../core/sync/offlineReconciliation';
import { versionVectorManager } from '../../../core/sync/versionVector';
import { SyncEnvelope } from '../../../core/sync/syncTypes';

// Mock device identity to control device ID
vi.mock('../../../core/sync/deviceIdentity', () => {
  return {
    deviceIdentityManager: {
      getDeviceId: () => 'local-device-123',
    },
  };
});

describe('Pilot Usage Metrics', () => {
  beforeEach(() => {
    // Reset private metrics array using any cast since it's a test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pilotUsageMetrics as any).metrics = [];
  });

  it('logs session and aggregates metrics correctly', () => {
    pilotUsageMetrics.logSession({
      workOrderId: 'os-1',
      durationMinutes: 45,
      reconnectCount: 2,
      attachmentCount: 3,
      highestIdleMinutes: 5,
    });

    pilotUsageMetrics.logSession({
      workOrderId: 'os-2',
      durationMinutes: 15,
      reconnectCount: 0,
      attachmentCount: 1,
      highestIdleMinutes: 1,
    });

    const stats = pilotUsageMetrics.getAggregatedStats();
    expect(stats).not.toBeNull();
    expect(stats?.sessionsTracked).toBe(2);
    expect(stats?.averageDurationMinutes).toBe(30); // (45 + 15) / 2
    expect(stats?.totalNetworkDrops).toBe(2); // 2 + 0
  });

  it('handles empty session list gracefully', () => {
    const stats = pilotUsageMetrics.getAggregatedStats();
    expect(stats).toBeNull();
  });
});

describe('Evidence Upload Queue (Offline-Safe)', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (evidenceUploadQueue as any).queue = [];
  });

  it('enqueues evidence as pending and retrieves correctly', () => {
    evidenceUploadQueue.enqueueEvidence({
      id: 'photo-1',
      workOrderId: 'os-1',
      type: 'photo',
      localPath: 'content://media/1',
      timestamp: new Date().toISOString(),
    });

    const pending = evidenceUploadQueue.getPendingForWorkOrder('os-1');
    expect(pending).toHaveLength(1);
    expect(pending[0].status).toBe('pending');
    expect(pending[0].id).toBe('photo-1');
  });

  it('marks evidence as synced', () => {
    evidenceUploadQueue.enqueueEvidence({
      id: 'photo-1',
      workOrderId: 'os-1',
      type: 'photo',
      localPath: 'content://media/1',
      timestamp: new Date().toISOString(),
    });

    evidenceUploadQueue.markAsSynced('photo-1');
    const pending = evidenceUploadQueue.getPendingForWorkOrder('os-1');
    expect(pending).toHaveLength(0);
  });
});

describe('Offline Reconciliation causal consistency', () => {
  it('ignores envelopes from local device', () => {
    const envelope: SyncEnvelope = {
      envelopeId: 'env-1',
      deviceId: 'local-device-123',
      eventId: 'evt-1',
      aggregateId: 'agg-1',
      aggregateType: 'workOrder',
      timestamp: new Date().toISOString(),
      sequence: 1,
      transportVersion: '1.0',
      syncVersion: '1.0',
      operationType: 'APPEND',
      payload: {},
    };

    const spyUpdate = vi.spyOn(versionVectorManager, 'updateDeviceCursor');
    offlineReconciliationService.processIncomingEnvelope(envelope);
    expect(spyUpdate).not.toHaveBeenCalled();
    spyUpdate.mockRestore();
  });

  it('accepts and updates version vectors for valid foreign envelopes', () => {
    const envelope: SyncEnvelope = {
      envelopeId: 'env-2',
      deviceId: 'remote-device-456',
      eventId: 'evt-2',
      aggregateId: 'agg-2',
      aggregateType: 'workOrder',
      timestamp: new Date(Date.now() + 10000).toISOString(), // strictly in the future
      sequence: 1,
      transportVersion: '1.0',
      syncVersion: '1.0',
      operationType: 'APPEND',
      payload: {},
    };

    const spyUpdateCursor = vi.spyOn(versionVectorManager, 'updateDeviceCursor');
    const spyUpdateAggregate = vi.spyOn(versionVectorManager, 'updateAggregateCheckpoint');
    
    offlineReconciliationService.processIncomingEnvelope(envelope);
    
    expect(spyUpdateCursor).toHaveBeenCalledWith('remote-device-456', 'evt-2', envelope.timestamp, 1);
    expect(spyUpdateAggregate).toHaveBeenCalledWith('agg-2', 'evt-2', 1);
    
    spyUpdateCursor.mockRestore();
    spyUpdateAggregate.mockRestore();
  });
});
