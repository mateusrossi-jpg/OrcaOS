import { generateUUID } from '../../../core/utils/idGenerator';
import React, { useState, useMemo, useEffect } from 'react';
import { trustLayer } from '../../../core/trust/TrustLayer';
import { Camera, Wrench, Package, Clock, Truck, FileText, Plus, Trash2, Tag, Send, Save, Copy, CheckCircle2, Mic, Image as ImageIcon, ChevronDown, Star, UserPlus, Zap } from 'lucide-react';
import { db } from '../../../storage/dexieDatabase';
import { cn } from '../../../utils/ui';
import { operationalFacade } from '../../workflow/operationalFacade';
import { clientService } from '../../../services/clientService';
import { siteService } from '../../../services/siteService';
import { BudgetPersistenceService } from '../../../services/BudgetPersistenceService';
import { Client } from '../../../domain/client';
import { BUDGET_STATUS } from '../../../domain/budget';
import { clientProposalService } from "../../../services/clientProposalService";
import { createClientProposalDraft } from "../../clientPortal/storage/clientProposalStorage";
import { catalogService } from '../../../services/catalogService';
import { CatalogHubItem } from '../../../features/catalog/storage/catalogHubStorage';
import { ClientZeroBottomSheet, ClientZeroResult } from '../../clients/components/ClientZeroBottomSheet';

import { 
  ScreenContainer, 
  AppHeader, 
  SurfaceCard, 
  Section, 
  SectionLabel, 
  Stack, 
  Body, 
  Subtitle,
  OpsChip,
  StatusPill,
  InteractiveRow,
  ERPLoader
} from '../../../ui/system';
import { Select, Input, Modal, TextArea, MonetaryInput, PrimaryButton, SecondaryButton, DangerButton } from '../../../app/components/ui';

interface LineItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
}

interface ProposalGeneratorPageProps { id?: string | null; onBack?: () => void; onNavigate?: (tab: string) => void; }

