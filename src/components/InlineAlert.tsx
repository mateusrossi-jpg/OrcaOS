// src/components/InlineAlert.tsx
/**
 * InlineAlert - lightweight non-modal banner used for destructive-action confirmations.
 * Auto-dismisses after 5s or when user clicks the close icon.
 */
import React, { useEffect } from 'react';
import './InlineAlert.css';

interface InlineAlertProps {
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Auto‑dismiss timeout in ms (default 5000) */
  timeoutMs?: number;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({ title, message, onConfirm, onCancel, timeoutMs = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onCancel();
    }, timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs, onCancel]);

  return (
    <div className="inline-alert" role="alert">
      <div className="inline-alert-content">
        <strong>{title}</strong>
        {message && <p>{message}</p>}
      </div>
      <div className="inline-alert-actions">
        <button className="inline-alert-confirm" onClick={onConfirm}>Confirmar</button>
        <button className="inline-alert-cancel" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
};
