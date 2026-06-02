import React, { useState } from 'react';
import { Camera, Mic, X } from 'lucide-react';
import { PrimaryButton, Input, Select } from '../../../app/components/ui';

interface AnomalyBottomSheetProps {
  itemKey: string;
  itemDescription: string;
  onSave: (anomalyData: { title: string; description: string; recommendedAction: string; severity: 'low'|'medium'|'high'|'critical'; photoUuids: string[] }) => void;
  onClose: () => void;
}

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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-900 w-full max-w-md rounded-t-[32px] p-6 animate-slide-up border-t border-surface-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-white font-black text-xl">Registrar Anomalia</h3>
            <p className="text-status-error text-sm font-bold mt-1">{itemDescription}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-surface-800 rounded-full text-text-secondary active:bg-surface-700">
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <input 
              type="file" 
              accept="image/*"
              capture="environment"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const url = URL.createObjectURL(e.target.files[0]);
                  setPhotos(prev => [...prev, url]);
                }
              }}
            />
            <div className="bg-surface-800 border border-surface-700 rounded-2xl py-6 flex flex-col items-center justify-center gap-2 transition-colors">
              <Camera size={32} className="text-[var(--accent-blue)]" />
              <span className="text-xs font-bold text-text-secondary">FOTOGRAFAR</span>
            </div>
          </div>
          <button className="flex-1 bg-surface-800 border border-surface-700 rounded-2xl py-6 flex flex-col items-center justify-center gap-2 active:bg-surface-700 transition-colors">
            <Mic size={32} className="text-[var(--accent-purple)]" />
            <span className="text-xs font-bold text-text-secondary">DITAR ÁUDIO</span>
          </button>
        </div>

        {photos.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 snap-x">
            {photos.map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-surface-600 shrink-0 snap-start">
                <img src={src} alt="Evidência" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <Input 
            label="Descrição do Problema (Opcional se ditar/foto)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Vazamento de óleo no cárter"
          />
          <Input 
            label="Ação Recomendada (Para Orçamento)"
            value={recommendedAction}
            onChange={e => setRecommendedAction(e.target.value)}
            placeholder="Ex: Troca de junta e refil de óleo"
          />
          <Select
            label="Gravidade"
            value={severity}
            onChange={val => setSeverity(val as any)}
          >
            <option value="low">Baixa (Monitorar)</option>
            <option value="medium">Média (Programar reparo)</option>
            <option value="high">Alta (Risco operacional)</option>
            <option value="critical">Crítica (Parada imediata)</option>
          </Select>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-bold text-text-secondary bg-surface-800 active:bg-surface-700">
            CANCELAR
          </button>
          <PrimaryButton onClick={handleSave} className="flex-1 py-4 rounded-2xl shadow-[var(--glow-gold)]">
            SALVAR FALHA
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