export const ProposalGeneratorPage: React.FC<ProposalGeneratorPageProps> = ({ id, onBack, onNavigate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSites, setClientSites] = useState<any[]>([]);

  // Evidences Mock State
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecords, setAudioRecords] = useState<string[]>([]);

  // Fast Proposal V2 additions
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [inlineSearchSection, setInlineSearchSection] = useState<string | null>(null);
  const [isExpress, setIsExpress] = useState(false);
  const [expressValue, setExpressValue] = useState<number>(0);
  const [favoriteServices, setFavoriteServices] = useState<{ name: string; price: number }[]>([]);
  const [favoriteValues, setFavoriteValues] = useState<number[]>([]);
  const [isClientZeroOpen, setIsClientZeroOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    clientName: '',
    siteId: '',
    description: '',
    status: BUDGET_STATUS.INICIADO as string,
  });

  const [materials, setMaterials] = useState<LineItem[]>([]);
  const [labor, setLabor] = useState<LineItem[]>([]);
  const [extras, setExtras] = useState<LineItem[]>([]);

  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountFixed, setDiscountFixed] = useState<number>(0);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const [catalogItems, setCatalogItems] = useState<CatalogHubItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');

  const toggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(itemId) ? prev.filter(x => x !== itemId) : [...prev, itemId];
      localStorage.setItem('aferix_favorite_catalog_items', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    async function loadCatalog() {
      try {
        const items = await catalogService.getAll();
        setCatalogItems(items);
      } catch (err) {
        console.error("Erro ao carregar catálogo:", err);
      }
    }
    loadCatalog();
  }, []);

  useEffect(() => {
    async function loadData() {
      const allClients = await clientService.getAll();
      setClients(allClients);

      const favs = localStorage.getItem('aferix_favorite_catalog_items');
      if (favs) setFavorites(JSON.parse(favs));

      try {
        const recentBudgets = await db.budgets.orderBy('updatedAt').reverse().toArray();
        const clientCounts: Record<string, number> = {};
        recentBudgets.forEach(b => {
          if (b.clientId) clientCounts[b.clientId] = (clientCounts[b.clientId] || 0) + 1;
        });
        const sortedClientsByFrequency = [...allClients].sort((a, b) => (clientCounts[b.id] || 0) - (clientCounts[a.id] || 0));
        const rClients: Client[] = sortedClientsByFrequency.slice(0, 5);
        if (rClients.length < 5) {
          for (const cl of allClients) {
            if (rClients.length >= 5) break;
            if (!rClients.some(c => c.id === cl.id)) rClients.push(cl);
          }
        }
        setRecentClients(rClients);

        const serviceCounts: Record<string, number> = {};
        const servicePrices: Record<string, number> = {};
        recentBudgets.forEach(b => {
          if (b.title) {
            serviceCounts[b.title] = (serviceCounts[b.title] || 0) + 1;
            if (b.chargedValue) servicePrices[b.title] = b.chargedValue;
          }
        });

        const defaultServices = [
          { name: 'Troca de tomada', price: 80 },
          { name: 'Instalação de chuveiro', price: 150 },
          { name: 'Troca de disjuntor', price: 100 },
          { name: 'Instalação de luminária', price: 120 },
          { name: 'Limpeza de split', price: 200 },
          { name: 'Visita técnica', price: 150 },
        ];

        const dynamicServices = Object.keys(serviceCounts).map(name => ({ name, price: servicePrices[name] || 150, count: serviceCounts[name] }));
        dynamicServices.sort((a, b) => b.count - a.count);
        const mergedServices = [...dynamicServices.map(s => ({ name: s.name, price: s.price }))];
        defaultServices.forEach(def => {
          if (!mergedServices.some(s => s.name.toLowerCase() === def.name.toLowerCase())) mergedServices.push(def);
        });
        setFavoriteServices(mergedServices.slice(0, 6));

        const valueCounts: Record<number, number> = {};
        recentBudgets.forEach(b => {
          if (b.chargedValue) {
            const val = Math.round(b.chargedValue);
            valueCounts[val] = (valueCounts[val] || 0) + 1;
          }
        });
        const defaultValues = [80, 100, 120, 150, 200, 250];
        const dynamicValues = Object.keys(valueCounts).map(Number);
        dynamicValues.sort((a, b) => valueCounts[b] - valueCounts[a]);
        const mergedValues = [...dynamicValues];
        defaultValues.forEach(def => {
          if (!mergedValues.includes(def)) mergedValues.push(def);
        });
        setFavoriteValues(mergedValues.slice(0, 6));
      } catch (err) {
        console.error("Erro ao carregar dinamicamente favoritos:", err);
      }

      if (id) {
        const bp = new BudgetPersistenceService();
        const budget = await bp.getBudget(id) as any;
        if (budget) {
          setFormData({
            title: budget.title || '',
            clientId: budget.clientId || '',
            clientName: budget.clientName || '',
            siteId: budget.siteId || '',
            description: budget.description || '',
            status: budget.status || BUDGET_STATUS.INICIADO,
          });
          if (budget.clientId) {
            const sites = await siteService.getByClientId(budget.clientId);
            setClientSites(sites);
          }
          if (budget.items && budget.items.length > 0) {
            if (budget.items.length === 1 && budget.items[0].description === (budget.title || 'Serviço Expresso')) {
              setIsExpress(true);
              setExpressValue(budget.items[0].unitPrice);
            } else {
              setMaterials(budget.items.filter((i: any) => i.category === 'material').map((i: any) => ({ id: i.id, name: i.description, qty: i.quantity, unitPrice: i.unitPrice })));
              setLabor(budget.items.filter((i: any) => i.category === 'labor').map((i: any) => ({ id: i.id, name: i.description, qty: i.quantity, unitPrice: i.unitPrice })));
              setExtras(budget.items.filter((i: any) => i.category === 'other').map((i: any) => ({ id: i.id, name: i.description, qty: i.quantity, unitPrice: i.unitPrice })));
            }
          }
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [id]);

  const handleClientChange = async (val: string) => {
    const client = clients.find(c => c.id === val);
    setFormData(prev => ({ ...prev, clientId: val, clientName: client?.name || '', siteId: '' }));
    if (val) {
      const sites = await siteService.getByClientId(val);
      setClientSites(sites);
      if (sites.length === 1) setFormData(prev => ({ ...prev, siteId: sites[0].id }));
    } else {
      setClientSites([]);
    }
  };

  const TAX_RATE = 0.15;
  const MARGIN_RATE = 0.30;
  const sumItems = (items: LineItem[]) => items.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);
  const materialsTotal = useMemo(() => sumItems(materials), [materials]);
  const laborTotal = useMemo(() => sumItems(labor), [labor]);
  const extrasTotal = useMemo(() => sumItems(extras), [extras]);
  const rawSubTotal = isExpress ? expressValue : (materialsTotal + laborTotal + extrasTotal);
  const discountValue = (rawSubTotal * (discountPercent / 100)) + discountFixed;
  const subTotalAfterDiscount = rawSubTotal - discountValue;
  const taxesTotal = subTotalAfterDiscount * TAX_RATE;
  const marginTotal = subTotalAfterDiscount * MARGIN_RATE;
  const grandTotal = subTotalAfterDiscount + taxesTotal;

  const isProposalEmpty = isExpress ? (expressValue <= 0) : (materials.length === 0 && labor.length === 0 && extras.length === 0);
  const isInvalid = (!formData.title) || (!formData.clientId && !formData.clientName) || isProposalEmpty;
  const formatBRL = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleUpdateItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, id: string, field: keyof LineItem, val: string | number) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };
  const handleRemoveItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, id: string) => setter(prev => prev.filter(item => item.id !== id));
  const handleAddItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, defaultName: string) => setter(prev => [...prev, { id: generateUUID(), name: defaultName, qty: 1, unitPrice: 0 }]);

  const getCatalogItemsForCategory = (cat: 'material' | 'labor' | 'other') => {
    if (cat === 'material') return catalogItems.filter(i => i.kind === 'material' || i.kind === 'custom');
    if (cat === 'labor') return catalogItems.filter(i => i.kind === 'labor' || i.kind === 'service');
    return catalogItems.filter(i => i.kind === 'travel' || i.kind === 'fee');
  };

  const handleImportEvidences = async () => {
    const activeOsId = localStorage.getItem('aferix_active_attendance_id');
    if (!activeOsId) {
      trustLayer.emit({ type: 'error', title: 'Erro', description: 'Nenhuma OS ativa encontrada no momento.', status: 'local' });
      return;
    }
    try {
      const anoms = await db.anomalies.where('workOrderId').equals(activeOsId).toArray();
      const osPhotos = anoms.flatMap(a => a.photoUuids || []);
      if (osPhotos.length > 0) {
        setPhotos(prev => [...new Set([...prev, ...osPhotos])]);
        trustLayer.emit({ type: 'success', title: 'Sucesso', description: `${osPhotos.length} fotos importadas das anomalias registradas na OS.`, status: 'synced' });
      } else {
        trustLayer.emit({ type: 'info', title: 'Sem fotos', description: 'Nenhuma foto encontrada nas anomalias desta OS.', status: 'local' });
      }
    } catch (e) {
      console.error(e);
      trustLayer.emit({ type: 'error', title: 'Erro', description: 'Não foi possível buscar as evidências.', status: 'local' });
    }
  };

  const createBudgetPayload = (status: string, id: string) => {
    const mappedItems = isExpress
      ? [{ id: generateUUID(), description: formData.title || 'Serviço Expresso', quantity: 1, unitPrice: expressValue, category: 'labor' }]
      : [
          ...materials.map(m => ({ id: m.id, description: m.name, quantity: m.qty, unitPrice: m.unitPrice, category: 'material' })),
          ...labor.map(l => ({ id: l.id, description: l.name, quantity: l.qty, unitPrice: l.unitPrice, category: 'labor' })),
          ...extras.map(e => ({ id: e.id, description: e.name, quantity: e.qty, unitPrice: e.unitPrice, category: 'other' })),
        ];
    return {
      id, title: formData.title, clientId: formData.clientId, clientName: formData.clientName, siteId: formData.siteId, description: formData.description, status,
      chargedValue: grandTotal, materialCost: isExpress ? 0 : materialsTotal, travelCost: 0, helperCost: 0, laborCost: isExpress ? expressValue : laborTotal,
      otherCosts: isExpress ? 0 : extrasTotal, discounts: discountValue, fees: taxesTotal, items: mappedItems, evidences: [...photos, ...audioRecords],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
  };

  const handleSaveDraft = async () => {
    if (isInvalid) {
      trustLayer.emit({ type: 'error', title: 'Validação', description: 'Preencha o Título, o Cliente e adicione pelo menos um item.', status: 'local' });
      return;
    }
    try {
      setIsSaving(true);
      const budgetId = id || generateUUID();
      const budget = createBudgetPayload(BUDGET_STATUS.INICIADO, budgetId);
      await operationalFacade.saveBudget(budget as any);
      trustLayer.emit({ type: 'success', title: 'Rascunho salvo com sucesso!', status: 'synced' });
      if (onBack) onBack();
    } catch (e) {
      trustLayer.emit({ type: 'error', title: 'Erro ao salvar', description: (e as Error).message, status: 'local' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendToClient = async () => {
    if (isInvalid) {
      trustLayer.emit({ type: 'error', title: 'Validação', description: 'Preencha o Título, o Cliente e adicione pelo menos um item.', status: 'local' });
      return;
    }
    try {
      setIsSaving(true);
      const budgetId = id || generateUUID();
      const budget = createBudgetPayload(BUDGET_STATUS.ENVIADO, budgetId);
      await operationalFacade.saveBudget(budget as any);
      await operationalFacade.changeBudgetStatus(budgetId, BUDGET_STATUS.ENVIADO, budget as any);
      const publicProposal = createClientProposalDraft({
         budgetId, companyId: 'default-company', clientId: budget.clientId, clientName: budget.clientName, title: budget.title, summary: budget.description,
         total: budget.chargedValue, subtotal: budget.chargedValue - budget.fees, status: 'sent',
         items: budget.items.map(i => ({ id: i.id, description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.quantity * i.unitPrice, category: i.category as any, visibleToClient: true }))
      } as any);
      await clientProposalService.add(publicProposal);
      const publicLink = `https://aferix.com/portal/p/${publicProposal.publicToken}`;
      if (navigator.clipboard) await navigator.clipboard.writeText(publicLink);
      trustLayer.emit({ type: 'success', title: 'Proposta Enviada!', description: 'Link de aprovação copiado para sua área de transferência.', status: 'synced' });
      if (onBack) onBack();
    } catch (e) {
      trustLayer.emit({ type: 'error', title: 'Erro ao enviar', description: (e as Error).message, status: 'local' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAuthorize = async () => {
    try {
      if (!id) return;
      setIsSaving(true);
      await operationalFacade.authorizeBudget(id);
      trustLayer.emit({ type: 'success', title: 'Projeto aprovado! Ordem de Serviço gerada na fila de operações.', status: 'synced' });
      if (onBack) onBack();
    } catch(e) {
      console.error(e);
      trustLayer.emit({ type: 'error', title: 'Erro ao autorizar', description: (e as Error).message, status: 'local' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]"><ERPLoader message="Carregando gerador..." /></div>;

  return (
    <ScreenContainer className={cn("pb-48 bg-[var(--bg-primary)]", isSaving && "opacity-50 pointer-events-none")}>
      <AppHeader 
        title="Gerador de Proposta." 
        onBack={onBack}
        action={
          <div className="flex gap-2">
            {formData.clientId && <SecondaryButton onClick={() => onNavigate?.('clients')} className="h-9 px-4 !rounded-xl !text-[10px]">Ficha</SecondaryButton>}
            <SecondaryButton onClick={() => onNavigate?.('assets')} className="h-9 px-4 !rounded-xl !text-[10px]">Ativos</SecondaryButton>
          </div>
        }
      />

      <div className="px-6 py-8 flex flex-col gap-6">
        
        {/* IDENTIFICAÇÃO */}
        <Section className="gap-4">
          <SectionLabel>1. Identificação do Projeto</SectionLabel>
          <SurfaceCard padding="lg" className="flex flex-col gap-6">
            {recentClients.length > 0 && (
              <Stack className="gap-2">
                <span className="text-[9px] text-text-tertiary uppercase font-black tracking-widest ml-1 opacity-60">Clientes Recentes:</span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {recentClients.map(c => (
                    <button key={c.id} type="button" onClick={() => handleClientChange(c.id)} className={cn("px-4 py-2 text-[10px] font-black rounded-xl border uppercase tracking-wider whitespace-nowrap active:scale-95 transition-all min-h-[44px] flex items-center justify-center snap-start", formData.clientId === c.id ? "bg-[var(--accent-gold)] text-black border-[var(--accent-gold)]" : "bg-white/[0.03] text-white border-white/[0.08] hover:bg-white/5")}>{c.name}</button>
                  ))}
                </div>
              </Stack>
            )}

            <Stack className="gap-2">
              <span className="text-[9px] text-text-tertiary uppercase font-black tracking-widest ml-1 opacity-60">Templates Rápidos:</span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                {favoriteServices.map(tpl => (
                  <button key={tpl.name} type="button" onClick={() => { setFormData(prev => ({ ...prev, title: tpl.name, description: prev.description || `Serviço padrão: ${tpl.name}` })); setIsExpress(true); setExpressValue(tpl.price); }} className={cn("px-4 py-2 text-[10px] font-black rounded-xl border uppercase tracking-wider whitespace-nowrap active:scale-95 transition-all min-h-[44px] flex items-center justify-center snap-start", formData.title === tpl.name ? "bg-[var(--accent-gold)] text-black border-[var(--accent-gold)]" : "bg-white/[0.03] text-white border-white/[0.08] hover:bg-white/5")}>{tpl.name}</button>
                ))}
              </div>
            </Stack>

            <Input label="Título do Projeto" value={formData.title} onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} placeholder="Ex: Instalação de Ar Condicionado" required />

            <Stack className="gap-3">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Select label="Cliente" value={formData.clientId} onChange={handleClientChange}>
                    <option value="">Selecionar cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </div>
                <button type="button" onClick={() => setIsClientZeroOpen(true)} className="h-[56px] w-[56px] shrink-0 rounded-xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/20 active:scale-95 transition-all flex items-center justify-center mb-0.5"><UserPlus size={20} /></button>
              </div>
              {!formData.clientId && formData.clientName && <div className="px-4 py-3 rounded-xl bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/20 text-[10px] font-black text-[var(--accent-gold)] tracking-[0.2em] uppercase text-center">Novo Cliente: {formData.clientName}</div>}
            </Stack>

            {formData.clientId && clientSites.length > 0 && (
              <Select label="Local (Site)" value={formData.siteId} onChange={(val) => setFormData(prev => ({...prev, siteId: val}))}>
                <option value="">Principal</option>
                {clientSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            )}

            <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-2">
              <span className="text-[10px] text-white uppercase font-black tracking-widest flex items-center gap-2"><Zap size={14} className="text-[var(--accent-gold)]" /> Orçamento Expresso</span>
              <button type="button" onClick={() => setIsExpress(prev => !prev)} className={cn("w-12 h-7 rounded-full transition-all relative border flex items-center", isExpress ? "bg-[var(--accent-gold)] border-[var(--accent-gold)]" : "bg-black/40 border-white/10")}><div className={cn("w-5 h-5 rounded-full bg-white absolute transition-all", isExpress ? "right-1" : "left-1")} /></button>
            </div>

            {isExpress && (
              <Stack className="gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <MonetaryInput label="Valor do Orçamento" value={expressValue} onChange={setExpressValue} />
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {favoriteValues.map(val => (
                    <button key={val} type="button" onClick={() => setExpressValue(val)} className={cn("px-4 py-2 text-[11px] font-mono font-black rounded-xl border uppercase tracking-wider whitespace-nowrap active:scale-95 transition-all min-h-[42px] flex items-center justify-center snap-start", expressValue === val ? "bg-[var(--accent-green)] text-black border-[var(--accent-green)]" : "bg-white/[0.03] text-white border-white/[0.08]")}>{formatBRL(val)}</button>
                  ))}
                </div>
              </Stack>
            )}
          </SurfaceCard>
        </Section>

        {/* DESCRIÇÃO */}
        <Section className="gap-4">
          <SectionLabel>2. Descrição do Problema / Escopo</SectionLabel>
          <SurfaceCard padding="lg">
            <TextArea placeholder="Descreva o serviço..." value={formData.description} onChange={(val) => setFormData(prev => ({...prev, description: val}))} />
          </SurfaceCard>
        </Section>

        {/* EVIDÊNCIAS */}
        <Section className="gap-4">
          <div className="flex justify-between items-center px-1">
            <SectionLabel>3. Evidências Técnicas</SectionLabel>
            <button onClick={handleImportEvidences} className="text-[10px] font-black text-[var(--accent-blue)] uppercase tracking-widest bg-[var(--accent-blue)]/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all">HERDAR DA OS</button>
          </div>
          <SurfaceCard padding="lg">
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { if (isRecording) return; setIsRecording(true); setTimeout(() => { setAudioRecords(prev => [...prev, `Áudio ${prev.length + 1}`]); setIsRecording(false); }, 2000); }} className={cn("py-6 rounded-2xl border transition-all flex flex-col items-center justify-center gap-3", isRecording ? "bg-[var(--accent-red)]/10 border-[var(--accent-red)]/30 animate-pulse" : "bg-white/[0.02] border-white/[0.08]")}>
                <Mic size={24} className={isRecording ? "text-[var(--accent-red)]" : "text-[var(--accent-blue)]"} /><span className="text-[10px] font-black tracking-widest text-white/60">{isRecording ? "Gravando..." : "Gravar Áudio"}</span>
              </button>
              <div className="relative w-full h-full">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  onChange={(e) => { 
                    const files = e.target.files;
                    if (files && files.length > 0) { 
                      const file = files[0];
                      if (file) setPhotos(prev => [...prev, URL.createObjectURL(file)]); 
                    } 
                  }} 
                />
                <div className="py-6 h-full rounded-2xl border bg-white/[0.02] border-white/[0.08] flex flex-col items-center justify-center gap-3"><ImageIcon size={24} className="text-[var(--accent-green)]" /><span className="text-[10px] font-black tracking-widest text-white/60">Capturar Foto</span></div>
              </div>
            </div>
            {(photos.length > 0 || audioRecords.length > 0) && (
              <div className="mt-6 flex flex-col gap-4 border-t border-white/5 pt-6">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                  {photos.map((src, i) => (
                    <div key={i} className="relative min-w-[100px] w-24 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 snap-start shadow-xl">
                      <img src={src} alt="Evidência" className="w-full h-full object-cover" />
                      <button onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-black/60 backdrop-blur-md rounded-bl-xl text-white min-w-[44px] min-h-[44px] flex items-center justify-center"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                {audioRecords.map((label, i) => (
                  <InteractiveRow key={i} leftSlot={<Mic size={16} className="text-[var(--accent-blue)]" />}>
                    <div className="flex justify-between items-center w-full"><Body className="text-[13px] font-bold uppercase tracking-tight">{label}</Body><button onClick={() => setAudioRecords(prev => prev.filter((_, idx) => idx !== i))} className="text-white/20 hover:text-[var(--accent-red)] p-2"><Trash2 size={16} /></button></div>
                  </InteractiveRow>
                ))}
              </div>
            )}
          </SurfaceCard>
        </Section>

        {/* LISTAS DE ITENS */}
        {!isExpress && (() => {
          const renderList = (index: number, title: string, icon: React.ReactNode, colorClass: string, items: LineItem[], setter: React.Dispatch<React.SetStateAction<LineItem[]>>, defaultName: string) => {
            const sectionKey = `section-${index}`;
            const isCollapsed = collapsedSections[sectionKey] && items.length === 0;
            const searchKey = `${defaultName.toLowerCase()}-search`;
            return (
              <Section className="gap-4">
                <div className="flex justify-between items-center px-1"><SectionLabel>{index}. {title}</SectionLabel>{items.length > 0 && <OpsChip label={`${items.length} ITENS`} tone="default" />}</div>
                <SurfaceCard padding="none" className="overflow-hidden">
                  <button onClick={() => { if (items.length === 0) setCollapsedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] })); }} className={cn("w-full p-6 flex items-center justify-between", items.length === 0 && "cursor-pointer active:bg-white/5")}>
                    <div className="flex items-center gap-3"><div className={cn("w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center", colorClass)}>{icon}</div><Body className="font-black uppercase tracking-widest text-[13px]">{title}</Body></div>
                    {items.length === 0 && <ChevronDown size={16} className={cn("text-white/20 transition-transform", isCollapsed && "-rotate-90")} />}
                  </button>
                  {!isCollapsed && (
                    <div className="px-6 pb-6">
                      <Stack className="gap-6 mb-6">
                        {items.map(item => (
                          <div key={item.id} className="flex flex-col gap-4 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center gap-4">
                              <input type="text" value={item.name} onChange={(e) => handleUpdateItem(setter, item.id, 'name', e.target.value)} className="bg-transparent text-sm font-black text-white outline-none w-full border-b border-transparent focus:border-[var(--accent-gold)]/40 uppercase" />
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleAddItem(setter, item.name)} className="text-white/20 hover:text-white p-2"><Copy size={16} /></button>
                                <button onClick={() => handleRemoveItem(setter, item.id)} className="text-white/10 hover:text-[var(--accent-red)] p-2"><Trash2 size={16} /></button>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 items-end">
                              <div className="flex flex-col gap-2"><span className="text-[9px] text-text-tertiary uppercase font-black ml-1">Qtd</span><input type="number" value={item.qty} onChange={(e) => handleUpdateItem(setter, item.id, 'qty', parseFloat(e.target.value) || 0)} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-white text-sm font-mono w-full min-h-[48px]" step="0.1" /></div>
                              <div className="flex flex-col gap-2"><span className="text-[9px] text-text-tertiary uppercase font-black ml-1">Preço Unit.</span><input type="number" value={item.unitPrice} onChange={(e) => handleUpdateItem(setter, item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-white text-sm font-mono w-full min-h-[48px]" /></div>
                              <div className="flex flex-col items-end pb-3"><span className="text-sm font-black text-[var(--accent-gold)] font-mono">{formatBRL(item.qty * item.unitPrice)}</span></div>
                            </div>
                          </div>
                        ))}
                      </Stack>
                      <Stack className="gap-3 mt-6 pt-6 border-t border-white/5">
                        <div className="flex gap-3">
                          <button onClick={() => handleAddItem(setter, defaultName)} className="flex-1 h-12 bg-white/[0.03] text-white border border-white/[0.08] rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2"><Plus size={14} /> Personalizado</button>
                          <button onClick={() => { setInlineSearchSection(prev => prev === searchKey ? null : searchKey); setCatalogSearch(''); }} className="flex-1 h-12 bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border border-[var(--accent-blue)]/20 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2"><Package size={14} /> Catálogo</button>
                        </div>
                        {inlineSearchSection === searchKey && (
                          <div className="flex flex-col gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 mt-2 animate-in slide-in-from-top-2">
                            <input type="text" autoFocus placeholder="Buscar no catálogo..." value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} className="w-full min-h-[48px] bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[var(--accent-blue)]/50" />
                            <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
                              {(() => {
                                const category = defaultName.toLowerCase().includes('peça') ? 'material' : defaultName.toLowerCase().includes('serviço') ? 'labor' : 'other';
                                const itemsToSelect = getCatalogItemsForCategory(category);
                                const sortedItems = [...itemsToSelect].sort((a, b) => { const aFav = favorites.includes(a.id) ? 1 : 0; const bFav = favorites.includes(b.id) ? 1 : 0; return bFav - aFav; });
                                const filtered = sortedItems.filter(i => !catalogSearch || i.title.toLowerCase().includes(catalogSearch.toLowerCase()) || (i.brand || '').toLowerCase().includes(catalogSearch.toLowerCase()));
                                if (filtered.length === 0) return <Body className="text-[10px] opacity-30 italic text-center py-8 font-mono">NENHUM_ITEM_ENCONTRADO</Body>;
                                return filtered.map(item => (
                                  <InteractiveRow key={item.id} onClick={() => { setter(prev => [...prev, { id: generateUUID(), name: item.title, qty: 1, unitPrice: item.defaultUnitValue }]); setInlineSearchSection(null); }} className="!bg-white/[0.01] hover:!bg-white/[0.03] rounded-xl border border-white/5">
                                    <div className="flex justify-between items-center w-full"><div className="flex-1 min-w-0"><Body className="truncate font-black uppercase text-[12px]">{item.title}</Body><Subtitle className="truncate text-[10px] opacity-40 uppercase tracking-widest">{item.category || item.kind}</Subtitle></div><div className="flex items-center gap-4 shrink-0"><span className="text-xs font-black text-white font-mono">{formatBRL(item.defaultUnitValue)}</span><button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id, e); }} className="p-2 hover:bg-white/5 rounded-full transition-colors"><Star size={14} className={cn(favorites.includes(item.id) ? "fill-[var(--accent-gold)] text-[var(--accent-gold)]" : "text-white/10")} /></button></div></div>
                                  </InteractiveRow>
                                ));
                              })()}
                            </div>
                          </div>
                        )}
                      </Stack>
                    </div>
                  )}
                </SurfaceCard>
              </Section>
            );
          };
          return (
            <>
              {renderList(4, 'Peças e Materiais', <Package size={16} />, 'text-[var(--accent-blue)]', materials, setMaterials, 'Nova Peça')}
              {renderList(5, 'Serviços e Mão de Obra', <Clock size={16} />, 'text-[var(--accent-gold)]', labor, setLabor, 'Nova Mão de Obra')}
              {renderList(6, 'Custos Extras', <Truck size={16} />, 'text-white/40', extras, setExtras, 'Taxa Extra')}
            </>
          );
        })()}

        {/* DESCONTOS */}
        <Section className="gap-4">
          <SectionLabel>7. Concessão de Descontos</SectionLabel>
          <SurfaceCard padding="lg">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2"><span className="text-[10px] text-text-tertiary uppercase font-black ml-1">Percentual (%)</span><input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-white text-sm font-mono w-full min-h-[52px]" step="0.5" /></div>
              <div className="flex flex-col gap-2"><span className="text-[10px] text-text-tertiary uppercase font-black ml-1">Valor Fixo (R$)</span><input type="number" value={discountFixed} onChange={(e) => setDiscountFixed(parseFloat(e.target.value) || 0)} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-white text-sm font-mono w-full min-h-[52px]" /></div>
            </div>
            {discountValue > 0 && <div className="mt-6 text-right px-1"><span className="text-[11px] text-[var(--accent-green)] font-black uppercase tracking-[0.15em]">Desconto: -{formatBRL(discountValue)}</span></div>}
          </SurfaceCard>
        </Section>

        {/* IMPOSTOS */}
        <Section className="gap-4">
          <SectionLabel>8. Obrigações Fiscais</SectionLabel>
          <SurfaceCard padding="lg" className="flex justify-between items-center bg-[var(--accent-red)]/5 border-[var(--accent-red)]/10">
            <Body className="text-sm font-bold text-white/60">ISS / ICMS (Auto 15%)</Body><span className="text-sm font-black text-[var(--accent-red)] font-mono">+{formatBRL(taxesTotal)}</span>
          </SurfaceCard>
        </Section>

        {/* RESUMO */}
        <Section className="gap-4">
          <SectionLabel>9. Projeção de Rentabilidade</SectionLabel>
          <SurfaceCard padding="xl" className="bg-gradient-to-br from-[var(--accent-blue)]/[0.08] to-transparent border-[var(--accent-blue)]/20 shadow-2xl">
            <Stack className="gap-4 mb-8">
              <div className="flex justify-between items-center text-sm"><span className="text-white/40 uppercase font-bold tracking-widest text-[11px]">Subtotal Bruto:</span><span className="font-mono font-bold text-white/80">{formatBRL(rawSubTotal)}</span></div>
              {discountValue > 0 && <div className="flex justify-between items-center text-sm"><span className="text-[var(--accent-green)] uppercase font-black tracking-widest text-[11px]">Descontos:</span><span className="font-mono font-bold text-[var(--accent-green)]">-{formatBRL(discountValue)}</span></div>}
              <div className="flex justify-between items-center text-sm"><span className="text-[var(--accent-red)] uppercase font-black tracking-widest text-[11px]">Impostos (15%):</span><span className="font-mono font-bold text-[var(--accent-red)]">+{formatBRL(taxesTotal)}</span></div>
              <div className="flex justify-between items-center mt-4 pt-6 border-t border-white/5"><div className="flex flex-col"><span className="text-[var(--accent-gold)] uppercase font-black tracking-widest text-[10px]">Margem Bruta (30%)</span></div><span className="font-mono font-black text-[var(--accent-gold)] text-lg">{formatBRL(marginTotal)}</span></div>
            </Stack>
            <div className="flex flex-col items-center border-t border-[var(--accent-blue)]/20 pt-8 mt-4"><span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-3">Valor Final</span><span className="text-5xl font-black text-[var(--accent-blue)] tracking-tighter font-mono">{formatBRL(grandTotal)}</span></div>
          </SurfaceCard>
        </Section>

        {/* AÇÕES */}
        <div className="flex flex-col gap-4 mb-20 px-1">
          <div className="grid grid-cols-2 gap-4">
            <SecondaryButton onClick={handleSaveDraft} disabled={isInvalid || isSaving} className="h-16 !rounded-2xl"><Save size={18} className="mr-2" /> Salvar Rascunho</SecondaryButton>
            <PrimaryButton onClick={handleSendToClient} disabled={isInvalid || isSaving || formData.status !== BUDGET_STATUS.INICIADO} tone="blue" className="h-16 !rounded-2xl"><Send size={18} className="mr-2" /> Enviar Cliente</PrimaryButton>
          </div>
          {id && formData.status === BUDGET_STATUS.ENVIADO && <PrimaryButton onClick={handleAuthorize} disabled={isSaving} tone="success" className="h-20 !rounded-2xl !text-[13px] shadow-[var(--glow-green)]"><CheckCircle2 size={24} className="mr-3" /> AUTORIZAR PROJETO & GERAR O.S.</PrimaryButton>}
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-surface-elevated)] border-t border-white/[0.08] px-6 py-5 z-40 shadow-[0_-20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-in slide-in-from-bottom-full duration-500">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="flex flex-col"><span className="text-[9px] font-black text-[var(--accent-blue)] uppercase tracking-[0.2em] opacity-60">Total Proposta</span><span className="text-[22px] font-black text-white tracking-tight font-mono">{formatBRL(grandTotal)}</span></div>
          <PrimaryButton onClick={handleSaveDraft} disabled={isInvalid || isSaving} className="h-14 px-10 !rounded-2xl shadow-[var(--glow-blue)] !text-[11px]" tone="blue">FINALIZAR PROPOSTA</PrimaryButton>
        </div>
      </div>

      <ClientZeroBottomSheet
        isOpen={isClientZeroOpen}
        onClose={() => setIsClientZeroOpen(false)}
        onClientSelected={async (result: ClientZeroResult) => {
          const allClients = await clientService.getAll();
          setClients(allClients);
          await handleClientChange(result.clientId);
          setIsClientZeroOpen(false);
        }}
      />
    </ScreenContainer>
  );
};
