import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../test/createMemoryStorage';
import { loadProfessionalProfile, saveProfessionalProfile } from '../../features/settings/storage/professionalProfileStorage';

describe('Local Storage Fault-Tolerance Protection', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
    });
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
    vi.unstubAllGlobals();
  });

  it('gracefully falls back to default values when storage has no data', () => {
    const profile = loadProfessionalProfile();
    expect(profile).toBeDefined();
    expect(profile.professionalId).toMatch(/^pro-/);
  });

  it('correctly persists valid data in storage and loads it back', () => {
    const profile = loadProfessionalProfile();
    const testProfile = {
      ...profile,
      professionalName: 'Empresa Teste',
      phone: '11988888888',
    };

    saveProfessionalProfile(testProfile);
    const loaded = loadProfessionalProfile();

    expect(loaded.professionalName).toBe('Empresa Teste');
    expect(loaded.phone).toBe('11988888888');
  });

  it('prevents crashes and returns a safe fallback when stored JSON is invalid/corrupt', () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('orcaos:professional-profile:v1', '{corrupt-unbalanced-json');
    }

    // Should load default profile without throwing
    const profile = loadProfessionalProfile();
    expect(profile).toBeDefined();
    expect(profile.professionalId).toMatch(/^pro-/);
    expect(profile.professionalName).toBe('');
  });
});
