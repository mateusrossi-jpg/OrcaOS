/**
 * AnalyticsEngine.ts — Motor de Cálculo Analítico do Aferix OS
 *
 * Todas as funções são PURAS: recebem arrays já carregados (via Dexie) e
 * retornam objetos de resultado imutáveis — sem efeitos colaterais, sem I/O.
 * Isso permite cache, memoização e testes unitários limpos.
 *
 * Unidade monetária: CENTAVOS (integer math) em todas as entradas/saídas.
 */

import type { WorkOrder, Customer } from '../database/schema';
import type { FinancialTransaction } from '../database/schema';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos exportados
// ─────────────────────────────────────────────────────────────────────────────

export interface RevenueSnapshot {
  /** Soma de total_price_cents de todas as OS completed/approved */
  grossRevenueCents: number;
  /** Soma de custos directos: total_cost_cents das mesmas OS */
  totalDirectCostCents: number;
  /** Soma de impostos estimados: cada OS tem tax_rate implícita nos items —
   *  usamos um proxy conservador de 6% sobre o revenue bruto quando não há dado granular */
  estimatedTaxCents: number;
  /** grossRevenueCents - totalDirectCostCents - estimatedTaxCents */
  netProfitCents: number;
  /** netProfitCents / grossRevenueCents × 100 (0 se revenue = 0) */
  netMarginPercent: number;
  /** Soma de despesas pagas (type==='expense' && is_paid) */
  paidExpensesCents: number;
  /** netProfitCents - paidExpensesCents */
  realCashProfitCents: number;
}

export interface TicketStats {
  /** Média de total_price_cents entre OS concluídas */
  averageTicketCents: number;
  /** Número de OS concluídas no período */
  completedOrdersCount: number;
  /** OS com maior total_price_cents */
  maxTicketCents: number;
  /** OS com menor total_price_cents */
  minTicketCents: number;
}

export interface TopClient {
  customerId: string;
  name: string;
  /** LTV calculado: soma real de total_price_cents das OS concluídas desse cliente */
  ltvCents: number;
  completedOrders: number;
  /** Participação percentual no faturamento total */
  revenueSharePercent: number;
}

export interface PeriodFilter {
  /** ISO string de início (inclusivo). undefined = sem limite */
  from?: string;
  /** ISO string de fim (inclusivo). undefined = até agora */
  to?: string;
}

