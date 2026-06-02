import type { Client, WorkOrder } from '../core/types/business';

export type AppTab = 'pulse' | 'new-budget' | 'new-quick-service' | 'budgets' | 'work-history' | 'base' | 'money' | 'reports' | 'settings' | 'catalog' | 'store' | 'budgetDetail' | 'clients' | 'attendances';
export type ModuleTone = 'blue' | 'gray' | 'green' | 'orange' | 'muted';
export type AppIconGlyph = 'home' | 'document' | 'clients' | 'finance' | 'chart' | 'settings' | 'store';
export type AppNavItem = { id: AppTab; label: string; description?: string; icon: AppIconGlyph };
export type ModulePlan = 'free' | 'pro' | 'soon';
export type SurveySection = 'context' | 'labor' | 'materials' | 'measurements' | 'notes' | 'review';

export interface ActiveWorkContext {
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}
