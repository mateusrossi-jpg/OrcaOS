/**
 * stockReservations.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Serviço central de Reserva de Estoque do Aferix OS.
 *
 * REGRAS DE NEGÓCIO:
 *  - Reserva é criada ao aprovar uma OS (status → approved).
 *  - Reserva é liberada (released) ao rascunhar, reenviar ou cancelar a OS.
 *  - Reserva é consumida (consumed) + baixa física realizada ao concluir a OS.
 *  - Reserva NÃO bloqueia aprovação: falta de estoque gera aviso, não erro.
 *  - getAvailableQuantity = saldo físico − soma das reservas active daquele item.
 */

import { db } from './db';
import { createId } from '../../app/utils/idHelpers';

// ─── Tipos Públicos ────────────────────────────────────────────────────────────

export interface StockWarning {
  itemId: string;
  itemName: string;
  /** Quantidade disponível APÓS a reserva (pode ser negativo) */
  availableAfter: number;
  /** Quantidade que a OS precisa */
  requested: number;
}

export interface ApproveReservationResult {
  /** Warnings de itens com disponibilidade insuficiente (pode ser vazio) */
  warnings: StockWarning[];
}

// ─── getAvailableQuantity ─────────────────────────────────────────────────────

/**
 * Retorna a quantidade disponível de um item de catálogo:
 *   saldo físico (stock_quantity) − soma das reservas `active` daquele item.
 *
 * Pode retornar valor negativo caso haja reservas excessivas (over-commit).
 */
export async function getAvailableQuantity(itemId: string): Promise<number> {
  const [catalogItem, activeReservations] = await Promise.all([
    db.catalog_items.get(itemId),
    db.stock_reservations
      .where('[item_id+status]')
      .equals([itemId, 'active'])
      .toArray()
      .catch(() =>
        // Fallback para índice simples se o composto não existir (instâncias antigas)
        db.stock_reservations
          .where('item_id').equals(itemId)
          .and(r => r.status === 'active')
          .toArray()
      ),
  ]);

  if (!catalogItem) return 0;
  const reserved = activeReservations.reduce((sum, r) => sum + r.quantity, 0);
  return catalogItem.stock_quantity - reserved;
}

// ─── createReservationsForOrder ───────────────────────────────────────────────

/**
 * Cria (ou recria) reservas `active` para todos os itens de material da OS.
 * Chamado na transição → approved.
 * Retorna warnings de itens com disponibilidade insuficiente (não bloqueia).
 */
export async function createReservationsForOrder(
  workOrderId: string
): Promise<ApproveReservationResult> {
  const orderItems = await db.work_order_items
    .where('work_order_id')
    .equals(workOrderId)
    .toArray();

  const warnings: StockWarning[] = [];

  for (const item of orderItems) {
    // Só reservar itens de catálogo do tipo material
    if (item.is_custom || !item.catalog_item_id) continue;

    const catalogItem = await db.catalog_items.get(item.catalog_item_id);
    if (!catalogItem || catalogItem.type !== 'material') continue;

    // Verificar disponibilidade ANTES de reservar
    const available = await getAvailableQuantity(item.catalog_item_id);

    // Criar/atualizar reserva (upsert por work_order_id + item_id)
    const existingReservation = await db.stock_reservations
      .where('work_order_id').equals(workOrderId)
      .and(r => r.item_id === item.catalog_item_id)
      .first();

    if (existingReservation) {
      await db.stock_reservations.update(existingReservation.id, {
        quantity: item.quantity,
        status: 'active',
      });
    } else {
      await db.stock_reservations.add({
        id: createId('res'),
        work_order_id: workOrderId,
        item_id: item.catalog_item_id,
        quantity: item.quantity,
        status: 'active',
        created_at: new Date().toISOString(),
      });
    }

    // Disponibilidade após a reserva
    const availableAfter = available - item.quantity;
    if (availableAfter < 0) {
      warnings.push({
        itemId: item.catalog_item_id,
        itemName: catalogItem.name,
        availableAfter,
        requested: item.quantity,
      });
    }
  }

  return { warnings };
}

// ─── releaseReservationsForOrder ──────────────────────────────────────────────

/**
 * Marca todas as reservas `active` de uma OS como `released`.
 * Chamado nas transições: approved → draft | sent | cancelled.
 */
export async function releaseReservationsForOrder(workOrderId: string): Promise<void> {
  const activeReservations = await db.stock_reservations
    .where('work_order_id').equals(workOrderId)
    .and(r => r.status === 'active')
    .toArray();

  for (const reservation of activeReservations) {
    await db.stock_reservations.update(reservation.id, { status: 'released' });
  }
}

// ─── consumeReservationsForOrder ──────────────────────────────────────────────

/**
 * Chamado na transição → completed (dentro de uma transação Dexie existente).
 * Para cada reserva `active` da OS:
 *  1. Decrementa o saldo físico do item pela quantidade da RESERVA (não relê os itens da OS).
 *  2. Marca a reserva como `consumed`.
 *
 * IMPORTANTE: deve ser chamado de dentro de um db.transaction() que já inclua
 * as stores catalog_items e stock_reservations.
 *
 * Retorna lista de avisos para itens que ficaram com saldo negativo.
 */
export async function consumeReservationsForOrder(
  workOrderId: string
): Promise<Array<{ name: string; newQty: number }>> {
  const activeReservations = await db.stock_reservations
    .where('work_order_id').equals(workOrderId)
    .and(r => r.status === 'active')
    .toArray();

  const stockWarnings: Array<{ name: string; newQty: number }> = [];

  for (const reservation of activeReservations) {
    const catalogItem = await db.catalog_items.get(reservation.item_id);
    if (!catalogItem) continue;

    const newQty = catalogItem.stock_quantity - reservation.quantity;
    await db.catalog_items.update(reservation.item_id, { stock_quantity: newQty });
    await db.stock_reservations.update(reservation.id, { status: 'consumed' });

    if (newQty < 0) {
      stockWarnings.push({ name: catalogItem.name, newQty });
    }
  }

  return stockWarnings;
}
