import { db } from '../database/db';
import type { BootstrapJob, BootstrapState } from '../database/schema';

export class BootstrapManager {
  static async getJob(tenantId: string, phase: string): Promise<BootstrapJob | null> {
    const id = `${tenantId}_${phase}`;
    return await db.bootstrap_jobs.get(id) || null;
  }

  static async saveJob(job: Omit<BootstrapJob, 'id'>): Promise<void> {
    const id = `${job.tenant_id}_${job.phase}`;
    await db.bootstrap_jobs.put({
      ...job,
      id
    });
  }

  static async updateStatus(tenantId: string, phase: string, status: BootstrapState): Promise<void> {
    const job = await this.getJob(tenantId, phase);
    if (job) {
      job.status = status;
      if (status === 'completed') {
        job.completed_at = new Date().toISOString();
      }
      await this.saveJob(job);
    }
  }

  static async isBootstrapComplete(tenantId: string): Promise<boolean> {
    const jobs = await db.bootstrap_jobs.where({ tenant_id: tenantId }).toArray();
    if (jobs.length === 0) return false;
    return jobs.every(job => job.status === 'completed');
  }
}
