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

    const jobs = await db.dispatchJobs.bulkGet(assignments.jobsIds);
    let totalDuration = 0;
    for (const job of jobs) {
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

    if (shifts.length === 0) {
      return [];
    }

    const techIds = new Set(shifts.map(s => s.technicianId));

    const assignmentsList = await db.routeAssignments
      .where('companyId').equals(companyId)
      .filter(ra => ra.date === date && techIds.has(ra.technicianId))
      .toArray();

    const assignmentsByTech = new Map<string, string[]>();
    const allJobIdsSet = new Set<string>();

    for (const assignment of assignmentsList) {
      if (assignment.jobsIds && assignment.jobsIds.length > 0) {
        assignmentsByTech.set(assignment.technicianId, assignment.jobsIds);
        for (const jobId of assignment.jobsIds) {
          allJobIdsSet.add(jobId);
        }
      }
    }

    const allJobIds = Array.from(allJobIdsSet);
    const jobs = allJobIds.length > 0 ? await db.dispatchJobs.bulkGet(allJobIds) : [];

    const jobsById = new Map<string, { status: string; estimatedDurationMinutes: number }>();
    for (let i = 0; i < allJobIds.length; i++) {
      const job = jobs[i];
      if (job) {
        jobsById.set(allJobIds[i], job);
      }
    }

    const results = [];
    for (const shift of shifts) {
      const jobIds = assignmentsByTech.get(shift.technicianId);
      let load = 0;

      if (jobIds && jobIds.length > 0) {
        let totalDuration = 0;
        for (const jobId of jobIds) {
          const job = jobsById.get(jobId);
          if (job && job.status !== 'CANCELLED' && job.status !== 'MISSED') {
            totalDuration += job.estimatedDurationMinutes;
          }
        }
        const loadPercentage = (totalDuration / shift.maxLoadMinutes) * 100;
        load = Math.min(Math.round(loadPercentage), 100);
      }

      results.push({ technicianId: shift.technicianId, load });
    }

    return results.sort((a, b) => a.load - b.load);
  }
}
