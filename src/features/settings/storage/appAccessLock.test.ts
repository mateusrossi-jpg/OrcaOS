import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../../test/createMemoryStorage';
import {
  disableAppAccessLock,
  enableAppAccessLock,
  isAppAccessLockEnabled,
  isAppAccessUnlocked,
  loadAppAccessLock,
  lockCurrentSession,
  unlockCurrentSession,
  verifyAppAccessPin,
} from './appAccessLock';

describe('app access lock storage', () => {
  beforeEach(() => {
    vi.stubGlobal('CustomEvent', class {
      type: string;

      constructor(type: string) {
        this.type = type;
      }
    });
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
      sessionStorage: createMemoryStorage(),
      dispatchEvent: vi.fn(),
    });
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      window.sessionStorage.clear();
    }
    vi.unstubAllGlobals();
  });

  it('starts unlocked when no lock is configured', () => {
    expect(loadAppAccessLock()).toBeNull();
    expect(isAppAccessLockEnabled()).toBe(false);
    expect(isAppAccessUnlocked()).toBe(true);
  });

  it('rejects short PINs', async () => {
    await expect(enableAppAccessLock('123')).rejects.toThrow('pelo menos 4');
  });

  it('enables a lock and unlocks the current session', async () => {
    await enableAppAccessLock('1234');

    const lock = loadAppAccessLock();

    expect(lock?.enabled).toBe(true);
    expect(lock?.salt).toBeTruthy();
    expect(lock?.pinHash).toBeTruthy();
    expect(isAppAccessLockEnabled()).toBe(true);
    expect(isAppAccessUnlocked()).toBe(true);
  });

  it('locks and unlocks the current session with the correct PIN', async () => {
    await enableAppAccessLock('1234');
    lockCurrentSession();

    expect(isAppAccessUnlocked()).toBe(false);
    expect(await verifyAppAccessPin('0000')).toBe(false);
    expect(isAppAccessUnlocked()).toBe(false);
    expect(await verifyAppAccessPin('1234')).toBe(true);
    expect(isAppAccessUnlocked()).toBe(true);
  });

  it('allows explicit session unlock and lock helpers', async () => {
    await enableAppAccessLock('1234');
    lockCurrentSession();
    unlockCurrentSession();

    expect(isAppAccessUnlocked()).toBe(true);

    lockCurrentSession();

    expect(isAppAccessUnlocked()).toBe(false);
  });

  it('disables the lock and returns to unlocked behavior', async () => {
    await enableAppAccessLock('1234');

    disableAppAccessLock();

    expect(loadAppAccessLock()).toBeNull();
    expect(isAppAccessLockEnabled()).toBe(false);
    expect(isAppAccessUnlocked()).toBe(true);
  });

  it('ignores invalid stored lock payloads safely', () => {
    window.localStorage.setItem('orcaos:access-lock:v1', JSON.stringify({ enabled: true, salt: '', pinHash: '' }));

    expect(loadAppAccessLock()).toBeNull();
  });
});
