import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

vi.mock('react-dom', () => ({
  createPortal: (node: React.ReactNode) => node,
}));

if (typeof document === 'undefined') {
  (globalThis as any).document = {
    body: { nodeType: 1 },
    createElement: () => ({}),
  };
}

import ConfirmModal from './ConfirmModal';

describe('ConfirmModal accessibility and render', () => {
  it('renders modal with correct ARIA attributes when open', () => {
    const html = renderToString(
      <ConfirmModal
        isOpen={true}
        title="Confirmar Exclusão"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      >
        Tem certeza que deseja excluir este item?
      </ConfirmModal>
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="confirm-modal-title"');
    expect(html).toContain('id="confirm-modal-title"');
    expect(html).toContain('Confirmar Exclusão');
  });

  it('renders nothing when closed', () => {
    const html = renderToString(
      <ConfirmModal
        isOpen={false}
        title="Confirmar Exclusão"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      >
        Tem certeza que deseja excluir este item?
      </ConfirmModal>
    );

    expect(html).toBe('');
  });
});
