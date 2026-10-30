import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../storage/dexieDatabase';
import { TechnicianLoadService } from '../TechnicianLoadService';
import { DispatchJob, TechnicianShift, RouteAssignment } from '../../domain/dispatch';

describe('TechnicianLoadService Performance', () => {
  beforeEach(async () => {
    await db.dispatchJobs.clear();
    await db.technicianShifts.clear();
    await db.routeAssignments.clear();
  });

  it('measures performance of getAvailableTechnicians with 50 technicians', async () => {
    const companyId = 'perf-co';
    const date = '2026-06-01';
    const techCount = 50;
    const jobsPerTech = 5;

    const shifts: TechnicianShift[] = [];
    const assignments: RouteAssignment[] = [];
    const jobs: DispatchJob[] = [];

    for (let i = 0; i < techCount; i++) {
      const techId = `tech-${i}`;
      shifts.push({
        id: `shift-${i}`,
        companyId,
        workspaceId: 'w-1',
        technicianId: techId,
        date,
        startShift: '08:00',
        endShift: '18:00',
        isActive: true,
        maxLoadMinutes: 480
      });

      const jobIds = [];
      for (let j = 0; j < jobsPerTech; j++) {
        const jobId = `job-${i}-${j}`;
        jobIds.push(jobId);
        jobs.push({
          id: jobId,
          companyId,
          workspaceId: 'w-1',
          workOrderId: `wo-${i}-${j}`,
          clientId: `c-${i}`,
          siteId: `s-${i}`,
          status: 'PENDING',
          priority: 'NORMAL',
          scheduledDate: `${date}T10:00:00Z`,
          estimatedDurationMinutes: 60,
          createdAt: new Date().toISOString()
        });
      }

      assignments.push({
        id: `assign-${i}`,
        companyId,
        workspaceId: 'w-1',
        technicianId: techId,
        date,
        jobsIds: jobIds
      });
    }

    await db.technicianShifts.bulkPut(shifts);
    await db.routeAssignments.bulkPut(assignments);
    await db.dispatchJobs.bulkPut(jobs);

    const start = performance.now();
    const available = await TechnicianLoadService.getAvailableTechnicians(companyId, date);
    const end = performance.now();

    const duration = end - start;
    console.log(`[BENCHMARK] getAvailableTechnicians (${techCount} techs, ${techCount * jobsPerTech} jobs): ${duration.toFixed(2)} ms`);

    expect(available.length).toBe(techCount);
    expect(available[0].load).toBe(63); // 300 / 480 = 62.5% -> rounded 63%
  });
});
