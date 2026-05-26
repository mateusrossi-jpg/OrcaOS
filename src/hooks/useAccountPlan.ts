import { useState, useEffect, useCallback } from 'react';
import { accountPlanService } from '../services/accountPlanService';
import { AFERIX_ACCOUNT_CHANGED_EVENT, type AferixAccountState } from '../core/access/accountPlanStorage';

export type AccountPlanHookStatus = 'loading' | 'free' | 'premium' | 'expired';

export interface UseAccountPlanResult {
  status: AccountPlanHookStatus;
  account: AferixAccountState | null;
  isLoading: boolean;
}

export function useAccountPlan(): UseAccountPlanResult {
  const [account, setAccount] = useState<AferixAccountState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAccount = useCallback(async () => {
    try {
      const data = await accountPlanService.getAccount();
      setAccount(data);
    } catch (error) {
      console.error('Failed to load account plan:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAccount();
    window.addEventListener(AFERIX_ACCOUNT_CHANGED_EVENT, refreshAccount);
    return () => window.removeEventListener(AFERIX_ACCOUNT_CHANGED_EVENT, refreshAccount);
  }, [refreshAccount]);

  if (!account) {
    return {
      status: 'loading',
      account: null,
      isLoading: true,
    };
  }

  let status: AccountPlanHookStatus = 'free';

  if (account.plan === 'pro') {
    if (account.planStatus === 'expired' || account.planStatus === 'past_due') {
      status = 'expired';
    } else {
      status = 'premium';
    }
  }

  return {
    status,
    account,
    isLoading,
  };
}
