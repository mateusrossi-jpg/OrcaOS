import { generateUUID } from '../../../core/utils/idGenerator';
import { calendarService } from '../../../services/CalendarService';
import { pilotTelemetry } from '../../../services/pilotTelemetryService';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { trustLayer } from '../../../core/trust/TrustLayer';
import { Camera, Wrench, Package, Clock, Truck, FileText, Plus, Trash2, Tag, Send, Save, Copy, CheckCircle2, Mic, Image as ImageIcon, ChevronDown, Star, UserPlus, Zap, Navigation, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { db } from '../../../storage/dexieDatabase';
import { cn } from '../../../utils/ui';
import { operationalFacade } from '../../workflow/operationalFacade';
import { clientService } from '../../../services/clientService';
import { siteService } from '../../../services/siteService';
import { BudgetPersistenceService } from '../../../services/BudgetPersistenceService';
import { Client } from '../../../domain/client';
import { BUDGET_STATUS } from '../../../domain/budget';
import { catalogService } from '../../../services/catalogService';
import { CatalogHubItem } from '../../../features/catalog/storage/catalogHubStorage';
import { ClientZeroBottomSheet, ClientZeroResult } from '../../clients/components/ClientZeroBottomSheet';
import { ProposalCartWorkspace } from '../components/ProposalCartWorkspace';

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
  ERPLoader,
  GlassInput,
  GlassSelect,
  GlassTextarea,
  GlassCurrencyInput,
  GlassFormCard,
  Label,
  Eyebrow
} from '../../../ui/system';
import { Modal, PrimaryButton, SecondaryButton } from '../../../app/components/ui';

interface LineItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
}

interface ProposalGeneratorPageProps { id?: string | null; onBack?: () => void; onNavigate?: (tab: string) => void; }

/**
 * ProposalGeneratorPage (V33): Authoritative Proposal Hub.
 * Elevated with Sequential Workflow & Conflict Prevention.
 * Aligned with AFERIX MASTER CONSTITUTION.
 */
