/**
 * Operational Workflow Engine
 * State-driven architecture for Aferix execution predictability and auditability.
 */

import type { BudgetStatus } from '../types/business';

// 1. Core States (Mapped to BudgetStatus)
export type WorkflowState = BudgetStatus;

// 2. Permission System (Future-proof structure)
export type WorkflowRole = 
  | 'admin'
  | 'finance'
  | 'operator'
  | 'technician'
  | 'client-view';

// 3. Allowed Transitions (Deterministic State Machine)
export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  iniciado: ['em_revisao', 'enviado', 'arquivado', 'recusado', 'cancelado'],
  em_revisao: ['iniciado', 'enviado', 'autorizado', 'arquivado', 'recusado', 'cancelado'],
  enviado: ['autorizado', 'em_revisao', 'recusado', 'arquivado', 'cancelado'],
  autorizado: ['em_execucao', 'arquivado', 'cancelado'],
  em_execucao: ['finalizado', 'arquivado', 'cancelado'],
  finalizado: ['arquivado'], // Immutable operational state
  arquivado: ['iniciado'],   // Clone/re-open specific logic
  recusado: ['iniciado'],
  cancelado: ['iniciado'],
  draft: ['sent', 'approved', 'rejected', 'expired', 'cancelled'], // legacy
  sent: ['approved', 'rejected', 'expired', 'cancelled'],
  approved: ['draft'],
  rejected: ['draft'],
  expired: ['draft'],
  cancelled: ['draft'],
};

// 4. Action Authority & Locks (State Machine Rules)
export type OperationalLock = {
  canEditCriticalValues: boolean; // Preço, escopo
  canEditOperational: boolean;    // Datas, notas técnicas
  canExport: boolean;             // Gerar PDF, enviar
  canAccount: boolean;            // Faturamento/Financeiro
};

export const STATE_AUTHORITY: Record<string, OperationalLock> = {
  iniciado: { canEditCriticalValues: true, canEditOperational: true, canExport: true, canAccount: false },
  em_revisao: { canEditCriticalValues: true, canEditOperational: true, canExport: true, canAccount: false },
  enviado: { canEditCriticalValues: false, canEditOperational: true, canExport: true, canAccount: false },
  autorizado: { canEditCriticalValues: false, canEditOperational: true, canExport: true, canAccount: false },
  em_execucao: { canEditCriticalValues: false, canEditOperational: true, canExport: true, canAccount: false },
  finalizado: { canEditCriticalValues: false, canEditOperational: false, canExport: true, canAccount: true },
  arquivado: { canEditCriticalValues: false, canEditOperational: false, canExport: true, canAccount: false },
  recusado: { canEditCriticalValues: false, canEditOperational: false, canExport: true, canAccount: false },
  cancelado: { canEditCriticalValues: false, canEditOperational: false, canExport: true, canAccount: false },
  // legacy
  draft: { canEditCriticalValues: true, canEditOperational: true, canExport: true, canAccount: false },
  sent: { canEditCriticalValues: false, canEditOperational: true, canExport: true, canAccount: false },
  approved: { canEditCriticalValues: false, canEditOperational: true, canExport: true, canAccount: false },
  rejected: { canEditCriticalValues: false, canEditOperational: false, canExport: true, canAccount: false },
  expired: { canEditCriticalValues: false, canEditOperational: false, canExport: true, canAccount: false },
  cancelled: { canEditCriticalValues: false, canEditOperational: false, canExport: true, canAccount: false },
};

// 5. Audit Trail & Event Sourcing Concepts
export type WorkflowActionType = 
  | 'state_change' 
  | 'critical_value_update' 
  | 'operational_update'
  | 'client_viewed';

export interface WorkflowEvent {
  id: string;
  timestamp: string; // ISO 8601
  action: WorkflowActionType;
  operatorId: string; // user id
  operatorRole: WorkflowRole;
  previousState?: WorkflowState;
  newState?: WorkflowState;
  changes?: Record<string, { old: unknown; new: unknown }>;
}

export interface WorkflowAuditTrail {
  entityId: string;
  createdAt: string;
  events: WorkflowEvent[];
}

// 6. Queue Priority Engine Config
export type QueueUrgency = 'normal' | 'high' | 'critical';

export interface QueueMetadata {
  urgency: QueueUrgency;
  isBlocked: boolean;
  blockedReason?: string;
  overdueDate?: string;
  pendingApprovals: WorkflowRole[];
}

// Validation Logic
export function validateTransition(from: string, to: string, role: WorkflowRole): boolean {
  // Check strict state machine paths
  if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
    return false;
  }
  
  // Example Role Locks (Architecture proof)
  if (to === 'finalizado' && role === 'technician') {
    return false; // Only admin/operator/finance can finalize financial impacts
  }
  
  return true;
}

export function getActionBlockReason(state: string, action: keyof OperationalLock): string | null {
  const authority = STATE_AUTHORITY[state];
  if (!authority) return 'Estado desconhecido.';
  
  if (!authority[action]) {
    switch (action) {
      case 'canEditCriticalValues': return 'Valores bloqueados. O orçamento já avançou no fluxo operacional.';
      case 'canEditOperational': return 'Orçamento finalizado ou arquivado. Edição bloqueada.';
      case 'canAccount': return 'Aguardando finalização da OS para contabilizar.';
      default: return 'Ação bloqueada neste estágio do fluxo.';
    }
  }
  return null;
}
