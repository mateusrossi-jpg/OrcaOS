import { generateUUID } from '../../../core/utils/idGenerator';
import React, { useState, useEffect, useRef } from 'react';
import { 
  ScreenContainer, 
  SurfaceCard, 
  SectionLabel, 
  InteractiveRow, 
  Title, 
  Body, 
  AppHeader,
  GlassInput,
  GlassTextarea,
  GlassVoiceInput,
  GlassFormCard,
  Label,
  Section,
  ExecutiveHeader,
  Stack,
  OpsChip,
  Eyebrow
} from '../../../ui/system';
import { PrimaryButton, Select, SecondaryButton } from '../../../app/components/ui';
import { AssetExecution, ChecklistItemResult } from '../../../domain/assetExecution';
import { Check, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, HelpCircle, ClipboardCheck, Camera, RefreshCw } from 'lucide-react';
import { AnomalyBottomSheet } from '../../revenue/components/AnomalyBottomSheet';
import { db } from '../../../storage/dexieDatabase';
const generateId = () => generateUUID();
import { cn } from '../../../utils/ui';

interface ChecklistTemplateItem {
  key: string;
  description: string;
}

interface MeasurementTemplate {
  key: string;
  label: string;
  unit: string;
}

interface ChecklistExecutionPanelProps {
  assetName: string;
  initialExecution: Partial<AssetExecution>;
  templateItems: ChecklistTemplateItem[];
  measurementTemplates: MeasurementTemplate[];
  onClose: () => void;
  onSave: (execution: Partial<AssetExecution>) => void;
  workOrder?: any;
}

/**
 * ChecklistExecutionPanel (V31): Tactical Technical Procedure.
 * Restructured for sequential clarity and high-performance field use.
 * Aligned with AFERIX HOME & REVENUE premium design language.
 */
