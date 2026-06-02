import React, { useRef, useState, useEffect } from 'react';
import { AppHeader, SurfaceCard, SectionLabel } from '../../../ui/system';
import { PrimaryButton } from '../../../app/components/ui';

interface SignaturePadProps {
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  title = 'Assinatura',
  subtitle = 'Assine abaixo para confirmar',
  onClose,
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Configurar tamanho real vs tamanho de exibição para nitidez no mobile
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = 300; // Altura fixa confortável
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFFFFF'; // Dark theme ink
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Evitar scroll
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
      setIsEmpty(false);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas && !isEmpty) {
      // Retorna PNG base64
      onSave(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-900">
      <AppHeader title={title} subtitle={subtitle} onBack={onClose} />
      
      <div className="flex-1 flex flex-col p-4 space-y-6 overflow-hidden">
        <SurfaceCard padding="none" className="flex-1 flex flex-col overflow-hidden border-2 border-dashed border-surface-700">
          <canvas
            ref={canvasRef}
            className="w-full flex-1 touch-none cursor-crosshair bg-surface-800"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </SurfaceCard>
        
        <div className="flex space-x-4 pt-2 pb-8">
          <button 
            className="flex-1 py-3 bg-surface-700 text-text-primary rounded-md font-bold"
            onClick={clear}
          >
            Limpar
          </button>
          <PrimaryButton 
            className="flex-[2]"
            onClick={handleSave} 
            disabled={isEmpty}
          >
            Confirmar Assinatura
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
