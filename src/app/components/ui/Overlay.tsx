import React, { ReactNode, useEffect, useRef } from 'react';
import overlayStyles from './OverlayTokens.module.css';
import styles from './MobileActionMenu.module.css';

/**
 * Full‑screen overlay backdrop with fade‑in animation.
 * Clicking on the backdrop (outside of children) triggers `onClose`.
 */
export function Overlay({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={backdropRef}
      className={`${overlayStyles.overlay} ${overlayStyles.overlayFadeIn}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}
