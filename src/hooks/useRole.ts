import { useState, useEffect } from 'react';
import { AferixRole } from '../features/workspace/types/RoleFeatureMatrix';
import { AuthService } from '../services/AuthService';

export function useRole() {
  const [role, setRoleState] = useState<AferixRole>('SOLO');
  const [hasSelectedRole, setHasSelectedRole] = useState(true);

  // setRole is disabled to lock into SOLO
  const setRole = (newRole: AferixRole) => {
    console.warn("Perfil/Workspace alterado, mas bloqueado no modo SOLO por segurança.");
  };

  useEffect(() => {
    // FORCE SOLO ON LOAD
    const user = AuthService.getActiveUser();
    if (!user || user.role !== 'SOLO') {
      AuthService.impersonateRole('SOLO');
    }
    setRoleState('SOLO');
    setHasSelectedRole(true);

    const handleAuthChange = () => {
      setRoleState('SOLO');
      setHasSelectedRole(true);
    };
    
    window.addEventListener('aferix_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('aferix_auth_changed', handleAuthChange);
    };
  }, []);

  return { role: 'SOLO' as AferixRole, setRole, hasSelectedRole, user: AuthService.getActiveUser() };
}
