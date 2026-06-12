import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AferixButton } from './AferixButton';

interface AferixSignaturePadProps {
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
}

/**
 * AferixSignaturePad: A premium drawing canvas for digital signatures.
 * Integrated as a reusable component of the Design System.
 */
export const AferixSignaturePad: React.FC<AferixSignaturePadProps> = ({
  title = 'Assinatura Técnica',
  subtitle = 'Assine na área tracejada abaixo',
  onClose,
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = 320; // Comfortable drawing area height
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFFFFF'; // White ink for dark theme
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
    e.preventDefault();
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
      onSave(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex flex-col bg-aferix-bg px-6 justify-between animate-fade-in"
      style={{ 
        paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)'
      }}
    >
      <div className="flex justify-between items-center pb-4 border-b border-white/[0.08]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-black font-mono tracking-[0.2em] text-[var(--accent-gold)] uppercase">
            {title}
          </span>
          <span className="text-[11px] text-white/40">{subtitle}</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-white/40 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/5 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 my-6 relative rounded-[28px] overflow-hidden border border-dashed border-white/10 bg-white/[0.02]">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="flex gap-4 pb-6">
        <AferixButton variant="p1" className="flex-1" onClick={clear}>
          Limpar
        </AferixButton>
        <AferixButton variant="p0" className="flex-[2]" onClick={handleSave} disabled={isEmpty}>
          Confirmar
        </AferixButton>
      </div>
    </div>
  );
};
