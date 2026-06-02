import { db } from '../storage/dexieDatabase';

export class CustomerHealthEvolution {
  static async getEvolution(clientId: string): Promise<Array<{ date: string; score: number }>> {
    const events = await db.operationalEvents
      .where({ aggregateId: clientId, eventType: 'CUSTOMER_HEALTH_CHANGED' })
      .toArray();

    // Na prática, teríamos que ler snapshots reais.
    // Para simplificação do MVP, retornamos os eventos convertidos.
    // Em um sistema real o EventStore manteria a state machine do Health.

    return events.map((e, index) => ({
      date: e.timestamp,
      score: 100 - (index * 5) // Mock apenas para formato
    }));
  }
}
