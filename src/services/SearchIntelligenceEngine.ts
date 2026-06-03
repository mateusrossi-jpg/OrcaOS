import { db } from '../storage/dexieDatabase';
import { safeString } from '../core/runtime/safeGuards';

export interface SearchIntelligence {
  recentClients: any[];
  frequentServices: string[];
  recentBudgets: any[];
  recentWorkOrders: any[];
}

/**
 * SearchIntelligenceEngine
 * Provides predictive data for the Zero-Type Search experience.
 */
export class SearchIntelligenceEngine {
  async getIntelligence(): Promise<SearchIntelligence> {
    try {
      const [clients, budgets, workOrders] = await Promise.all([
        db.clients.orderBy('updatedAt').reverse().limit(10).toArray(),
        db.budgets.orderBy('updatedAt').reverse().limit(5).toArray(),
        db.workOrders.orderBy('updatedAt').reverse().limit(5).toArray()
      ]);

      // frequentServices: extract unique titles from recent budgets
      const services = budgets.map(b => b.title).filter(Boolean);
      const uniqueServices = Array.from(new Set(services)).slice(0, 5);

      return {
        recentClients: clients.map(c => ({ id: c.id, name: c.name })),
        frequentServices: uniqueServices,
        recentBudgets: budgets.map(b => ({ id: b.id, title: b.title })),
        recentWorkOrders: workOrders.map(wo => ({ id: wo.id, title: wo.title }))
      };
    } catch (err) {
      console.error('[SearchIntelligenceEngine] Failed:', err);
      return {
        recentClients: [],
        frequentServices: [],
        recentBudgets: [],
        recentWorkOrders: []
      };
    }
  }

  async searchUniversal(query: string): Promise<any[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const [clients, budgets, workOrders] = await Promise.all([
      db.clients.filter(c => 
        Boolean(c.name.toLowerCase().includes(q) || 
        (c.phone && c.phone.includes(q)))
      ).limit(5).toArray(),
      db.budgets.filter(b => 
        b.title.toLowerCase().includes(q)
      ).limit(5).toArray(),
      db.workOrders.filter(wo => 
        wo.title.toLowerCase().includes(q)
      ).limit(5).toArray()
    ]);

    return [
      ...clients.map(c => ({ type: 'client', id: c.id, title: c.name })),
      ...budgets.map(b => ({ type: 'budget', id: b.id, title: b.title })),
      ...workOrders.map(wo => ({ type: 'workorder', id: wo.id, title: wo.title }))
    ];
  }
}

export const searchIntelligenceEngine = new SearchIntelligenceEngine();
