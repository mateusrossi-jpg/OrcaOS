import { generateUUID } from '../../core/utils/idGenerator';
import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { sessionManager } from '../runtime/sessionManager';
import { cloudIngestionService } from '../sync/cloudIngestion';
import { partialReplayApi } from '../sync/partialReplayApi';
import { notificationDeliveryRuntime } from '../notifications/notificationDelivery';
import { automationDeliveryRuntime } from '../automation/automationDelivery';
import { TransportEnvelope } from '../../core/realtime/transportTypes';
import { SyncEnvelope } from '../../core/sync/syncTypes';
import { AutomationEnvelope } from '../../core/automation/automationTypes';
import { NotificationEnvelope } from '../../core/realtime/transportTypes';
import { distributedAutomationOrchestrator } from '../../core/backend/distributedAutomationOrchestrator';

/**
 * RealtimeWebSocketServer
 * The pure WebSocket ingress layer. Maps raw JSON strings to the deterministic backend pipeline.
 */
export class RealtimeWebSocketServer {
  private wss: WebSocketServer;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/realtime' });
    this.setupListeners();
  }

  private setupListeners(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      // In a real app, read from Authorization header or cookie
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const tenantId = url.searchParams.get('tenantId') || 'default-tenant';
      const deviceId = url.searchParams.get('deviceId') || generateUUID();

      sessionManager.registerSession(tenantId, deviceId, ws);

      ws.on('message', (message: string) => {
        this.handleMessage(tenantId, deviceId, ws, message);
      });

      ws.on('close', () => {
        sessionManager.removeSession(tenantId, deviceId);
      });
    });
  }

  private handleMessage(tenantId: string, deviceId: string, ws: WebSocket, data: string): void {
    try {
      const raw = JSON.parse(data) as TransportEnvelope;

      switch (raw.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;

        case 'sync_request': {
          // Replay Request
          const payloadObj = raw.payload as Record<string, unknown>;
          if (payloadObj && typeof payloadObj === 'object' && 'cursor' in payloadObj) {
             const replay = partialReplayApi.computeReplay({
               tenantId,
               deviceId,
               cursor: payloadObj.cursor as import('../../core/sync/syncTypes').SyncCursor
             });
             ws.send(JSON.stringify({
               id: generateUUID(),
               type: 'sync_request',
               payload: replay, // Client PartialReplayEngine expects { envelopes: [] }
               timestamp: new Date().toISOString()
             }));
          } else {
             // Ingestion Request (Append)
             cloudIngestionService.ingest(tenantId, raw.payload as SyncEnvelope);
          }
          break;
        }

        case 'automation_dispatch':
          // 1. Deduplicate via the Orchestrator
          distributedAutomationOrchestrator.orchestrateDispatch(
            { tenantId, companyName: 'N/A', planType: 'enterprise', isActive: true }, 
            raw.payload as AutomationEnvelope
          );
          // 2. Distribute
          automationDeliveryRuntime.distribute(tenantId, raw.payload as AutomationEnvelope);
          break;

        case 'notification':
          notificationDeliveryRuntime.deliver(tenantId, raw.payload as NotificationEnvelope);
          break;

        default:
          console.warn(`[WSS] Unhandled envelope type ${raw.type}`);
      }
    } catch (err) {
      console.error(`[WSS] Failed to parse or route message from ${deviceId}`, err);
    }
  }
}
