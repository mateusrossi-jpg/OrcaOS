import React, { useState, useMemo } from 'react';
import type { SavedBudgetRecord } from '../storage/savedBudgetsStorage';
import type { OperationalSnapshot } from '../../../core/types/business';

interface SnapshotInspectorProps {
  budget: SavedBudgetRecord;
}

export function SnapshotInspector({ budget }: SnapshotInspectorProps) {
  const snapshots = budget.snapshots || [];
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(
    snapshots.length > 0 ? snapshots[snapshots.length - 1].snapshotId : null
  );

  const selectedSnapshot = useMemo(() => {
    return snapshots.find(s => s.snapshotId === selectedSnapshotId) || null;
  }, [snapshots, selectedSnapshotId]);

  const money = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const diffs = useMemo(() => {
    if (!selectedSnapshot) return null;

    const currentSubtotal = budget.total_servicos + budget.custo_materiais + budget.custos_operacionais;
    const currentFinalTotal = currentSubtotal - budget.discount;

    const itemsChanged = selectedSnapshot.items.length !== budget.items.length;
    const statusChanged = selectedSnapshot.workflowStatus !== budget.status;
    const totalChanged = Math.abs(selectedSnapshot.totals.finalTotal - currentFinalTotal) > 0.01;

    return {
      status: { old: selectedSnapshot.workflowStatus, new: budget.status, changed: statusChanged },
      finalTotal: { old: selectedSnapshot.totals.finalTotal, new: currentFinalTotal, changed: totalChanged },
      itemCount: { old: selectedSnapshot.items.length, new: budget.items.length, changed: itemsChanged },
      client: { old: selectedSnapshot.clientSnapshot?.name || '—', new: budget.clientName, changed: selectedSnapshot.clientSnapshot?.name !== budget.clientName }
    };
  }, [selectedSnapshot, budget]);

  const hasDifferences = useMemo(() => {
    if (!diffs) return false;
    return diffs.status.changed || diffs.finalTotal.changed || diffs.itemCount.changed || diffs.client.changed;
  }, [diffs]);

  if (snapshots.length === 0) {
    return null;
  }

  return (
    <div className="snapshot-inspector">
      <div className="snapshot-inspector-header">
        <span className="snapshot-inspector-title">Inspetor de Snapshots</span>
        <span className="snapshot-hash" style={{ fontSize: '10px' }}>
          {selectedSnapshot?.fingerprint}
        </span>
      </div>

      <div className="snapshot-selector">
        {snapshots.map((snap) => (
          <button
            key={snap.snapshotId}
            className={`snapshot-selector-item ${selectedSnapshotId === snap.snapshotId ? 'active' : ''}`}
            onClick={() => setSelectedSnapshotId(snap.snapshotId)}
          >
            <span className="snapshot-selector-state">{snap.workflowStatus}</span>
            <span className="snapshot-selector-hash">{snap.fingerprint}</span>
          </button>
        ))}
      </div>

      <div className="snapshot-diff-panel">
        <div className="snapshot-diff-summary">
          <div className="snapshot-diff-col">
            <span className="snapshot-diff-label">Snapshot Salvo</span>
            <div className="snapshot-diff-grid">
              <span className="snapshot-diff-field">Status:</span>
              <span className="snapshot-diff-value">{selectedSnapshot?.workflowStatus}</span>
              <span className="snapshot-diff-field">Cliente:</span>
              <span className="snapshot-diff-value">{selectedSnapshot?.clientSnapshot?.name}</span>
              <span className="snapshot-diff-field">Itens:</span>
              <span className="snapshot-diff-value">{selectedSnapshot?.items.length}</span>
              <span className="snapshot-diff-field">Total:</span>
              <span className="snapshot-diff-value">{money(selectedSnapshot?.totals.finalTotal || 0)}</span>
            </div>
          </div>

          <div className="snapshot-diff-col">
            <span className="snapshot-diff-label">Estado Atual</span>
            <div className="snapshot-diff-grid">
              <span className="snapshot-diff-field">Status:</span>
              <span className={`snapshot-diff-value ${diffs?.status.changed ? 'changed' : ''}`}>{budget.status}</span>
              <span className="snapshot-diff-field">Cliente:</span>
              <span className={`snapshot-diff-value ${diffs?.client.changed ? 'changed' : ''}`}>{budget.clientName}</span>
              <span className="snapshot-diff-field">Itens:</span>
              <span className={`snapshot-diff-value ${diffs?.itemCount.changed ? 'changed' : ''}`}>{budget.items.length}</span>
              <span className="snapshot-diff-field">Total:</span>
              <span className={`snapshot-diff-value ${diffs?.finalTotal.changed ? 'changed' : ''}`}>
                {money((budget.total_servicos + budget.custo_materiais + budget.custos_operacionais) - budget.discount)}
              </span>
            </div>
          </div>
        </div>

        {hasDifferences && (
          <div className="snapshot-warning">
            ⚠️ Estado atual difere do snapshot {selectedSnapshot?.workflowStatus}.
          </div>
        )}
      </div>
    </div>
  );
}
