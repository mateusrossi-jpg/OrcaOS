import type { AferixAccountState } from '../core/access/accountPlanStorage';

export interface AccountPlanRepository {
  get(): Promise<AferixAccountState | null>;
  save(state: AferixAccountState): Promise<void>;
  clear(): Promise<void>;
}
