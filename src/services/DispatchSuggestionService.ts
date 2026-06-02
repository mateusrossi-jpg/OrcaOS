import { DispatchJob, DispatchSuggestion } from '../domain/dispatch';
import { TechnicianLoadService } from './TechnicianLoadService';

export class DispatchSuggestionService {
  static async suggest(job: DispatchJob): Promise<DispatchSuggestion | null> {
    const date = job.scheduledDate.split('T')[0];
    const available = await TechnicianLoadService.getAvailableTechnicians(job.companyId, date);

    if (available.length === 0) {
      return null;
    }

    // A heurística cruza "Quem está mais ocioso" (Load) com "Disponibilidade"
    const candidates = available.filter(t => t.load < 100);
    
    if (candidates.length === 0) {
      return null; // Todos lotados
    }

    const bestFit = candidates[0]; // O com menor load (lista já vem ordenada por load ascendente)

    return {
      jobId: job.id,
      suggestedTechnicianId: bestFit.technicianId,
      confidenceScore: 100 - bestFit.load,
      reasons: [
        `Menor carga de trabalho no dia (${bestFit.load}%)`,
        `Disponibilidade no período da OS`
      ]
    };
  }
}
