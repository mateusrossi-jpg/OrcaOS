import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { CommandPalette } from './CommandPalette';

describe('CommandPalette accessibility & UX', () => {
  it('renders initial closed state without errors', () => {
    // CommandPalette is closed by default unless aferix_command_palette event fires
    const htmlClosed = renderToString(<CommandPalette />);
    expect(htmlClosed).toBe('');
  });
});
