import React, from 'react';
import { Lightbulb, CheckCircle, Clock } from 'lucide-react';
import { KnowledgeCase, KnowledgeSolution } from '../../../domain/knowledge';

interface Props {
  similarCases: Array<{ caseData: KnowledgeCase; solutions: KnowledgeSolution[] }>;
}

export const FieldKnowledgeAssistant: React.FC<Props> = ({ similarCases }) => {
  if (similarCases.length === 0) return null;

  return (
    <div className="w-full bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)] rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="text-[var(--accent-blue)]" size={24} />
        <h3 className="font-black text-white uppercase tracking-widest text-sm">Assistente de Conhecimento</h3>
      </div>
      
      <p className="text-xs text-text-secondary mb-4">Encontramos {similarCases.length} casos semelhantes na base da empresa.</p>
      
      <div className="space-y-4">
        {similarCases.slice(0, 3).map(c => {
          const topSol = c.solutions[0];
          if (!topSol) return null;
          
          return (
            <div key={c.caseData.id} className="bg-surface-900 border border-surface-700 rounded p-3">
              <h4 className="text-sm font-bold text-white mb-2">{c.caseData.title}</h4>
              
              <div className="flex gap-4 text-xs mt-2">
                <div className="flex items-center gap-1 text-[var(--accent-green)]">
                  <CheckCircle size={14} />
                  <span>{topSol.successRate}% de sucesso</span>
                </div>
                <div className="flex items-center gap-1 text-text-tertiary">
                  <Clock size={14} />
                  <span>{topSol.avgRepairTimeMin} min</span>
                </div>
              </div>
              
              <div className="mt-3 bg-surface-800 p-2 rounded">
                <p className="text-xs text-text-secondary mb-1 font-bold uppercase">Solução Aplicada:</p>
                <p className="text-sm text-white">{topSol.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
