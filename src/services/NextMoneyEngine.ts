import { db } from '../storage/dexieDatabase';
import { BUDGET_STATUS } from '../domain/budget';
import { safeMoneyValue } from '../utils/formatters';

export type OpportunityType = 'FOLLOW_UP' | 'COLLECTION' | 'RENEWAL' | 'REACTIVATION' | 'UPSELL' | 'EXPANSION' | 'RISK';
export type OpportunityTemperature = 'HOT' | 'WARM' | 'COLD';

export interface NextMoneyOpportunity {
  id: string;
  type: OpportunityType;
  temperature: OpportunityTemperature;
  title: string;
  clientName: string;
  clientId: string;
  expectedRevenue: number;
  weightedValue: number; // expectedRevenue * probability
  score: number; // 0-100 for internal ranking
  probability: number; // 0-1
  recommendedAction: string;
  timeSinceLastContact: string;
  daysWaiting: number;
  predictedNextValue?: number;
  returnProbability?: number;
  metadata?: any;
}

export interface RevenueForecast {
  negotiation: number; // Under follow-up
  approved: number;    // Approved but not started
  execution: number;   // In progress
  collection: number;  // Done but not paid
  guaranteed: number;  // Renewals/Contracts
}

/**
 * NextMoneyEngine
 * RC16 Strategic Layer: High-velocity Revenue Officer with Prediction.
 */
