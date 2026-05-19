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
import { PriceInput } from '../../../core/ui/PriceInput';
import { ConfirmModal } from '../../../app/components/ui/ConfirmModal';
import { AutoResizeTextarea } from '../../../app/components/designSystem';
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
import { loadClients, loadWorkOrders, saveActiveWorkOrderId, saveClients } from '../../clients/storage/clientWorkOrderStorage';
import { starterFinancialBudgetItems } from '../budgetTemplates';
import { BudgetPrintPreview } from './BudgetPrintPreview';
import './BudgetWorkspace.css';

const BudgetPdfDownloadButton = lazy(() => import('./BudgetPdfDownloadButton').then((module) => ({ default: module.BudgetPdfDownloadButton })));

type BudgetCategory = BudgetItem['category'];
type BudgetWorkspaceSection = 'client' | 'service' | 'items' | 'costs' | 'review' | 'finish' | 'catalog' | 'history';

interface BudgetWorkspaceProps {
  technicalCaptures?: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
  userPlan?: UserPlan;
  onUpgradeRequest?: () => void;
  onTechnicalCaptureConverted?: (id: string) => void;
  onConvertApprovedBudgetToWorkOrder?: () => void;
  onContextChange?: (context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null }) => void;
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
  if (status === 'approved') return 'Cliente aprovou o orçamento. O serviço agora pode ser autorizado.';
  if (status === 'rejected') return 'Cliente recusou. Preserve o histórico e ajuste apenas se houver nova negociação.';
  if (status === 'expired') return 'Validade vencida. Revise preços, materiais e prazo antes de reenviar.';
  if (status === 'cancelled') return 'Fluxo cancelado. Use apenas como histórico.';
  return 'Rascunho em preparação. Complete dados, itens e condições antes do envio.';
}

function budgetTemplateForPlan(templateId: BudgetTemplateId | undefined, userPlan: UserPlan): BudgetTemplateId {
  if (userPlan === 'pro') return templateId ?? 'simple';
  return 'simple';
}

function joinTextLines(lines: Array<string | false | null | undefined>): string {
  return lines.filter((line): line is string => Boolean(line && line.trim())).join('\n');
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
  return (
    typeof item.id === 'string' &&
    typeof item.createdAt === 'string' &&
    typeof item.summary === 'string'
  );
}

function loadStoredTechnicalCaptures(): CalculationCapture[] {
  if (typeof window === 'undefined') return [];
  try {
    const storedValue = window.localStorage.getItem(CAPTURES_STORAGE_KEY);
    if (!storedValue) return [];
    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? (parsedValue as any[]).filter(isCalculationCapture) : [];
  } catch {
    return [];
  }
}

function saveStoredTechnicalCaptures(captures: CalculationCapture[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CAPTURES_STORAGE_KEY, JSON.stringify(captures));
}

