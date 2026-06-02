import React, { useState } from 'react';
import { AppHeader, SurfaceCard, SectionLabel, Body } from '../../../ui/system';
import { Input, PrimaryButton } from '../../../app/components/ui';

interface WhatsAppShareModalProps {
  clientName: string;
  clientPhone?: string;
  workOrderId: string;
  reportUrl?: string; // Link to the report if hosted, or generic link
  onClose: () => void;
  onShared?: () => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  clientName,
  clientPhone = '',
  workOrderId,
  reportUrl = 'https://aferix.com/report/12345',
  onClose,
  onShared
}) => {
  const [phone, setPhone] = useState(clientPhone);
  
  const formattedId = workOrderId.split('-')[0].toUpperCase();
  const defaultMessage = `Olá, ${clientName}. O laudo técnico referente à OS #${formattedId} já está disponível. Você pode acessá-lo aqui: ${reportUrl}`;
  
  const [message, setMessage] = useState(defaultMessage);

  const handleShare = () => {
    // Format phone to digits only
    const digits = phone.replace(/\D/g, '');
    const url = `https://wa.me/55${digits}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    if (onShared) onShared();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-900 bg-opacity-95 p-4 sm:p-12 items-center justify-center">
      <div className="w-full max-w-md bg-surface-800 rounded-xl shadow-2xl overflow-hidden border border-surface-700">
        <AppHeader title="Compartilhar" subtitle="Enviar via WhatsApp" onBack={onClose} />
        
        <div className="p-6 space-y-6">
          <SurfaceCard padding="none" className="bg-transparent border-none">
            <SectionLabel className="mb-4">Informações de Envio</SectionLabel>
            <div className="space-y-4">
              <Input 
                label="Número do WhatsApp" 
                placeholder="(11) 99999-9999" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
              
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Mensagem</label>
                <textarea
                  className="w-full bg-surface-900 border border-surface-700 rounded-md p-3 text-text-primary text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all resize-y min-h-[120px]"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>
            </div>
          </SurfaceCard>
          
          <PrimaryButton onClick={handleShare} disabled={!phone || !message}>
            Enviar no WhatsApp
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
