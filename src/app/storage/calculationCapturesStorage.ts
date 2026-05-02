import type { CalculationCapture, CalculationDestination } from '../../core/types/workflow';

const CAPTURES_STORAGE_KEY = 'orcaos:calculation-captures:v1';

function isCalculationDestination(value: unknown): value is CalculationDestination {
  return value === 'survey' || value === 'budget' || value === 'both';
}

function isCalculationCapture(value: unknown): value is CalculationCapture {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CalculationCapture>;
  return typeof item.id === 'string' && typeof item.summary === 'string' && typeof item.module === 'string' && typeof item.moduleLabel === 'string' && typeof item.calculatorLabel === 'string' && isCalculationDestination(item.destination) && typeof item.createdAt === 'string' && Array.isArray(item.details);
}

export function loadStoredCaptures(): CalculationCapture[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(CAPTURES_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isCalculationCapture) : [];
  } catch {
    return [];
  }
}

export function saveStoredCaptures(captures: CalculationCapture[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CAPTURES_STORAGE_KEY, JSON.stringify(captures));
}