export function BudgetWorkspace({
  technicalCaptures = [],
  activeClient = null,
  activeWorkOrder = null,
  userPlan = 'free',
  onUpgradeRequest,
  onTechnicalCaptureConverted,
  onConvertApprovedBudgetToWorkOrder,
  onContextChange,
  forceNewBudget,
  initialBudgetId
}: BudgetWorkspaceProps) {
  const initialBusinessProfile = useMemo(() => loadBusinessProfile(), []);
  
  useEffect(() => {
    if (forceNewBudget && !initialBudgetId) {
      clearBudgetDraft();
    }
  }, [forceNewBudget, initialBudgetId]);

  const savedDraft = useMemo(() => (forceNewBudget && !initialBudgetId) ? null : loadBudgetDraft(), [forceNewBudget, initialBudgetId]);

  const [activeSection, setActiveSection] = useState<BudgetWorkspaceSection>(forceNewBudget ? 'client' : (savedDraft ? 'items' : 'client'));
  
  useEffect(() => {
    if (initialBudgetId) {
      const budget = loadSavedBudgets().find(b => b.id === initialBudgetId);
      if (budget) {
        openSavedBudget(budget);
      }
    }
  }, [initialBudgetId]);

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);
  const [selectedTemplate, setSelectedTemplate] = useState<BudgetTemplateId>(() => budgetTemplateForPlan(initialBusinessProfile.defaultBudgetTemplateId, userPlan));
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => loadCatalogItems());
  const [serviceTemplates, setServiceTemplates] = useState<GuidedLaborTemplate[]>(() => loadGuidedLaborTemplates());
  const [catalogDraft, setCatalogDraft] = useState<DraftCatalogItem>(emptyCatalogDraft);
  const [editingCatalogItemId, setEditingCatalogItemId] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
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
  const [problemDescription, setProblemDescription] = useState(savedDraft?.problemDescription ?? activeWorkOrder?.description ?? '');
  
  const [budgetStatus, setBudgetStatus] = useState<SavedBudgetStatus>('draft');
  const [materialCost, setMaterialCost] = useState(savedDraft?.materialCost ?? 0);
  const [operationalCost, setOperationalCost] = useState(savedDraft?.operationalCost ?? 0);
  const [taxRate, setTaxRate] = useState(savedDraft?.taxRate ?? DEFAULT_TAX_RATE);
  const [marginAlertThreshold, setMarginAlertThreshold] = useState(DEFAULT_MARGIN_ALERT_THRESHOLD);
  const [isSynced, setIsSynced] = useState(true);
  const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null);
  const [savedBudgets, setSavedBudgets] = useState<SavedBudgetRecord[]>(() => loadSavedBudgets());
  const [savedBudgetSearch, setSavedBudgetSearch] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(savedDraft?.updatedAt ?? null);
  const [storedTechnicalCaptures, setStoredTechnicalCaptures] = useState<CalculationCapture[]>(() => loadStoredTechnicalCaptures());
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const [allClients, setAllClients] = useState<Client[]>(() => loadClients());
  const [clientSearch, setClientSearch] = useState('');

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    tone: 'danger' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    tone: 'primary'
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const confirmAction = (config: Omit<typeof modalConfig, 'isOpen'>) => {
    setModalConfig({ ...config, isOpen: true });
  };

  const filteredClients = useMemo(() => {
    const normalized = clientSearch.toLowerCase().trim();
    if (!normalized) return allClients.slice(0, 5);
    return allClients.filter(c => c.name.toLowerCase().includes(normalized)).slice(0, 5);
  }, [allClients, clientSearch]);

  const availableTechnicalCaptures = technicalCaptures.length > 0 ? technicalCaptures : storedTechnicalCaptures;

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
      clientName,
      budgetTitle,
      problemDescription,
      discount,
      travelCost,
      additionalFees,
      paymentTerms,
      validity,
      guarantee,
      executionDeadline,
      commercialNotes,
      technicalNotes,
      items,
      materialCost,
      operationalCost,
      taxRate,
      total_servicos: margin.total_servicos,
      custo_materiais: margin.custo_materiais,
      custos_operacionais: margin.custos_operacionais,
      aliquota_imposto: margin.aliquota_imposto,
      lucro_liquido: margin.lucro_liquido,
    } as any);
    if (saved) setLastSavedAt(saved.updatedAt);
  }, [additionalFees, budgetTitle, clientName, problemDescription, commercialNotes, discount, executionDeadline, guarantee, items, materialCost, operationalCost, paymentTerms, taxRate, technicalNotes, travelCost, validity]);

  useEffect(() => {
    if (activeClient?.name && !clientName.trim()) {
      setClientName(activeClient.name);
    }
  }, [activeClient?.name, clientName]);

  useEffect(() => {
    if (activeWorkOrder?.title && !budgetTitle.trim()) {
      setBudgetTitle(activeWorkOrder.title);
    }
    if (activeWorkOrder?.description && !problemDescription.trim()) {
      setProblemDescription(activeWorkOrder.description);
    }
  }, [activeWorkOrder?.title, activeWorkOrder?.description, budgetTitle, problemDescription]);

  const summary = useMemo(() => {
    const labor = items.filter((item) => item.category === 'labor').reduce((total, item) => total + safeBudgetItemTotal(item), 0);
    const material = items.filter((item) => item.category === 'material').reduce((total, item) => total + safeBudgetItemTotal(item), 0);
    const other = items.filter((item) => item.category === 'other').reduce((total, item) => total + safeBudgetItemTotal(item), 0);
    const subtotal = safeBudgetSubtotal(items);
    const commercialSubtotal = subtotal + travelCost + additionalFees;
    const total = Math.max(commercialSubtotal - Math.max(discount, 0), 0);
    
    const projectMargin = calculateProjectMargin({
      total_servicos: total,
      custo_materiais: materialCost,
      custos_operacionais: operationalCost,
      aliquota_imposto: taxRate,
    });
    
    return { 
      labor, material, other, travel: travelCost, fees: additionalFees, subtotal, commercialSubtotal, total,
      materialCost,
      operationalCost,
      estimatedTaxes: projectMargin.valor_impostos,
      totalCosts: projectMargin.custos_totais,
      netProfit: projectMargin.lucro_liquido,
      profitMargin: projectMargin.margem_percentual,
      projectMargin,
    };
  }, [additionalFees, discount, items, travelCost, materialCost, operationalCost, taxRate]);

  function selectClient(client: Client) {
    setClientName(client.name);
    if (onContextChange) {
      onContextChange({ activeClient: client, activeWorkOrder: null });
    }
    setActiveSection('service');
  }

  function createNewClient() {
    const name = clientName.trim();
    if (!name) {
      setShareFeedback('Informe o nome do cliente.');
      return;
    }
    const newClient: Client = {
      id: createId('client'),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedClients = [newClient, ...allClients];
    setAllClients(updatedClients);
    saveClients(updatedClients);
    selectClient(newClient);
    setShareFeedback(`Cliente "${name}" criado e vinculado.`);
  }

  function updateDraft<K extends keyof DraftBudgetItem>(key: K, value: DraftBudgetItem[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateCatalogDraft<K extends keyof DraftCatalogItem>(key: K, value: DraftCatalogItem[K]) {
    setCatalogDraft((current) => ({ ...current, [key]: value }));
  }

  function updateBudgetItem<K extends keyof BudgetItem>(itemId: string, key: K, value: BudgetItem[K]) {
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, [key]: value } : item)));
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
    setShareFeedback('Item adicionado.');
  }

  function addCatalogItem() {
    if (!catalogDraft.description.trim() || catalogDraft.quantity <= 0 || catalogDraft.unitPrice < 0) return;
    if (editingCatalogItemId) {
      setCatalogItems((current) => current.map((item) => (item.id === editingCatalogItemId ? { ...createCatalogItem(catalogDraft), id: item.id } : item)));
      setEditingCatalogItemId(null);
      setCatalogDraft(emptyCatalogDraft);
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

  function removeCatalogItem(itemId: string) {
    confirmAction({
      title: 'Remover do catálogo?',
      message: 'Esta ação remove o item do estoque simples deste dispositivo.',
      tone: 'danger',
      onConfirm: () => {
        setCatalogItems((current) => current.filter((item) => item.id !== itemId));
        closeModal();
      }
    });
  }

  function loadStarterItems() {
    const starterItemsWithNewIds = starterFinancialBudgetItems.map(item => ({
      ...item,
      id: createId('item')
    }));
    setItems((current) => [...current, ...starterItemsWithNewIds]);
    setShareFeedback('Modelos básicos adicionados.');
    setActiveSection('items');
  }

  function addServiceTemplateToBudget(template: GuidedLaborTemplate) {
    const newItem: BudgetItem = {
      id: createId(`template-${template.id}`),
      description: template.title,
      quantity: 1,
      unitPrice: template.defaultUnitValue,
      category: (template.category as BudgetCategory) || 'labor',
    };
    setItems((current) => [...current, newItem]);
    setSelectedBudgetItemId(newItem.id);
    setShareFeedback('Serviço do catálogo adicionado.');
    setActiveSection('items');
  }

  function addCatalogItemToBudget(item: CatalogItem) {
    const newItem = createBudgetItemFromCatalog(item);
    setItems((current) => [...current, newItem]);
    setSelectedBudgetItemId(newItem.id);
    setShareFeedback('Material adicionado.');
    setActiveSection('items');
  }

  function removeItem(itemId: string) {
    confirmAction({
      title: 'Remover item?',
      message: 'Esta ação remove o item permanentemente deste orçamento.',
      tone: 'danger',
      onConfirm: () => {
        setItems((current) => current.filter((item) => item.id !== itemId));
        if (selectedBudgetItemId === itemId) setSelectedBudgetItemId(null);
        closeModal();
      }
    });
  }

  function clearItems() {
    confirmAction({
      title: 'Limpar todos os itens?',
      message: 'Deseja remover todos os serviços e materiais deste orçamento?',
      tone: 'danger',
      onConfirm: () => {
        setItems([]);
        setSelectedBudgetItemId(null);
        closeModal();
      }
    });
  }

  function persistCurrentBudget(status: SavedBudgetStatus = budgetStatus): SavedBudgetRecord | null {
    const projectMargin = calculateProjectMargin({
      total_servicos: summary.total,
      custo_materiais: materialCost,
      custos_operacionais: operationalCost,
      aliquota_imposto: taxRate,
    });
    const saved = saveBudgetRecord({
      id: activeBudgetId,
      clientId: activeClient?.id,
      workOrderId: activeWorkOrder?.id,
      clientName,
      title: budgetTitle || 'Orçamento sem título',
      status,
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
      items,
      materialCost,
      operationalCost,
      taxRate,
      total_servicos: projectMargin.total_servicos,
      custo_materiais: projectMargin.custo_materiais,
      custos_operacionais: projectMargin.custos_operacionais,
      aliquota_imposto: projectMargin.aliquota_imposto,
      lucro_liquido: projectMargin.lucro_liquido,
    });
    if (!saved) return null;
    setActiveBudgetId(saved.id);
    setSavedBudgets(loadSavedBudgets());
    setBudgetStatus(saved.status);
    return saved;
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
    if (record.templateId) setSelectedTemplate(budgetTemplateForPlan(record.templateId as BudgetTemplateId, userPlan));
    setItems(record.items);
    setMaterialCost(record.materialCost ?? 0);
    setOperationalCost(record.operationalCost ?? 0);
    setTaxRate(record.taxRate ?? DEFAULT_TAX_RATE);
    setDraft(emptyDraftItem);
    setActiveSection('review');
  }

  function removeSavedBudget(recordId: string) {
    confirmAction({
      title: 'Excluir orçamento?',
      message: 'Esta ação remove o orçamento salvo deste navegador e não pode ser desfeita.',
      tone: 'danger',
      onConfirm: () => {
        setSavedBudgets(deleteSavedBudget(recordId));
        if (recordId === activeBudgetId) {
          clearBudgetDraft();
          setActiveBudgetId(null);
          setItems([]);
        }
        closeModal();
      }
    });
  }

  function buildBudgetShareText(): string {
    const companyName = businessProfile.businessName || businessProfile.responsibleName || 'Aferix';
    const itemLines = items.map((item, index) => `${index + 1}. ${item.description} - ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(safeBudgetItemTotal(item))}`);
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
      additionalFees > 0 ? `Taxas: ${formatCurrency(additionalFees)}` : null,
      discount > 0 ? `Desconto: ${formatCurrency(discount)}` : null,
      `Total: ${formatCurrency(summary.total)}`,
      paymentTerms ? `Pagamento: ${paymentTerms}` : null,
    ]);
  }

  async function copyBudgetShareText() {
    try {
      await navigator.clipboard.writeText(buildBudgetShareText());
      setShareFeedback('Resumo copiado.');
    } catch {
      setShareFeedback('Falha ao copiar.');
    }
  }

  function openBudgetWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(buildBudgetShareText())}`;
    window.open(url, '_blank');
    persistCurrentBudget('sent');
  }

  function convertApprovedBudgetToWorkOrder() {
    if (budgetStatus !== 'approved') return;
    confirmAction({
      title: 'Autorizar Execução?',
      message: 'O serviço passará para status "Em Execução" e você poderá gerenciar a entrega.',
      tone: 'primary',
      onConfirm: () => {
        onConvertApprovedBudgetToWorkOrder?.();
        closeModal();
      }
    });
  }

  const isProPlan = userPlan === 'pro';
  const visibleServiceTemplates = serviceTemplates.filter(t => t.visible && (!serviceTemplateSearch || t.title.toLowerCase().includes(serviceTemplateSearch.toLowerCase()))).slice(0, 5);
  const visibleCatalogItems = catalogItems.filter(t => !catalogSearch || t.description.toLowerCase().includes(catalogSearch.toLowerCase())).slice(0, 5);

  return (
    <div className="budget-workspace">
      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        tone={modalConfig.tone}
        confirmLabel={modalConfig.tone === 'danger' ? 'Remover' : 'Confirmar'}
      />

      {(activeSection === 'costs' || activeSection === 'review' || activeSection === 'finish') && (
        <div className="budget-profit-panel sticky-top no-print">
          <div className="profit-sync-indicator">
            <div className={`led-indicator ${isSynced ? 'synced' : 'pending'}`}></div>
            {isSynced ? 'Backup local ativo' : 'Aguardando sincronia'}
          </div>
          <div className="profit-data-grid">
            <div className="profit-item"><span>Materiais</span><strong>{formatCurrency(materialCost)}</strong></div>
            <div className="profit-item"><span>Operacional</span><strong>{formatCurrency(operationalCost)}</strong></div>
            <div className="profit-item"><span>Impostos</span><strong>{formatCurrency(summary.estimatedTaxes)}</strong></div>
            <div className="profit-item net-profit">
              <span>Lucro Líquido Real</span>
              <strong>{formatCurrency(summary.netProfit)}</strong>
              <small>{summary.profitMargin.toFixed(1)}% margem</small>
            </div>
          </div>
        </div>
      )}

      <div className="budget-save-status">
        <span>Auto save</span>
        <strong>{formatSavedAt(lastSavedAt)}</strong>
      </div>

      <div className="budget-workspace-stepper">
        {[
          { id: 'client' as const, label: '1. Cliente' },
          { id: 'service' as const, label: '2. Serviço' },
          { id: 'items' as const, label: '3. Itens' },
          { id: 'costs' as const, label: '4. Custos' },
          { id: 'review' as const, label: '5. Revisão' },
          { id: 'finish' as const, label: '6. Finalizar' },
        ].map((step) => (
          <button key={step.id} className={activeSection === step.id ? 'active' : ''} type="button" onClick={() => setActiveSection(step.id)}>
            <span>{step.label}</span>
          </button>
        ))}
      </div>

      <div className="budget-secondary-links">
        <button className={activeSection === 'catalog' ? 'active' : ''} type="button" onClick={() => setActiveSection('catalog')}>Estoque/Serviços</button>
        <button className={activeSection === 'history' ? 'active' : ''} type="button" onClick={() => setActiveSection('history')}>Histórico</button>
      </div>

      {shareFeedback && (
        <div className="budget-toast-banner" style={{
          border: '1px solid rgba(245, 164, 0, 0.3)',
          borderRadius: '8px',
          padding: '10px 14px',
          background: 'rgba(245, 164, 0, 0.06)',
          color: 'var(--aferix-primary, #f59e0b)',
          fontSize: '0.86rem',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <span>{shareFeedback}</span>
          <button type="button" onClick={() => setShareFeedback(null)} style={{
            background: 'none', border: 'none', color: 'var(--aferix-primary, #f59e0b)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 6px', lineHeight: 1, fontWeight: 'bold'
          }}>×</button>
        </div>
      )}

      {activeSection === 'client' && (
        <section className="budget-section-panel">
          <div className="budget-section-header">
            <div>
              <h3>Identificação do Cliente</h3>
              <p>Escolha um cliente existente ou informe um novo.</p>
            </div>
          </div>
          
          <div className="budget-header-card compact-budget-card">
            <label className="budget-field budget-field-wide">
              <span>Nome do Cliente</span>
              <input 
                placeholder="Ex.: João Silva" 
                value={clientName} 
                onChange={(e) => {
                  setClientName(e.target.value);
                  setClientSearch(e.target.value);
                }} 
              />
            </label>
          </div>

          <div className="budget-actions">
            <button type="button" className="secondary-action inline-action" onClick={createNewClient}>Criar novo cliente</button>
            <button type="button" className="primary-action highlight-next-step" onClick={() => setActiveSection('service')}>Próximo: Dados do Serviço</button>
          </div>

          {filteredClients.length > 0 && clientSearch && (
            <div className="budget-quick-client-list">
              <strong>Sugestões encontradas:</strong>
              {filteredClients.map(c => (
                <button key={c.id} onClick={() => selectClient(c)} className="quick-client-item">
                  {c.name} {c.email ? `(${c.email})` : ''}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {activeSection === 'service' && (
        <section className="budget-section-panel">
          <div className="budget-section-header">
            <div>
              <h3>Dados do Serviço</h3>
              <p>Defina o problema e o que será feito.</p>
            </div>
          </div>
          
          <div className="budget-header-card compact-budget-card">
            <label className="budget-field budget-field-wide">
              <span>Título da Proposta</span>
              <input placeholder="Ex.: Reforma elétrica do banheiro" value={budgetTitle} onChange={(e) => setBudgetTitle(e.target.value)} />
            </label>
            <label className="budget-field budget-field-wide">
              <span>Problema / Necessidade</span>
              <AutoResizeTextarea placeholder="Descreva o que o cliente solicitou..." value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} rows={3} />
            </label>
          </div>

          <div className="budget-actions">
            <button type="button" className="secondary-action" onClick={() => setActiveSection('client')}>Voltar</button>
            <button type="button" className="primary-action highlight-next-step" onClick={() => setActiveSection('items')}>Próximo: Adicionar Itens</button>
          </div>
        </section>
      )}

      {activeSection === 'items' && (
        <section className="budget-section-panel budget-items-layout">
          <div className="budget-section-header">
            <div>
              <h3>Escopo e Itens</h3>
              <p>Liste os serviços e materiais inclusos.</p>
            </div>
          </div>

          <aside className="budget-sticky-summary">
            <span>Resumo parcial</span>
            <div><small>Venda total</small><strong>{formatCurrency(summary.total)}</strong></div>
            <div className={summary.netProfit >= 0 ? 'highlight-profit positive' : 'highlight-profit negative'}>
              <small>Lucro estimado</small><strong>{formatCurrency(summary.netProfit)}</strong>
            </div>
          </aside>

          <div className="budget-editor compact-budget-card">
            <div className="budget-form-grid">
              <label className="budget-field budget-field-wide"><span>Descrição</span><input placeholder="Item ou serviço" value={draft.description} onChange={(e) => updateDraft('description', e.target.value)} /></label>
              <label className="budget-field"><span>Qtd.</span><input type="number" value={draft.quantity} onChange={(e) => updateDraft('quantity', Number(e.target.value))} /></label>
              <PriceInput label="Valor Unitário" value={draft.unitPrice} onChange={(val) => updateDraft('unitPrice', val)} />
              <label className="budget-field"><span>Tipo</span><select value={draft.category} onChange={(e) => updateDraft('category', e.target.value as any)}><option value="labor">Mão de obra</option><option value="material">Material</option><option value="other">Outro</option></select></label>
            </div>
            <div className="budget-actions">
              <button type="button" className="primary-action inline-action" onClick={addItem}>Adicionar Item</button>
              <button type="button" className="secondary-action inline-action" onClick={loadStarterItems}>Usar Modelo</button>
              <button type="button" className="ghost-action" onClick={clearItems}>Limpar Itens</button>
            </div>
          </div>

          <div className="budget-item-manager">
            {items.length === 0 ? <div className="empty-budget">Nenhum item adicionado.</div> : (
              <div className="budget-item-table">
                {items.map(item => (
                  <div key={item.id} className="budget-item-table-row">
                    <span>
                      <strong>{item.description}</strong>
                      <small>{categoryLabel(item.category)} · Qtd {item.quantity}</small>
                    </span>
                    <em>{formatCurrency(safeBudgetItemTotal(item))}</em>
                    <button onClick={() => removeItem(item.id)} className="danger-action small">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="budget-actions">
            <button type="button" className="secondary-action" onClick={() => setActiveSection('service')}>Voltar</button>
            <button type="button" className="primary-action highlight-next-step" onClick={() => setActiveSection('costs')}>Próximo: Precificação Real</button>
          </div>
        </section>
      )}

      {activeSection === 'costs' && (
        <section className="budget-section-panel">
          <div className="budget-section-header">
            <div>
              <h3>Custos e Lucratividade</h3>
              <p>Informe seus custos reais para garantir sua margem.</p>
            </div>
          </div>

          <div className="budget-header-card compact-budget-card">
            <PriceInput label="Custo de Materiais" value={materialCost} onChange={setMaterialCost} />
            <PriceInput label="Custo Operacional" value={operationalCost} onChange={setOperationalCost} />
            <label className="budget-field"><span>Imposto (%)</span><input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} /></label>
          </div>

          <div className="budget-costs-summary-box">
             <div className="summary-item highlight"><span>Lucro Líquido</span><strong>{formatCurrency(summary.netProfit)}</strong></div>
             <div className="summary-item"><span>Margem</span><strong>{summary.profitMargin.toFixed(1)}%</strong></div>
          </div>

          <div className="budget-actions">
            <button type="button" className="secondary-action" onClick={() => setActiveSection('items')}>Voltar</button>
            <button type="button" className="primary-action highlight-next-step" onClick={() => setActiveSection('review')}>Próximo: Revisão Final</button>
          </div>
        </section>
      )}

      {activeSection === 'review' && (
        <section className="budget-section-panel review-section-panel">
          <div className="budget-section-header">
            <div>
              <h3>Revisão Comercial</h3>
              <p>Confira itens e condições antes de gerar o PDF.</p>
            </div>
          </div>

          <div className="budget-header-card compact-budget-card">
            <PriceInput label="Desconto Total" value={discount} onChange={setDiscount} />
            <label className="budget-field"><span>Validade</span><input value={validity} onChange={(e) => setValidity(e.target.value)} /></label>
            <label className="budget-field budget-field-wide"><span>Pagamento</span><AutoResizeTextarea value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} /></label>
          </div>

          <div className="budget-actions">
             <button type="button" className="secondary-action" onClick={() => setActiveSection('costs')}>Voltar</button>
             <button type="button" className="primary-action highlight-next-step" onClick={() => setActiveSection('finish')}>Próximo: Finalizar e Enviar</button>
          </div>

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
          />
        </section>
      )}

      {activeSection === 'finish' && (
        <section className="budget-section-panel">
          <div className="budget-section-header">
            <div>
              <h3>Finalizar e Enviar</h3>
              <p>Gere o PDF ou envie pelo WhatsApp.</p>
            </div>
          </div>

          <div className="budget-finish-options-stack">
            <div className="action-card primary">
              <strong>Ação Principal</strong>
              <p>Envie a proposta agora mesmo para o cliente.</p>
              <div className="action-buttons">
                <button className="primary-action" onClick={openBudgetWhatsApp}>Enviar pelo WhatsApp</button>
                <Suspense fallback={<button disabled className="secondary-action">Carregando PDF...</button>}>
                  <BudgetPdfDownloadButton 
                    budget={{ title: budgetTitle, items, discount, travelCost, additionalFees, paymentTerms, validity, commercialNotes }} 
                    businessProfile={businessProfile} 
                    total={summary.total} 
                    subtotal={summary.subtotal} 
                    clientName={clientName} 
                    fileName={`proposta-${clientName}.pdf`} 
                    label="Baixar PDF Profissional" 
                  />
                </Suspense>
              </div>
            </div>

            <div className="action-card secondary">
              <strong>Controle Interno</strong>
              <p>Atualize o status conforme a negociação avança.</p>
              <div className="action-buttons">
                <button onClick={() => persistCurrentBudget('sent')} className="secondary-action">Marcar como Enviado</button>
                <button onClick={() => persistCurrentBudget('approved')} className="premium-action">Marcar como Aprovado</button>
              </div>
            </div>

            {budgetStatus === 'approved' && (
              <div className="action-card success">
                <strong>Orçamento Aprovado!</strong>
                <p>O cliente autorizou o serviço. Inicie a execução agora.</p>
                <button onClick={convertApprovedBudgetToWorkOrder} className="primary-action full-width">
                  Autorizar Execução (Serviço Real)
                </button>
              </div>
            )}
          </div>

          <div className="budget-actions">
            <button type="button" className="secondary-action" onClick={() => setActiveSection('review')}>Voltar</button>
          </div>
        </section>
      )}

      {activeSection === 'catalog' && (
        <section className="budget-section-panel">
          <div className="inventory-management-group">
            <div className="service-template-panel">
              <h3>Modelos de Serviço</h3>
              <div className="catalog-form-grid" style={{ marginBottom: '1rem' }}>
                <input placeholder="Buscar modelo..." value={serviceTemplateSearch} onChange={(e) => setServiceTemplateSearch(e.target.value)} />
              </div>
              <div className="service-template-grid compact-grid">
                {visibleServiceTemplates.map(t => (
                  <article key={t.id} className="service-template-card densified">
                    <div className="card-info">
                      <strong>{t.title}</strong>
                      <small>{formatCurrency(t.defaultUnitValue)} / {t.unit}</small>
                    </div>
                    <button className="primary-action small-btn" onClick={() => addServiceTemplateToBudget(t)}>Adicionar</button>
                  </article>
                ))}
              </div>
            </div>
            <div className="catalog-panel">
              <h3>Estoque de Materiais</h3>
              <div className="catalog-form-grid" style={{ marginBottom: '1rem' }}>
                <input placeholder="Buscar material..." value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} />
              </div>
              <div className="catalog-list compact-grid">
                {visibleCatalogItems.map(item => (
                  <article key={item.id} className="catalog-card densified">
                    <div className="card-info">
                      <strong>{item.description}</strong>
                      <small>{formatCurrency(item.unitPrice)}</small>
                    </div>
                    <button className="primary-action small-btn" onClick={() => addCatalogItemToBudget(item)}>Adicionar</button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'history' && (
        <section className="budget-section-panel">
          <h3>Histórico de Orçamentos</h3>
          <div className="saved-budget-list">
            {savedBudgets.map(record => (
              <article key={record.id} className="saved-budget-card">
                <div className="card-main">
                  <strong>{record.title}</strong>
                  <small>{record.clientName} · {formatCurrency(calculateSavedBudgetTotal(record))}</small>
                </div>
                <div className="action-buttons horizontal">
                  <button onClick={() => openSavedBudget(record)} className="secondary-action small">Editar</button>
                  <button onClick={() => removeSavedBudget(record.id)} className="danger-text small">Excluir</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
