import type { Client, WorkOrder } from '../core/types/business';

export type AppTab = 'home' | 'clients' | 'financial' | 'settings' | 'calculations' | 'survey' | 'budgets' | 'catalog' | 'purchaseList' | 'reports' | 'store';
export type ModuleTone = 'blue' | 'gray' | 'green' | 'orange' | 'muted';
export type ModulePlan = 'free' | 'pro' | 'soon';
export type SurveySection = 'context' | 'labor' | 'materials' | 'measurements' | 'notes' | 'review';

export interface ActiveWorkContext {
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}
