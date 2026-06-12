import type { Client, WorkOrder } from '../core/types/business';

export type AppTab = string; // Migrated to dynamic string to support Multi-Profile Workspaces
export type ModuleTone = 'blue' | 'gray' | 'green' | 'orange' | 'muted';
export type AppIconGlyph = 'home' | 'document' | 'clients' | 'finance' | 'chart' | 'settings' | 'store';
export type AppNavItem = { id: AppTab; label: string; description?: string; icon: AppIconGlyph };
export type ModulePlan = 'free' | 'pro' | 'soon';
export type SurveySection = 'context' | 'labor' | 'materials' | 'measurements' | 'notes' | 'review';

export interface ActiveWorkContext {
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}
