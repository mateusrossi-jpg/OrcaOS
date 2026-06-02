import { db } from '../storage/dexieDatabase';

export interface HealthScore {
  score: number;
  label: 'Excelente' | 'Boa' | 'Atenção' | 'Crítica';
  color: string;
}

export class HealthScoreService {
  static async calculateAssetHealth(assetId: string, companyId: string): Promise<HealthScore> {
    let score = 100;

    const anomalies = await db.anomalies.where({ assetId }).filter(a => a.companyId === companyId).toArray();
    const warranties = await db.warranties.where({ assetId }).filter(a => a.companyId === companyId).toArray();

    // Penalizações heurísticas
    // -5 pontos por cada anomalia aberta/crítica
    const openAnomalies = anomalies.filter(a => a.status === 'OPEN');
    score -= openAnomalies.length * 5;

    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    score -= criticalAnomalies.length * 10;

    // -10 se acionou garantia recentemente (últimos 3 meses)
    const recentWarranties = warranties.filter(w => {
      const diffTime = Math.abs(new Date().getTime() - new Date(w.startedAt).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays <= 90;
    });
    score -= recentWarranties.length * 10;

    // Limites de segurança
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    let label: 'Excelente' | 'Boa' | 'Atenção' | 'Crítica' = 'Excelente';
    let color = 'text-status-success';

    if (score >= 90) {
      label = 'Excelente';
      color = 'text-[var(--accent-green)]';
    } else if (score >= 70) {
      label = 'Boa';
      color = 'text-[var(--accent-blue)]';
    } else if (score >= 50) {
      label = 'Atenção';
      color = 'text-[var(--accent-yellow)]';
    } else {
      label = 'Crítica';
      color = 'text-status-error';
    }

    return { score, label, color };
  }
}