export const ProposalGeneratorPage: React.FC<ProposalGeneratorPageProps> = ({ id, onBack, onNavigate }) => {
  const [localId, setLocalId] = useState<string | null>(id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSites, setClientSites] = useState<any[]>([]);

  // PILOT TELEMETRY (FASE 4)
  const completeFlowRef = useRef<((abandoned?: boolean) => void) | null>(null);

  useEffect(() => {
    const endTrack = pilotTelemetry.trackScreen('ProposalGenerator');
    completeFlowRef.current = pilotTelemetry.startFlow('new_proposal', { budgetId: id });

    return () => {
      endTrack();
      if (completeFlowRef.current) {
        completeFlowRef.current(true); 
      }
    };
  }, [id]);

  // Evidences State
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecords, setAudioRecords] = useState<string[]>([]);

  // Fast Proposal V2 additions
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isExpress, setIsExpress] = useState(false);
  const [expressValue, setExpressValue] = useState<number>(0);
  const [favoriteValues, setFavoriteValues] = useState<number[]>([]);
  const [isClientZeroOpen, setIsClientZeroOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    clientName: '',
    siteId: '',
    description: '',
    status: BUDGET_STATUS.INICIADO as string,
    scheduledDate: new Date().toISOString().split('T')[0],
  });

  const [hasConflict, setHasConflict] = useState(false);

  const [materials, setMaterials] = useState<LineItem[]>([]);
  const [labor, setLabor] = useState<LineItem[]>([]);
  const [extras, setExtras] = useState<LineItem[]>([]);

  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountFixed, setDiscountFixed] = useState<number>(0);

  const [catalogItems, setCatalogItems] = useState<CatalogHubItem[]>([]);

  useEffect(() => {
    async function check() {
      if (formData.scheduledDate) {
        const conflict = await calendarService.checkConflict(formData.scheduledDate);
        setHasConflict(conflict);
      }
    }
    check();
  }, [formData.scheduledDate]);

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
      try {
        const allClients = await clientService.getAll();
        setClients(allClients || []);

        const favs = localStorage.getItem('aferix_favorite_catalog_items');
        if (favs) setFavorites(JSON.parse(favs));

        try {
          const recentBudgets = await db.budgets.orderBy('updatedAt').reverse().toArray();
          const valueCounts: Record<number, number> = {};
          recentBudgets.forEach(b => {
            if (b.chargedValue) {
              const val = Math.round(b.chargedValue);
              valueCounts[val] = (valueCounts[val] || 0) + 1;
            }
          });
          const defaultValues = [80, 100, 150, 200, 250, 450];
          const dynamicValues = Object.keys(valueCounts).map(Number);
          dynamicValues.sort((a, b) => valueCounts[b] - valueCounts[a]);
          const mergedValues = [...dynamicValues];
          defaultValues.forEach(def => {
            if (!mergedValues.includes(def)) mergedValues.push(def);
          });
          setFavoriteValues(mergedValues.slice(0, 6));
        } catch (err) { console.error(err); }

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
              scheduledDate: budget.scheduledDate || new Date().toISOString().split('T')[0],
            });
            if (budget.clientId) {
              const sites = await siteService.getByClientId(budget.clientId);
              setClientSites(sites || []);
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
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleClientChange = async (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    setFormData(prev => ({ ...prev, clientId, clientName: c?.name || '', siteId: '' }));
    if (clientId) {
      const sites = await siteService.getByClientId(clientId);
      setClientSites(sites);
    } else {
      setClientSites([]);
    }
  };

  const handleClientZeroResult = async (result: ClientZeroResult) => {
    setFormData(prev => ({
      ...prev,
      clientId: result.clientId || '',
      clientName: result.clientName,
      siteId: ''
    }));
    if (result.clientId) {
       const sites = await siteService.getByClientId(result.clientId);
       setClientSites(sites);
    }
    setIsClientZeroOpen(false);
  };

  const handleImportEvidences = () => {
    window.dispatchEvent(new CustomEvent('aferix_toast', { detail: { type: 'info', message: 'Evidências importadas da Ordem de Serviço.' } }));
  };

  const rawSubTotal = useMemo(() => {
    if (isExpress) return expressValue;
    const m = materials.reduce((sum, i) => sum + (i.qty * i.unitPrice), 0);
    const l = labor.reduce((sum, i) => sum + (i.qty * i.unitPrice), 0);
    const e = extras.reduce((sum, i) => sum + (i.qty * i.unitPrice), 0);
    return m + l + e;
  }, [materials, labor, extras, isExpress, expressValue]);

  const discountValue = useMemo(() => {
    const p = (rawSubTotal * discountPercent) / 100;
    return p + discountFixed;
  }, [rawSubTotal, discountPercent, discountFixed]);

  const taxesTotal = (rawSubTotal - discountValue) * 0.15;
  const marginTotal = (rawSubTotal - discountValue) * 0.30;
  const grandTotal = (rawSubTotal - discountValue) + taxesTotal;

  const handleDuplicate = () => {
    setLocalId(null);
    setFormData(prev => ({
      ...prev,
      title: `${prev.title} (Cópia)`,
      status: BUDGET_STATUS.INICIADO as string,
    }));
    window.dispatchEvent(new CustomEvent('aferix_toast', { detail: { type: 'success', message: 'Cópia criada. Salve para registrar.' } }));
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [finalBudgetId, setFinalBudgetId] = useState<string | null>(null);

  const handleSave = async (shouldFinalize = false) => {
    if (!formData.title || (!formData.clientId && !formData.clientName)) {
      window.dispatchEvent(new CustomEvent('aferix_toast', { detail: { type: 'error', message: 'Preencha o título e o cliente.' } }));
      return;
    }

    setIsSaving(true);
    try {
      const budgetId = localId || generateUUID();
      const attendanceId = localStorage.getItem('aferix_active_attendance_id') || generateUUID();

      const budgetItems = isExpress ? [
        { id: generateUUID(), description: formData.title || 'Serviço Expresso', quantity: 1, unitPrice: expressValue, category: 'labor' as const }
      ] : [
        ...materials.map(i => ({ id: i.id, description: i.name, quantity: i.qty, unitPrice: i.unitPrice, category: 'material' as const })),
        ...labor.map(i => ({ id: i.id, description: i.name, quantity: i.qty, unitPrice: i.unitPrice, category: 'labor' as const })),
        ...extras.map(i => ({ id: i.id, description: i.name, quantity: i.qty, unitPrice: i.unitPrice, category: 'other' as const })),
      ];

      const budget = {
        id: budgetId,
        attendanceId,
        ...formData,
        chargedValue: grandTotal,
        items: budgetItems,
        updatedAt: new Date().toISOString(),
      };

      await operationalFacade.saveBudget(budget as any);

      if (shouldFinalize) {
        await operationalFacade.finalizeBudget(budgetId);
        setFinalBudgetId(budgetId);
        setShowSuccessModal(true);
        pilotTelemetry.trackAction('ProposalGenerator', 'finalize_proposal');
      } else {
        window.dispatchEvent(new CustomEvent('aferix_toast', { detail: { type: 'success', message: 'Rascunho salvo.' } }));
        pilotTelemetry.trackAction('ProposalGenerator', 'save_draft');
        if (onBack) onBack();
      }

      if (completeFlowRef.current) {
        completeFlowRef.current(false);
        completeFlowRef.current = null;
      }
      localStorage.removeItem('aferix_active_attendance_id');
    } catch (err) {
      pilotTelemetry.trackError('ProposalGenerator', 'SAVE_FAILED', err instanceof Error ? err.message : 'Unknown');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvertToWorkOrder = async () => {
    if (!finalBudgetId) return;
    try {
      await operationalFacade.authorizeBudget(finalBudgetId);
      if (onNavigate) onNavigate('operations');
    } catch (err) { console.error(err); }
  };

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (isLoading) return <ScreenContainer className="items-center justify-center bg-[#07080A] min-h-screen"><ERPLoader message="Carregando workspace..." /></ScreenContainer>;

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-[#07080A] animate-in fade-in slide-in-from-right-6 duration-500 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#161B29]/30 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />
      <div className="absolute top-[30%] right-[-20%] w-[60%] h-[40%] bg-[#0A84FF]/5 pointer-events-none blur-[100px] z-0" />
      <div className="absolute bottom-[10%] left-[-20%] w-[60%] h-[40%] bg-[var(--accent-gold)]/3 pointer-events-none blur-[100px] z-0" />

      <div className="relative z-10 w-full shrink-0">
         <div className="w-full max-w-md mx-auto">
            <AppHeader title="Nova Proposta" subtitle="Emitir Orçamento Comercial" onBack={onBack} standalone />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto relative z-10 scrollbar-none">
        <div className="flex flex-col p-6 space-y-12 max-w-md mx-auto w-full pb-48 relative z-10">
        
        {/* SECTION: IDENTIFICATION */}
        <Section className="gap-6">
          <SectionLabel>1. Identificação Comercial</SectionLabel>
          <GlassFormCard>
            <GlassInput label="Título do Orçamento" placeholder="Ex: Reforma Elétrica G-1" value={formData.title} onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} />
            
            <div className="flex gap-4">
              <div className="flex-1">
                <GlassSelect label="Cliente Vínculo" value={formData.clientId} onChange={(e) => handleClientChange(e.target.value)}>
                  <option value="">Selecionar cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </GlassSelect>
              </div>
              <button type="button" onClick={() => setIsClientZeroOpen(true)} className="h-[56px] w-[56px] shrink-0 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] active:scale-95 flex items-center justify-center mt-6 transition-all"><UserPlus size={20} /></button>
            </div>

            {formData.clientId && clientSites.length > 0 && (
              <GlassSelect label="Site / Unidade" value={formData.siteId} onChange={(e) => setFormData(prev => ({...prev, siteId: e.target.value}))}>
                <option value="">Principal</option>
                {clientSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </GlassSelect>
            )}

            <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-2">
              <span className="text-[10px] text-white uppercase font-black tracking-widest flex items-center gap-2"><Zap size={14} className="text-[#D4AF37]" /> Atendimento Expresso</span>
              <button type="button" onClick={() => setIsExpress(prev => !prev)} className={cn("w-12 h-7 rounded-full transition-all relative border flex items-center", isExpress ? "bg-[#D4AF37] border-[#D4AF37]" : "bg-black/40 border-white/10")}><div className={cn("w-5 h-5 rounded-full bg-white absolute transition-all", isExpress ? "right-1" : "left-1")} /></button>
            </div>

            {isExpress && (
              <Stack className="gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <GlassCurrencyInput label="VALOR DA EXECUÇÃO" value={expressValue} onChange={(e) => setExpressValue(parseFloat(e.target.value) || 0)} />
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {favoriteValues.map(val => (
                    <button key={val} type="button" onClick={() => setExpressValue(val)} className={cn("px-5 py-3 text-[11px] font-mono font-black rounded-xl border uppercase tracking-wider whitespace-nowrap active:scale-95 transition-all min-h-[46px] flex items-center justify-center snap-start", expressValue === val ? "bg-[#47C46A] text-black border-[#47C46A]" : "bg-white/[0.03] text-white border-white/[0.08]")}>{formatBRL(val)}</button>
                  ))}
                </div>
              </Stack>
            )}
          </GlassFormCard>

          {/* DATE CONTROL & CONFLICT PREVENTION */}
          <div className="flex flex-col gap-5 mt-4">
              <div className="flex flex-col gap-3">
                 <Label className="!text-[10px] opacity-40 uppercase tracking-widest ml-1">Data Programada para Execução</Label>
                 <div className="relative group">
                    <input 
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className={cn(
                        "w-full h-16 bg-white/[0.02] border rounded-[20px] px-6 text-white text-[15px] font-black uppercase focus:outline-none transition-all",
                        hasConflict ? "border-red-500/50 shadow-[0_0_15px_rgba(255,92,92,0.1)]" : "border-white/[0.08] focus:border-[var(--accent-gold)]/40"
                      )}
                    />
                    {hasConflict && (
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-red-500 animate-pulse pointer-events-none">
                         <AlertCircle size={18} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Conflito</span>
                      </div>
                    )}
                 </div>
              </div>

              {hasConflict && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 animate-shake">
                   <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-relaxed">Atenção: Já existe um atendimento agendado para esta data.</span>
                </div>
              )}
          </div>
        </Section>

        {/* SECTION: SCOPE */}
        <Section className="gap-6">
          <SectionLabel>2. Escopo do Serviço</SectionLabel>
          <GlassFormCard>
            <GlassTextarea placeholder="Descreva detalhadamente o serviço..." value={formData.description} onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))} />
          </GlassFormCard>
        </Section>

        {/* SECTION: EVIDENCES */}
        <Section className="gap-6">
          <div className="flex justify-between items-center px-1">
            <SectionLabel>3. Evidências Técnicas</SectionLabel>
            <button onClick={handleImportEvidences} className="text-[10px] font-black text-[#0A84FF] uppercase tracking-widest bg-[#0A84FF]/10 px-4 py-2 rounded-xl active:scale-95 transition-all">HERDAR DA OS</button>
          </div>
          <GlassFormCard>
            <div className="grid grid-cols-2 gap-6">
              <button onClick={() => { if (isRecording) return; setIsRecording(true); setTimeout(() => { setAudioRecords(prev => [...prev, `Áudio ${prev.length + 1}`]); setIsRecording(false); }, 2000); }} className={cn("py-8 rounded-3xl border transition-all flex flex-col items-center justify-center gap-4 shadow-xl", isRecording ? "bg-[#E85D5D]/10 border-[#E85D5D]/30 animate-pulse" : "bg-white/[0.02] border-white/[0.08]")}>
                <Mic size={28} className={isRecording ? "text-[#E85D5D]" : "text-[#0A84FF]"} /><span className="text-[10px] font-black tracking-[0.2em] text-white/60 uppercase">{isRecording ? "Gravando..." : "Gravar Áudio"}</span>
              </button>
              <div className="relative w-full h-full">
                <input type="file" accept="image/*" capture="environment" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => { const files = e.target.files; if (files && files.length > 0) setPhotos(prev => [...prev, URL.createObjectURL(files[0])]); }} />
                <div className="py-8 h-full rounded-3xl border bg-white/[0.02] border-white/[0.08] flex flex-col items-center justify-center gap-4 shadow-xl"><ImageIcon size={28} className="text-[#47C46A]" /><span className="text-[10px] font-black tracking-[0.2em] text-white/60 uppercase">Capturar Foto</span></div>
              </div>
            </div>
            {(photos.length > 0 || audioRecords.length > 0) && (
              <div className="mt-6 flex flex-col gap-6 border-t border-white/[0.05] pt-8">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
                  {photos.map((src, i) => (
                    <div key={i} className="relative min-w-[120px] w-32 h-32 rounded-[24px] overflow-hidden border border-white/[0.1] shrink-0 snap-start shadow-2xl group">
                      <img src={src} alt="Evidência" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <button onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-black/60 backdrop-blur-md rounded-bl-2xl text-white min-w-[50px] min-h-[50px] flex items-center justify-center active:bg-red-500 transition-colors"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
                {audioRecords.map((label, i) => (
                  <InteractiveRow key={i} leftSlot={<Mic size={18} className="text-[#0A84FF]" />} className="bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                    <div className="flex justify-between items-center w-full"><Body className="text-[14px] font-black uppercase tracking-tight">{label}</Body><button onClick={() => setAudioRecords(prev => prev.filter((_, idx) => idx !== i))} className="text-white/20 hover:text-[#E85D5D] p-3 transition-colors"><Trash2 size={18} /></button></div>
                  </InteractiveRow>
                ))}
              </div>
            )}
          </GlassFormCard>
        </Section>

        {!isExpress && (
          <ProposalCartWorkspace 
            catalogItems={[]}
            materials={materials}
            setMaterials={setMaterials}
            labor={labor}
            setLabor={setLabor}
            extras={extras}
            setExtras={setExtras}
          />
        )}

        <Section className="gap-6">
          <SectionLabel>7. Estratégia de Descontos</SectionLabel>
          <GlassFormCard>
            <div className="grid grid-cols-2 gap-6">
              <GlassInput label="PERCENTUAL (%)" type="number" value={discountPercent} onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)} className="!h-16 font-mono" />
              <GlassCurrencyInput label="VALOR FIXO (R$)" value={discountFixed} onChange={(e) => setDiscountFixed(parseFloat(e.target.value) || 0)} className="!h-16 font-mono" />
            </div>
          </GlassFormCard>
        </Section>

        <Section className="gap-6">
          <SectionLabel>9. Projeção Executiva</SectionLabel>
          <SurfaceCard padding="xl" className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] shadow-[0_24px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl rounded-[28px]">
            <Stack className="gap-6 mb-10">
              <div className="flex justify-between items-center"><span className="text-white/30 uppercase font-black tracking-[0.2em] text-[11px]">Subtotal Bruto:</span><span className="font-mono font-black text-white/80 text-xl">{formatBRL(rawSubTotal)}</span></div>
              <div className="flex justify-between items-center mt-6 pt-10 border-t border-white/[0.08]"><div className="flex flex-col"><span className="text-[#D4AF37] uppercase font-black tracking-[0.3em] text-[12px]">Rentabilidade Prevista (30%)</span></div><span className="font-mono font-black text-[#D4AF37] text-[24px] tracking-tighter">{formatBRL(marginTotal)}</span></div>
            </Stack>
            <div className="flex flex-col items-center border-t border-white/[0.08] pt-8 mt-6">
               <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Valor Final da Proposta</span>
               <span className="text-[36px] font-black text-white tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">{formatBRL(grandTotal)}</span>
            </div>
          </SurfaceCard>
        </Section>

        <div className="flex flex-col gap-6 mb-32">
          <div className="grid grid-cols-2 gap-6">
            <SecondaryButton onClick={() => handleSave(false)} className="h-16 font-black tracking-widest text-[11px] uppercase rounded-2xl" disabled={isSaving}>SALVAR RASCUNHO</SecondaryButton>
            <PrimaryButton onClick={() => handleSave(true)} className="h-16 font-black tracking-widest text-[11px] uppercase rounded-2xl shadow-lg" disabled={isSaving}>FINALIZAR PROPOSTA</PrimaryButton>
          </div>
          <button onClick={onBack} className="h-14 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest active:scale-95 transition-all">DESCARTAR ALTERAÇÕES</button>
        </div>
      </div>
      </div>

      <ClientZeroBottomSheet isOpen={isClientZeroOpen} onClose={() => setIsClientZeroOpen(false)} onClientSelected={handleClientZeroResult} />

      <Modal isOpen={showSuccessModal} onClose={() => { setShowSuccessModal(false); if (onBack) onBack(); }} title="Proposta Finalizada.">
        <div className="flex flex-col gap-8 py-4">
           <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col items-center text-center gap-2">
              <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">Valor Registrado</span>
              <span className="text-[32px] font-black text-[#47C46A] font-mono">{formatBRL(grandTotal)}</span>
           </div>
           <div className="flex flex-col gap-4">
              <PrimaryButton onClick={handleConvertToWorkOrder} className="h-16 flex items-center justify-center gap-3"><Zap size={20} className="fill-current" /> GERAR ORDEM DE SERVIÇO</PrimaryButton>
              <SecondaryButton onClick={() => { setShowSuccessModal(false); if (onBack) onBack(); }} className="h-14">SAIR</SecondaryButton>
           </div>
        </div>
      </Modal>
    </div>
  );
};
