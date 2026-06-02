import { useState, useEffect } from 'react';
import { AferixRole } from '../features/workspace/types/RoleFeatureMatrix';
import { AuthService } from '../services/AuthService';

export function useRole() {
  const [role, setRoleState] = useState<AferixRole>(() => {
    if (typeof window === 'undefined') return 'OWNER';
    const user = AuthService.getActiveUser();
    return (user?.role as AferixRole) || 'OWNER';
  });

  const [hasSelectedRole, setHasSelectedRole] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!AuthService.getActiveUser();
  });

  // Keeping setRole for backward compatibility, but in a real scenario
  // this is managed via Login/AuthService.
  const setRole = (newRole: AferixRole) => {
    // This is essentially overridden by AuthService.login now.
    // Left here just in case any legacy component calls it directly before being refactored.
    console.warn("setRole called directly. Use AuthService instead.");
  };

  useEffect(() => {
    const handleAuthChange = () => {
      const user = AuthService.getActiveUser();
      if (user) {
        setRoleState(user.role as AferixRole);
        setHasSelectedRole(true);
      } else {
        setHasSelectedRole(false);
      }
    };
    
    window.addEventListener('aferix_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('aferix_auth_changed', handleAuthChange);
    };
  }, []);

  return { role, setRole, hasSelectedRole, user: AuthService.getActiveUser() };
}
