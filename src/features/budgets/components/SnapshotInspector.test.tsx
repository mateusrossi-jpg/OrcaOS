import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SnapshotInspector } from './SnapshotInspector';
import type { SavedBudgetRecord } from '../storage/savedBudgetsStorage';

let mockSelectedId: string | null = null;

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useMemo: (fn: any) => fn(),
    useState: (init: any) => {
      // Very simple mock that tracks one state for SnapshotInspector
      if (typeof init === 'string' || init === null) {
         if (mockSelectedId === undefined) mockSelectedId = init;
         return [mockSelectedId, (val: any) => { mockSelectedId = val; }];
      }
      return [init, vi.fn()];
    }
  };
});

// Mock UI components
vi.mock('../../../app/components/ui', () => ({
  Input: ({ children }: any) => <div>{children}</div>,
  Select: ({ children }: any) => <select>{children}</select>,
}));

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

const mockBudgetWithSnapshots: SavedBudgetRecord = {
  id: 'b1',
  clientName: 'Current Client',
  title: 'Budget',
  status: 'enviado',
  discount: 100,
  total_servicos: 1000,
  custo_materiais: 500,
  custos_operacionais: 200,
  items: [
    { id: 'i1', description: 'Item 1', quantity: 1, unitPrice: 1000, category: 'labor' },
    { id: 'i2', description: 'Item 2', quantity: 1, unitPrice: 500, category: 'material' },
  ],
  snapshots: [
    {
      snapshotId: 'snap1',
      timestamp: '2026-05-24T10:00:00Z',
      workflowStatus: 'enviado',
      operator: 'Op',
      context: 'Initial',
      clientSnapshot: { name: 'Initial Client' },
      items: [{ id: 'i1', description: 'Item 1', quantity: 1, unitPrice: 1000, category: 'labor' }],
      totals: {
        total_servicos: 1000,
        custo_materiais: 0,
        custos_operacionais: 0,
        discount: 0,
        subtotal: 1000,
        finalTotal: 1000,
        taxRate: 6,
        lucro_liquido: 940
      },
      fingerprint: 'v1:abc'
    }
  ],
} as any;

describe('SnapshotInspector', () => {
  beforeEach(() => {
    mockSelectedId = 'snap1';
  });

  it('renders nothing if no snapshots exist', () => {
    const budgetNoSnap = { ...mockBudgetWithSnapshots, snapshots: [] } as any;
    const el = SnapshotInspector({ budget: budgetNoSnap });
    expect(el).toBeNull();
  });

  it('renders snapshot summary and detects differences', () => {
    const el = SnapshotInspector({ budget: mockBudgetWithSnapshots });
    const text = flattenChildrenText(el);

    expect(text).toContain('Initial Client'); // From snapshot
    expect(text).toContain('Current Client'); // From current state
    expect(text).toContain('Estado atual difere do snapshot enviado');
    expect(text).toContain('v1:abc');
  });

  it('renders item counts correctly', () => {
    const el = SnapshotInspector({ budget: mockBudgetWithSnapshots });
    const text = flattenChildrenText(el);
    
    expect(text).toContain('Itens:1');
    expect(text).toContain('Itens:2');
  });

  it('shows totals correctly formatted', () => {
    const el = SnapshotInspector({ budget: mockBudgetWithSnapshots });
    const text = flattenChildrenText(el);
    
    expect(text).toContain('1.000,00');
    expect(text).toContain('1.600,00');
  });
});
