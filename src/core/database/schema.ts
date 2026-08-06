/**
 * Aferix OS - Database Schema (Offline-First)
 * Representação das tabelas e entidades principais do sistema.
 */

export type SyncStatus = 'synced' | 'pending' | 'error';
export type TransactionType = 'income' | 'expense';

// ─── TIPOS CENTRAIS DE STATUS ─────────────────────────────────────────────────
/** Status canônico único do ciclo de vida de um orçamento/OS */
export type WorkOrderStatus =
  | 'draft'
  | 'sent'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

/**
 * Retorna true para status que representam uma OS pronta para campo:
 * approved, in_progress ou completed.
 * Use sempre essa função em vez de comparações de string hardcoded.
 */
export function isFieldReady(status: WorkOrderStatus): boolean {
  return status === 'approved' || status === 'in_progress' || status === 'completed';
}

/** Retorna true para status que devem ser contabilizados no caixa como receita */
export function countsAsRevenue(status: WorkOrderStatus): boolean {
  return status === 'approved' || status === 'completed';
}

// 1. COMPANY SETTINGS (Configurações da Empresa)
export interface CompanySettings {
  id: string; // UUID
  name: string;
  logo_url?: string;
  city?: string;
  default_tax_rate: number; // Float
  default_margin: number; // Float
  default_cost_per_km_cents: number; // Integer
  default_hourly_rate_cents: number; // Integer
}

// 2. CUSTOMERS (Aba Clientes)
export interface Customer {
  id: string; // UUID
  name: string;
  phone: string; // Para o botão Teal do WhatsApp
  is_vip: boolean; // Tag de status
  total_ltv: number; // Decimal: Faturamento acumulado (cache atualizado por triggers)
  created_at: string; // Timestamp
  updated_at?: string;
  version?: number;
  conflict_state?: 'ok' | 'conflict' | 'resolved';
}

// 3. CATALOG (Aba Menu > Insumos e Serviços)
export interface CatalogItem {
  id: string; // UUID
  name: string; // Ex: "ESP32", "Módulo Relé"
  type: 'material' | 'service';
  cost_price_cents: number; // Integer: Preço de custo base em centavos
  tax_rate_percent: number; // Float: Carga tributária embutida
  desired_margin_percent: number; // Float: Margem de lucro desejada (%)
  sale_price_cents: number; // Integer: Preço de venda calculado
  stock_quantity: number; // Integer: Quantidade em estoque (0 para serviços)
}

// 4. WORK_ORDERS (Orçamentos e OS)
export interface WorkOrder {
  id: string; // UUID
  customer_id: string; // UUID - FK -> Customer.id
  title: string; // Ex: "Manutenção - Painel"
  status: WorkOrderStatus;
  scheduled_date?: string; // Date: Para o Card "Próximo Atendimento" (legado)
  address?: string; // Para o botão de GPS
  displacement_km: number; // Float
  displacement_cost_per_km_cents: number; // Integer
  labor_hours: number; // Float
  labor_hourly_rate_cents: number; // Integer
  total_cost_cents: number; // Integer: Somatório de insumos + deslocamento + mão de obra
  total_price_cents: number; // Integer: Preço total de venda
  real_margin_cents: number; // Integer: O valor OURO no rodapé (Total Price - Total Cost)
  created_at: string; // Timestamp
  // ── Campos de Agendamento de Campo (opcionais) ─────────────────────────────
  /** Data/hora de início do atendimento agendado (ISO 8601) */
  scheduled_start?: string;
  /** Data/hora prevista de término (ISO 8601, opcional) */
  scheduled_end?: string;
  /** FK para team_members — responsável pelo atendimento */
  assigned_to_id?: string;
  /** Endereço do local de execução (pode divergir do endereço do cliente) */
  service_address?: string;
  updated_at?: string;
  version?: number;
  conflict_state?: 'ok' | 'conflict' | 'resolved' | 'pending_resolution';
  remote_version?: number;
  remote_snapshot?: any; // JSON with remote state
}

// 5. WORK_ORDER_ITEMS (Itens dentro do orçamento)
export interface WorkOrderItem {
  id: string; // UUID
  work_order_id: string; // UUID - FK -> WorkOrder.id
  catalog_item_id: string; // UUID - FK -> CatalogItem.id
  custom_name?: string; // Nome do item avulso se não estiver no catálogo
  is_custom?: boolean; // Flag de item avulso
  quantity: number; // Decimal
  unit_cost: number; // Decimal: Congelado no momento da adição
  unit_price: number; // Decimal: Congelado no momento da adição
}

// 6. FINANCIAL_TRANSACTIONS (Aba Financeiro / DRE)
export interface FinancialTransaction {
  id: string; // UUID
  type: TransactionType; // Income (Teal), Expense (Cinza/Branco)
  category: string; // Ex: 'Despesa Fixa', 'Materiais', etc.
  description: string; // Ex: "CPFL Paulista"
  amount_cents: number; // Integer: tabular-nums requirement
  due_date: string; // Date
  is_paid: boolean;
  payment_method?: 'pix' | 'cash' | 'credit_card' | 'other';
  work_order_id?: string; // UUID - FK - Nullable: Liga o pagamento a uma OS aprovada
  created_at?: string;
  updated_at?: string;
}

export interface SyncOutboxItem {
  id?: number;          // Auto-incremento local para ordem da fila
  uuid: string;         // ID único da mutação (idempotency key)
  table_name: string;   // Tabela afetada (ex: 'work_orders', 'catalog_items')
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: Record<string, any>; // Dados completos do registro
  created_at: number;   // Timestamp em milissegundos
  retry_count?: number; // Contagem de retentativas
  last_error?: string;  // Mensagem do último erro
  error_category?: 'retryable_error' | 'validation_error' | 'conflict_error' | 'auth_error'; // Classificação do erro
  status?: 'pending' | 'dead_letter'; // Status do processamento
}

