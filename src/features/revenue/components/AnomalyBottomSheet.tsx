import React, { useState } from 'react';
import { Camera, Mic, X } from 'lucide-react';
import { PrimaryButton, Input, Select } from '../../../app/components/ui';

interface AnomalyBottomSheetProps {
  itemKey: string;
  itemDescription: string;
  onSave: (anomalyData: { title: string; description: string; recommendedAction: string; severity: 'low'|'medium'|'high'|'critical' }) => void;
  onClose: () => void;
}

export const AnomalyBottomSheet: React.FC<AnomalyBottomSheetProps> = ({ itemKey, itemDescription, onSave, onClose }) => {
  const [description, setDescription] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [severity, setSeverity] = useState<'low'|'medium'|'high'|'critical'>('medium');

  const handleSave = () => {
    onSave({
      title: `Falha: ${itemDescription}`,
      description,
      recommendedAction,
      severity
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
          <button className="flex-1 bg-surface-800 border border-surface-700 rounded-2xl py-6 flex flex-col items-center justify-center gap-2 active:bg-surface-700 transition-colors">
            <Camera size={32} className="text-[var(--accent-blue)]" />
            <span className="text-xs font-bold text-text-secondary">FOTOGRAFAR</span>
          </button>
          <button className="flex-1 bg-surface-800 border border-surface-700 rounded-2xl py-6 flex flex-col items-center justify-center gap-2 active:bg-surface-700 transition-colors">
            <Mic size={32} className="text-[var(--accent-purple)]" />
            <span className="text-xs font-bold text-text-secondary">DITAR ÁUDIO</span>
          </button>
        </div>

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
            onChange={e => setSeverity(e.target.value as any)}
            options={[
              { value: 'low', label: 'Baixa (Monitorar)' },
              { value: 'medium', label: 'Média (Programar reparo)' },
              { value: 'high', label: 'Alta (Risco operacional)' },
              { value: 'critical', label: 'Crítica (Parada imediata)' }
            ]}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-bold text-text-secondary bg-surface-800 active:bg-surface-700">
            CANCELAR
          </button>
          <PrimaryButton onClick={handleSave} className="flex-1 py-4 rounded-2xl shadow-[0_0_20px_rgba(212,169,78,0.3)]">
            SALVAR FALHA
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
