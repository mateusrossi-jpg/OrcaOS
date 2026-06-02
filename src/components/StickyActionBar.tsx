// src/components/StickyActionBar.tsx
/**
 * Unified Sticky Action Bar – premium dark theme.
 * Provides Save/Cancel actions (or custom actions) fixed to the bottom of the viewport.
 * Uses the Aferix Design System components for consistent styling.
 */
import React from 'react';
import { PrimaryButton, DangerButton } from '../app/components/ui';

interface StickyActionBarProps {
  /** Called when the primary (save) action is triggered */
  onSave?: () => void;
  /** Called when the secondary (cancel) action is triggered */
  onCancel?: () => void;
  /** Label for the primary action button */
  saveLabel?: string;
  /** Label for the secondary action button */
  cancelLabel?: string;
  /** Disable both buttons */
  disabled?: boolean;
  /** Optional custom JSX actions; when provided the default Save button is omitted. */
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
  <div className="sticky-action-bar surface-elev animate-fade-in" role="toolbar">
    {actions}
    {!actions && onSave && (
      <PrimaryButton
        onClick={onSave}
        disabled={disabled}

      >
        {saveLabel}
      </PrimaryButton>
    )}
    {/* Cancel/Back button */}
    {onCancel && (
      <DangerButton
        onClick={onCancel}
        disabled={disabled}

      >
        {cancelLabel}
      </DangerButton>
    )}
  </div>
);
