import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../../test/createMemoryStorage';
import {
  defaultBusinessProfile,
  loadBusinessProfile,
  saveBusinessProfile,
} from './businessProfileStorage';

describe('business profile storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
    });
  });

  afterEach(() => {
    if (typeof window !== 'undefined') window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('returns defaults when no profile is stored', () => {
    expect(loadBusinessProfile()).toEqual(defaultBusinessProfile);
  });

  it('saves and loads proposal business identity', () => {
    saveBusinessProfile({
      ...defaultBusinessProfile,
      businessName: 'Aferix Serviços',
      documentNumber: '12.345.678/0001-90',
      phone: '',
      email: 'contato@orcaos.test',
      address: 'Endereço comercial',
      responsibleName: 'Profissional Técnico',
      defaultValidity: '10 dias',
    });

    const loaded = loadBusinessProfile();

    expect(loaded.businessName).toBe('Aferix Serviços');
    expect(loaded.documentNumber).toBe('12.345.678/0001-90');
    expect(loaded.responsibleName).toBe('Profissional Técnico');
    expect(loaded.defaultValidity).toBe('10 dias');
  });

  it('keeps compatibility when logoDataUrl is missing from older data', () => {
    window.localStorage.setItem('orcaos:business-profile:v1', JSON.stringify({
      ...defaultBusinessProfile,
      logoDataUrl: undefined,
      businessName: 'Perfil antigo',
    }));

    const loaded = loadBusinessProfile();

    expect(loaded.businessName).toBe('Perfil antigo');
    expect(loaded.logoDataUrl).toBe(defaultBusinessProfile.logoDataUrl);
  });

  it('falls back to defaults for invalid JSON or invalid profile shape', () => {
    window.localStorage.setItem('orcaos:business-profile:v1', '{invalid-json');
    expect(loadBusinessProfile()).toEqual(defaultBusinessProfile);

    window.localStorage.setItem('orcaos:business-profile:v1', JSON.stringify({ businessName: 'Incompleto' }));
    expect(loadBusinessProfile()).toEqual(defaultBusinessProfile);
  });

  it('returns defaults when browser storage is unavailable', () => {
    vi.unstubAllGlobals();

    expect(loadBusinessProfile()).toEqual(defaultBusinessProfile);
  });
});
