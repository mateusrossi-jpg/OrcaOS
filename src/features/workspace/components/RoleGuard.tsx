import React from 'react';
import { AferixRole, RoleFeatureMatrix } from '../types/RoleFeatureMatrix';

export const RoleGuard: React.FC<{ role: AferixRole; requiredFeature: string; children: React.ReactNode }> = ({ role, requiredFeature, children }) => {
  const config = RoleFeatureMatrix[role];
  if (!config) return null;
  
  if (!config.features.includes(requiredFeature)) {
    return null;
  }

  return <>{children}</>;
};
