import { db } from '../storage/dexieDatabase';
import { DispatchAlert } from '../domain/dispatch';

export class SLAService {
  static async checkSLAs(companyId: string) {
    const activeJobs = await db.dispatchJobs
      .where('[companyId+status]')
      .anyOf([[companyId, 'ASSIGNED'], [companyId, 'PENDING']])
      .toArray();

    const now = new Date().getTime();
    const alertsToPut: DispatchAlert[] = [];

    for (const job of activeJobs) {
      const scheduledTime = new Date(job.scheduledDate).getTime();
      
      if (job.status === 'ASSIGNED' && now > scheduledTime) {
        // Alerta: Técnico não iniciou a OS a tempo
        alertsToPut.push({
          id: `alert-${job.id}-${now}`,
          companyId: job.companyId,
          workspaceId: job.workspaceId,
          jobId: job.id,
          type: 'LATE_ARRIVAL',
          message: `Técnico atrasado para o serviço agendado às ${new Date(scheduledTime).toLocaleTimeString()}`,
          resolved: false,
          createdAt: new Date().toISOString()
        });
      }

      if (job.priority === 'EMERGENCY' && job.status === 'PENDING') {
        const timePending = now - new Date(job.createdAt).getTime();
        if (timePending > 15 * 60 * 1000) { // Emergência pendente por mais de 15 minutos
          alertsToPut.push({
            id: `alert-${job.id}-${now}`,
            companyId: job.companyId,
            workspaceId: job.workspaceId,
            jobId: job.id,
            type: 'EMERGENCY',
            message: 'Emergência sem técnico atribuído há mais de 15 minutos!',
            resolved: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    if (alertsToPut.length > 0) {
      await db.dispatchAlerts.bulkPut(alertsToPut);
    }
  }
}
