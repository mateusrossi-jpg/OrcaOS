import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../../test/createMemoryStorage';
import {
  loadProfessionalProfile,
  saveProfessionalProfile,
  resetProfessionalProfileIds,
} from '../storage/professionalProfileStorage';

describe('Professional Profile Functional Protection', () => {
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

  it('loads default settings safely when storage is empty', () => {
    const profile = loadProfessionalProfile();

    expect(profile.professionalId).toMatch(/^pro-/);
    expect(profile.companyId).toMatch(/^company-/);
    expect(profile.mainArea).toBe('Elétrica');
    expect(profile.defaultValidity).toBe('7 dias');
    expect(profile.defaultPaymentTerms).toBe('Condições de pagamento a combinar.');
  });

  it('correctly persists changes and retrieves them', () => {
    const original = loadProfessionalProfile();
    const updated = {
      ...original,
      professionalName: 'Mateus Rossi',
      businessName: 'MR Engenharia',
      phone: '11999999999',
      email: 'mateus@example.com',
      logoUrl: 'https://example.com/logo.png',
    };

    saveProfessionalProfile(updated);

    const loaded = loadProfessionalProfile();
    expect(loaded.professionalName).toBe('Mateus Rossi');
    expect(loaded.businessName).toBe('MR Engenharia');
    expect(loaded.phone).toBe('11999999999');
    expect(loaded.email).toBe('mateus@example.com');
    expect(loaded.logoUrl).toBe('https://example.com/logo.png');
  });

  it('regenerates unique IDs without clearing commercial preferences', () => {
    const profile = loadProfessionalProfile();
    const withCustomData = {
      ...profile,
      professionalName: 'Mateus Rossi',
      businessName: 'MR Engenharia',
      defaultValidity: '15 dias',
    };

    const reset = resetProfessionalProfileIds(withCustomData);

    expect(reset.professionalId).not.toBe(profile.professionalId);
    expect(reset.companyId).not.toBe(profile.companyId);
    expect(reset.professionalName).toBe('Mateus Rossi');
    expect(reset.businessName).toBe('MR Engenharia');
    expect(reset.defaultValidity).toBe('15 dias');
  });

  it('safely handles empty or corrupt logo and string values', () => {
    const profile = loadProfessionalProfile();
    const corruptProfile = {
      ...profile,
      logoUrl: undefined as any,
      logoDataUrl: null as any,
    };

    saveProfessionalProfile(corruptProfile);

    const loaded = loadProfessionalProfile();
    expect(loaded.logoUrl).toBe('');
    expect(loaded.logoDataUrl).toBeNull();
  });
});
