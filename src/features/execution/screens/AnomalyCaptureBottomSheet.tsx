import React, { useState } from 'react';
import { Camera, Mic, AlertOctagon, X, Check } from 'lucide-react';

interface AnomalyCaptureProps {
  readonly assetName: string;
  readonly onClose: () => void;
  readonly onSave: () => void;
}

export const AnomalyCaptureBottomSheet: React.FC<AnomalyCaptureProps> = ({ assetName, onClose, onSave }) => {
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'CRITICAL' | null>(null);

  const handleSave = () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    onSave();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/80 z-50 animate-fade-in" onClick={onClose}></div>
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-900 rounded-t-3xl z-50 p-6 animate-slide-up pb-10 shadow-2xl border-t border-surface-700">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-white uppercase tracking-widest text-status-error">Registrar Falha</h2>
            <span className="text-[10px] text-text-tertiary">{assetName}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-surface-800 rounded-full text-text-secondary">
            <X size={16} />
          </button>
        </div>

        {/* Câmera Rápida (Placeholder de Botão Gigante) */}
        <button className="w-full h-32 bg-surface-800 border-2 border-dashed border-surface-600 rounded-xl flex flex-col items-center justify-center gap-2 mb-4 hover:bg-surface-700 transition-colors active:scale-95">
          <Camera size={32} className="text-[var(--accent-blue)]" />
          <span className="text-xs font-bold text-white tracking-widest uppercase">Tirar Foto (Obrigatório)</span>
        </button>

        {/* Áudio (Opcional) */}
        <button className="w-full bg-surface-800 rounded-xl p-4 flex items-center gap-3 mb-6 hover:bg-surface-700 transition-colors active:scale-95">
          <div className="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center">
            <Mic size={20} className="text-[var(--accent-yellow)]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-white">Gravar Áudio (Opcional)</span>
            <span className="text-[10px] text-text-tertiary">Descreva o problema em vez de digitar</span>
          </div>
        </button>

        {/* Severidade */}
        <div className="mb-8">
          <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-3">Severidade</h3>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setSeverity('LOW')}
              className={`py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors ${severity === 'LOW' ? 'bg-[var(--accent-yellow)] text-[#050505]' : 'bg-surface-800 text-text-secondary border border-surface-700'}`}
            >
              Baixa
            </button>
            <button 
              onClick={() => setSeverity('MEDIUM')}
              className={`py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors ${severity === 'MEDIUM' ? 'bg-[var(--accent-orange)] text-[#050505]' : 'bg-surface-800 text-text-secondary border border-surface-700'}`}
            >
              Média
            </button>
            <button 
              onClick={() => setSeverity('CRITICAL')}
              className={`py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-1 ${severity === 'CRITICAL' ? 'bg-status-error text-white' : 'bg-surface-800 text-text-secondary border border-surface-700'}`}
            >
              <AlertOctagon size={14} /> Alta
            </button>
          </div>
        </div>

        {/* Salvar */}
        <button 
          onClick={handleSave}
          disabled={!severity}
          className={`w-full py-5 rounded-xl flex items-center justify-center gap-2 font-black text-sm tracking-widest uppercase transition-all shadow-lg ${severity ? 'bg-white text-[#050505] active:scale-95' : 'bg-surface-800 text-text-tertiary cursor-not-allowed'}`}
        >
          <Check size={20} />
          Salvar Anomalia
        </button>
      </div>
    </>
  );
};
