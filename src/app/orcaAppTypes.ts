import type { CalculatorModule } from '../core/access/featureAccess';
import type { Client, WorkOrder } from '../core/types/business';

export type AppTab = 'home' | 'calculations' | 'survey' | 'budgets' | 'catalog' | 'reports' | 'clients' | 'store' | 'settings';
export type ModuleTone = 'blue' | 'gray' | 'green' | 'orange' | 'muted';
export type ModulePlan = 'free' | 'pro' | 'soon';
export type SurveySection = 'context' | 'labor' | 'materials' | 'notes' | 'review';

export type CalculationSectorId =
  | 'electrical'
  | 'hydraulics'
  | 'construction'
  | 'painting'
  | 'financial'
  | 'converters'
  | 'diagnostics';

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

export interface CalculationSectorGroup {
  id: CalculationSectorId;
  title: string;
  description: string;
  icon: string;
  moduleIds: string[];
}

export interface ActiveWorkContext {
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}
