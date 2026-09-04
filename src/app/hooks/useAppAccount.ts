import { useAccountPlan } from '../../hooks/useAccountPlan';
import { userPlan as defaultUserPlan } from '../appData';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';

export function useAppAccount() {
  const { account } = useAccountPlan();

  const activeUserPlan = account?.plan ?? defaultUserPlan;

  // Provide a no-op or actual service call for setAccount to maintain compatibility if needed
  const setAccount = (_newState: AferixAccountState) => {
    // Note: To actually update, consumers should use accountPlanService.
    // For legacy compatibility where they passed setAccount down, we do nothing or warn.
    console.warn('setAccount is deprecated. Use accountPlanService methods instead.');
  };

  return {
    account,
    setAccount,
    activeUserPlan
  };
}
