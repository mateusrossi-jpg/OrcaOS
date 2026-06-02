export type TechnicalReturnStatus = 'pending' | 'in-progress' | 'done' | 'archived';

export interface TechnicalReturn {
  id: string;
  originalWorkOrderId: string; // Source of truth: A OS que originou o retorno
  clientId: string;            // [DERIVADO/CACHE] Desnormalizado para acesso rápido no CRM
  siteId?: string;             // [DERIVADO/CACHE] Onde o retorno será executado (herdado da OS)
  status: TechnicalReturnStatus;
  description: string;         // Qual é o defeito ou motivo do retorno?
  costEstimate: number;        // Custo estimado do retrabalho (tempo + material) - Custo oculto, não faturado
  scheduledAt?: string;        // Data de agendamento do retorno
  createdAt: string;
  resolvedAt?: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;
}
