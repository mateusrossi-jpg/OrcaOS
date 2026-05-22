import { useMemo, useState } from 'react';
import { 
  PageHeader, 
  PageShell, 
  Button, 
  EmptyState, 
  PanelCard, 
  ListCard, 
  ListItem,
  SearchInput, 
  FilterChips, 
  StatusBadge, 
  ActionMenu,
  Modal,
  Select,
  Input,
  SecondaryButton,
  PrimaryButton
} from '../components/ui';

import { loadSavedBudgets, saveBudgetRecord, type SavedBudgetRecord } from '../../features/budgets/storage/savedBudgetsStorage';
import { calculateBudgetTotal } from '../../core/pricing/budget';
import { canBudgetTransitionTo } from '../../core/finance/budgetLifecycle';
import type { Budget, BudgetStatus } from '../../core/types/business';

type CanonicalBudgetStatus =
  | 'all'
  | 'iniciado'
  | 'em_revisao'
  | 'enviado'
  | 'autorizado'
  | 'em_execucao'
  | 'finalizado'
  | 'recusado'
  | 'cancelado';

type ActionMenuState = 'none' | 'alterar_status';

const STATUS_FILTERS: Array<{ id: CanonicalBudgetStatus; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'iniciado', label: 'Iniciados' },
  { id: 'em_revisao', label: 'Em revisão' },
  { id: 'enviado', label: 'Enviados' },
  { id: 'autorizado', label: 'Autorizados' },
  { id: 'em_execucao', label: 'Em execução' },
  { id: 'finalizado', label: 'Finalizados' },
  { id: 'recusado', label: 'Recusados' },
  { id: 'cancelado', label: 'Cancelados' },
];

const HISTORY_VISIBLE_LIMIT = 5;
const CRITICAL_STATUSES: BudgetStatus[] = ['finalizado', 'cancelado', 'recusado'];

const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function money(value: number): string {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

function normalizeStatus(status: SavedBudgetRecord['status']): Exclude<CanonicalBudgetStatus, 'all'> {
  if (status === 'draft') return 'iniciado';
  if (status === 'sent') return 'enviado';
  if (status === 'approved') return 'autorizado';
  if (status === 'rejected' || status === 'expired') return 'recusado';
  if (status === 'cancelled') return 'cancelado';
  return status;
}

function statusLabel(status: SavedBudgetRecord['status']): string {
  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus === 'em_revisao') return 'Em revisão';
  if (normalizedStatus === 'enviado') return 'Enviado';
  if (normalizedStatus === 'autorizado') return 'Autorizado';
  if (normalizedStatus === 'em_execucao') return 'Em execução';
  if (normalizedStatus === 'finalizado') return 'Finalizado';
  if (normalizedStatus === 'cancelado') return 'Cancelado';
  if (normalizedStatus === 'recusado') return 'Recusado';
  return 'Iniciado';
}

