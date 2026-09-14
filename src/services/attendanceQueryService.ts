/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 * Do not access storage/repository directly from UI/hooks.
 */

import { db } from '../storage/dexieDatabase';
import { Attendance } from '../domain/attendance';

export class AttendanceQueryService {
  async getAll(): Promise<Attendance[]> {
    return await db.attendances.toArray();
  }

  async getById(id: string): Promise<Attendance | undefined> {
    return await db.attendances.get(id);
  }

  async getCountByStatus(): Promise<Record<string, number>> {
    const all = await db.attendances.toArray();
    const counts: Record<string, number> = {};
    for (const a of all) {
      counts[a.status] = (counts[a.status] || 0) + 1;
    }
    return counts;
  }

  async add(attendance: Attendance): Promise<void> {
    await db.attendances.add(attendance);
  }

  async count(): Promise<number> {
    return await db.attendances.count();
  }
}

export const attendanceQueryService = new AttendanceQueryService();
