import { createId } from '../../../app/utils/idHelpers';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { UserPlan } from '../../../core/access/featureAccess';
import { FREE_PLAN_LIMITS } from '../../../core/access/planStrategy';
import type { Budget, BudgetItem, BudgetTemplateId, BusinessProfile, CatalogItem, Client, Service as WorkOrder } from '../../../core/types/business';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import { calculateBudgetItemTotal, calculateBudgetTotal } from '../../../core/pricing/budget';
import { hasBlockingBudgetIssues, validateBudgetForProposal, validateBudgetItem, type BudgetValidationIssue } from '../../../core/pricing/budgetValidation';
import { calculateProjectMargin } from '../../../core/finance/projectMargin';
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
import { Modal, TextArea, MonetaryInput } from '../../../app/components/ui';
import './BudgetWorkspace.css';

const BudgetPdfDownloadButton = lazy(() => import('./BudgetPdfDownloadButton').then((module) => ({ default: module.BudgetPdfDownloadButton })));

type BudgetCategory = BudgetItem['category'];
type BudgetWorkspaceSection = 'context' | 'items' | 'costs' | 'commercial' | 'preview' | 'catalog' | 'history';

interface BudgetWorkspaceProps {
  technicalCaptures?: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
  userPlan?: UserPlan;
  onUpgradeRequest?: () => void;
  onTechnicalCaptureConverted?: (id: string) => void;
  onConvertApprovedBudgetToWorkOrder?: () => void;
  forceNewBudget?: boolean;
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
  if (status === 'approved') return 'Cliente aprovou o orçamento. O atendimento só nasce quando você tocar em Converter em Atendimento.';
  if (status === 'rejected') return 'Cliente recusou. Preserve o histórico e ajuste apenas se houver nova negociação.';
  if (status === 'expired') return 'Validade vencida. Revise preços, materiais e prazo antes de reenviar.';
  if (status === 'cancelled') return 'Fluxo cancelado. Use apenas como histórico.';
  return 'Rascunho em preparação. Complete dados, itens e condições antes do envio.';
}

