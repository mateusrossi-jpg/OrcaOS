import React, { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import overlayStyles from './OverlayTokens.module.css';
import { cn } from '../../../utils/ui';

/**
 * Overlay: Global portal-based backdrop system.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export function Overlay({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  return createPortal(
    <div
      ref={backdropRef}
      className={cn(overlayStyles.overlay, overlayStyles.overlayFadeIn)}
      onClick={handleClick}
    >
      {children}
    </div>,
    document.body
  );
}
