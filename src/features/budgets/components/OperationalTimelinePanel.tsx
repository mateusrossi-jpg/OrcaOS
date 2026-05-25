import React, { useMemo } from 'react';
import type { SavedBudgetRecord } from '../storage/savedBudgetsStorage';
import { type OperationalTimelineEntry, getWorkflowEventSummary, buildWorkflowTimeline } from '../../../core/workflow/timeline';

export function formatMutationField(field: string): string {
  const topLevelMap: Record<string, string> = {
    title: 'Título',
    clientName: 'Cliente',
    status: 'Status',
    total: 'Total',
    finalTotal: 'Total final',
    laborTotal: 'Mão de obra',
    materialTotal: 'Materiais',
    discount: 'Desconto',
    notes: 'Observações',
    commercialNotes: 'Notas comerciais',
    technicalNotes: 'Notas técnicas',
    paymentStatus: 'Pagamento',
    paymentTerms: 'Pagamento',
    dueDate: 'Vencimento',
    validity: 'Validade',
    validUntil: 'Validade',
    guarantee: 'Garantia',
    executionDeadline: 'Prazo',
    total_servicos: 'Total de serviços',
    custo_materiais: 'Custo de materiais',
    custos_operacionais: 'Custos operacionais',
  };

  if (topLevelMap[field]) return topLevelMap[field];

  const itemMatch = field.match(/^items\[.*?\]\.(.*)$/);
  if (itemMatch) {
    const [, itemProp] = itemMatch;
    const itemMap: Record<string, string> = {
      added: 'adicionado',
      removed: 'removido',
      description: 'descrição',
      title: 'título',
      quantity: 'quantidade',
      unitPrice: 'valor unitário',
      total: 'total',
      category: 'categoria',
    };
    return `Item · ${itemMap[itemProp] || itemProp}`;
  }

  return field;
}

export function isMoneyField(field: string): boolean {
  return [
    'total', 'finalTotal', 'laborTotal', 'materialTotal', 'discount',
    'total_servicos', 'custo_materiais', 'custos_operacionais',
    'unitPrice'
  ].some(k => field.endsWith(k) || field.includes(k));
}

export function formatMutationValue(value: any, field?: string): string {
  if (value === undefined || value === null) return '—';
  
  if (field && isMoneyField(field) && typeof value === 'number') {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (typeof value === 'boolean') {
    return value ? 'sim' : 'não';
  }

  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR');
  }

  if (typeof value === 'string') {
    return value.length > 42 ? value.slice(0, 42) + '…' : value;
  }

  if (Array.isArray(value)) return '[lista]';

  if (typeof value === 'object') {
    let label = '';
    if (value.description) label = String(value.description);
    else if (value.title) label = String(value.title);
    else if (value.name) label = String(value.name);
    
    if (label) {
      return label.length > 42 ? label.slice(0, 42) + '…' : label;
    }
    return '[objeto]';
  }

  const str = String(value);
  return str.length > 42 ? str.slice(0, 42) + '…' : str;
}

export function OperationalTimelinePanel({ budget }: { budget: SavedBudgetRecord }) {
  const events = useMemo(() => {
    if (budget.timeline && budget.timeline.length > 0) {
      return buildWorkflowTimeline(budget.timeline);
    }

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
          const mutations = event.meta?.mutations;
          const hasMutations = mutations && mutations.length > 0;

          return (
            <div key={event.id} className="operational-timeline-row" style={hasMutations ? { alignItems: 'start' } : undefined}>
              <span className="operational-timeline-time" style={hasMutations ? { paddingTop: '8px' } : undefined}>{time}</span>
              <span className="operational-timeline-event" style={hasMutations ? { paddingTop: '8px' } : undefined}>{getWorkflowEventSummary(event.type)}</span>
              
              {hasMutations ? (
                <details className="operational-timeline-audit">
                  <summary className="operational-timeline-audit-summary">
                    <span className="operational-timeline-meta" style={{ display: 'inline', textAlign: 'right' }}>
                      {event.operator || event.context || ''}
                      {` • ${mutations.length} alterações`}
                    </span>
                  </summary>
                  
                  {mutations.slice(0, 6).map((mut, i) => (
                    <div key={i} className="operational-timeline-mutation">
                      <span className="operational-timeline-mutation-field">{formatMutationField(mut.field)}:</span>
                      <span className="operational-timeline-mutation-change">
                        {formatMutationValue(mut.oldValue, mut.field)} → {formatMutationValue(mut.newValue, mut.field)}
                      </span>
                    </div>
                  ))}
                  
                  {mutations.length > 6 && (
                    <div className="operational-timeline-mutation" style={{ color: 'var(--aferix-text-muted)', fontStyle: 'italic' }}>
                      + {mutations.length - 6} alterações
                    </div>
                  )}
                </details>
              ) : (
                <span className="operational-timeline-meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  {event.operator || event.context || ''}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
