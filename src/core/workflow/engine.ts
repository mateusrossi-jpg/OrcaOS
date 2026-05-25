/**
 * Operational Workflow Engine
 * State-driven architecture for Aferix execution predictability and auditability.
 */

// 1. Core States
export type WorkflowState = 
  | 'draft'       // Rascunho
  | 'review'      // Revisão
  | 'sent'        // Enviado
  | 'authorized'  // Autorizado
  | 'execution'   // Execução
  | 'finalized'   // Finalizado
  | 'archived';   // Arquivado

// 2. Permission System (Future-proof structure)
export type WorkflowRole = 
  | 'admin'
  | 'finance'
  | 'operator'
  | 'technician'
  | 'client-view';

// 3. Allowed Transitions (Deterministic State Machine)
export const ALLOWED_TRANSITIONS: Record<WorkflowState, WorkflowState[]> = {
  draft: ['review', 'sent', 'archived'],
  review: ['draft', 'sent', 'authorized', 'archived'],
  sent: ['authorized', 'review', 'archived'],
  authorized: ['execution', 'archived'],
  execution: ['finalized', 'archived'],
  finalized: ['archived'], // Immutable operational state
  archived: ['draft']      // Clone/re-open specific logic
};

// 4. Action Authority & Locks (State Machine Rules)
export type OperationalLock = {
  canEditCriticalValues: boolean; // Preço, escopo
  canEditOperational: boolean;    // Datas, notas técnicas
  canExport: boolean;             // Gerar PDF, enviar
  canAccount: boolean;            // Faturamento/Financeiro
};

export const STATE_AUTHORITY: Record<WorkflowState, OperationalLock> = {
  draft: { canEditCriticalValues: true, canEditOperational: true, canExport: true, canAccount: false },
  review: { canEditCriticalValues: true, canEditOperational: true, canExport: true, canAccount: false },
  sent: { canEditCriticalValues: false, canEditOperational: true, canExport: true, canAccount: false },
  authorized: { canEditCriticalValues: false, canEditOperational: true, canExport: true, canAccount: false },
  execution: { canEditCriticalValues: false, canEditOperational: true, canExport: true, canAccount: false },
  finalized: { canEditCriticalValues: false, canEditOperational: false, canExport: true, canAccount: true },
  archived: { canEditCriticalValues: false, canEditOperational: false, canExport: true, canAccount: false },
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
  changes?: Record<string, { old: any; new: any }>;
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
export function validateTransition(from: WorkflowState, to: WorkflowState, role: WorkflowRole): boolean {
  // Check strict state machine paths
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    return false;
  }
  
  // Example Role Locks (Architecture proof)
  if (to === 'finalized' && role === 'technician') {
    return false; // Only admin/operator/finance can finalize financial impacts
  }
  
  return true;
}

export function getActionBlockReason(state: WorkflowState, action: keyof OperationalLock): string | null {
  const authority = STATE_AUTHORITY[state];
  if (!authority[action]) {
    switch (action) {
      case 'canEditCriticalValues': return 'Edição bloqueada. Orçamento não está em Rascunho/Revisão.';
      case 'canEditOperational': return 'Orçamento finalizado. Edição bloqueada.';
      case 'canAccount': return 'Aguardando finalização da OS para contabilizar.';
      default: return 'Ação bloqueada neste estágio do fluxo.';
    }
  }
  return null;
}
