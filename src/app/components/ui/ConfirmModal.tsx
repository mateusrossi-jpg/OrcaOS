import React, { ReactNode, useEffect } from 'react';
import { Overlay } from './Overlay';
import styles from './ConfirmModal.module.css';

/**
 * ConfirmModal – compact destructive confirmation dialog.
 * Uses the shared Overlay system for backdrop and keyboard handling.
 * Props:
 *   isOpen – controls visibility
 *   title – header text
 *   onClose – called when backdrop or cancel pressed
 *   onConfirm – called when user confirms (danger action)
 *   confirmLabel – label for the confirm button (default "Confirmar")
 *   cancelLabel – label for the cancel button (default "Cancelar")
 */
export function ConfirmModal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
}: {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClose={onClose}>
      <div className={styles.card} role="dialog" aria-modal="true">
        <header className={styles.header}>
          <h2>{title}</h2>
        </header>
        <div className={styles.body}>{children}</div>
        <footer className={styles.footer}>
          <button className={styles.cancel} onClick={onClose}>
            {cancelLabel}
          </button>
          <button className={styles.confirm} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </footer>
      </div>
    </Overlay>
  );
}
