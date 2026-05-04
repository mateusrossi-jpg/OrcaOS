import { describe, expect, it } from 'vitest';
import { freePlanBenefits, futureProBacklog, proPlanBenefits, proV1Priorities, storePackages } from './planStrategy';

describe('plan strategy', () => {
  it('keeps the free plan useful and without watermark positioning', () => {
    const freeCopy = freePlanBenefits.map((item) => `${item.title} ${item.description}`).join(' ').toLowerCase();

    expect(freePlanBenefits.length).toBeGreaterThanOrEqual(6);
    expect(freeCopy).toContain('pdf simples');
    expect(freeCopy).toContain('sem marca d agua');
    expect(freeCopy).toContain('offline');
  });

  it('prioritizes Pro V1 around presentation, speed and profit', () => {
    const priorities = proV1Priorities.map((item) => item.title);

    expect(priorities).toEqual([
      'Cálculos Pro vitalícios',
      'PDFs profissionais',
      'Orçamentos ilimitados',
      'Modelos personalizados',
      'Cálculos avançados',
      'Relatórios técnicos',
      'Financeiro/lucro real básico',
    ]);
  });

  it('keeps future infrastructure out of the V1 promise', () => {
    const futureCopy = futureProBacklog.map((item) => item.title).join(' ');
    const proCopy = proPlanBenefits.map((item) => item.title).join(' ');

    expect(futureCopy).toContain('Busca online');
    expect(futureCopy).toContain('Backup em nuvem');
    expect(proCopy).not.toContain('Fiscal');
  });

  it('exposes Free, calculation entry package and Pro commercial packages', () => {
    expect(storePackages.map((pack) => pack.title)).toEqual(['Free', 'Cálculos Pro vitalício', 'OrçaOS Pro']);
  });
});
