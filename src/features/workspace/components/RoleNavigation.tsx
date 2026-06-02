import React from 'react';
import { AferixRole, RoleFeatureMatrix } from '../types/RoleFeatureMatrix';

export const RoleNavigation: React.FC<{ role: AferixRole }> = ({ role }) => {
  const config = RoleFeatureMatrix[role];
  if (!config) return null;

  // Renderiza tabs inferiores com base no papel
  // Simulamos uma renderização dinâmica de navegação
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface-900 border-t border-surface-800 flex p-4 pb-safe justify-around z-50">
      <button className="text-xs font-bold text-white uppercase">Início</button>
      
      {config.features.includes('AGENDA') && (
        <button className="text-xs font-bold text-text-tertiary uppercase">Agenda</button>
      )}
      
      {config.features.includes('PROPOSALS') && (
        <button className="text-xs font-bold text-text-tertiary uppercase">Funil</button>
      )}
      
      {config.features.includes('OPERATIONS') && (
        <button className="text-xs font-bold text-text-tertiary uppercase">Operação</button>
      )}

      {config.features.includes('MRR') && (
        <button className="text-xs font-bold text-text-tertiary uppercase">KPIs</button>
      )}
      
      <button className="text-xs font-bold text-text-tertiary uppercase">Menu</button>
    </div>
  );
};
