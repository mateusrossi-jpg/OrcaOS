import { db } from '../storage/dexieDatabase';
import { RecurrenceLevel } from '../domain/warranty';

export class RecurrenceAnalyzer {
  static async analyze(companyId: string, assetId: string, partName: string, symptom: string): Promise<{
    isRecurrence: boolean;
    level: RecurrenceLevel;
  }> {
    const pastIncidents = await db.warrantyIncidents
      .where({ companyId })
      .filter(i => i.assetId === assetId && i.partName === partName)
      .toArray();

    let level: RecurrenceLevel = 'LOW';
    let isRecurrence = pastIncidents.length > 0;

    if (pastIncidents.length >= 3) {
      level = 'CRITICAL';
    } else if (pastIncidents.length === 2) {
      level = 'HIGH';
    } else if (pastIncidents.length === 1) {
      level = 'MEDIUM';
    }

    if (isRecurrence) {
      await db.operationalEvents.put({
        id: `evt-rec-${Date.now()}`,
        aggregateId: assetId,
        aggregateType: 'asset',
        eventType: 'RECURRENCE_DETECTED',
        timestamp: new Date().toISOString(),
        actor: 'SYSTEM',
        source: 'RecurrenceAnalyzer',
        createdAt: new Date().toISOString()
      });
    }

    // Grava o novo incidente
    await db.warrantyIncidents.put({
      id: `wi-${Date.now()}`,
      companyId,
      workspaceId: 'default',
      assetId,
      partName,
      incidentDate: new Date().toISOString(),
      symptom,
      isRecurrence,
      recurrenceLevel: level
    });

    return { isRecurrence, level };
  }
}
