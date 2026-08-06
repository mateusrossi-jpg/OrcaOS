import { OperationalEvent } from '../../domain/operationalEvent';
import { SyncEnvelope } from './syncTypes';

/**
 * PartialReplayEngine
 * Executes partial hydration runs based on sync cursors.
 * It prevents global replays on reconnect by fetching only missed events.
 */
export class PartialReplayEngine {

  /**
   * Evaluates if an incoming sync envelope should be replayed or skipped
   * based on the local high-water mark.
   */
  public shouldReplay(envelope: SyncEnvelope, localCursorTimestamp: string): boolean {
    const envelopeTime = new Date(envelope.timestamp).getTime();
    const cursorTime = new Date(localCursorTimestamp).getTime();

    // Idempotent: Only replay strictly newer events or events that fill a gap.
    // In a full implementation, we'd check sequence gaps or missing vectors.
    return envelopeTime > cursorTime;
  }

  /**
   * Filters a batch of events returning only the incremental diff
   * that needs to be appended locally.
   */
  public filterReplayBatch(events: OperationalEvent[], localCursorTimestamp: string): OperationalEvent[] {
    const cursorTime = new Date(localCursorTimestamp).getTime();

    return events.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      return eventTime > cursorTime;
    });
  }
}

export const partialReplayEngine = new PartialReplayEngine();
