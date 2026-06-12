import React, { useState, useEffect } from 'react';
import { Camera, Mic, X, Check, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '../../../utils/ui';
import { Asset } from '../../../domain/asset';
import { AssetExecution } from '../../../domain/assetExecution';
import { checklistTemplateService } from '../../../services/ChecklistTemplateService';
import { 
  SurfaceCard, 
  SectionLabel, 
  Heading, 
  Eyebrow,
  Label,
  StatusPill,
  ERPLoader,
  Stack
} from '../../../ui/system';
import { PrimaryButton, SecondaryButton } from '../../../app/components/ui';

interface AnomalyCaptureProps {
  readonly assets: Asset[];
  readonly executions: Record<string, AssetExecution>;
  readonly selectedAsset: Asset | null;
  readonly onClose: () => void;
  readonly onSave: (anomalyData: {
    assetId?: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
    photoUuids?: string[];
  }) => void;
  readonly onSaveExecution: (assetId: string, execution: Partial<AssetExecution>) => Promise<void>;
}

/**
 * AnomalyCaptureBottomSheet: Refined for AFERIX MASTER CONSTITUTION.
 * Replaces legacy blueish gradients with Deep Premium Dark styling.
 */
export const AnomalyCaptureBottomSheet: React.FC<AnomalyCaptureProps> = ({
  assets,
  executions,
  selectedAsset,
  onClose,
  onSave,
  onSaveExecution,
}) => {
  const [activeAsset, setActiveAsset] = useState<Asset | null>(selectedAsset || assets[0] || null);
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'CRITICAL'>('MEDIUM');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Sync activeAsset if selectedAsset changes
  useEffect(() => {
    if (selectedAsset) {
      setActiveAsset(selectedAsset);
    }
  }, [selectedAsset]);

  const handleSave = () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    onSave({
      assetId: activeAsset?.id,
      description,
      severity,
      photoUuids: photos,
    });
  };

  const handleMarkAssetOk = async (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    const template = await checklistTemplateService.getTemplateForAsset(asset.category);
    const defaultChecklist = template.checklist.map(item => ({
      itemKey: item.key,
      description: item.description,
      status: 'compliant' as const
    }));
    await onSaveExecution(assetId, {
      checklistResults: defaultChecklist
    });
  };

  const handleMarkAssetFail = async (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    const template = await checklistTemplateService.getTemplateForAsset(asset.category);
    const defaultChecklist = template.checklist.map(item => ({
      itemKey: item.key,
      description: item.description,
      status: 'non-compliant' as const
    }));
    await onSaveExecution(assetId, {
      checklistResults: defaultChecklist
    });
    setActiveAsset(asset);
  };

  const toggleRecording = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setDescription(prev => (prev ? prev + ' ' : '') + 'Anomalia detectada: desgaste excessivo nos componentes.');
        setIsRecording(false);
      }, 1500);
    }
  };

  return (
    <>
      {/* Premium Backdrop Blur Overlay */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1100] animate-fade-in" onClick={onClose}></div>
      
      {/* Aferix-Style Bottom Sheet Card */}
      <div className="fixed bottom-0 md:bottom-6 left-1/2 -translate-x-1/2 w-full md:w-[calc(100%-32px)] max-w-md bg-[#07080A] border border-white/[0.1] rounded-t-[40px] md:rounded-[40px] z-[1200] animate-slide-up shadow-[0_40px_100px_rgba(0,0,0,1)] backdrop-blur-3xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-7 pb-4 scrollbar-none">
          {/* Decorative Top Grab Handle */}
          <div className="w-12 h-1.5 bg-white/5 rounded-full mx-auto mb-8" />

          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-2">
              <Eyebrow className="!text-[#E85D5D] tracking-[0.4em] font-black opacity-90">DIAGNÓSTICO_CRÍTICO</Eyebrow>
              <h2 className="text-[32px] font-black text-white leading-[0.95] tracking-tight uppercase">Registrar Falha</h2>
            </div>
            <button 
              onClick={onClose} 
              className="w-12 h-12 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-full text-white/20 hover:text-white transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* 1. TICKAR ATIVOS SECTION */}
          <SectionLabel className="mb-4 ml-1">MALHA DE ATIVOS DA O.S.</SectionLabel>
          <SurfaceCard padding="none" className="mb-8 border-white/[0.05] overflow-hidden bg-white/[0.01]">
            <div className="max-h-[280px] overflow-y-auto scrollbar-none">
              {assets.map((asset, idx) => {
                const ex = executions[asset.id];
                const checklistResults = ex?.checklistResults || [];
                const hasPending = checklistResults.length === 0 || checklistResults.some(r => r.status === 'pending');
                const hasFailure = checklistResults.some(r => r.status === 'non-compliant');
                const isDone = !hasPending;
                const isActive = activeAsset?.id === asset.id;

                return (
                  <div 
                    key={asset.id}
                    className={cn(
                      "flex items-center justify-between p-5 border-b border-white/[0.04] last:border-0 transition-all cursor-pointer",
                      isActive ? "bg-white/[0.04]" : "bg-transparent hover:bg-white/[0.02]"
                    )}
                    onClick={() => setActiveAsset(asset)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-[12px] border",
                        isDone && !hasFailure ? "bg-[#47C46A]/10 text-[#47C46A] border-[#47C46A]/20" :
                        isDone && hasFailure ? "bg-[#E85D5D]/10 text-[#E85D5D] border-[#E85D5D]/20" :
                        "bg-white/[0.05] text-white/10 border-white/[0.05]"
                      )}>
                        {isDone && !hasFailure ? <CheckCircle2 size={18} /> : 
                        isDone && hasFailure ? <AlertTriangle size={18} /> : 
                        (idx + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[14px] font-black text-white truncate uppercase tracking-tight leading-none">{asset.name}</span>
                        <span className="text-[9px] text-white/20 font-bold truncate uppercase tracking-widest mt-1.5">{asset.tag || 'ID_DESC'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAssetOk(asset.id); }}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 shadow-xl",
                          isDone && !hasFailure 
                            ? "bg-[#47C46A] text-black border-transparent" 
                            : "bg-white/[0.02] border-white/[0.08] text-white/20 hover:text-[#47C46A] hover:bg-[#47C46A]/10"
                        )}
                      >
                        <Check size={16} strokeWidth={3} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAssetFail(asset.id); }}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 shadow-xl",
                          isDone && hasFailure 
                            ? "bg-[#E85D5D] text-white border-transparent" 
                            : "bg-white/[0.02] border-white/[0.08] text-white/20 hover:text-[#E85D5D] hover:bg-[#E85D5D]/10"
                        )}
                      >
                        <AlertTriangle size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </SurfaceCard>

          {/* 2. FAILURE DETAILS */}
          {activeAsset && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-5 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E85D5D] animate-pulse" />
                <SectionLabel className="!mb-0 uppercase tracking-[0.3em]">Detalhamento Técnico: {activeAsset.name}</SectionLabel>
              </div>

              <div className="flex flex-col gap-6">
                {/* Premium Photo Upload */}
                <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      capture="environment"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const url = URL.createObjectURL(e.target.files[0]);
                          setPhotos(prev => [...prev, url]);
                        }
                      }}
                    />
                    <SurfaceCard className="h-32 bg-white/[0.02] hover:bg-white/[0.04] border-dashed border-white/10 flex flex-col items-center justify-center gap-3 transition-all group-active:scale-[0.98]">
                      <div className="w-11 h-11 rounded-full bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex items-center justify-center text-[#0A84FF] group-hover:scale-110 transition-transform">
                        <Camera size={20} />
                      </div>
                      <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Registrar Evidência</span>
                    </SurfaceCard>
                </div>

                {/* Photos Horizontal Scroll */}
                {photos.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                    {photos.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/20 shrink-0 shadow-2xl">
                        <img src={src} alt="Evidência" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-black/80 rounded-full w-5 h-5 flex items-center justify-center text-white/80"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Description & Voice */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center px-1">
                      <Label className="!text-[10px] opacity-40">O que foi identificado?</Label>
                      <button 
                        onClick={toggleRecording}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border",
                          isRecording 
                            ? "bg-[#E85D5D]/20 border-[#E85D5D]/40 text-[#E85D5D] animate-pulse" 
                            : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white"
                        )}
                      >
                        <Mic size={11} /> {isRecording ? 'Capturando...' : 'Ditar Nota'}
                      </button>
                    </div>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Descreva a anomalia observada..."
                      className="w-full h-24 bg-white/[0.02] border border-white/[0.08] focus:border-[var(--accent-gold)]/40 rounded-[20px] p-4 text-[14px] text-white placeholder:text-white/10 focus:outline-none resize-none transition-all shadow-inner"
                    />
                </div>

                {/* Severity Toggles */}
                <div className="flex flex-col gap-4">
                    <Label className="!text-[10px] opacity-40 ml-1">GRAU DE SEVERIDADE</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'LOW', label: 'BAIXA', color: 'bg-[var(--accent-gold)]', glow: 'shadow-[0_8px_20px_rgba(212,169,74,0.25)]' },
                        { id: 'MEDIUM', label: 'MÉDIA', color: 'bg-amber-500', glow: 'shadow-[0_8px_20px_rgba(245,158,11,0.25)]' },
                        { id: 'CRITICAL', label: 'CRÍTICA', color: 'bg-[#E85D5D]', glow: 'shadow-[0_8px_20px_rgba(255,92,92,0.25)]' }
                      ].map(opt => (
                        <button 
                          key={opt.id}
                          onClick={() => setSeverity(opt.id as any)}
                          className={cn(
                            "py-4 rounded-[18px] text-[10px] font-black tracking-[0.15em] uppercase transition-all active:scale-[0.95] border",
                            severity === opt.id 
                              ? `${opt.color} text-black border-transparent ${opt.glow}` 
                              : 'bg-white/[0.01] border-white/[0.06] text-white/30 hover:bg-white/[0.03]'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div 
          className="shrink-0 p-7 pt-4 bg-[#07080A]/90 backdrop-blur-2xl border-t border-white/[0.05]"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
        >
          <div className="flex gap-4">
            <SecondaryButton onClick={onClose} className="flex-1 py-4 !rounded-2xl text-[11px] tracking-[0.2em] uppercase">
              Cancelar
            </SecondaryButton>
            <PrimaryButton 
              onClick={handleSave}
              disabled={!activeAsset}
              className="flex-1 py-4 !rounded-2xl text-[11px] tracking-[0.2em] uppercase shadow-[var(--glow-gold)]"
            >
              <Check size={18} strokeWidth={3} className="mr-1" /> Salvar Falha
            </PrimaryButton>
          </div>
        </div>
      </div>
    </>
  );
};

