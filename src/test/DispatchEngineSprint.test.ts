import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../storage/dexieDatabase';
import { TechnicianLoadService } from '../services/TechnicianLoadService';
import { AutoDispatchService } from '../services/AutoDispatchService';
import { SLAService } from '../services/SLAService';

describe('Dispatch Engine Sprint P0', () => {
  beforeEach(async () => {
    await db.dispatchJobs.clear();
    await db.technicianShifts.clear();
    await db.routeAssignments.clear();
    await db.dispatchAlerts.clear();
    await db.operationalEvents.clear();
  });

  it('deve calcular a carga diária de um técnico corretamente', async () => {
    const companyId = 'test-co';
    const date = '2026-06-01';

    await db.technicianShifts.put({
      id: 's-1', companyId, workspaceId: 'w-1', technicianId: 'tech-1',
      date, startShift: '08:00', endShift: '18:00', isActive: true, maxLoadMinutes: 480
    });

    await db.dispatchJobs.bulkPut([
      { id: 'j-1', companyId, workspaceId: 'w-1', workOrderId: 'w-1', clientId: 'c-1', siteId: 's-1', status: 'COMPLETED', priority: 'NORMAL', scheduledDate: '2026-06-01T10:00:00Z', estimatedDurationMinutes: 120, createdAt: new Date().toISOString() },
      { id: 'j-2', companyId, workspaceId: 'w-1', workOrderId: 'w-2', clientId: 'c-1', siteId: 's-1', status: 'PENDING', priority: 'NORMAL', scheduledDate: '2026-06-01T14:00:00Z', estimatedDurationMinutes: 120, createdAt: new Date().toISOString() }
    ]);

    await db.routeAssignments.put({
      id: 'ra-1', companyId, workspaceId: 'w-1', technicianId: 'tech-1', date, jobsIds: ['j-1', 'j-2']
    });

    const load = await TechnicianLoadService.getDailyLoad(companyId, 'tech-1', date);
    expect(load).toBe(50); // 240 minutos de 480 = 50%
  });

  it('deve disparar alerta de SLA para emergência não atendida', async () => {
    const companyId = 'test-co';
    
    await db.dispatchJobs.put({
      id: 'emer-1', companyId, workspaceId: 'w-1', workOrderId: 'w-1', clientId: 'c-1', siteId: 's-1',
      status: 'PENDING', priority: 'EMERGENCY', scheduledDate: new Date().toISOString(),
      estimatedDurationMinutes: 60,
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() // 20 minutos atrás
    });

    await SLAService.checkSLAs(companyId);

    const alerts = await db.dispatchAlerts.toArray();
    expect(alerts.length).toBe(1);
    expect(alerts[0].type).toBe('EMERGENCY');
  });

  it('deve atribuir automaticamente o melhor técnico e disparar evento', async () => {
    const companyId = 'test-co';
    const date = '2026-06-02';

    // Dois técnicos
    await db.technicianShifts.bulkPut([
      { id: 's-1', companyId, workspaceId: 'w-1', technicianId: 't-1', date, startShift: '08:00', endShift: '18:00', isActive: true, maxLoadMinutes: 480 },
      { id: 's-2', companyId, workspaceId: 'w-1', technicianId: 't-2', date, startShift: '08:00', endShift: '18:00', isActive: true, maxLoadMinutes: 480 }
    ]);

    // T-1 está com 50% de carga (240 min)
    await db.dispatchJobs.put({ id: 'j-old', companyId, workspaceId: 'w-1', workOrderId: 'wo-old', clientId: 'c-1', siteId: 's-1', status: 'COMPLETED', priority: 'NORMAL', scheduledDate: `${date}T09:00:00Z`, estimatedDurationMinutes: 240, createdAt: new Date().toISOString() });
    await db.routeAssignments.put({ id: 'ra-1', companyId, workspaceId: 'w-1', technicianId: 't-1', date, jobsIds: ['j-old'] });

    // Nova OS entra via AutoDispatch
    const newJob = {
      id: 'j-new', companyId, workspaceId: 'w-1', workOrderId: 'w-new', clientId: 'c-2', siteId: 's-2',
      status: 'PENDING' as any, priority: 'NORMAL' as any, scheduledDate: `${date}T14:00:00Z`,
      estimatedDurationMinutes: 120, createdAt: new Date().toISOString()
    };
    await db.dispatchJobs.put(newJob);

    const result = await AutoDispatchService.dispatch(newJob);
    expect(result).toBe(true);

    const updatedJob = await db.dispatchJobs.get('j-new');
    expect(updatedJob?.assignedTechnicianId).toBe('t-2'); // T-2 estava com 0% load
    expect(updatedJob?.status).toBe('ASSIGNED');

    const events = await db.operationalEvents.where({ aggregateId: 'j-new' }).toArray();
    expect(events.length).toBe(1);
    expect(events[0].eventType).toBe('TECHNICIAN_ASSIGNED');
  });

  it('deve aguentar performance de 10.000 serviços de dispatch', async () => {
    const companyId = 'test-co';
    const jobs = [];
    
    for (let i = 0; i < 10000; i++) {
      jobs.push({
        id: `job-perf-${i}`, companyId, workspaceId: 'w-1', workOrderId: `wo-${i}`, clientId: `c-${i}`, siteId: `s-${i}`,
        status: i % 2 === 0 ? 'COMPLETED' : 'PENDING',
        priority: 'NORMAL', scheduledDate: '2026-06-01T10:00:00Z', estimatedDurationMinutes: 60, createdAt: new Date().toISOString()
      });
    }

    const startInsert = performance.now();
    await db.dispatchJobs.bulkPut(jobs as any);
    const endInsert = performance.now();
    
    expect(endInsert - startInsert).toBeLessThan(3000); // Inserção de 10k em menos de 3s

    const startQuery = performance.now();
    const pendings = await db.dispatchJobs.where({ companyId, status: 'PENDING' }).toArray();
    const endQuery = performance.now();

    expect(pendings.length).toBe(5000);
    expect(endQuery - startQuery).toBeLessThan(200); // Consulta abaixo de 200ms
  });
});
