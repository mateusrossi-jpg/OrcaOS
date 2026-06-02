import { db } from '../storage/dexieDatabase';
import { DispatchJob } from '../domain/dispatch';
import { DispatchSuggestionService } from './DispatchSuggestionService';

const generateId = () => Math.random().toString(36).substring(2, 15);

export class AutoDispatchService {
  static async dispatch(job: DispatchJob): Promise<boolean> {
    const suggestion = await DispatchSuggestionService.suggest(job);
    
    if (!suggestion) return false;

    // Atualiza o Job
    await db.dispatchJobs.update(job.id, {
      assignedTechnicianId: suggestion.suggestedTechnicianId,
      status: 'ASSIGNED'
    });

    const date = job.scheduledDate.split('T')[0];

    // Busca assignment
    let assignment = await db.routeAssignments
      .where({ companyId: job.companyId, technicianId: suggestion.suggestedTechnicianId, date })
      .first();

    if (!assignment) {
      assignment = {
        id: generateId(),
        companyId: job.companyId,
        workspaceId: job.workspaceId,
        technicianId: suggestion.suggestedTechnicianId,
        date,
        jobsIds: [job.id]
      };
      await db.routeAssignments.put(assignment);
    } else {
      assignment.jobsIds.push(job.id);
      await db.routeAssignments.update(assignment.id, { jobsIds: assignment.jobsIds });
    }

    // Registra evento no EventBus
    await db.operationalEvents.put({
      id: generateId(),
      aggregateId: job.id,
      aggregateType: 'dispatch',
      eventType: 'TECHNICIAN_ASSIGNED',
      timestamp: new Date().toISOString(),
      actor: 'SYSTEM',
      source: 'AutoDispatchService',
      createdAt: new Date().toISOString()
    });

    return true;
  }
}
