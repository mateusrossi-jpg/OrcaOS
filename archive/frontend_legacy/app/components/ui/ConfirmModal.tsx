import React, { ReactNode, memo } from 'react';
import { Modal } from './index';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'brand' | 'danger';
}

/**
 * ConfirmModal: Refactored to use the authoritative Modal primitive (Phase 4H).
 * Ensures 100% visual parity across all tactical overlays.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = memo(({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'brand'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      tone={tone}
    >
      <div className="text-center py-2">
        {children}
      </div>
    </Modal>
  );
});
