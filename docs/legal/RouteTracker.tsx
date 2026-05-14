import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsService } from './analyticsService';

export const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Dispara o evento genérico e seguro de visualização de tela 
    // sempre que o usuário navegar para uma URL diferente.
    AnalyticsService.logScreenView(location.pathname);
  }, [location]); // O array de dependências com 'location' garante o disparo a cada mudança

  // Como é um componente focado apenas em ciclo de vida, não renderiza UI.
  return null;
};