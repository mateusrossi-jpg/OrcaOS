import React, { useState, useMemo, useEffect } from 'react';
import { trustLayer } from '../../../core/trust/TrustLayer';
import { ArrowLeft, Camera, Wrench, Package, Clock, Truck, FileText, AlertTriangle, Plus, Trash2, Tag, Send, Save, Copy, CheckCircle2, Mic, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { db } from '../../../storage/dexieDatabase';
import { cn } from '../../../utils/ui';
import { operationalFacade } from '../../workflow/operationalFacade';
import { clientService } from '../../../services/clientService';
import { siteService } from '../../../services/siteService';
import { BudgetPersistenceService } from '../../../services/BudgetPersistenceService';
import { Client } from '../../../domain/client';
import { BUDGET_STATUS } from '../../../domain/budget';
import { Select, Input } from '../../../app/components/ui';
import { clientProposalService } from "../../../services/clientProposalService";
import { createClientProposalDraft } from "../../clientPortal/storage/clientProposalStorage";
interface LineItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
}

interface ProposalGeneratorPageProps { id?: string | null; onBack?: () => void; onNavigate?: (tab: string) => void; }

export const ProposalGeneratorPage: React.FC<ProposalGeneratorPageProps> = ({ id, onBack, onNavigate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSites, setClientSites] = useState<any[]>([]);

  // Evidences Mock State
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecords, setAudioRecords] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    clientName: '',
    siteId: '',
    description: '',
    status: BUDGET_STATUS.INICIADO,
  });

  const [materials, setMaterials] = useState<LineItem[]>([]);
  const [labor, setLabor] = useState<LineItem[]>([]);
  const [extras, setExtras] = useState<LineItem[]>([]);

  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountFixed, setDiscountFixed] = useState<number>(0);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      const allClients = await clientService.getAll();
      setClients(allClients);

      if (id) {
        const bp = new BudgetPersistenceService();
        const budget = await bp.getBudget(id);
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
            setMaterials(budget.items.filter((i: any) => i.category === 'material').map((i: any) => ({ id: i.id, name: i.description, qty: i.quantity, unitPrice: i.unitPrice })));
            setLabor(budget.items.filter((i: any) => i.category === 'labor').map((i: any) => ({ id: i.id, name: i.description, qty: i.quantity, unitPrice: i.unitPrice })));
            setExtras(budget.items.filter((i: any) => i.category === 'other').map((i: any) => ({ id: i.id, name: i.description, qty: i.quantity, unitPrice: i.unitPrice })));
          }
        }
      }
    }
    loadData();
  }, [id]);

  const handleClientChange = async (val: string) => {
    const client = clients.find(c => c.id === val);
    setFormData(prev => ({ ...prev, clientId: val, clientName: client?.name || '', siteId: '' }));
    if (val) {
      const sites = await siteService.getByClientId(val);
      setClientSites(sites);
      if (sites.length === 1) {
        setFormData(prev => ({ ...prev, siteId: sites[0].id }));
      }
    } else {
      setClientSites([]);
    }
  };

  // Tax rate
  const TAX_RATE = 0.15; // 15% ISS/ICMS approximation
  const MARGIN_RATE = 0.30; // 30% Margem de Lucro Bruto

  // Calculated Totals
  const sumItems = (items: LineItem[]) => items.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);
  
  const materialsTotal = useMemo(() => sumItems(materials), [materials]);
  const laborTotal = useMemo(() => sumItems(labor), [labor]);
  const extrasTotal = useMemo(() => sumItems(extras), [extras]);
  
  const rawSubTotal = materialsTotal + laborTotal + extrasTotal;
  
  const discountValue = (rawSubTotal * (discountPercent / 100)) + discountFixed;
  const subTotalAfterDiscount = rawSubTotal - discountValue;

  const taxesTotal = subTotalAfterDiscount * TAX_RATE;
  const marginTotal = subTotalAfterDiscount * MARGIN_RATE;
  
  const grandTotal = subTotalAfterDiscount + taxesTotal;

  const isProposalEmpty = materials.length === 0 && labor.length === 0 && extras.length === 0;
  const isZeroValue = rawSubTotal <= 0;
  const isInvalid = (!formData.title) || (!formData.clientId && !formData.clientName) || isProposalEmpty;

  const formatBRL = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleUpdateItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, id: string, field: keyof LineItem, val: string | number) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleRemoveItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, id: string) => {
    setter(prev => prev.filter(item => item.id !== id));
  };

  const handleAddItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, defaultName: string) => {
    setter(prev => [...prev, { id: crypto.randomUUID(), name: defaultName, qty: 1, unitPrice: 0 }]);
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
    const mappedItems = [
      ...materials.map(m => ({ id: m.id, description: m.name, quantity: m.qty, unitPrice: m.unitPrice, category: 'material' })),
      ...labor.map(l => ({ id: l.id, description: l.name, quantity: l.qty, unitPrice: l.unitPrice, category: 'labor' })),
      ...extras.map(e => ({ id: e.id, description: e.name, quantity: e.qty, unitPrice: e.unitPrice, category: 'other' })),
    ];

    return {
      id,
      title: formData.title,
      clientId: formData.clientId,
      clientName: formData.clientName,
      siteId: formData.siteId,
      description: formData.description,
      status,
      chargedValue: grandTotal,
      materialCost: materialsTotal,
      travelCost: 0,
      helperCost: 0,
      laborCost: laborTotal,
      otherCosts: extrasTotal,
      discounts: discountValue,
      fees: taxesTotal,
      items: mappedItems,
      evidences: [...photos, ...audioRecords],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const handleSaveDraft = async () => {
    if (isInvalid) {
      trustLayer.emit({ type: 'error', title: 'Validação', description: 'Preencha o Título, o Cliente e adicione pelo menos um item (Material/Serviço/Extra).', status: 'local' });
      return;
    }
    try {
      setIsSaving(true);
      const budgetId = id || crypto.randomUUID();
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


// ... inside handleSendToClient ...
  const handleSendToClient = async () => {
    if (isInvalid) {
      trustLayer.emit({ type: 'error', title: 'Validação', description: 'Preencha o Título, o Cliente e adicione pelo menos um item (Material/Serviço/Extra).', status: 'local' });
      return;
    }
    try {
      setIsSaving(true);
      const budgetId = id || crypto.randomUUID();
      const budget = createBudgetPayload(BUDGET_STATUS.ENVIADO, budgetId);

      // 1. Save the internal Budget
      await operationalFacade.saveBudget(budget as any);
      await operationalFacade.changeBudgetStatus(budgetId, BUDGET_STATUS.ENVIADO, budget as any);
      
      // 2. CREATE REAL CLIENT PROPOSAL (For Portal/External view)
      const publicProposal = createClientProposalDraft({
         budgetId,
         companyId: 'default-company',
         clientId: budget.clientId,
         clientName: budget.clientName,
         title: budget.title,
         summary: budget.description,
         total: budget.chargedValue,
         subtotal: budget.chargedValue - budget.fees,
         status: 'sent',
         items: budget.items.map(i => ({
            id: i.id,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.quantity * i.unitPrice,
            category: i.category as any,
            visibleToClient: true
         }))
      });
      
      await clientProposalService.add(publicProposal);
      
      const publicLink = `https://aferix.com/portal/p/${publicProposal.publicToken}`;
      
      setFormData(prev => ({...prev, status: BUDGET_STATUS.ENVIADO}));
      
      // Haptic/Toast with Link
      if (navigator.clipboard) {
         await navigator.clipboard.writeText(publicLink);
      }
      
      trustLayer.emit({ 
         type: 'success', 
         title: 'Proposta Enviada!', 
         description: 'Link de aprovação copiado para sua área de transferência.', 
         status: 'synced' 
      });
      
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

  return (
    <div className={cn("flex flex-col min-h-screen bg-background pb-32 overflow-x-hidden font-sans", isSaving && "opacity-50 pointer-events-none")}>
      
      {/* =========================================
          BLOCO 1: IDENTIFICAÇÃO
      =========================================== */}
      <div className="bg-surface-900 border-b border-surface-800 p-4 pt-12 flex flex-col z-30 shadow-md sticky top-0">
        <div className="flex items-center gap-3 mb-4 justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-surface-800 rounded-full hover:bg-surface-700 transition-colors">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-white tracking-widest uppercase">Nova Proposta</h1>
              <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase">ID: {id || 'NOVO'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {formData.clientId && (
               <button onClick={() => onNavigate?.('clients')} className="px-3 py-1 bg-surface-800 border border-surface-700 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest active:scale-95 transition-all text-center">
                 Ficha
               </button>
            )}
            <button onClick={() => onNavigate?.('assets')} className="px-3 py-1 bg-surface-800 border border-surface-700 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest active:scale-95 transition-all text-center">
              Ativos
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-surface-800 p-4 rounded-xl border border-surface-700 mt-2">
          <Input 
            label="Título do Projeto" 
            value={formData.title} 
            onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} 
            placeholder="Ex: Instalação de Ar Condicionado" 
            required 
          />
          <Select 
            label="Cliente (Base)" 
            value={formData.clientId} 
            onChange={handleClientChange}
          >
            <option value="">Novo Cliente (Cadastro Rápido)</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          {!formData.clientId && (
            <Input 
              label="Nome do Novo Cliente" 
              value={formData.clientName} 
              onChange={(e) => setFormData(prev => ({...prev, clientName: e.target.value}))} 
              placeholder="Ex: João da Silva" 
              required 
            />
          )}

          {formData.clientId && clientSites.length > 0 && (
            <Select
              label="Local (Site) - Opcional"
              value={formData.siteId}
              onChange={(val) => setFormData(prev => ({...prev, siteId: val}))}
            >
              <option value="">Nenhum / Principal</option>
              {clientSites.map(s => <option key={s.id} value={s.id}>{s.name} - {s.fullAddress}</option>)}
            </Select>
          )}
        </div>
      </div>

      <div className="flex flex-col p-4 space-y-6">
        
        {/* =========================================
            BLOCO 2: PROBLEMA ENCONTRADO
        =========================================== */}
        <section className="bg-surface-900 border border-surface-700 rounded-xl p-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} /> 2. Descrição do Problema / Escopo
            </h2>
          </div>
          
          <textarea 
             className="w-full h-24 bg-surface-800 rounded p-3 text-white text-sm outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
             placeholder="Descreva o que será feito ou o problema encontrado..."
             value={formData.description}
             onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
          />
        </section>

        {/* =========================================
            BLOCO 3: EVIDÊNCIAS (FOTOS/ÁUDIO)
        =========================================== */}
        <section className="bg-surface-900 border border-surface-700 rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Camera size={16} /> 3. Evidências (Fotos)
            </h2>
            <button onClick={handleImportEvidences} className="bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] px-3 py-1.5 rounded text-[10px] uppercase font-bold flex items-center gap-1 active:scale-95 transition-all">
              Herdar da OS
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => {
                if (isRecording) return;
                setIsRecording(true);
                setTimeout(() => {
                  setAudioRecords(prev => [...prev, `Áudio ${prev.length + 1} (${new Date().toLocaleTimeString()})`]);
                  setIsRecording(false);
                  trustLayer.emit({ type: 'success', title: 'Áudio gravado com sucesso!', status: 'synced' });
                }, 2000);
              }}
              className={cn("py-4 rounded-xl border border-surface-700 bg-surface-800 text-white flex flex-col items-center justify-center gap-2 transition-colors", isRecording ? "animate-pulse bg-status-error/20 border-status-error" : "hover:bg-surface-700")}
            >
              <Mic size={24} className={isRecording ? "text-status-error" : "text-[var(--accent-blue)]"} />
              <span className="text-[10px] font-bold tracking-widest uppercase text-center">
                {isRecording ? "Gravando..." : "Gravar Áudio"}
              </span>
            </button>
            <div className="relative w-full h-full">
              <input 
                type="file" 
                accept="image/*"
                capture="environment"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const url = URL.createObjectURL(e.target.files[0]);
                    setPhotos(prev => [...prev, url]);
                    trustLayer.emit({ type: 'success', title: 'Foto capturada e anexada.', status: 'synced' });
                  }
                }}
              />
              <div className="py-4 h-full rounded-xl border border-surface-700 bg-surface-800 text-white flex flex-col items-center justify-center gap-2 hover:bg-surface-700 transition-colors">
                <ImageIcon size={24} className="text-[var(--accent-green)]" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-center">Adicionar Foto</span>
              </div>
            </div>
          </div>

          {/* List of Photos and Audios */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 snap-x">
            {photos.map((src, i) => (
              <div key={i} className="relative min-w-[80px] w-20 h-20 rounded-lg overflow-hidden border border-surface-600 shrink-0 snap-start">
                <img src={src} alt="Evidência" className="w-full h-full object-cover" />
                <button onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:text-status-error">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {audioRecords.length > 0 && (
            <div className="mt-2 flex flex-col gap-2">
              {audioRecords.map((label, i) => (
                <div key={i} className="flex justify-between items-center bg-surface-800 p-2 rounded-lg border border-surface-700">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Mic size={14} className="text-[var(--accent-blue)]" />
                    {label}
                  </div>
                  <button onClick={() => setAudioRecords(prev => prev.filter((_, idx) => idx !== i))} className="text-text-tertiary hover:text-status-error">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================================
            BLOCOS 4, 5, 6: PEÇAS, SERVIÇOS E EXTRAS
        =========================================== */}
        {(() => {
          const renderList = (index: number, title: string, icon: React.ReactNode, colorClass: string, items: LineItem[], setter: React.Dispatch<React.SetStateAction<LineItem[]>>, defaultName: string) => {
            const sectionKey = `section-${index}`;
            const isCollapsed = collapsedSections[sectionKey] && items.length === 0;
            const toggleCollapse = () => setCollapsedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));

            return (
            <section className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
              <button 
                onClick={items.length === 0 ? toggleCollapse : undefined}
                className={cn("w-full p-4 flex items-center justify-between", items.length === 0 && "cursor-pointer active:bg-surface-800 transition-colors")}
              >
                <h2 className={`text-xs font-bold ${colorClass} uppercase tracking-widest flex items-center gap-2`}>
                  {icon} {index}. {title}
                  {items.length > 0 && <span className="bg-white/10 text-white text-[10px] font-mono px-1.5 py-0.5 rounded ml-1">{items.length}</span>}
                </h2>
                {items.length === 0 && (
                  <ChevronDown size={14} className={cn("text-text-tertiary transition-transform duration-200", isCollapsed && "-rotate-90")} />
                )}
              </button>
              
              {!isCollapsed && (
                <div className="px-4 pb-4">
                  <div className="flex flex-col gap-4 mb-4">
                    {items.map(item => (
                      <div key={item.id} className="flex flex-col gap-2 pb-4 border-b border-surface-800 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <input 
                            type="text" 
                            value={item.name} 
                            onChange={(e) => handleUpdateItem(setter, item.id, 'name', e.target.value)}
                            className="bg-transparent text-sm font-bold text-white outline-none w-full border-b border-transparent focus:border-surface-600 transition-colors"
                          />
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleAddItem(setter, item.name)} className="text-text-tertiary hover:text-white p-2">
                              <Copy size={16} />
                            </button>
                            <button onClick={() => handleRemoveItem(setter, item.id)} className="text-status-error opacity-50 hover:opacity-100 p-2">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col flex-1">
                            <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Qtd</span>
                            <input 
                              type="number" 
                              value={item.qty} 
                              onChange={(e) => handleUpdateItem(setter, item.id, 'qty', parseFloat(e.target.value) || 0)}
                              className="bg-surface-800 rounded p-2 text-white text-sm font-mono w-full outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
                              step="0.1"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Preço Unit.</span>
                            <input 
                              type="number" 
                              value={item.unitPrice} 
                              onChange={(e) => handleUpdateItem(setter, item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="bg-surface-800 rounded p-2 text-white text-sm font-mono w-full outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
                            />
                          </div>
                          <div className="flex flex-col items-end flex-1 pt-4">
                            <span className="text-sm font-black text-white">{formatBRL(item.qty * item.unitPrice)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => handleAddItem(setter, defaultName)} className="w-full py-3 bg-surface-800 text-[10px] font-bold tracking-widest uppercase text-text-secondary rounded-lg hover:text-white transition-colors flex justify-center items-center gap-2 active:scale-95">
                    <Plus size={14} /> Adicionar Item
                  </button>
                </div>
              )}
            </section>
          );
          };

          return (
            <>
              {renderList(4, 'Peças e Materiais', <Package size={16} />, 'text-[var(--accent-blue)]', materials, setMaterials, 'Nova Peça')}
              {renderList(5, 'Serviços e Mão de Obra', <Clock size={16} />, 'text-[var(--accent-yellow)]', labor, setLabor, 'Nova Mão de Obra')}
              {renderList(6, 'Custos Extras', <Truck size={16} />, 'text-text-tertiary', extras, setExtras, 'Taxa Extra')}
            </>
          );
        })()}

        {/* =========================================
            BLOCO 7: DESCONTOS
        =========================================== */}
        <section className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <h2 className="text-xs font-bold text-[var(--accent-green)] uppercase tracking-widest flex items-center gap-2 mb-4">
            <Tag size={16} /> 7. Descontos
          </h2>
          <div className="flex gap-4">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Percentual (%)</span>
              <input 
                type="number" 
                value={discountPercent} 
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                className="bg-surface-800 rounded p-3 text-white text-sm font-mono w-full outline-none focus:ring-1 focus:ring-[var(--accent-green)]"
                step="0.5"
              />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Valor Fixo (R$)</span>
              <input 
                type="number" 
                value={discountFixed} 
                onChange={(e) => setDiscountFixed(parseFloat(e.target.value) || 0)}
                className="bg-surface-800 rounded p-3 text-white text-sm font-mono w-full outline-none focus:ring-1 focus:ring-[var(--accent-green)]"
              />
            </div>
          </div>
          {discountValue > 0 && (
             <div className="mt-3 text-right">
               <span className="text-xs text-[var(--accent-green)] font-bold uppercase tracking-widest">Desconto Aplicado: -{formatBRL(discountValue)}</span>
             </div>
          )}
        </section>

        {/* =========================================
            BLOCO 8: IMPOSTOS
        =========================================== */}
        <section className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <h2 className="text-xs font-bold text-status-error uppercase tracking-widest flex items-center gap-2 mb-2">
            <FileText size={16} /> 8. Impostos Retidos
          </h2>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-text-secondary">ISS / ICMS (Auto 15%)</span>
            <span className="text-sm font-black text-status-error">+{formatBRL(taxesTotal)}</span>
          </div>
        </section>

        {/* =========================================
            BLOCO 9: RESUMO EXECUTIVO
        =========================================== */}
        <section className="bg-[var(--accent-blue)]/5 border border-[var(--accent-blue)]/30 rounded-xl p-6 mb-8 shadow-lg">
          <h2 className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-widest flex items-center justify-center gap-2 mb-6">
            <FileText size={14} /> 9. Resumo Executivo
          </h2>
          
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Subtotal Bruto:</span>
              <span className="font-mono">{formatBRL(rawSubTotal)}</span>
            </div>
            
            {discountValue > 0 && (
              <div className="flex justify-between text-sm text-[var(--accent-green)] font-bold">
                <span>Descontos Aplicados:</span>
                <span className="font-mono">-{formatBRL(discountValue)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm text-status-error font-bold">
              <span>Impostos (15%):</span>
              <span className="font-mono">+{formatBRL(taxesTotal)}</span>
            </div>

            <div className="flex justify-between text-xs text-text-tertiary mt-2 border-t border-surface-800 pt-3">
              <span>Margem Bruta Projetada:</span>
              <span className="font-mono">{formatBRL(marginTotal)} (30%)</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center border-t border-[var(--accent-blue)]/30 pt-6">
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">Total Final para o Cliente</span>
            <span className="text-4xl font-black text-[var(--accent-blue)] tracking-tighter">{formatBRL(grandTotal)}</span>
          </div>
        </section>

        {/* =========================================
            BLOCO 10: GERAÇÃO E AÇÕES FINAIS
        =========================================== */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button onClick={handleSaveDraft} className={cn("py-4 text-white font-bold text-[10px] tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 transition-colors", isInvalid ? "bg-surface-800 text-surface-600 border-surface-700" : "bg-surface-800 hover:bg-surface-700")}>
            <Save size={16} /> Salvar Rascunho
          </button>
          <button onClick={handleSendToClient} disabled={formData.status !== BUDGET_STATUS.INICIADO} className={cn("py-4 font-bold text-[10px] tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 transition-colors border", isInvalid || formData.status !== BUDGET_STATUS.INICIADO ? "bg-surface-800 text-surface-600 border-surface-700" : "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/30 hover:bg-[var(--accent-blue)]/20")}>
            <Send size={18} /> Enviar Assinatura
          </button>

          {id && formData.status === BUDGET_STATUS.ENVIADO && (
            <button onClick={handleAuthorize} className={cn("col-span-2 py-5 font-bold text-[10px] tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 transition-colors border bg-[var(--accent-green)]/10 text-[var(--accent-green)] border-[var(--accent-green)]/30 hover:bg-[var(--accent-green)]/20")}>
              <CheckCircle2 size={18} /> Autorizar e Gerar Ordem de Serviço
            </button>
          )}
        </div>

      </div>

      {/* =========================================
          RODAPÉ FIXO (STICKY FOOTER)
      =========================================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-900 border-t border-surface-800 p-4 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-widest">Total Proposta</span>
            <span className="text-xl font-black text-white tracking-tighter">{formatBRL(grandTotal)}</span>
          </div>
          
          <button 
            onClick={handleSaveDraft}
            className={cn("px-8 py-4 font-black text-xs tracking-widest uppercase rounded-xl transition-all", isInvalid ? "bg-surface-700 text-surface-500" : "bg-[var(--accent-blue)] text-[#050505] shadow-[0_0_20px_rgba(42,139,242,0.3)] hover:brightness-110 active:scale-95")}
          >
            SALVAR PROPOSTA
          </button>
        </div>
      </div>
    </div>
  );
};
