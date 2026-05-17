import type { Client, Service as WorkOrder } from '../../core/types/business';
import './ActiveWorkContextCard.css';

interface ActiveWorkContextCardProps {
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}

export function ActiveWorkContextCard({ activeClient, activeWorkOrder }: ActiveWorkContextCardProps) {
  return (
    <div className="active-work-context-card">
      <div className="context-main-info">
        {activeWorkOrder ? (
          <>
            <span className="context-label">Serviço ativo</span>
            <strong>{activeWorkOrder.title}</strong>
            <small>{activeClient?.name ?? 'Cliente Avulso'}</small>
          </>
        ) : (
          <>
            <span className="context-label">Fluxo operacional</span>
            <strong>Nenhum serviço ativo</strong>
            <small>Crie um novo orçamento para vincular cálculos e propostas.</small>
          </>
        )}
      </div>
      {activeWorkOrder && (
        <div className="context-quick-stats">
          <div className="stat-item">
            <span>Prioridade</span>
            <strong>{activeWorkOrder.priority || 'Normal'}</strong>
          </div>
          <div className="stat-item">
            <span>Status</span>
            <strong className={`status-text ${activeWorkOrder.status}`}>{activeWorkOrder.status === 'in-progress' ? 'Em execução' : 'Concluído'}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
