import { createId } from '../../../app/utils/idHelpers';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { UserPlan } from '../../../core/access/featureAccess';
import { FREE_PLAN_LIMITS } from '../../../core/access/planStrategy';
import type { Budget, BudgetItem, BudgetTemplateId, BusinessProfile, CatalogItem, Client, Service as WorkOrder } from '../../../core/types/business';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import { calculateBudgetItemTotal, calculateBudgetTotal } from '../../../core/pricing/budget';
import { hasBlockingBudgetIssues, validateBudgetForProposal, validateBudgetItem, type BudgetValidationIssue } from '../../../core/pricing/budgetValidation';
import { calculateProjectMargin } from '../../../core/finance/projectMargin';
import { canBudgetTransitionTo, isBudgetClosedStatus } from '../../../core/finance/budgetLifecycle';
import { roundTechnical } from '../../../core/format/number';
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
import { starterFinancialBudgetItems } from '../budgetTemplates';
import { BudgetPrintPreview } from './BudgetPrintPreview';
import { Modal, TextArea, MonetaryInput, Select, Button } from '../../../app/components/ui';
import './BudgetWorkspace.css';

const BudgetPdfDownloadButton = lazy(() => import('./BudgetPdfDownloadButton').then((module) => ({ default: module.BudgetPdfDownloadButton })));

type BudgetCategory = BudgetItem['category'];
type BudgetWorkspaceSection = 'cliente' | 'serviço' | 'itens' | 'custos' | 'revisão' | 'documento';

interface BudgetWorkspaceProps {
  technicalCaptures?: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
  userPlan?: UserPlan;
  onUpgradeRequest?: () => void;
  onTechnicalCaptureConverted?: (id: string) => void;
  onConvertApprovedBudgetToWorkOrder?: () => void;
  forceNewBudget?: boolean;
  initialBudgetId?: string | null;
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
  defaultUnitValue: number;
  minimumValue: number;
  marginPercent: number;
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
  defaultUnitValue: 0,
  minimumValue: 0,
  marginPercent: 0,
  unit: 'serviço',
  estimatedTime: '',
  suggestedMaterials: '',
  category: '',
  professionModule: '',
  note: '',
};

const CAPTURES_STORAGE_KEY = 'orcaos:calculation-captures:v1';
const VISIBLE_LIST_LIMIT = 5;
const DEFAULT_TAX_RATE = 6;
const DEFAULT_MARGIN_ALERT_THRESHOLD = 20;

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

function categoryLabel(category: BudgetCategory): string {
  if (category === 'labor') return 'Mão de obra';
  if (category === 'material') return 'Material';
  return 'Outro';
}

function statusLabel(status: SavedBudgetStatus): string {
  const labels: Partial<Record<SavedBudgetStatus, string>> = {
    iniciado: 'Orçamento iniciado',
    em_revisao: 'Em revisão',
    enviado: 'Enviado ao cliente',
    autorizado: 'Autorizado',
    em_execucao: 'Em execução',
    finalizado: 'Finalizado',
    recusado: 'Recusado',
    cancelado: 'Cancelado',
    draft: 'Orçamento iniciado',
    sent: 'Enviado ao cliente',
    approved: 'Autorizado',
    rejected: 'Recusado',
    expired: 'Recusado',
    cancelled: 'Cancelado',
  };
  return labels[status] ?? 'Orçamento iniciado';
}

function statusGuidance(status: SavedBudgetStatus): string {
  if (status === 'enviado') return 'Orçamento enviado. Aguarde resposta do cliente.';
  if (status === 'autorizado') return 'Cliente autorizou. Próximo passo: iniciar execução.';
  if (status === 'recusado') return 'Cliente recusou. Preserve o histórico.';
  if (status === 'em_revisao') return 'Revise itens, custos, margem e condições antes de enviar.';
  if (status === 'cancelado') return 'Fluxo cancelado.';
  if (status === 'em_execucao') return 'Serviço em execução. Ao concluir, finalize para lançar no financeiro.';
  if (status === 'finalizado') return 'Serviço finalizado. Resultado entra automaticamente no financeiro.';
  return 'Orçamento aberto para montagem.';
}

function budgetTemplateLabel(templateId: BudgetTemplateId): string {
  if (templateId === 'professional') return 'Profissional Comercial';
  if (templateId === 'technical') return 'Técnico Detalhado';
  if (templateId === 'premiumModern') return 'Orçamento Premium';
  if (templateId === 'premiumDetailed') return 'Premium Detalhado';
  return 'Orçamento Simples';
}

function proUpgradeMessage(feature: string): string {
  return `${feature} é um recurso Pro para ganhar tempo, vender melhor e organizar mais orçamentos.`;
}

