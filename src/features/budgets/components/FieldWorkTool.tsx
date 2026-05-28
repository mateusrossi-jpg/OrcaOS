import React from 'react';
import { Budget, BudgetItem } from '../../../domain/budget';
import { 
  Surface, 
  SectionTitle, 
  ListCard, 
  TextArea, 
  ContextBanner,
  Badge
} from '../../../app/components/ui';
import { formatCurrencyBRL } from '../../../utils/formatters';

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
    <div className="aferix-field-work-tool aferix-d-flex aferix-flex-column aferix-gap-lg">
      
      {/* 1. INFO DO CLIENTE (Quick Access) */}
      <Surface elevation={1} padding="md" className="aferix-border-left-brand">
        <div className="aferix-d-flex aferix-justify-between aferix-align-center">
          <div className="aferix-d-flex aferix-flex-column">
            <span className="aferix-font-xs aferix-text-muted aferix-font-bold">CLIENTE EM FOCO</span>
            <strong className="aferix-font-md">{budget.clientName || 'Cliente não informado'}</strong>
          </div>
          <Badge tone="brand">EM EXECUÇÃO</Badge>
        </div>
      </Surface>

      {/* 2. CHECKLIST DE SERVIÇOS */}
      <div className="checklist-section">
        <SectionTitle title="Checklist de Serviços" eyebrow="O que deve ser feito" />
        <ListCard>
          {services.length === 0 ? (
            <div className="aferix-p-md aferix-text-muted aferix-text-center">Nenhum serviço técnico listado.</div>
          ) : (
            services.map(item => (
              <div key={item.id} className="aferix-p-md aferix-d-flex aferix-gap-md aferix-align-center" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                <input type="checkbox" style={{ width: '20px', height: '20px' }} />
                <div className="aferix-d-flex aferix-flex-column">
                  <span className="aferix-font-sm aferix-font-bold">{item.description}</span>
                  <small className="aferix-text-muted">{item.quantity} un planejada(s)</small>
                </div>
              </div>
            ))
          )}
        </ListCard>
      </div>

      {/* 3. LISTA DE MATERIAIS */}
      <div className="materials-section">
        <SectionTitle title="Materiais e Insumos" eyebrow="Lista de separação" />
        <ListCard>
          {materials.length === 0 ? (
            <div className="aferix-p-md aferix-text-muted aferix-text-center">Nenhum material vinculado.</div>
          ) : (
            materials.map(item => (
              <div key={item.id} className="aferix-p-md aferix-d-flex aferix-justify-between aferix-align-center" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                <span className="aferix-font-sm">{item.description}</span>
                <Badge tone="default">{item.quantity} un</Badge>
              </div>
            ))
          )}
        </ListCard>
      </div>

      {/* 4. DIÁRIO DE OBRA */}
      <div className="journal-section">
        <SectionTitle title="Diário de Obra" eyebrow="Evidências e Imprevistos" />
        <Surface elevation={1} padding="md">
          <TextArea
            label="Notas de Campo (Privado)"
            value={budget.notes || ''}
            onChange={onUpdateNotes}
            disabled={isReadOnly}
            placeholder="Relate o andamento, dificuldades encontradas ou mudanças no projeto original..."
            rows={6}
          />
        </Surface>
      </div>

      <ContextBanner
        title="Dica de Campo"
        meta="Registre qualquer custo extra no diário para não esquecer de cobrar ou ajustar no fechamento."
        icon="💡"
      />
    </div>
  );
};
