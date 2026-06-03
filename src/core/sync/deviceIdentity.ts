import { generateUUID } from '../utils/idGenerator';
import { DeviceIdentity } from './syncTypes';
import { safeJsonParse } from '../runtime/safeGuards';

/**
 * DeviceIdentity Foundation
 * Establishes a stable, deterministic identity for the local device.
 * Used for replication, multi-device sync, and reconnect-safety.
 */
export class DeviceIdentityManager {
  private readonly storageKey = 'aferix_device_identity';
  private identity: DeviceIdentity | null = null;

  constructor() {
    this.initializeIdentity();
  }

  private initializeIdentity() {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(this.storageKey);
    const parsed = safeJsonParse<DeviceIdentity | null>(stored, null);
    
    if (parsed && parsed.deviceId) {
      this.identity = {
        ...parsed,
        lastSeenAt: new Date().toISOString()
      };
      this.persist();
      return;
    }

    this.identity = {
      deviceId: generateUUID(),
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      metadata: {
        os: navigator.platform || 'unknown',
        browser: navigator.userAgent || 'unknown',
        version: '1.0'
      }
    };
    this.persist();
  }

  private persist() {
    if (typeof window !== 'undefined' && this.identity) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.identity));
    }
  }

  public getIdentity(): DeviceIdentity {
    if (!this.identity) {
      throw new Error('Device identity not initialized');
    }
    return this.identity;
  }

  public getDeviceId(): string {
    return this.getIdentity().deviceId;
  }
}

export const deviceIdentityManager = new DeviceIdentityManager();
