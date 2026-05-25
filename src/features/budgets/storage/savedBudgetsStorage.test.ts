import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../../test/createMemoryStorage';
import { clearSavedBudgets, deleteSavedBudget, loadSavedBudgets, saveBudgetRecord } from './savedBudgetsStorage';

describe('saved budgets storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
    });
  });

  afterEach(() => {
    clearSavedBudgets();
    vi.unstubAllGlobals();
  });

  it('saves a budget record', () => {
    const saved = saveBudgetRecord({
      clientName: 'Cliente A',
      title: 'Orçamento A',
      status: 'iniciado',
      discount: 0,
      materialCost: 120,
      operationalCost: 40,
      taxRate: 6,
      total_servicos: 500,
      custo_materiais: 120,
      custos_operacionais: 40,
      aliquota_imposto: 6,
      lucro_liquido: 310,
      items: [],
    });

    const records = loadSavedBudgets();

    expect(saved?.id).toBeDefined();
    expect(records).toHaveLength(1);
    expect(records[0].clientName).toBe('Cliente A');
    expect(records[0].taxRate).toBe(6);
    expect(records[0].total_servicos).toBe(500);
    expect(records[0].lucro_liquido).toBe(310);
  });

  it('updates an existing budget record', () => {
    const saved = saveBudgetRecord({
      clientName: 'Cliente A',
      title: 'Orçamento A',
      status: 'iniciado',
      discount: 0,
      items: [],
    });

    saveBudgetRecord({
      id: saved?.id,
      clientName: 'Cliente B',
      title: 'Orçamento atualizado',
      status: 'iniciado', // normal update
      discount: 10,
      items: [],
    });

    const records = loadSavedBudgets();

    expect(records).toHaveLength(1);
    expect(records[0].clientName).toBe('Cliente B');
    expect(records[0].status).toBe('iniciado');
  });

  describe('timeline and mutations', () => {
    it('appends created event on new budget', () => {
      const saved = saveBudgetRecord({
        clientName: 'Cliente Timeline',
        title: 'Orçamento T1',
        status: 'iniciado',
        discount: 0,
        items: [],
      });

      const records = loadSavedBudgets();
      expect(records[0].timeline).toBeDefined();
      expect(records[0].timeline?.length).toBe(1);
      expect(records[0].timeline![0].type).toBe('created');
    });

    it('appends status transition event', () => {
      const saved = saveBudgetRecord({
        clientName: 'Cliente Timeline',
        title: 'Orçamento T1',
        status: 'iniciado',
        discount: 0,
        items: [],
      });

      saveBudgetRecord({
        ...saved,
        status: 'enviado',
      } as any);

      const records = loadSavedBudgets();
      const timeline = records[0].timeline!;
      
      expect(timeline.length).toBe(2);
      expect(timeline[1].type).toBe('sent');
      expect(timeline[1].meta?.mutations).toBeDefined();
    });

    it('does not append updated event if nothing changed', () => {
      const saved = saveBudgetRecord({
        clientName: 'Cliente Timeline',
        title: 'Orçamento T1',
        status: 'iniciado',
        discount: 0,
        items: [],
      });

      saveBudgetRecord(saved as any); // save exactly the same

      const records = loadSavedBudgets();
      expect(records[0].timeline?.length).toBe(1); // Still only 'created'
    });

    it('appends updated event for top-level mutations', () => {
      const saved = saveBudgetRecord({
        clientName: 'Cliente Timeline',
        title: 'Orçamento T1',
        status: 'iniciado',
        total_servicos: 100,
        discount: 0,
        items: [],
      });

      saveBudgetRecord({
        ...saved,
        total_servicos: 200,
      } as any);

      const records = loadSavedBudgets();
      const timeline = records[0].timeline!;
      
      expect(timeline.length).toBe(2);
      expect(timeline[1].type).toBe('updated');
      expect(timeline[1].meta?.mutations?.length).toBe(1);
      expect(timeline[1].meta?.mutations![0].field).toBe('total_servicos');
    });

    it('appends updated event for item added, removed, and modified', () => {
      const saved = saveBudgetRecord({
        clientName: 'Cliente Timeline',
        title: 'Orçamento T1',
        status: 'iniciado',
        discount: 0,
        items: [
          { id: 'item-1', description: 'Item 1', quantity: 1, unitPrice: 10, category: 'material' },
        ],
      });

      saveBudgetRecord({
        ...saved,
        items: [
          { id: 'item-1', description: 'Item 1 Mod', quantity: 2, unitPrice: 10, category: 'material' },
          { id: 'item-2', description: 'Item 2', quantity: 1, unitPrice: 20, category: 'labor' },
        ],
      } as any);

      let records = loadSavedBudgets();
      let timeline = records[0].timeline!;
      
      expect(timeline.length).toBe(2);
      expect(timeline[1].type).toBe('updated');
      
      const mutations = timeline[1].meta?.mutations!;
      expect(mutations.some(m => m.field === 'items[item-1].description')).toBe(true);
      expect(mutations.some(m => m.field === 'items[item-1].quantity')).toBe(true);
      expect(mutations.some(m => m.field === 'items[item-2].added')).toBe(true);

      // Now remove item-1
      saveBudgetRecord({
        ...records[0],
        items: [
          { id: 'item-2', description: 'Item 2', quantity: 1, unitPrice: 20, category: 'labor' },
        ],
      });

      records = loadSavedBudgets();
      timeline = records[0].timeline!;
      expect(timeline.length).toBe(3);
      expect(timeline[2].meta?.mutations?.some(m => m.field === 'items[item-1].removed')).toBe(true);
    });

    it('respects MAX_TIMELINE_EVENTS retention', () => {
      const saved = saveBudgetRecord({
        clientName: 'Cliente Timeline',
        title: 'Orçamento T1',
        status: 'iniciado',
        discount: 0,
        items: [],
      });

      let currentSaved = saved;
      // Force 85 updates
      for (let i = 0; i < 85; i++) {
        currentSaved = saveBudgetRecord({
          ...currentSaved,
          title: `Orçamento T1 - ${i}`,
        } as any);
      }

      const records = loadSavedBudgets();
      expect(records[0].timeline?.length).toBe(80); // MAX_TIMELINE_EVENTS
    });
  });

  it('loads legacy records with professional commercial fields defaulted', () => {
    window.localStorage.setItem('orcaos:saved-budgets:v1', JSON.stringify([
      {
        id: 'legacy',
        clientName: 'Cliente legado',
        title: 'Orçamento antigo',
        status: 'iniciado',
        discount: 0,
        items: [],
        createdAt: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-01T00:00:00.000Z',
      },
    ]));

    const [record] = loadSavedBudgets();

    expect(record.travelCost).toBe(0);
    expect(record.additionalFees).toBe(0);
    expect(record.paymentTerms).toBe('');
    expect(record.taxRate).toBe(6);
    expect(record.total_servicos).toBe(0);
    expect(record.lucro_liquido).toBe(0);
  });

  describe('workflow transitions and locking', () => {
    it('persists valid transitions and creates timeline events', () => {
      const saved = saveBudgetRecord({
        clientName: 'Cliente A',
        title: 'Orçamento Transition',
        status: 'iniciado',
        discount: 0,
        items: [],
      });

      // iniciado -> enviado
      let updated = saveBudgetRecord({ ...saved, status: 'enviado' } as any);
      expect(updated?.status).toBe('enviado');
      expect(updated?.timeline?.slice(-1)[0].type).toBe('sent');

      // enviado -> autorizado
      updated = saveBudgetRecord({ ...updated, status: 'autorizado' } as any);
      expect(updated?.status).toBe('autorizado');
      expect(updated?.timeline?.slice(-1)[0].type).toBe('authorized');

      // autorizado -> em_execucao
      updated = saveBudgetRecord({ ...updated, status: 'em_execucao' } as any);
      expect(updated?.status).toBe('em_execucao');
      expect(updated?.timeline?.slice(-1)[0].type).toBe('execution_started');

      // em_execucao -> finalizado
      updated = saveBudgetRecord({ ...updated, status: 'finalizado' } as any);
      expect(updated?.status).toBe('finalizado');
      expect(updated?.timeline?.slice(-1)[0].type).toBe('finished');

      // finalizado -> arquivado
      const finalizadoUpdate = saveBudgetRecord({ ...updated, status: 'arquivado' } as any);
      if (!finalizadoUpdate) console.log("FAILED AT FINALIZADO -> ARQUIVADO. updated object was:", updated);
      updated = finalizadoUpdate;
      expect(updated?.status).toBe('arquivado');
      expect(updated?.timeline?.slice(-1)[0].type).toBe('archived');
    });

    it('does not persist invalid direct transitions', () => {
      const saved = saveBudgetRecord({
        clientName: 'Cliente A',
        title: 'Orçamento Invalid',
        status: 'iniciado',
        discount: 0,
        items: [],
      }) as any;

      // invalid: iniciado -> finalizado
      const fail1 = saveBudgetRecord({ ...saved, status: 'finalizado' } as any);
      expect(fail1).toBeNull(); // Should be blocked

      // valid: iniciado -> enviado
      const enviado = saveBudgetRecord({ ...saved, status: 'enviado' } as any);
      
      // invalid: enviado -> iniciado
      const fail2 = saveBudgetRecord({ ...enviado, status: 'iniciado' } as any);
      expect(fail2).toBeNull();

      // valid: enviado -> autorizado
      const autorizado = saveBudgetRecord({ ...enviado, status: 'autorizado' } as any);

      // invalid: autorizado -> enviado
      const fail3 = saveBudgetRecord({ ...autorizado, status: 'enviado' } as any);
      expect(fail3).toBeNull();

      // valid: autorizado -> em_execucao -> finalizado
      const execucao = saveBudgetRecord({ ...autorizado, status: 'em_execucao' } as any);
      const finalizado = saveBudgetRecord({ ...execucao, status: 'finalizado' } as any);

      // invalid: finalizado -> em_execucao
      const fail4 = saveBudgetRecord({ ...finalizado, status: 'em_execucao' } as any);
      expect(fail4).toBeNull();

      // Verify rejected saves did not mutate record or append timelines
      const records = loadSavedBudgets();
      const current = records.find(r => r.id === saved.id);
      expect(current?.status).toBe('finalizado');
      // Timeline should have: created, sent, authorized, execution_started, finished (5 events)
      expect(current?.timeline?.length).toBe(5);
    });

    it('blocks critical edits after being sent (locked)', () => {
      let saved = saveBudgetRecord({
        clientName: 'Cliente A',
        title: 'Orçamento Block',
        status: 'iniciado',
        discount: 0,
        items: [],
      }) as any;

      let currentDiscount = 50;
      const attemptEdit = (record: any) => {
        currentDiscount += 10;
        return saveBudgetRecord({ ...record, discount: currentDiscount } as any);
      };

      // Can edit in iniciado
      saved = attemptEdit(saved);
      expect(saved).not.toBeNull();
      expect(saved.discount).toBe(60);

      // Verify locks across workflow states
      saved = saveBudgetRecord({ ...saved, status: 'enviado' } as any);
      expect(attemptEdit(saved)).toBeNull();

      saved = saveBudgetRecord({ ...saved, status: 'autorizado' } as any);
      expect(attemptEdit(saved)).toBeNull();

      saved = saveBudgetRecord({ ...saved, status: 'em_execucao' } as any);
      expect(attemptEdit(saved)).toBeNull();

      saved = saveBudgetRecord({ ...saved, status: 'finalizado' } as any);
      expect(attemptEdit(saved)).toBeNull();

      // Verify preserved status and values
      const records = loadSavedBudgets();
      const current = records.find(r => r.id === saved.id);
      expect(current?.discount).toBe(60);
      expect(current?.status).toBe('finalizado');
    });
  });

  it('supports expired and cancelled status', () => {
    saveBudgetRecord({
      clientName: 'Cliente A',
      title: 'Orçamento vencido',
      status: 'recusado',
      discount: 0,
      items: [],
    });

    saveBudgetRecord({
      clientName: 'Cliente B',
      title: 'Orçamento cancelado',
      status: 'cancelado',
      discount: 0,
      items: [],
    });

    expect(loadSavedBudgets().map((record) => record.status)).toEqual(['cancelado', 'recusado']);
  });

  it('keeps saved budgets sorted by most recent update', () => {
    window.localStorage.setItem('orcaos:saved-budgets:v1', JSON.stringify([
      {
        id: 'old',
        clientName: 'Cliente antigo',
        title: 'Antigo',
        status: 'iniciado',
        discount: 0,
        items: [],
        createdAt: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-01T00:00:00.000Z',
      },
      {
        id: 'new',
        clientName: 'Cliente novo',
        title: 'Novo',
        status: 'enviado',
        discount: 0,
        items: [],
        createdAt: '2026-05-02T00:00:00.000Z',
        updatedAt: '2026-05-02T00:00:00.000Z',
      },
    ]));

    expect(loadSavedBudgets().map((record) => record.id)).toEqual(['new', 'old']);
  });

  it('deletes a saved budget record', () => {
    const saved = saveBudgetRecord({
      clientName: 'Cliente A',
      title: 'Orçamento A',
      status: 'iniciado',
      discount: 0,
      items: [],
    });

    deleteSavedBudget(saved?.id ?? 'missing');

    expect(loadSavedBudgets()).toHaveLength(0);
  });

  it('ignores invalid stored records', () => {
    window.localStorage.setItem('orcaos:saved-budgets:v1', JSON.stringify([{ id: 123 }]));

    expect(loadSavedBudgets()).toHaveLength(0);
  });

  it('returns an empty list when storage is unavailable', () => {
    vi.unstubAllGlobals();

    expect(loadSavedBudgets()).toEqual([]);
  });
});
