export interface Client {
  id: string; // UUID
  name: string;
  phone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
