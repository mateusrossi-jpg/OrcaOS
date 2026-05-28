import type { Client, Service as WorkOrder } from '../../core/types/business';
import { Surface } from './ui';
import './ActiveWorkContextCard.css';

interface ActiveWorkContextCardProps {
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}

export function ActiveWorkContextCard({ activeClient, activeWorkOrder }: ActiveWorkContextCardProps) {
  return (
    <Surface elevation={1} padding="md" className="active-work-context-card aferix-mb-md">
      <div className="context-main-info">
        <span className="context-label">Serviço em Foco</span>
        {activeWorkOrder ? (
          <div className="aferix-d-flex aferix-flex-column">
            <strong>{activeWorkOrder.title}</strong>
            <small className="aferix-text-muted">{activeClient?.name ?? 'Cliente Avulso'}</small>
          </div>
        ) : (
          <div className="aferix-d-flex aferix-flex-column">
            <strong>Nenhum serviço selecionado</strong>
            <small className="aferix-text-muted">Vincule um atendimento para organizar seus cálculos.</small>
          </div>
        )}
      </div>
      {activeWorkOrder && (
        <div className="context-quick-stats aferix-d-flex aferix-gap-sm aferix-mt-sm">
          <div className="stat-item">
            <span>PRIORIDADE</span>
            <strong>{activeWorkOrder.priority || 'Normal'}</strong>
          </div>
          <div className="stat-item">
            <span>STATUS</span>
            <strong className={`status-text ${activeWorkOrder.status}`}>{activeWorkOrder.status === 'in-progress' ? 'Executando' : 'Concluído'}</strong>
          </div>
        </div>
      )}
    </Surface>
  );
}
