// src/services/DestructiveActionGuardService.ts
/**
 * Hook exposing a simple confirmDestructive helper that renders InlineAlert.
 * Consumers can call `useConfirmDestructive` and provide callbacks for confirm/cancel.
 * The UI is the lightweight InlineAlert defined in src/components/InlineAlert.tsx.
 */
import React, { useState } from 'react';
import { InlineAlert } from '../components/InlineAlert';

export function useConfirmDestructive(
  actionName: string,
  onConfirm: () => void
) {
  const [show, setShow] = useState(false);

  const confirm = () => {
    setShow(false);
    onConfirm();
  };
  const cancel = () => setShow(false);
  const start = () => setShow(true);

  const element = show ? React.createElement(InlineAlert, {
    title: `Confirmar ${actionName}`,
    message: "Esta ação é irreversível.",
    onConfirm: confirm,
    onCancel: cancel,
  }) : null;

  return { start, element };
}
