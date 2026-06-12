import React, { useState, useEffect } from 'react';
import { internalDiagnostics, OperationalHealthReport } from '../../../services/InternalDiagnosticsService';
import { useRole } from '../../../hooks/useRole';
import { AferixRole } from '../../workspace/types/RoleFeatureMatrix';
import { seedRealisticDemoData } from '../../../app/utils/AferixDemoDataset';

export const DebugPanel: React.FC = () => {
  const [report, setReport] = useState<OperationalHealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const { role, setRole } = useRole();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      
      (window as unknown as { AFERIX_DEBUG: () => void }).AFERIX_DEBUG = () => {
        setVisible(true);
        runScan();
      };
      // eslint-disable-next-line no-restricted-syntax
      if (localStorage.getItem('aferix_debug') === 'true') {
        setVisible(true);
        runScan();
      }

      const handleOpenDebug = () => {
        setVisible(true);
      };
      window.addEventListener('aferix_open_debug', handleOpenDebug);

      return () => {
        window.removeEventListener('aferix_open_debug', handleOpenDebug);
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

  const roles: AferixRole[] = ['OWNER', 'MANAGER', 'SALES', 'FIELD', 'SOLO', 'CUSTOMER'];

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
      <button onClick={() => { seedRealisticDemoData(); setVisible(false); }} style={{ background: '#d4a94a', color: '#000', padding: '10px', marginLeft: '10px', fontWeight: 'bold' }}>SEED REALISTIC DATA</button>
      
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #0f0' }}>
        <h3>Simular Papel (Role Test)</h3>
        <p>Papel Atual: <strong>{role}</strong></p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {roles.map(r => (
            <button 
              key={r}
              onClick={() => { setRole(r); setVisible(false); }}
              style={{ background: role === r ? '#0f0' : '#333', color: role === r ? '#000' : '#fff', padding: '8px 12px' }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading && <p>Running diagnostic scan...</p>}
      
      {report && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ margin: '10px 0 0 0' }}>Health Score: {report.healthScore}/100</h3>
          <div style={{ marginLeft: '10px', fontSize: '0.9em', color: '#ccc' }}>
            <p>Database: {report.databaseHealthScore}</p>
            <p>Financial: {report.financialHealthScore}</p>
            <p>Operational: {report.operationalHealthScore}</p>
            <p>Performance: {report.performanceHealthScore}</p>
          </div>
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
