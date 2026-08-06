import { db } from '../database/db';
import { transactionRepository } from '../repositories/TransactionRepository';
import type { TransactionType } from '../database/schema';
import { enqueueMutation, processOutbox } from '../database/syncEngine';

export interface FinanceDashboardVM {
  incomeTotalCents: number;
  expenseTotalCents: number;
  balanceCents: number;
  netMarginCents: number;
  unifiedHistory: Array<{
    id: string;
    title: string;
    subtitle: string;
    amount_cents: number;
    type: 'income' | 'expense' | 'pending';
    date: string;
    is_paid: boolean;
    source: 'work_order' | 'transaction';
  }>;
}

export class FinanceService {
  async getDashboardData(): Promise<FinanceDashboardVM> {
    const transactions = await transactionRepository.getRecentTransactions(200);

    // For now, these are fetched from db until their repositories are created
    const workOrders = await db.work_orders.toArray();
    const customers = await db.customers.toArray();

    const customerMap = new Map<string, string>();
    customers.forEach(c => customerMap.set(c.id, c.name));

    let incomeCents = 0;
    let expenseCents = 0;
    let costsCents = 0;

    const items: FinanceDashboardVM['unifiedHistory'] = [];

    workOrders.forEach(w => {
      const clientName = customerMap.get(w.customer_id) || 'Cliente';
      if (w.status === 'completed' || w.status === 'approved') {
        incomeCents += w.total_price_cents;
        costsCents += w.total_cost_cents;
        items.push({
          id: `wo-${w.id}`,
          title: w.title,
          subtitle: `OS • ${clientName}`,
          amount_cents: w.total_price_cents,
          type: 'income',
          date: w.created_at,
          is_paid: true,
          source: 'work_order',
        });
      } else if (w.status === 'draft' || w.status === 'in_progress') {
        items.push({
          id: `wo-${w.id}`,
          title: w.title,
          subtitle: `Orçamento • ${clientName} (${w.status === 'draft' ? 'Rascunho' : 'Em Andamento'})`,
          amount_cents: w.total_price_cents,
          type: 'pending',
          date: w.created_at,
          is_paid: false,
          source: 'work_order',
        });
      }
    });

    transactions.forEach(t => {
      if (t.is_paid) {
        if (t.type === 'income') incomeCents += t.amount_cents;
        else if (t.type === 'expense') expenseCents += t.amount_cents;
      }

      items.push({
        id: `tx-${t.id}`,
        title: t.description,
        subtitle: `${t.category} • ${t.is_paid ? (t.type === 'income' ? 'Recebido' : 'Pago') : 'Pendente'}`,
        amount_cents: t.amount_cents,
        type: !t.is_paid ? 'pending' : t.type,
        date: t.due_date,
        is_paid: t.is_paid,
        source: 'transaction',
      });
    });

    expenseCents += costsCents;
    const balance = incomeCents - expenseCents;
    const netCents = incomeCents - expenseCents;

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      incomeTotalCents: incomeCents,
      expenseTotalCents: expenseCents,
      balanceCents: balance,
      netMarginCents: netCents,
      unifiedHistory: items,
    };
  }

  async addTransaction(payload: {
    type: TransactionType;
    category: string;
    description: string;
    amount_cents: number;
    due_date: string;
    is_paid: boolean;
  }): Promise<void> {
    await transactionRepository.create(payload);
    processOutbox().catch(() => {});
  }
}

export const financeService = new FinanceService();
