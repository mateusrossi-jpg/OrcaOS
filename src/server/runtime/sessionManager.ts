import { WebSocket } from 'ws';
import { aferixLogger } from '../../core/debug/aferixLogger';

export interface ClientSession {
  readonly tenantId: string;
  readonly deviceId: string;
  readonly socket: WebSocket;
  readonly connectedAt: string;
  readonly lastPingAt: string;
}

export class RealtimeSessionManager {
  private sessions = new Map<string, ClientSession>();

  private getSessionKey(tenantId: string, deviceId: string): string {
    return `${tenantId}:${deviceId}`;
  }

  public registerSession(tenantId: string, deviceId: string, socket: WebSocket): void {
    const key = this.getSessionKey(tenantId, deviceId);
    
    if (this.sessions.has(key)) {
      aferixLogger.warn('Session', `Terminating stale session for device ${deviceId} in tenant ${tenantId}`);
      const oldSession = this.sessions.get(key);
      oldSession?.socket.close();
    }

    this.sessions.set(key, {
      tenantId,
      deviceId,
      socket,
      connectedAt: new Date().toISOString(),
      lastPingAt: new Date().toISOString()
    });
    aferixLogger.info('Session', `Registered device ${deviceId} for tenant ${tenantId}`);
  }

  public removeSession(tenantId: string, deviceId: string): void {
    this.sessions.delete(this.getSessionKey(tenantId, deviceId));
    aferixLogger.info('Session', `Removed device ${deviceId} for tenant ${tenantId}`);
  }

  public getTenantSessions(tenantId: string): ClientSession[] {
    return Array.from(this.sessions.values()).filter(s => s.tenantId === tenantId);
  }

  public getDeviceSession(tenantId: string, deviceId: string): ClientSession | undefined {
    return this.sessions.get(this.getSessionKey(tenantId, deviceId));
  }
}

export const sessionManager = new RealtimeSessionManager();
