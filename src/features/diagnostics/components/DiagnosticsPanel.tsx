import React, { useState, useEffect } from 'react';
import { traceStore, TraceEnvelope, distributedHealthService, HealthReport } from '../../../core/observability';

export const DiagnosticsPanel: React.FC = () => {
  const [traces, setTraces] = useState<TraceEnvelope[]>([]);
  const [health, setHealth] = useState<HealthReport>({ warnings: 0, errors: 0, criticals: 0, healthy: true });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Basic polling for UI rendering - this is restricted only to the diagnostics panel.
    // In production, an event-emitter would push to this component to be projection-driven.
    const interval = setInterval(() => {
      setTraces(traceStore.getRecentTraces(20));
      setHealth(distributedHealthService.getHealthReport());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!expanded) {
    return (
      <div 
        onClick={() => setExpanded(true)}
        className={`fixed bottom-4 right-4 p-3 rounded-full cursor-pointer shadow-lg flex items-center gap-2 ${
          health.healthy ? 'bg-surface-800 text-text-muted' : 'bg-red-900 text-white animate-pulse'
        }`}
      >
        <span>🛠️ Observability</span>
        {!health.healthy && <span className="font-bold">({health.criticals + health.errors})</span>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-900 w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col border border-surface-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-800">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Distributed Diagnostics</h2>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-red-400">Criticals: {health.criticals}</span>
              <span className="text-orange-400">Errors: {health.errors}</span>
              <span className="text-yellow-400">Warnings: {health.warnings}</span>
            </div>
          </div>
          <button 
            onClick={() => setExpanded(false)}
            className="p-2 text-text-muted hover:text-white"
          >
            ✕ Close
          </button>
        </div>

        {/* Trace List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {traces.length === 0 && (
            <div className="text-center text-text-muted py-8">No traces captured yet.</div>
          )}
          {traces.map((trace) => (
            <div 
              key={trace.traceId} 
              className={`p-3 rounded-lg border text-sm ${
                trace.severity === 'critical' ? 'bg-red-900/20 border-red-800 text-red-200' :
                trace.severity === 'error' ? 'bg-orange-900/20 border-orange-800 text-orange-200' :
                trace.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-800 text-yellow-200' :
                'bg-surface-800 border-surface-700 text-text-secondary'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs opacity-70 mb-1">
                <span>{new Date(trace.timestamp).toLocaleTimeString()} | {trace.diagnosticType}</span>
                <span>{trace.sourceLayer} → {trace.targetLayer}</span>
              </div>
              <div className="font-medium">{trace.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
