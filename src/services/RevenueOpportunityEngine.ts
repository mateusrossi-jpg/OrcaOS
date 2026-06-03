import { db } from '../storage/dexieDatabase';
import { BUDGET_STATUS } from '../domain/budget';
import { safeMoneyValue } from '../utils/formatters';
import { clientMemoryEngine } from './ClientMemoryEngine';

export interface RevenueOpportunity {
  id: string;
  type: 'recoverable' | 'sleeping' | 'waiting' | 'potential';
  title: string;
  monetaryValue: number;
  count: number;
  description: string;
  ctaLabel: string;
  actionType: 'COBRAR' | 'REATIVAR' | 'NEGOCIAR' | 'PROPOR';
}

export interface TodayAgendaItem {
  time: string;
  clientName: string;
  title: string;
  value: number;
}

export interface RevenueOpportunityProjection {
  todayRevenue: number;
  todayTrend: number;
  nextReceipt?: {
    clientName: string;
    value: number;
    method: string;
    workOrderId: string;
  };
  recoverableTotal: number;
  sleepingTotal: number;
  waitingTotal: number;
  potentialTotal: number;
  revenueVelocityScore: number;
  opportunities: RevenueOpportunity[];
  // V7: Field Assistant & Health
  todayAgenda: TodayAgendaItem[];
  expectedTodayRevenue: number;
  monthlyRevenue: number;
  monthlyGoal: number;
  monthlyGoalPercent: number;
}

/**
 * RevenueOpportunityEngine
 * Transforms raw operational data into actionable monetary insights.
 * Follows the 'Money-First' rule for Home indicators.
 */
