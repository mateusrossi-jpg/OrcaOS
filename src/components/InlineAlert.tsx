// src/components/InlineAlert.tsx
/**
 * InlineAlert – premium dark, non-modal banner for confirmations.
 * Auto-dismisses after `timeoutMs` (default 5000 ms) or when the user clicks Cancel.
 * Uses Aferix Design System buttons for consistent CTA styling.
 */
import React, { useEffect } from 'react';
import { PrimaryButton, DangerButton } from '../app/components/ui';

interface InlineAlertProps {
  title: string;
  message?: string;
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Callback when alert is cancelled / auto‑dismiss */
  onCancel: () => void;
  /** Auto‑dismiss timeout in ms (default 5000) */
  timeoutMs?: number;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  timeoutMs = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onCancel();
    }, timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs, onCancel]);

  return (
    <div
      className="inline-alert animate-fade-in"
      role="alert" aria-live="assertive"
    >
      <div className="inline-alert-content flex flex-col gap-1">
        <strong className="text-[15px] font-medium">{title}</strong>
        {message && <p className="text-[13px] opacity-80">{message}</p>}
      </div>
      <div className="inline-alert-actions flex gap-2 self-end">
        <PrimaryButton onClick={onConfirm}>
          Confirmar
        </PrimaryButton>
        <DangerButton onClick={onCancel}>
          Cancelar
        </DangerButton>
      </div>
    </div>
  );
};
