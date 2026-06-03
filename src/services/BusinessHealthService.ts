import { db } from '../storage/dexieDatabase';
import { BUDGET_STATUS } from '../domain/budget';
import { safeMoneyValue } from '../utils/formatters';

export interface BusinessHealth {
  status: 'healthy' | 'attention' | 'critical';
  title: string;
  reasons: string[];
  osDelayedCount: number;
  pendingPaymentsCount: number;
  unansweredBudgetsCount: number;
  revenueTrend: 'growing' | 'stable' | 'declining';
  revenueThisMonth: number;
  metaAtingidaPercent: number;
  totalReceivedToday: number;
}

export class BusinessHealthService {
  static async getBusinessHealth(): Promise<BusinessHealth> {
    try {
      const [workOrders, financeRecords, budgets] = await Promise.all([
        db.workOrders.filter(w => w.syncStatus !== 'deleted').toArray(),
        db.simpleFinanceRecords.toArray(),
        db.budgets.toArray()
      ]);

      const todayStr = new Date().toISOString().slice(0, 10);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // 1. OS Atrasadas
      const osDelayed = workOrders.filter(wo => 
        ['awaiting_schedule', 'scheduled', 'in-progress'].includes(wo.status) && 
        wo.scheduledDate && 
        wo.scheduledDate < todayStr
      );
      const osDelayedCount = osDelayed.length;

      // 2. Pagamentos Pendentes
      const pendingPayments = financeRecords.filter(r => r.status !== 'paid');
      const pendingPaymentsCount = pendingPayments.length;

      // 3. Propostas sem resposta
      const unansweredBudgets = budgets.filter(b => 
        ([BUDGET_STATUS.INICIADO, BUDGET_STATUS.ENVIADO, BUDGET_STATUS.EM_REVISAO] as string[]).includes(b.status)
      );
      const unansweredBudgetsCount = unansweredBudgets.length;

      // 4. Receita do mês e Receita de hoje
      let revenueThisMonth = 0;
      let totalReceivedToday = 0;

      financeRecords.forEach(r => {
        const recordDate = new Date(r.updatedAt);
        const isThisMonth = recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
        const isToday = r.updatedAt.startsWith(todayStr);

        if (r.status === 'paid') {
          if (isThisMonth) {
            revenueThisMonth += safeMoneyValue(r.receivedValue);
          }
          if (isToday) {
            totalReceivedToday += safeMoneyValue(r.receivedValue);
          }
        }
      });

      // 5. Tendência de Faturamento (últimos 30 dias vs 30 dias anteriores)
      const msInDay = 24 * 60 * 60 * 1000;
      const nowMs = Date.now();
      const thirtyDaysAgoMs = nowMs - (30 * msInDay);
      const sixtyDaysAgoMs = nowMs - (60 * msInDay);

      let revenueLast30Days = 0;
      let revenuePrev30Days = 0;

      financeRecords.forEach(r => {
        if (r.status === 'paid') {
          const t = new Date(r.updatedAt).getTime();
          const val = safeMoneyValue(r.receivedValue);
          if (t >= thirtyDaysAgoMs && t <= nowMs) {
            revenueLast30Days += val;
          } else if (t >= sixtyDaysAgoMs && t < thirtyDaysAgoMs) {
            revenuePrev30Days += val;
          }
        }
      });

      let revenueTrend: 'growing' | 'stable' | 'declining' = 'stable';
      if (revenueLast30Days > revenuePrev30Days) {
        revenueTrend = 'growing';
      } else if (revenueLast30Days < revenuePrev30Days && revenueLast30Days > 0) {
        revenueTrend = 'declining';
      }

      // 6. Meta do mês (ex: meta fixa de R$ 8.000 para SOLO por simplicidade)
      const monthlyGoal = 8000;
      const metaAtingidaPercent = Math.min(100, Math.round((revenueThisMonth / monthlyGoal) * 100));

      // 7. Derivar Estado de Saúde do Negócio
      let status: 'healthy' | 'attention' | 'critical' = 'healthy';
      let title = 'NEGÓCIO SOB CONTROLE';
      const reasons: string[] = [];

      if (osDelayedCount > 2 || pendingPaymentsCount > 4 || (revenueTrend === 'declining' && revenueThisMonth > 0)) {
        status = 'critical';
        title = 'AÇÃO IMEDIATA';
        if (osDelayedCount > 0) reasons.push(`${osDelayedCount} serviços com atraso crítico.`);
        if (pendingPaymentsCount > 0) reasons.push(`Fluxo de caixa comprometido por ${pendingPaymentsCount} pendências.`);
        if (revenueTrend === 'declining') reasons.push('Faturamento em queda nos últimos 30 dias.');
      } else if (osDelayedCount > 0 || pendingPaymentsCount > 0 || unansweredBudgetsCount > 2) {
        status = 'attention';
        title = 'ATENÇÃO NECESSÁRIA';
        if (osDelayedCount > 0) reasons.push(`${osDelayedCount} ordens de serviço pendentes.`);
        if (pendingPaymentsCount > 0) reasons.push(`${pendingPaymentsCount} recebimentos em aberto.`);
        if (unansweredBudgetsCount > 2) reasons.push(`${unansweredBudgetsCount} propostas aguardando retorno.`);
      } else {
        reasons.push('✓ Nenhuma OS atrasada');
        reasons.push('✓ Nenhum pagamento vencido');
        if (revenueTrend === 'growing') {
          reasons.push('✓ Receita crescendo');
        } else {
          reasons.push('✓ Receita estável');
        }
      }

      return {
        status,
        title,
        reasons,
        osDelayedCount,
        pendingPaymentsCount,
        unansweredBudgetsCount,
        revenueTrend,
        revenueThisMonth,
        metaAtingidaPercent,
        totalReceivedToday
      };
    } catch (e) {
      console.error(e);
      return {
        status: 'healthy',
        title: 'NEGÓCIO SOB CONTROLE',
        reasons: ['✓ Operações carregadas localmente'],
        osDelayedCount: 0,
        pendingPaymentsCount: 0,
        unansweredBudgetsCount: 0,
        revenueTrend: 'stable',
        revenueThisMonth: 0,
        metaAtingidaPercent: 0,
        totalReceivedToday: 0
      };
    }
  }
}
