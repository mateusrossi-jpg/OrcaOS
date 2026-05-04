import { useEffect, useMemo, useState } from 'react';
import type { UserPlan } from '../../../core/access/featureAccess';
import { FREE_PLAN_LIMITS } from '../../../core/access/planStrategy';
import type { Budget, BudgetItem, BudgetTemplateId, BusinessProfile, CatalogItem, Client, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import { calculateBudgetItemTotal, calculateBudgetTotal } from '../../../core/pricing/budget';
import { hasBlockingBudgetIssues, validateBudgetForProposal, validateBudgetItem, type BudgetValidationIssue } from '../../../core/pricing/budgetValidation';
import { roundTechnical } from '../../../core/calculations/electrical';
import { handleNumericInputFocus } from '../../../core/ui/numericInputFocus';
import { clearBudgetDraft, loadBudgetDraft, saveBudgetDraft } from '../storage/budgetDraftStorage';
import { loadBusinessProfile, saveBusinessProfile } from '../storage/businessProfileStorage';
import { loadCatalogItems, saveCatalogItems } from '../storage/catalogStorage';
import {
  createGuidedLaborTemplate,
  loadGuidedLaborTemplates,
  saveGuidedLaborTemplates,
  type GuidedLaborTemplate,
} from '../../workflow/storage/guidedLaborTemplatesStorage';
import {
  deleteSavedBudget,
  loadSavedBudgets,
  saveBudgetRecord,
  type SavedBudgetRecord,
  type SavedBudgetStatus,
} from '../storage/savedBudgetsStorage';
import { starterElectricalBudgetItems } from '../budgetTemplates';
import { budgetTemplateOptions } from '../budgetTemplatesVisual';
import { BudgetPrintPreview } from './BudgetPrintPreview';
import './BudgetWorkspace.css';

type BudgetCategory = BudgetItem['category'];
type BudgetWorkspaceSection = 'proposal' | 'items' | 'catalog' | 'review' | 'preview';

interface BudgetWorkspaceProps {
  technicalCaptures?: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
  userPlan?: UserPlan;
  onUpgradeRequest?: () => void;
  onTechnicalCaptureConverted?: (id: string) => void;
  onConvertApprovedBudgetToWorkOrder?: () => void;
}

interface DraftBudgetItem {
  description: string;
  quantity: number;
  unitPrice: number;
  category: BudgetCategory;
}

interface DraftCatalogItem {
  description: string;
  quantity: number;
  unitPrice: number;
  category: BudgetCategory;
  notes: string;
}

interface ServiceTemplateDraft {
  title: string;
  description: string;
  defaultUnitValue: string;
  minimumValue: string;
  marginPercent: string;
  unit: string;
  estimatedTime: string;
  suggestedMaterials: string;
  category: string;
  professionModule: string;
  note: string;
}

const emptyDraftItem: DraftBudgetItem = {
  description: '',
  quantity: 1,
  unitPrice: 0,
  category: 'labor',
};

const emptyCatalogDraft: DraftCatalogItem = {
  description: '',
  quantity: 1,
  unitPrice: 0,
  category: 'labor',
  notes: '',
};

const emptyServiceTemplateDraft: ServiceTemplateDraft = {
  title: '',
  description: '',
  defaultUnitValue: '',
  minimumValue: '',
  marginPercent: '',
  unit: 'serviço',
  estimatedTime: '',
  suggestedMaterials: '',
  category: '',
  professionModule: '',
  note: '',
};

const CAPTURES_STORAGE_KEY = 'orcaos:calculation-captures:v1';
const VISIBLE_LIST_LIMIT = 5;
const savedDraft = loadBudgetDraft();

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(roundTechnical(value));
}

