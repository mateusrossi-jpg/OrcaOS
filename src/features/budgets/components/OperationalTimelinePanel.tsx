import React, { useMemo } from 'react';
import type { SavedBudgetRecord } from '../storage/savedBudgetsStorage';
import { type OperationalTimelineEntry, getWorkflowEventSummary, buildWorkflowTimeline } from '../../../core/workflow/timeline';

export function OperationalTimelinePanel({ budget }: { budget: SavedBudgetRecord }) {
  const events = useMemo(() => {
    const rawEvents: OperationalTimelineEntry[] = [];

    const status = budget.status as string;

    // Adapter logic: maps existing fields to safe derived timeline
    if (budget.createdAt) {
      rawEvents.push({
        id: `created-${budget.id}`,
        workflowId: budget.id,
        type: 'created',
        timestamp: budget.createdAt,
      });
    }

    if (status === 'sent' || status === 'approved' || status === 'authorized' || status === 'finished' || status === 'execution' || status === 'em_revisao' || status === 'enviado') {
       rawEvents.push({
         id: `sent-${budget.id}`,
         workflowId: budget.id,
         type: 'sent',
         timestamp: budget.updatedAt || budget.createdAt,
       });
    }

    if (status === 'approved' || status === 'authorized' || status === 'finished' || status === 'execution' || status === 'autorizado') {
       rawEvents.push({
         id: `authorized-${budget.id}`,
         workflowId: budget.id,
         type: 'authorized',
         timestamp: budget.updatedAt || budget.createdAt,
       });
    }

    if (status === 'execution' || status === 'em_execucao' || status === 'iniciado') {
       rawEvents.push({
         id: `execution-${budget.id}`,
         workflowId: budget.id,
         type: 'execution_started',
         timestamp: budget.updatedAt || budget.createdAt,
       });
    }

    if (status === 'finished' || status === 'finalizado') {
       rawEvents.push({
         id: `finished-${budget.id}`,
         workflowId: budget.id,
         type: 'finished',
         timestamp: budget.updatedAt || budget.createdAt,
       });
    }

    if (status === 'archived') {
       rawEvents.push({
         id: `archived-${budget.id}`,
         workflowId: budget.id,
         type: 'archived',
         timestamp: budget.updatedAt || budget.createdAt,
       });
    }

    return buildWorkflowTimeline(rawEvents);
  }, [budget]);

  if (events.length === 0) {
    return (
      <div className="aferix-panel-card">
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--aferix-text-muted)' }}>
          Nenhum evento registrado.
        </div>
      </div>
    );
  }

  return (
    <div className="aferix-panel-card">
      <div className="operational-timeline">
        {events.map((event) => {
          const time = new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={event.id} className="operational-timeline-row">
              <span className="operational-timeline-time">{time}</span>
              <span className="operational-timeline-event">{getWorkflowEventSummary(event.type)}</span>
              <span className="operational-timeline-meta">{event.operator || event.context || ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
