import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../../test/createMemoryStorage';
import {
  createGuidedLaborTemplate,
  loadGuidedLaborTemplates,
  saveGuidedLaborTemplates,
  starterGuidedLaborTemplates,
} from './guidedLaborTemplatesStorage';

describe('guided labor templates storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
    });
  });

  afterEach(() => {
    if (typeof window !== 'undefined') window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('returns starter templates when no custom list exists', () => {
    expect(loadGuidedLaborTemplates()).toEqual(starterGuidedLaborTemplates);
  });

  it('saves and loads custom templates with visibility state', () => {
    const template = createGuidedLaborTemplate({
      title: 'Instalação de quadro',
      description: 'Instalação de quadro pequeno com organização básica.',
      defaultUnitValue: 240,
      unit: 'serviço',
      note: 'Valor base para quadro pequeno.',
      suggestedMaterials: 'Quadro, barramentos, disjuntores e identificação.',
      estimatedTime: '4 h',
      marginPercent: 30,
      minimumValue: 220,
      category: 'Elétrica',
      professionModule: 'Eletricista',
      visible: false,
    });

    saveGuidedLaborTemplates([template]);

    expect(loadGuidedLaborTemplates()).toEqual([template]);
  });

  it('filters invalid stored templates and keeps valid legacy records visible', () => {
    window.localStorage.setItem('orcaos:guided-labor-templates:v1', JSON.stringify([
      {
        id: 'valid-legacy',
        title: 'Serviço legado',
        defaultUnitValue: 80,
        unit: 'ponto',
        note: 'Sem visible salvo.',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      { id: 'missing-title', defaultUnitValue: 10, unit: 'un.', note: 'Inválido' },
      { id: 'bad-price', title: 'Preço inválido', defaultUnitValue: '10', unit: 'un.', note: 'Inválido' },
    ]));

    expect(loadGuidedLaborTemplates()).toEqual([
      {
        id: 'valid-legacy',
        title: 'Serviço legado',
        description: undefined,
        defaultUnitValue: 80,
        unit: 'ponto',
        note: 'Sem visible salvo.',
        suggestedMaterials: undefined,
        estimatedTime: undefined,
        marginPercent: undefined,
        minimumValue: undefined,
        category: undefined,
        professionModule: undefined,
        visible: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        custom: false,
      },
    ]);
  });

  it('falls back to starter templates for invalid JSON or unavailable storage', () => {
    window.localStorage.setItem('orcaos:guided-labor-templates:v1', '{invalid-json');
    expect(loadGuidedLaborTemplates()).toEqual(starterGuidedLaborTemplates);

    vi.unstubAllGlobals();
    expect(loadGuidedLaborTemplates()).toEqual(starterGuidedLaborTemplates);
  });
});
