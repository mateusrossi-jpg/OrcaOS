import { supabase } from '../database/supabaseClient';

export class AuthRecoveryService {
  async retryRefresh(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  async clearCorruptedAuth(): Promise<void> {
    // Supabase auth storage clears its own keys on sign out.
    // If it's corrupted, we can force sign out locally without calling the server
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    // Clear any local storage auth keys if needed, but supabase auth js usually handles this.
  }

  async requireLogin(): Promise<void> {
    await this.clearCorruptedAuth();
    // In a real app, this might redirect to login screen or emit an event
    if (typeof window !== 'undefined') {
       window.dispatchEvent(new Event('auth_recovery_login_required'));
    }
  }
}

export const authRecoveryService = new AuthRecoveryService();
