import { TransportEnvelope } from '../realtime/transportTypes';
import { SyncEnvelope } from '../sync/syncTypes';
import { AutomationEnvelope } from '../automation/automationTypes';
import { NotificationEnvelope } from '../realtime/transportTypes';
import { serverReplicationService } from './serverReplicationService';
import { distributedAutomationOrchestrator } from './distributedAutomationOrchestrator';
import { distributedNotificationService } from './distributedNotificationService';
import { TenantContext } from './tenantFoundation';

/**
 * CloudEventGateway
 * The unified ingress/egress point for all realtime traffic (WebSocket, SSE).
 * Routes generic TransportEnvelopes to specialized distributed services safely.
 */
export class CloudEventGateway {

  public handleIncomingMessage(context: TenantContext, rawEnvelope: TransportEnvelope): void {
    // Basic structural validation
    if (!rawEnvelope.id || !rawEnvelope.type || !rawEnvelope.payload) {
      console.error('[Cloud Gateway] Malformed transport envelope discarded.');
      return;
    }

    try {
      switch (rawEnvelope.type) {
        case 'sync_request':
          serverReplicationService.processIncomingReplication(context, rawEnvelope.payload as SyncEnvelope);
          break;

        case 'automation_dispatch':
          distributedAutomationOrchestrator.orchestrateDispatch(context, rawEnvelope.payload as AutomationEnvelope);
          break;

        case 'notification':
          // Clients typically don't send notifications (they are derived), 
          // but if they do (e.g. read status sync), it routes here.
          distributedNotificationService.broadcastNotification(context, rawEnvelope.payload as NotificationEnvelope);
          break;

        case 'ping':
        case 'pong':
          // Handled by connection manager
          break;

        case 'operational_event':
          // Normally handled inside sync_request. Direct operational_events are deprecated over wire.
          console.warn('[Cloud Gateway] Direct operational_event received. Recommend wrapping in sync_request.');
          break;

        default:
          console.warn(`[Cloud Gateway] Unknown event type: ${rawEnvelope.type}`);
      }
    } catch (error) {
      console.error(`[Cloud Gateway] Security/Validation error processing message ${rawEnvelope.id}`, error);
    }
  }

  public handleReconnectRequest(context: TenantContext, deviceId: string): void {
    console.info(`[Cloud Gateway] Device ${deviceId} from tenant ${context.tenantId} requested reconnect partial replay.`);
    // Delegate to ServerReplicationService or PartialReplayEngine
    // to stream missing SyncEnvelopes down the WebSocket.
  }
}

export const cloudEventGateway = new CloudEventGateway();