export class NextMoneyEngine {
  async getNextMoneyOpportunities(): Promise<NextMoneyOpportunity[]> {
    const [budgets, finance, plans, clients, workOrders] = await Promise.all([
      db.budgets.where('isDeleted').notEqual(1).toArray(),
      db.simpleFinanceRecords.where('isDeleted').notEqual(1).toArray(),
      db.maintenancePlans.where('isActive').equals(1).toArray(),
      db.clients.toArray(),
      db.workOrders.filter(w => !w.isDeleted).toArray()
    ]);

    const now = Date.now();
    const opportunities: NextMoneyOpportunity[] = [];

    // 1. PROPOSAL FOLLOW-UP ENGINE
    budgets.filter(b => b.status === BUDGET_STATUS.ENVIADO).forEach(b => {
      const daysSince = Math.floor((now - new Date(b.updatedAt || b.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      
      let temperature: OpportunityTemperature = 'COLD';
      let score = 50;
      let prob = 0.5;
      let action = 'Realizar Follow-up';
      let titlePrefix = 'Follow-up';

      if (daysSince >= 3 && daysSince < 7) { 
        temperature = 'WARM';
        score = 80; prob = 0.8; action = 'Cobrar Retorno (WA)'; 
        titlePrefix = 'Follow-up Recomendado';
      }
      else if (daysSince >= 7 && daysSince < 14) { 
        temperature = 'HOT';
        score = 95; prob = 0.7; action = 'Ligação de Fechamento'; 
        titlePrefix = 'Follow-up Crítico';
      }
      else if (daysSince >= 14 && daysSince < 21) {
        temperature = 'HOT';
        score = 90; prob = 0.4; action = 'Escalar com Proprietário';
        titlePrefix = 'Última Tentativa';
      }
      else if (daysSince >= 21) {
        temperature = 'COLD';
        score = 30; prob = 0.1; action = 'Arquivar ou Reativar';
        titlePrefix = 'Proposta Estagnada';
      }

      opportunities.push({
        id: b.id,
        type: 'FOLLOW_UP',
        temperature,
        title: `${titlePrefix}: ${b.title}`,
        clientName: b.clientName || 'Cliente',
        clientId: b.clientId || '',
        expectedRevenue: b.chargedValue,
        weightedValue: b.chargedValue * prob,
        score,
        probability: prob,
        recommendedAction: action,
        timeSinceLastContact: `${daysSince} dias`,
        daysWaiting: daysSince,
        metadata: { budgetId: b.id }
      });
    });

    // 2. OVERDUE COLLECTIONS
    finance.filter(f => f.status !== 'paid' && f.openBalance > 0).forEach(f => {
      const daysOverdue = Math.floor((now - new Date(f.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      
      let temperature: OpportunityTemperature = 'COLD';
      if (daysOverdue > 2) temperature = 'WARM';
      if (daysOverdue > 7) temperature = 'HOT';

      opportunities.push({
        id: f.id,
        type: 'COLLECTION',
        temperature,
        title: 'Recebimento Pendente',
        clientName: f.clientName || 'Cliente',
        clientId: f.clientId || '',
        expectedRevenue: f.openBalance,
        weightedValue: f.openBalance * 0.95,
        score: 100,
        probability: 0.95,
        recommendedAction: 'Enviar Lembrete de Pagamento',
        timeSinceLastContact: `${daysOverdue} dias`,
        daysWaiting: daysOverdue
      });
    });

    // 3. PMOC SHIELD
    plans.forEach(p => {
      const nextDate = new Date(p.nextExecutionDate);
      const daysUntil = Math.floor((nextDate.getTime() - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 15 && daysUntil >= 0) {
        opportunities.push({
          id: p.id,
          type: 'RENEWAL',
          temperature: daysUntil < 5 ? 'HOT' : 'WARM',
          title: `Renovação: ${p.title}`,
          clientName: clients.find(c => c.id === p.clientId)?.name || 'Cliente',
          clientId: p.clientId,
          expectedRevenue: 350, 
          weightedValue: 350 * 0.9,
          score: 90,
          probability: 0.9,
          recommendedAction: 'Gerar Proposta de Renovação',
          timeSinceLastContact: 'Contrato Ativo',
          daysWaiting: daysUntil
        });
      }
    });

    // 4. REACTIVATION & BEHAVIOR (RC16)
    for (const client of clients) {
      const clientBudgets = budgets.filter(b => b.clientId === client.id);
      if (clientBudgets.length === 0) continue;
      
      const lastIntDate = new Date(clientBudgets.sort((a,b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0].updatedAt || clientBudgets[0].createdAt);
      const daysInact = Math.floor((now - lastIntDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysInact >= 90) {
        const prob = daysInact > 180 ? 0.3 : 0.6;
        opportunities.push({
          id: client.id,
          type: 'REACTIVATION',
          temperature: daysInact > 180 ? 'COLD' : 'WARM',
          title: 'Cliente Inativo',
          clientName: client.name,
          clientId: client.id,
          expectedRevenue: 450,
          weightedValue: 450 * prob,
          score: daysInact > 180 ? 40 : 70,
          probability: prob,
          recommendedAction: 'Propor Checkup Preventivo',
          timeSinceLastContact: `${daysInact} dias`,
          daysWaiting: daysInact,
          returnProbability: prob * 100
        });
      }
    }

    // 5. EXPANSION (RC16)
    for (const client of clients) {
      const clientPlans = plans.filter(p => p.clientId === client.id);
      const clientAssets = await db.assets.where('clientId').equals(client.id).toArray();
      if (clientAssets.length > 5 && clientPlans.length === 0) {
        opportunities.push({
          id: `exp-${client.id}`,
          type: 'EXPANSION',
          temperature: 'WARM',
          title: 'Upgrade para Contrato',
          clientName: client.name,
          clientId: client.id,
          expectedRevenue: clientAssets.length * 150,
          weightedValue: (clientAssets.length * 150) * 0.5,
          score: 75,
          probability: 0.5,
          recommendedAction: 'Propor Plano PMOC',
          timeSinceLastContact: 'Apenas serviços avulsos',
          daysWaiting: 0
        });
      }
    }

    return opportunities.sort((a, b) => (b.weightedValue + b.score) - (a.weightedValue + a.score));
  }

  async getRevenueForecast(): Promise<RevenueForecast> {
    const budgets = await db.budgets.where('isDeleted').notEqual(1).toArray();
    const workOrders = await db.workOrders.filter(w => !w.isDeleted).toArray();
    const finance = await db.simpleFinanceRecords.where('isDeleted').notEqual(1).toArray();

    return {
      negotiation: budgets.filter(b => b.status === BUDGET_STATUS.ENVIADO).reduce((acc, b) => acc + safeMoneyValue(b.chargedValue), 0),
      approved: budgets.filter(b => b.status === BUDGET_STATUS.AUTORIZADO).reduce((acc, b) => acc + safeMoneyValue(b.chargedValue), 0),
      execution: workOrders.filter(wo => ['scheduled', 'in-progress', 'en_route'].includes(wo.status)).reduce((acc, wo) => acc + safeMoneyValue(wo.executedValue || wo.originalValue), 0),
      collection: finance.filter(f => f.status !== 'paid').reduce((acc, f) => acc + safeMoneyValue(f.openBalance), 0),
      guaranteed: 0 
    };
  }
}

export const nextMoneyEngine = new NextMoneyEngine();
