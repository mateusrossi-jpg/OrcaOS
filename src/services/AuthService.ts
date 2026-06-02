import { db, TeamMember } from '../storage/dexieDatabase';

export class AuthService {
  private static readonly ACTIVE_USER_KEY = 'aferix_active_user';

  static async seedDefaultAdmin() {
    const adminExists = await db.teamMembers.where('email').equals('admin@aferix.com').first();
    if (!adminExists) {
      await db.teamMembers.add({
        id: 'admin-123',
        companyId: 'default-company',
        workspaceId: 'default-workspace',
        name: 'Administrador (Dono)',
        email: 'admin@aferix.com',
        role: 'OWNER',
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }

    const soloExists = await db.teamMembers.where('email').equals('solo@aferix.com').first();
    if (!soloExists) {
      await db.teamMembers.add({
        id: 'solo-123',
        companyId: 'solo-company',
        workspaceId: 'solo-workspace',
        name: 'Profissional Autônomo',
        email: 'solo@aferix.com',
        role: 'SOLO',
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }
  }

  static async login(email: string): Promise<TeamMember | null> {
    await this.seedDefaultAdmin();
    
    const user = await db.teamMembers.where('email').equals(email).first();
    
    if (user && user.status === 'active') {
      localStorage.setItem(this.ACTIVE_USER_KEY, JSON.stringify(user));
      localStorage.setItem('aferix_active_role', user.role);
      window.dispatchEvent(new Event('aferix_auth_changed'));
      window.dispatchEvent(new Event('aferix_role_changed'));
      return user;
    }
    
    return null;
  }

  static logout() {
    localStorage.removeItem(this.ACTIVE_USER_KEY);
    localStorage.removeItem('aferix_active_role');
    window.dispatchEvent(new Event('aferix_auth_changed'));
    window.dispatchEvent(new Event('aferix_role_changed'));
  }

  static getActiveUser(): TeamMember | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const data = localStorage.getItem(this.ACTIVE_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  static async createTeamMember(data: Omit<TeamMember, 'id' | 'createdAt'>): Promise<TeamMember> {
    const currentUser = this.getActiveUser();
    // Allow creation if no user exists (first setup) or if current user is admin
    if (currentUser && currentUser.role !== 'OWNER' && currentUser.role !== 'MANAGER') {
      throw new Error('Unauthorized: Only Owners and Managers can create team members.');
    }

    const existing = await db.teamMembers.where('email').equals(data.email).first();
    if (existing) {
      throw new Error('Email already in use.');
    }

    const newMember: TeamMember = {
      ...data,
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };

    await db.teamMembers.add(newMember);
    return newMember;
  }

  static async getTeamMembers(companyId: string): Promise<TeamMember[]> {
    return await db.teamMembers.where('companyId').equals(companyId).toArray();
  }

  static async toggleMemberStatus(id: string): Promise<void> {
    const currentUser = this.getActiveUser();
    if (currentUser?.role !== 'OWNER' && currentUser?.role !== 'MANAGER') {
      throw new Error('Unauthorized');
    }
    const member = await db.teamMembers.get(id);
    if (member) {
      const newStatus = member.status === 'active' ? 'inactive' : 'active';
      await db.teamMembers.update(id, { status: newStatus });
    }
  }
}
