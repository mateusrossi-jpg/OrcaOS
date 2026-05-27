import { aferixLogger } from '../debug/aferixLogger';

export type AuditOperation = 'create' | 'update' | 'delete' | 'restore' | 'backup' | 'recovery' | 'queue mutation';

export interface AuditRecord {
  timestamp: string;
  operation: AuditOperation;
  entity: string;
  entityId: string;
  success: boolean;
  durationMs: number;
  warnings?: string[];
}

export const operationAudit = {
  log: (record: AuditRecord) => {
    if (process.env.NODE_ENV !== 'production') {
      aferixLogger.audit('Operation', `[${record.operation.toUpperCase()}] ${record.entity} ${record.entityId} - ${record.success ? 'SUCCESS' : 'FAILED'} (${record.durationMs}ms)`, record);
    }
    // In a future phase, we could persist these locally for extreme forensics.
  }
};
