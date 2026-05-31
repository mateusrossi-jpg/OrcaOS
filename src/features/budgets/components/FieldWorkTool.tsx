import React, { memo, useState } from 'react';
import { Budget } from '../../../domain/budget';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { 
  TextArea, 
  ContextBanner
} from '../../../app/components/ui';

import { 
  SurfaceCard,
  SectionLabel,
  InteractiveRow,
  SemanticBadge,
  StatusPill
} from '../../../ui/system';

import { CheckCircle2, Circle, Clock, Info, User } from 'lucide-react';

interface FieldWorkToolProps {
  budget: Budget;
  onUpdateNotes: (notes: string) => void;
  isReadOnly?: boolean;
}

/**
 * FieldWorkTool V2: A ferramenta de campo do profissional.
 * Refactored for absolute executive DNA parity (Phase 4G).
 */
export const FieldWorkTool: React.FC<FieldWorkToolProps> = memo(({ budget, onUpdateNotes, isReadOnly }) => {
  const services = budget.items.filter(it => it.category === 'labor');
  const materials = budget.items.filter(it => it.category === 'material');
  
  // Local state for interactive checklist (visual only for now)
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newSet = new Set(completedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCompletedItems(newSet);
  };

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
      
      {/* 1. CLIENT FOCUS HERO */}
      <div className="flex flex-col gap-3">
        <SectionLabel style={{ marginLeft: "8px" }}>Status da Execução</SectionLabel>
        <SurfaceCard padding="lg" className="border-l-[3px] border-l-[#D4A94E]">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-[0.15em] text-[#808080] uppercase mb-1.5 font-mono flex items-center gap-2">
                 <User size={10} /> CONTRATANTE_ATIVO
              </span>
              <strong className="text-[18px] font-bold text-white tracking-tight">{budget.clientName || 'Cliente não informado'}</strong>
            </div>
            <StatusPill status={budget.status} />
          </div>
        </SurfaceCard>
      </div>

      {/* 2. SERVICES CHECKLIST */}
      <div className="flex flex-col gap-3">
        <SectionLabel style={{ marginLeft: "8px" }}>Checklist de Serviços</SectionLabel>
        <SurfaceCard padding="none" className="overflow-hidden">
          {services.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center opacity-20">
               <Info size={32} className="mb-4" />
               <span className="text-[10px] font-bold tracking-widest uppercase font-mono">Nenhum serviço listado.</span>
            </div>
          ) : (
            services.map((item, idx) => {
              const isDone = completedItems.has(item.id);
              return (
                <InteractiveRow 
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={idx !== 0 ? "border-t border-white/[0.05]" : ""}
                  leftSlot={
                    <div className="shrink-0">
                      {isDone 
                        ? <CheckCircle2 size={20} className="text-[#2ECC71] fill-[#2ECC71]/10" /> 
                        : <Circle size={20} className="text-white/10" />
                      }
                    </div>
                  }
                >
                  <div className="flex flex-col gap-0.5">
                    <span className={isDone ? "text-[15px] font-bold text-[#505050] line-through transition-all" : "text-[15px] font-bold text-white transition-all"}>
                      {item.description}
                    </span>
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                      {item.quantity} UNIDADES PLANEJADAS
                    </span>
                  </div>
                </InteractiveRow>
              );
            })
          )}
        </SurfaceCard>
      </div>

      {/* 3. MATERIALS LIST */}
      {materials.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionLabel style={{ marginLeft: "8px" }}>Materiais e Insumos</SectionLabel>
          <SurfaceCard padding="none" className="overflow-hidden bg-[#141414]">
            {materials.map((item, idx) => (
              <InteractiveRow 
                key={item.id}
                className={idx !== 0 ? "border-t border-white/[0.05]" : ""}
              >
                <div className="flex justify-between items-center w-full">
                   <span className="text-[14px] font-bold text-[#808080]">{item.description}</span>
                   <SemanticBadge label={`${item.quantity} UN`} variant="default" className="scale-90 origin-right" />
                </div>
              </InteractiveRow>
            ))}
          </SurfaceCard>
        </div>
      )}

      {/* 4. WORK DIARY */}
      <div className="flex flex-col gap-3">
        <SectionLabel style={{ marginLeft: "8px" }}>Diário de Obra</SectionLabel>
        <SurfaceCard padding="lg">
           <TextArea
             label="Notas de Campo (Privado)"
             value={budget.notes || ''}
             onChange={onUpdateNotes}
             disabled={isReadOnly}
             placeholder="Relate o andamento, dificuldades ou alterações..."
             rows={6}
           />
           <div className="mt-6 flex items-center gap-3 opacity-30">
              <Clock size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest font-mono">Atualizado em tempo real</span>
           </div>
        </SurfaceCard>
      </div>

      <ContextBanner
        title="Dica de Campo"
        meta="Registre custos extras aqui para não esquecer de cobrar ou ajustar no fechamento."
        icon={<Info size={14} />}
      />
    </div>
  );
});
