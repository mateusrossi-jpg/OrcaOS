import { db } from '../storage/dexieDatabase';
import { ChurnRiskLevel } from '../domain/contracts';
import { ContractHealthService } from './ContractHealthService';
import { generateId } from '../app/components/ui'; // we'll use a local bypass in tests

export class ChurnRiskService {
  static async evaluateRisk(companyId: string, contractId: string): Promise<ChurnRiskLevel> {
    const health = await ContractHealthService.calculateHealth(companyId, contractId);
    let risk: ChurnRiskLevel = 'LOW';

    if (health < 40) risk = 'CRITICAL';
    else if (health < 60) risk = 'HIGH';
    else if (health < 80) risk = 'MEDIUM';

    if (risk === 'HIGH' || risk === 'CRITICAL') {
      // Dispara alerta pro Owner
      await db.contractAlerts.put({
        id: `ca-${Date.now()}-${contractId}`,
        companyId,
        workspaceId: 'default',
        contractId,
        type: 'HIGH_CHURN_RISK',
        message: `Risco de Cancelamento ${risk}. Health Score caiu para ${health}.`,
        resolved: false,
        createdAt: new Date().toISOString()
      });

      // Lança no Event Bus
      await db.operationalEvents.put({
        id: `evt-${Date.now()}`,
        aggregateId: contractId,
        aggregateType: 'contract',
        eventType: 'CHURN_RISK_DETECTED',
        timestamp: new Date().toISOString(),
        actor: 'SYSTEM',
        source: 'ChurnRiskService',
        createdAt: new Date().toISOString()
      });
    }

    return risk;
  }
}
