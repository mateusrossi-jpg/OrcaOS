import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CalculationCapture } from '../../core/types/workflow';
import { createMemoryStorage } from '../../test/createMemoryStorage';
import { loadStoredCaptures, saveStoredCaptures } from './calculationCapturesStorage';

const validCapture: CalculationCapture = {
  id: 'capture-1',
  module: 'fundamentals',
  moduleLabel: 'Fundamentos elétricos',
  calculatorLabel: 'Lei de Ohm',
  destination: 'survey',
  createdAt: '2026-05-02T00:00:00.000Z',
  summary: 'Resistência calculada: 22 Ω',
  details: ['Tensão: 220 V', 'Corrente: 10 A'],
};

describe('calculation captures storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
    });
  });

  afterEach(() => {
    if (typeof window !== 'undefined') window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('saves and loads valid calculation captures', () => {
    saveStoredCaptures([validCapture]);

    expect(loadStoredCaptures()).toEqual([validCapture]);
  });

  it('filters invalid capture records without dropping valid ones', () => {
    window.localStorage.setItem('orcaos:calculation-captures:v1', JSON.stringify([validCapture, { id: 123 }, { ...validCapture, destination: 'invalid' }]));

    expect(loadStoredCaptures()).toEqual([validCapture]);
  });

  it('returns an empty list for invalid JSON', () => {
    window.localStorage.setItem('orcaos:calculation-captures:v1', '{invalid-json');

    expect(loadStoredCaptures()).toEqual([]);
  });

  it('returns an empty list when browser storage is unavailable', () => {
    vi.unstubAllGlobals();

    expect(loadStoredCaptures()).toEqual([]);
  });
});
