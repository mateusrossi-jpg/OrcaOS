import { db } from '../storage/dexieDatabase';
import { Budget, BUDGET_STATUS } from '../domain/budget';
import { WorkOrder } from '../core/types/business';
import { SimpleFinanceRecord } from '../domain/finance';
import { safeMoneyValue } from '../utils/formatters';

export interface ProposalMemory {
  lastServiceTitle?: string;
  lastServiceDescription?: string;
  lastExecutedValue?: number;
  lastBudgetItems?: any[];
}

export interface ServiceMemory {
  serviceFrequencyDays?: number;
  lastAttendanceDate?: string;
}

export interface PaymentMemory {
  favoritePaymentMethod?: string;
  averageTicket: number;
}

export interface RelationshipMemory {
  totalRevenue: number;
  totalServices: number;
}

export type VIPCardTier = 'BRONZE' | 'PRATA' | 'OURO' | 'DIAMANTE';

export interface ClientMemory {
  lastServiceTitle?: string;
  lastServiceDescription?: string;
  lastExecutedValue?: number;
  averageTicket: number;
  favoritePaymentMethod: string;
  serviceFrequencyDays?: number;
  lastAttendanceDate?: string;
  totalRevenue: number;
  totalServices: number;
  lastBudgetItems?: any[];
  // V7: Indispensable Metrics
  frequentServices: { title: string, count: number, avgPrice: number, description?: string }[];
  nextOpportunity?: {
    title: string;
    potentialValue: number;
    daysOverdue: number;
    reason: string;
  };
  tier: VIPCardTier;
}

/**
 * ClientMemoryEngine
 * Absolute authority for client history and behavior prediction.
 * Centralizes memory logic to eliminate UI-level calculations.
 */
export class ClientMemoryEngine {
  /**
   * getClientMemory
   * Compiles the unified memory state for a specific client.
   */
  async getClientMemory(clientId: string): Promise<ClientMemory> {
    try {
      const [budgets, workOrders, financeRecords] = await Promise.all([
        db.budgets.where('clientId').equals(clientId).filter(b => !b.isDeleted).toArray(),
        db.workOrders.where('clientId').equals(clientId).filter(wo => !wo.isDeleted).toArray(),
        db.simpleFinanceRecords.where('clientId').equals(clientId).filter(f => !f.isDeleted).toArray()
      ]);

      // 1. Sort by date for recency
      const sortedBudgets = budgets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const lastBudget = sortedBudgets[0];

      const sortedWorkOrders = workOrders.sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || '';
        const dateB = b.updatedAt || b.createdAt || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      const lastWO = sortedWorkOrders.find(wo => wo.status === 'done');
      const latestAttendanceDate = sortedWorkOrders[0]?.updatedAt || sortedWorkOrders[0]?.createdAt;

      // 2. Compute Core Metrics
      const totalServices = workOrders.filter(wo => wo.status === 'done').length;
      const totalRevenue = financeRecords.reduce((acc, f) => acc + safeMoneyValue(f.receivedValue), 0);
      const averageTicket = totalServices > 0 ? totalRevenue / totalServices : 0;

      // 3. Frequent Services (V7)
      const serviceCounts: Record<string, { count: number, total: number, desc?: string }> = {};
      budgets.forEach(b => {
        if (!b.title) return;
        if (!serviceCounts[b.title]) serviceCounts[b.title] = { count: 0, total: 0, desc: b.notes };
        serviceCounts[b.title].count += 1;
        serviceCounts[b.title].total += b.chargedValue;
      });

      const frequentServices = Object.entries(serviceCounts)
        .map(([title, data]) => ({
          title,
          count: data.count,
          avgPrice: data.total / data.count,
          description: data.desc
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // 4. Frequency & Next Opportunity (V7)
      let serviceFrequencyDays: number | undefined = undefined;
      let nextOpportunity: ClientMemory['nextOpportunity'] = undefined;

      if (totalServices >= 2) {
        const doneWOs = workOrders.filter(wo => wo.status === 'done').sort((a, b) => {
           const dateA = a.updatedAt || a.createdAt || '';
           const dateB = b.updatedAt || b.createdAt || '';
           return new Date(dateA).getTime() - new Date(dateB).getTime();
        });
        const firstDate = new Date(doneWOs[0].updatedAt || doneWOs[0].createdAt || '').getTime();
        const lastDate = new Date(doneWOs[doneWOs.length - 1].updatedAt || doneWOs[doneWOs.length - 1].createdAt || '').getTime();
        const diffMs = lastDate - firstDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        serviceFrequencyDays = Math.round(diffDays / (totalServices - 1));

        if (serviceFrequencyDays > 0 && latestAttendanceDate) {
           const lastMs = new Date(latestAttendanceDate).getTime();
           const nextExpectedMs = lastMs + (serviceFrequencyDays * 24 * 60 * 60 * 1000);
           const now = Date.now();
           
           if (now > nextExpectedMs) {
              nextOpportunity = {
                title: lastWO?.title || lastBudget?.title || 'Manutenção Preventiva',
                potentialValue: averageTicket,
                daysOverdue: Math.floor((now - nextExpectedMs) / (1000 * 60 * 60 * 24)),
                reason: `Baseado na frequência de ${serviceFrequencyDays} dias.`
              };
           }
        }
      }

      // 5. VIP Tiering (V7)
      let tier: VIPCardTier = 'BRONZE';
      if (totalRevenue > 5000 || totalServices > 10) tier = 'PRATA';
      if (totalRevenue > 15000 || totalServices > 25) tier = 'OURO';
      if (totalRevenue > 50000 || totalServices > 50) tier = 'DIAMANTE';

      // 6. Consolidate Memory
      return {
        lastServiceTitle: lastBudget?.title || lastWO?.title,
        lastServiceDescription: lastBudget?.notes || lastWO?.description,
        lastExecutedValue: lastWO?.executedValue || lastBudget?.chargedValue,
        lastBudgetItems: lastBudget?.items,
        averageTicket,
        favoritePaymentMethod: 'PIX',
        serviceFrequencyDays,
        lastAttendanceDate: latestAttendanceDate,
        totalRevenue,
        totalServices,
        frequentServices,
        nextOpportunity,
        tier
      };
    } catch (err) {
      console.error('[ClientMemoryEngine] Failed to compile memory:', err);
      return {
        averageTicket: 0,
        favoritePaymentMethod: 'PIX',
        totalRevenue: 0,
        totalServices: 0,
        frequentServices: [],
        tier: 'BRONZE'
      };
    }
  }
}

export const clientMemoryEngine = new ClientMemoryEngine();
