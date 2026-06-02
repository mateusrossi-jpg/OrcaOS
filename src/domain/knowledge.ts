export type KnowledgeStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface KnowledgeCase {
  id: string;
  companyId: string;
  workspaceId: string;
  title: string;
  description: string;
  assetType?: string;
  manufacturer?: string;
  model?: string;
  failureCode?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: KnowledgeStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeSolution {
  id: string;
  companyId: string;
  caseId: string;
  description: string;
  stepByStep: string[];
  successRate: number; // 0 a 100
  avgRepairTimeMin: number;
  timesReused: number;
  isVerified: boolean;
  authorId: string;
  createdAt: string;
}

export interface KnowledgeRating {
  id: string;
  companyId: string;
  solutionId: string;
  technicianId: string;
  workOrderId: string;
  solved: boolean;
  rating: number; // 1 a 5
  comment?: string;
  createdAt: string;
}

export interface KnowledgeRecommendation {
  id: string;
  companyId: string;
  workOrderId: string;
  anomalyId: string;
  recommendedCaseId: string;
  relevanceScore: number;
  createdAt: string;
}