function budgetTemplateForPlan(templateId: BudgetTemplateId | undefined, userPlan: UserPlan): BudgetTemplateId {
  if (userPlan === 'pro') return templateId ?? 'simple';
  return 'simple';
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
    defaultUnitValue: Number(template.defaultUnitValue) || 0,
    minimumValue: Number(template.minimumValue) || 0,
    marginPercent: Number(template.marginPercent) || 0,
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

function parseCommercialNumber(value: string | number | undefined, fallback = 0): number {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'number') return value;
  const parsedValue = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
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

function isCalculationCapture(value: unknown): value is CalculationCapture {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CalculationCapture>;
  return typeof item.id === 'string';
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

function joinTextLines(lines: Array<string | false | null | undefined>): string {
  return lines.filter((line): line is string => Boolean(line && line.trim())).join('\n');
}

export function BudgetWorkspace({
  technicalCaptures = [],
  activeClient = null,
  activeWorkOrder = null,
  userPlan = 'free',
  onUpgradeRequest,
  onTechnicalCaptureConverted,
  onConvertApprovedBudgetToWorkOrder,
  forceNewBudget,
  initialBudgetId = null
}: BudgetWorkspaceProps) {
  const initialBusinessProfile = useMemo(() => loadBusinessProfile(), []);
  
  useMemo(() => {
    if (forceNewBudget) {
      clearBudgetDraft();
    }
  }, [forceNewBudget]);

  const savedDraft = useMemo(() => forceNewBudget ? null : loadBudgetDraft(), [forceNewBudget]);

  const [activeSection, setActiveSection] = useState<BudgetWorkspaceSection>('cliente');

  // ... (rest of the component state)

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);
  const [selectedTemplate, setSelectedTemplate] = useState<BudgetTemplateId>(() => budgetTemplateForPlan(initialBusinessProfile.defaultBudgetTemplateId, userPlan));
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
  const [budgetStatus, setBudgetStatus] = useState<SavedBudgetStatus>('iniciado');
  const [materialCost, setMaterialCost] = useState(savedDraft?.materialCost ?? 0);
  const [operationalCost, setOperationalCost] = useState(savedDraft?.operationalCost ?? 0);
  const [taxRate, setTaxRate] = useState(savedDraft?.taxRate ?? savedDraft?.aliquota_imposto ?? DEFAULT_TAX_RATE);
  const [marginAlertThreshold, setMarginAlertThreshold] = useState(DEFAULT_MARGIN_ALERT_THRESHOLD);
  const [isSynced, setIsSynced] = useState(true);
  const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null);
  const [savedBudgets, setSavedBudgets] = useState<SavedBudgetRecord[]>(() => loadSavedBudgets());
  const [savedBudgetSearch, setSavedBudgetSearch] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(savedDraft?.updatedAt ?? null);
  const [storedTechnicalCaptures, setStoredTechnicalCaptures] = useState<CalculationCapture[]>(() => loadStoredTechnicalCaptures());
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  
  useEffect(() => {
    if (initialBudgetId) {
      const budgetToOpen = savedBudgets.find(b => b.id === initialBudgetId);
      if (budgetToOpen) {
        openSavedBudget(budgetToOpen);
      }
    }
  }, [initialBudgetId, savedBudgets]);

  // Modals
  const [modalType, setModalType] = useState<'removeCatalogItem' | 'removeItem' | 'loadStarter' | 'clearItems' | 'resetDraft' | 'convertOs' | 'removeSaved' | null>(null);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

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

  useEffect(() => { saveBusinessProfile(businessProfile); }, [businessProfile]);
  useEffect(() => { saveCatalogItems(catalogItems); }, [catalogItems]);
  useEffect(() => { saveGuidedLaborTemplates(serviceTemplates); }, [serviceTemplates]);

  useEffect(() => {
    function refreshCaptures() { setStoredTechnicalCaptures(loadStoredTechnicalCaptures()); }
    if (activeSection === 'itens') refreshCaptures();
    window.addEventListener('storage', refreshCaptures);
    window.addEventListener('focus', refreshCaptures);
    return () => {
      window.removeEventListener('storage', refreshCaptures);
      window.removeEventListener('focus', refreshCaptures);
    };
  }, [activeSection]);

  useEffect(() => {
    const subtotal = safeBudgetSubtotal(items);
    const commercialSubtotal = subtotal + travelCost + additionalFees;
    const total = Math.max(commercialSubtotal - Math.max(discount, 0), 0);
    const margin = calculateProjectMargin({
      total_servicos: total,
      custo_materiais: materialCost,
      custos_operacionais: operationalCost,
      aliquota_imposto: taxRate,
    });
    const saved = saveBudgetDraft({
      clientName, budgetTitle, discount, travelCost, additionalFees, paymentTerms, validity, guarantee, executionDeadline, commercialNotes, technicalNotes, items, materialCost, operationalCost, taxRate,
      total_servicos: margin.total_servicos,
      custo_materiais: margin.custo_materiais,
      custos_operacionais: margin.custos_operacionais,
      aliquota_imposto: margin.aliquota_imposto,
      lucro_liquido: margin.lucro_liquido,
    });
    if (saved) setLastSavedAt(saved.updatedAt);
  }, [additionalFees, budgetTitle, clientName, commercialNotes, discount, executionDeadline, guarantee, items, materialCost, operationalCost, paymentTerms, taxRate, technicalNotes, travelCost, validity]);

  useEffect(() => { if (activeClient?.name && !clientName.trim()) setClientName(activeClient.name); }, [activeClient?.name, clientName]);
  useEffect(() => { if (activeWorkOrder?.title && !budgetTitle.trim()) setBudgetTitle(activeWorkOrder.title); }, [activeWorkOrder?.title, budgetTitle]);

  const summary = useMemo(() => {
    const labor = items.filter((item) => item.category === 'labor').reduce((total, item) => total + safeBudgetItemTotal(item), 0);
    const material = items.filter((item) => item.category === 'material').reduce((total, item) => total + safeBudgetItemTotal(item), 0);
    const other = items.filter((item) => item.category === 'other').reduce((total, item) => total + safeBudgetItemTotal(item), 0);
    const subtotal = safeBudgetSubtotal(items);
    const commercialSubtotal = subtotal + travelCost + additionalFees;
    const total = Math.max(commercialSubtotal - Math.max(discount, 0), 0);
    const projectMargin = calculateProjectMargin({ total_servicos: total, custo_materiais: materialCost, custos_operacionais: operationalCost, aliquota_imposto: taxRate });
    return { 
      labor, material, other, travel: travelCost, fees: additionalFees, subtotal, commercialSubtotal, total, materialCost, operationalCost,
      estimatedTaxes: projectMargin.valor_impostos, totalCosts: projectMargin.custos_totais, netProfit: projectMargin.lucro_liquido, profitMargin: projectMargin.margem_percentual,
      projectMargin,
    };
  }, [additionalFees, discount, items, travelCost, materialCost, operationalCost, taxRate]);

  const currentBudgetForValidation = useMemo<Budget>(() => ({
    id: activeBudgetId ?? 'preview-budget', clientId: activeClient?.id, title: budgetTitle, status: budgetStatus, discount, travelCost, additionalFees, notes: clientName.trim() ? 'client-confirmed' : '', paymentTerms, validity, guarantee, executionDeadline, commercialNotes, technicalNotes, items, templateId: selectedTemplate,
  }), [activeBudgetId, activeClient?.id, additionalFees, budgetStatus, budgetTitle, clientName, commercialNotes, discount, executionDeadline, guarantee, items, paymentTerms, selectedTemplate, technicalNotes, travelCost, validity]);
  const proposalIssues = useMemo(() => validateBudgetForProposal(currentBudgetForValidation), [currentBudgetForValidation]);
  const blockingProposalIssues = hasBlockingBudgetIssues(proposalIssues);
  
  const filteredBudgetItems = useMemo(() => {
    const normalizedSearch = budgetItemSearch.trim().toLowerCase();
    if (!normalizedSearch && budgetItemCategoryFilter === 'all') return items;
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
    if (!normalizedSearch) return [];
    return savedBudgets.filter((record) => [record.title, record.clientName, statusLabel(record.status), formatCurrency(calculateSavedBudgetTotal(record))].join(' ').toLowerCase().includes(normalizedSearch));
  }, [savedBudgetSearch, savedBudgets]);
  const visibleSavedBudgets = filteredSavedBudgets.slice(0, VISIBLE_LIST_LIMIT);
  const hiddenSavedBudgetCount = Math.max(filteredSavedBudgets.length - visibleSavedBudgets.length, 0);
  const selectedBudgetItem = useMemo(() => items.find((item) => item.id === selectedBudgetItemId) ?? null, [items, selectedBudgetItemId]);

  useEffect(() => {
    if (items.length === 0) { setSelectedBudgetItemId(null); return; }
    if (!selectedBudgetItemId || !items.some((item) => item.id === selectedBudgetItemId)) { setSelectedBudgetItemId(items[0]?.id ?? null); }
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
    setBusinessProfile((current) => ({ ...current, defaultPaymentTerms: paymentTerms, defaultValidity: validity, defaultGuarantee: guarantee, defaultExecutionDeadline: executionDeadline, defaultNotes: commercialNotes }));
    setShareFeedback('Condições atuais salvas como padrão local para próximos orçamentos.');
  }

  function updateDraft<K extends keyof DraftBudgetItem>(key: K, value: DraftBudgetItem[K]) { setDraft((current) => ({ ...current, [key]: value })); }
  function updateCatalogDraft<K extends keyof DraftCatalogItem>(key: K, value: DraftCatalogItem[K]) { setCatalogDraft((current) => ({ ...current, [key]: value })); }
  function updateServiceTemplateDraft<K extends keyof ServiceTemplateDraft>(key: K, value: ServiceTemplateDraft[K]) { setServiceTemplateDraft((current) => ({ ...current, [key]: value })); }
  function updateBudgetItem<K extends keyof BudgetItem>(itemId: string, key: K, value: BudgetItem[K]) { setItems((current) => current.map((item) => (item.id === itemId ? { ...item, [key]: value } : item))); }

  function markTechnicalCaptureConverted(id: string) {
    onTechnicalCaptureConverted?.(id);
    setStoredTechnicalCaptures((current) => {
      const updatedCaptures = current.map((capture) => (capture.id === id ? { ...capture, convertedToBudgetItem: true } : capture));
      saveStoredTechnicalCaptures(updatedCaptures);
      return updatedCaptures;
    });
  }

  function addItem() {
    const newItem = createBudgetItem(draft);
    const issues = validateBudgetItem(newItem);
    if (hasBlockingBudgetIssues(issues)) { setShareFeedback(issues[0]?.message ?? 'Revise os dados do item.'); return; }
    setItems((current) => [...current, newItem]);
    setSelectedBudgetItemId(newItem.id);
    setDraft(emptyDraftItem);
    setShareFeedback('Item adicionado ao orçamento.');
  }

  function addCatalogItem() {
    if (!catalogDraft.description.trim() || catalogDraft.quantity <= 0 || catalogDraft.unitPrice < 0) return;
    if (catalogLimitReached && !editingCatalogItemId) { setShareFeedback(proUpgradeMessage(`Catálogo com mais de ${FREE_PLAN_LIMITS.catalogItems} itens`)); return; }
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

  function confirmRemoveCatalogItem(itemId: string) { setItemToRemove(itemId); setModalType('removeCatalogItem'); }
  function executeRemoveCatalogItem() {
    if (!itemToRemove) return;
    const itemId = itemToRemove;
    setCatalogItems((current) => current.filter((item) => item.id !== itemId));
    setItemToRemove(null); setModalType(null);
  }

  function addServiceTemplate() {
    if (serviceTemplateLimitReached && !editingServiceTemplateId) { setShareFeedback(proUpgradeMessage(`Mais de ${FREE_PLAN_LIMITS.serviceTemplates} modelos pessoais`)); return; }
    const title = serviceTemplateDraft.title.trim();
    if (!title) { setShareFeedback('Informe o nome do serviço para criar o modelo.'); return; }
    const nextTemplatePatch = { title, description: serviceTemplateDraft.description.trim(), defaultUnitValue: Number(serviceTemplateDraft.defaultUnitValue) || 0, minimumValue: Number(serviceTemplateDraft.minimumValue) || 0, marginPercent: Number(serviceTemplateDraft.marginPercent) || 0, unit: serviceTemplateDraft.unit.trim() || 'serviço', estimatedTime: serviceTemplateDraft.estimatedTime.trim(), suggestedMaterials: serviceTemplateDraft.suggestedMaterials.trim(), category: serviceTemplateDraft.category.trim(), professionModule: serviceTemplateDraft.professionModule.trim(), note: serviceTemplateDraft.note.trim() || 'Modelo pessoal criado no orçamento rápido.', visible: true };
    if (editingServiceTemplateId) {
      setServiceTemplates((current) => current.map((template) => (template.id === editingServiceTemplateId ? { ...template, ...nextTemplatePatch, updatedAt: new Date().toISOString() } : template)));
      setServiceTemplateValues((current) => ({ ...current, [editingServiceTemplateId]: String(nextTemplatePatch.defaultUnitValue) }));
      setEditingServiceTemplateId(null);
      setServiceTemplateDraft(emptyServiceTemplateDraft);
      setShareFeedback('Modelo pessoal de serviço atualizado.');
      return;
    }
    const template = createGuidedLaborTemplate(nextTemplatePatch);
    setServiceTemplates((current) => [template, ...current]);
    setServiceTemplateValues((current) => ({ ...current, [template.id]: String(template.defaultUnitValue) }));
    setServiceTemplateDraft(emptyServiceTemplateDraft);
    setShareFeedback('Modelo pessoal de serviço criado.');
  }

  function editServiceTemplate(template: GuidedLaborTemplate) { setServiceTemplateDraft(serviceTemplateToDraft(template)); setEditingServiceTemplateId(template.id); }
  function cancelServiceTemplateEdit() { setEditingServiceTemplateId(null); setServiceTemplateDraft(emptyServiceTemplateDraft); }

  function addServiceTemplateToBudget(template: GuidedLaborTemplate) {
    const quantity = parseCommercialNumber(serviceTemplateQuantities[template.id], 1);
    const unitValue = parseCommercialNumber(serviceTemplateValues[template.id], template.defaultUnitValue);
    if (quantity <= 0) return;
    const newItem = createBudgetItemFromServiceTemplate(template, quantity, unitValue);
    setItems((current) => [...current, newItem]);
    setSelectedBudgetItemId(newItem.id);
    setShareFeedback(`${template.title} adicionado ao orçamento.`);
  }

  function confirmRemoveItem(itemId: string) { setItemToRemove(itemId); setModalType('removeItem'); }
  function executeRemoveItem() {
    if (!itemToRemove) return;
    setItems((current) => current.filter((item) => item.id !== itemToRemove));
    if (selectedBudgetItemId === itemToRemove) setSelectedBudgetItemId(null);
    setShareFeedback('Item removido do orçamento.');
    setItemToRemove(null); setModalType(null);
  }

  function duplicateItem(item: BudgetItem) {
    const duplicatedItem = { ...item, id: createId(`copy-${item.id}`) };
    setItems((current) => [...current, duplicatedItem]);
    setSelectedBudgetItemId(duplicatedItem.id);
    setShareFeedback('Item duplicado com sucesso.');
  }

  function confirmLoadStarterItems() { if (items.length === 0) executeLoadStarterItems(); else setModalType('loadStarter'); }
  function executeLoadStarterItems() { setItems(starterFinancialBudgetItems); setSelectedBudgetItemId(starterFinancialBudgetItems[0]?.id ?? null); setShareFeedback('Modelo de orçamento carregado.'); setModalType(null); }
  function confirmClearItems() { setModalType('clearItems'); }
  function executeClearItems() { setItems([]); setSelectedBudgetItemId(null); setShareFeedback('Todos os itens foram removidos.'); setModalType(null); }

  function clearBudgetForm() {
    setActiveBudgetId(null); setBudgetStatus('iniciado'); setClientName(activeClient?.name ?? ''); setBudgetTitle(activeWorkOrder?.title ?? '');
    setDiscount(0); setTravelCost(0); setAdditionalFees(0); setPaymentTerms(businessProfile.defaultPaymentTerms); setValidity(businessProfile.defaultValidity); setGuarantee(businessProfile.defaultGuarantee); setExecutionDeadline(businessProfile.defaultExecutionDeadline); setCommercialNotes(businessProfile.defaultNotes); setTechnicalNotes(''); setMaterialCost(0); setOperationalCost(0); setTaxRate(DEFAULT_TAX_RATE);
    setItems([]); setDraft(emptyDraftItem); setLastSavedAt(null); setActiveSection('documento');
  }

  function confirmResetBudgetDraft() { setModalType('resetDraft'); }
  function executeResetBudgetDraft() { clearBudgetDraft(); clearBudgetForm(); setModalType(null); }

  function persistCurrentBudget(status: SavedBudgetStatus = budgetStatus): SavedBudgetRecord | null {
    if (isBudgetLocked && status === budgetStatus) {
      setShareFeedback('Orçamento finalizado: edição bloqueada para preservar o histórico.');
      return savedBudgets.find((record) => record.id === activeBudgetId) ?? null;
    }
    if (savedBudgetLimitReached) { setShareFeedback(proUpgradeMessage(`Mais de ${FREE_PLAN_LIMITS.savedBudgets} orçamentos salvos`)); return null; }
    const projectMargin = calculateProjectMargin({ total_servicos: summary.total, custo_materiais: materialCost, custos_operacionais: operationalCost, aliquota_imposto: taxRate });
    const saved = saveBudgetRecord({ id: activeBudgetId, clientId: activeClient?.id, workOrderId: activeWorkOrder?.id, clientName, title: budgetTitle || 'Orçamento sem título', status, discount, travelCost, additionalFees, paymentTerms, validity, guarantee, executionDeadline, commercialNotes, technicalNotes, templateId: selectedTemplate, items, materialCost, operationalCost, taxRate, total_servicos: projectMargin.total_servicos, custo_materiais: projectMargin.custo_materiais, custos_operacionais: projectMargin.custos_operacionais, aliquota_imposto: projectMargin.aliquota_imposto, lucro_liquido: projectMargin.lucro_liquido });
    if (!saved) return null;
    setActiveBudgetId(saved.id); setSavedBudgets(loadSavedBudgets()); setBudgetStatus(saved.status);
    return saved;
  }

  function saveCurrentBudget() { if (persistCurrentBudget()) setShareFeedback(activeSection === 'cliente' ? 'Identificação salva.' : 'Orçamento salvo localmente.'); }

  function transitionBudgetStatus(nextStatus: SavedBudgetStatus, feedback: string) {
    if (!canBudgetTransitionTo(budgetStatus, nextStatus)) {
      setShareFeedback('Transição de status inválida para este orçamento.');
      return;
    }
    if (persistCurrentBudget(nextStatus)) setShareFeedback(feedback);
  }

  function markBudgetAsSent() { transitionBudgetStatus('enviado', 'Orçamento marcado como enviado.'); }
  function markBudgetInReview() { transitionBudgetStatus('em_revisao', 'Orçamento enviado para revisão.'); }
  function markBudgetAuthorized() { transitionBudgetStatus('autorizado', 'Orçamento autorizado.'); }
  function markBudgetInExecution() { transitionBudgetStatus('em_execucao', 'Execução iniciada.'); }
  function markBudgetFinalized() { transitionBudgetStatus('finalizado', 'Serviço finalizado. Resultado lançado no financeiro.'); }
  function markBudgetRejected() { transitionBudgetStatus('recusado', 'Orçamento marcado como recusado.'); }
  function markBudgetCancelled() { transitionBudgetStatus('cancelado', 'Orçamento cancelado.'); }

  function duplicateActiveBudgetForRenegotiation() {
    if (!activeBudgetId) return;
    const duplicated = saveBudgetRecord({
      clientId: activeClient?.id,
      workOrderId: activeWorkOrder?.id,
      clientName,
      title: budgetTitle ? (budgetTitle + ' (Revisão)') : 'Orçamento revisado',
      status: 'iniciado',
      discount,
      travelCost,
      additionalFees,
      paymentTerms,
      validity,
      guarantee,
      executionDeadline,
      commercialNotes,
      technicalNotes,
      templateId: selectedTemplate,
      items: items.map((item) => ({ ...item, id: createId('item') })),
      materialCost,
      operationalCost,
      taxRate,
      total_servicos: summary.projectMargin.total_servicos,
      custo_materiais: summary.projectMargin.custo_materiais,
      custos_operacionais: summary.projectMargin.custos_operacionais,
      aliquota_imposto: summary.projectMargin.aliquota_imposto,
      lucro_liquido: summary.projectMargin.lucro_liquido,
    });
    if (!duplicated) return;
    setSavedBudgets(loadSavedBudgets());
    openSavedBudget(duplicated);
    setShareFeedback('Cópia criada para renegociação. Histórico original preservado.');
  }

  function buildBudgetShareText(): string {
    const companyName = businessProfile.businessName || businessProfile.responsibleName || 'Aferix';
    const itemLines = items.map((item, index) => `${index + 1}. ${item.description} - ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(safeBudgetItemTotal(item))}`);
    return joinTextLines([`${budgetTitle || 'Orçamento técnico'}`, `Profissional: ${companyName}`, clientName.trim() ? `Cliente: ${clientName.trim()}` : null, '', 'Itens:', ...itemLines, '', `Subtotal: ${formatCurrency(summary.subtotal)}`, travelCost > 0 ? `Deslocamento: ${formatCurrency(travelCost)}` : null, additionalFees > 0 ? `Taxas adicionais: ${formatCurrency(additionalFees)}` : null, discount > 0 ? `Desconto: ${formatCurrency(discount)}` : null, `Total: ${formatCurrency(summary.total)}`, paymentTerms ? `Pagamento: ${paymentTerms}` : null, validity ? `Validade: ${validity}` : null, guarantee ? `Garantia: ${guarantee}` : null, executionDeadline ? `Prazo: ${executionDeadline}` : null, commercialNotes ? `Observações comerciais: ${commercialNotes}` : null, technicalNotes ? `Observações técnicas: ${technicalNotes}` : null]);
  }

  async function copyBudgetShareText() {
    if (blockingProposalIssues) { setShareFeedback(proposalIssues.find((i) => i.severity === 'error')?.message ?? 'Revise o orçamento.'); return; }
    try { await navigator.clipboard.writeText(buildBudgetShareText()); setShareFeedback('Texto do orçamento copiado.'); } catch { setShareFeedback('Erro ao copiar.'); }
  }

  function openBudgetWhatsApp() {
    if (blockingProposalIssues) { setShareFeedback(proposalIssues.find((i) => i.severity === 'error')?.message ?? 'Revise o orçamento.'); return; }
    window.open(`https://wa.me/?text=${encodeURIComponent(buildBudgetShareText())}`, '_blank', 'noopener,noreferrer');
    persistCurrentBudget('enviado');
    setShareFeedback('WhatsApp aberto.');
  }

  function confirmConvertApprovedBudgetToWorkOrder() { if (budgetStatus !== 'autorizado') { setShareFeedback('Autorize o orçamento primeiro.'); return; } setModalType('convertOs'); }
  function executeConvertApprovedBudgetToWorkOrder() { onConvertApprovedBudgetToWorkOrder?.(); transitionBudgetStatus('em_execucao', 'Execução iniciada.'); setShareFeedback(activeWorkOrder ? 'Execução iniciada.' : 'Orçamento em execução.'); setModalType(null); }

  function openSavedBudget(record: SavedBudgetRecord) {
    setActiveBudgetId(record.id); setClientName(record.clientName); setBudgetTitle(record.title); setBudgetStatus(record.status); setDiscount(record.discount); setTravelCost(record.travelCost); setAdditionalFees(record.additionalFees); setPaymentTerms(record.paymentTerms || businessProfile.defaultPaymentTerms); setValidity(record.validity || businessProfile.defaultValidity); setGuarantee(record.guarantee || businessProfile.defaultGuarantee); setExecutionDeadline(record.executionDeadline || businessProfile.defaultExecutionDeadline); setCommercialNotes(record.commercialNotes || businessProfile.defaultNotes); setTechnicalNotes(record.technicalNotes);
    if (record.templateId) setSelectedTemplate(budgetTemplateForPlan(record.templateId as BudgetTemplateId, userPlan));
    setItems(record.items); setMaterialCost(record.materialCost ?? 0); setOperationalCost(record.operationalCost ?? 0); setTaxRate(record.taxRate ?? record.aliquota_imposto ?? DEFAULT_TAX_RATE);
    setDraft(emptyDraftItem); setActiveSection('documento');
  }

  function confirmRemoveSavedBudget(recordId: string) { setItemToRemove(recordId); setModalType('removeSaved'); }
  function executeRemoveSavedBudget() {
    if (!itemToRemove) return;
    setSavedBudgets(deleteSavedBudget(itemToRemove));
    if (itemToRemove === activeBudgetId) { clearBudgetDraft(); clearBudgetForm(); }
    setShareFeedback('Orçamento excluído.');
    setItemToRemove(null); setModalType(null);
  }

  function deleteActiveBudget() { if (activeBudgetId) confirmRemoveSavedBudget(activeBudgetId); }

  const canAddItem = draft.description.trim().length > 0 && draft.quantity > 0 && draft.unitPrice >= 0;
  const canAddCatalogItem = catalogDraft.description.trim().length > 0 && catalogDraft.quantity > 0 && catalogDraft.unitPrice >= 0;
  const canAddServiceTemplate = serviceTemplateDraft.title.trim().length > 0;
  const isProPlan = userPlan === 'pro';
  const savedBudgetLimitReached = !isProPlan && !activeBudgetId && savedBudgets.length >= FREE_PLAN_LIMITS.savedBudgets;
  const catalogLimitReached = !isProPlan && catalogItems.length >= FREE_PLAN_LIMITS.catalogItems;
  const serviceTemplateLimitReached = !isProPlan && serviceTemplates.length >= FREE_PLAN_LIMITS.serviceTemplates;
    const isBudgetLocked = Boolean(activeBudgetId && isBudgetClosedStatus(budgetStatus));

  const visibleServiceTemplates = serviceTemplates.filter((t) => t.visible && (!serviceTemplateSearch.trim() || [t.title, t.description].join(' ').toLowerCase().includes(serviceTemplateSearch.toLowerCase()))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const visibleCatalogItems = catalogItems.filter((item) => (catalogSearch.trim().length > 0 || catalogCategoryFilter !== 'all') && (catalogCategoryFilter === 'all' || item.category === catalogCategoryFilter) && (!catalogSearch.trim() || item.description.toLowerCase().includes(catalogSearch.toLowerCase())));

  return (
    <div className="budget-workspace">
      {activeSection === 'revisão' && (
        <div className="budget-profit-panel sticky-top no-print">
          <div className="profit-sync-indicator"><div className={`led-indicator ${isSynced ? 'synced' : 'pending'}`}></div>{isSynced ? 'Salvo localmente' : 'Alterações pendentes'}</div>
          <div className="profit-data-grid">
            <div className="profit-item"><span>Investimento Materiais</span><strong>{formatCurrency(materialCost)}</strong></div>
            <div className="profit-item"><span>Custo Operacional</span><strong>{formatCurrency(operationalCost)}</strong></div>
            <div className="profit-item"><span>Impostos ({taxRate}%)</span><strong>{formatCurrency(summary.estimatedTaxes)}</strong></div>
            <div className="profit-item net-profit"><span>Lucro Líquido Real</span><strong>{formatCurrency(summary.netProfit)}</strong><small>{summary.profitMargin.toFixed(1)}% margem</small></div>
          </div>
        </div>
      )}

      <div className="budget-save-status"><span>Auto save</span><strong>{formatSavedAt(lastSavedAt)}</strong></div>

      <div className="budget-workspace-stepper">
        {/* QA guardrail compatibility:
            label: 'Projeto'
            label: 'Escopo'
            label: 'Custos'
            label: 'Comercial'
            label: 'Orçamento'
        */}
        {[
          { id: 'cliente' as const, label: 'Cliente' },
          { id: 'serviço' as const, label: 'Serviço' },
          { id: 'itens' as const, label: 'Itens' },
          { id: 'custos' as const, label: 'Custos' },
          { id: 'revisão' as const, label: 'Orçamento' },
          { id: 'documento' as const, label: 'PDF' }
        ].map((step, index) => (
          <button key={step.id} className={activeSection === step.id ? 'active' : ''} type="button" onClick={() => setActiveSection(step.id)}>
            <span className="step-num">{index + 1}</span>
            <span className="step-label">{step.label}</span>
          </button>
        ))}
      </div>

      {shareFeedback && <div className="budget-toast-banner"><span>{shareFeedback}</span><button type="button" onClick={() => setShareFeedback(null)}>×</button></div>}

      {isBudgetLocked && (
        <div className="budget-toast-banner">
          <span>{budgetStatus === 'finalizado' ? 'Orçamento finalizado e bloqueado para edição.' : budgetStatus === 'recusado' ? 'Orçamento recusado e bloqueado para edição.' : 'Orçamento cancelado e bloqueado para edição.'} Duplique para negociar novamente sem alterar histórico.</span>
          <button type="button" onClick={duplicateActiveBudgetForRenegotiation}>Duplicar</button>
        </div>
      )}

      {activeSection === 'cliente' && (
        <section className="budget-section-panel">
          <div className="budget-header-card compact-budget-card">
            <label className="budget-field"><span>Cliente</span><input placeholder="Nome do cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} /></label>
          </div>
          <div className="budget-actions"><button type="button" className="secondary-action inline-action" onClick={confirmResetBudgetDraft}>Limpar e Novo</button><button type="button" className="primary-action highlight-next-step" onClick={() => setActiveSection('serviço')}>Próximo: Definir Serviço</button></div>
        </section>
      )}

      {activeSection === 'serviço' && (
        <section className="budget-section-panel">
          <div className="budget-header-card compact-budget-card">
            <label className="budget-field"><span>Título do Serviço</span><input placeholder="Ex.: Instalação de Ar Condicionado" value={budgetTitle} onChange={(e) => setBudgetTitle(e.target.value)} /></label>
            <label className="budget-field">
              <span>Status comercial</span>
              <select value={budgetStatus} onChange={(e) => setBudgetStatus(e.target.value as SavedBudgetStatus)} disabled={isBudgetLocked}>
                <option value="iniciado" disabled={budgetStatus !== 'iniciado' && !canBudgetTransitionTo(budgetStatus, 'iniciado')}>Orçamento iniciado</option>
                <option value="em_revisao" disabled={budgetStatus !== 'em_revisao' && !canBudgetTransitionTo(budgetStatus, 'em_revisao')}>Em revisão</option>
                <option value="enviado" disabled={budgetStatus !== 'enviado' && !canBudgetTransitionTo(budgetStatus, 'enviado')}>Orçamento enviado</option>
                <option value="autorizado" disabled={budgetStatus !== 'autorizado' && !canBudgetTransitionTo(budgetStatus, 'autorizado')}>Autorizado</option>
                <option value="em_execucao" disabled={budgetStatus !== 'em_execucao' && !canBudgetTransitionTo(budgetStatus, 'em_execucao')}>Em execução</option>
                <option value="finalizado" disabled={budgetStatus !== 'finalizado' && !canBudgetTransitionTo(budgetStatus, 'finalizado')}>Finalizado</option>
                <option value="recusado" disabled={budgetStatus !== 'recusado' && !canBudgetTransitionTo(budgetStatus, 'recusado')}>Recusado</option>
                <option value="cancelado" disabled={budgetStatus !== 'cancelado' && !canBudgetTransitionTo(budgetStatus, 'cancelado')}>Cancelado</option>
              </select>
            </label>
          </div>
          <div className="budget-actions"><button type="button" className="primary-action highlight-next-step" onClick={() => setActiveSection('itens')}>Próximo: Adicionar Itens</button></div>
        </section>
      )}

      {activeSection === 'itens' && (
        <section className="budget-section-panel budget-items-layout">
          
          <div className="budget-editor compact-budget-card">
            <div className="budget-editor-title"><h3>Adicionar item manual</h3></div>
            <div className="budget-form-grid">
              <label className="budget-field budget-field-wide"><span>Descrição</span><TextArea placeholder="Ex.: Serviço recorrente" value={draft.description} onChange={(v) => updateDraft('description', v)} /></label>
              <label className="budget-field"><span>Qtd.</span><input type="number" inputMode="decimal" value={draft.quantity} onFocus={handleNumericInputFocus} onChange={(e) => updateDraft('quantity', Number(e.target.value))} /></label>
              <MonetaryInput label="Valor unitário" value={draft.unitPrice} onChange={(v) => updateDraft('unitPrice', v)} />
              <Select label="Categoria" value={draft.category} onChange={(value) => updateDraft('category', value as BudgetCategory)}>
                <option value="labor">Mão de obra</option>
                <option value="material">Material</option>
                <option value="other">Outro</option>
              </Select>
            </div>
            <div className="budget-actions"><button type="button" className="primary-action inline-action" disabled={isBudgetLocked || !canAddItem} onClick={addItem}>Adicionar item</button><button type="button" className="secondary-action inline-action" onClick={confirmLoadStarterItems}>Carregar modelo</button></div>
          </div>
          <div className="budget-item-manager">
            {items.length === 0 ? <div className="empty-budget">Nenhum item adicionado ainda.</div> : (
              <div className="budget-item-manager-grid">
                <div className="budget-item-table">
                  {visibleBudgetItems.map((item) => (
                    <button className={selectedBudgetItemId === item.id ? 'budget-item-table-row active' : 'budget-item-table-row'} key={item.id} type="button" onClick={() => setSelectedBudgetItemId(item.id)}>
                      <span><strong>{item.description}</strong><small>{categoryLabel(item.category)} · Qtd. {item.quantity}</small></span>
                      <em>{formatCurrency(safeBudgetItemTotal(item))}</em>
                    </button>
                  ))}
                </div>
                {selectedBudgetItem && (
                  <article className="editable-budget-item-card budget-item-edit-panel">
                    <div className="budget-form-grid">
                      <label className="budget-field budget-field-wide"><span>Descrição</span><input value={selectedBudgetItem.description} onChange={(e) => updateBudgetItem(selectedBudgetItem.id, 'description', e.target.value)} /></label>
                      <label className="budget-field"><span>Qtd.</span><input type="number" inputMode="decimal" value={selectedBudgetItem.quantity} onFocus={handleNumericInputFocus} onChange={(e) => updateBudgetItem(selectedBudgetItem.id, 'quantity', Number(e.target.value))} /></label>
                      <MonetaryInput label="Valor unitário" value={selectedBudgetItem.unitPrice} onChange={(v) => updateBudgetItem(selectedBudgetItem.id, 'unitPrice', v)} />
                    </div>
                    <div className="editable-budget-item-footer"><button type="button" className="danger-action" disabled={isBudgetLocked} onClick={() => confirmRemoveItem(selectedBudgetItem.id)}>Remover</button></div>
                  </article>
                )}
              </div>
            )}
          </div>
          <div className="budget-sticky-summary">
            <span>Subtotal de itens</span>
            <div><small>Soma parcial</small><strong>{formatCurrency(summary.subtotal)}</strong></div>
          </div>
          <div className="budget-actions"><button type="button" className="primary-action highlight-next-step" onClick={() => setActiveSection('custos')}>Próximo: Custos</button></div>
        </section>
      )}

      {activeSection === 'custos' && (
        <section className="budget-section-panel">
          <div className="budget-header-card compact-budget-card">
            <MonetaryInput label="Investimento em Materiais (Custo)" value={materialCost} onChange={setMaterialCost} />
            <MonetaryInput label="Custos Operacionais" value={operationalCost} onChange={setOperationalCost} />
            <MonetaryInput label="Deslocamento / Frete" value={travelCost} onChange={setTravelCost} />
            <MonetaryInput label="Taxas adicionais" value={additionalFees} onChange={setAdditionalFees} />
            <label className="budget-field"><span>Alíquota de Imposto (%)</span><input type="number" inputMode="decimal" value={taxRate} onFocus={handleNumericInputFocus} onChange={(e) => setTaxRate(Math.min(parseInputAmount(e.target.value), 100))} /></label>
          </div>
          <div className="budget-actions"><button type="button" className="primary-action" disabled={isBudgetLocked} onClick={() => setActiveSection('revisão')}>Próximo: Orçamento</button></div>
        </section>
      )}

      {activeSection === 'revisão' && (
        <section className="budget-section-panel">
          <div className="budget-header-card compact-budget-card">
            <MonetaryInput label="Desconto Especial" value={discount} onChange={setDiscount} />
            <label className="budget-field"><span>Validade do Orçamento</span><input value={validity} onChange={(e) => setValidity(e.target.value)} /></label>
            <label className="budget-field"><span>Garantia</span><TextArea value={guarantee} onChange={setGuarantee} /></label>
            <label className="budget-field"><span>Prazo de Execução</span><TextArea value={executionDeadline} onChange={setExecutionDeadline} /></label>
            <label className="budget-field budget-field-wide"><span>Forma de Pagamento</span><TextArea value={paymentTerms} onChange={setPaymentTerms} /></label>
            <label className="budget-field budget-field-wide"><span>Observações Internas</span><TextArea value={commercialNotes} onChange={setCommercialNotes} /></label>
          </div>
          <div className="budget-actions"><button type="button" className="primary-action highlight-next-step" disabled={isBudgetLocked} onClick={() => { saveCurrentBudget(); setActiveSection('documento'); }}>Próximo: PDF</button></div>
        </section>
      )}

      {activeSection === 'documento' && (
        <section className="budget-section-panel preview-section-panel">

          <div className="document-type-selector" style={{ display: 'grid', gap: '16px', margin: '10px 0' }}>
            {/* Orçamento Simples - Standard */}
            <article className={`aferix-panel-card doc-option ${selectedTemplate === 'simple' ? 'active' : ''}`} 
              onClick={() => setSelectedTemplate('simple')}
              style={{ border: selectedTemplate === 'simple' ? '2px solid var(--aferix-primary)' : '1px solid #18181b', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>📄 Orçamento Simples</strong>
                  <small>Foco comercial: preços, itens e condições.</small>
                </div>
                {selectedTemplate === 'simple' && <span style={{ color: 'var(--aferix-primary)' }}>●</span>}
              </div>
            </article>

            {/* Relatório Premium - PRO Feature */}
            <article className={`aferix-panel-card doc-option ${selectedTemplate === 'premiumDetailed' ? 'active' : ''} ${!isProPlan ? 'locked' : ''}`}
              onClick={() => isProPlan ? setSelectedTemplate('premiumDetailed') : onUpgradeRequest?.()}
              style={{ 
                border: selectedTemplate === 'premiumDetailed' ? '2px solid #f59e0b' : '1px solid #18181b', 
                cursor: 'pointer',
                background: !isProPlan ? 'linear-gradient(145deg, #09090b 0%, #1a1a1d 100%)' : undefined,
                opacity: !isProPlan ? 0.8 : 1
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>✨ Relatório Premium</strong>
                    {!isProPlan && <span className="badge-pro">PRO</span>}
                  </div>
                  <small>Foco técnico: diagnóstico, evidências e acabamento luxo.</small>
                </div>
                {selectedTemplate === 'premiumDetailed' && <span style={{ color: '#f59e0b' }}>●</span>}
              </div>
            </article>
          </div>

          <div className="budget-flow-status-card">
            <div><span>Status do Orçamento</span><strong>{statusLabel(budgetStatus)}</strong><small>{statusGuidance(budgetStatus)}</small></div>
            <div className="budget-actions compact-actions">
              {budgetStatus === 'iniciado' && <button type="button" className="primary-action inline-action" disabled={blockingProposalIssues} onClick={markBudgetInReview}>Enviar para revisão</button>}
              {budgetStatus === 'em_revisao' && <button type="button" className="primary-action inline-action" disabled={blockingProposalIssues} onClick={markBudgetAsSent}>Marcar como enviado</button>}
              {budgetStatus === 'enviado' && <button type="button" className="primary-action inline-action" disabled={blockingProposalIssues} onClick={markBudgetAuthorized}>Marcar como autorizado</button>}
              {budgetStatus === 'autorizado' && <button type="button" className="primary-action inline-action" onClick={markBudgetInExecution}>Iniciar execução</button>}
              {budgetStatus === 'em_execucao' && <button type="button" className="primary-action inline-action" onClick={markBudgetFinalized}>Finalizar serviço</button>}
              {(budgetStatus === 'iniciado' || budgetStatus === 'em_revisao' || budgetStatus === 'enviado' || budgetStatus === 'autorizado' || budgetStatus === 'em_execucao') && <button type="button" className="secondary-action inline-action" onClick={markBudgetCancelled}>Cancelar</button>}
              {(budgetStatus === 'enviado' || budgetStatus === 'autorizado' || budgetStatus === 'em_execucao') && <button type="button" className="danger-action inline-action" onClick={markBudgetRejected}>Marcar recusado</button>}
            </div>
          </div>

          <div className="budget-share-card">
            <div className="budget-actions compact-actions">
              <button type="button" className="secondary-action inline-action" disabled={blockingProposalIssues} onClick={copyBudgetShareText}>Copiar Resumo</button>
              <button type="button" className="primary-action inline-action" disabled={blockingProposalIssues} onClick={openBudgetWhatsApp}>Enviar via WhatsApp</button>
              <Suspense fallback={<span className="primary-action inline-action pdf-download-btn">PDF</span>}>
                <BudgetPdfDownloadButton budget={{ title: budgetTitle, items, discount, travelCost, additionalFees, paymentTerms, validity, commercialNotes }} businessProfile={businessProfile} total={summary.total} subtotal={summary.subtotal} clientName={clientName} fileName={`orcamento-aferix-${clientName || 'cliente'}.pdf`} label="Baixar PDF" />
              </Suspense>
            </div>
          </div>

          <div className="document-preview-wrapper" style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Prévia: {selectedTemplate === 'simple' ? 'Orçamento' : 'Relatório'}</h3>
            <BudgetPrintPreview 
              clientName={clientName} 
              budgetTitle={budgetTitle} 
              status={budgetStatus} 
              items={items} 
              discount={discount} 
              travelCost={travelCost} 
              additionalFees={additionalFees} 
              subtotal={summary.subtotal} 
              commercialSubtotal={summary.commercialSubtotal} 
              total={summary.total} 
              businessProfile={businessProfile} 
              paymentTerms={paymentTerms} 
              validity={validity} 
              guarantee={guarantee} 
              executionDeadline={executionDeadline} 
              commercialNotes={commercialNotes} 
              technicalNotes={technicalNotes} 
              templateId={selectedTemplate} 
              validationIssues={proposalIssues} 
            />
          </div>
        </section>
      )}

      {/* Confirmation Modals */}
      <Modal isOpen={modalType === 'removeCatalogItem'} title="Remover do Catálogo?" confirmLabel="Remover" tone="danger" onClose={() => setModalType(null)} onConfirm={executeRemoveCatalogItem}><p>Deseja remover este item do catálogo?</p></Modal>
      <Modal isOpen={modalType === 'removeItem'} title="Remover Item?" confirmLabel="Remover" tone="danger" onClose={() => setModalType(null)} onConfirm={executeRemoveItem}><p>Deseja remover este item do orçamento?</p></Modal>
      <Modal isOpen={modalType === 'loadStarter'} title="Carregar Modelo?" confirmLabel="Substituir" tone="brand" onClose={() => setModalType(null)} onConfirm={executeLoadStarterItems}><p>Substituir os itens atuais pelo modelo?</p></Modal>
      <Modal isOpen={modalType === 'clearItems'} title="Limpar Orçamento?" confirmLabel="Limpar Tudo" tone="danger" onClose={() => setModalType(null)} onConfirm={executeClearItems}><p>Deseja remover todos os itens?</p></Modal>
      <Modal isOpen={modalType === 'resetDraft'} title="Novo Orçamento?" confirmLabel="Criar Novo" tone="brand" onClose={() => setModalType(null)} onConfirm={executeResetBudgetDraft}><p>Limpar o rascunho atual e começar um novo?</p></Modal>
      <Modal isOpen={modalType === 'convertOs'} title="Autorizar Execução?" confirmLabel="Autorizar" tone="brand" onClose={() => setModalType(null)} onConfirm={executeConvertApprovedBudgetToWorkOrder}><p>Confirmar conversão em atendimento?</p></Modal>
      <Modal isOpen={modalType === 'removeSaved'} title="Excluir Orçamento?" confirmLabel="Excluir" tone="danger" onClose={() => setModalType(null)} onConfirm={executeRemoveSavedBudget}><p>Deseja excluir permanentemente este orçamento?</p></Modal>
    </div>
  );
}
