import { db } from '../storage/dexieDatabase';
import { deriveAttendanceStatus } from '../domain/attendance';

export class AttendanceAggregationService {
  /**
   * Recalculates and materializes all aggregates for a single Attendance.
   */
  async recalculate(attendanceId: string): Promise<void> {
    if (!attendanceId) return;

    try {
      // 1. Fetch the Attendance
      const attendance = await db.attendances.get(attendanceId);
      if (!attendance || attendance.isDeleted) {
        console.warn(`[AggregationService] Attendance ${attendanceId} not found or is deleted.`);
        return;
      }

      // 2. Fetch children via indexed queries (O(log N)) and filter soft deleted records (FASE 2.6)
      const [allBudgets, allWorkOrders] = await Promise.all([
        db.budgets.where('attendanceId').equals(attendanceId).toArray(),
        db.workOrders.where('attendanceId').equals(attendanceId).toArray()
      ]);

      const budgets = allBudgets.filter(b => !b.isDeleted);
      const workOrders = allWorkOrders.filter(w => !w.isDeleted);

      // 3. Derive status using pure business logic (Hardened in FASE 2.6)
      const status = deriveAttendanceStatus(budgets, workOrders);

      // 4. Compute WorkOrder statistics on active valid OSs (FASE 2.6)
      const totalWorkOrders = workOrders.length;
      const completedWorkOrders = workOrders.filter(w => w.status === 'done').length;
      const progress = totalWorkOrders > 0 ? Math.round((completedWorkOrders / totalWorkOrders) * 100) : 0;

      // 5. Compute Budget statistics
      const totalBudgets = budgets.length;
      const authorizedBudgetsList = budgets.filter(b => 
        b.status === 'autorizado' || b.status === 'em_execucao' || b.status === 'finalizado'
      );
      const authorizedBudgets = authorizedBudgetsList.length;

      // 6. Compute planned revenue with budget exclusivity (FASE 2.6)
      let revenuePlanned = 0;
      for (const b of authorizedBudgetsList) {
        if (b.budgetGroupId && b.selectionMode === 'exclusive') {
          if (b.isPrimary) {
            revenuePlanned += (b.chargedValue || 0);
          }
        } else {
          revenuePlanned += (b.chargedValue || 0);
        }
      }

      // 7. Compute executed revenue (sum of receivedValue of active finance records related to active OSs)
      const osIds = workOrders.map(w => w.id);
      let revenueExecuted = 0;
      if (osIds.length > 0) {
        const relatedFinance = await db.simpleFinanceRecords.where('workOrderId').anyOf(osIds).toArray();
        revenueExecuted = relatedFinance
          .filter(f => !f.isDeleted)
          .reduce((sum, f) => sum + (f.receivedValue || 0), 0);
      }

      // 8. Materialize aggregates in Attendance database record
      await db.attendances.update(attendanceId, {
        status,
        progress,
        totalWorkOrders,
        completedWorkOrders,
        totalBudgets,
        authorizedBudgets,
        revenueExecuted,
        revenuePlanned,
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending'
      });

      console.log(`[AggregationService] Materialized aggregates for Attendance ${attendanceId}:`, {
        status,
        progress,
        totalWorkOrders,
        completedWorkOrders,
        revenueExecuted,
        revenuePlanned
      });
    } catch (err) {
      console.error(`[AggregationService] Error recalculating Attendance ${attendanceId}:`, err);
    }
  }
}

export const attendanceAggregationService = new AttendanceAggregationService();
