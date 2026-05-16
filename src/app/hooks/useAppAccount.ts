import { useState, useEffect } from 'react';
import {
  loadAccountState,
  AFERIX_ACCOUNT_CHANGED_EVENT,
  type AferixAccountState,
} from '../../core/access/accountPlanStorage';
import { userPlan as defaultUserPlan } from '../appData';

export function useAppAccount() {
  const [account, setAccount] = useState<AferixAccountState>(() => loadAccountState());

  useEffect(() => {
    function syncAccount() {
      setAccount(loadAccountState());
    }

    window.addEventListener(AFERIX_ACCOUNT_CHANGED_EVENT, syncAccount);
    return () => window.removeEventListener(AFERIX_ACCOUNT_CHANGED_EVENT, syncAccount);
  }, []);

  const activeUserPlan = account.plan ?? defaultUserPlan;

  return {
    account,
    setAccount,
    activeUserPlan
  };
}
