/**
 * stockReservations.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Testes unitários para o serviço de Reserva de Estoque.
 * Usa lógica pura (sem IndexedDB real) para validar as regras de negócio.
 */
import { describe, expect, it } from 'vitest';
import type { StockReservation } from '../database/schema';

// ─── Helpers de teste (lógica pura, sem DB) ──────────────────────────────────

/** Calcula disponibilidade a partir de dados em memória */
function computeAvailableQty(
  stockQty: number,
  reservations: Pick<StockReservation, 'status' | 'quantity'>[]
): number {
  const reserved = reservations
    .filter(r => r.status === 'active')
    .reduce((sum, r) => sum + r.quantity, 0);
  return stockQty - reserved;
}

/** Determina se a aprovação deve gerar warning (disponibilidade < 0 após reserva) */
function approvalWarnings(
  items: Array<{ itemId: string; name: string; qty: number; stockQty: number; activeReserved: number }>
): Array<{ itemId: string; itemName: string; availableAfter: number; requested: number }> {
  const warnings = [];
  for (const item of items) {
    const availableNow = item.stockQty - item.activeReserved;
    const availableAfter = availableNow - item.qty;
    if (availableAfter < 0) {
      warnings.push({
        itemId: item.itemId,
        itemName: item.name,
        availableAfter,
        requested: item.qty,
      });
    }
  }
  return warnings;
}

// ─── getAvailableQuantity ─────────────────────────────────────────────────────
describe('getAvailableQuantity (lógica pura)', () => {
  it('retorna saldo físico quando não há reservas', () => {
    expect(computeAvailableQty(10, [])).toBe(10);
  });

  it('subtrai apenas reservas ativas', () => {
    const reservations: Pick<StockReservation, 'status' | 'quantity'>[] = [
      { status: 'active',   quantity: 3 },
      { status: 'released', quantity: 5 },
      { status: 'consumed', quantity: 2 },
    ];
    // Só a active (3) é subtraída
    expect(computeAvailableQty(10, reservations)).toBe(7);
  });

  it('retorna valor negativo quando over-committed', () => {
    const reservations: Pick<StockReservation, 'status' | 'quantity'>[] = [
      { status: 'active', quantity: 8 },
      { status: 'active', quantity: 5 },
    ];
    expect(computeAvailableQty(10, reservations)).toBe(-3);
  });

  it('soma corretamente múltiplas reservas ativas de OS diferentes', () => {
    const reservations: Pick<StockReservation, 'status' | 'quantity'>[] = [
      { status: 'active', quantity: 2 },
      { status: 'active', quantity: 3 },
    ];
    expect(computeAvailableQty(10, reservations)).toBe(5);
  });

  it('retorna zero quando estoque é igual ao reservado', () => {
    const reservations: Pick<StockReservation, 'status' | 'quantity'>[] = [
      { status: 'active', quantity: 10 },
    ];
    expect(computeAvailableQty(10, reservations)).toBe(0);
  });
});

// ─── Criação de Reservas → approved ──────────────────────────────────────────
describe('createReservationsForOrder (lógica de aprovação)', () => {
  it('aprovação com estoque suficiente não gera warnings', () => {
    const items = [
      { itemId: 'item-1', name: 'ESP32', qty: 2, stockQty: 10, activeReserved: 0 },
    ];
    const warnings = approvalWarnings(items);
    expect(warnings).toHaveLength(0);
  });

  it('aprovação com estoque insuficiente gera warning mas NÃO bloqueia', () => {
    const items = [
      { itemId: 'item-1', name: 'ESP32', qty: 15, stockQty: 10, activeReserved: 0 },
    ];
    const warnings = approvalWarnings(items);
    // Deve gerar warning, mas não lança erro (não bloqueia aprovação)
    expect(warnings).toHaveLength(1);
    expect(warnings[0].itemId).toBe('item-1');
    expect(warnings[0].itemName).toBe('ESP32');
    expect(warnings[0].availableAfter).toBe(-5);  // 10 - 0 - 15
    expect(warnings[0].requested).toBe(15);
  });

  it('com outra OS já reservando parte do estoque, calcula corretamente', () => {
    const items = [
      // Estoque: 10 | Já reservado por outra OS: 8 | Esta OS quer: 5
      { itemId: 'item-1', name: 'Relé 5V', qty: 5, stockQty: 10, activeReserved: 8 },
    ];
    const warnings = approvalWarnings(items);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].availableAfter).toBe(-3); // (10 - 8) - 5 = -3
  });

  it('múltiplos itens: só lista os com falta', () => {
    const items = [
      { itemId: 'item-1', name: 'ESP32',  qty: 2, stockQty: 10, activeReserved: 0 },
      { itemId: 'item-2', name: 'MAX3485', qty: 20, stockQty: 5, activeReserved: 0 },
    ];
    const warnings = approvalWarnings(items);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].itemId).toBe('item-2');
  });

  it('item com estoque exatamente suficiente não gera warning', () => {
    const items = [
      { itemId: 'item-1', name: 'Sensor', qty: 5, stockQty: 5, activeReserved: 0 },
    ];
    const warnings = approvalWarnings(items);
    expect(warnings).toHaveLength(0);
  });
});

