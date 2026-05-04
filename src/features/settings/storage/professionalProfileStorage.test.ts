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
    expect(profile.defaultPaymentTerms).toBe('Condições de pagamento a combinar.');
    expect(profile.defaultValidity).toBe('7 dias');
    expect(window.localStorage.getItem('orcaos:professional-profile:v1')).toBeTruthy();
  });

  it('saves and loads professional profile data', () => {
    const profile = loadProfessionalProfile();

    saveProfessionalProfile({
      ...profile,
      professionalName: 'Profissional Técnico',
      businessName: 'OrçaOS Serviços',
      address: 'Rua Teste, 123',
      city: 'São Paulo',
      state: 'SP',
      defaultGuarantee: '90 dias',
    });

    const loaded = loadProfessionalProfile();

    expect(loaded.professionalId).toBe(profile.professionalId);
    expect(loaded.companyId).toBe(profile.companyId);
    expect(loaded.professionalName).toBe('Profissional Técnico');
    expect(loaded.businessName).toBe('OrçaOS Serviços');
    expect(loaded.address).toBe('Rua Teste, 123');
    expect(loaded.city).toBe('São Paulo');
    expect(loaded.defaultGuarantee).toBe('90 dias');
  });

  it('keeps compatibility when commercial defaults are missing from older data', () => {
    const profile = loadProfessionalProfile();
    window.localStorage.setItem('orcaos:professional-profile:v1', JSON.stringify({
      professionalId: profile.professionalId,
      companyId: profile.companyId,
      professionalName: 'Perfil antigo',
    }));

    const loaded = loadProfessionalProfile();

    expect(loaded.professionalName).toBe('Perfil antigo');
    expect(loaded.defaultPaymentTerms).toBe('Condições de pagamento a combinar.');
    expect(loaded.defaultExecutionDeadline).toBe('Prazo de execução a combinar após aprovação.');
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