// 8. WORK_ORDER_EQUIPMENT (Dados do Ativo / Equipamento)
export interface WorkOrderEquipment {
  id: string;            // UUID
  work_order_id: string; // FK -> WorkOrder.id
  brand: string;         // Marca / Fabricante
  model: string;         // Modelo
  serial_number: string; // Número de Série / Patrimônio
  created_at: string;    // Timestamp
}

// 9. WORK_ORDER_MEDIA (Evidências Fotográficas)
export interface WorkOrderMedia {
  id: string;            // UUID
  work_order_id: string; // FK -> WorkOrder.id
  file_name: string;     // Nome original do arquivo
  mime_type: string;     // Ex: 'image/jpeg'
  size_bytes: number;    // Tamanho do arquivo
  checksum?: string;     // Para validação de integridade
  storage_path?: string; // Caminho remoto no bucket
  created_at: string;    // Timestamp
  sync_status: 'pending_upload' | 'synced' | 'conflict' | 'deleted_pending_cleanup' | 'metadata_only';
}

export type MediaDownloadStatus = 'queued' | 'downloading' | 'completed' | 'failed' | 'blocked_quota';

export interface MediaDownloadJob {
  id: string; // uuid
  media_id: string;
  tenant_id: string;
  status: MediaDownloadStatus;
  priority: number; // 1 (alta) a 3 (baixa)
  attempts: number;
  bytes_downloaded: number;
  total_bytes: number;
  last_error?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface MediaChunk {
  id: string; // media_id + '_' + index
  media_id: string;
  chunk_index: number;
  data: ArrayBuffer;
}

// 10. WORK_ORDER_SCHEDULES (Agenda Inteligente de Campo)
export interface WorkOrderSchedule {
  id: string;               // UUID
  work_order_id: string;    // FK -> WorkOrder.id
  customer_id: string;      // Desnormalizado para queries de agenda sem join
  /** Data/hora de início do atendimento (ISO 8601) */
  starts_at: string;
  /** Data/hora prevista de término (ISO 8601) */
  ends_at: string;
  /** Duração estimada em minutos (derivado de ends_at - starts_at) */
  duration_minutes: number;
  /** Status de confirmação do agendamento */
  confirmation_status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled';
  /** Endereço do atendimento (espelhado da OS para acesso ágil) */
  address?: string;
  /** Notas privadas do técnico para o atendimento */
  technician_notes?: string;
  /** Chave de recorrência — nulo = avulso, string = grupo de recorrência */
  recurrence_group_id?: string;
  /** Padrão de recorrência semanal: ex. ['mon', 'wed', 'fri'] */
  recurrence_days?: string[];
  created_at: string;       // Timestamp
  updated_at: string;       // Timestamp
}

// 11. PIX_SETTINGS (Configuração de Chave Pix da Empresa)
export interface PixSettings {
  id: string;               // UUID (sempre '1' — singleton por instalação)
  /** Tipo da chave Pix */
  key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  /** Valor da chave Pix */
  key_value: string;
  /** Nome do beneficiário como aparece no QR Code */
  beneficiary_name: string;
  /** Cidade do beneficiário */
  beneficiary_city?: string;
  updated_at: string;
}

export type CorporateRole = 'owner' | 'autonomous' | 'sales' | 'field_technician' | 'stock_manager';

// 12. TEAM_MEMBERS (Equipe de Campo)
export interface TeamMember {
  id: string;      // UUID
  name: string;    // Nome do técnico/responsável
  role: CorporateRole;    // Ex: 'Técnico', 'Assistente', 'Proprietário'
  active: boolean; // Permite desativar sem excluir
}

// 13. STOCK_RESERVATIONS (Reserva de Estoque por OS)
export interface StockReservation {
  id: string;           // UUID
  /** FK -> WorkOrder.id */
  work_order_id: string;
  /** FK -> CatalogItem.id */
  item_id: string;
  /** Quantidade reservada no momento da aprovação */
  quantity: number;
  /**
   * - active:   reserva criada ao aprovar a OS
   * - released: reserva liberada ao cancelar, reverter ou rascunhar a OS
   * - consumed:  reserva consumida ao concluir a OS (baixa física realizada)
   */
  status: 'active' | 'released' | 'consumed';
  created_at: string; // Timestamp ISO 8601
}

// 14. SYNC_CURSORS (Ponteiros de sincronização para paginação multi-tenant)
export interface SyncCursor {
  id: string; // tenant_id + '_' + table_name
  tenant_id: string;
  table_name: string;
  last_updated_at: string;
  last_processed_id: string;
  updated_at: string;
}

export type BootstrapState = 'idle' | 'downloading' | 'staging' | 'validating' | 'committing' | 'completed' | 'error';

// 15. BOOTSTRAP_JOBS (Gerenciamento do primeiro download)
export interface BootstrapJob {
  id: string; // tenant_id + '_' + phase
  tenant_id: string;
  phase: string;
  status: BootstrapState;
  total_records: number;
  processed_records: number;
  cursor: { updated_at: string; id: string } | null;
  started_at: string;
  completed_at?: string;
}

// 16. BOOTSTRAP STAGING (Reconstrução Agregada)
export interface BootstrapWorkOrder {
  id: string; // uuid
  tenant_id: string;
  payload: WorkOrder;
  received_at: string;
  bootstrap_batch_id: string;
}

export interface BootstrapWorkOrderItem {
  id: string; // uuid
  work_order_id: string;
  payload: WorkOrderItem;
  received_at: string;
}

export interface BootstrapStockReservation {
  id: string; // uuid
  work_order_id: string;
  payload: StockReservation;
  received_at: string;
}
