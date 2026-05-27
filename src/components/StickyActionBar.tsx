// src/components/StickyActionBar.tsx
/**
 * Fixed footer with primary Save and secondary Cancel actions.
 * Respects the safe‑area inset on mobile devices.
 */
import React from 'react';
import './StickyActionBar.css';

interface StickyActionBarProps {
  onSave?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  actions?: React.ReactNode;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({
  onSave,
  onCancel,
  saveLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  disabled = false,
  actions,
}) => (
  <div className="sticky-action-bar" role="toolbar">
    {actions}
    {!actions && onSave && (
      <button className="sticky-save" onClick={onSave} disabled={disabled}>
        {saveLabel}
      </button>
    )}
    {onCancel && (
      <button className="sticky-cancel" onClick={onCancel} disabled={disabled}>
        {cancelLabel}
      </button>
    )}
  </div>
);
