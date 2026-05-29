import React from 'react';
import { Budget } from '../../../domain/budget';
import { 
  Card,
  SectionLabel, 
  TextArea, 
  ContextBanner,
  Badge,
  ListItem
} from '../../../app/components/ui';

interface FieldWorkToolProps {
  budget: Budget;
  onUpdateNotes: (notes: string) => void;
  isReadOnly?: boolean;
}

/**
 * FieldWorkTool: A ferramenta de campo do profissional.
 * Foco em checklist de execução e diário de obra.
 */
export const FieldWorkTool: React.FC<FieldWorkToolProps> = ({ budget, onUpdateNotes, isReadOnly }) => {
  const services = budget.items.filter(it => it.category !== 'material');
  const materials = budget.items.filter(it => it.category === 'material');

  return (
    <div className="flex flex-col gap-8 pb-10">
      
      {/* 1. INFO DO CLIENTE (Quick Access) */}
      <Card className="p-6 border-l-4 border-l-[var(--accent-gold)]">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">CLIENTE EM FOCO</span>
            <strong className="text-[17px] font-bold text-white">{budget.clientName || 'Cliente não informado'}</strong>
          </div>
          <Badge tone="brand">EM EXECUÇÃO</Badge>
        </div>
      </Card>

      {/* 2. CHECKLIST DE SERVIÇOS */}
      <div className="flex flex-col gap-4">
        <SectionLabel className="mt-0">Checklist de Serviços</SectionLabel>
        <div className="flex flex-col gap-2">
          {services.length === 0 ? (
            <div className="p-10 text-center rounded-2xl border border-dashed border-white/5 bg-white/[0.01] text-[var(--text-muted)] opacity-50">Nenhum serviço técnico listado.</div>
          ) : (
            services.map(item => (
              <div key={item.id} className="flex items-center gap-5 p-5 rounded-xl bg-white/[0.03] border var(--border-subtle) transition-all active:scale-[0.98]">
                <input 
                  type="checkbox" 
                  className="h-6 w-6 rounded-lg bg-white/[0.05] border var(--border-soft) checked:bg-[var(--accent-gold)] transition-all cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[15.5px] font-bold text-white">{item.description}</span>
                  <p className="text-[12px] font-medium text-[var(--text-muted)] opacity-60 uppercase tracking-widest mt-0.5">{item.quantity} un planejada(s)</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. LISTA DE MATERIAIS */}
      <div className="flex flex-col gap-4">
        <SectionLabel className="mt-0">Materiais e Insumos</SectionLabel>
        <div className="flex flex-col gap-2">
          {materials.length === 0 ? (
            <div className="p-10 text-center rounded-2xl border border-dashed border-white/5 bg-white/[0.01] text-[var(--text-muted)] opacity-50">Nenhum material vinculado.</div>
          ) : (
            materials.map(item => (
              <ListItem
                key={item.id}
                title={item.description}
                status={<Badge tone="default">{item.quantity} un</Badge>}
                className="bg-white/[0.02]"
              />
            ))
          )}
        </div>
      </div>

      {/* 4. DIÁRIO DE OBRA */}
      <div className="flex flex-col gap-4">
        <SectionLabel className="mt-0">Diário de Obra</SectionLabel>
        <Card className="p-6">
          <TextArea
            label="Notas de Campo (Privado)"
            value={budget.notes || ''}
            onChange={onUpdateNotes}
            disabled={isReadOnly}
            placeholder="Relate o andamento, dificuldades encontradas ou mudanças no projeto original..."
            rows={6}
          />
        </Card>
      </div>

      <ContextBanner
        title="Dica de Campo"
        meta="Registre qualquer custo extra no diário para não esquecer de cobrar ou ajustar no fechamento."
        icon="💡"
      />
    </div>
  );
};
