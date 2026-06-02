import React, { useState, useEffect, useRef } from 'react';
import { ScreenContainer, SurfaceCard, SectionLabel, InteractiveRow, Title, Body, AppHeader } from '../../../ui/system';
import { Input, PrimaryButton, Select, SecondaryButton } from '../../../app/components/ui';
import { AssetExecution, ChecklistItemResult } from '../../../domain/assetExecution';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnomalyBottomSheet } from '../../revenue/components/AnomalyBottomSheet';
import { db } from '../../../storage/dexieDatabase';
import { generateId } from '../../../app/components/ui';

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
  onNext?: () => void;
  onPrevious?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const ChecklistExecutionPanel: React.FC<ChecklistExecutionPanelProps> = ({
  assetName,
  initialExecution,
  templateItems,
  measurementTemplates,
  onClose,
  onSave,
  onNext,
  onPrevious,
  isFirst,
  isLast
}) => {
  const [measurements, setMeasurements] = useState<Record<string, any>>(initialExecution.measurements || {});
  
  const [checklist, setChecklist] = useState<ChecklistItemResult[]>(() => {
    if (initialExecution.checklistResults && initialExecution.checklistResults.length > 0) {
      return initialExecution.checklistResults;
    }
    return templateItems.map(item => ({
      itemKey: item.key,
      description: item.description,
      status: 'pending' // Começa pendente no modo field
    }));
  });

  const [recommendation, setRecommendation] = useState(initialExecution.recommendation || '');

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
          checklistResults: checklist,
          recommendation
        });
      }, 500); // debounce
      return () => clearTimeout(timer);
    }
  }, [measurements, checklist, recommendation]);

  const updateMeasurement = (key: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [key]: value }));
  };

  const updateChecklistItem = (key: string, status: 'compliant' | 'non-compliant' | 'na', notes?: string) => {
    if (navigator.vibrate) navigator.vibrate(50);
    
    if (status === 'non-compliant' && !activeAnomalyItem) {
      const item = checklist.find(i => i.itemKey === key);
      if (item) setActiveAnomalyItem(item);
    }
    
    setChecklist(prev => prev.map(item => {
      if (item.itemKey === key) {
        return { ...item, status, notes: notes !== undefined ? notes : item.notes };
      }
      return item;
    }));
  };

  const handleSaveAnomaly = async (anomalyData: any) => {
    if (!activeAnomalyItem) return;
    
    // Create anomaly in DB
    const anomaly = {
      id: generateId(),
      companyId: initialExecution.companyId || 'default',
      workspaceId: initialExecution.workspaceId || 'default',
      clientId: initialExecution.clientId || 'default',
      siteId: 'default',
      assetId: initialExecution.assetId || 'default',
      workOrderId: initialExecution.workOrderId,
      assetExecutionId: initialExecution.id || 'default',
      title: anomalyData.title,
      description: anomalyData.description,
      recommendedAction: anomalyData.recommendedAction,
      severity: anomalyData.severity,
      status: 'OPEN' as const,
      photoUuids: [],
      createdBy: 'current-tech',
      createdAt: new Date().toISOString()
    };
    
    await db.anomalies.put(anomaly);
    setActiveAnomalyItem(null);
  };


  const handleTudoConforme = () => {
    if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
    setChecklist(prev => prev.map(item => ({ ...item, status: 'compliant' })));
    // Salva instantaneamente e opcionalmente avança pro próximo se desejar
    // Por enquanto deixaremos o técnico avançar manualmente para confirmar.
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050505] animate-slide-up">
      <AppHeader title={assetName} subtitle="Execução" onBack={onClose} />
      
      <div className="flex-1 overflow-y-auto p-4 pb-40 space-y-4">
        
        {/* BOTÃO GIGANTE DE FLUXO DE UM CLIQUE */}
        <button
          onClick={handleTudoConforme}
          className="w-full relative overflow-hidden bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30 p-6 rounded-[24px] active:scale-[0.97] transition-all flex flex-col items-center justify-center gap-2 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-green)]/20 blur-[50px] rounded-full pointer-events-none" />
          <div className="w-14 h-14 rounded-full bg-[var(--accent-green)] text-[#050505] flex items-center justify-center">
            <Check size={32} strokeWidth={3} />
          </div>
          <span className="text-[16px] font-black tracking-widest text-[var(--accent-green)] uppercase">Tudo Conforme</span>
        </button>

        {measurementTemplates.length > 0 && (
          <SurfaceCard padding="lg" className="rounded-[20px] bg-surface-800/50">
            <SectionLabel className="mb-4">Telemetria & Medições</SectionLabel>
            <div className="space-y-4">
              {measurementTemplates.map(m => (
                <Input
                  key={m.key}
                  label={`${m.label} (${m.unit})`}
                  type="number"
                  placeholder="0.00"
                  value={measurements[m.key] || ''}
                  onChange={e => updateMeasurement(m.key, e.target.value)}
                />
              ))}
            </div>
          </SurfaceCard>
        )}

        <div className="space-y-3">
          <SectionLabel className="ml-2">Inspeção Visual (Manual)</SectionLabel>
          <div className="space-y-3">
            {checklist.map(item => (
              <div key={item.itemKey} className="flex flex-col space-y-3 bg-surface-800 border border-surface-700 p-4 rounded-[20px]">
                <span className="text-white text-[13px] font-bold leading-tight">{item.description}</span>
                <div className="flex space-x-2">
                  <button 
                    className={`flex-1 py-3 text-[11px] font-black rounded-xl tracking-wider transition-all ${item.status === 'compliant' ? 'bg-[var(--accent-green)] text-[#050505] shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-surface-700 text-text-secondary active:bg-surface-600'}`}
                    onClick={() => updateChecklistItem(item.itemKey, 'compliant')}
                  >
                    OK
                  </button>
                  <button 
                    className={`flex-1 py-3 text-[11px] font-black rounded-xl tracking-wider transition-all ${item.status === 'non-compliant' ? 'bg-status-error text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-surface-700 text-text-secondary active:bg-surface-600'}`}
                    onClick={() => updateChecklistItem(item.itemKey, 'non-compliant')}
                  >
                    FALHA
                  </button>
                  <button 
                    className={`w-14 py-3 text-[11px] font-black rounded-xl tracking-wider transition-all flex items-center justify-center ${item.status === 'na' ? 'bg-surface-500 text-white' : 'bg-surface-700 text-text-tertiary active:bg-surface-600'}`}
                    onClick={() => updateChecklistItem(item.itemKey, 'na')}
                  >
                    N/A
                  </button>
                </div>
                {item.status === 'non-compliant' && (
                  <div className="pt-2 animate-fade-in">
                    <Input 
                      label="Detalhes da falha" 
                      placeholder="Descreva o problema..."
                      value={item.notes || ''}
                      onChange={e => updateChecklistItem(item.itemKey, item.status, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RODAPÉ FIXO DE NAVEGAÇÃO DE BATALHA */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface-900/90 backdrop-blur-md border-t border-surface-800 flex gap-3">
        <SecondaryButton 
          onClick={onPrevious}
          disabled={isFirst}
          className="flex-1 justify-center py-4 rounded-xl opacity-80 disabled:opacity-30 border-white/[0.05]"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span className="text-[12px]">ANTERIOR</span>
        </SecondaryButton>

        {isLast ? (
          <PrimaryButton 
            onClick={onClose}
            className="flex-1 justify-center py-4 rounded-xl shadow-[0_0_24px_rgba(212,169,78,0.25)] font-black"
          >
            <span className="text-[12px] tracking-widest">CONCLUIR</span>
          </PrimaryButton>
        ) : (
          <PrimaryButton 
            onClick={onNext}
            className="flex-1 justify-center py-4 rounded-xl shadow-[0_0_24px_rgba(212,169,78,0.25)] font-black"
          >
            <span className="text-[12px] tracking-widest">PRÓXIMO</span>
            <ChevronRight size={20} className="ml-1" />
          </PrimaryButton>
        )}
        )}
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
