import { describe, expect, it } from 'vitest';
import type { CalculationCapture } from '../../../core/types/workflow';
import {
  buildMaterialSupplyPatch,
  calculateCaptureCommercialTotal,
  calculateCaptureReferenceTotal,
  getReportCaptureMetrics,
  isClientPurchaseMaterial,
  isReportCapture,
  materialSupplyLabel,
  normalizeDecimalValue,
} from './captureWorkflow';

function capture(overrides: Partial<CalculationCapture> = {}): CalculationCapture {
  return {
    id: 'capture-1',
    module: 'fundamentals',
    moduleLabel: 'Fundamentos',
    calculatorLabel: 'Lei de Ohm',
    destination: 'budget',
    createdAt: '2026-05-02T00:00:00.000Z',
    summary: 'Resumo técnico',
    details: ['Detalhe técnico'],
    ...overrides,
  };
}

describe('capture workflow helpers', () => {
  it('normalizes decimal text values from Brazilian and technical inputs', () => {
    expect(normalizeDecimalValue('10,5')).toBe(10.5);
    expect(normalizeDecimalValue('10.5')).toBe(10.5);
    expect(normalizeDecimalValue('inválido', 7)).toBe(7);
    expect(normalizeDecimalValue(undefined, 3)).toBe(3);
  });

  it('calculates commercial and reference totals', () => {
    const item = capture({
      quantity: '2,5',
      unitValue: '100',
      materialReferenceUnitValue: '80',
    });

    expect(calculateCaptureCommercialTotal(item)).toBe(250);
    expect(calculateCaptureReferenceTotal(item)).toBe(200);
  });

  it('classifies materials that should be bought by the client', () => {
    expect(isClientPurchaseMaterial(capture({ itemType: 'material', materialSupplyMode: 'client' }))).toBe(true);
    expect(isClientPurchaseMaterial(capture({ itemType: 'material', clientPurchaseRequired: true }))).toBe(true);
    expect(isClientPurchaseMaterial(capture({ itemType: 'material', materialSupplyMode: 'professional' }))).toBe(false);
    expect(isClientPurchaseMaterial(capture({ itemType: 'service', materialSupplyMode: 'client' }))).toBe(false);
  });

  it('builds material supply patches without losing reference value', () => {
    const material = capture({ itemType: 'material', unitValue: '35' });

    expect(buildMaterialSupplyPatch(material, 'client')).toMatchObject({
      materialSupplyMode: 'client',
      materialSupplyLabel: 'Cliente compra',
      materialReferenceUnitValue: '35',
      clientPurchaseRequired: true,
      shouldGenerateBudgetItem: false,
      unitValue: '0',
    });

    expect(buildMaterialSupplyPatch({ ...material, materialReferenceUnitValue: '42' }, 'professional')).toMatchObject({
      materialSupplyMode: 'professional',
      materialSupplyLabel: 'Profissional fornece',
      materialReferenceUnitValue: '42',
      clientPurchaseRequired: false,
      shouldGenerateBudgetItem: true,
      unitValue: '42',
    });
  });

  it('labels material supply modes', () => {
    expect(materialSupplyLabel('professional')).toBe('Profissional fornece');
    expect(materialSupplyLabel('client')).toBe('Cliente compra');
    expect(materialSupplyLabel('mixed')).toBe('Misto / alinhar');
    expect(materialSupplyLabel('undefined')).toBe('A definir depois');
    expect(materialSupplyLabel(undefined)).toBe('Profissional fornece');
  });

  it('selects report captures and computes report metrics', () => {
    const survey = capture({ id: 'survey', destination: 'survey' });
    const budgetOnly = capture({ id: 'budget', destination: 'budget' });
    const diagnostic = capture({ id: 'diag', destination: 'budget', itemType: 'diagnostic', imageDataUrl: 'data:image/png;base64,abc' });
    const ready = capture({ id: 'ready', destination: 'budget', reportReady: true });
    const spec = capture({ id: 'spec', destination: 'budget', itemType: 'projectSpecification' });

    expect(isReportCapture(survey)).toBe(true);
    expect(isReportCapture(budgetOnly)).toBe(false);

    const metrics = getReportCaptureMetrics([survey, budgetOnly, diagnostic, ready, spec]);

    expect(metrics.reportItems.map((item) => item.id)).toEqual(['survey', 'diag', 'ready', 'spec']);
    expect(metrics.itemsWithImage).toBe(1);
    expect(metrics.diagnostics).toBe(1);
  });
});
