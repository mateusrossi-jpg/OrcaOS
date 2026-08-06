import { db } from '../database/db';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function subDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - amount);
  return d;
}

function isBefore(date: Date, dateToCompare: Date): boolean {
  return date.getTime() < dateToCompare.getTime();
}

export interface HomeDashboardViewModel {
  todayRevenue: number;
  todayProfit: number;
  todayExpenses: number;
  pendingPayments: number;
  todayAppointments: any[];
  pendingTasks: any[];
  weeklyChart: { date: string; revenue: number; profit: number; appointments: number }[];
}

export class DashboardService {
  /**
   * Constrói o ViewModel da Home (Mission Control) com consultas rápidas
   * baseadas em índices, sem fazer varredura na base inteira.
   */
  static async getHomeViewModel(): Promise<HomeDashboardViewModel> {
    const now = new Date();
    const startOfTodayISO = startOfDay(now).toISOString();
    const endOfTodayISO = endOfDay(now).toISOString();

    // 1. Financeiro Hoje (Receitas e Despesas pagas, filtrando pelo índice due_date)
    // Dexie index query for 'due_date'
    const todayTransactions = await db.transactions
      .where('due_date')
      .between(startOfTodayISO, endOfTodayISO)
      .toArray();

    let todayRevenue = 0;
    let todayExpenses = 0;

    for (const tx of todayTransactions) {
      if (tx.is_paid) {
        if (tx.type === 'income') todayRevenue += tx.amount_cents;
        if (tx.type === 'expense') todayExpenses += tx.amount_cents;
      }
    }

    const todayProfit = todayRevenue - todayExpenses;

    // 2. Pendências Financeiras (A Receber)
    // To be perfectly safe across Dexie versions:
    const pendingIncomeTxs = await db.transactions
      .filter(tx => tx.type === 'income' && !tx.is_paid)
      .toArray();

    let pendingPayments = 0;
    for (const tx of pendingIncomeTxs) {
      pendingPayments += tx.amount_cents;
    }

    // 3. Agenda de Hoje
    // Using starts_at index
    const todaySchedules = await db.work_order_schedules
      .where('starts_at')
      .between(startOfTodayISO, endOfTodayISO)
      .toArray();

    // Join with customers and work_orders (only for today's schedules, which is small O(N))
    const todayAppointments = [];
    for (const sched of todaySchedules) {
      const wo = await db.work_orders.get(sched.work_order_id);
      const customer = await db.customers.get(sched.customer_id);

      if (wo && customer) {
        todayAppointments.push({
          schedule_id: sched.id,
          work_order_id: wo.id,
          customer_name: customer.name,
          address: sched.address || wo.address || '',
          starts_at: sched.starts_at,
          status: wo.status,
          price_cents: wo.total_price_cents
        });
      }
    }

    // Ordenar agenda por horário
    todayAppointments.sort((a, b) => a.starts_at.localeCompare(b.starts_at));

    // 4. Pendências / Tasks atrasadas
    // OS In Progress que deveriam ter terminado, ou pagamentos em atraso
    const pendingTasks = [];

    // Ex: 1. Orçamentos aguardando aprovação ('sent')
    const sentOrders = await db.work_orders.where('status').equals('sent').toArray();
    if (sentOrders.length > 0) {
      pendingTasks.push({
        type: 'approval',
        count: sentOrders.length,
        title: `${sentOrders.length} orçamento(s) aguardando aprovação`
      });
    }

    // Ex: 2. Pagamentos atrasados
    const overduePaymentsCount = pendingIncomeTxs.filter(tx => isBefore(new Date(tx.due_date), startOfDay(now))).length;
    if (overduePaymentsCount > 0) {
      pendingTasks.push({
        type: 'overdue_payment',
        count: overduePaymentsCount,
        title: `${overduePaymentsCount} pagamento(s) em atraso`
      });
    }

    // 5. Gráfico de Resumo Semanal (últimos 7 dias)
    const weeklyChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const dStart = startOfDay(d).toISOString();
      const dEnd = endOfDay(d).toISOString();

      const dayTxs = await db.transactions
        .where('due_date')
        .between(dStart, dEnd)
        .toArray();

      let dRev = 0;
      let dExp = 0;
      for (const tx of dayTxs) {
        if (tx.is_paid) {
          if (tx.type === 'income') dRev += tx.amount_cents;
          if (tx.type === 'expense') dExp += tx.amount_cents;
        }
      }

      const dayScheds = await db.work_order_schedules
        .where('starts_at')
        .between(dStart, dEnd)
        .count();

      weeklyChart.push({
        date: dStart, // Just for label formatting later
        revenue: dRev,
        profit: dRev - dExp,
        appointments: dayScheds
      });
    }

    return {
      todayRevenue,
      todayProfit,
      todayExpenses,
      pendingPayments,
      todayAppointments,
      pendingTasks,
      weeklyChart
    };
  }
}
