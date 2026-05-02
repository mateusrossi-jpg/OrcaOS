import { afterEach, describe, expect, it, vi } from 'vitest';
import { isGoogleAccountLoginConfigured, requestGoogleAccountProfile } from './googleAccountAuth';

function jsonResponse(value: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(value),
    text: () => Promise.resolve(typeof value === 'string' ? value : JSON.stringify(value)),
  } as Response;
}

describe('google account auth', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('reports whether Google login is configured', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    expect(isGoogleAccountLoginConfigured()).toBe(false);

    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id');
    expect(isGoogleAccountLoginConfigured()).toBe(true);
  });

  it('loads the Google profile from an OAuth token', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id');
    vi.stubGlobal('document', {
      getElementById: vi.fn().mockReturnValue(null),
      head: {
        appendChild: (script: HTMLScriptElement) => {
          script.onload?.(new Event('load'));
        },
      },
      createElement: vi.fn().mockReturnValue({ set async(_value: boolean) {}, set defer(_value: boolean) {} }),
    });
    vi.stubGlobal('window', {
      google: {
        accounts: {
          oauth2: {
            initTokenClient: ({ callback }: { callback: (response: { access_token: string }) => void }) => ({
              requestAccessToken: () => callback({ access_token: 'token' }),
            }),
          },
        },
      },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ sub: '123', name: 'Mateus', email: 'mateus@example.com' })));

    const profile = await requestGoogleAccountProfile();

    expect(profile).toEqual({ sub: '123', name: 'Mateus', email: 'mateus@example.com' });
  });

  it('fails clearly when Google profile has no account id', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id');
    vi.stubGlobal('document', {
      getElementById: vi.fn().mockReturnValue(null),
      head: {
        appendChild: (script: HTMLScriptElement) => {
          script.onload?.(new Event('load'));
        },
      },
      createElement: vi.fn().mockReturnValue({ set async(_value: boolean) {}, set defer(_value: boolean) {} }),
    });
    vi.stubGlobal('window', {
      google: {
        accounts: {
          oauth2: {
            initTokenClient: ({ callback }: { callback: (response: { access_token: string }) => void }) => ({
              requestAccessToken: () => callback({ access_token: 'token' }),
            }),
          },
        },
      },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ email: 'mateus@example.com' })));

    await expect(requestGoogleAccountProfile()).rejects.toThrow('identificador');
  });
});
