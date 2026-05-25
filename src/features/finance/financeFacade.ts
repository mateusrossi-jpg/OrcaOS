import { loadSimpleFinanceRecords, SimpleFinanceRecord } from './storage/simpleFinanceStorage';

/**
 * FinanceFacade: Public entry point for Finance domain.
 * Prevents direct access to internal storage by other features.
 */
export const FinanceFacade = {
  getRealizedRecords: (): SimpleFinanceRecord[] => {
    return loadSimpleFinanceRecords();
  }
};
