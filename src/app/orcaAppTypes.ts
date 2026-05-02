import type { CalculatorModule } from '../core/access/featureAccess';
import type { Client, WorkOrder } from '../core/types/business';

export type AppTab = 'home' | 'calculations' | 'survey' | 'budgets' | 'reports' | 'clients' | 'store' | 'settings';
export type ModuleTone = 'blue' | 'gray' | 'green' | 'orange' | 'muted';
export type ModulePlan = 'free' | 'pro' | 'soon';
export type SurveySection = 'context' | 'labor' | 'materials' | 'notes' | 'review';
export type BudgetSection = 'workspace' | 'technical';

export type CalculationProfessionId =
  | 'electrician'
  | 'plumber'
  | 'builder'
  | 'painting'
  | 'generalTechnician';

export interface ModuleCardData {
  id: string;
  title: string;
  description: string;
  icon: string;
  tone: ModuleTone;
  count: string;
  available: boolean;
  plan: ModulePlan;
  calculatorModule?: CalculatorModule;
}

export interface CalculationProfessionGroup {
  id: CalculationProfessionId;
  title: string;
  description: string;
  icon: string;
  moduleIds: string[];
}

export interface ActiveWorkContext {
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}