function formatSavedAt(value: string | null): string {
  if (!value) return 'Ainda não salvo nesta sessão';
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function formatOptionalDateTime(value?: string): string {
  if (!value) return 'Sem data agendada';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function categoryLabel(category: BudgetCategory): string {
  if (category === 'labor') return 'Mão de obra';
  if (category === 'material') return 'Material';
  return 'Outro';
}

function statusLabel(status: SavedBudgetStatus): string {
  const labels: Record<SavedBudgetStatus, string> = {
    draft: 'Rascunho',
    sent: 'Enviado',
    approved: 'Aprovado',
    rejected: 'Recusado',
    expired: 'Vencido',
    cancelled: 'Cancelado',
  };
  return labels[status];
}

function statusGuidance(status: SavedBudgetStatus): string {
  if (status === 'sent') return 'Proposta enviada. Aguarde a resposta do cliente.';
  if (status === 'approved') return 'Cliente aprovou o orçamento. A OS só nasce quando você tocar em Converter em OS.';
  if (status === 'rejected') return 'Cliente recusou. Preserve o histórico e ajuste apenas se houver nova negociação.';
  if (status === 'expired') return 'Validade vencida. Revise preços, materiais e prazo antes de reenviar.';
  if (status === 'cancelled') return 'Fluxo cancelado. Use apenas como histórico.';
  return 'Rascunho em preparação. Complete dados, itens e condições antes do envio.';
}

function proUpgradeMessage(feature: string): string {
  return `${feature} é um recurso Pro para ganhar tempo, vender melhor e organizar mais orçamentos.`;
}

function renderBudgetIssues(issues: BudgetValidationIssue[]) {
  if (issues.length === 0) return null;
  const hasErrors = hasBlockingBudgetIssues(issues);
  return (
    <div className={hasErrors ? 'budget-validation-panel has-errors' : 'budget-validation-panel'} role="status">
      <strong>{hasErrors ? 'Revise antes de gerar a proposta' : 'Atenção antes do envio'}</strong>
      <ul>
        {issues.map((issue) => (
          <li className={issue.severity} key={`${issue.code}-${issue.message}`}>{issue.message}</li>
        ))}
      </ul>
    </div>
  );
}

function joinTextLines(lines: Array<string | false | null | undefined>): string {
  return lines.filter((line): line is string => Boolean(line && line.trim())).join('\n');
}

function createId(prefix: string): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${prefix}-${Date.now()}`;
}

function createBudgetItem(draft: DraftBudgetItem): BudgetItem {
  return {
    id: createId('item'),
    description: draft.description.trim(),
    quantity: draft.quantity,
    unitPrice: draft.unitPrice,
    category: draft.category,
  };
}

function createBudgetItemFromCatalog(item: CatalogItem): BudgetItem {
  return {
    id: createId(`catalog-${item.id}`),
    description: item.description,
    quantity: item.defaultQuantity,
    unitPrice: item.unitPrice,
    category: item.category,
  };
}

function createCatalogItem(draft: DraftCatalogItem): CatalogItem {
  return {
    id: createId('catalog'),
    description: draft.description.trim(),
    category: draft.category,
    unitPrice: draft.unitPrice,
    defaultQuantity: draft.quantity,
    notes: draft.notes.trim() || undefined,
  };
}

function catalogItemToDraft(item: CatalogItem): DraftCatalogItem {
  return {
    description: item.description,
    quantity: item.defaultQuantity,
    unitPrice: item.unitPrice,
    category: item.category,
    notes: item.notes ?? '',
  };
}

function serviceTemplateToDraft(template: GuidedLaborTemplate): ServiceTemplateDraft {
  return {
    title: template.title,
    description: template.description ?? '',
    defaultUnitValue: String(template.defaultUnitValue),
    minimumValue: template.minimumValue === undefined ? '' : String(template.minimumValue),
    marginPercent: template.marginPercent === undefined ? '' : String(template.marginPercent),
    unit: template.unit || 'serviço',
    estimatedTime: template.estimatedTime ?? '',
    suggestedMaterials: template.suggestedMaterials ?? '',
    category: template.category ?? '',
    professionModule: template.professionModule ?? '',
    note: template.note ?? '',
  };
}

function calculateSavedBudgetTotal(record: SavedBudgetRecord): number {
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

function safeBudgetItemTotal(item: BudgetItem): number {
  try {
    return calculateBudgetItemTotal(item);
  } catch {
    return 0;
  }
}

function safeBudgetSubtotal(items: BudgetItem[]): number {
  return items.reduce((total, item) => total + safeBudgetItemTotal(item), 0);
}

function parseCommercialNumber(value: string | undefined, fallback = 0): number {
  if (!value) return fallback;
  const parsedValue = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function parseOptionalCommercialNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsedValue = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : undefined;
}

function parseInputAmount(value: string): number {
  if (!value.trim()) return 0;
  const parsedValue = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
}

function technicalTypeToBudgetCategory(capture: CalculationCapture): BudgetCategory {
  if (capture.itemType === 'material') return 'material';
  if (capture.itemType === 'service') return 'labor';
  return 'other';
}

function technicalCaptureToBudgetItem(capture: CalculationCapture): BudgetItem {
  return {
    id: createId(`tech-${capture.id}`),
    description: capture.editableDescription?.trim() || capture.summary || capture.calculatorLabel,
    quantity: parseCommercialNumber(capture.quantity, 1),
    unitPrice: parseCommercialNumber(capture.unitValue, 0),
    category: technicalTypeToBudgetCategory(capture),
  };
}

function createBudgetItemFromServiceTemplate(template: GuidedLaborTemplate, quantity: number, unitValue: number): BudgetItem {
  const details = [
    template.description,
    template.suggestedMaterials ? `Materiais sugeridos: ${template.suggestedMaterials}` : null,
    template.estimatedTime ? `Tempo estimado: ${template.estimatedTime}` : null,
  ].filter(Boolean).join(' | ');

  return {
    id: createId(`service-template-${template.id}`),
    description: details ? `${template.title} - ${details}` : template.title,
    quantity,
    unitPrice: unitValue,
    category: 'labor',
  };
}

function isCalculationDestination(value: unknown): value is CalculationDestination {
  return value === 'survey' || value === 'budget' || value === 'both';
}

function isCalculationCapture(value: unknown): value is CalculationCapture {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CalculationCapture>;
  return (
    typeof item.id === 'string' &&
    typeof item.module === 'string' &&
    typeof item.moduleLabel === 'string' &&
    typeof item.calculatorLabel === 'string' &&
    isCalculationDestination(item.destination) &&
    typeof item.createdAt === 'string' &&
    typeof item.summary === 'string' &&
    Array.isArray(item.details) &&
    item.details.every((detail) => typeof detail === 'string')
  );
}

function loadStoredTechnicalCaptures(): CalculationCapture[] {
  if (typeof window === 'undefined') return [];
  try {
    const storedValue = window.localStorage.getItem(CAPTURES_STORAGE_KEY);
    if (!storedValue) return [];
    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue.filter(isCalculationCapture) : [];
  } catch {
    return [];
  }
}

function saveStoredTechnicalCaptures(captures: CalculationCapture[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CAPTURES_STORAGE_KEY, JSON.stringify(captures));
}

export function BudgetWorkspace({ technicalCaptures = [], activeClient = null, activeWorkOrder = null, userPlan = 'free', onUpgradeRequest, onTechnicalCaptureConverted, onConvertApprovedBudgetToWorkOrder }: BudgetWorkspaceProps) {
  const initialBusinessProfile = useMemo(() => loadBusinessProfile(), []);
  const [activeSection, setActiveSection] = useState<BudgetWorkspaceSection>('proposal');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);
  const [selectedTemplate, setSelectedTemplate] = useState<BudgetTemplateId>('simple');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => loadCatalogItems());
  const [serviceTemplates, setServiceTemplates] = useState<GuidedLaborTemplate[]>(() => loadGuidedLaborTemplates());
  const [catalogDraft, setCatalogDraft] = useState<DraftCatalogItem>(emptyCatalogDraft);
  const [editingCatalogItemId, setEditingCatalogItemId] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<BudgetCategory | 'all'>('all');
  const [serviceTemplateSearch, setServiceTemplateSearch] = useState('');
  const [serviceTemplateDraft, setServiceTemplateDraft] = useState<ServiceTemplateDraft>(emptyServiceTemplateDraft);
  const [editingServiceTemplateId, setEditingServiceTemplateId] = useState<string | null>(null);
  const [serviceTemplateQuantities, setServiceTemplateQuantities] = useState<Record<string, string>>({});
  const [serviceTemplateValues, setServiceTemplateValues] = useState<Record<string, string>>({});
  const [items, setItems] = useState<BudgetItem[]>(savedDraft?.items ?? []);
  const [draft, setDraft] = useState<DraftBudgetItem>(emptyDraftItem);
  const [budgetItemSearch, setBudgetItemSearch] = useState('');
  const [budgetItemCategoryFilter, setBudgetItemCategoryFilter] = useState<BudgetCategory | 'all'>('all');
  const [selectedBudgetItemId, setSelectedBudgetItemId] = useState<string | null>(savedDraft?.items?.[0]?.id ?? null);
  const [discount, setDiscount] = useState(savedDraft?.discount ?? 0);
  const [travelCost, setTravelCost] = useState(savedDraft?.travelCost ?? 0);
  const [additionalFees, setAdditionalFees] = useState(savedDraft?.additionalFees ?? 0);
  const [paymentTerms, setPaymentTerms] = useState(savedDraft?.paymentTerms || initialBusinessProfile.defaultPaymentTerms);
  const [validity, setValidity] = useState(savedDraft?.validity || initialBusinessProfile.defaultValidity);
  const [guarantee, setGuarantee] = useState(savedDraft?.guarantee || initialBusinessProfile.defaultGuarantee);
  const [executionDeadline, setExecutionDeadline] = useState(savedDraft?.executionDeadline || initialBusinessProfile.defaultExecutionDeadline);
  const [commercialNotes, setCommercialNotes] = useState(savedDraft?.commercialNotes || initialBusinessProfile.defaultNotes);
  const [technicalNotes, setTechnicalNotes] = useState(savedDraft?.technicalNotes ?? '');
  const [clientName, setClientName] = useState(savedDraft?.clientName ?? activeClient?.name ?? '');
  const [budgetTitle, setBudgetTitle] = useState(savedDraft?.budgetTitle ?? activeWorkOrder?.title ?? '');
  const [budgetStatus, setBudgetStatus] = useState<SavedBudgetStatus>('draft');
  const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null);
  const [savedBudgets, setSavedBudgets] = useState<SavedBudgetRecord[]>(() => loadSavedBudgets());
  const [savedBudgetSearch, setSavedBudgetSearch] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(savedDraft?.updatedAt ?? null);
  const [storedTechnicalCaptures, setStoredTechnicalCaptures] = useState<CalculationCapture[]>(() => loadStoredTechnicalCaptures());
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const availableTechnicalCaptures = technicalCaptures.length > 0 ? technicalCaptures : storedTechnicalCaptures;

  const pendingTechnicalCaptures = useMemo(
    () => availableTechnicalCaptures.filter(
      (capture) =>
        (capture.destination === 'budget' || capture.destination === 'both') &&
        (capture.shouldGenerateBudgetItem ?? true) &&
        !capture.convertedToBudgetItem,
    ),
    [availableTechnicalCaptures],
  );

  useEffect(() => {
    saveBusinessProfile(businessProfile);
  }, [businessProfile]);

  useEffect(() => {
    saveCatalogItems(catalogItems);
  }, [catalogItems]);

  useEffect(() => {
    saveGuidedLaborTemplates(serviceTemplates);
  }, [serviceTemplates]);

  useEffect(() => {
    const saved = saveBudgetDraft({ clientName, budgetTitle, discount, travelCost, additionalFees, paymentTerms, validity, guarantee, executionDeadline, commercialNotes, technicalNotes, items });
    if (saved) setLastSavedAt(saved.updatedAt);
  }, [additionalFees, budgetTitle, clientName, commercialNotes, discount, executionDeadline, guarantee, items, paymentTerms, technicalNotes, travelCost, validity]);

  useEffect(() => {
    if (activeClient?.name && !clientName.trim()) {
      setClientName(activeClient.name);
    }
  }, [activeClient?.name, clientName]);

  useEffect(() => {
    if (activeWorkOrder?.title && !budgetTitle.trim()) {
      setBudgetTitle(activeWorkOrder.title);
    }
  }, [activeWorkOrder?.title, budgetTitle]);

  const summary = useMemo(() => {
    const labor = items.filter((item) => item.category === 'labor').reduce((total, item) => total + safeBudgetItemTotal(item), 0);
    const material = items.filter((item) => item.category === 'material').reduce((total, item) => total + safeBudgetItemTotal(item), 0);
    const other = items.filter((item) => item.category === 'other').reduce((total, item) => total + safeBudgetItemTotal(item), 0);
    const subtotal = safeBudgetSubtotal(items);
    const commercialSubtotal = subtotal + travelCost + additionalFees;
    const total = Math.max(commercialSubtotal - Math.max(discount, 0), 0);
    return { labor, material, other, travel: travelCost, fees: additionalFees, subtotal, commercialSubtotal, total };
  }, [additionalFees, discount, items, travelCost]);

  const currentBudgetForValidation = useMemo<Budget>(() => ({
    id: activeBudgetId ?? 'preview-budget',
    clientId: activeClient?.id,
    title: budgetTitle,
    status: budgetStatus,
    discount,
    travelCost,
    additionalFees,
    notes: clientName.trim() ? 'client-confirmed' : '',
    paymentTerms,
    validity,
    guarantee,
    executionDeadline,
    commercialNotes,
    technicalNotes,
    items,
    templateId: selectedTemplate,
  }), [activeBudgetId, activeClient?.id, additionalFees, budgetStatus, budgetTitle, clientName, commercialNotes, discount, executionDeadline, guarantee, items, paymentTerms, selectedTemplate, technicalNotes, travelCost, validity]);
  const proposalIssues = useMemo(() => validateBudgetForProposal(currentBudgetForValidation), [currentBudgetForValidation]);
  const blockingProposalIssues = hasBlockingBudgetIssues(proposalIssues);
  const filteredBudgetItems = useMemo(() => {
    const normalizedSearch = budgetItemSearch.trim().toLowerCase();
    return items.filter((item) => {
      const categoryMatches = budgetItemCategoryFilter === 'all' || item.category === budgetItemCategoryFilter;
      const textMatches = !normalizedSearch || [item.description, categoryLabel(item.category), formatCurrency(safeBudgetItemTotal(item))].join(' ').toLowerCase().includes(normalizedSearch);
      return categoryMatches && textMatches;
    });
  }, [budgetItemCategoryFilter, budgetItemSearch, items]);
  const visibleBudgetItems = filteredBudgetItems.slice(0, VISIBLE_LIST_LIMIT);
  const hiddenBudgetItemCount = Math.max(filteredBudgetItems.length - visibleBudgetItems.length, 0);
  const filteredSavedBudgets = useMemo(() => {
    const normalizedSearch = savedBudgetSearch.trim().toLowerCase();
    if (!normalizedSearch) return savedBudgets;
    return savedBudgets.filter((record) => [record.title, record.clientName, statusLabel(record.status), formatCurrency(calculateSavedBudgetTotal(record))].join(' ').toLowerCase().includes(normalizedSearch));
  }, [savedBudgetSearch, savedBudgets]);
  const visibleSavedBudgets = filteredSavedBudgets.slice(0, VISIBLE_LIST_LIMIT);
  const hiddenSavedBudgetCount = Math.max(filteredSavedBudgets.length - visibleSavedBudgets.length, 0);
  const selectedBudgetItem = useMemo(() => items.find((item) => item.id === selectedBudgetItemId) ?? null, [items, selectedBudgetItemId]);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedBudgetItemId(null);
      return;
    }
    if (!selectedBudgetItemId || !items.some((item) => item.id === selectedBudgetItemId)) {
      setSelectedBudgetItemId(items[0]?.id ?? null);
    }
  }, [items, selectedBudgetItemId]);

  function applyBusinessDefaultsToProposal() {
    setPaymentTerms(businessProfile.defaultPaymentTerms);
    setValidity(businessProfile.defaultValidity);
    setGuarantee(businessProfile.defaultGuarantee);
    setExecutionDeadline(businessProfile.defaultExecutionDeadline);
    setCommercialNotes(businessProfile.defaultNotes);
    setShareFeedback('Padrões locais aplicados neste orçamento.');
  }

  function saveCurrentProposalAsDefaults() {
    setBusinessProfile((current) => ({
      ...current,
      defaultPaymentTerms: paymentTerms,
      defaultValidity: validity,
      defaultGuarantee: guarantee,
      defaultExecutionDeadline: executionDeadline,
      defaultNotes: commercialNotes,
    }));
    setShareFeedback('Condições atuais salvas como padrão local para próximos orçamentos.');
  }

  function updateDraft<K extends keyof DraftBudgetItem>(key: K, value: DraftBudgetItem[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateCatalogDraft<K extends keyof DraftCatalogItem>(key: K, value: DraftCatalogItem[K]) {
    setCatalogDraft((current) => ({ ...current, [key]: value }));
  }

  function updateServiceTemplateDraft<K extends keyof ServiceTemplateDraft>(key: K, value: ServiceTemplateDraft[K]) {
    setServiceTemplateDraft((current) => ({ ...current, [key]: value }));
  }

  function updateBudgetItem<K extends keyof BudgetItem>(itemId: string, key: K, value: BudgetItem[K]) {
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, [key]: value } : item)));
  }

  function markTechnicalCaptureConverted(id: string) {
    onTechnicalCaptureConverted?.(id);
    if (technicalCaptures.length > 0) return;
    setStoredTechnicalCaptures((current) => {
      const updatedCaptures = current.map((capture) => (capture.id === id ? { ...capture, convertedToBudgetItem: true } : capture));
      saveStoredTechnicalCaptures(updatedCaptures);
      return updatedCaptures;
    });
  }

  function addItem() {
    const newItem = createBudgetItem(draft);
    const issues = validateBudgetItem(newItem);
    if (hasBlockingBudgetIssues(issues)) {
      setShareFeedback(issues[0]?.message ?? 'Revise os dados do item.');
      return;
    }
    setItems((current) => [...current, newItem]);
    setSelectedBudgetItemId(newItem.id);
    setDraft(emptyDraftItem);
  }

  function addCatalogItem() {
    if (!catalogDraft.description.trim() || catalogDraft.quantity <= 0 || catalogDraft.unitPrice < 0) return;
    if (catalogLimitReached && !editingCatalogItemId) {
      setShareFeedback(proUpgradeMessage(`Catálogo com mais de ${FREE_PLAN_LIMITS.catalogItems} itens`));
      return;
    }
    if (editingCatalogItemId) {
      setCatalogItems((current) => current.map((item) => (item.id === editingCatalogItemId ? { ...createCatalogItem(catalogDraft), id: item.id } : item)));
      setEditingCatalogItemId(null);
      setCatalogDraft(emptyCatalogDraft);
      setShareFeedback('Item do catálogo simples atualizado.');
      return;
    }
    setCatalogItems((current) => [...current, createCatalogItem(catalogDraft)]);
    setCatalogDraft(emptyCatalogDraft);
  }

  function editCatalogItem(item: CatalogItem) {
    setCatalogDraft(catalogItemToDraft(item));
    setEditingCatalogItemId(item.id);
    setActiveSection('catalog');
  }

  function cancelCatalogItemEdit() {
    setEditingCatalogItemId(null);
    setCatalogDraft(emptyCatalogDraft);
  }

  function removeCatalogItem(itemId: string) {
    const item = catalogItems.find((catalogItem) => catalogItem.id === itemId);
    const confirmed = window.confirm(`Remover "${item?.description ?? 'este item'}" do catálogo simples deste orçamento?`);
    if (!confirmed) return;
    if (editingCatalogItemId === itemId) cancelCatalogItemEdit();
    setCatalogItems((current) => current.filter((item) => item.id !== itemId));
  }

  function addCatalogItemToBudget(item: CatalogItem) {
    setItems((current) => [...current, createBudgetItemFromCatalog(item)]);
    setActiveSection('items');
  }

  function addServiceTemplate() {
    if (serviceTemplateLimitReached && !editingServiceTemplateId) {
      setShareFeedback(proUpgradeMessage(`Mais de ${FREE_PLAN_LIMITS.serviceTemplates} modelos pessoais`));
      return;
    }
    const title = serviceTemplateDraft.title.trim();
    if (!title) {
      setShareFeedback('Informe o nome do serviço para criar o modelo.');
      return;
    }
    const nextTemplatePatch = {
      title,
      description: serviceTemplateDraft.description.trim(),
      defaultUnitValue: parseCommercialNumber(serviceTemplateDraft.defaultUnitValue, 0),
      minimumValue: parseOptionalCommercialNumber(serviceTemplateDraft.minimumValue),
      marginPercent: parseOptionalCommercialNumber(serviceTemplateDraft.marginPercent),
      unit: serviceTemplateDraft.unit.trim() || 'serviço',
      estimatedTime: serviceTemplateDraft.estimatedTime.trim(),
      suggestedMaterials: serviceTemplateDraft.suggestedMaterials.trim(),
      category: serviceTemplateDraft.category.trim(),
      professionModule: serviceTemplateDraft.professionModule.trim(),
      note: serviceTemplateDraft.note.trim() || 'Modelo pessoal criado no orçamento rápido.',
      visible: true,
    };
    if (editingServiceTemplateId) {
      updateServiceTemplate(editingServiceTemplateId, nextTemplatePatch);
      setServiceTemplateValues((current) => ({ ...current, [editingServiceTemplateId]: String(nextTemplatePatch.defaultUnitValue) }));
      setEditingServiceTemplateId(null);
      setServiceTemplateDraft(emptyServiceTemplateDraft);
      setShareFeedback('Modelo pessoal de serviço atualizado.');
      return;
    }
    const template = createGuidedLaborTemplate({
      ...nextTemplatePatch,
    });
    setServiceTemplates((current) => [template, ...current]);
    setServiceTemplateValues((current) => ({ ...current, [template.id]: String(template.defaultUnitValue) }));
    setServiceTemplateDraft(emptyServiceTemplateDraft);
    setShareFeedback('Modelo pessoal de serviço criado.');
  }

  function editServiceTemplate(template: GuidedLaborTemplate) {
    setServiceTemplateDraft(serviceTemplateToDraft(template));
    setEditingServiceTemplateId(template.id);
  }

  function cancelServiceTemplateEdit() {
    setEditingServiceTemplateId(null);
    setServiceTemplateDraft(emptyServiceTemplateDraft);
  }

  function updateServiceTemplate(id: string, patch: Partial<Pick<GuidedLaborTemplate, 'title' | 'description' | 'defaultUnitValue' | 'minimumValue' | 'marginPercent' | 'unit' | 'estimatedTime' | 'suggestedMaterials' | 'category' | 'professionModule' | 'note' | 'visible'>>) {
    setServiceTemplates((current) => current.map((template) => (
      template.id === id ? { ...template, ...patch, updatedAt: new Date().toISOString() } : template
    )));
  }

  function addServiceTemplateToBudget(template: GuidedLaborTemplate) {
    const quantity = parseCommercialNumber(serviceTemplateQuantities[template.id], 1);
    const unitValue = parseCommercialNumber(serviceTemplateValues[template.id], template.defaultUnitValue);
    if (quantity <= 0) return;
    setItems((current) => [...current, createBudgetItemFromServiceTemplate(template, quantity, unitValue)]);
    setShareFeedback(`${template.title} adicionado ao orçamento${template.minimumValue ? ` (mínimo sugerido: ${formatCurrency(template.minimumValue)})` : ''}.`);
  }

  function importTechnicalCapture(capture: CalculationCapture) {
    const budgetItem = technicalCaptureToBudgetItem(capture);
    const issues = validateBudgetItem(budgetItem);
    if (hasBlockingBudgetIssues(issues)) {
      setShareFeedback(issues[0]?.message ?? 'O item técnico não está pronto para orçamento.');
      return;
    }
    setItems((current) => [...current, budgetItem]);
    markTechnicalCaptureConverted(capture.id);
    setActiveSection('items');
  }

  function importAllTechnicalCaptures() {
    const validItems = pendingTechnicalCaptures.map(technicalCaptureToBudgetItem).filter((item) => !hasBlockingBudgetIssues(validateBudgetItem(item)));
    if (validItems.length === 0) return;
    setItems((current) => [...current, ...validItems]);
    pendingTechnicalCaptures.forEach((capture) => markTechnicalCaptureConverted(capture.id));
    setActiveSection('items');
  }

  function removeItem(itemId: string) {
    const item = items.find((budgetItem) => budgetItem.id === itemId);
    const confirmed = window.confirm(`Remover "${item?.description ?? 'este item'}" deste orçamento?`);
    if (!confirmed) return;
    setItems((current) => current.filter((item) => item.id !== itemId));
    if (selectedBudgetItemId === itemId) setSelectedBudgetItemId(null);
  }

  function duplicateItem(item: BudgetItem) {
    const duplicatedItem = { ...item, id: createId(`copy-${item.id}`) };
    setItems((current) => [...current, duplicatedItem]);
    setSelectedBudgetItemId(duplicatedItem.id);
  }

  function loadStarterItems() {
    const confirmed = items.length === 0 || window.confirm('Substituir os itens atuais pelo modelo inicial?');
    if (!confirmed) return;
    setItems(starterElectricalBudgetItems);
    setSelectedBudgetItemId(starterElectricalBudgetItems[0]?.id ?? null);
  }

  function clearItems() {
    const confirmed = window.confirm('Limpar todos os itens deste orçamento?');
    if (!confirmed) return;
    setItems([]);
    setSelectedBudgetItemId(null);
  }

  function resetBudgetDraft() {
    const confirmed = window.confirm('Criar um novo orçamento e limpar o rascunho atual? Orçamentos já salvos continuam na lista.');
    if (!confirmed) return;
    clearBudgetDraft();
    setActiveBudgetId(null);
    setBudgetStatus('draft');
    setClientName(activeClient?.name ?? '');
    setBudgetTitle(activeWorkOrder?.title ?? '');
    setDiscount(0);
    setTravelCost(0);
    setAdditionalFees(0);
    setPaymentTerms(businessProfile.defaultPaymentTerms);
    setValidity(businessProfile.defaultValidity);
    setGuarantee(businessProfile.defaultGuarantee);
    setExecutionDeadline(businessProfile.defaultExecutionDeadline);
    setCommercialNotes(businessProfile.defaultNotes);
    setTechnicalNotes('');
    setItems([]);
    setDraft(emptyDraftItem);
    setLastSavedAt(null);
    setActiveSection('proposal');
  }

  function persistCurrentBudget(status: SavedBudgetStatus = budgetStatus): SavedBudgetRecord | null {
    if (savedBudgetLimitReached) {
      setShareFeedback(proUpgradeMessage(`Mais de ${FREE_PLAN_LIMITS.savedBudgets} orçamentos salvos`));
      return null;
    }
    const saved = saveBudgetRecord({ id: activeBudgetId, clientName, title: budgetTitle || 'Orçamento sem título', status, discount, travelCost, additionalFees, paymentTerms, validity, guarantee, executionDeadline, commercialNotes, technicalNotes, templateId: selectedTemplate, items });
    if (!saved) return null;
    setActiveBudgetId(saved.id);
    setSavedBudgets(loadSavedBudgets());
    setBudgetStatus(saved.status);
    return saved;
  }

  function saveCurrentBudget() {
    const saved = persistCurrentBudget();
    if (saved) setShareFeedback('Orçamento salvo localmente neste navegador.');
  }

  function duplicateSavedBudget(record: SavedBudgetRecord) {
    if (!isProPlan) {
      setShareFeedback(proUpgradeMessage('Duplicar orçamento'));
      onUpgradeRequest?.();
      return;
    }
    const duplicated = saveBudgetRecord({
      clientName: record.clientName,
      title: `${record.title || 'Orçamento sem título'} - cópia`,
      status: 'draft',
      discount: record.discount,
      travelCost: record.travelCost,
      additionalFees: record.additionalFees,
      paymentTerms: record.paymentTerms,
      validity: record.validity,
      guarantee: record.guarantee,
      executionDeadline: record.executionDeadline,
      commercialNotes: record.commercialNotes,
      technicalNotes: record.technicalNotes,
      templateId: record.templateId as BudgetTemplateId | undefined,
      items: record.items,
    });
    if (!duplicated) {
      setShareFeedback('Não foi possível duplicar este orçamento.');
      return;
    }
    setSavedBudgets(loadSavedBudgets());
    openSavedBudget(duplicated);
    setShareFeedback('Orçamento duplicado como novo rascunho.');
  }

  function updateSavedBudgetStatus(record: SavedBudgetRecord, status: SavedBudgetStatus) {
    const updated = saveBudgetRecord({
      id: record.id,
      clientName: record.clientName,
      title: record.title,
      status,
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
    });
    setSavedBudgets(loadSavedBudgets());
    if (record.id === activeBudgetId && updated) setBudgetStatus(updated.status);
    setShareFeedback(`Orçamento marcado como ${statusLabel(status).toLowerCase()}.`);
  }

  function markBudgetAsSent() {
    const saved = persistCurrentBudget('sent');
    if (saved) setShareFeedback('Orçamento marcado como enviado.');
  }

  function markBudgetAsApproved() {
    const saved = persistCurrentBudget('approved');
    if (saved) setShareFeedback('Orçamento aprovado. Agora você pode converter em OS.');
  }

  function buildBudgetShareText(): string {
    const companyName = businessProfile.businessName || businessProfile.responsibleName || 'OrçaOS';
    const itemLines = items.length > 0
      ? items.map((item, index) => `${index + 1}. ${item.description} - ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(safeBudgetItemTotal(item))}`)
      : ['Sem itens cadastrados ainda.'];

    return joinTextLines([
      `${budgetTitle || 'Orçamento técnico'}`,
      `Profissional: ${companyName}`,
      clientName.trim() ? `Cliente: ${clientName.trim()}` : null,
      '',
      'Itens:',
      ...itemLines,
      '',
      `Subtotal: ${formatCurrency(summary.subtotal)}`,
      travelCost > 0 ? `Deslocamento: ${formatCurrency(travelCost)}` : null,
      additionalFees > 0 ? `Taxas adicionais: ${formatCurrency(additionalFees)}` : null,
      discount > 0 ? `Desconto: ${formatCurrency(discount)}` : null,
      `Total: ${formatCurrency(summary.total)}`,
      paymentTerms ? `Pagamento: ${paymentTerms}` : null,
      validity ? `Validade: ${validity}` : null,
      guarantee ? `Garantia: ${guarantee}` : null,
      executionDeadline ? `Prazo: ${executionDeadline}` : null,
      commercialNotes ? `Observações comerciais: ${commercialNotes}` : null,
      technicalNotes ? `Observações técnicas: ${technicalNotes}` : null,
    ]);
  }

  async function copyBudgetShareText() {
    if (blockingProposalIssues) {
      setShareFeedback(proposalIssues.find((issue) => issue.severity === 'error')?.message ?? 'Revise a proposta antes de copiar.');
      return;
    }
    const text = buildBudgetShareText();
    try {
      await navigator.clipboard.writeText(text);
      setShareFeedback('Texto da proposta copiado.');
    } catch {
      setShareFeedback('Não foi possível copiar automaticamente. Use a prévia para conferir e imprimir.');
    }
  }

  function openBudgetWhatsApp() {
    if (blockingProposalIssues) {
      setShareFeedback(proposalIssues.find((issue) => issue.severity === 'error')?.message ?? 'Revise a proposta antes de enviar.');
      return;
    }
    const url = `https://wa.me/?text=${encodeURIComponent(buildBudgetShareText())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    persistCurrentBudget('sent');
    setShareFeedback('WhatsApp aberto com o texto da proposta.');
  }

  function convertApprovedBudgetToWorkOrder() {
    if (budgetStatus !== 'approved') {
      setShareFeedback('Marque o orçamento como aprovado antes de converter em OS.');
      return;
    }
    const confirmed = window.confirm('Confirmar conversão deste orçamento aprovado em OS? Use esta ação somente quando o cliente autorizou a execução.');
    if (!confirmed) {
      setShareFeedback('Conversão cancelada. O orçamento continua aprovado.');
      return;
    }
    onConvertApprovedBudgetToWorkOrder?.();
    setShareFeedback(activeWorkOrder ? 'OS aprovada. Atendimento marcado como execução autorizada.' : 'Orçamento aprovado. Crie ou vincule um atendimento para gerar a OS.');
  }

  function openSavedBudget(record: SavedBudgetRecord) {
    setActiveBudgetId(record.id);
    setClientName(record.clientName);
    setBudgetTitle(record.title);
    setBudgetStatus(record.status);
    setDiscount(record.discount);
    setTravelCost(record.travelCost);
    setAdditionalFees(record.additionalFees);
    setPaymentTerms(record.paymentTerms || businessProfile.defaultPaymentTerms);
    setValidity(record.validity || businessProfile.defaultValidity);
    setGuarantee(record.guarantee || businessProfile.defaultGuarantee);
    setExecutionDeadline(record.executionDeadline || businessProfile.defaultExecutionDeadline);
    setCommercialNotes(record.commercialNotes || businessProfile.defaultNotes);
    setTechnicalNotes(record.technicalNotes);
    if (record.templateId) setSelectedTemplate(record.templateId as BudgetTemplateId);
    setItems(record.items);
    setDraft(emptyDraftItem);
    setActiveSection('proposal');
  }

  function removeSavedBudget(recordId: string) {
    setSavedBudgets(deleteSavedBudget(recordId));
    if (recordId === activeBudgetId) resetBudgetDraft();
  }

  const canAddItem = draft.description.trim().length > 0 && draft.quantity > 0 && draft.unitPrice >= 0;
  const canAddCatalogItem = catalogDraft.description.trim().length > 0 && catalogDraft.quantity > 0 && catalogDraft.unitPrice >= 0;
  const canAddServiceTemplate = serviceTemplateDraft.title.trim().length > 0;
  const visibleServiceTemplates = serviceTemplates.filter((template) => {
    if (!template.visible) return false;
    const normalizedSearch = serviceTemplateSearch.trim().toLowerCase();
    if (!normalizedSearch) return true;
    return [template.title, template.description, template.category, template.professionModule, template.suggestedMaterials, template.note].filter(Boolean).join(' ').toLowerCase().includes(normalizedSearch);
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const visibleCatalogItems = catalogItems.filter((item) => {
    const categoryMatches = catalogCategoryFilter === 'all' || item.category === catalogCategoryFilter;
    const normalizedSearch = catalogSearch.trim().toLowerCase();
    const textMatches = !normalizedSearch || [item.description, categoryLabel(item.category), item.notes, formatCurrency(item.unitPrice)].filter(Boolean).join(' ').toLowerCase().includes(normalizedSearch);
    return categoryMatches && textMatches;
  });
  const isProPlan = userPlan === 'pro';
  const savedBudgetLimitReached = !isProPlan && !activeBudgetId && savedBudgets.length >= FREE_PLAN_LIMITS.savedBudgets;
  const catalogLimitReached = !isProPlan && catalogItems.length >= FREE_PLAN_LIMITS.catalogItems;
  const serviceTemplateLimitReached = !isProPlan && serviceTemplates.length >= FREE_PLAN_LIMITS.serviceTemplates;
  const budgetApprovalAction =
    budgetStatus === 'draft'
      ? { label: 'Marcar como enviado', description: 'Use depois de copiar, enviar por WhatsApp ou entregar a proposta ao cliente.' }
      : budgetStatus === 'sent'
        ? { label: 'Marcar como aprovado', description: 'Use somente quando o cliente confirmar que aceitou o orçamento.' }
        : null;
  const estimatedMarginValue = Math.max(summary.total - summary.material - summary.travel - summary.fees, 0);
  const estimatedMarginPercent = summary.total > 0 ? Math.round((estimatedMarginValue / summary.total) * 100) : 0;

  return (
    <div className="budget-workspace">
      <div className="budget-save-status">
        <span>Salvo automaticamente</span>
        <strong>{formatSavedAt(lastSavedAt)}</strong>
      </div>

      {activeWorkOrder && (
        <section className="budget-context-panel">
          <strong>Vinculado ao atendimento ativo</strong>
          <span>{activeWorkOrder.title} · {activeClient?.name ?? 'Cliente não vinculado'}</span>
          <small>{activeWorkOrder.address || activeClient?.address || 'Sem endereço'} · {formatOptionalDateTime(activeWorkOrder.scheduledDate)}</small>
        </section>
      )}

      <section className="budget-guided-map">
        <div className="budget-guided-status">
          <span>Status do orçamento</span>
          <strong>{statusLabel(budgetStatus)}</strong>
          <small>{statusGuidance(budgetStatus)}</small>
        </div>
        <div className="budget-guided-flow" aria-label="Status comercial do orçamento">
          {[
            { label: 'Rascunho', helper: 'Montar dados e itens', active: budgetStatus === 'draft', future: false, section: 'proposal' as const },
            { label: 'Enviado', helper: 'Aguardar resposta', active: budgetStatus === 'sent', future: budgetStatus === 'draft', section: 'preview' as const },
            { label: 'Aprovado', helper: 'Liberar conversão em OS', active: budgetStatus === 'approved', future: budgetStatus !== 'approved', section: 'preview' as const },
          ].map((step, index) => (
            <button className={[step.active ? 'active' : '', step.future ? 'future' : ''].filter(Boolean).join(' ')} key={step.label} type="button" onClick={() => setActiveSection(step.section)}>
              <span>{index + 1}</span>
              <strong>{step.label}<small>{step.helper}</small></strong>
            </button>
          ))}
        </div>
        <div className="budget-commercial-map">
          <article><span>Mão de obra</span><strong>{formatCurrency(summary.labor)}</strong></article>
          <article><span>Materiais</span><strong>{formatCurrency(summary.material)}</strong></article>
          <article><span>Deslocamento</span><strong>{formatCurrency(summary.travel)}</strong></article>
          <article><span>Desconto</span><strong>{formatCurrency(discount)}</strong></article>
          <article><span>Margem estimada</span><strong>{formatCurrency(estimatedMarginValue)}</strong><small>{estimatedMarginPercent}% do total</small></article>
          <article className="total"><span>Total</span><strong>{formatCurrency(summary.total)}</strong></article>
        </div>
        <div className="budget-commercial-terms">
          <span>Validade: <strong>{validity || 'não definida'}</strong></span>
          <span>Condições: <strong>{paymentTerms || 'não definidas'}</strong></span>
          <span>Observações ao cliente: <strong>{commercialNotes || 'sem observações'}</strong></span>
        </div>
      </section>

      <div className="budget-workspace-tabs">
        <button className={activeSection === 'proposal' ? 'active' : ''} type="button" onClick={() => setActiveSection('proposal')}>Dados</button>
        <button className={activeSection === 'items' ? 'active' : ''} type="button" onClick={() => setActiveSection('items')}>Itens</button>
        <button className={activeSection === 'review' ? 'active' : ''} type="button" onClick={() => setActiveSection('review')}>Revisão</button>
        <button className={activeSection === 'preview' ? 'active' : ''} type="button" onClick={() => setActiveSection('preview')}>Envio</button>
      </div>
      <div className="budget-secondary-links" aria-label="Recursos auxiliares do orçamento">
        <button className={activeSection === 'catalog' ? 'active' : ''} type="button" onClick={() => setActiveSection('catalog')}>Catálogo simples</button>
      </div>

      {activeSection === 'proposal' && (
        <section className="budget-section-panel">
          <div className="budget-section-header">
            <div>
              <h3>Dados da proposta</h3>
              <p>Defina cliente, condições comerciais, prazo, garantia e status do orçamento.</p>
            </div>
            <button type="button" className="primary-action inline-action" onClick={saveCurrentBudget}>{activeBudgetId ? 'Atualizar orçamento' : 'Salvar orçamento'}</button>
          </div>

          {!activeClient && !activeWorkOrder && <div className="budget-guidance-card">Selecione um cliente ou atendimento para preencher automaticamente.</div>}
          {!activeBudgetId && <div className="budget-guidance-card">Este orçamento ainda não foi salvo.</div>}
          {!isProPlan && <div className="budget-pro-limit-card"><div><strong>Free: {savedBudgets.length}/{FREE_PLAN_LIMITS.savedBudgets} orçamentos salvos</strong><small>O orçamento simples continua livre. O Pro libera orçamentos ilimitados, duplicação e modelos de PDF profissionais.</small></div><button type="button" className="secondary-action inline-action" onClick={onUpgradeRequest}>Ver Pro</button></div>}
          {items.length === 0 && <div className="budget-guidance-card">Adicione itens para gerar uma proposta apresentável.</div>}
          {!businessProfile.businessName.trim() && !businessProfile.responsibleName.trim() && <div className="budget-guidance-card">Configure sua identidade em Configurações &gt; Empresa para deixar a proposta completa.</div>}

          <div className="budget-header-card compact-budget-card">
            <label className="budget-field"><span>Cliente</span><input placeholder="Nome do cliente" value={clientName} onChange={(event) => setClientName(event.target.value)} /></label>
            <label className="budget-field"><span>Título do orçamento</span><input placeholder="Ex.: Instalação elétrica residencial" value={budgetTitle} onChange={(event) => setBudgetTitle(event.target.value)} /></label>
            <label className="budget-field"><span>Status</span><select value={budgetStatus} onChange={(event) => setBudgetStatus(event.target.value as SavedBudgetStatus)}><option value="draft">Rascunho</option><option value="sent">Enviado</option><option value="approved">Aprovado</option><option value="rejected">Recusado</option><option value="expired">Vencido</option><option value="cancelled">Cancelado</option></select></label>
          </div>

          <div className="budget-summary-strip">
            <article><span>Itens</span><strong>{items.length}</strong></article>
            <article><span>Mão de obra</span><strong>{formatCurrency(summary.labor)}</strong></article>
            <article><span>Materiais</span><strong>{formatCurrency(summary.material)}</strong></article>
            <article><span>Subtotal</span><strong>{formatCurrency(summary.commercialSubtotal)}</strong></article>
            <article><span>Desconto</span><strong>{formatCurrency(discount)}</strong></article>
            <article><span>Total</span><strong>{formatCurrency(summary.total)}</strong></article>
          </div>

          <div className="budget-header-card compact-budget-card">
            <label className="budget-field"><span>Deslocamento</span><input type="number" inputMode="decimal" min="0" step="0.01" value={travelCost} onFocus={handleNumericInputFocus} onChange={(event) => setTravelCost(parseInputAmount(event.target.value))} /></label>
            <label className="budget-field"><span>Taxas adicionais</span><input type="number" inputMode="decimal" min="0" step="0.01" value={additionalFees} onFocus={handleNumericInputFocus} onChange={(event) => setAdditionalFees(parseInputAmount(event.target.value))} /></label>
            <label className="budget-field"><span>Desconto</span><input type="number" inputMode="decimal" min="0" step="0.01" value={discount} onFocus={handleNumericInputFocus} onChange={(event) => setDiscount(parseInputAmount(event.target.value))} /></label>
            <label className="budget-field"><span>Validade</span><input value={validity} placeholder="Ex.: 7 dias" onChange={(event) => setValidity(event.target.value)} /></label>
            <label className="budget-field"><span>Garantia</span><input value={guarantee} placeholder="Ex.: 90 dias sobre mão de obra" onChange={(event) => setGuarantee(event.target.value)} /></label>
            <label className="budget-field"><span>Prazo de execução</span><input value={executionDeadline} placeholder="Ex.: 2 dias úteis" onChange={(event) => setExecutionDeadline(event.target.value)} /></label>
            <label className="budget-field budget-field-wide"><span>Condições de pagamento</span><textarea value={paymentTerms} placeholder="Ex.: 50% na aprovação e 50% na entrega" onChange={(event) => setPaymentTerms(event.target.value)} /></label>
            <label className="budget-field budget-field-wide"><span>Observações comerciais</span><textarea value={commercialNotes} placeholder="Ex.: valores sujeitos a disponibilidade de materiais" onChange={(event) => setCommercialNotes(event.target.value)} /></label>
            <label className="budget-field budget-field-wide"><span>Observações técnicas</span><textarea value={technicalNotes} placeholder="Ex.: validar infraestrutura existente antes da execução" onChange={(event) => setTechnicalNotes(event.target.value)} /></label>
            <div className="budget-default-actions budget-field-wide">
              <button type="button" className="secondary-action inline-action" onClick={applyBusinessDefaultsToProposal}>Aplicar padrões locais</button>
              <button type="button" className="secondary-action inline-action" onClick={saveCurrentProposalAsDefaults}>Salvar como padrão local</button>
            </div>
          </div>

          <div className="saved-budget-panel inline-saved-panel">
            <div className="saved-budget-panel-header"><div><h3>Orçamentos salvos</h3><p>Abra, atualize ou remova rascunhos deste navegador.</p></div></div>
            <div className="budget-list-search-bar">
              <label className="budget-field"><span>Buscar orçamento</span><input value={savedBudgetSearch} placeholder="Cliente, título, status ou valor" onChange={(event) => setSavedBudgetSearch(event.target.value)} /></label>
            </div>
            <div className="saved-budget-list">
              {savedBudgets.length === 0 ? <div className="empty-budget">Nenhum orçamento salvo ainda.</div> : visibleSavedBudgets.length === 0 ? <div className="empty-budget">Nenhum orçamento encontrado com essa busca.</div> : visibleSavedBudgets.map((record) => <article className={record.id === activeBudgetId ? 'saved-budget-card active' : 'saved-budget-card'} key={record.id}><button type="button" className="saved-budget-open" onClick={() => openSavedBudget(record)}><strong>{record.title || 'Orçamento sem título'}</strong><small>{record.clientName || 'Cliente não informado'}</small><span>{statusLabel(record.status)} · {formatCurrency(calculateSavedBudgetTotal(record))} · {formatDateTime(record.updatedAt)}</span></button><div className="saved-budget-actions"><button type="button" className="secondary-action inline-action" onClick={() => openSavedBudget(record)}>Editar</button>{record.status === 'draft' && <button type="button" className="secondary-action inline-action" onClick={() => updateSavedBudgetStatus(record, 'sent')}>Enviado</button>}{record.status !== 'approved' && <button type="button" className="primary-action inline-action" onClick={() => updateSavedBudgetStatus(record, 'approved')}>Aprovar</button>}{record.status !== 'rejected' && <button type="button" className="secondary-action inline-action" onClick={() => updateSavedBudgetStatus(record, 'rejected')}>Recusar</button>}<button type="button" className="secondary-action inline-action" onClick={() => duplicateSavedBudget(record)}>Duplicar</button><button type="button" className="saved-budget-delete" onClick={() => removeSavedBudget(record.id)}>Excluir</button></div></article>)}
              {hiddenSavedBudgetCount > 0 && <div className="empty-budget compact">Mais {hiddenSavedBudgetCount} orçamento(s) oculto(s). Use a busca para refinar.</div>}
            </div>
          </div>

          <div className="budget-actions"><button type="button" className="danger-action" onClick={resetBudgetDraft}>Novo orçamento</button></div>
        </section>
      )}

      {activeSection === 'items' && (
        <section className="budget-section-panel">
          <div className="budget-section-header">
            <div>
              <h3>Itens do orçamento</h3>
              <p>Adicione, edite, duplique ou remova serviços e materiais da proposta.</p>
            </div>
            {pendingTechnicalCaptures.length > 0 && <button type="button" className="primary-action inline-action" onClick={importAllTechnicalCaptures}>Importar técnicos ({pendingTechnicalCaptures.length})</button>}
          </div>

          {pendingTechnicalCaptures.length > 0 && (
            <div className="technical-import-list compact-import-list">
              {pendingTechnicalCaptures.map((capture) => {
                const previewItem = technicalCaptureToBudgetItem(capture);
                return <article className="technical-import-card" key={capture.id}><span><strong>{previewItem.description}</strong><small>{capture.moduleLabel} · {capture.calculatorLabel}</small><small>{categoryLabel(previewItem.category)} · {previewItem.quantity} × {formatCurrency(previewItem.unitPrice)}</small></span><button type="button" className="secondary-action inline-action" onClick={() => importTechnicalCapture(capture)}>Importar</button></article>;
              })}
            </div>
          )}

            <div className="service-template-panel">
              <div className="budget-section-header">
                <div>
                  <h3>Modelos pessoais de serviço</h3>
                  <p>Use sua própria base de mão de obra para montar orçamento rápido sem depender de assistente longo.</p>
                </div>
              </div>
            <div className="budget-list-search-bar">
              <label className="budget-field"><span>Buscar modelo</span><input value={serviceTemplateSearch} placeholder="Serviço, categoria, profissão ou material sugerido" onChange={(event) => setServiceTemplateSearch(event.target.value)} /></label>
            </div>
            {!isProPlan && <div className="budget-pro-limit-card"><div><strong>Free: {serviceTemplates.length}/{FREE_PLAN_LIMITS.serviceTemplates} modelos pessoais</strong><small>O Pro libera modelos personalizados, serviços compostos e duplicação de orçamento para acelerar serviços recorrentes.</small></div><button type="button" className="secondary-action inline-action" onClick={onUpgradeRequest}>Ver Pro</button></div>}
            <div className="service-template-new-card">
              <div className="budget-editor-title budget-field-wide">
                <h3>{editingServiceTemplateId ? 'Editar modelo pessoal' : 'Novo modelo pessoal'}</h3>
                <p>{editingServiceTemplateId ? 'Confirme as alterações para atualizar este serviço recorrente.' : 'Crie serviços recorrentes para montar orçamento rápido.'}</p>
              </div>
              <label className="budget-field budget-field-wide"><span>Nome do serviço</span><input value={serviceTemplateDraft.title} placeholder="Ex.: Troca de disjuntor" onChange={(event) => updateServiceTemplateDraft('title', event.target.value)} /></label>
              <label className="budget-field budget-field-wide"><span>Descrição</span><input value={serviceTemplateDraft.description} placeholder="Ex.: substituição com conferência do quadro e reaperto dos bornes" onChange={(event) => updateServiceTemplateDraft('description', event.target.value)} /></label>
              <label className="budget-field"><span>Valor recomendado</span><input inputMode="decimal" value={serviceTemplateDraft.defaultUnitValue} placeholder="Ex.: 95" onFocus={handleNumericInputFocus} onChange={(event) => updateServiceTemplateDraft('defaultUnitValue', event.target.value)} /></label>
              <label className="budget-field"><span>Valor mínimo</span><input inputMode="decimal" value={serviceTemplateDraft.minimumValue} placeholder="Ex.: 80" onFocus={handleNumericInputFocus} onChange={(event) => updateServiceTemplateDraft('minimumValue', event.target.value)} /></label>
              <label className="budget-field"><span>Margem</span><input inputMode="decimal" value={serviceTemplateDraft.marginPercent} placeholder="%" onFocus={handleNumericInputFocus} onChange={(event) => updateServiceTemplateDraft('marginPercent', event.target.value)} /></label>
              <label className="budget-field"><span>Unidade</span><input value={serviceTemplateDraft.unit} placeholder="serviço, ponto, m..." onChange={(event) => updateServiceTemplateDraft('unit', event.target.value)} /></label>
              <label className="budget-field"><span>Tempo estimado</span><input value={serviceTemplateDraft.estimatedTime} placeholder="Ex.: 1 h" onChange={(event) => updateServiceTemplateDraft('estimatedTime', event.target.value)} /></label>
              <label className="budget-field"><span>Categoria</span><input value={serviceTemplateDraft.category} placeholder="Ex.: Elétrica" onChange={(event) => updateServiceTemplateDraft('category', event.target.value)} /></label>
              <label className="budget-field"><span>Módulo/profissão</span><input value={serviceTemplateDraft.professionModule} placeholder="Ex.: Eletricista" onChange={(event) => updateServiceTemplateDraft('professionModule', event.target.value)} /></label>
              <label className="budget-field budget-field-wide"><span>Materiais sugeridos</span><input value={serviceTemplateDraft.suggestedMaterials} placeholder="Ex.: disjuntor, identificador, terminal, parafuso" onChange={(event) => updateServiceTemplateDraft('suggestedMaterials', event.target.value)} /></label>
              <label className="budget-field budget-field-wide"><span>Observações do modelo</span><input value={serviceTemplateDraft.note} placeholder="Ex.: validar quadro, espaço e padrão do cliente." onChange={(event) => updateServiceTemplateDraft('note', event.target.value)} /></label>
              <div className="budget-actions budget-field-wide">
                <button className="primary-action inline-action" type="button" disabled={!canAddServiceTemplate || (serviceTemplateLimitReached && !editingServiceTemplateId)} onClick={addServiceTemplate}>{editingServiceTemplateId ? 'Salvar alterações' : 'Criar modelo'}</button>
                {editingServiceTemplateId && <button className="secondary-action inline-action" type="button" onClick={cancelServiceTemplateEdit}>Cancelar edição</button>}
              </div>
            </div>
            <div className="service-template-grid">
              {visibleServiceTemplates.length === 0 ? (
                <div className="empty-budget">Nenhum modelo encontrado. Ajuste a busca ou crie um modelo novo.</div>
              ) : visibleServiceTemplates.slice(0, VISIBLE_LIST_LIMIT).map((template) => (
                <article className="service-template-card" key={template.id}>
                  <div>
                    <strong>{template.title}</strong>
                    <small>{formatCurrency(template.defaultUnitValue)} / {template.unit}</small>
                    {template.description && <small>{template.description}</small>}
                    <div className="service-template-meta">
                      {template.category && <span>{template.category}</span>}
                      {template.professionModule && <span>{template.professionModule}</span>}
                      {template.estimatedTime && <span>{template.estimatedTime}</span>}
                      {typeof template.marginPercent === 'number' && <span>Margem {template.marginPercent}%</span>}
                      {typeof template.minimumValue === 'number' && <span>Mín. {formatCurrency(template.minimumValue)}</span>}
                    </div>
                    {template.suggestedMaterials && <small>Materiais sugeridos: {template.suggestedMaterials}</small>}
                    <small>{template.note}</small>
                  </div>
                  <div className="service-template-controls">
                    <label className="budget-field"><span>Qtd.</span><input inputMode="decimal" value={serviceTemplateQuantities[template.id] ?? '1'} onFocus={handleNumericInputFocus} onChange={(event) => setServiceTemplateQuantities((current) => ({ ...current, [template.id]: event.target.value }))} /></label>
                    <label className="budget-field"><span>Valor</span><input inputMode="decimal" value={serviceTemplateValues[template.id] ?? String(template.defaultUnitValue)} onFocus={handleNumericInputFocus} onChange={(event) => setServiceTemplateValues((current) => ({ ...current, [template.id]: event.target.value }))} /></label>
                    <button className="primary-action inline-action" type="button" onClick={() => addServiceTemplateToBudget(template)}>Adicionar</button>
                    <button className="secondary-action inline-action" type="button" onClick={() => editServiceTemplate(template)}>Editar</button>
                    <button className="secondary-action inline-action" type="button" onClick={() => updateServiceTemplate(template.id, { visible: false })}>Ocultar</button>
                  </div>
                </article>
              ))}
              {visibleServiceTemplates.length > VISIBLE_LIST_LIMIT && <div className="empty-budget compact">Mais {visibleServiceTemplates.length - VISIBLE_LIST_LIMIT} modelo(s) oculto(s). Use a busca para refinar.</div>}
            </div>
          </div>

          <div className="budget-editor compact-budget-card" aria-label="Editor de orçamento">
            <div className="budget-editor-title"><h3>Adicionar item manual</h3><p>Use para serviços ou materiais fora do catálogo.</p></div>
            <div className="budget-form-grid"><label className="budget-field budget-field-wide"><span>Descrição</span><input placeholder="Ex.: Instalação de tomada dupla" value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} /></label><label className="budget-field"><span>Qtd.</span><input type="number" inputMode="decimal" min="0" step="0.01" value={draft.quantity} onFocus={handleNumericInputFocus} onChange={(event) => updateDraft('quantity', Number(event.target.value))} /></label><label className="budget-field"><span>Valor unitário</span><input type="number" inputMode="decimal" min="0" step="0.01" value={draft.unitPrice} onFocus={handleNumericInputFocus} onChange={(event) => updateDraft('unitPrice', Number(event.target.value))} /></label><label className="budget-field"><span>Categoria</span><select value={draft.category} onChange={(event) => updateDraft('category', event.target.value as BudgetCategory)}><option value="labor">Mão de obra</option><option value="material">Material</option><option value="other">Outro</option></select></label></div>
            <div className="budget-actions"><button type="button" className="primary-action inline-action" disabled={!canAddItem} onClick={addItem}>Adicionar item</button><button type="button" className="secondary-action inline-action" onClick={loadStarterItems}>Carregar modelo</button><button type="button" className="ghost-action" onClick={clearItems}>Limpar itens</button></div>
          </div>

          <div className="budget-item-manager">
            <div className="budget-item-manager-header">
              <div>
                <strong>Itens do orçamento</strong>
                <small>{items.length} item(ns) no orçamento · {filteredBudgetItems.length} encontrado(s)</small>
              </div>
              <div className="budget-item-manager-filters">
                <label className="budget-field"><span>Buscar item</span><input value={budgetItemSearch} placeholder="Descrição, categoria ou valor" onChange={(event) => setBudgetItemSearch(event.target.value)} /></label>
                <label className="budget-field"><span>Categoria</span><select value={budgetItemCategoryFilter} onChange={(event) => setBudgetItemCategoryFilter(event.target.value as BudgetCategory | 'all')}><option value="all">Todas</option><option value="labor">Mão de obra</option><option value="material">Material</option><option value="other">Outro</option></select></label>
              </div>
            </div>

            {items.length === 0 ? <div className="empty-budget">Nenhum item adicionado ainda.</div> : (
              <div className="budget-item-manager-grid">
                <div className="budget-item-table" role="list" aria-label="Itens do orçamento">
                  {visibleBudgetItems.length === 0 ? <div className="empty-budget compact">Nenhum item encontrado com estes filtros.</div> : visibleBudgetItems.map((item) => (
                    <button className={selectedBudgetItemId === item.id ? 'budget-item-table-row active' : 'budget-item-table-row'} key={item.id} type="button" onClick={() => setSelectedBudgetItemId(item.id)}>
                      <span>
                        <strong>{item.description}</strong>
                        <small>{categoryLabel(item.category)} · Qtd. {item.quantity}</small>
                      </span>
                      <em>{formatCurrency(safeBudgetItemTotal(item))}</em>
                    </button>
                  ))}
                  {hiddenBudgetItemCount > 0 && <div className="empty-budget compact">Mais {hiddenBudgetItemCount} item(ns) oculto(s). Use busca ou categoria para refinar.</div>}
                </div>

                <article className="editable-budget-item-card budget-item-edit-panel">
                  {selectedBudgetItem ? (
                    <>
                      <div className="budget-item-edit-heading">
                        <div><span>Editar item</span><strong>{selectedBudgetItem.description || 'Item sem descrição'}</strong></div>
                        <em>{formatCurrency(safeBudgetItemTotal(selectedBudgetItem))}</em>
                      </div>
                      <div className="budget-form-grid">
                        <label className="budget-field budget-field-wide"><span>Descrição</span><input value={selectedBudgetItem.description} onChange={(event) => updateBudgetItem(selectedBudgetItem.id, 'description', event.target.value)} /></label>
                        <label className="budget-field"><span>Qtd.</span><input type="number" inputMode="decimal" min="0" step="0.01" value={selectedBudgetItem.quantity} onFocus={handleNumericInputFocus} onChange={(event) => updateBudgetItem(selectedBudgetItem.id, 'quantity', Number(event.target.value))} /></label>
                        <label className="budget-field"><span>Valor unitário</span><input type="number" inputMode="decimal" min="0" step="0.01" value={selectedBudgetItem.unitPrice} onFocus={handleNumericInputFocus} onChange={(event) => updateBudgetItem(selectedBudgetItem.id, 'unitPrice', Number(event.target.value))} /></label>
                        <label className="budget-field"><span>Categoria</span><select value={selectedBudgetItem.category} onChange={(event) => updateBudgetItem(selectedBudgetItem.id, 'category', event.target.value as BudgetCategory)}><option value="labor">Mão de obra</option><option value="material">Material</option><option value="other">Outro</option></select></label>
                      </div>
                      <div className="editable-budget-item-footer"><strong>{formatCurrency(safeBudgetItemTotal(selectedBudgetItem))}</strong><span>{categoryLabel(selectedBudgetItem.category)}</span><button type="button" className="secondary-action inline-action" onClick={() => duplicateItem(selectedBudgetItem)}>Duplicar</button><button type="button" className="danger-action" onClick={() => removeItem(selectedBudgetItem.id)}>Remover</button></div>
                    </>
                  ) : (
                    <div className="empty-budget">Selecione um item para editar.</div>
                  )}
                </article>
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === 'catalog' && (
        <section className="budget-section-panel">
          <div className="budget-section-header"><div><h3>Catálogo de produtos e serviços</h3><p>Cadastre itens recorrentes e adicione ao orçamento com um toque.</p></div></div>
          {!isProPlan && <div className="budget-pro-limit-card"><div><strong>Free: {catalogItems.length}/{FREE_PLAN_LIMITS.catalogItems} itens no catálogo</strong><small>O Pro libera catálogo ilimitado para produtos, serviços e fornecedores sem poluir o orçamento.</small></div><button type="button" className="secondary-action inline-action" onClick={onUpgradeRequest}>Ver Pro</button></div>}
          <div className="budget-editor-title">
            <h3>{editingCatalogItemId ? 'Editar item do catálogo simples' : 'Novo item do catálogo simples'}</h3>
            <p>{editingCatalogItemId ? 'Atualize o item reutilizável e salve sem criar duplicado.' : 'Cadastre itens que você usa com frequência no orçamento.'}</p>
          </div>
          <div className="budget-form-grid catalog-form-grid">
            <label className="budget-field budget-field-wide"><span>Descrição</span><input placeholder="Ex.: Instalação de tomada dupla" value={catalogDraft.description} onChange={(event) => updateCatalogDraft('description', event.target.value)} /></label>
            <label className="budget-field"><span>Qtd. padrão</span><input type="number" inputMode="decimal" min="0" step="0.01" value={catalogDraft.quantity} onFocus={handleNumericInputFocus} onChange={(event) => updateCatalogDraft('quantity', Number(event.target.value))} /></label>
            <label className="budget-field"><span>Valor unitário</span><input type="number" inputMode="decimal" min="0" step="0.01" value={catalogDraft.unitPrice} onFocus={handleNumericInputFocus} onChange={(event) => updateCatalogDraft('unitPrice', Number(event.target.value))} /></label>
            <label className="budget-field"><span>Categoria</span><select value={catalogDraft.category} onChange={(event) => updateCatalogDraft('category', event.target.value as BudgetCategory)}><option value="labor">Mão de obra</option><option value="material">Material</option><option value="other">Outro</option></select></label>
            <label className="budget-field budget-field-wide"><span>Notas internas</span><input value={catalogDraft.notes} onChange={(event) => updateCatalogDraft('notes', event.target.value)} /></label>
          </div>
          <div className="budget-actions">
            <button type="button" className="primary-action inline-action" disabled={!canAddCatalogItem || (catalogLimitReached && !editingCatalogItemId)} onClick={addCatalogItem}>{editingCatalogItemId ? 'Salvar alterações' : 'Adicionar ao catálogo'}</button>
            {editingCatalogItemId && <button type="button" className="secondary-action inline-action" onClick={cancelCatalogItemEdit}>Cancelar edição</button>}
          </div>
          <div className="budget-list-search-bar">
            <label className="budget-field"><span>Buscar no catálogo</span><input value={catalogSearch} placeholder="Descrição, categoria, nota ou valor" onChange={(event) => setCatalogSearch(event.target.value)} /></label>
            <label className="budget-field"><span>Categoria</span><select value={catalogCategoryFilter} onChange={(event) => setCatalogCategoryFilter(event.target.value as BudgetCategory | 'all')}><option value="all">Todas</option><option value="labor">Mão de obra</option><option value="material">Material</option><option value="other">Outro</option></select></label>
          </div>
          <div className="catalog-list">
            {visibleCatalogItems.length === 0 ? <div className="empty-budget">Nenhum item encontrado no catálogo simples.</div> : visibleCatalogItems.slice(0, VISIBLE_LIST_LIMIT).map((item) => <article className="catalog-card" key={item.id}><span><strong>{item.description}</strong><small>{categoryLabel(item.category)} · {item.defaultQuantity} × {formatCurrency(item.unitPrice)}</small>{item.notes && <small>{item.notes}</small>}</span><div><button type="button" className="secondary-action inline-action" onClick={() => addCatalogItemToBudget(item)}>Usar</button><button type="button" className="secondary-action inline-action" onClick={() => editCatalogItem(item)}>Editar</button><button type="button" className="danger-action" onClick={() => removeCatalogItem(item.id)}>Remover</button></div></article>)}
            {visibleCatalogItems.length > VISIBLE_LIST_LIMIT && <div className="empty-budget compact">Mais {visibleCatalogItems.length - VISIBLE_LIST_LIMIT} item(ns) oculto(s). Use a busca para refinar.</div>}
          </div>
        </section>
      )}

      {activeSection === 'review' && (
        <section className="budget-section-panel budget-review-panel">
          <div className="budget-section-header">
            <div>
              <h3>Revisão da proposta</h3>
              <p>Confira cliente, itens, composição de valor e pendências antes do envio.</p>
            </div>
            <button type="button" className="primary-action inline-action" onClick={() => setActiveSection('preview')}>Ir para envio</button>
          </div>

          {renderBudgetIssues(proposalIssues)}

          <div className="budget-review-grid">
            <article className="budget-review-total">
              <span>Total da proposta</span>
              <strong>{formatCurrency(summary.total)}</strong>
              <small>{items.length} item(ns) · {statusLabel(budgetStatus)}</small>
            </article>
            <article><span>Mão de obra</span><strong>{formatCurrency(summary.labor)}</strong></article>
            <article><span>Materiais</span><strong>{formatCurrency(summary.material)}</strong></article>
            <article><span>Deslocamento</span><strong>{formatCurrency(summary.travel)}</strong></article>
            <article><span>Taxas adicionais</span><strong>{formatCurrency(summary.fees)}</strong></article>
            <article><span>Outros</span><strong>{formatCurrency(summary.other)}</strong></article>
          </div>

          <div className="budget-review-columns">
            <div className="budget-review-card">
              <strong>Checklist comercial</strong>
              <ul>
                <li className={clientName.trim() ? 'complete' : ''}>Cliente informado</li>
                <li className={budgetTitle.trim() ? 'complete' : ''}>Título da proposta definido</li>
                <li className={items.length > 0 ? 'complete' : ''}>Itens adicionados</li>
                <li className={businessProfile.businessName || businessProfile.responsibleName ? 'complete' : ''}>Perfil profissional preenchido</li>
              </ul>
            </div>

            <div className="budget-review-card">
              <strong>Condições comerciais</strong>
              <small>{paymentTerms || 'Sem condição de pagamento definida.'}</small>
              <small>{validity || 'Sem validade definida.'}</small>
              <small>{guarantee || 'Sem garantia definida.'}</small>
              <small>{executionDeadline || 'Sem prazo de execução definido.'}</small>
            </div>
          </div>

          <div className="budget-review-card">
            <strong>Itens para conferência</strong>
            <div className="budget-review-item-list">
              {items.length === 0 ? <small>Nenhum item adicionado ainda.</small> : items.map((item) => (
                <article key={item.id}>
                  <span><strong>{item.description}</strong><small>{categoryLabel(item.category)} · {item.quantity} × {formatCurrency(item.unitPrice)}</small></span>
                  <em>{formatCurrency(safeBudgetItemTotal(item))}</em>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'preview' && (
        <section className="budget-section-panel preview-section-panel">
          <div className="budget-section-header"><div><h3>Envio e aprovação</h3><p>Envie a proposta, registre a aprovação e só depois gere a OS.</p></div></div>
          <div className="budget-simple-flow-card">
            <strong>Fluxo comercial simples</strong>
            <div>
              <span className={budgetStatus === 'draft' ? 'active' : ''}>1. Rascunho</span>
              <span className={budgetStatus === 'sent' ? 'active' : ''}>2. Enviado</span>
              <span className={budgetStatus === 'approved' ? 'active' : ''}>3. Aprovado</span>
            </div>
            <small>Aprovar só confirma aceite comercial. A OS é criada em uma ação separada e aparece apenas depois da aprovação.</small>
          </div>
          <div className="budget-flow-status-card">
            <div>
              <span>Etapa atual</span>
              <strong>{statusLabel(budgetStatus)}</strong>
              <small>{statusGuidance(budgetStatus)}</small>
            </div>
            <div className="budget-actions compact-actions">
              {budgetStatus === 'draft' && <button type="button" className="primary-action inline-action" disabled={blockingProposalIssues} onClick={markBudgetAsSent}>{budgetApprovalAction?.label}</button>}
              {budgetStatus === 'sent' && <button type="button" className="primary-action inline-action" disabled={blockingProposalIssues} onClick={markBudgetAsApproved}>{budgetApprovalAction?.label}</button>}
              {budgetStatus === 'approved' && <button type="button" className="secondary-action inline-action" onClick={() => setBudgetStatus('sent')}>Voltar para enviado</button>}
            </div>
            {budgetApprovalAction && <small className="budget-next-action-note">{budgetApprovalAction.description}</small>}
          </div>
          {budgetStatus === 'approved' && (
            <div className="budget-convert-os-card">
              <div>
                <strong>Próximo passo: gerar OS</strong>
                <small>Use somente quando a execução foi autorizada. Depois disso o atendimento passa para execução autorizada.</small>
              </div>
              <button type="button" className="primary-action inline-action" onClick={convertApprovedBudgetToWorkOrder}>Converter em OS</button>
            </div>
          )}
          <div className="budget-share-card">
            <div>
              <strong>Enviar proposta</strong>
              <small>Copie um resumo comercial ou abra o WhatsApp com valores e itens principais.</small>
            </div>
            <div className="budget-actions compact-actions">
              <button type="button" className="secondary-action inline-action" disabled={blockingProposalIssues} onClick={copyBudgetShareText}>Copiar texto</button>
              <button type="button" className="primary-action inline-action" disabled={blockingProposalIssues} onClick={openBudgetWhatsApp}>Abrir WhatsApp</button>
              <button type="button" className="secondary-action inline-action" disabled={blockingProposalIssues} onClick={saveCurrentBudget}>Salvar orçamento</button>
            </div>
            {shareFeedback && <small className="budget-share-feedback">{shareFeedback}</small>}
          </div>
          <div className="budget-share-card">
            <div>
              <strong>Modelo do PDF</strong>
              <small>O modelo grátis não tem marca d agua. Modelos Pro entram como acabamento profissional para vender melhor.</small>
            </div>
            <div className="budget-template-grid compact-template-grid">
              {budgetTemplateOptions.map((template) => {
                const isLocked = template.plan === 'pro' && !isProPlan;
                return <button className={['budget-template-card', selectedTemplate === template.id ? 'active' : '', isLocked ? 'locked' : ''].filter(Boolean).join(' ')} key={template.id} type="button" onClick={() => { if (isLocked) { setShareFeedback(proUpgradeMessage(template.title)); onUpgradeRequest?.(); return; } setSelectedTemplate(template.id); }}><span>{template.plan === 'free' ? 'Free' : 'Pro'}</span><strong>{template.title}</strong><small>{template.description}</small><em>{isLocked ? template.value : template.plan === 'pro' ? 'Liberado no seu Pro' : 'Incluso no orçamento grátis'}</em></button>;
              })}
            </div>
          </div>
          <BudgetPrintPreview clientName={clientName} budgetTitle={budgetTitle} status={budgetStatus} items={items} discount={discount} travelCost={travelCost} additionalFees={additionalFees} subtotal={summary.subtotal} commercialSubtotal={summary.commercialSubtotal} total={summary.total} businessProfile={businessProfile} paymentTerms={paymentTerms} validity={validity} guarantee={guarantee} executionDeadline={executionDeadline} commercialNotes={commercialNotes} technicalNotes={technicalNotes} templateId={selectedTemplate} validationIssues={proposalIssues} />
        </section>
      )}
    </div>
  );
}
