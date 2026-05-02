import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../../test/createMemoryStorage';
import {
  loadProfessionalProfile,
  resetProfessionalProfileIds,
  saveProfessionalProfile,
} from './professionalProfileStorage';

describe('professional profile storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
    });
  });

  afterEach(() => {
    if (typeof window !== 'undefined') window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('creates and persists an empty profile when missing', () => {
    const profile = loadProfessionalProfile();

    expect(profile.professionalId).toMatch(/^pro-/);
    expect(profile.companyId).toMatch(/^company-/);
    expect(profile.mainArea).toBe('Elétrica');
    expect(window.localStorage.getItem('orcaos:professional-profile:v1')).toBeTruthy();
  });

  it('saves and loads professional profile data', () => {
    const profile = loadProfessionalProfile();

    saveProfessionalProfile({
      ...profile,
      professionalName: 'Mateus Rossi',
      businessName: 'OrçaOS Serviços',
      city: 'São Paulo',
      state: 'SP',
    });

    const loaded = loadProfessionalProfile();

    expect(loaded.professionalId).toBe(profile.professionalId);
    expect(loaded.companyId).toBe(profile.companyId);
    expect(loaded.professionalName).toBe('Mateus Rossi');
    expect(loaded.businessName).toBe('OrçaOS Serviços');
    expect(loaded.city).toBe('São Paulo');
  });

  it('falls back safely when stored JSON is invalid', () => {
    window.localStorage.setItem('orcaos:professional-profile:v1', '{invalid-json');

    const profile = loadProfessionalProfile();

    expect(profile.professionalId).toMatch(/^pro-/);
    expect(profile.professionalName).toBe('');
  });

  it('resets profile ids while preserving business data', () => {
    const profile = loadProfessionalProfile();
    const reset = resetProfessionalProfileIds({
      ...profile,
      professionalName: 'Profissional',
      businessName: 'Empresa',
    });

    expect(reset.professionalId).not.toBe(profile.professionalId);
    expect(reset.companyId).not.toBe(profile.companyId);
    expect(reset.professionalName).toBe('Profissional');
    expect(reset.businessName).toBe('Empresa');
  });

  it('returns a safe empty profile when browser storage is unavailable', () => {
    vi.unstubAllGlobals();

    const profile = loadProfessionalProfile();

    expect(profile.professionalId).toMatch(/^pro-/);
    expect(profile.companyId).toMatch(/^company-/);
  });
});
