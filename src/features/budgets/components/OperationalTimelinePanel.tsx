import React, { useMemo, useState } from 'react';
import type { SavedBudgetRecord } from '../storage/savedBudgetsStorage';
import { type OperationalTimelineEntry, getWorkflowEventSummary, buildWorkflowTimeline } from '../../../core/workflow/timeline';

export function getEventCategory(type: string) {
  if (type === 'created') return 'category-created';
  if (type === 'updated') return 'category-updated';
  if (['sent', 'authorized', 'execution_started', 'finished', 'archived'].includes(type)) return 'category-transition';
  return 'category-default';
}

export function getEventIcon(type: string, mutations?: any[]) {
  if (type === 'created') return '✦';
  if (type === 'updated') {
     const hasFinancial = mutations?.some(m => isMoneyField(m.field));
     const hasItem = mutations?.some(m => m.field.startsWith('items['));
     if (hasFinancial) return '＄';
     if (hasItem) return '⊞';
     return '✎';
  }
  if (type === 'sent') return '↗';
  if (type === 'authorized') return '✓';
  if (type === 'execution_started') return '▶';
  if (type === 'finished') return '★';
  if (type === 'archived') return '⚑';
  return '•';
}

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
  const [filterType, setFilterType] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const events = useMemo(() => {
    if (budget.timeline && budget.timeline.length > 0) {
      return buildWorkflowTimeline(budget.timeline);
    }

    const rawEvents: OperationalTimelineEntry[] = [];
    const status = budget.status as string;

    if (budget.createdAt) {
      rawEvents.push({ id: `created-${budget.id}`, workflowId: budget.id, type: 'created', timestamp: budget.createdAt });
    }

    if (status === 'sent' || status === 'approved' || status === 'authorized' || status === 'finished' || status === 'finalizado' || status === 'execution' || status === 'em_execucao' || status === 'em_revisao' || status === 'enviado') {
       rawEvents.push({ id: `sent-${budget.id}`, workflowId: budget.id, type: 'sent', timestamp: budget.updatedAt || budget.createdAt });
    }

    if (status === 'approved' || status === 'authorized' || status === 'finished' || status === 'finalizado' || status === 'execution' || status === 'em_execucao' || status === 'autorizado') {
       rawEvents.push({ id: `authorized-${budget.id}`, workflowId: budget.id, type: 'authorized', timestamp: budget.updatedAt || budget.createdAt });
    }

    if (status === 'execution' || status === 'em_execucao' || status === 'finished' || status === 'finalizado' || status === 'iniciado') {
       rawEvents.push({ id: `execution-${budget.id}`, workflowId: budget.id, type: 'execution_started', timestamp: budget.updatedAt || budget.createdAt });
    }

    if (status === 'finished' || status === 'finalizado') {
       rawEvents.push({ id: `finished-${budget.id}`, workflowId: budget.id, type: 'finished', timestamp: budget.updatedAt || budget.createdAt });
    }

    if (status === 'archived') {
       rawEvents.push({ id: `archived-${budget.id}`, workflowId: budget.id, type: 'archived', timestamp: budget.updatedAt || budget.createdAt });
    }

    return buildWorkflowTimeline(rawEvents);
  }, [budget]);

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      // 1. Filter Type
      if (filterType === 'fluxo') {
        if (!['sent', 'authorized', 'execution_started', 'finished', 'archived'].includes(ev.type)) return false;
      } else if (filterType === 'edicoes') {
        if (ev.type !== 'updated') return false;
      } else if (filterType === 'financeiro') {
        const hasFin = ev.meta?.mutations?.some(m => isMoneyField(m.field));
        if (!hasFin) return false;
      } else if (filterType === 'itens') {
        const hasItem = ev.meta?.mutations?.some(m => m.field.startsWith('items['));
        if (!hasItem) return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const summary = getWorkflowEventSummary(ev.type).toLowerCase();
        const operator = (ev.operator || '').toLowerCase();
        const context = (ev.context || '').toLowerCase();
        
        let matchesText = summary.includes(q) || operator.includes(q) || context.includes(q);
        
        if (!matchesText && ev.meta?.mutations) {
           matchesText = ev.meta.mutations.some(m => {
             const lbl = formatMutationField(m.field).toLowerCase();
             const oldVal = formatMutationValue(m.oldValue, m.field).toLowerCase();
             const newVal = formatMutationValue(m.newValue, m.field).toLowerCase();
             return lbl.includes(q) || oldVal.includes(q) || newVal.includes(q);
           });
        }
        
        if (!matchesText) return false;
      }

      return true;
    });
  }, [events, filterType, searchQuery]);

  return (
    <div className="aferix-panel-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="timeline-filters">
        <div className="timeline-filter-tabs">
          {['todos', 'fluxo', 'edições', 'financeiro', 'itens'].map(tab => {
            const key = tab === 'edições' ? 'edicoes' : tab;
            return (
              <button
                key={key}
                className={`timeline-filter-tab ${filterType === key ? 'active' : ''}`}
                onClick={() => setFilterType(key)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            );
          })}
        </div>
        <div className="timeline-search-box">
          <input
            type="text"
            className="timeline-search-input"
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="operational-timeline">
        {filteredEvents.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--aferix-text-muted)' }}>
            Nenhum evento encontrado.
          </div>
        ) : (
          filteredEvents.map((event) => {
            const dt = new Date(event.timestamp);
            const time = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const date = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            
            const mutations = event.meta?.mutations;
            const hasMutations = mutations && mutations.length > 0;
            const snapshot = budget.snapshots?.find(s => s.timelineEventId === event.id);

            return (
              <div key={event.id} className={`operational-timeline-row ${getEventCategory(event.type)}`}>
                <div className="operational-timeline-time-col">
                  <span className="operational-timeline-time">{time}</span>
                  <span className="operational-timeline-date">{date}</span>
                </div>
                <div className="operational-timeline-icon">
                   {getEventIcon(event.type, mutations)}
                </div>
                <div className="operational-timeline-content">
                  <div className="operational-timeline-header">
                    <span className="operational-timeline-event">{getWorkflowEventSummary(event.type)}</span>
                    <span className="operational-timeline-meta">{event.operator || event.context || ''}</span>
                  </div>

                  {snapshot && (
                    <div className="operational-snapshot-badge">
                      <span className="snapshot-label">SNAPSHOT</span>
                      <span className="snapshot-hash">{snapshot.fingerprint}</span>
                      <span className="snapshot-tag">
                        {snapshot.workflowStatus} · {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(snapshot.totals.finalTotal)} · {snapshot.items.length} itens
                      </span>
                    </div>
                  )}
                  
                  {hasMutations && (
                    <details className="operational-timeline-audit">
                      <summary className="operational-timeline-audit-summary">
                        {mutations.length} alterações detectadas
                      </summary>
                      <div className="operational-timeline-audit-grid">
                        {mutations.slice(0, 6).map((mut, i) => (
                          <div key={i} className="operational-timeline-mutation">
                            <div className="operational-timeline-mutation-field">{formatMutationField(mut.field)}</div>
                            <div className="operational-timeline-mutation-change">
                              <span className="mutation-old">{formatMutationValue(mut.oldValue, mut.field)}</span>
                              <span className="mutation-arrow">→</span>
                              <span className="mutation-new">{formatMutationValue(mut.newValue, mut.field)}</span>
                            </div>
                          </div>
                        ))}
                        {mutations.length > 6 && (
                          <div className="operational-timeline-mutation-more">
                            + {mutations.length - 6} alterações adicionais
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
