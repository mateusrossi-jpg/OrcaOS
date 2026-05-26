export type TraceSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export type DiagnosticType = 
  | 'REPLAY' 
  | 'TRANSPORT' 
  | 'AUTOMATION' 
  | 'NOTIFICATION' 
  | 'PROJECTION' 
  | 'SYNC' 
  | 'HYDRATION' 
  | 'DEAD_LETTER';

export interface TraceEnvelope {
  readonly traceId: string;
  readonly correlationId?: string;
  readonly tenantId: string;
  readonly deviceId: string;
  readonly aggregateId?: string;
  readonly aggregateType?: string;
  readonly eventType?: string;
  readonly sourceLayer: string;
  readonly targetLayer: string;
  readonly timestamp: string;
  readonly sequence?: number;
  readonly severity: TraceSeverity;
  readonly diagnosticType: DiagnosticType;
  readonly message: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface DeadLetterEnvelope {
  readonly deadLetterId: string;
  readonly originalEnvelope: unknown;
  readonly reason: string;
  readonly timestamp: string;
  readonly sourceLayer: string;
}