function isLockedStatus(status: SavedBudgetRecord['status']): boolean {
  const normalized = normalizeStatus(status);
  return normalized === 'finalizado' || normalized === 'recusado' || normalized === 'cancelado';
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function budgetTotal(record: SavedBudgetRecord): number {
  const budget: Budget = {
    id: record.id,
    title: record.title,
    status: record.status,
    discount: record.discount,
    travelCost: record.travelCost,
    additionalFees: record.additionalFees,
    items: record.items,
  };
  try {
    return calculateBudgetTotal(budget);
  } catch {
    return 0;
  }
}

function duplicateBudget(record: SavedBudgetRecord): SavedBudgetRecord | null {
  return saveBudgetRecord({
    clientId: record.clientId,
    workOrderId: record.workOrderId,
    clientName: record.clientName,
    title: `${record.title || 'Orçamento'} (cópia)`,
    status: 'iniciado',
    discount: record.discount,
    travelCost: record.travelCost,
    additionalFees: record.additionalFees,
    paymentTerms: record.paymentTerms,
    validity: record.validity,
    guarantee: record.guarantee,
    executionDeadline: record.executionDeadline,
    commercialNotes: record.commercialNotes,
    technicalNotes: record.technicalNotes,
    templateId: record.templateId,
    items: record.items,
    materialCost: record.materialCost,
    operationalCost: record.operationalCost,
    taxRate: record.taxRate,
    total_servicos: record.total_servicos,
    custo_materiais: record.custo_materiais,
    custos_operacionais: record.custos_operacionais,
    aliquota_imposto: record.aliquota_imposto,
    lucro_liquido: record.lucro_liquido,
  });
}

function confirmWordForStatus(status: BudgetStatus): string {
  if (status === 'finalizado') return 'FINALIZAR';
  if (status === 'cancelado') return 'CANCELAR';
  if (status === 'recusado') return 'RECUSAR';
  return 'CONFIRMAR';
}

export function BudgetHistoryScreen({
  onOpenBudget,
  onNewBudget,
}: {
  onOpenBudget: (budgetId: string) => void;
  onNewBudget: () => void;
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CanonicalBudgetStatus>('all');
  const [showAll, setShowAll] = useState(false);
  const [syncTick, setSyncTick] = useState(0);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  const [menuAction, setMenuAction] = useState<ActionMenuState>('none');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<BudgetStatus>('iniciado');
  const [confirmInput, setConfirmInput] = useState('');

  const budgets = useMemo(() => loadSavedBudgets(), [syncTick]);

  const selectedRecord = useMemo(
    () => budgets.find((record) => record.id === selectedRecordId) ?? null,
    [budgets, selectedRecordId],
  );

  const allowedNextStatuses = useMemo(() => {
    if (!selectedRecord) return [] as BudgetStatus[];
    const current = normalizeStatus(selectedRecord.status) as BudgetStatus;
    const statuses: BudgetStatus[] = [
      'iniciado',
      'em_revisao',
      'enviado',
      'autorizado',
      'em_execucao',
      'finalizado',
      'recusado',
      'cancelado',
    ];
    return statuses.filter((candidate) => candidate !== current && canBudgetTransitionTo(current, candidate));
  }, [selectedRecord]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return budgets
      .filter((record) => !archivedIds.includes(record.id))
      .filter((record) => {
        const normalizedStatus = normalizeStatus(record.status);
        const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
        const matchesText =
          !q ||
          [record.title, record.clientName, statusLabel(record.status), money(budgetTotal(record))]
            .join(' ')
            .toLowerCase()
            .includes(q);
        return matchesStatus && matchesText;
      });
  }, [archivedIds, budgets, query, statusFilter]);

  const isSearching = query.trim().length > 0;
  const visibleRecords = (showAll || isSearching) ? filtered : filtered.slice(0, HISTORY_VISIBLE_LIMIT);
  const hiddenCount = Math.max(filtered.length - visibleRecords.length, 0);

  function persistStatus(record: SavedBudgetRecord, nextStatus: BudgetStatus) {
    saveBudgetRecord({
      ...record,
      status: nextStatus,
    });
    setSyncTick((current) => current + 1);
  }

  function openStatusDialog(record: SavedBudgetRecord, suggested?: BudgetStatus) {
    setSelectedRecordId(record.id);
    const firstAllowed = (() => {
      const current = normalizeStatus(record.status) as BudgetStatus;
      const statuses: BudgetStatus[] = [
        'iniciado',
        'em_revisao',
        'enviado',
        'autorizado',
        'em_execucao',
        'finalizado',
        'recusado',
        'cancelado',
      ];
      return statuses.find((candidate) => candidate !== current && canBudgetTransitionTo(current, candidate));
    })();
    setTargetStatus(suggested ?? firstAllowed ?? (normalizeStatus(record.status) as BudgetStatus));
    setConfirmInput('');
    setMenuAction('alterar_status');
  }

  function closeStatusDialog() {
    setMenuAction('none');
    setConfirmInput('');
  }

  function submitStatusChange() {
    if (!selectedRecord) return;
    const current = normalizeStatus(selectedRecord.status) as BudgetStatus;
    if (!canBudgetTransitionTo(current, targetStatus)) return;

    if (CRITICAL_STATUSES.includes(targetStatus)) {
      const required = confirmWordForStatus(targetStatus);
      if (confirmInput.trim().toUpperCase() !== required) return;
    }

    persistStatus(selectedRecord, targetStatus);
    closeStatusDialog();
  }

  return (
    <PageShell className="wide-screen">
      <PageHeader
        title="Histórico de orçamentos"
        eyebrow="Work"
        description="Pipeline operacional com busca, filtros e reabertura segura."
        action={<PrimaryButton onClick={onNewBudget}>Novo orçamento</PrimaryButton>}
      />

      <PanelCard className="history-search-panel">
        <div className="budget-history-grid-gap-md">
          <SearchInput
            value={query}
            placeholder="Buscar por título, cliente, status ou valor..."
            onChange={(value) => {
              setQuery(value);
              setShowAll(false);
            }}
          />

          <FilterChips 
            items={STATUS_FILTERS}
            active={[statusFilter]}
            onChange={(active) => {
              setStatusFilter(active[0] || 'all');
              setShowAll(false);
            }}
            ariaLabel="Filtrar histórico por status"
          />
        </div>
      </PanelCard>

      <ListCard>
        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhum orçamento encontrado"
            description="Ajuste os filtros ou crie um novo orçamento."
            icon={<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>}
          />
        ) : (
          visibleRecords.map((record) => {
            const isLocked = isLockedStatus(record.status);
            return (
              <ListItem 
                key={record.id}
                title={record.title || 'Orçamento sem título'}
                subtitle={
                  <div className="budget-history-record-meta">
                    <span>{record.clientName || 'Cliente não informado'}</span>
                    <div className="budget-history-record-status-row">
                      <StatusBadge status={normalizeStatus(record.status)} />
                      <small>{formatDate(record.updatedAt)}</small>
                      {isLocked && <small className="budget-history-locked-note">🔒 bloqueado</small>}
                    </div>
                  </div>
                }
                value={<strong>{money(budgetTotal(record))}</strong>}
                action={
                  <div className="budget-history-record-actions">
                    <ActionMenu 
                      items={[
                        { id: 'open', label: 'Abrir', onSelect: () => onOpenBudget(record.id) },
                        { id: 'edit', label: 'Editar', onSelect: () => onOpenBudget(record.id) },
                        {
                          id: 'duplicate',
                          label: 'Duplicar',
                          onSelect: () => {
                            duplicateBudget(record);
                            setSyncTick((current) => current + 1);
                          },
                        },
                        { id: 'status', label: 'Alterar status', onSelect: () => openStatusDialog(record) },
                        { id: 'pdf', label: 'Gerar PDF', onSelect: () => onOpenBudget(record.id) },
                        {
                          id: 'share',
                          label: 'Compartilhar',
                          onSelect: async () => {
                            const shareText = `${record.title || 'Orçamento'} · ${money(budgetTotal(record))} · ${statusLabel(record.status)}`;
                            if (typeof navigator !== 'undefined' && 'share' in navigator) {
                              try {
                                await (navigator as any).share({ title: record.title || 'Orçamento', text: shareText });
                              } catch {
                                // no-op
                              }
                            } else {
                              try {
                                await (navigator as any).clipboard?.writeText(shareText);
                              } catch {
                                // no-op
                              }
                            }
                          },
                        },
                        { id: 'cancel', label: 'Cancelar', tone: 'danger', onSelect: () => openStatusDialog(record, 'cancelado') },
                        { id: 'archive', label: 'Arquivar', onSelect: () => setArchivedIds((current) => [...current, record.id]) },
                      ]}
                    />
                  </div>
                }
              />
            );
          })
        )}

        {!isSearching && filtered.length > HISTORY_VISIBLE_LIMIT && (
          <div className="budget-history-top-spacing-sm">
            <Button variant="ghost" className="density-toggle-cta" onClick={() => setShowAll((current) => !current)}>
              {showAll ? 'Ver menos' : `Ver mais (${hiddenCount})`}
            </Button>
          </div>
        )}
      </ListCard>

      <Modal
        isOpen={menuAction === 'alterar_status'}
        title="Alterar status do orçamento"
        onClose={closeStatusDialog}
        onConfirm={submitStatusChange}
        confirmLabel="Confirmar status"
        tone={CRITICAL_STATUSES.includes(targetStatus) ? 'danger' : 'brand'}
      >
        <div className="budget-history-grid-gap-md">
          <p>Status atual: <strong>{statusLabel(selectedRecord?.status ?? 'iniciado')}</strong></p>

          {allowedNextStatuses.length === 0 ? (
            <p>Não há transições disponíveis para este orçamento.</p>
          ) : (
            <>
              <div className="budget-history-status-modal-grid">
                <small className="budget-history-muted-note">Próximo status permitido</small>
                <FilterChips
                  items={allowedNextStatuses.map((status) => ({
                    id: status,
                    label: statusLabel(status),
                  }))}
                  active={[targetStatus]}
                  onChange={(active) => {
                    const next = active[0] as BudgetStatus | undefined;
                    if (next) setTargetStatus(next);
                  }}
                  ariaLabel="Selecionar próximo status"
                />
              </div>

              {CRITICAL_STATUSES.includes(targetStatus) && (
                <Input
                  label="Confirmação de segurança"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder={`Digite ${confirmWordForStatus(targetStatus)} para confirmar`}
                  helper="Edição e alterações financeiras ficam bloqueadas após esta ação."
                />
              )}
            </>
          )}
        </div>
      </Modal>
    </PageShell>
  );
}
