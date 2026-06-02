import { db } from '../storage/dexieDatabase';
import { RiskLevel } from '../domain/customerSuccess';
import { CustomerSuccessTaskService } from './CustomerSuccessTaskService';

export class CustomerRiskAnalyzer {
  static async evaluateRisk(companyId: string, clientId: string): Promise<void> {
    const workspaceId = 'default';
    const now = new Date().toISOString();
    
    // Simulação de fatores que compõem o risco:
    // - Garantias acionadas
    // - Reincidência de anomalias
    // - Contratos não renovados ou health baixo

    const contracts = await db.contracts.where({ clientId }).toArray();
    const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
    
    const incidents = await db.warrantyIncidents.toArray(); // Simplificado para este MVP
    const clientIncidents = incidents.filter(i => true); // Num cenário real filtraria por ativo do cliente

    let riskFactors: string[] = [];
    let mrrAtRisk = 0;
    let riskLevel: RiskLevel = 'HEALTHY';
    let healthScore = 100;

    if (activeContracts.length > 0) {
      mrrAtRisk = activeContracts.reduce((sum, c) => sum + (c.amount || 0), 0);
    } else {
      healthScore -= 20;
      riskFactors.push('Sem contrato ativo');
    }

    if (clientIncidents.length > 3) {
      healthScore -= 30;
      riskFactors.push('Alta reincidência técnica (Garantias/Retornos)');
    }

    // Propostas não aprovadas a muito tempo
    const proposals = await db.proposals.where({ clientId, status: 'SENT' }).toArray();
    if (proposals.length > 2) {
      healthScore -= 15;
      riskFactors.push('Múltiplas propostas não aprovadas');
    }

    // Cálculo do Level
    if (healthScore < 40) riskLevel = 'CRITICAL';
    else if (healthScore < 70) riskLevel = 'AT_RISK';
    else if (healthScore < 90) riskLevel = 'ATTENTION';
    else riskLevel = 'HEALTHY';

    // Grava/Atualiza o Health
    const existingHealth = await db.customerHealth.where({ clientId }).first();
    if (existingHealth) {
      await db.customerHealth.update(existingHealth.id, {
        healthScore,
        riskLevel,
        lastCalculatedAt: now
      });
      
      if (existingHealth.riskLevel !== riskLevel) {
        await db.operationalEvents.put({
          id: `evt-hlth-${Date.now()}`,
          aggregateId: clientId,
          aggregateType: 'client',
          eventType: 'CUSTOMER_HEALTH_CHANGED',
          timestamp: now,
          actor: 'SYSTEM',
          source: 'CustomerRiskAnalyzer'
        } as any);
      }
    } else {
      await db.customerHealth.put({
        id: `hlth-${Date.now()}`,
        companyId,
        workspaceId,
        clientId,
        healthScore,
        riskLevel,
        lastCalculatedAt: now
      });
    }

    // Se estiver em risco, registrar a entidade Risk
    if (riskLevel === 'CRITICAL' || riskLevel === 'AT_RISK') {
      const existingRisk = await db.customerRisks.where({ clientId }).first();
      if (!existingRisk) {
        await db.customerRisks.put({
          id: `risk-${Date.now()}`,
          companyId,
          workspaceId,
          clientId,
          mrrAtRisk,
          riskFactors,
          detectedAt: now
        });

        await db.operationalEvents.put({
          id: `evt-risk-${Date.now()}`,
          aggregateId: clientId,
          aggregateType: 'client',
          eventType: 'CUSTOMER_AT_RISK',
          timestamp: now,
          actor: 'SYSTEM',
          source: 'CustomerRiskAnalyzer'
        } as any);

        // Gera tarefa automática
        await CustomerSuccessTaskService.createTask({
          companyId,
          workspaceId,
          clientId,
          type: 'CALL',
          notes: `Risco Detectado: ${riskFactors.join(', ')}. Ligar urgente.`,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      } else {
        await db.customerRisks.update(existingRisk.id, {
          mrrAtRisk,
          riskFactors
        });
      }
    } else {
      // Se melhorou, remove o risk se existir (ou marca mitigado)
      const existingRisk = await db.customerRisks.where({ clientId }).first();
      if (existingRisk) {
        await db.customerRisks.delete(existingRisk.id);
      }
    }
  }
}
