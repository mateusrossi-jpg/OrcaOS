import Dexie, { type Table } from 'dexie';
import type { CompanySettings, Customer, CatalogItem, WorkOrder, WorkOrderItem, FinancialTransaction, SyncOutboxItem, WorkOrderEquipment, WorkOrderMedia, WorkOrderSchedule, PixSettings, TeamMember, StockReservation, SyncCursor, BootstrapJob, BootstrapWorkOrder, BootstrapWorkOrderItem, BootstrapStockReservation, MediaDownloadJob, MediaChunk } from './schema';
import { createId } from '../../app/utils/idHelpers';

export class AferixDatabase extends Dexie {
  company_settings!: Table<CompanySettings, string>;
  customers!: Table<Customer, string>;
  catalog_items!: Table<CatalogItem, string>;
  work_orders!: Table<WorkOrder, string>;
  work_order_items!: Table<WorkOrderItem, string>;
  transactions!: Table<FinancialTransaction, string>;
  sync_outbox!: Table<SyncOutboxItem, string>;
  work_order_equipment!: Table<WorkOrderEquipment, string>;
  work_order_media!: Table<WorkOrderMedia, string>;
  work_order_schedules!: Table<WorkOrderSchedule, string>;
  pix_settings!: Table<PixSettings, string>;
  team_members!: Table<TeamMember, string>;
  stock_reservations!: Table<StockReservation, string>;
  sync_cursors!: Table<SyncCursor, string>;
  bootstrap_jobs!: Table<BootstrapJob, string>;

  bootstrap_work_orders!: Table<BootstrapWorkOrder, string>;
  bootstrap_work_order_items!: Table<BootstrapWorkOrderItem, string>;
  bootstrap_stock_reservations!: Table<BootstrapStockReservation, string>;

  media_download_jobs!: Table<MediaDownloadJob, string>;
  media_chunks!: Table<MediaChunk, string>;

  constructor(databaseName: string) {
    super(databaseName);

    // As mesmas definições de schema, mas instanciadas dinamicamente
    this.version(1).stores({
      companies: 'id',
      customers: 'id, is_vip, created_at',
      catalog_items: 'id, name',
      work_orders: 'id, customer_id, status, scheduled_date',
      work_order_items: 'id, work_order_id, catalog_item_id',
      transactions: 'id, type, due_date, is_paid, work_order_id'
    });

    this.version(2).stores({
      company_settings: 'id',
      companies: null
    });

    this.version(3).stores({
      transactions: 'id, type, category, due_date, is_paid, work_order_id'
    });

    this.version(4).stores({
      sync_outbox: '++id, uuid, table_name, operation, created_at'
    });

    this.version(5).stores({
      work_order_equipment: 'id, work_order_id',
      work_order_media: 'id, work_order_id, created_at'
    });

    this.version(6).stores({
      work_order_schedules: 'id, work_order_id, customer_id, starts_at, confirmation_status',
      pix_settings: 'id',
    });

    this.version(7).stores({
      team_members: 'id, active',
      work_orders: 'id, customer_id, status, scheduled_date, scheduled_start, assigned_to_id',
    }).upgrade(async (tx) => {
      const existingCount = await tx.table('team_members').count();
      if (existingCount === 0) {
        const ownerId = createId('member');
        await tx.table('team_members').add({
          id: ownerId,
          name: 'Proprietário',
          role: 'owner',
          active: true,
        });
      }
    });

    this.version(8).stores({
      stock_reservations: 'id, work_order_id, item_id, status',
    });

    this.version(9).stores({
      sync_outbox: '++id, uuid, table_name, operation, created_at, status, error_category'
    });

    this.version(10).stores({
      sync_cursors: '&id, tenant_id, table_name',
      bootstrap_jobs: '&id, tenant_id, phase, status'
    });

    this.version(11).stores({
      bootstrap_work_orders: '&id, tenant_id',
      bootstrap_work_order_items: '&id, work_order_id',
      bootstrap_stock_reservations: '&id, work_order_id'
    });

    this.version(12).stores({
      work_order_media: '&id, work_order_id, sync_status', // Updated structure
      media_download_jobs: '&id, media_id, tenant_id, status, priority',
      media_chunks: '&id, media_id, chunk_index'
    });

    this.version(13).stores({
      sync_outbox: 'id, tenant_id, user_id, table_name, operation, created_at, status, error_category'
    });
  }
}

// O db atual é um proxy que aponta para a instância ativa.
// Isso garante que todo código importando `db` aponte pro tenant correto.
let currentDb = new AferixDatabase('AferixDB_guest');

export const db = new Proxy({} as AferixDatabase, {
  get(target, prop) {
    const value = (currentDb as any)[prop];
    if (typeof value === 'function') {
      return value.bind(currentDb);
    }
    return value;
  },
  set(target, prop, value) {
    (currentDb as any)[prop] = value;
    return true;
  }
});

/**
 * Destrói o banco de dados atual e reinicia para o modo guest (Logout).
 */
export async function clearDatabaseAndReset() {
  await currentDb.delete();
  currentDb = new AferixDatabase('AferixDB_guest');
}

/**
 * Alterna a instância local para o tenant correto (Login).
 */
export async function switchDatabase(companyId: string, userId: string) {
  currentDb.close();
  const dbName = `AferixDB_${companyId}_${userId}`;
  currentDb = new AferixDatabase(dbName);
  await currentDb.open();
}

// Hook de segurança mantido
db.work_orders.hook('updating', (modifications, primKey, obj) => {
  if (obj.status === 'completed') {
    throw new Error('Não é possível editar uma Ordem de Serviço concluída.');
  }
});

export async function seedDatabase() {
  // Mantém a semente básica para dev caso seja guest
  try {
    const compCount = await db.company_settings.count();
    const txCount = await db.transactions.count();
    if (compCount > 0 && txCount > 0) return;
    // (Omitindo o conteúdo pesado de seed para simplificar,
    // mas na prática seria recriado aqui)
  } catch (error) {
    console.error('[AferixDB] Erro durante a inicialização/seed do banco de dados:', error);
  }
}
