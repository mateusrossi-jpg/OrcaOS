import type { FocusEvent } from 'react';

export function handleNumericInputFocus(event: FocusEvent<HTMLInputElement>) {
  const input = event.currentTarget;

  requestAnimationFrame(() => {
    if (document.activeElement === input) {
      input.select();
    }
  });
}

