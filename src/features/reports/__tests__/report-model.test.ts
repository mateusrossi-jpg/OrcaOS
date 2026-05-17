import { describe, expect, it } from 'vitest';
import type { CalculationCapture } from '../../../core/types/workflow';
import {
  getReportCaptureMetrics,
  isReportCapture,
  isClientPurchaseMaterial,
} from '../../workflow/utils/captureWorkflow';

describe('Report Model and Metrics Flow Protection', () => {
  const mockCaptures: CalculationCapture[] = [
    {
      id: 'cap-1',
      module: 'fundamentals',
      moduleLabel: 'Fundamentos',
      calculatorLabel: 'Dimensionamento',
      destination: 'survey', // survey or both -> reportReady
      createdAt: new Date().toISOString(),
      summary: 'Diagnostic capture',
      itemType: 'diagnostic',
      details: ['Erro de fiação detectado'],
      imageDataUrl: 'data:image/png;base64,123',
    },
    {
      id: 'cap-2',
      module: 'fundamentals',
      moduleLabel: 'Fundamentos',
      calculatorLabel: 'Disjuntor',
      destination: 'budget', // budget only -> not reportReady by destination
      createdAt: new Date().toISOString(),
      summary: 'Service item',
      itemType: 'service',
      details: ['Substituição de disjuntor'],
      reportReady: true, // explicitly ready for report
    },
    {
      id: 'cap-3',
      module: 'fundamentals',
      moduleLabel: 'Fundamentos',
      calculatorLabel: 'Tomada',
      destination: 'budget',
      createdAt: new Date().toISOString(),
      summary: 'Material item',
      itemType: 'material',
      details: ['Módulo de tomada 10A'],
      clientPurchaseRequired: true,
    },
  ];

  it('correctly filters report items and counts diagnostics/images', () => {
    const metrics = getReportCaptureMetrics(mockCaptures);

    expect(metrics.reportItems.length).toBe(2); // diagnostic (survey) + service (reportReady)
    expect(metrics.itemsWithImage).toBe(1); // cap-1 has image
    expect(metrics.diagnostics).toBe(1); // cap-1 is diagnostic
  });

  it('correctly identifies client purchased materials', () => {
    const materialCapture = mockCaptures[2];
    expect(isClientPurchaseMaterial(materialCapture)).toBe(true);

    const diagnosticCapture = mockCaptures[0];
    expect(isClientPurchaseMaterial(diagnosticCapture)).toBe(false);
  });

  it('gracefully handles empty capture lists without throwing errors', () => {
    const metrics = getReportCaptureMetrics([]);
    expect(metrics.reportItems).toEqual([]);
    expect(metrics.itemsWithImage).toBe(0);
    expect(metrics.diagnostics).toBe(0);
  });

  it('provides safe fallbacks for optional or missing fields', () => {
    const minimalCapture: CalculationCapture = {
      id: 'cap-min',
      module: 'fundamentals',
      moduleLabel: 'Customizado',
      calculatorLabel: 'Nota',
      destination: 'survey',
      createdAt: new Date().toISOString(),
      summary: 'Nota simples',
      details: [],
    };

    expect(isReportCapture(minimalCapture)).toBe(true);
    expect(isClientPurchaseMaterial(minimalCapture)).toBe(false);
  });
});
