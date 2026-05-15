import type { CalculationCapture, CalculationDestination, TechnicalItemType } from '../../../core/types/workflow';

export type GuidedCartMode = 'catalog' | 'manual' | 'parts' | 'all';
export type GuidedEntryKind = 'labor' | 'manual-part' | 'catalog-part' | 'kit';
export type KitId = 'simple-outlet-4x2' | 'double-outlet-4x2' | 'simple-switch-4x2' | 'lighting-point' | 'spot-led' | 'ac-dedicated-circuit' | 'external-outlet';

export interface GuidedBudgetCartProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
  mode?: GuidedCartMode;
}

export interface GuidedLine {
  id: string;
  kind: GuidedEntryKind;
  environment: string;
  description: string;
  quantity: number;
  unitValue: number;
  itemType: TechnicalItemType;
  destination: CalculationDestination;
  note: string;
  brand?: string;
  model?: string;
}

export interface KitTemplate {
  id: KitId;
  title: string;
  description: string;
  defaultQuantity: string;
  generate: (quantity: number, brand: string, destination: CalculationDestination) => Array<Omit<GuidedLine, 'id' | 'environment'>>;
}
