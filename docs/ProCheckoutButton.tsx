import React, { useState } from 'react';
import { supabase } from '../../../docs/supabaseClient';

export const ProCheckoutButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // 1. Obtém o usuário atual e seu ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Você precisa estar autenticado para assinar o plano PRO.');
        setIsLoading(false);
        return;
      }

      // 2. Chama a Edge Function do Supabase que cria a sessão no Stripe
      // Passamos o `userId` para que a função coloque no `metadata` do Stripe
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          userId: user.id,
          email: user.email,
          planName: 'PRO_ANUAL'
        }
      });

      if (error) throw error;

      // 3. A Edge Function devolve a URL da sessão de Checkout recém-criada
      if (data?.url) {
        window.location.href = data.url; // Redireciona o usuário para o Stripe
      } else {
        throw new Error('Falha ao obter o link de pagamento.');
      }
    } catch (err: any) {
      console.error('Erro no fluxo de checkout:', err.message);
      alert('Não foi possível iniciar o pagamento. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout} 
      disabled={isLoading}
      className="w-full py-3 bg-[#2DD4BF] text-[#0A0A0B] font-bold text-xs rounded uppercase tracking-widest transition-colors hover:bg-[#26bba8] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Conectando ao Stripe...' : 'Assinar Aferix PRO'}
    </button>
  );
};