import { db } from '../storage/dexieDatabase';
import { BUDGET_STATUS } from '../domain/budget';
import { safeMoneyValue } from '../utils/formatters';
import { nextMoneyEngine, NextMoneyOpportunity } from './NextMoneyEngine';

export interface BriefingItem {
  id: string;
  type: 'critical' | 'opportunity' | 'agenda' | 'financial';
  temperature: 'HOT' | 'WARM' | 'COLD';
  title: string;
  subtitle: string;
  value?: number;
  actionLabel: string;
  actionTab: string;
  actionId?: string;
  confidenceScore: number; // 0-100
}

export interface MorningBriefing {
  greeting: string;
  summary: string;
  items: BriefingItem[];
  score: number;
}

/**
 * MorningBriefingService (RC9.1)
 * Consumes the NextMoneyEngine to provide an action-first morning summary.
 * Maximum 5 items to prevent cognitive overload.
 */
export class MorningBriefingService {
  async getBriefing(): Promise<MorningBriefing> {
    const opps = await nextMoneyEngine.getNextMoneyOpportunities();
    const workOrders = await db.workOrders.filter(wo => !wo.isDeleted).toArray();

    const items: BriefingItem[] = [];
    const now = new Date();
    const hour = now.getHours();
    
    let greeting = "Bom dia";
    if (hour >= 12 && hour < 18) greeting = "Boa tarde";
    if (hour >= 18 || hour < 5) greeting = "Boa noite";

    // 1. Critical Overdue Collections (Highest priority)
    const topCollection = opps.find(o => o.type === 'COLLECTION' && o.temperature === 'HOT');
    if (topCollection) {
      items.push({
        id: `briefing-col-${topCollection.id}`,
        type: 'critical',
        temperature: 'HOT',
        title: `VENCIDO: ${topCollection.clientName}`,
        subtitle: `${topCollection.title} está atrasado.`,
        value: topCollection.expectedRevenue,
        actionLabel: 'COBRAR AGORA',
        actionTab: 'money',
        confidenceScore: 99
      });
    }

    // 2. Revenue at Risk (Follow-ups getting cold)
    const riskyFollowUp = opps.find(o => o.type === 'FOLLOW_UP' && o.temperature === 'HOT');
    if (riskyFollowUp) {
      items.push({
        id: `briefing-fol-${riskyFollowUp.id}`,
        type: 'opportunity',
        temperature: 'HOT',
        title: `${riskyFollowUp.clientName}`,
        subtitle: `Orçamento esfriando (${riskyFollowUp.timeSinceLastContact}).`,
        value: riskyFollowUp.expectedRevenue,
        actionLabel: 'RESGATAR NEGOCIAÇÃO',
        actionTab: 'budgets',
        actionId: riskyFollowUp.metadata?.budgetId,
        confidenceScore: 95
      });
    }

    // 3. Agenda
    const todayStr = now.toISOString().slice(0, 10);
    const todayJobs = workOrders.filter(wo => wo.scheduledDate === todayStr && wo.status !== 'done');
    if (todayJobs.length > 0 && items.length < 5) {
      items.push({
        id: 'briefing-agenda',
        type: 'agenda',
        temperature: 'WARM',
        title: `${todayJobs.length} Serviços hoje`,
        subtitle: 'Sua rota operacional está pronta.',
        actionLabel: 'VER AGENDA',
        actionTab: 'agenda',
        confidenceScore: 100
      });
    }

    // 4. Warm Opportunity
    const nextBest = opps.find(o => o.temperature === 'WARM' && !items.some(i => i.id.includes(o.id)));
    if (nextBest && items.length < 5) {
      items.push({
        id: `briefing-warm-${nextBest.id}`,
        type: 'opportunity',
        temperature: 'WARM',
        title: nextBest.title,
        subtitle: `Oportunidade para ${nextBest.clientName}.`,
        value: nextBest.expectedRevenue,
        actionLabel: 'AVANÇAR',
        actionTab: nextBest.type === 'RENEWAL' ? 'base' : 'budgets',
        confidenceScore: 80
      });
    }

    const velocityScore = opps.length > 0 ? Math.round((opps.filter(o => o.temperature !== 'COLD').length / Math.max(1, opps.length)) * 100) : 100;

    return {
      greeting,
      summary: `Existem ${items.length} ações críticas para gerar receita hoje.`,
      items: items.slice(0, 5), // Strictly max 5 items
      score: velocityScore
    };
  }
}

export const morningBriefingService = new MorningBriefingService();
