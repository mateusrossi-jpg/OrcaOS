import { vi } from 'vitest';
import type { AferixAccountState } from '../core/access/accountPlanStorage';
import type { AccountPlanRepository } from '../repositories/accountPlanRepository';

let memoryState: AferixAccountState | null = null;

export const mockAccountPlanRepository: AccountPlanRepository = {
  async get() {
    return memoryState;
  },
  async save(state: AferixAccountState) {
    memoryState = { ...state };
  },
  async clear() {
    memoryState = null;
  }
};

vi.mock('../repositories/dexieAccountPlanRepository', () => ({
  accountPlanRepository: mockAccountPlanRepository
}));
