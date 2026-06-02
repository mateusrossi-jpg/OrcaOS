export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface InventoryItem {
  id: string;
  companyId: string;
  workspaceId: string;
  sku: string;
  name: string;
  category: string;
  quantityOnHand: number;
  minimumStock: number;
  unitCost: number;
  status: StockStatus;
  supplierId?: string;
  lastUpdated: string;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';

export interface StockMovement {
  id: string;
  companyId: string;
  workspaceId: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  referenceId?: string; // OS, Proposal, Purchase Order, etc.
  date: string;
}

export interface Warehouse {
  id: string;
  companyId: string;
  workspaceId: string;
  name: string;
  location: string;
  isMain: boolean;
}

export interface PurchaseRequest {
  id: string;
  companyId: string;
  workspaceId: string;
  itemId: string;
  requestedQuantity: number;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'FULFILLED' | 'REJECTED';
  reason: string;
  requestedBy: string;
  requestedAt: string;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  workspaceId: string;
  supplierId: string;
  requests: string[]; // PurchaseRequest IDs
  totalAmount: number;
  status: 'PENDING' | 'SENT' | 'PARTIAL' | 'DELIVERED' | 'CANCELLED';
  expectedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  companyId: string;
  workspaceId: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  rating: number; // 0 to 5
  leadTimeDays: number;
  createdAt: string;
}

export interface InventoryReservation {
  id: string;
  companyId: string;
  workspaceId: string;
  itemId: string;
  quantity: number;
  proposalId?: string;
  workOrderId?: string;
  status: 'ACTIVE' | 'CONSUMED' | 'CANCELLED';
  createdAt: string;
}
