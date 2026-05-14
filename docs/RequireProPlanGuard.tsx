import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

export const RequireProPlanGuard: React.FC = () => {
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-sm font-medium text-[#2DD4BF] tracking-widest uppercase">
        Validando acesso Pro...
      </div>
    );
  }

  // Se o usuário NÃO for PRO, redireciona para a vitrine de planos para assinar
  if (subscription.plan !== 'pro') {
    return <Navigate to="/planos" replace />;
  }

  // Se for PRO, libera o acesso à rota solicitada
  return <Outlet />;
};