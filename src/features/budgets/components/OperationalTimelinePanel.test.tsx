import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatMutationField, formatMutationValue, OperationalTimelinePanel, getEventCategory, getEventIcon } from './OperationalTimelinePanel';
import type { SavedBudgetRecord } from '../storage/savedBudgetsStorage';

let mockFilterType = 'todos';
let mockSearchQuery = '';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useMemo: (fn: any) => fn(),
    useState: (init: any) => {
      if (init === 'todos') return [mockFilterType, (val: string) => { mockFilterType = val; }];
      if (init === '') return [mockSearchQuery, (val: string) => { mockSearchQuery = val; }];
      return [init, vi.fn()];
    }
  };
});

function flattenChildrenText(children: any): string {
  if (!children) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    return children.map(flattenChildrenText).join('');
  }
  if (children.props && children.props.children) {
    return flattenChildrenText(children.props.children);
  }
  return '';
}

function extractTimelineEvents(el: any): any[] {
  if (!el || typeof el !== 'object') return [];
  const events: any[] = [];
  
  if (el.props && el.props.className && typeof el.props.className === 'string' && el.props.className.includes('operational-timeline-row')) {
    events.push(el);
    return events;
  }
  
  if (el.props && el.props.children) {
    const childrenArr = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    for (const child of childrenArr) {
      events.push(...extractTimelineEvents(child));
    }
  }
  return events;
}

const mockBudget = {
  id: 'b1',
  status: 'em_execucao',
  createdAt: '2026-05-24T10:00:00Z',
  updatedAt: '2026-05-24T12:00:00Z',
  clientName: 'Test Client',
  title: 'Test Budget',
  items: [],
  timeline: [
    {
      id: 't1',
      workflowId: 'b1',
      type: 'created',
      timestamp: '2026-05-24T10:00:00Z',
      operator: 'Alice'
    },
    {
      id: 't2',
      workflowId: 'b1',
      type: 'updated',
      timestamp: '2026-05-24T10:30:00Z',
      operator: 'Bob',
      meta: {
        mutations: [
          { field: 'total', oldValue: 1000, newValue: 1500 }
        ]
      }
    },
    {
      id: 't3',
      workflowId: 'b1',
      type: 'sent',
      timestamp: '2026-05-24T11:00:00Z',
      operator: 'Alice'
    },
    {
      id: 't4',
      workflowId: 'b1',
      type: 'updated',
      timestamp: '2026-05-24T11:30:00Z',
      operator: 'Bob',
      meta: {
        mutations: [
          { field: 'items[0].added', oldValue: null, newValue: true }
        ]
      }
    }
  ]
} as unknown as SavedBudgetRecord;

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
  
  describe('getEventCategory', () => {
    it('returns category class based on type', () => {
      expect(getEventCategory('created')).toBe('category-created');
      expect(getEventCategory('updated')).toBe('category-updated');
      expect(getEventCategory('sent')).toBe('category-transition');
      expect(getEventCategory('unknown')).toBe('category-default');
    });
  });
  
  describe('getEventIcon', () => {
    it('returns icon based on type and mutations', () => {
      expect(getEventIcon('created')).toBe('✦');
      expect(getEventIcon('updated')).toBe('✎');
      expect(getEventIcon('updated', [{ field: 'total' }])).toBe('＄');
      expect(getEventIcon('updated', [{ field: 'items[0].title' }])).toBe('⊞');
      expect(getEventIcon('sent')).toBe('↗');
    });
  });
});

describe('OperationalTimelinePanel rendering & filters', () => {
  beforeEach(() => {
    mockFilterType = 'todos';
    mockSearchQuery = '';
  });

  it('renders all events by default', () => {
    const el = OperationalTimelinePanel({ budget: mockBudget });
    const text = flattenChildrenText(el);
    const events = extractTimelineEvents(el);
    
    expect(events.length).toBe(4);
    expect(text).toContain('Orçamento criado');
    expect(text).toContain('Orçamento atualizado');
    expect(text).toContain('Orçamento enviado');
  });

  it('filters by "fluxo"', () => {
    mockFilterType = 'fluxo';
    const el = OperationalTimelinePanel({ budget: mockBudget });
    const events = extractTimelineEvents(el);
    
    expect(events.length).toBe(1); // Only 'sent'
    const text = flattenChildrenText(el);
    expect(text).toContain('Orçamento enviado');
    expect(text).not.toContain('Orçamento criado');
  });

  it('filters by "edicoes"', () => {
    mockFilterType = 'edicoes';
    const el = OperationalTimelinePanel({ budget: mockBudget });
    const events = extractTimelineEvents(el);
    
    expect(events.length).toBe(2); // Two 'updated' events
  });

  it('filters by "financeiro"', () => {
    mockFilterType = 'financeiro';
    const el = OperationalTimelinePanel({ budget: mockBudget });
    const events = extractTimelineEvents(el);
    
    expect(events.length).toBe(1); // The one with 'total' mutation
    const text = flattenChildrenText(el);
    expect(text).toContain('Total');
  });

  it('filters by "itens"', () => {
    mockFilterType = 'itens';
    const el = OperationalTimelinePanel({ budget: mockBudget });
    const events = extractTimelineEvents(el);
    
    expect(events.length).toBe(1); // The one with 'items[0].added' mutation
    const text = flattenChildrenText(el);
    expect(text).toContain('Item · adicionado');
  });

  it('searches by operator', () => {
    mockSearchQuery = 'alice';
    const el = OperationalTimelinePanel({ budget: mockBudget });
    const events = extractTimelineEvents(el);
    
    expect(events.length).toBe(2); // 'created' and 'sent' have operator 'Alice'
  });

  it('searches by mutation field value', () => {
    mockSearchQuery = '1.500';
    const el = OperationalTimelinePanel({ budget: mockBudget });
    const events = extractTimelineEvents(el);
    
    expect(events.length).toBe(1); // The one with newValue 1500 formatted
  });

  it('renders empty state when no events match', () => {
    mockSearchQuery = 'never_gonna_match_this';
    const el = OperationalTimelinePanel({ budget: mockBudget });
    const events = extractTimelineEvents(el);
    
    expect(events.length).toBe(0);
    const text = flattenChildrenText(el);
    expect(text).toContain('Nenhum evento encontrado.');
  });
  
  it('renders snapshot indicator with detail in timeline', () => {
    const budgetWithSnap = {
      ...mockBudget,
      snapshots: [
        {
          snapshotId: 's1',
          timelineEventId: 't1',
          workflowStatus: 'created',
          totals: { finalTotal: 5000 },
          items: [1, 2, 3],
          fingerprint: 'v1:xyz'
        }
      ]
    } as any;
    const el = OperationalTimelinePanel({ budget: budgetWithSnap });
    const text = flattenChildrenText(el);
    
    expect(text).toContain('v1:xyz');
    expect(text).toContain('5.000,00');
    expect(text).toContain('3 itens');
  });

  it('falls back to legacy event deduction when timeline array is missing', () => {
    const legacyBudget = {
      id: 'b2',
      status: 'finalizado',
      createdAt: '2026-05-24T10:00:00Z',
      updatedAt: '2026-05-24T12:00:00Z',
      clientName: 'Legacy',
      title: 'Legacy',
      items: []
    } as unknown as SavedBudgetRecord;
    const el = OperationalTimelinePanel({ budget: legacyBudget });
    const events = extractTimelineEvents(el);
    
    // Should deduce: created, sent, authorized, execution_started, finished
    // Since mock filter is 'todos', it returns all 5
    expect(events.length).toBe(5);
  });
});
