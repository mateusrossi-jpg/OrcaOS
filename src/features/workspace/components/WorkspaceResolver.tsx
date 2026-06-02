import React from 'react';
import { AferixRole } from '../types/RoleFeatureMatrix';
import { FieldWorkspace } from '../screens/FieldWorkspace';
import { SalesWorkspace } from '../screens/SalesWorkspace';
import { ManagerWorkspace } from '../screens/ManagerWorkspace';
import { OwnerWorkspace } from '../screens/OwnerWorkspace';

export const WorkspaceResolver: React.FC<{ role: AferixRole }> = ({ role }) => {
  switch (role) {
    case 'FIELD':
      return <FieldWorkspace />;
    case 'SALES':
      return <SalesWorkspace />;
    case 'MANAGER':
      return <ManagerWorkspace />;
    case 'OWNER':
      return <OwnerWorkspace />;
    case 'CUSTOMER':
      return <div className="text-white p-6">Redirecionando para Portal do Cliente...</div>;
    default:
      return <div className="text-white p-6">Acesso Negado.</div>;
  }
};
