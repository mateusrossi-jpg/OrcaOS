/**
 * scheduleService.ts — Serviço de Agenda Inteligente de Campo
 *
 * ACID garantido via transações Dexie (IndexedDB).
 * Todas as mutações enfileiram na sync_outbox automaticamente.
 */

import { db } from '../database/db';
import { enqueueMutation } from '../sync/syncWorker';
import type { WorkOrderSchedule } from '../database/schema';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

function computeDurationMinutes(startsAt: string, endsAt: string): number {
  const diff = new Date(endsAt).getTime() - new Date(startsAt).getTime();
  return Math.max(0, Math.round(diff / 60_000));
}

// ─────────────────────────────────────────────────────────────────────────────
// Criação de Agendamento
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateScheduleInput {
  work_order_id: string;
  customer_id: string;
  starts_at: string;
  ends_at: string;
  address?: string;
  technician_notes?: string;
  recurrence_group_id?: string;
  recurrence_days?: string[];
}

/**
 * Cria um novo agendamento vinculado a uma OS.
 * Transação ACID: insere no IndexedDB e enfileira na sync_outbox.
 */
export async function createSchedule(input: CreateScheduleInput): Promise<WorkOrderSchedule> {
  const schedule: WorkOrderSchedule = {
    id: crypto.randomUUID(),
    work_order_id: input.work_order_id,
    customer_id: input.customer_id,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    duration_minutes: computeDurationMinutes(input.starts_at, input.ends_at),
    confirmation_status: 'pending',
    address: input.address,
    technician_notes: input.technician_notes,
    recurrence_group_id: input.recurrence_group_id,
    recurrence_days: input.recurrence_days,
    created_at: now(),
    updated_at: now(),
  };

  await db.transaction('rw', [db.work_order_schedules, db.sync_outbox], async () => {
    await db.work_order_schedules.add(schedule);
    await enqueueMutation('work_order_schedules', 'INSERT', schedule as unknown as Record<string, unknown>);
  });

  return schedule;
}

// ─────────────────────────────────────────────────────────────────────────────
// Atualização de Status
// ─────────────────────────────────────────────────────────────────────────────

export async function updateScheduleStatus(
  scheduleId: string,
  status: WorkOrderSchedule['confirmation_status'],
): Promise<void> {
  const patch = { confirmation_status: status, updated_at: now() };

  await db.transaction('rw', [db.work_order_schedules, db.sync_outbox], async () => {
    await db.work_order_schedules.update(scheduleId, patch);
    const updated = await db.work_order_schedules.get(scheduleId);
    if (updated) {
      await enqueueMutation('work_order_schedules', 'UPDATE', updated as unknown as Record<string, unknown>);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Reagendamento
// ─────────────────────────────────────────────────────────────────────────────

export async function reschedule(
  scheduleId: string,
  newStartsAt: string,
  newEndsAt: string,
  notes?: string,
): Promise<void> {
  const patch: Partial<WorkOrderSchedule> = {
    starts_at: newStartsAt,
    ends_at: newEndsAt,
    duration_minutes: computeDurationMinutes(newStartsAt, newEndsAt),
    confirmation_status: 'rescheduled',
    updated_at: now(),
    ...(notes !== undefined ? { technician_notes: notes } : {}),
  };

  await db.transaction('rw', [db.work_order_schedules, db.sync_outbox], async () => {
    await db.work_order_schedules.update(scheduleId, patch);
    const updated = await db.work_order_schedules.get(scheduleId);
    if (updated) {
      await enqueueMutation('work_order_schedules', 'UPDATE', updated as unknown as Record<string, unknown>);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Queries de Agenda
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retorna agendamentos futuros (a partir de agora), ordenados cronologicamente.
 */
export async function getUpcomingSchedules(limit = 10): Promise<WorkOrderSchedule[]> {
  const cutoff = now();
  return db.work_order_schedules
    .where('starts_at')
    .aboveOrEqual(cutoff)
    .limit(limit)
    .sortBy('starts_at');
}

/**
 * Retorna todos os agendamentos de um intervalo de datas (inclusivo).
 */
export async function getSchedulesByDateRange(
  fromISO: string,
  toISO: string,
): Promise<WorkOrderSchedule[]> {
  return db.work_order_schedules
    .where('starts_at')
    .between(fromISO, toISO, true, true)
    .sortBy('starts_at');
}

/**
 * Retorna agendamentos vinculados a uma OS específica.
 */
export async function getSchedulesByWorkOrder(workOrderId: string): Promise<WorkOrderSchedule[]> {
  return db.work_order_schedules
    .where('work_order_id')
    .equals(workOrderId)
    .sortBy('starts_at');
}
