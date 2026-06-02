import React from 'react';
import { AppHeader, SurfaceCard, Title, Body } from '../../../ui/system';
import { PrimaryButton } from '../../../app/components/ui';

interface TrialAndPaywallModalProps {
  onClose: () => void;
  onSubscribe: () => void;
  title?: string;
}

export const TrialAndPaywallModal: React.FC<TrialAndPaywallModalProps> = ({ 
  onClose, 
  onSubscribe,
  title = "Período de Teste"
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-900 bg-opacity-95 p-4 sm:p-12 items-center justify-center">
      <div className="w-full max-w-md bg-surface-800 rounded-xl shadow-2xl overflow-hidden border border-brand-500/50">
        <AppHeader title={title} subtitle="Aferix Premium" onBack={onClose} />
        
        <div className="p-6 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-500/20 text-brand-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <Title className="text-xl">Libere todo o poder operacional</Title>
          <Body className="text-text-secondary">
            Seu laudo profissional está pronto. Para gerar o PDF oficial e enviá-lo ao seu cliente, inicie sua assinatura premium por apenas R$ 89/mês.
          </Body>

          <SurfaceCard padding="md" className="bg-surface-700 border-surface-600 text-left space-y-3">
            <div className="flex items-start">
              <span className="text-brand-500 mr-2">✓</span>
              <span className="text-sm text-text-primary">Laudos ilimitados</span>
            </div>
            <div className="flex items-start">
              <span className="text-brand-500 mr-2">✓</span>
              <span className="text-sm text-text-primary">Sem marca d'água</span>
            </div>
            <div className="flex items-start">
              <span className="text-brand-500 mr-2">✓</span>
              <span className="text-sm text-text-primary">Envio automático via WhatsApp</span>
            </div>
            <div className="flex items-start">
              <span className="text-brand-500 mr-2">✓</span>
              <span className="text-sm text-text-primary">Gestão de garantias (Retorno)</span>
            </div>
          </SurfaceCard>

          <div className="pt-4 space-y-3">
            <PrimaryButton onClick={onSubscribe} className="w-full py-4 text-lg">
              Assinar Agora - R$ 89/mês
            </PrimaryButton>
            <button onClick={onClose} className="w-full text-text-secondary text-sm font-medium hover:text-text-primary transition-colors">
              Agora não, voltar ao rascunho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