function budgetTemplateLabel(templateId: BudgetTemplateId): string {
  if (templateId === 'professional') return 'Profissional Comercial';
  if (templateId === 'technical') return 'Técnico Detalhado';
  if (templateId === 'premiumModern') return 'Proposta Premium';
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
  forceNewBudget
}: BudgetWorkspaceProps) {
  const initialBusinessProfile = useMemo(() => loadBusinessProfile(), []);
  
  useMemo(() => {
    if (forceNewBudget) {
      clearBudgetDraft();
    }
  }, [forceNewBudget]);

  const savedDraft = useMemo(() => forceNewBudget ? null : loadBudgetDraft(), [forceNewBudget]);

  const [activeSection, setActiveSection] = useState<BudgetWorkspaceSection>(forceNewBudget ? 'context' : (savedDraft ? 'items' : 'context'));
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
  const [budgetStatus, setBudgetStatus] = useState<SavedBudgetStatus>('draft');
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
    if (activeSection === 'items') refreshCaptures();
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

  function editCatalogItem(item: CatalogItem) { setCatalogDraft(catalogItemToDraft(item)); setEditingCatalogItemId(item.id); setActiveSection('catalog'); }
  function cancelCatalogItemEdit() { setEditingCatalogItemId(null); setCatalogDraft(emptyCatalogDraft); }
  function confirmRemoveCatalogItem(itemId: string) { setItemToRemove(itemId); setModalType('removeCatalogItem'); }
  function executeRemoveCatalogItem() {
    if (!itemToRemove) return;
    const itemId = itemToRemove;
    if (editingCatalogItemId === itemId) cancelCatalogItemEdit();
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
    setActiveBudgetId(null); setBudgetStatus('draft'); setClientName(activeClient?.name ?? ''); setBudgetTitle(activeWorkOrder?.title ?? '');
    setDiscount(0); setTravelCost(0); setAdditionalFees(0); setPaymentTerms(businessProfile.defaultPaymentTerms); setValidity(businessProfile.defaultValidity); setGuarantee(businessProfile.defaultGuarantee); setExecutionDeadline(businessProfile.defaultExecutionDeadline); setCommercialNotes(businessProfile.defaultNotes); setTechnicalNotes(''); setMaterialCost(0); setOperationalCost(0); setTaxRate(DEFAULT_TAX_RATE);
    setItems([]); setDraft(emptyDraftItem); setLastSavedAt(null); setActiveSection('preview');
  }

  function confirmResetBudgetDraft() { setModalType('resetDraft'); }
  function executeResetBudgetDraft() { clearBudgetDraft(); clearBudgetForm(); setModalType(null); }

  function persistCurrentBudget(status: SavedBudgetStatus = budgetStatus): SavedBudgetRecord | null {
    if (savedBudgetLimitReached) { setShareFeedback(proUpgradeMessage(`Mais de ${FREE_PLAN_LIMITS.savedBudgets} orçamentos salvos`)); return null; }
    const projectMargin = calculateProjectMargin({ total_servicos: summary.total, custo_materiais: materialCost, custos_operacionais: operationalCost, aliquota_imposto: taxRate });
    const saved = saveBudgetRecord({ id: activeBudgetId, clientId: activeClient?.id, workOrderId: activeWorkOrder?.id, clientName, title: budgetTitle || 'Orçamento sem título', status, discount, travelCost, additionalFees, paymentTerms, validity, guarantee, executionDeadline, commercialNotes, technicalNotes, templateId: selectedTemplate, items, materialCost, operationalCost, taxRate, total_servicos: projectMargin.total_servicos, custo_materiais: projectMargin.custo_materiais, custos_operacionais: projectMargin.custos_operacionais, aliquota_imposto: projectMargin.aliquota_imposto, lucro_liquido: projectMargin.lucro_liquido });
    if (!saved) return null;
    setActiveBudgetId(saved.id); setSavedBudgets(loadSavedBudgets()); setBudgetStatus(saved.status);
    return saved;
  }

  function saveCurrentBudget() { if (persistCurrentBudget()) setShareFeedback(activeSection === 'context' ? 'Identificação salva.' : 'Orçamento salvo localmente.'); }
  function markBudgetAsSent() { if (persistCurrentBudget('sent')) setShareFeedback('Orçamento marcado como enviado.'); }
  function markBudgetAsApproved() { if (persistCurrentBudget('approved')) setShareFeedback('Orçamento aprovado. Agora você pode converter em atendimento.'); }

  function buildBudgetShareText(): string {
    const companyName = businessProfile.businessName || businessProfile.responsibleName || 'Aferix';
    const itemLines = items.map((item, index) => `${index + 1}. ${item.description} - ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(safeBudgetItemTotal(item))}`);
    return joinTextLines([`${budgetTitle || 'Orçamento técnico'}`, `Profissional: ${companyName}`, clientName.trim() ? `Cliente: ${clientName.trim()}` : null, '', 'Itens:', ...itemLines, '', `Subtotal: ${formatCurrency(summary.subtotal)}`, travelCost > 0 ? `Deslocamento: ${formatCurrency(travelCost)}` : null, additionalFees > 0 ? `Taxas adicionais: ${formatCurrency(additionalFees)}` : null, discount > 0 ? `Desconto: ${formatCurrency(discount)}` : null, `Total: ${formatCurrency(summary.total)}`, paymentTerms ? `Pagamento: ${paymentTerms}` : null, validity ? `Validade: ${validity}` : null, guarantee ? `Garantia: ${guarantee}` : null, executionDeadline ? `Prazo: ${executionDeadline}` : null, commercialNotes ? `Observações comerciais: ${commercialNotes}` : null, technicalNotes ? `Observações técnicas: ${technicalNotes}` : null]);
  }

  async function copyBudgetShareText() {
    if (blockingProposalIssues) { setShareFeedback(proposalIssues.find((i) => i.severity === 'error')?.message ?? 'Revise a proposta.'); return; }
    try { await navigator.clipboard.writeText(buildBudgetShareText()); setShareFeedback('Texto da proposta copiado.'); } catch { setShareFeedback('Erro ao copiar.'); }
  }

  function openBudgetWhatsApp() {
    if (blockingProposalIssues) { setShareFeedback(proposalIssues.find((i) => i.severity === 'error')?.message ?? 'Revise a proposta.'); return; }
    window.open(`https://wa.me/?text=${encodeURIComponent(buildBudgetShareText())}`, '_blank', 'noopener,noreferrer');
    persistCurrentBudget('sent');
    setShareFeedback('WhatsApp aberto.');
  }

  function confirmConvertApprovedBudgetToWorkOrder() { if (budgetStatus !== 'approved') { setShareFeedback('Aprove o orçamento primeiro.'); return; } setModalType('convertOs'); }
  function executeConvertApprovedBudgetToWorkOrder() { onConvertApprovedBudgetToWorkOrder?.(); setShareFeedback(activeWorkOrder ? 'OS aprovada.' : 'Orçamento aprovado. Vincule um atendimento.'); setModalType(null); }

  function openSavedBudget(record: SavedBudgetRecord) {
    setActiveBudgetId(record.id); setClientName(record.clientName); setBudgetTitle(record.title); setBudgetStatus(record.status); setDiscount(record.discount); setTravelCost(record.travelCost); setAdditionalFees(record.additionalFees); setPaymentTerms(record.paymentTerms || businessProfile.defaultPaymentTerms); setValidity(record.validity || businessProfile.defaultValidity); setGuarantee(record.guarantee || businessProfile.defaultGuarantee); setExecutionDeadline(record.executionDeadline || businessProfile.defaultExecutionDeadline); setCommercialNotes(record.commercialNotes || businessProfile.defaultNotes); setTechnicalNotes(record.technicalNotes);
    if (record.templateId) setSelectedTemplate(budgetTemplateForPlan(record.templateId as BudgetTemplateId, userPlan));
    setItems(record.items); setMaterialCost(record.materialCost ?? 0); setOperationalCost(record.operationalCost ?? 0); setTaxRate(record.taxRate ?? record.aliquota_imposto ?? DEFAULT_TAX_RATE);
    setDraft(emptyDraftItem); setActiveSection('preview');
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
  const budgetApprovalAction = budgetStatus === 'draft' ? { label: 'Marcar como enviado', description: 'Use depois de copiar ou enviar proposta.' } : budgetStatus === 'sent' ? { label: 'Marcar como aprovado', description: 'Use quando o cliente aceitar.' } : null;

  const visibleServiceTemplates = serviceTemplates.filter((t) => t.visible && (!serviceTemplateSearch.trim() || [t.title, t.description].join(' ').toLowerCase().includes(serviceTemplateSearch.toLowerCase()))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const visibleCatalogItems = catalogItems.filter((item) => (catalogSearch.trim().length > 0 || catalogCategoryFilter !== 'all') && (catalogCategoryFilter === 'all' || item.category === catalogCategoryFilter) && (!catalogSearch.trim() || item.description.toLowerCase().includes(catalogSearch.toLowerCase())));

  return (
    <div className="budget-workspace">
      {activeSection !== 'context' && activeSection !== 'items' && (
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
        {[{ id: 'context' as const, label: 'Identificação' }, { id: 'items' as const, label: 'Escopo' }, { id: 'costs' as const, label: 'Lucro' }, { id: 'commercial' as const, label: 'Condições' }, { id: 'preview' as const, label: 'Revisão e PDF' }].map((step) => (
          <button key={step.id} className={activeSection === step.id ? 'active' : ''} type="button" onClick={() => setActiveSection(step.id)}><span>{step.label}</span></button>
        ))}
      </div>

      {shareFeedback && <div className="budget-toast-banner"><span>{shareFeedback}</span><button type="button" onClick={() => setShareFeedback(null)}>×</button></div>}

      <div className="budget-secondary-links">
        <button className={activeSection === 'catalog' ? 'active' : ''} type="button" onClick={() => setActiveSection('catalog')}>Catálogo</button>
        <button className={activeSection === 'history' ? 'active' : ''} type="button" onClick={() => setActiveSection('history')}>Histórico</button>
      </div>

      {activeSection === 'context' && (
        <section className="budget-section-panel">
          <div className="budget-section-header"><div><h3>Identificação do Projeto</h3><p>Cliente e serviço solicitado.</p></div><div className="budget-header-actions"><button type="button" className="primary-action inline-action" onClick={saveCurrentBudget}>Salvar identificação</button>{activeBudgetId && <button type="button" className="danger-action inline-action" onClick={deleteActiveBudget}>Excluir rascunho</button>}</div></div>
          <div className="budget-header-card compact-budget-card">
            <label className="budget-field"><span>Cliente</span><input placeholder="Nome do cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} /></label>
            <label className="budget-field"><span>Serviço solicitado (Título)</span><input placeholder="Ex.: Instalação de tomadas" value={budgetTitle} onChange={(e) => setBudgetTitle(e.target.value)} /></label>
            <label className="budget-field"><span>Status comercial</span><select value={budgetStatus} onChange={(e) => setBudgetStatus(e.target.value as SavedBudgetStatus)}><option value="draft">Rascunho</option><option value="sent">Enviado</option><option value="approved">Aprovado</option><option value="rejected">Recusado</option><option value="expired">Vencido</option><option value="cancelled">Cancelado</option></select></label>
          </div>
          <div className="budget-actions"><button type="button" className="secondary-action inline-action" onClick={confirmResetBudgetDraft}>Limpar e Novo</button><button type="button" className="primary-action highlight-next-step" onClick={() => setActiveSection('items')}>Próximo: Adicionar itens</button></div>
        </section>
      )}

      {activeSection === 'items' && (
        <section className="budget-section-panel budget-items-layout">
          <div className="budget-section-header"><div><h3>Escopo e Itens</h3><p>Adicione os serviços e materiais deste orçamento.</p></div></div>
          <aside className="budget-sticky-summary">
            <span>Resumo comercial</span>
            <div><small>Subtotal</small><strong>{formatCurrency(summary.subtotal)}</strong></div>
            <div className={summary.netProfit >= 0 ? 'highlight-profit positive' : 'highlight-profit negative'}><small>Resultado líquido</small><strong>{formatCurrency(summary.netProfit)}</strong><em>{summary.profitMargin.toFixed(1)}% margem</em></div>
          </aside>
          <div className="budget-editor compact-budget-card">
            <div className="budget-editor-title"><h3>Adicionar item manual</h3></div>
            <div className="budget-form-grid">
              <label className="budget-field budget-field-wide"><span>Descrição</span><TextArea placeholder="Ex.: Serviço recorrente" value={draft.description} onChange={(v) => updateDraft('description', v)} /></label>
              <label className="budget-field"><span>Qtd.</span><input type="number" inputMode="decimal" value={draft.quantity} onFocus={handleNumericInputFocus} onChange={(e) => updateDraft('quantity', Number(e.target.value))} /></label>
              <MonetaryInput label="Valor unitário" value={draft.unitPrice} onChange={(v) => updateDraft('unitPrice', v)} />
              <label className="budget-field"><span>Categoria</span><select value={draft.category} onChange={(e) => updateDraft('category', e.target.value as BudgetCategory)}><option value="labor">Mão de obra</option><option value="material">Material</option><option value="other">Outro</option></select></label>
            </div>
            <div className="budget-actions"><button type="button" className="primary-action inline-action" disabled={!canAddItem} onClick={addItem}>Adicionar item</button><button type="button" className="secondary-action inline-action" onClick={confirmLoadStarterItems}>Carregar modelo</button></div>
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
                    <div className="editable-budget-item-footer"><button type="button" className="danger-action" onClick={() => confirmRemoveItem(selectedBudgetItem.id)}>Remover</button></div>
                  </article>
                )}
              </div>
            )}
          </div>
          <div className="budget-actions"><button type="button" className="primary-action" onClick={() => setActiveSection('costs')}>Próximo: Precificação</button></div>
        </section>
      )}

      {activeSection === 'costs' && (
        <section className="budget-section-panel">
          <div className="budget-section-header"><div><h3>Custos e Lucro</h3><p>Informe custos para calcular lucro real.</p></div></div>
          <div className="budget-header-card compact-budget-card">
            <MonetaryInput label="Investimento em Materiais (Custo)" value={materialCost} onChange={setMaterialCost} />
            <MonetaryInput label="Custos Operacionais" value={operationalCost} onChange={setOperationalCost} />
            <label className="budget-field"><span>Alíquota de Imposto (%)</span><input type="number" inputMode="decimal" value={taxRate} onFocus={handleNumericInputFocus} onChange={(e) => setTaxRate(Math.min(parseInputAmount(e.target.value), 100))} /></label>
            <div className="budget-field-wide budget-costs-summary">
              <div className="costs-summary-grid">
                <div><span>Total cobrado</span><strong>{formatCurrency(summary.total)}</strong></div>
                <div className="highlight"><span>Lucro Líquido Real</span><strong className="premium-accent">{formatCurrency(summary.netProfit)}</strong></div>
              </div>
            </div>
          </div>
          <div className="budget-actions"><button type="button" className="primary-action" onClick={() => setActiveSection('commercial')}>Próximo: Condições</button></div>
        </section>
      )}

      {activeSection === 'commercial' && (
        <section className="budget-section-panel">
          <div className="budget-section-header"><div><h3>Condições Comerciais</h3><p>Pagamento, prazos e observações.</p></div></div>
          <div className="budget-header-card compact-budget-card">
            <MonetaryInput label="Deslocamento (Visível)" value={travelCost} onChange={setTravelCost} />
            <MonetaryInput label="Taxas adicionais" value={additionalFees} onChange={setAdditionalFees} />
            <MonetaryInput label="Desconto" value={discount} onChange={setDiscount} />
            <label className="budget-field"><span>Validade</span><input value={validity} onChange={(e) => setValidity(e.target.value)} /></label>
            <label className="budget-field"><span>Garantia</span><TextArea value={guarantee} onChange={setGuarantee} /></label>
            <label className="budget-field"><span>Prazo</span><TextArea value={executionDeadline} onChange={setExecutionDeadline} /></label>
            <label className="budget-field budget-field-wide"><span>Pagamento</span><TextArea value={paymentTerms} onChange={setPaymentTerms} /></label>
            <label className="budget-field budget-field-wide"><span>Observações</span><TextArea value={commercialNotes} onChange={setCommercialNotes} /></label>
          </div>
          <div className="budget-actions"><button type="button" className="primary-action" onClick={() => setActiveSection('preview')}>Próximo: Revisão Final</button></div>
        </section>
      )}

      {activeSection === 'preview' && (
        <section className="budget-section-panel preview-section-panel">
          <div className="budget-section-header"><div><h3>Revisão e Envio</h3><p>Confira a proposta final e envie.</p></div></div>
          <div className="budget-flow-status-card">
            <div><span>Status da Proposta</span><strong>{statusLabel(budgetStatus)}</strong><small>{statusGuidance(budgetStatus)}</small></div>
            <div className="budget-actions compact-actions">
              {budgetStatus === 'draft' && <button type="button" className="primary-action inline-action" disabled={blockingProposalIssues} onClick={markBudgetAsSent}>Marcar como enviado</button>}
              {budgetStatus === 'sent' && <button type="button" className="primary-action inline-action" disabled={blockingProposalIssues} onClick={markBudgetAsApproved}>Marcar como aprovado</button>}
            </div>
          </div>
          {budgetStatus === 'approved' && (
            <div className="budget-convert-os-card">
              <div><strong>Próximo passo: Autorizar Execução</strong><small>Clique para oficializar o início do atendimento.</small></div>
              <button type="button" className="primary-action inline-action" onClick={confirmConvertApprovedBudgetToWorkOrder}>Converter em Atendimento</button>
            </div>
          )}
          <div className="budget-share-card">
            <div className="budget-actions compact-actions">
              <button type="button" className="secondary-action inline-action" disabled={blockingProposalIssues} onClick={copyBudgetShareText}>Copiar Resumo</button>
              <button type="button" className="primary-action inline-action" disabled={blockingProposalIssues} onClick={openBudgetWhatsApp}>Enviar via WhatsApp</button>
              <Suspense fallback={<span className="primary-action inline-action pdf-download-btn">PDF</span>}>
                <BudgetPdfDownloadButton budget={{ title: budgetTitle, items, discount, travelCost, additionalFees, paymentTerms, validity, commercialNotes }} businessProfile={businessProfile} total={summary.total} subtotal={summary.subtotal} clientName={clientName} fileName={`proposta-aferix-${clientName || 'cliente'}.pdf`} label="Baixar PDF" />
              </Suspense>
            </div>
          </div>
          <BudgetPrintPreview clientName={clientName} budgetTitle={budgetTitle} status={budgetStatus} items={items} discount={discount} travelCost={travelCost} additionalFees={additionalFees} subtotal={summary.subtotal} commercialSubtotal={summary.commercialSubtotal} total={summary.total} businessProfile={businessProfile} paymentTerms={paymentTerms} validity={validity} guarantee={guarantee} executionDeadline={executionDeadline} commercialNotes={commercialNotes} technicalNotes={technicalNotes} templateId={selectedTemplate} validationIssues={proposalIssues} />
        </section>
      )}

      {activeSection === 'catalog' && (
        <div className="inventory-management-group">
          <div className="catalog-panel">
            <div className="budget-section-header"><div><h3>Catálogo de Materiais</h3><p>Itens recorrentes.</p></div></div>
            <div className="catalog-form-grid">
              <label className="budget-field budget-field-wide"><span>Descrição</span><input value={catalogDraft.description} onChange={(e) => updateCatalogDraft('description', e.target.value)} /></label>
              <MonetaryInput label="Valor unitário" value={catalogDraft.unitPrice} onChange={(v) => updateCatalogDraft('unitPrice', v)} />
              <button type="button" className="primary-action inline-action" disabled={!canAddCatalogItem} onClick={addCatalogItem}>{editingCatalogItemId ? 'Salvar' : 'Cadastrar'}</button>
            </div>
            <div className="catalog-list">
              {catalogItems.map((item) => (
                <article className="catalog-card" key={item.id}>
                  <span><strong>{item.description}</strong><small>{formatCurrency(item.unitPrice)}</small></span>
                  <div><button type="button" className="secondary-action inline-action" onClick={() => editCatalogItem(item)}>Editar</button><button type="button" className="danger-action" onClick={() => confirmRemoveCatalogItem(item.id)}>Remover</button></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'history' && (
        <section className="budget-section-panel">
          <div className="saved-budget-panel">
            <div className="saved-budget-panel-header"><div><h3>Histórico</h3></div></div>
            <div className="saved-budget-list">
              {savedBudgets.map((record) => (
                <article className={record.id === activeBudgetId ? 'saved-budget-card active' : 'saved-budget-card'} key={record.id}>
                  <button type="button" className="saved-budget-open" onClick={() => openSavedBudget(record)}>
                    <strong>{record.title || 'Sem título'}</strong>
                    <span>{statusLabel(record.status)} · {formatCurrency(calculateSavedBudgetTotal(record))}</span>
                  </button>
                  <div className="saved-budget-actions">
                    <button type="button" className="saved-budget-delete" onClick={() => confirmRemoveSavedBudget(record.id)}>Excluir</button>
                  </div>
                </article>
              ))}
            </div>
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