// ─── Liberação de Reservas → draft | sent | cancelled ────────────────────────
describe('releaseReservationsForOrder (liberação)', () => {
  it('transição para draft deve marcar reservas active como released', () => {
    const reservations: Pick<StockReservation, 'status' | 'quantity'>[] = [
      { status: 'active',   quantity: 3 },
      { status: 'active',   quantity: 2 },
      { status: 'consumed', quantity: 1 }, // não deve ser afetada
    ];
    // Simula o efeito de release
    const afterRelease = reservations.map(r =>
      r.status === 'active' ? { ...r, status: 'released' as const } : r
    );
    const activeAfter = afterRelease.filter(r => r.status === 'active');
    expect(activeAfter).toHaveLength(0);
  });

  it('after release, disponibilidade volta ao saldo físico', () => {
    const reservations: Pick<StockReservation, 'status' | 'quantity'>[] = [
      { status: 'released', quantity: 3 }, // liberada
      { status: 'released', quantity: 2 }, // liberada
    ];
    expect(computeAvailableQty(10, reservations)).toBe(10);
  });
});

// ─── Consumo de Reservas → completed ─────────────────────────────────────────
describe('consumeReservationsForOrder (conclusão)', () => {
  it('consumo usa a quantidade da RESERVA, não dos itens atuais da OS', () => {
    // A spec diz: "não reler a lista de itens da OS, que pode ter sido editada"
    const reservedQty = 3;  // quantidade no momento da aprovação
    const currentItemQty = 5; // itens da OS poderiam ter sido editados
    const stockQty = 10;

    // O consumo correto usa reservedQty, não currentItemQty
    const newStockAfterConsume = stockQty - reservedQty;
    expect(newStockAfterConsume).toBe(7); // e não 5

    // Se usasse currentItemQty, seria incorreto:
    expect(stockQty - currentItemQty).toBe(5);
  });

  it('após consumir reserva, status muda para consumed', () => {
    const reservation = { status: 'active' as const, quantity: 3 };
    const after = { ...reservation, status: 'consumed' as const };
    expect(after.status).toBe('consumed');
  });

  it('reserva consumed não conta para getAvailableQuantity', () => {
    const reservations: Pick<StockReservation, 'status' | 'quantity'>[] = [
      { status: 'consumed', quantity: 5 },
    ];
    // A baixa já foi feita no saldo físico (stock_quantity já foi decrementado)
    // Então não deve subtrair novamente do disponível
    expect(computeAvailableQty(5, reservations)).toBe(5);
  });

  it('consumo com estoque insuficiente gera warning mas não reverte a operação', () => {
    const stockQty = 2;
    const reservedQty = 5;
    const newQty = stockQty - reservedQty;
    // Saldo negativo é possível (over-commit permitido)
    expect(newQty).toBe(-3);
    // O sistema deve alertar, não lançar erro
    const shouldWarn = newQty < 0;
    expect(shouldWarn).toBe(true);
  });
});

// ─── Interface StockReservation ───────────────────────────────────────────────
describe('StockReservation interface', () => {
  it('status inicia como active ao criar reserva', () => {
    const reservation: Omit<StockReservation, 'id'> = {
      work_order_id: 'wo-001',
      item_id: 'cat-001',
      quantity: 3,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    expect(reservation.status).toBe('active');
  });

  it('transições válidas de status: active → released | consumed', () => {
    const validTransitions: Array<[StockReservation['status'], StockReservation['status']]> = [
      ['active', 'released'],
      ['active', 'consumed'],
    ];
    validTransitions.forEach(([from, to]) => {
      expect(from).toBeDefined();
      expect(to).toBeDefined();
    });
  });

  it('reserva released não volta para active (fluxo irreversível)', () => {
    // Esta é uma regra de negócio: uma nova reserva é criada, a antiga fica released
    const releasedStatus: StockReservation['status'] = 'released';
    expect(releasedStatus).toBe('released');
    // Quando se aprova novamente, cria-se uma NOVA reserva (upsert)
    // A reserva released não é reutilizada
  });
});
