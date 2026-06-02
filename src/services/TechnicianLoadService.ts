import { db } from '../storage/dexieDatabase';

export class TechnicianLoadService {
  static async getDailyLoad(companyId: string, technicianId: string, date: string): Promise<number> {
    const shift = await db.technicianShifts
      .where({ companyId, technicianId, date })
      .first();

    if (!shift || !shift.isActive) {
      return 100; // Totalmente indisponível
    }

    const assignments = await db.routeAssignments
      .where({ companyId, technicianId, date })
      .first();

    if (!assignments || assignments.jobsIds.length === 0) {
      return 0; // Totalmente livre
    }

    let totalDuration = 0;
    for (const jobId of assignments.jobsIds) {
      const job = await db.dispatchJobs.get(jobId);
      if (job && job.status !== 'CANCELLED' && job.status !== 'MISSED') {
        totalDuration += job.estimatedDurationMinutes;
      }
    }

    const loadPercentage = (totalDuration / shift.maxLoadMinutes) * 100;
    return Math.min(Math.round(loadPercentage), 100);
  }

  static async getAvailableTechnicians(companyId: string, date: string): Promise<{ technicianId: string; load: number }[]> {
    const shifts = await db.technicianShifts
      .where('companyId').equals(companyId)
      .filter(s => s.date === date && s.isActive)
      .toArray();

    const results = [];
    for (const shift of shifts) {
      const load = await this.getDailyLoad(companyId, shift.technicianId, date);
      results.push({ technicianId: shift.technicianId, load });
    }

    return results.sort((a, b) => a.load - b.load);
  }
}
