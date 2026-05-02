import { afterEach, describe, expect, it, vi } from 'vitest';
import { isDevToolsEnabled } from './devTools';

describe('dev tools runtime flag', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is disabled by default', () => {
    vi.stubEnv('VITE_ORCAOS_DEV_TOOLS', '');
    expect(isDevToolsEnabled()).toBe(false);
  });

  it('is enabled only when explicitly true', () => {
    vi.stubEnv('VITE_ORCAOS_DEV_TOOLS', 'true');
    expect(isDevToolsEnabled()).toBe(true);

    vi.stubEnv('VITE_ORCAOS_DEV_TOOLS', 'false');
    expect(isDevToolsEnabled()).toBe(false);
  });
});
