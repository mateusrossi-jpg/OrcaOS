import type { CalculationCapture, CalculationDestination } from '../../core/types/workflow';
import { safeJsonParse, safeArray } from '../../core/runtime/safeGuards';

// LEGACY: Keep orcaos prefix for backward compatibility with existing user data.
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
    // eslint-disable-next-line no-restricted-syntax -- Legacy localStorage bridge (migration-only)
    const stored = window.localStorage.getItem(CAPTURES_STORAGE_KEY);
    const parsed = safeJsonParse<unknown[]>(stored, []);
    return safeArray(parsed).filter(isCalculationCapture);
  } catch {
    return [];
  }
}
