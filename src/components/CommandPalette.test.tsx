import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CommandPalette } from './CommandPalette';

describe('CommandPalette accessibility & markup', () => {
  it('exports CommandPalette component function', () => {
    expect(typeof CommandPalette).toBe('function');
  });

  it('renders null when modal is closed', () => {
    const html = renderToString(<CommandPalette />);
    expect(html).toBe('');
  });
});
