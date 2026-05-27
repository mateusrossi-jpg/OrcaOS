import React, { useState, useEffect } from 'react';
import { internalDiagnostics, OperationalHealthReport } from '../../../services/InternalDiagnosticsService';

export const DebugPanel: React.FC = () => {
  const [report, setReport] = useState<OperationalHealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { AFERIX_DEBUG: () => void }).AFERIX_DEBUG = () => {
        setVisible(true);
        runScan();
      };
    }
  }, []);

  const runScan = async () => {
    setLoading(true);
    const result = await internalDiagnostics.runFullIntegrityAudit();
    setReport(result);
    setLoading(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      color: '#0f0',
      zIndex: 99999,
      overflow: 'auto',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      <h2>Aferix Internal Diagnostics Panel</h2>
      <button onClick={() => setVisible(false)} style={{ background: '#f00', color: '#fff', padding: '10px' }}>CLOSE</button>
      <button onClick={runScan} style={{ background: '#00f', color: '#fff', padding: '10px', marginLeft: '10px' }}>RE-SCAN</button>
      
      {loading && <p>Running diagnostic scan...</p>}
      
      {report && (
        <div style={{ marginTop: '20px' }}>
          <h3>Health Score: {report.healthScore}/100</h3>
          <p>Database Version: {report.databaseVersion}</p>
          <p>Total Budgets: {report.totalBudgets} (Pending Sync: {report.pendingSyncCount}, Deleted: {report.deletedSyncCount})</p>
          <p>Total Clients: {report.totalClients}</p>
          <p>Total WorkOrders: {report.totalWorkOrders}</p>

          <h4 style={{ color: '#f00' }}>Critical Issues ({report.criticalIssues.length})</h4>
          <ul>
            {report.criticalIssues.map((issue, i) => <li key={i}>{issue}</li>)}
          </ul>

          <h4 style={{ color: '#ff0' }}>Warnings ({report.warnings.length})</h4>
          <ul>
            {report.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};
