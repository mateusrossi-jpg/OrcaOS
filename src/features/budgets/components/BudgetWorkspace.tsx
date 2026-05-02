import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { Budget, BudgetItem, BudgetTemplateId, BusinessProfile, CatalogItem, Client, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import { calculateBudgetItemTotal, calculateBudgetTotal } from '../../../core/pricing/budget';
import { hasBlockingBudgetIssues, validateBudgetForProposal, validateBudgetItem, type BudgetValidationIssue } from '../../../core/pricing/budgetValidation';
import { roundTechnical } from '../../../core/calculations/electrical';
import { clearBudgetDraft, loadBudgetDraft, saveBudgetDraft } from '../storage/budgetDraftStorage';
import { loadBusinessProfile, saveBusinessProfile } from '../storage/businessProfileStorage';
import { loadCatalogItems, saveCatalogItems } from '../storage/catalogStorage';
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
type BudgetWorkspaceSection = 'proposal' | 'items' | 'catalog' | 'company' | 'models' | 'review' | 'preview';

interface BudgetWorkspaceProps {
  technicalCaptures?: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
  onTechnicalCaptureConverted?: (id: string) => void;
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

const CAPTURES_STORAGE_KEY = 'orcaos:calculation-captures:v1';
const savedDraft = loadBudgetDraft();
const savedBusinessProfile = loadBusinessProfile();

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

export function BudgetWorkspace({ technicalCaptures = [], activeClient = null, activeWorkOrder = null, onTechnicalCaptureConverted }: BudgetWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<BudgetWorkspaceSection>('proposal');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(savedBusinessProfile);
  const [selectedTemplate, setSelectedTemplate] = useState<BudgetTemplateId>('professional');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => loadCatalogItems());
  const [catalogDraft, setCatalogDraft] = useState<DraftCatalogItem>(emptyCatalogDraft);
  const [items, setItems] = useState<BudgetItem[]>(savedDraft?.items ?? []);
  const [draft, setDraft] = useState<DraftBudgetItem>(emptyDraftItem);
  const [discount, setDiscount] = useState(savedDraft?.discount ?? 0);
  const [travelCost, setTravelCost] = useState(savedDraft?.travelCost ?? 0);
  const [additionalFees, setAdditionalFees] = useState(savedDraft?.additionalFees ?? 0);
  const [paymentTerms, setPaymentTerms] = useState(savedDraft?.paymentTerms || savedBusinessProfile.defaultPaymentTerms);
  const [validity, setValidity] = useState(savedDraft?.validity || savedBusinessProfile.defaultValidity);
  const [guarantee, setGuarantee] = useState(savedDraft?.guarantee || savedBusinessProfile.defaultGuarantee);
  const [executionDeadline, setExecutionDeadline] = useState(savedDraft?.executionDeadline || savedBusinessProfile.defaultExecutionDeadline);
  const [commercialNotes, setCommercialNotes] = useState(savedDraft?.commercialNotes || savedBusinessProfile.defaultNotes);
  const [technicalNotes, setTechnicalNotes] = useState(savedDraft?.technicalNotes ?? '');
  const [clientName, setClientName] = useState(savedDraft?.clientName ?? activeClient?.name ?? '');
  const [budgetTitle, setBudgetTitle] = useState(savedDraft?.budgetTitle ?? activeWorkOrder?.title ?? '');
  const [budgetStatus, setBudgetStatus] = useState<SavedBudgetStatus>('draft');
  const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null);
  const [savedBudgets, setSavedBudgets] = useState<SavedBudgetRecord[]>(() => loadSavedBudgets());
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
    items,
    templateId: selectedTemplate,
  }), [activeBudgetId, activeClient?.id, additionalFees, budgetStatus, budgetTitle, clientName, discount, items, selectedTemplate, travelCost]);
  const proposalIssues = useMemo(() => validateBudgetForProposal(currentBudgetForValidation), [currentBudgetForValidation]);
  const blockingProposalIssues = hasBlockingBudgetIssues(proposalIssues);

  function updateBusinessProfile<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) {
    setBusinessProfile((current) => ({ ...current, [key]: value }));
  }

  function handleLogoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const logoDataUrl = reader.result;
      if (typeof logoDataUrl === 'string') {
        setBusinessProfile((current) => ({ ...current, logoDataUrl, logoUrl: '' }));
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function removeLogo() {
    setBusinessProfile((current) => ({ ...current, logoDataUrl: '', logoUrl: '' }));
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
    const issues = validateBudgetItem(createBudgetItem(draft));
    if (hasBlockingBudgetIssues(issues)) {
      setShareFeedback(issues[0]?.message ?? 'Revise os dados do item.');
      return;
    }
    setItems((current) => [...current, createBudgetItem(draft)]);
    setDraft(emptyDraftItem);
  }

  function addCatalogItem() {
    if (!catalogDraft.description.trim() || catalogDraft.quantity <= 0 || catalogDraft.unitPrice < 0) return;
    setCatalogItems((current) => [...current, createCatalogItem(catalogDraft)]);
    setCatalogDraft(emptyCatalogDraft);
  }

  function removeCatalogItem(itemId: string) {
    setCatalogItems((current) => current.filter((item) => item.id !== itemId));
  }

  function addCatalogItemToBudget(item: CatalogItem) {
    setItems((current) => [...current, createBudgetItemFromCatalog(item)]);
    setActiveSection('items');
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
    setItems((current) => current.filter((item) => item.id !== itemId));
  }

  function duplicateItem(item: BudgetItem) {
    setItems((current) => [...current, { ...item, id: createId(`copy-${item.id}`) }]);
  }

  function loadStarterItems() {
    setItems(starterElectricalBudgetItems);
  }

  function clearItems() {
    setItems([]);
  }

  function resetBudgetDraft() {
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

  function saveCurrentBudget() {
    const saved = saveBudgetRecord({ id: activeBudgetId, clientName, title: budgetTitle || 'Orçamento sem título', status: budgetStatus, discount, travelCost, additionalFees, paymentTerms, validity, guarantee, executionDeadline, commercialNotes, technicalNotes, templateId: selectedTemplate, items });
    if (!saved) return;
    setActiveBudgetId(saved.id);
    setSavedBudgets(loadSavedBudgets());
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
    setBudgetStatus('sent');
    setShareFeedback('WhatsApp aberto com o texto da proposta.');
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
  const logoPreview = businessProfile.logoDataUrl || businessProfile.logoUrl;

  return (
    <div className="budget-workspace">
      <div className="budget-save-status">
        <span>Rascunho salvo automaticamente</span>
        <strong>{formatSavedAt(lastSavedAt)}</strong>
      </div>

      {activeWorkOrder && (
        <section className="budget-context-panel">
          <strong>Vinculado à OS ativa</strong>
          <span>{activeWorkOrder.title} · {activeClient?.name ?? 'Cliente não vinculado'}</span>
          <small>{activeWorkOrder.address || activeClient?.address || 'Sem endereço'} · {formatOptionalDateTime(activeWorkOrder.scheduledDate)}</small>
        </section>
      )}

      <div className="budget-workspace-tabs">
        <button className={activeSection === 'proposal' ? 'active' : ''} type="button" onClick={() => setActiveSection('proposal')}>Dados</button>
        <button className={activeSection === 'items' ? 'active' : ''} type="button" onClick={() => setActiveSection('items')}>Itens</button>
        <button className={activeSection === 'catalog' ? 'active' : ''} type="button" onClick={() => setActiveSection('catalog')}>Catálogo</button>
        <button className={activeSection === 'company' ? 'active' : ''} type="button" onClick={() => setActiveSection('company')}>Empresa</button>
        <button className={activeSection === 'models' ? 'active' : ''} type="button" onClick={() => setActiveSection('models')}>Modelos</button>
        <button className={activeSection === 'review' ? 'active' : ''} type="button" onClick={() => setActiveSection('review')}>Revisão</button>
        <button className={activeSection === 'preview' ? 'active' : ''} type="button" onClick={() => setActiveSection('preview')}>Envio</button>
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

          {!activeClient && !activeWorkOrder && <div className="budget-guidance-card">Selecione um cliente/OS para preencher automaticamente.</div>}
          {!activeBudgetId && <div className="budget-guidance-card">Este orçamento ainda não foi salvo.</div>}
          {items.length === 0 && <div className="budget-guidance-card">Adicione itens para gerar uma proposta apresentável.</div>}
          {!businessProfile.businessName.trim() && !businessProfile.responsibleName.trim() && <div className="budget-guidance-card">Configure sua identidade profissional para deixar a proposta completa.</div>}

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
            <label className="budget-field"><span>Deslocamento</span><input type="number" inputMode="decimal" min="0" step="0.01" value={travelCost} onChange={(event) => setTravelCost(Number(event.target.value))} /></label>
            <label className="budget-field"><span>Taxas adicionais</span><input type="number" inputMode="decimal" min="0" step="0.01" value={additionalFees} onChange={(event) => setAdditionalFees(Number(event.target.value))} /></label>
            <label className="budget-field"><span>Desconto</span><input type="number" inputMode="decimal" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} /></label>
            <label className="budget-field"><span>Validade</span><input value={validity} placeholder="Ex.: 7 dias" onChange={(event) => setValidity(event.target.value)} /></label>
            <label className="budget-field"><span>Garantia</span><input value={guarantee} placeholder="Ex.: 90 dias sobre mão de obra" onChange={(event) => setGuarantee(event.target.value)} /></label>
            <label className="budget-field"><span>Prazo de execução</span><input value={executionDeadline} placeholder="Ex.: 2 dias úteis" onChange={(event) => setExecutionDeadline(event.target.value)} /></label>
            <label className="budget-field budget-field-wide"><span>Condições de pagamento</span><textarea value={paymentTerms} placeholder="Ex.: 50% na aprovação e 50% na entrega" onChange={(event) => setPaymentTerms(event.target.value)} /></label>
            <label className="budget-field budget-field-wide"><span>Observações comerciais</span><textarea value={commercialNotes} placeholder="Ex.: valores sujeitos a disponibilidade de materiais" onChange={(event) => setCommercialNotes(event.target.value)} /></label>
            <label className="budget-field budget-field-wide"><span>Observações técnicas</span><textarea value={technicalNotes} placeholder="Ex.: validar infraestrutura existente antes da execução" onChange={(event) => setTechnicalNotes(event.target.value)} /></label>
          </div>

          <div className="saved-budget-panel inline-saved-panel">
            <div className="saved-budget-panel-header"><div><h3>Orçamentos salvos</h3><p>Abra, atualize ou remova rascunhos deste navegador.</p></div></div>
            <div className="saved-budget-list">
              {savedBudgets.length === 0 ? <div className="empty-budget">Nenhum orçamento salvo ainda.</div> : savedBudgets.map((record) => <article className={record.id === activeBudgetId ? 'saved-budget-card active' : 'saved-budget-card'} key={record.id}><button type="button" className="saved-budget-open" onClick={() => openSavedBudget(record)}><strong>{record.title || 'Orçamento sem título'}</strong><small>{record.clientName || 'Cliente não informado'}</small><span>{statusLabel(record.status)} · {formatCurrency(calculateSavedBudgetTotal(record))} · {formatDateTime(record.updatedAt)}</span></button><button type="button" className="saved-budget-delete" onClick={() => removeSavedBudget(record.id)}>Excluir</button></article>)}
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

          <div className="budget-editor compact-budget-card" aria-label="Editor de orçamento">
            <div className="budget-editor-title"><h3>Adicionar item manual</h3><p>Use para serviços ou materiais fora do catálogo.</p></div>
            <div className="budget-form-grid"><label className="budget-field budget-field-wide"><span>Descrição</span><input placeholder="Ex.: Instalação de tomada dupla" value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} /></label><label className="budget-field"><span>Qtd.</span><input type="number" inputMode="decimal" min="0" step="0.01" value={draft.quantity} onChange={(event) => updateDraft('quantity', Number(event.target.value))} /></label><label className="budget-field"><span>Valor unitário</span><input type="number" inputMode="decimal" min="0" step="0.01" value={draft.unitPrice} onChange={(event) => updateDraft('unitPrice', Number(event.target.value))} /></label><label className="budget-field"><span>Categoria</span><select value={draft.category} onChange={(event) => updateDraft('category', event.target.value as BudgetCategory)}><option value="labor">Mão de obra</option><option value="material">Material</option><option value="other">Outro</option></select></label></div>
            <div className="budget-actions"><button type="button" className="primary-action inline-action" disabled={!canAddItem} onClick={addItem}>Adicionar item</button><button type="button" className="secondary-action inline-action" onClick={loadStarterItems}>Carregar modelo</button><button type="button" className="ghost-action" onClick={clearItems}>Limpar itens</button></div>
          </div>

          <div className="editable-budget-item-list">
            {items.length === 0 ? <div className="empty-budget">Nenhum item adicionado ainda.</div> : items.map((item) => (
              <article className="editable-budget-item-card" key={item.id}>
                <div className="budget-form-grid">
                  <label className="budget-field budget-field-wide"><span>Descrição</span><input value={item.description} onChange={(event) => updateBudgetItem(item.id, 'description', event.target.value)} /></label>
                  <label className="budget-field"><span>Qtd.</span><input type="number" inputMode="decimal" min="0" step="0.01" value={item.quantity} onChange={(event) => updateBudgetItem(item.id, 'quantity', Number(event.target.value))} /></label>
                  <label className="budget-field"><span>Valor unitário</span><input type="number" inputMode="decimal" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateBudgetItem(item.id, 'unitPrice', Number(event.target.value))} /></label>
                  <label className="budget-field"><span>Categoria</span><select value={item.category} onChange={(event) => updateBudgetItem(item.id, 'category', event.target.value as BudgetCategory)}><option value="labor">Mão de obra</option><option value="material">Material</option><option value="other">Outro</option></select></label>
                </div>
                <div className="editable-budget-item-footer"><strong>{formatCurrency(safeBudgetItemTotal(item))}</strong><span>{categoryLabel(item.category)}</span><button type="button" className="secondary-action inline-action" onClick={() => duplicateItem(item)}>Duplicar</button><button type="button" className="danger-action" onClick={() => removeItem(item.id)}>Remover</button></div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeSection === 'catalog' && (
        <section className="budget-section-panel">
          <div className="budget-section-header"><div><h3>Catálogo de produtos e serviços</h3><p>Cadastre itens recorrentes e adicione ao orçamento com um toque.</p></div></div>
          <div className="budget-form-grid catalog-form-grid">
            <label className="budget-field budget-field-wide"><span>Descrição</span><input placeholder="Ex.: Instalação de tomada dupla" value={catalogDraft.description} onChange={(event) => updateCatalogDraft('description', event.target.value)} /></label>
            <label className="budget-field"><span>Qtd. padrão</span><input type="number" inputMode="decimal" min="0" step="0.01" value={catalogDraft.quantity} onChange={(event) => updateCatalogDraft('quantity', Number(event.target.value))} /></label>
            <label className="budget-field"><span>Valor unitário</span><input type="number" inputMode="decimal" min="0" step="0.01" value={catalogDraft.unitPrice} onChange={(event) => updateCatalogDraft('unitPrice', Number(event.target.value))} /></label>
            <label className="budget-field"><span>Categoria</span><select value={catalogDraft.category} onChange={(event) => updateCatalogDraft('category', event.target.value as BudgetCategory)}><option value="labor">Mão de obra</option><option value="material">Material</option><option value="other">Outro</option></select></label>
            <label className="budget-field budget-field-wide"><span>Notas internas</span><input value={catalogDraft.notes} onChange={(event) => updateCatalogDraft('notes', event.target.value)} /></label>
          </div>
          <div className="budget-actions"><button type="button" className="primary-action inline-action" disabled={!canAddCatalogItem} onClick={addCatalogItem}>Adicionar ao catálogo</button></div>
          <div className="catalog-list">
            {catalogItems.map((item) => <article className="catalog-card" key={item.id}><span><strong>{item.description}</strong><small>{categoryLabel(item.category)} · {item.defaultQuantity} × {formatCurrency(item.unitPrice)}</small>{item.notes && <small>{item.notes}</small>}</span><div><button type="button" className="secondary-action inline-action" onClick={() => addCatalogItemToBudget(item)}>Usar</button><button type="button" className="danger-action" onClick={() => removeCatalogItem(item.id)}>Remover</button></div></article>)}
          </div>
        </section>
      )}

      {activeSection === 'company' && (
        <section className="budget-section-panel">
          <div className="budget-section-header"><div><h3>Identidade fixa da empresa</h3><p>Esses dados ficam salvos e aparecem automaticamente no cabeçalho do orçamento/PDF.</p></div></div>
          <div className="logo-editor-card">
            <div className="logo-preview-box">{logoPreview ? <img src={logoPreview} alt="Logo do orçamento" /> : <span>Sem logo</span>}</div>
            <div><strong>Logo do orçamento</strong><small>Escolha uma imagem do aparelho para salvar no perfil. A URL continua como alternativa.</small><div className="budget-actions compact-actions"><label className="secondary-action inline-action file-action">Escolher logo<input accept="image/*" type="file" onChange={handleLogoFileChange} /></label><button className="danger-action" type="button" onClick={removeLogo}>Remover logo</button></div></div>
          </div>
          <div className="budget-config-grid">
            <label className="budget-field"><span>Nome / empresa</span><input value={businessProfile.businessName} onChange={(event) => updateBusinessProfile('businessName', event.target.value)} /></label>
            <label className="budget-field"><span>CNPJ / CPF</span><input value={businessProfile.documentNumber} onChange={(event) => updateBusinessProfile('documentNumber', event.target.value)} /></label>
            <label className="budget-field"><span>Telefone / WhatsApp</span><input value={businessProfile.phone} onChange={(event) => updateBusinessProfile('phone', event.target.value)} /></label>
            <label className="budget-field"><span>E-mail</span><input value={businessProfile.email} onChange={(event) => updateBusinessProfile('email', event.target.value)} /></label>
            <label className="budget-field budget-field-wide"><span>Endereço</span><input value={businessProfile.address} onChange={(event) => updateBusinessProfile('address', event.target.value)} /></label>
            <label className="budget-field budget-field-wide"><span>Logo por URL opcional</span><input placeholder="https://.../logo.png" value={businessProfile.logoUrl} onChange={(event) => updateBusinessProfile('logoUrl', event.target.value)} /></label>
            <label className="budget-field"><span>Responsável</span><input value={businessProfile.responsibleName} onChange={(event) => updateBusinessProfile('responsibleName', event.target.value)} /></label>
            <label className="budget-field"><span>Validade padrão</span><input value={businessProfile.defaultValidity} onChange={(event) => updateBusinessProfile('defaultValidity', event.target.value)} /></label>
            <label className="budget-field"><span>Garantia padrão</span><input value={businessProfile.defaultGuarantee} onChange={(event) => updateBusinessProfile('defaultGuarantee', event.target.value)} /></label>
            <label className="budget-field"><span>Prazo padrão</span><input value={businessProfile.defaultExecutionDeadline} onChange={(event) => updateBusinessProfile('defaultExecutionDeadline', event.target.value)} /></label>
            <label className="budget-field budget-field-wide"><span>Condições de pagamento</span><textarea value={businessProfile.defaultPaymentTerms} onChange={(event) => updateBusinessProfile('defaultPaymentTerms', event.target.value)} /></label>
            <label className="budget-field budget-field-wide"><span>Observações padrão</span><textarea value={businessProfile.defaultNotes} onChange={(event) => updateBusinessProfile('defaultNotes', event.target.value)} /></label>
          </div>
        </section>
      )}

      {activeSection === 'models' && (
        <section className="budget-section-panel">
          <div className="budget-section-header"><div><h3>Modelo do orçamento</h3><p>Escolha o visual da proposta. Alguns modelos podem virar pacotes pagos futuramente.</p></div></div>
          <div className="budget-template-grid">
            {budgetTemplateOptions.map((template) => {
              const isLocked = template.plan === 'pro';
              return <button className={selectedTemplate === template.id ? 'budget-template-card active' : 'budget-template-card'} disabled={isLocked} key={template.id} type="button" onClick={() => setSelectedTemplate(template.id)}><strong>{template.title}</strong><small>{template.description}</small><em>{isLocked ? 'Futuro pacote Pro' : 'Incluso'}</em></button>;
            })}
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
              <strong>Modelo e condições</strong>
              <div className="budget-template-grid compact-template-grid">
                {budgetTemplateOptions.map((template) => {
                  const isLocked = template.plan === 'pro';
                  return <button className={selectedTemplate === template.id ? 'budget-template-card active' : 'budget-template-card'} disabled={isLocked} key={template.id} type="button" onClick={() => setSelectedTemplate(template.id)}><strong>{template.title}</strong><small>{isLocked ? 'Futuro pacote Pro' : 'Incluso no MVP'}</small></button>;
                })}
              </div>
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
          <div className="budget-section-header"><div><h3>Envio da proposta</h3><p>Confira o documento, copie o resumo comercial, envie por WhatsApp ou salve em PDF.</p></div></div>
          <div className="budget-share-card">
            <div>
              <strong>Enviar proposta</strong>
              <small>Copie um resumo comercial ou abra o WhatsApp com valores e itens principais.</small>
            </div>
            <div className="budget-actions compact-actions">
              <button type="button" className="secondary-action inline-action" disabled={blockingProposalIssues} onClick={copyBudgetShareText}>Copiar texto</button>
              <button type="button" className="primary-action inline-action" disabled={blockingProposalIssues} onClick={openBudgetWhatsApp}>Abrir WhatsApp</button>
            </div>
            {shareFeedback && <small className="budget-share-feedback">{shareFeedback}</small>}
          </div>
          <BudgetPrintPreview clientName={clientName} budgetTitle={budgetTitle} status={budgetStatus} items={items} discount={discount} travelCost={travelCost} additionalFees={additionalFees} subtotal={summary.subtotal} commercialSubtotal={summary.commercialSubtotal} total={summary.total} businessProfile={businessProfile} paymentTerms={paymentTerms} validity={validity} guarantee={guarantee} executionDeadline={executionDeadline} commercialNotes={commercialNotes} technicalNotes={technicalNotes} templateId={selectedTemplate} validationIssues={proposalIssues} />
        </section>
      )}
    </div>
  );
}
