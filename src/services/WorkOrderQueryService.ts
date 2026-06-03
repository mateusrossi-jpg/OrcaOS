import { db } from '../storage/dexieDatabase';
import { WorkOrder } from '../core/types/business';
import { Attendance } from '../domain/attendance';

/**
 * WorkOrderQueryService
 * Fonte única de verdade para queries operacionais de OS.
 * Corrige divergência entre Agenda, Rota e Dashboard.
 * EXCEÇÃO CRÍTICA sob OBSERVATION ONLY: bloqueio operacional.
 */
export class WorkOrderQueryService {
  /**
   * Retorna todas as OS válidas (exclui soft-deleted).
   * DEVE ser usada em vez de db.workOrders.toArray() direto.
   */
  async getAllValid(): Promise<WorkOrder[]> {
    return db.workOrders.filter(w => w.syncStatus !== 'deleted').toArray();
  }

  /**
   * OS elegíveis para Agenda e Rota.
   * Lógica unificada: attendance-aware + status filter.
   * Status válidos: awaiting_schedule, scheduled, in-progress
   */
  async getEligibleWorkOrders(): Promise<{ scheduled: WorkOrder[]; inProgress: WorkOrder[]; }> {
    const [wos, attendances] = await Promise.all([
      this.getAllValid(),
      db.attendances.toArray()
    ]);

    const scheduled = wos.filter(wo => {
      const att = attendances.find(a => a.id === wo.attendanceId);
      return att 
        ? att.status === 'autorizado' 
        : (wo.status === 'scheduled' || wo.status === 'awaiting_schedule');
    });

    const inProgress = wos.filter(wo => {
      const att = attendances.find(a => a.id === wo.attendanceId);
      return att ? att.status === 'em_execucao' : wo.status === 'in-progress';
    });

    return { scheduled, inProgress };
  }

  /**
   * OS elegíveis para a Rota de Hoje (filtro de data).
   * Mostra: OS agendadas para hoje + OS sem data (awaiting_schedule) + OS em progresso
   */
  async getTodayRoute(): Promise<{ scheduled: WorkOrder[]; inProgress: WorkOrder[]; doneToday: WorkOrder[]; }> {
    const { scheduled: allScheduled, inProgress } = await this.getEligibleWorkOrders();
    const today = new Date().toISOString().slice(0, 10);

    // Rota de Hoje: OS com scheduledDate = hoje OU sem scheduledDate (aguardando agendamento)
    const scheduled = allScheduled.filter(wo => 
      !wo.scheduledDate || wo.scheduledDate.startsWith(today)
    );

    // Finalizadas hoje
    const allValid = await this.getAllValid();
    const doneToday = allValid.filter(wo => {
      if (wo.status !== 'done') return false;
      return wo.updatedAt?.startsWith(today);
    });

    return { scheduled, inProgress, doneToday };
  }

  /**
   * Retorna os itens categorizados da Agenda.
   * Usado pelas telas de Agenda/OS e Command Center para manter consistência absoluta.
   */
  async getAgendaItems(): Promise<{
    awaiting: WorkOrder[];
    scheduled: WorkOrder[];
    inProgress: WorkOrder[];
    done: WorkOrder[];
    cancelled: WorkOrder[];
  }> {
    const [wos, attendances] = await Promise.all([
      this.getAllValid(),
      db.attendances.toArray()
    ]);

    const resolveStatus = (wo: WorkOrder) => {
      const att = attendances.find(a => a.id === wo.attendanceId);
      if (att) {
        if (att.status === 'iniciado') return 'awaiting_schedule';
        if (att.status === 'autorizado') return 'scheduled';
        if (att.status === 'em_execucao') return 'in-progress';
        if (att.status === 'finalizado' || att.status === 'concluido') return 'done';
        if (att.status === 'cancelado') return 'cancelled';
      }
      return wo.status;
    };

    const awaiting: WorkOrder[] = [];
    const scheduled: WorkOrder[] = [];
    const inProgress: WorkOrder[] = [];
    const done: WorkOrder[] = [];
    const cancelled: WorkOrder[] = [];

    for (const wo of wos) {
      const status = resolveStatus(wo);
      if (status === 'awaiting_schedule') awaiting.push(wo);
      else if (status === 'scheduled') scheduled.push(wo);
      else if (status === 'in-progress') inProgress.push(wo);
      else if (status === 'done') done.push(wo);
      else if (status === 'cancelled') cancelled.push(wo);
    }

    return { awaiting, scheduled, inProgress, done, cancelled };
  }

  /**
   * Contagem de OS ativas para KPIs (Dashboard/OwnerWorkspace).
   */
  async getActiveCount(): Promise<number> {
    const wos = await this.getAllValid();
    return wos.filter(wo => 
      ['awaiting_schedule', 'scheduled', 'in-progress'].includes(wo.status)
    ).length;
  }
}

export const workOrderQueryService = new WorkOrderQueryService();