export const ChecklistExecutionPanel: React.FC<ChecklistExecutionPanelProps> = ({
  assetName,
  initialExecution,
  templateItems,
  measurementTemplates,
  onClose,
  onSave,
  workOrder
}) => {
  const [measurements, setMeasurements] = useState<Record<string, any>>(initialExecution.measurements || {});
  
  const [checklist, setChecklist] = useState<ChecklistItemResult[]>(() => {
    if (initialExecution.checklistResults && initialExecution.checklistResults.length > 0) {
      return initialExecution.checklistResults;
    }
    return templateItems.map(item => ({
      itemKey: item.key,
      description: item.description,
      status: 'pending' 
    }));
  });

  const [activeAnomalyItem, setActiveAnomalyItem] = useState<ChecklistItemResult | null>(null);

  // Auto-save logic
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      const timer = setTimeout(() => {
        onSave({
          ...initialExecution,
          measurements,
          checklistResults: checklist
        });
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [measurements, checklist]);

  const updateMeasurement = (key: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [key]: value }));
  };

  const updateChecklistItem = (key: string, status: 'compliant' | 'non-compliant' | 'na') => {
    if (navigator.vibrate) navigator.vibrate(40);
    
    if (status === 'non-compliant' && !activeAnomalyItem) {
      const item = checklist.find(i => i.itemKey === key);
      if (item) setActiveAnomalyItem(item);
    }
    
    setChecklist(prev => prev.map(item => {
      if (item.itemKey === key) {
        return { ...item, status };
      }
      return item;
    }));
  };

  const handleSaveAnomaly = async (anomalyData: any) => {
    if (!activeAnomalyItem) return;
    
    const anomaly = {
      id: generateId(),
      companyId: workOrder?.companyId || 'default',
      workspaceId: workOrder?.workspaceId || 'default',
      clientId: workOrder?.clientId || 'default',
      siteId: workOrder?.siteId || 'default',
      assetId: initialExecution.assetId || 'default',
      workOrderId: initialExecution.workOrderId,
      assetExecutionId: initialExecution.id || 'default',
      title: anomalyData.title,
      description: anomalyData.description || '',
      recommendedAction: anomalyData.recommendedAction || '',
      severity: (anomalyData.severity?.toLowerCase() || 'medium') as any,
      status: 'OPEN' as const,
      photoUuids: anomalyData.photoUuids || [],
      createdBy: 'current-tech',
      createdAt: new Date().toISOString()
    };
    
    await db.anomalies.put(anomaly as any);

    setChecklist(prev => prev.map(item => {
      if (item.itemKey === activeAnomalyItem.itemKey) {
        return { ...item, notes: anomalyData.description || 'Falha registrada.' };
      }
      return item;
    }));

    setActiveAnomalyItem(null);
  };

  const handleTudoConforme = () => {
    if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
    setChecklist(prev => prev.map(item => ({ ...item, status: 'compliant' })));
  };

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-aferix-bg animate-in slide-in-from-right-6 duration-500 overflow-hidden">
      {/* Dynamic Background Atmospheric Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#161B29]/20 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />
      <div className="absolute bottom-[10%] left-[-20%] w-[60%] h-[40%] bg-[var(--accent-gold)]/2 pointer-events-none blur-[100px] z-0" />

      {/* ── HEADER ── */}
      <div className="relative z-10 w-full shrink-0">
        <div className="w-full max-w-md mx-auto">
          <AppHeader title={assetName} subtitle="Procedimento Técnico de Campo" onBack={onClose} standalone />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto relative z-10 scrollbar-none">
        <div className="flex flex-col p-6 space-y-12 max-w-md mx-auto w-full pb-48">
          
          {/* ━━━ MISSION OVERVIEW ━━━ */}
          <Section className="gap-6 animate-fade-in">
             <div className="bg-[#121520]/50 border border-white/10 rounded-[32px] p-8 relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--accent-gold)]/5 rounded-full blur-[40px] pointer-events-none" />
                <Stack className="gap-2">
                   <Eyebrow className="!text-[var(--accent-gold)] tracking-[0.4em] font-black opacity-80 leading-none uppercase">Status_da_Vistoria</Eyebrow>
                   <h2 className="text-[24px] font-black text-white uppercase leading-none tracking-tight">{assetName}</h2>
                   <div className="flex items-center gap-3 mt-2">
                      <OpsChip label={`${checklist.length} Checkpoints`} tone="info" />
                      <OpsChip label={`${Object.keys(measurements).length} Coletas`} tone="neutral" />
                   </div>
                </Stack>
             </div>
          </Section>

          {/* ━━━ QUICK ACTION: ALL COMPLIANT ━━━ */}
          <button
            onClick={handleTudoConforme}
            className="w-full relative overflow-hidden bg-white/[0.02] border border-white/[0.08] p-8 rounded-[40px] active:scale-[0.97] transition-all flex flex-col items-center justify-center gap-6 shadow-[0_40px_80px_rgba(0,0,0,0.6)] group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#47C46A]/5 blur-[80px] rounded-full pointer-events-none transition-all group-hover:bg-[#47C46A]/10" />
            <div className="w-18 h-18 rounded-3xl bg-[#47C46A] text-black flex items-center justify-center shadow-[0_0_40px_rgba(53,199,89,0.4)] transition-transform group-hover:scale-110">
              <Check size={42} strokeWidth={4} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[20px] font-black tracking-tight text-white uppercase">Aprovação Master</span>
              <span className="text-[11px] font-black text-[#47C46A] uppercase tracking-[0.3em] opacity-60">Marcar Tudo como OK</span>
            </div>
          </button>

          {/* ━━━ SECTION: FIELD MEASUREMENTS ━━━ */}
          {measurementTemplates.length > 0 && (
            <Section className="gap-6">
              <div className="flex items-center gap-2 px-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
                 <SectionLabel className="!mb-0 uppercase tracking-widest text-white/40">Dados de Performance</SectionLabel>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {measurementTemplates.map(m => (
                  <SurfaceCard key={m.key} className="bg-white/[0.02] border border-white/[0.06] p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-gold)]/2 rounded-full blur-[30px] group-focus-within:bg-[var(--accent-gold)]/10 transition-all" />
                     <div className="flex justify-between items-center">
                        <Label className="text-white/30 uppercase tracking-[0.2em] font-black text-[10px]">{m.label}</Label>
                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest">{m.unit}</span>
                     </div>
                     <input
                        type="number"
                        placeholder="0.00"
                        value={measurements[m.key] || ''}
                        onChange={e => updateMeasurement(m.key, e.target.value)}
                        className="bg-transparent text-[42px] font-black text-white focus:outline-none w-full placeholder:text-white/5 tracking-tighter leading-none"
                     />
                  </SurfaceCard>
                ))}
              </div>
            </Section>
          )}

          {/* ━━━ SECTION: PROCEDURES ━━━ */}
          <Section className="gap-6">
            <div className="flex items-center gap-2 px-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#0A84FF]" />
                 <SectionLabel className="!mb-0 uppercase tracking-widest text-white/40">Fila de Procedimentos</SectionLabel>
            </div>
            <div className="flex flex-col gap-5">
              {checklist.map((item, idx) => {
                const isCompliant = item.status === 'compliant';
                const isFailed = item.status === 'non-compliant';
                const isNA = item.status === 'na';

                return (
                  <SurfaceCard key={item.itemKey} padding="none" className={cn(
                    "flex flex-col transition-all duration-500 overflow-hidden shadow-xl",
                    isCompliant ? "border-[#47C46A]/40 bg-[#47C46A]/[0.02]" : 
                    isFailed ? "border-[#E85D5D]/40 bg-[#E85D5D]/[0.02]" :
                    "bg-[#15181D]/40 border border-white/[0.05]"
                  )}>
                    <div className="p-8 flex flex-col gap-8">
                       <div className="flex justify-between items-start gap-5">
                          <div className="flex gap-5 min-w-0">
                             <div className={cn(
                               "w-10 h-10 rounded-xl border flex items-center justify-center text-[12px] font-black shrink-0 mt-0.5 transition-colors",
                               isCompliant ? "bg-[#47C46A]/10 border-[#47C46A]/30 text-[#47C46A]" :
                               isFailed ? "bg-[#E85D5D]/10 border-[#E85D5D]/30 text-[#E85D5D]" :
                               "bg-white/5 border-white/10 text-white/20"
                             )}>
                                {(idx + 1).toString().padStart(2, '0')}
                             </div>
                             <span className={cn(
                                "text-[17px] font-black leading-[1.2] tracking-tight uppercase",
                                isCompliant ? "text-[#47C46A]" : isFailed ? "text-[#E85D5D]" : "text-white/90"
                             )}>{item.description}</span>
                          </div>
                          {isCompliant && <CheckCircle2 size={28} className="text-[#47C46A] shrink-0" />}
                          {isFailed && <AlertTriangle size={28} className="text-[#E85D5D] shrink-0 animate-pulse" />}
                       </div>

                       <div className="flex gap-4">
                          <button 
                            className={cn(
                              "flex-[1.5] h-16 text-[11px] font-black rounded-2xl tracking-[0.2em] transition-all uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md",
                              isCompliant ? 'bg-[#47C46A] text-black scale-[1.03] shadow-[0_10px_30px_rgba(53,199,89,0.3)]' : 'bg-white/[0.04] border border-white/[0.1] text-white/40 hover:text-white'
                            )}
                            onClick={() => updateChecklistItem(item.itemKey, 'compliant')}
                          >
                            <Check size={18} strokeWidth={4} /> OK
                          </button>
                          <button 
                            className={cn(
                              "flex-[1.5] h-16 text-[11px] font-black rounded-2xl tracking-[0.2em] transition-all uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md",
                              isFailed ? 'bg-[#E85D5D] text-white scale-[1.03] shadow-[0_10px_30px_rgba(255,92,92,0.3)]' : 'bg-white/[0.04] border border-white/[0.1] text-white/40 hover:text-white'
                            )}
                            onClick={() => updateChecklistItem(item.itemKey, 'non-compliant')}
                          >
                            <AlertTriangle size={18} /> FALHA
                          </button>
                          <button 
                            className={cn(
                              "flex-1 h-16 text-[11px] font-black rounded-2xl tracking-[0.2em] transition-all uppercase flex items-center justify-center cursor-pointer",
                              isNA ? 'bg-white/20 text-white' : 'bg-white/[0.02] border border-white/[0.05] text-white/10'
                            )}
                            onClick={() => updateChecklistItem(item.itemKey, 'na')}
                          >
                            N/A
                          </button>
                       </div>
                       
                       {isFailed && item.notes && (
                         <div className="animate-in slide-in-from-top-2 duration-300">
                           <div className="bg-[#E85D5D]/10 border border-[#E85D5D]/20 rounded-2xl p-6 flex flex-col gap-3 shadow-inner">
                             <div className="flex items-center gap-2">
                                <AlertTriangle size={14} className="text-[#E85D5D]" />
                                <span className="text-[10px] font-black text-[#E85D5D] uppercase tracking-widest">Diagnóstico de Anomalia</span>
                             </div>
                             <p className="text-[14px] text-white/90 font-medium italic leading-relaxed">"{item.notes}"</p>
                           </div>
                         </div>
                       )}
                    </div>
                  </SurfaceCard>
                );
              })}
            </div>
          </Section>
        </div>
      </div>

      {/* ── AUTHORITATIVE FOOTER ── */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-[60] bg-aferix-bg/80 backdrop-blur-3xl border-t border-white/[0.05]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
      >
        <div className="px-6 py-6 max-w-md mx-auto">
          <button 
            id="btn-save-voltar"
            onClick={() => { if (navigator.vibrate) navigator.vibrate(60); onClose(); }}
            className="w-full h-20 bg-[var(--accent-gold)] text-black font-black text-[14px] uppercase tracking-[0.3em] rounded-[28px] shadow-[0_25px_60px_rgba(212,169,74,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group cursor-pointer"
          >
            CONCLUIR VISTORIA
            <ChevronRight size={24} strokeWidth={4} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {activeAnomalyItem && (
        <AnomalyBottomSheet
          itemKey={activeAnomalyItem.itemKey}
          itemDescription={activeAnomalyItem.description}
          onClose={() => setActiveAnomalyItem(null)}
          onSave={handleSaveAnomaly}
        />
      )}
    </div>
  );
};
