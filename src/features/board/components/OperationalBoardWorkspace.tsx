import { useState, useEffect, useCallback } from 'react';
import { OperationalBoardProjection } from '../../../domain/operationalProjections';
import { operationalReadModelService } from '../../../services/operationalReadModelService';
import { operationalSubscriptionService } from '../../../services/operationalSubscriptionService';
import { operationalFacade } from '../../workflow/operationalFacade';
import { OperationalEvent } from '../../../domain/operationalEvent';
import { operationalTimelineService } from '../../../services/operationalTimelineService';
import './OperationalBoardWorkspace.css';

/**
 * OperationalBoardWorkspace
 * ERP-grade Kanban Board that consumes ONLY the OperationalBoardProjection.
 * NO logic is calculated here. Operations trigger the facade.
 */
export function OperationalBoardWorkspace() {
  const [board, setBoard] = useState<OperationalBoardProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardTimeline, setCardTimeline] = useState<OperationalEvent[]>([]);

  const fetchBoard = useCallback(async () => {
    try {
      const projection = await operationalReadModelService.getBoardProjection();
      setBoard(projection);
    } catch (err) {
      console.error('Failed to load board projection', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hook into realtime invalidations
  useEffect(() => {
    fetchBoard();
    const unsubscribe = operationalSubscriptionService.subscribeBoardUpdates(() => {
      fetchBoard();
    });
    return () => unsubscribe();
  }, [fetchBoard]);

  const loadTimeline = async (cardId: string) => {
    try {
      const timeline = await operationalTimelineService.getAggregateTimeline(cardId);
      setCardTimeline(timeline);
      setSelectedCardId(cardId);
    } catch (err) {
      console.error('Failed to load timeline', err);
    }
  };

  const closeTimeline = () => {
    setSelectedCardId(null);
    setCardTimeline([]);
  };

  const handleDragStart = (e: React.DragEvent, cardId: string, currentColumn: string) => {
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('sourceColumn', currentColumn);
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: keyof OperationalBoardProjection) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const sourceColumn = e.dataTransfer.getData('sourceColumn');

    if (!cardId || sourceColumn === targetColumn) return;

    try {
      setLoading(true);

      switch (targetColumn) {
        case 'sent':
          // Sent means proposal status = sent
          await operationalFacade.changeProposalStatus(cardId, 'sent');
          break;
        case 'approved':
          await operationalFacade.approveProposal(cardId);
          break;
        case 'authorized':
          await operationalFacade.authorizeBudget(cardId);
          break;
        case 'inExecution':
          await operationalFacade.executeBudget(cardId);
          break;
        case 'finalized':
          await operationalFacade.finalizeBudget(cardId);
          break;
        case 'archived':
          await operationalFacade.archiveBudget(cardId);
          break;
        case 'draft':
        default:
          // Reverting to draft (iniciado) is not typically allowed in a forward pipeline,
          // but if we do, it goes via facade. Since there is no explicit revertToDraft in Facade:
          console.warn('Reverting to draft not implemented via drag & drop');
          break;
      }
      
      // Wait for projection rebuild to happen from the event emission
      // Note: we can optionally re-fetch here if we didn't rely on the listener
      await fetchBoard();
    } catch (err) {
      console.error('Error transitioning card', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!board) {
    return <div className="kanban-board-loading">Carregando quadro operacional...</div>;
  }

  const columns: { key: keyof OperationalBoardProjection; title: string }[] = [
    { key: 'draft', title: 'Rascunho' },
    { key: 'sent', title: 'Enviado' },
    { key: 'approved', title: 'Aprovado' },
    { key: 'authorized', title: 'Autorizado' },
    { key: 'inExecution', title: 'Em Execução' },
    { key: 'finalized', title: 'Finalizado' },
    { key: 'archived', title: 'Arquivado' }
  ];

  return (
    <div className="kanban-board-container">
      {/* 1. CINEMATIC ATMOSPHERE (Unified DNA) */}
      <div className="screen-atmosphere">
        <div className="atmosphere-vignette" />
      </div>

      {/* 2. EXECUTIVE HEADER (Premium Operational) */}
      <div className="kanban-board-header">
        <div className="kanban-board-title-wrap">
          <p className="text-ui-xs text-[var(--accent-gold)]">Operação</p>
          <h2 className="text-h2 text-[var(--text-primary)]">Fluxo <span className="opacity-40">Operacional</span></h2>
          <p className="text-ui-sm text-[var(--text-secondary)] opacity-80 mt-1">Gerencie seu pipeline de orçamentos e execuções.</p>
        </div>
        <div className="kanban-syncing-badge">
          <div className="kanban-telemetry-dot" />
          <span className="text-ui-sm font-bold uppercase tracking-widest opacity-60">{loading ? 'Sincronizando' : 'Ativo'}</span>
        </div>
      </div>

      {/* 3. EDGE-TO-EDGE COLUMNS */}
      <div className="kanban-board-columns">
        {columns.map(col => (
          <div
            key={col.key}
            className="kanban-column"
            onDrop={(e) => handleDrop(e, col.key)}
            onDragOver={handleDragOver}
          >
            <div className="kanban-column-header">
              <h3 className="text-ui-xs opacity-50">{col.title}</h3>
              <span className="kanban-column-count">{board[col.key].length}</span>
            </div>
            <div className="kanban-column-content">
              {board[col.key].map(card => (
                <div
                  key={card.id}
                  className={`kanban-card kanban-card-${card.priority}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card.id, col.key)}
                  onClick={() => loadTimeline(card.id)}
                >
                  <div className="kanban-card-title">{card.title}</div>
                  <div className="kanban-card-client">{card.clientName}</div>
                  <div className="kanban-card-metrics">
                    R$ {card.revenue.toFixed(2)}
                  </div>
                  {(card.slaBreached || card.overdue || card.stalledWorkflow) && (
                    <div className="kanban-card-sla-badges">
                      {card.slaBreached && <span className="kanban-badge kanban-badge-danger">SLA_BREACH</span>}
                      {card.overdue && <span className="kanban-badge kanban-badge-danger">OVERDUE</span>}
                      {card.stalledWorkflow && <span className="kanban-badge kanban-badge-warning">STALLED</span>}
                    </div>
                  )}
                  <div className="kanban-card-footer">
                    <span>{card.margin}% Margem</span>
                    <span>{card.aging}d</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedCardId && (
        <div className="kanban-timeline-modal" onClick={closeTimeline}>
          <div className="kanban-timeline-content" onClick={e => e.stopPropagation()}>
            <div className="kanban-timeline-header">
              <h3>Histórico Operacional</h3>
              <button onClick={closeTimeline}>✕</button>
            </div>
            <div className="kanban-timeline-list">
              {cardTimeline.length === 0 ? (
                <p>Nenhum evento registrado.</p>
              ) : (
                cardTimeline.map(event => (
                  <div key={event.id} className="kanban-timeline-event">
                    <div className="timeline-event-header">
                      <strong>{event.eventType}</strong>
                      <span className="timeline-event-time">
                        {new Date(event.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="timeline-event-details">
                      <span>Ator: {event.actor}</span>
                      <span>Fonte: {event.source}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
