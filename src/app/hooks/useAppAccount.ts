import { useState, useEffect } from 'react';
import {
  loadAccountState,
  ORCA_ACCOUNT_CHANGED_EVENT,
  type OrcaAccountState,
} from '../../core/access/accountPlanStorage';
import { userPlan as defaultUserPlan } from '../orcaAppData';

export function useAppAccount() {
  const [account, setAccount] = useState<OrcaAccountState>(() => loadAccountState());

  useEffect(() => {
    function syncAccount() {
      setAccount(loadAccountState());
    }

    window.addEventListener(ORCA_ACCOUNT_CHANGED_EVENT, syncAccount);
    return () => window.removeEventListener(ORCA_ACCOUNT_CHANGED_EVENT, syncAccount);
  }, []);

  const activeUserPlan = account.plan ?? defaultUserPlan;

  return {
    account,
    setAccount,
    activeUserPlan
  };
}
