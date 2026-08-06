/**
 * useAnalytics.ts — Hook reativo que integra Dexie + AnalyticsEngine
 *
 * Usa useLiveQuery para ser reativo a qualquer mutação no IndexedDB.
 * Retorna o AnalyticsDashboard computado e um estado de loading.
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';
import { buildAnalyticsDashboard, type AnalyticsDashboard, type PeriodFilter } from './AnalyticsEngine';

// Dashboard vazio para uso como estado inicial (evita undefined em renders)
const EMPTY_DASHBOARD: AnalyticsDashboard = {
  revenue: {
    grossRevenueCents:    0,
    totalDirectCostCents: 0,
    estimatedTaxCents:    0,
    netProfitCents:       0,
    netMarginPercent:     0,
    paidExpensesCents:    0,
    realCashProfitCents:  0,
  },
  ticket: {
    averageTicketCents:   0,
    completedOrdersCount: 0,
    maxTicketCents:       0,
    minTicketCents:       0,
  },
  topClients:        [],
  activeOrdersCount: 0,
  draftOrdersCount:  0,
  healthScore:       0,
};

export function useAnalytics(filter: PeriodFilter = {}): {
  dashboard: AnalyticsDashboard;
  isLoading: boolean;
} {
  // Serialize filter para ser usada como chave de dependência estável
  const filterKey = JSON.stringify(filter);

  const dashboard = useLiveQuery(
    async () => {
      const [orders, customers, transactions] = await Promise.all([
        db.work_orders.toArray(),
        db.customers.toArray(),
        db.transactions.toArray(),
      ]);

      return buildAnalyticsDashboard(orders, customers, transactions, JSON.parse(filterKey) as PeriodFilter);
    },
    [filterKey], // recomputa sempre que o filtro muda
  );

  return {
    dashboard: dashboard ?? EMPTY_DASHBOARD,
    isLoading: dashboard === undefined,
  };
}
