export interface TeamMember {
  id: string;
  companyId: string;
  workspaceId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'SALES' | 'FIELD' | 'CUSTOMER' | 'SOLO';
  status: 'active' | 'inactive';
  createdAt: string;
}