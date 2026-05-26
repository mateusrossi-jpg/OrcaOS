import { SyncEnvelope } from '../../core/sync/syncTypes';

/**
 * BackendEventStore
 * Mock implementation of an append-only distributed event store (e.g. Postgres / DynamoDB).
 * Ensures deterministic ordering and replay safety.
 */
export class BackendEventStore {
  // In-memory representation of a distributed partition per tenant
  private tenantStreams = new Map<string, SyncEnvelope[]>();

  public append(tenantId: string, envelope: SyncEnvelope): void {
    if (!this.tenantStreams.has(tenantId)) {
      this.tenantStreams.set(tenantId, []);
    }
    
    const stream = this.tenantStreams.get(tenantId)!;
    
    // Deduplication check based on sequence / envelopeId
    const isDuplicate = stream.some(e => e.envelopeId === envelope.envelopeId);
    if (isDuplicate) {
      console.warn(`[Storage] Rejected duplicate envelope ${envelope.envelopeId} for tenant ${tenantId}`);
      return;
    }

    stream.push(envelope);
    // Sort by sequence to maintain deterministic ordering
    stream.sort((a, b) => a.sequence - b.sequence);
    
    console.info(`[Storage] Appended envelope ${envelope.envelopeId} to tenant ${tenantId}`);
  }

  public getEventsAfter(tenantId: string, afterSequence: number): SyncEnvelope[] {
    const stream = this.tenantStreams.get(tenantId) || [];
    return stream.filter(e => e.sequence > afterSequence);
  }
}

export const backendEventStore = new BackendEventStore();
