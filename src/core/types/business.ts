export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  category: 'labor' | 'material' | 'other';
}

export interface Budget {
  id: string;
  clientId?: string;
  title: string;
  items: BudgetItem[];
  discount?: number;
  notes?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
}

export interface WorkOrder {
  id: string;
  clientId?: string;
  title: string;
  description?: string;
  status: 'open' | 'scheduled' | 'in-progress' | 'done' | 'cancelled';
  scheduledDate?: string;
}
