import type { Client, WorkOrder } from '../core/types/business';

export type AppTab = 'home' | 'new-budget' | 'budgets' | 'budget-history' | 'clients' | 'financial' | 'reports' | 'settings' | 'catalog' | 'store';
export type ModuleTone = 'blue' | 'gray' | 'green' | 'orange' | 'muted';
export type AppNavItem = { id: AppTab; label: string; description: string; icon: string };
export type ModulePlan = 'free' | 'pro' | 'soon';
export type SurveySection = 'context' | 'labor' | 'materials' | 'measurements' | 'notes' | 'review';

export interface ActiveWorkContext {
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}
