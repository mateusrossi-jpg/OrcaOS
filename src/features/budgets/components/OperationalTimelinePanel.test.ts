import { describe, it, expect } from 'vitest';
import { formatMutationField, formatMutationValue } from './OperationalTimelinePanel';

describe('OperationalTimelinePanel formatters', () => {
  describe('formatMutationField', () => {
    it('maps top-level fields correctly', () => {
      expect(formatMutationField('title')).toBe('Título');
      expect(formatMutationField('total_servicos')).toBe('Total de serviços');
      expect(formatMutationField('clientName')).toBe('Cliente');
    });

    it('maps item-level fields correctly', () => {
      expect(formatMutationField('items[123].added')).toBe('Item · adicionado');
      expect(formatMutationField('items[abc].quantity')).toBe('Item · quantidade');
      expect(formatMutationField('items[456].unitPrice')).toBe('Item · valor unitário');
    });

    it('returns raw field if unknown', () => {
      expect(formatMutationField('unknownField')).toBe('unknownField');
    });
  });

  describe('formatMutationValue', () => {
    it('formats null/undefined', () => {
      expect(formatMutationValue(null)).toBe('—');
      expect(formatMutationValue(undefined)).toBe('—');
    });

    it('formats booleans', () => {
      expect(formatMutationValue(true)).toBe('sim');
      expect(formatMutationValue(false)).toBe('não');
    });

    it('formats strings with truncation', () => {
      expect(formatMutationValue('Curto')).toBe('Curto');
      
      const longStr = 'Esta é uma string muito longa que deve ser cortada pelo formatador para não quebrar o layout da interface gráfica';
      const result = formatMutationValue(longStr);
      expect(result.length).toBe(43); // 42 + '…'
      expect(result.endsWith('…')).toBe(true);
    });

    it('formats money fields correctly in BRL', () => {
      // BRL format with toLocaleString might use non-breaking space depending on Node environment,
      // but we can check if it contains the R$ symbol and the formatted number.
      const val = formatMutationValue(2500.5, 'total');
      expect(val).toContain('R$');
      expect(val).toContain('2.500,50');
    });

    it('formats standard numbers', () => {
      expect(formatMutationValue(1234.56, 'quantity')).toBe('1.234,56');
    });

    it('formats arrays', () => {
      expect(formatMutationValue([1, 2, 3])).toBe('[lista]');
    });

    it('extracts labels from objects', () => {
      expect(formatMutationValue({ description: 'Placa solar' })).toBe('Placa solar');
      expect(formatMutationValue({ title: 'Projeto Alpha' })).toBe('Projeto Alpha');
      expect(formatMutationValue({ name: 'Maria' })).toBe('Maria');
      expect(formatMutationValue({ id: 'abc-123' })).toBe('[objeto]');
    });
  });
});
