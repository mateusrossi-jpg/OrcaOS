import { BusinessHealthService } from './BusinessHealthService';
import { clientMemoryEngine } from './ClientMemoryEngine';

export type CelebrationType = 'RECORD_BROKEN' | 'GOAL_ACHIEVED' | 'DIAMOND_CLIENT' | 'MILESTONE_REACHED';

export interface CelebrationState {
  type: CelebrationType;
  title: string;
  subtitle: string;
  value?: number;
  data?: any;
}

/**
 * CelebrationService
 * Central authority for emotional business milestones (WOW Moments).
 * Dispatched via custom events to be captured by a global overlay.
 */
export class CelebrationService {
  private lastTriggered: Record<string, number> = {};

  /**
   * checkAndTrigger
   * Analyzes current business state and client context to trigger celebrations.
   */
  async checkAndTrigger(clientId?: string): Promise<void> {
    try {
      const health = await BusinessHealthService.getBusinessHealth();
      
      // 1. Check Monthly Goal
      if (health.metaAtingidaPercent >= 100 && !this.lastTriggered['goal_achieved']) {
        this.emit({
          type: 'GOAL_ACHIEVED',
          title: 'META ATINGIDA!',
          subtitle: 'Você alcançou o objetivo de faturamento do mês.',
          value: health.revenueThisMonth
        });
        this.lastTriggered['goal_achieved'] = Date.now();
      }

      // 2. Check Historical Record
      const prevRecord = Number(localStorage.getItem('aferix_record_monthly_revenue')) || 5000;
      if (health.revenueThisMonth > prevRecord) {
        localStorage.setItem('aferix_record_monthly_revenue', String(health.revenueThisMonth));
        this.emit({
          type: 'RECORD_BROKEN',
          title: 'RECORDE HISTÓRICO!',
          subtitle: 'Este é o seu melhor mês até agora.',
          value: health.revenueThisMonth
        });
      }

      // 3. Check Diamond Client (V7/V8)
      if (clientId) {
        const memory = await clientMemoryEngine.getClientMemory(clientId);
        if (memory.tier === 'DIAMANTE' && !this.lastTriggered[`diamond_${clientId}`]) {
          this.emit({
            type: 'DIAMOND_CLIENT',
            title: 'CLIENTE DIAMANTE 💎',
            subtitle: 'Este serviço foi prestado a um dos seus melhores clientes.',
            data: { clientName: 'Premium' }
          });
          this.lastTriggered[`diamond_${clientId}`] = Date.now();
        }
      }

    } catch (err) {
      console.error('[CelebrationService] Analysis failed:', err);
    }
  }

  private emit(state: CelebrationState) {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    
    window.dispatchEvent(new CustomEvent('aferix_wow_moment', { 
      detail: state 
    }));
  }
}

export const celebrationService = new CelebrationService();