export class RevenueOpportunityEngine {
  /**
   * getOpportunityProjection
   * Aggregates and calculates all revenue opportunities across the system.
   */
  async getOpportunityProjection(): Promise<RevenueOpportunityProjection> {
    try {
      const [budgets, financeRecords, clients, workOrders] = await Promise.all([
        db.budgets.where('isDeleted').notEqual(1).toArray(),
        db.simpleFinanceRecords.where('isDeleted').notEqual(1).toArray(),
        db.clients.where('syncStatus').notEqual('deleted').toArray(),
        db.workOrders.filter(wo => !wo.isDeleted).toArray()
      ]);

      const todayStr = new Date().toISOString().slice(0, 10);
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // 1. Today's Revenue & Trend
      let todayRevenue = 0;
      let yesterdayRevenue = 0;
      let monthlyRevenue = 0;

      financeRecords.forEach(r => {
        const val = safeMoneyValue(r.receivedValue);
        const date = new Date(r.updatedAt);
        if (r.updatedAt.startsWith(todayStr)) todayRevenue += val;
        if (r.updatedAt.startsWith(yesterdayStr)) yesterdayRevenue += val;
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear && r.status === 'paid') {
           monthlyRevenue += val;
        }
      });

      const todayTrend = yesterdayRevenue > 0 
        ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
        : 0;

      // 2. Recoverable Revenue (Debts)
      const pendingRecords = financeRecords.filter(f => f.status !== 'paid');
      const recoverableTotal = pendingRecords.reduce((acc, f) => acc + safeMoneyValue(f.openBalance), 0);

      // 3. Next Receipt (Oldest pending)
      const nextR = pendingRecords.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
      const nextReceipt = nextR ? {
        clientName: nextR.clientName,
        value: nextR.openBalance,
        method: 'PIX', 
        workOrderId: nextR.workOrderId
      } : undefined;

      // 4. Waiting Revenue (Pending Proposals)
      const waitingBudgets = budgets.filter(b => 
        [BUDGET_STATUS.ENVIADO, BUDGET_STATUS.INICIADO, BUDGET_STATUS.EM_REVISAO].includes(b.status)
      );
      const waitingTotal = waitingBudgets.reduce((acc, b) => acc + safeMoneyValue(b.chargedValue), 0);

      // 5. Sleeping Revenue (Inactive Clients > 180 days)
      const now = Date.now();
      const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
      
      let sleepingTotal = 0;
      let inactiveClientsCount = 0;

      for (const client of clients) {
        const memory = await clientMemoryEngine.getClientMemory(client.id);
        if (memory.lastAttendanceDate) {
          const lastDate = new Date(memory.lastAttendanceDate).getTime();
          if (now - lastDate > sixMonthsMs) {
            inactiveClientsCount++;
            sleepingTotal += memory.averageTicket || 0;
          }
        }
      }

      // 6. Today's Agenda (Assistente de Campo V7)
      const todayWOs = workOrders.filter(wo => 
        wo.scheduledDate === todayStr && 
        ['scheduled', 'in-progress'].includes(wo.status)
      );
      
      const todayAgenda: TodayAgendaItem[] = [];
      let expectedTodayRevenue = 0;

      for (const wo of todayWOs) {
         const client = clients.find(c => c.id === wo.clientId);
         expectedTodayRevenue += safeMoneyValue(wo.executedValue || wo.originalValue);
         todayAgenda.push({
           time: wo.updatedAt?.split('T')[1]?.substring(0, 5) || '--:--',
           clientName: client?.name || 'Cliente',
           title: wo.title,
           value: safeMoneyValue(wo.executedValue || wo.originalValue)
         });
      }

      // 7. Business Health (V7)
      const monthlyGoal = 8000; // Hardcoded SOLO meta
      const monthlyGoalPercent = Math.min(100, Math.round((monthlyRevenue / monthlyGoal) * 100));

      // 8. Revenue Velocity Score
      // Logic: Start at 100.
      // - Deduct 2 points for each open debt (Recoverable).
      // - Deduct 1 point for each pending proposal (Waiting).
      // - Deduct 10 points if no revenue today AND no revenue yesterday (Inactivity).
      let score = 100;
      score -= (pendingRecords.length * 2); 
      score -= (waitingBudgets.length * 1); 
      if (todayRevenue === 0 && yesterdayRevenue === 0) score -= 10;
      const revenueVelocityScore = Math.max(0, Math.min(100, score));

      // 9. Build Opportunities List
      const opportunities: RevenueOpportunity[] = [
        {
          id: 'rec-1',
          type: 'recoverable',
          title: 'Receita Recuperável',
          monetaryValue: recoverableTotal,
          count: pendingRecords.length,
          description: 'Saldos faturados e não recebidos.',
          ctaLabel: 'RECUPERAR AGORA',
          actionType: 'COBRAR'
        },
        {
          id: 'slp-1',
          type: 'sleeping',
          title: 'Receita Adormecida',
          monetaryValue: sleepingTotal,
          count: inactiveClientsCount,
          description: 'Clientes parados há mais de 6 meses.',
          ctaLabel: 'INICIAR CAMPANHA',
          actionType: 'REATIVAR'
        },
        {
          id: 'wait-1',
          type: 'waiting',
          title: 'Receita em Espera',
          monetaryValue: waitingTotal,
          count: waitingBudgets.length,
          description: 'Propostas enviadas aguardando você.',
          ctaLabel: 'NEGOCIAR',
          actionType: 'NEGOCIAR'
        }
      ];

      return {
        todayRevenue,
        todayTrend,
        nextReceipt,
        recoverableTotal,
        sleepingTotal,
        waitingTotal,
        potentialTotal: 0,
        revenueVelocityScore,
        opportunities: opportunities.filter(o => o.monetaryValue > 0),
        todayAgenda,
        expectedTodayRevenue,
        monthlyRevenue,
        monthlyGoal,
        monthlyGoalPercent
      };
    } catch (err) {
      console.error('[RevenueOpportunityEngine] Failed:', err);
      return {
        todayRevenue: 0,
        todayTrend: 0,
        recoverableTotal: 0,
        sleepingTotal: 0,
        waitingTotal: 0,
        potentialTotal: 0,
        revenueVelocityScore: 0,
        opportunities: [],
        todayAgenda: [],
        expectedTodayRevenue: 0,
        monthlyRevenue: 0,
        monthlyGoal: 8000,
        monthlyGoalPercent: 0
      };
    }
  }
}

export const revenueOpportunityEngine = new RevenueOpportunityEngine();
