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
  lastProposal?: { id: string, title: string, status: string, value: number, date: string };
  lastClosedProposal?: { id: string, title: string, value: number, date: string };
  averageTicket: number;
  favoritePaymentMethod: string;
  serviceFrequencyDays?: number;
  lastAttendanceDate?: string;
  totalRevenue: number;
  totalServices: number;
  lastBudgetItems?: any[];
  
  // V7: Revenue Memory Evolution
  acceptanceRate: number;
  openReceivables: number;
  activeContractsCount: number;
  activePMOCCount: number;
  
  frequentServices: { title: string, count: number, avgPrice: number, description?: string }[];
  
  recommendations: {
    type: 'RENEW_PMOC' | 'REPEAT_SERVICE' | 'FOLLOW_UP' | 'COLLECT' | 'UPSELL';
    title: string;
    description: string;
    actionLabel: string;
    potentialValue: number;
    metadata?: any;
  }[];
  
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
      const [budgets, workOrders, financeRecords, contracts, plans] = await Promise.all([
        db.budgets.where('clientId').equals(clientId).filter(b => !b.isDeleted).toArray(),
        db.workOrders.where('clientId').equals(clientId).filter(wo => !wo.isDeleted).toArray(),
        db.simpleFinanceRecords.where('clientId').equals(clientId).filter(f => !f.isDeleted).toArray(),
        db.contracts.where('clientId').equals(clientId).toArray(),
        db.maintenancePlans.where('clientId').equals(clientId).toArray()
      ]);

      const sortedBudgets = budgets.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      const lastBudget = sortedBudgets[0];
      const approvedBudgets = budgets.filter(b => b.status === BUDGET_STATUS.AUTORIZADO || b.status === BUDGET_STATUS.FINALIZADO || b.status === BUDGET_STATUS.EM_EXECUCAO);
      const lastClosed = approvedBudgets[0];

      const sortedWorkOrders = workOrders.sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || '';
        const dateB = b.updatedAt || b.createdAt || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      const lastWO = sortedWorkOrders.find(wo => wo.status === 'done');
      const latestAttendanceDate = sortedWorkOrders[0]?.updatedAt || sortedWorkOrders[0]?.createdAt;

      const totalServices = workOrders.filter(wo => wo.status === 'done').length;
      const totalRevenue = financeRecords.reduce((acc, f) => acc + safeMoneyValue(f.receivedValue), 0);
      const openReceivables = financeRecords.reduce((acc, f) => acc + safeMoneyValue(f.openBalance), 0);
      const averageTicket = totalServices > 0 ? totalRevenue / totalServices : 0;
      
      const acceptanceRate = budgets.length > 0 ? Math.round((approvedBudgets.length / budgets.length) * 100) : 0;

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

      const recommendations: ClientMemory['recommendations'] = [];

      // Logic for Collection
      if (openReceivables > 0) {
        recommendations.push({
          type: 'COLLECT',
          title: 'Cobrança Pendente',
          description: `Existe um saldo de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(openReceivables)} em aberto.`,
          actionLabel: 'ENVIAR LEMBRETE',
          potentialValue: openReceivables
        });
      }

      // Logic for Proposal Follow-up
      if (lastBudget && lastBudget.status === BUDGET_STATUS.ENVIADO) {
        const daysSent = Math.floor((Date.now() - new Date(lastBudget.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSent >= 3) {
          recommendations.push({
            type: 'FOLLOW_UP',
            title: 'Follow-up de Proposta',
            description: `A proposta "${lastBudget.title}" foi enviada há ${daysSent} dias sem resposta.`,
            actionLabel: 'COBRAR CLIENTE',
            potentialValue: lastBudget.chargedValue,
            metadata: { budgetId: lastBudget.id }
          });
        }
      }

      // Logic for PMOC Renewal
      const expiringPlan = plans.find(p => p.isActive && (new Date(p.nextExecutionDate).getTime() - Date.now()) < (30 * 24 * 60 * 60 * 1000));
      if (expiringPlan) {
        recommendations.push({
          type: 'RENEW_PMOC',
          title: 'Renovação de PMOC',
          description: `O plano "${expiringPlan.title}" requer atenção para o próximo ciclo.`,
          actionLabel: 'GERAR RENOVAÇÃO',
          potentialValue: averageTicket * 1.1
        });
      }

      // 4. Frequency detection
      let serviceFrequencyDays: number | undefined = undefined;
      if (totalServices >= 2) {
        const doneWOs = workOrders.filter(wo => wo.status === 'done').sort((a, b) => new Date(a.updatedAt || '').getTime() - new Date(b.updatedAt || '').getTime());
        const firstDate = new Date(doneWOs[0].updatedAt || '').getTime();
        const lastDate = new Date(doneWOs[doneWOs.length - 1].updatedAt || '').getTime();
        serviceFrequencyDays = Math.round(((lastDate - firstDate) / (1000 * 60 * 60 * 24)) / (totalServices - 1));

        if (latestAttendanceDate && serviceFrequencyDays > 0) {
           const nextExpected = new Date(latestAttendanceDate).getTime() + (serviceFrequencyDays * 24 * 60 * 60 * 1000);
           if (Date.now() > nextExpected) {
             recommendations.push({
               type: 'REPEAT_SERVICE',
               title: 'Retorno Sugerido',
               description: `Baseado no histórico de ${serviceFrequencyDays} dias, o cliente pode precisar de um novo serviço.`,
               actionLabel: 'PROPOR SERVIÇO',
               potentialValue: averageTicket
             });
           }
        }
      }

      let tier: VIPCardTier = 'BRONZE';
      if (totalRevenue > 5000 || totalServices > 10) tier = 'PRATA';
      if (totalRevenue > 15000 || totalServices > 25) tier = 'OURO';
      if (totalRevenue > 50000 || totalServices > 50) tier = 'DIAMANTE';

      return {
        lastServiceTitle: lastBudget?.title || lastWO?.title,
        lastServiceDescription: lastBudget?.notes || lastWO?.description,
        lastExecutedValue: lastWO?.executedValue || lastBudget?.chargedValue,
        lastProposal: lastBudget ? { id: lastBudget.id, title: lastBudget.title, status: lastBudget.status as string, value: lastBudget.chargedValue, date: lastBudget.updatedAt } : undefined,
        lastClosedProposal: lastClosed ? { id: lastClosed.id, title: lastClosed.title, value: lastClosed.chargedValue, date: lastClosed.updatedAt } : undefined,
        averageTicket,
        favoritePaymentMethod: 'PIX',
        serviceFrequencyDays,
        lastAttendanceDate: latestAttendanceDate,
        totalRevenue,
        totalServices,
        lastBudgetItems: lastBudget?.items,
        acceptanceRate,
        openReceivables,
        activeContractsCount: contracts.filter(c => c.status === 'active').length,
        activePMOCCount: plans.filter(p => p.isActive).length,
        frequentServices,
        recommendations,
        tier
      };
    } catch (err) {
      console.error('[ClientMemoryEngine] Failed to compile memory:', err);
      return {
        averageTicket: 0,
        favoritePaymentMethod: 'PIX',
        totalRevenue: 0,
        totalServices: 0,
        acceptanceRate: 0,
        openReceivables: 0,
        activeContractsCount: 0,
        activePMOCCount: 0,
        frequentServices: [],
        recommendations: [],
        tier: 'BRONZE'
      };
    }
  }
}

export const clientMemoryEngine = new ClientMemoryEngine();
