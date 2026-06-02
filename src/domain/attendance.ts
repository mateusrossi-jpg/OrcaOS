// src/domain/attendance.ts
import type { MultiTenantEntity } from '../core/types/business';

/**
 * Central entity that orchestrates the flow Cliente → Attendance → Budget → WorkOrder
 * Only the minimal fields required for the core flow are defined.
 */
export const ATTENDANCE_STATUS = {
  INICIADO: 'iniciado',
  AUTORIZADO: 'autorizado',
  EM_EXECUCAO: 'em_execucao',
  FINALIZADO: 'finalizado',
  CONCLUIDO: 'concluido',
  CANCELADO: 'cancelado',
  ARQUIVADO: 'arquivado',
} as const;

export type AttendanceStatus = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];

import { Budget } from './budget';
import { Service as WorkOrder } from '../core/types/business';

export interface Attendance extends MultiTenantEntity {
  id: string;
  clientId: string; // reference to the client
  siteId: string; // reference to the site (Site‑First Architecture)
  status: AttendanceStatus;
  
  // Materialized Aggregates (FASE 2)
  progress?: number; // Percentual de progresso técnico das OSs (0 a 100)
  totalWorkOrders?: number;
  completedWorkOrders?: number;
  totalBudgets?: number;
  authorizedBudgets?: number;
  revenueExecuted?: number; // Receita realizada faturada (paga/recebida)
  revenuePlanned?: number; // Receita planejada total dos orçamentos autorizados/finalizados

  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;

  // Soft Delete fields (FASE 2.6)
  deletedAt?: string | null;
  deletedBy?: string | null;
  isDeleted?: boolean;
}

/**
 * Pure deterministic function to derive the Attendance status based on child aggregates.
 */
export function deriveAttendanceStatus(
  budgets: Budget[],
  workOrders: WorkOrder[]
): AttendanceStatus {
  // Filter valid OSs (ignore cancelled and soft-deleted ones)
  const validWorkOrders = workOrders.filter(w => w.status !== 'cancelled' && !w.isDeleted);

  // 1. Se existir OS em andamento (in-progress)
  if (validWorkOrders.some(w => w.status === 'in-progress')) {
    return 'em_execucao';
  }

  // 2. Se todas as válidas estiverem concluídas (done)
  if (validWorkOrders.length > 0 && validWorkOrders.every(w => w.status === 'done')) {
    return 'concluido';
  }

  // 3. Se todas as OS estiverem canceladas (ou sem OSs válidas mas existiam OSs)
  if (workOrders.length > 0 && validWorkOrders.length === 0) {
    return 'cancelado';
  }

  // 4. Se existir orçamento autorizado mas nenhuma OS iniciada
  const hasAuthorizedBudget = budgets.some(b => 
    !b.isDeleted && (b.status === 'autorizado' || b.status === 'em_execucao' || b.status === 'finalizado')
  );
  const hasInitiatedOS = validWorkOrders.some(w => w.status === 'in-progress' || w.status === 'done');
  if (hasAuthorizedBudget && !hasInitiatedOS) {
    return 'autorizado';
  }

  // Se todos os orçamentos não deletados forem cancelados ou recusados, e não houver OS ativas
  const activeBudgets = budgets.filter(b => !b.isDeleted);
  if (activeBudgets.length > 0 && activeBudgets.every(b => b.status === 'cancelado' || b.status === 'recusado') && !hasInitiatedOS) {
    return 'cancelado';
  }

  // 5. Se existir apenas atendimento aberto (ou padrão)
  return 'iniciado';
}
