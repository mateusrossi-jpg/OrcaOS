import { ExecutionRiskProfile } from './ExecutionIntelligenceService';

export interface ExecutionRecommendation {
  readonly id: string;
  readonly type: 'actionable' | 'warning' | 'info';
  readonly message: string;
  readonly suggestedAction?: string;
}

/**
 * ExecutionRecommendationEngine
 * Yields smart hints for the technician based on the current intelligence profile.
 * Does not execute domain mutations, strictly view-level hints.
 */
export class ExecutionRecommendationEngine {
  public generateHints(profile: ExecutionRiskProfile): readonly ExecutionRecommendation[] {
    const hints: ExecutionRecommendation[] = [];

    if (profile.recommendedEscalation) {
      hints.push({
        id: 'esc-1',
        type: 'actionable',
        message: 'Atraso crítico ou bloqueio prolongado detectado.',
        suggestedAction: 'Solicitar suporte da Base'
      });
    }

    if (profile.slaRisk === 'high') {
      hints.push({
        id: 'sla-1',
        type: 'warning',
        message: 'SLA próximo do limite (menos de 30 minutos).',
        suggestedAction: 'Priorizar conclusão ou pausar se aguardando'
      });
    }

    if (profile.isBlocked && profile.hasPendingDependencies) {
      hints.push({
        id: 'dep-1',
        type: 'actionable',
        message: 'Execução bloqueada por falta de material.',
        suggestedAction: 'Registrar requisição de material no Almoxarifado'
      });
    }

    if (profile.idleTimeMinutes > 45 && !profile.isBlocked) {
      hints.push({
        id: 'idle-1',
        type: 'info',
        message: 'Nenhuma atividade registrada nos últimos 45 minutos.',
        suggestedAction: 'Atualizar status da OS'
      });
    }

    return hints;
  }
}

export const executionRecommendationEngine = new ExecutionRecommendationEngine();
