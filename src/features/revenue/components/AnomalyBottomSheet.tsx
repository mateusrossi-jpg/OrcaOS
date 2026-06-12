import React, { useState } from 'react';
import { Camera, Mic, X, Check, AlertTriangle } from 'lucide-react';
import { 
  GlassInput, 
  GlassSelect,
  SurfaceCard,
  Eyebrow,
  SectionLabel,
  Label
} from '../../../ui/system';
import { PrimaryButton, SecondaryButton } from '../../../app/components/ui';
import { cn } from '../../../utils/ui';

interface AnomalyBottomSheetProps {
  itemKey: string;
  itemDescription: string;
  onSave: (anomalyData: { title: string; description: string; recommendedAction: string; severity: 'low'|'medium'|'high'|'critical'; photoUuids: string[] }) => void;
  onClose: () => void;
}

/**
 * AnomalyBottomSheet: Refined for AFERIX MASTER CONSTITUTION.
 * Aligned with the premium execution workflow.
 */
export const AnomalyBottomSheet: React.FC<AnomalyBottomSheetProps> = ({ itemKey, itemDescription, onSave, onClose }) => {
  const [description, setDescription] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [severity, setSeverity] = useState<'low'|'medium'|'high'|'critical'>('medium');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleSave = () => {
    onSave({
      title: `Falha: ${itemDescription}`,
      description,
      recommendedAction,
      severity,
      photoUuids: photos
    });
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="bg-[#07080A] border border-white/[0.1] w-full max-w-md rounded-t-[40px] animate-slide-up shadow-[0_40px_100px_rgba(0,0,0,1)] backdrop-blur-3xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 pb-4 scrollbar-none">
          <div className="w-12 h-1.5 bg-white/5 rounded-full mx-auto mb-8" />
          
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-2">
              <Eyebrow className="!text-[#E85D5D] tracking-[0.4em] font-black opacity-90">ITEM_NÃO_CONFORME</Eyebrow>
              <h3 className="text-[32px] font-black text-white leading-[0.95] tracking-tight uppercase">Registrar Falha</h3>
              <p className="text-[#E85D5D] text-[11px] font-bold mt-1 uppercase tracking-widest opacity-60">{itemDescription}</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-12 h-12 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-full text-white/20 hover:text-white transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Camera and Audio Controls */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative group">
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
              <SurfaceCard className="bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] py-6 flex flex-col items-center justify-center gap-3 transition-all active:scale-95">
                <Camera size={24} className="text-[#0A84FF]" />
                <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Fotografar</span>
              </SurfaceCard>
            </div>
            <button 
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(50);
                setDescription(prev => (prev ? prev + ' ' : '') + 'Falha crítica identificada durante inspeção visual.');
              }}
              className="flex-1 group active:scale-95 transition-all"
            >
              <SurfaceCard className="bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] py-6 flex flex-col items-center justify-center gap-3">
                <Mic size={24} className="text-[var(--accent-gold)]" />
                <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Ditar Nota</span>
              </SurfaceCard>
            </button>
          </div>

          {photos.length > 0 && (
            <div className="mb-8 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {photos.map((src, i) => (
                <div key={i} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/20 shrink-0 shadow-2xl">
                  <img src={src} alt="Evidência" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/80 rounded-full w-5 h-5 flex items-center justify-center text-white/70 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-6 mb-4">
            <GlassInput 
              label="DESCRIÇÃO DA ANOMALIA"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Vazamento de óleo no compressor"
            />
            <GlassInput 
              label="AÇÃO RECOMENDADA"
              value={recommendedAction}
              onChange={e => setRecommendedAction(e.target.value)}
              placeholder="Ex: Substituição de junta e carga de gás"
            />
            
            <div className="flex flex-col gap-3">
              <Label className="!text-[10px] opacity-40 ml-1 uppercase tracking-widest">GRAVIDADE OPERACIONAL</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'low', label: 'BAIXA', color: 'bg-[var(--accent-gold)]' },
                  { id: 'medium', label: 'MÉDIA', color: 'bg-amber-500' },
                  { id: 'high', label: 'ALTA', color: 'bg-[#E85D5D]' },
                  { id: 'critical', label: 'CRÍTICA', color: 'bg-[#E85D5D]' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setSeverity(opt.id as any)}
                    className={cn(
                      "py-4 rounded-[18px] text-[10px] font-black tracking-[0.15em] uppercase transition-all active:scale-[0.95] border",
                      severity === opt.id 
                        ? `${opt.color} text-black border-transparent shadow-xl` 
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

        {/* Sticky Action Footer */}
        <div 
          className="shrink-0 p-8 pt-4 bg-[#07080A]/90 backdrop-blur-2xl border-t border-white/[0.05]"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
        >
          <div className="flex gap-4">
            <SecondaryButton onClick={onClose} className="flex-1 py-4 !rounded-2xl text-[11px] tracking-[0.2em] uppercase">
              Cancelar
            </SecondaryButton>
            <PrimaryButton 
              onClick={handleSave} 
              className="flex-1 py-4 !rounded-2xl text-[11px] tracking-[0.2em] uppercase shadow-[var(--glow-gold)]"
            >
              <Check size={18} strokeWidth={3} className="mr-1" /> Salvar Falha
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

