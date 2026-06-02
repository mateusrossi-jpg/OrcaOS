import { describe, it, expect } from 'vitest';
import { RoleFeatureMatrix, hasFeature } from '../features/workspace/types/RoleFeatureMatrix';

describe('Role Experience Sprint P2', () => {
  it('deve garantir que FIELD acesse apenas features táticas', () => {
    expect(hasFeature('FIELD', 'AGENDA')).toBe(true);
    expect(hasFeature('FIELD', 'CHECKLIST')).toBe(true);
    expect(hasFeature('FIELD', 'MRR')).toBe(false);
    expect(hasFeature('FIELD', 'REVENUE_INBOX')).toBe(false);
  });

  it('deve garantir que SALES veja funil e receita de aprovações, mas não MRR global', () => {
    expect(hasFeature('SALES', 'PROPOSALS')).toBe(true);
    expect(hasFeature('SALES', 'REVENUE_INBOX')).toBe(true);
    expect(hasFeature('SALES', 'MRR')).toBe(false);
  });

  it('deve garantir que OWNER veja o cockpit inteiro', () => {
    expect(hasFeature('OWNER', 'MRR')).toBe(true);
    expect(hasFeature('OWNER', 'WORKFORCE')).toBe(true);
  });

  it('deve validar resolução rápida do Matrix (< 5ms)', () => {
    const start = performance.now();
    for(let i=0; i<1000; i++) {
      hasFeature('FIELD', 'AGENDA');
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(5); // Ultra fast resolution
  });
});
