import { useEffect, useState } from 'react';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import { Card } from './ui';
import { db } from '../../storage/dexieDatabase';
import './ActiveWorkContextCard.css';

interface ActiveWorkContextCardProps {
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}

const STATUS_LABELS: Record<string, string> = {
  iniciado: 'Iniciado',
  autorizado: 'Autorizado',
  em_execucao: 'Executando',
  finalizado: 'Concluído',
  cancelado: 'Cancelado',
  arquivado: 'Arquivado'
};

/**
 * ActiveWorkContextCard: Professional context HUD.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 * Consumes Attendance.status as the unified source of truth.
 */
export function ActiveWorkContextCard({ activeClient, activeWorkOrder }: ActiveWorkContextCardProps) {
  const [statusLabel, setStatusLabel] = useState('N/A');

  useEffect(() => {
    if (!activeWorkOrder) return;
    const wo = activeWorkOrder;

    async function loadAttendanceStatus() {
      try {
        const att = wo.attendanceId 
          ? await db.attendances.get(wo.attendanceId)
          : undefined;

        if (att) {
          setStatusLabel(STATUS_LABELS[att.status] || att.status);
        } else {
          // Fallback to legacy work order status
          setStatusLabel(wo.status === 'in-progress' ? 'Executando' : 'Concluído');
        }
      } catch (err) {
        console.error('Error fetching attendance status for HUD:', err);
        setStatusLabel(wo.status === 'in-progress' ? 'Executando' : 'Concluído');
      }
    }

    loadAttendanceStatus();
  }, [activeWorkOrder]);

  return (
    <Card className="p-card mb-lg">
      <div className="flex flex-col gap-xs">
        <span className="text-ui-xs text-[var(--accent-gold)] mb-1">Serviço em Foco</span>
        {activeWorkOrder ? (
          <div className="flex flex-col">
            <strong className="text-ui-md font-bold text-[var(--text-primary)] leading-tight">{activeWorkOrder.title}</strong>
            <p className="text-ui-sm font-medium text-[var(--text-muted)] mt-1">{activeClient?.name ?? 'Cliente Avulso'}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <strong className="text-ui-md font-bold text-[var(--text-muted)] opacity-50">Nenhum serviço selecionado</strong>
            <p className="text-ui-sm font-medium text-[var(--text-muted)] opacity-30 mt-1">Vincule um atendimento para organizar seus cálculos.</p>
          </div>
        )}
      </div>
      {activeWorkOrder && (
        <div className="flex gap-lg mt-6 pt-6 border-t var(--border-subtle)">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">PRIORIDADE</span>
            <strong className="text-ui-xs font-bold text-[var(--text-primary)] uppercase">{activeWorkOrder.priority || 'Normal'}</strong>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">STATUS</span>
            <strong className="text-ui-xs font-bold text-[var(--accent-gold)] uppercase">{statusLabel}</strong>
          </div>
        </div>
      )}
    </Card>
  );
}
