import { useEffect, useState } from 'react';
import { supabase } from '../../../docs/supabaseClient';

export interface SubscriptionData {
  plan: 'free' | 'pro';
  status: string;
  currentPeriodEnd: string | null;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    plan: 'free',
    status: 'inactive',
    currentPeriodEnd: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      setIsLoading(true);
      try {
        // 1. Obtém a sessão do usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // 2. Consulta a tabela de assinaturas no Supabase
        const { data, error } = await supabase
          .from('orcaos_subscriptions')
          .select('plan, status, current_period_end')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar dados do plano:', error.message);
        }

        if (data) {
          setSubscription({
            plan: data.plan as 'free' | 'pro',
            status: data.status,
            currentPeriodEnd: data.current_period_end,
          });
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  return { subscription, isLoading };
}