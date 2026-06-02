export type DispatchStatus = 'PENDING' | 'ASSIGNED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
export type DispatchPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';

export interface DispatchJob {
  id: string;
  companyId: string;
  workspaceId: string;
  workOrderId: string;
  clientId: string;
  siteId: string;
  status: DispatchStatus;
  priority: DispatchPriority;
  scheduledDate: string;
  estimatedDurationMinutes: number;
  assignedTechnicianId?: string;
  routeAssignmentId?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface TechnicianShift {
  id: string;
  companyId: string;
  workspaceId: string;
  technicianId: string;
  date: string;
  startShift: string;
  endShift: string;
  isActive: boolean;
  maxLoadMinutes: number;
}

export interface RouteAssignment {
  id: string;
  companyId: string;
  workspaceId: string;
  technicianId: string;
  date: string;
  jobsIds: string[];
}

export interface DispatchAlert {
  id: string;
  companyId: string;
  workspaceId: string;
  jobId: string;
  type: 'SLA_BREACH' | 'LATE_ARRIVAL' | 'EMERGENCY' | 'OVERLOAD';
  message: string;
  resolved: boolean;
  createdAt: string;
}

export interface DispatchSuggestion {
  jobId: string;
  suggestedTechnicianId: string;
  confidenceScore: number;
  reasons: string[];
}
