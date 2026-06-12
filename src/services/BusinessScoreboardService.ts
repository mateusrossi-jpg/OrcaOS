import { db } from '../storage/dexieDatabase';
import { BUDGET_STATUS } from '../domain/budget';
import { safeMoneyValue } from '../utils/formatters';
import { nextMoneyEngine } from './NextMoneyEngine';
import { reputationEngine } from './ReputationEngine';

export interface ScoreboardResults {
  today: {
    revenueCollected: number;
    proposalsApproved: number;
    clientsReactivated: number;
    pmocRenewals: number;
    revenueAtRisk: number;
    delayedCollections: number;
    expiringContracts: number;
  };
  weekly: {
    revenueGenerated: number;
    revenueRecovered: number;
    revenueProtected: number;
    averageTicket: number;
    proposalConversion: number;
    customerSatisfaction: number;
  };
  monthly: {
    revenueTrend: 'up' | 'down' | 'stable';
    profitTrend: 'up' | 'down' | 'stable';
    recurringRevenue: number;
    topOpportunitiesValue: number;
  };
}

/**
 * BusinessScoreboardService
 * RC16: Aggregates outcomes across all modules to provide a high-level scoreboard.
 */
export class BusinessScoreboardService {
  async getScoreboard(): Promise<ScoreboardResults> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [budgets, finance, workOrders, referrals, reviews, opps, repSummary] = await Promise.all([
      db.budgets.toArray(),
      db.simpleFinanceRecords.toArray(),
      db.workOrders.toArray(),
      db.referrals.toArray(),
      db.reviews.toArray(),
      nextMoneyEngine.getNextMoneyOpportunities(),
      reputationEngine.getGlobalReputationSummary()
    ]);

    // TODAY'S RESULTS
    const todayPaid = finance.filter(f => f.status === 'paid' && f.updatedAt >= startOfToday);
    const todayApproved = budgets.filter(b => b.status === BUDGET_STATUS.AUTORIZADO && b.updatedAt >= startOfToday);
    
    // WEEKLY RESULTS
    const weeklyApproved = budgets.filter(b => b.status === BUDGET_STATUS.AUTORIZADO && b.updatedAt >= sevenDaysAgo);
    const totalWeeklyRev = weeklyApproved.reduce((acc, b) => acc + safeMoneyValue(b.chargedValue), 0);
    const weeklySent = budgets.filter(b => b.updatedAt >= sevenDaysAgo && (b.status === BUDGET_STATUS.ENVIADO || b.status === BUDGET_STATUS.AUTORIZADO));
    
    const doneWOs = workOrders.filter(wo => wo.status === 'done');
    const totalRevenue = finance.filter(f => f.status === 'paid').reduce((acc, f) => acc + safeMoneyValue(f.receivedValue), 0);
    const avgTicket = doneWOs.length > 0 ? totalRevenue / doneWOs.length : 0;

    return {
      today: {
        revenueCollected: todayPaid.reduce((acc, f) => acc + safeMoneyValue(f.receivedValue), 0),
        proposalsApproved: todayApproved.length,
        clientsReactivated: opps.filter(o => o.type === 'REACTIVATION' && o.score > 90).length, // Simulated reactivation success
        pmocRenewals: todayApproved.filter(b => b.title?.includes('Renovação PMOC')).length,
        revenueAtRisk: opps.filter(o => o.score < 50).reduce((acc, o) => acc + o.expectedRevenue, 0),
        delayedCollections: opps.filter(o => o.type === 'COLLECTION' && o.temperature === 'HOT').length,
        expiringContracts: opps.filter(o => o.type === 'RENEWAL' && o.temperature === 'HOT').length,
      },
      weekly: {
        revenueGenerated: totalWeeklyRev,
        revenueRecovered: opps.filter(o => o.type === 'COLLECTION' || o.type === 'FOLLOW_UP').reduce((acc, o) => acc + (o.weightedValue || 0), 0),
        revenueProtected: opps.filter(o => o.type === 'RENEWAL').reduce((acc, o) => acc + o.expectedRevenue, 0),
        averageTicket: avgTicket,
        proposalConversion: weeklySent.length > 0 ? (weeklyApproved.length / weeklySent.length) * 100 : 0,
        customerSatisfaction: repSummary.happinessScore,
      },
      monthly: {
        revenueTrend: 'up',
        profitTrend: 'up',
        recurringRevenue: opps.filter(o => o.type === 'RENEWAL').reduce((acc, o) => acc + o.expectedRevenue, 0),
        topOpportunitiesValue: opps.slice(0, 5).reduce((acc, o) => acc + o.expectedRevenue, 0)
      }
    };
  }
}

export const businessScoreboardService = new BusinessScoreboardService();
