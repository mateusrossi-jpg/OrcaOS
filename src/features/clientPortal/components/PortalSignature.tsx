import React, { useState } from 'react';
import { SurfaceCard, PrimaryButton } from '../../../ui/system';
import { db } from '../../../storage/dexieDatabase';

export const PortalSignature: React.FC<{ onSigned: () => void; onCancel: () => void }> = ({ onSigned, onCancel }) => {
  const [signed, setSigned] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/90 p-6 animate-fade-in">
      <div className="flex-1 flex flex-col justify-center items-center">
        <h2 className="text-xl font-black text-white mb-2">Assinatura Digital</h2>
        <p className="text-sm text-text-secondary text-center mb-8">Ao assinar, você autoriza o serviço e os valores descritos na proposta.</p>
        
        <div className="w-full h-64 bg-surface-900 border-2 border-dashed border-surface-700 rounded-2xl flex items-center justify-center relative touch-none">
          {signed ? (
            <div className="text-[var(--accent-green)] font-black text-3xl signature-font animate-slide-up">Assinado Digitalmente</div>
          ) : (
            <span className="text-text-tertiary font-bold pointer-events-none">Assine aqui com o dedo</span>
          )}
          <div 
            className="absolute inset-0 z-10" 
            onPointerDown={() => setSigned(true)}
            onPointerMove={(e) => { if (e.buttons > 0) setSigned(true); }}
          />
        </div>

        <button onClick={() => setSigned(false)} className="mt-4 text-xs font-bold text-text-tertiary">Limpar Assinatura</button>
      </div>
      
      <div className="flex gap-4">
        <button onClick={onCancel} className="flex-1 py-4 text-text-secondary font-bold">Cancelar</button>
        <PrimaryButton 
          disabled={!signed}
          onClick={onSigned}
          className="flex-1 py-4 font-black bg-[var(--accent-green)] text-black disabled:opacity-50"
        >
          CONFIRMAR
        </PrimaryButton>
      </div>
    </div>
  );
};
