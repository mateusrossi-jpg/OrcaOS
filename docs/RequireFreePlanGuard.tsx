import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

export const RequireFreePlanGuard: React.FC = () => {
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-sm font-medium text-slate-500 tracking-widest uppercase">
        Verificando assinatura...
      </div>
    );
  }

  // Se o usuário já for PRO, redireciona de volta para o painel principal (Dashboard)
  if (subscription.plan === 'pro') {
    return <Navigate to="/" replace />;
  }

  // Se for Free, permite a renderização das rotas filhas (ex: PlansPage)
  return <Outlet />;
};