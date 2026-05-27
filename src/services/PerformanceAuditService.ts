export type PerformanceWarning = {
  type: 'render_pressure' | 'large_collection' | 'memory_leak_risk' | 'long_task';
  description: string;
  severity: 'low' | 'medium' | 'high';
};

export const performanceAuditService = {
  detectLargeCollections(collections: { name: string; count: number }[]): PerformanceWarning[] {
    const warnings: PerformanceWarning[] = [];
    
    for (const c of collections) {
      if (c.count > 1000) {
        warnings.push({
          type: 'large_collection',
          description: `Collection ${c.name} has ${c.count} items. Approaching pagination limits.`,
          severity: c.count > 5000 ? 'high' : 'medium'
        });
      }
    }
    
    return warnings;
  },

  detectRenderPressure(fps: number, recentRenderTimes: number[]): PerformanceWarning[] {
    const warnings: PerformanceWarning[] = [];
    
    const avgRender = recentRenderTimes.reduce((a, b) => a + b, 0) / (recentRenderTimes.length || 1);
    if (avgRender > 16) {
      warnings.push({
        type: 'render_pressure',
        description: `Average render time is ${Math.round(avgRender)}ms. Target is <16ms (60fps).`,
        severity: avgRender > 50 ? 'high' : 'medium'
      });
    }

    return warnings;
  },

  detectMemoryLeaks(activeListeners: number, intervalCount: number): PerformanceWarning[] {
    const warnings: PerformanceWarning[] = [];
    
    if (activeListeners > 100) {
      warnings.push({
        type: 'memory_leak_risk',
        description: `High number of active listeners: ${activeListeners}. Possible event leak.`,
        severity: 'high'
      });
    }

    if (intervalCount > 10) {
      warnings.push({
        type: 'memory_leak_risk',
        description: `Unusual number of active intervals: ${intervalCount}. Ensure cleanup.`,
        severity: 'medium'
      });
    }

    return warnings;
  }
};