export interface AnalyticsDashboard {
  revenue: RevenueSnapshot;
  ticket: TicketStats;
  topClients: TopClient[];          // Top 5, ordenados por LTV desc
  /** Ordens de serviço ativas (approved | in_progress) */
  activeOrdersCount: number;
  /** Ordens em rascunho */
  draftOrdersCount: number;
  /** Score de saúde operacional 0–100 baseado em margem + cobertura de receita */
  healthScore: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────────────────────────────────────

const TAX_PROXY_RATE = 0.06; // 6% Simples Nacional — fallback quando sem dado granular

function safeCents(v: number | undefined | null): number {
  if (v === null || v === undefined || !Number.isFinite(v)) return 0;
  return Math.round(v);
}

function isWithinPeriod(isoDate: string | undefined, filter: PeriodFilter): boolean {
  if (!isoDate) return true; // sem data = incluir (compatibilidade legado)
  const ts = new Date(isoDate).getTime();
  if (filter.from && ts < new Date(filter.from).getTime()) return false;
  if (filter.to   && ts > new Date(filter.to).getTime())   return false;
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI 1 — Revenue Snapshot
// ─────────────────────────────────────────────────────────────────────────────

export function computeRevenueSnapshot(
  orders: WorkOrder[],
  transactions: FinancialTransaction[],
  filter: PeriodFilter = {},
): RevenueSnapshot {
  const billableOrders = orders.filter(
    (o) =>
      (o.status === 'completed' || o.status === 'approved') &&
      isWithinPeriod(o.created_at, filter),
  );

  let grossRevenueCents   = 0;
  let totalDirectCostCents = 0;

  for (const o of billableOrders) {
    grossRevenueCents    += safeCents(o.total_price_cents);
    totalDirectCostCents += safeCents(o.total_cost_cents);
  }

  const estimatedTaxCents = Math.round(grossRevenueCents * TAX_PROXY_RATE);

  const paidExpensesCents = transactions
    .filter((t) => t.type === 'expense' && t.is_paid && isWithinPeriod(t.due_date, filter))
    .reduce((acc, t) => acc + safeCents(t.amount_cents), 0);

  const netProfitCents = grossRevenueCents - totalDirectCostCents - estimatedTaxCents;
  const realCashProfitCents = netProfitCents - paidExpensesCents;

  const netMarginPercent = grossRevenueCents > 0
    ? Math.round((netProfitCents / grossRevenueCents) * 10000) / 100
    : 0;

  return {
    grossRevenueCents,
    totalDirectCostCents,
    estimatedTaxCents,
    netProfitCents,
    netMarginPercent,
    paidExpensesCents,
    realCashProfitCents,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI 2 — Ticket Stats
// ─────────────────────────────────────────────────────────────────────────────

export function computeTicketStats(
  orders: WorkOrder[],
  filter: PeriodFilter = {},
): TicketStats {
  const completed = orders.filter(
    (o) => o.status === 'completed' && isWithinPeriod(o.created_at, filter),
  );

  if (completed.length === 0) {
    return { averageTicketCents: 0, completedOrdersCount: 0, maxTicketCents: 0, minTicketCents: 0 };
  }

  const prices = completed.map((o) => safeCents(o.total_price_cents));
  const total  = prices.reduce((a, b) => a + b, 0);

  return {
    averageTicketCents:   Math.round(total / completed.length),
    completedOrdersCount: completed.length,
    maxTicketCents:       Math.max(...prices),
    minTicketCents:       Math.min(...prices),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI 3 — Top 5 Clients by LTV
// ─────────────────────────────────────────────────────────────────────────────

export function computeTopClients(
  orders: WorkOrder[],
  customers: Customer[],
  filter: PeriodFilter = {},
  limit = 5,
): TopClient[] {
  // Indexar clientes para acesso O(1)
  const customerMap = new Map(customers.map((c) => [c.id, c]));

  // Acumular LTV por cliente (apenas OS concluídas)
  const ltvMap = new Map<string, { ltvCents: number; completedOrders: number }>();

  for (const o of orders) {
    if (o.status !== 'completed') continue;
    if (!isWithinPeriod(o.created_at, filter)) continue;

    const existing = ltvMap.get(o.customer_id) ?? { ltvCents: 0, completedOrders: 0 };
    ltvMap.set(o.customer_id, {
      ltvCents:        existing.ltvCents + safeCents(o.total_price_cents),
      completedOrders: existing.completedOrders + 1,
    });
  }

  // Total para calcular share %
  const totalRevenueCents = Array.from(ltvMap.values()).reduce((a, v) => a + v.ltvCents, 0);

  return Array.from(ltvMap.entries())
    .map(([customerId, { ltvCents, completedOrders }]) => {
      const customer = customerMap.get(customerId);
      return {
        customerId,
        name: customer?.name ?? 'Cliente Avulso',
        ltvCents,
        completedOrders,
        revenueSharePercent:
          totalRevenueCents > 0
            ? Math.round((ltvCents / totalRevenueCents) * 10000) / 100
            : 0,
      };
    })
    .sort((a, b) => b.ltvCents - a.ltvCents)
    .slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI 4 — Health Score (0–100)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Score composto:
 *  - 50pts: margem líquida  (20% = full; proporcional até 0)
 *  - 30pts: cobertura de OS (% de OS concluídas vs total)
 *  - 20pts: caixa positivo  (realCashProfit > 0 → full)
 */
export function computeHealthScore(dash: Omit<AnalyticsDashboard, 'healthScore'>): number {
  const { revenue, ticket } = dash;

  // Componente 1: margem
  const TARGET_MARGIN = 20;
  const marginScore = Math.min(50, Math.round((revenue.netMarginPercent / TARGET_MARGIN) * 50));

  // Componente 2: taxa de conclusão
  const totalOrders = ticket.completedOrdersCount + dash.activeOrdersCount + dash.draftOrdersCount;
  const completionRate = totalOrders > 0 ? ticket.completedOrdersCount / totalOrders : 0;
  const completionScore = Math.round(completionRate * 30);

  // Componente 3: caixa real positivo
  const cashScore = revenue.realCashProfitCents > 0 ? 20 : 0;

  return Math.max(0, Math.min(100, marginScore + completionScore + cashScore));
}

// ─────────────────────────────────────────────────────────────────────────────
// Façade Principal — compõe tudo em um único objeto
// ─────────────────────────────────────────────────────────────────────────────

export function buildAnalyticsDashboard(
  orders: WorkOrder[],
  customers: Customer[],
  transactions: FinancialTransaction[],
  filter: PeriodFilter = {},
): AnalyticsDashboard {
  const revenue = computeRevenueSnapshot(orders, transactions, filter);
  const ticket  = computeTicketStats(orders, filter);
  const topClients = computeTopClients(orders, customers, filter);

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'approved' || o.status === 'in_progress',
  ).length;

  const draftOrdersCount = orders.filter((o) => o.status === 'draft').length;

  const partial = { revenue, ticket, topClients, activeOrdersCount, draftOrdersCount };
  const healthScore = computeHealthScore(partial);

  return { ...partial, healthScore };
}
