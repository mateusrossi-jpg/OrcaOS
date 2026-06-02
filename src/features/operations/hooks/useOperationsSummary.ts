import { useEffect, useState } from 'react';
import { db } from '../../../storage/dexieDatabase';

export interface OperationsSummary {
  executingCount: number;
  pendingCount: number;
  authorizedCount: number;
}

/**
 * useOperationsSummary: The Operations Authority for current counts.
 * Responsibility: Counting objects in specific operational phases.
 * Source of Truth: Attendance unified operational state.
 */
export function useOperationsSummary(): OperationsSummary {
  const [summary, setSummary] = useState<OperationsSummary>({
    executingCount: 0,
    pendingCount: 0,
    authorizedCount: 0
  });

  useEffect(() => {
    async function load() {
      try {
        const attendances = await db.attendances.toArray();
        const executingCount = attendances.filter(a => a.status === 'em_execucao').length;
        const pendingCount = attendances.filter(a => a.status === 'iniciado').length;
        const authorizedCount = attendances.filter(a => a.status === 'autorizado').length;
        setSummary({ executingCount, pendingCount, authorizedCount });
      } catch (err) {
        console.error('Error loading operations summary from attendances:', err);
      }
    }
    load();
    
    // Polling backup to keep stats fresh across screen switches
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, []);

  return summary;
}
