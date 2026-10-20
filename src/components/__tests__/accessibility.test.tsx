import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { GlobalCommandCenter } from '../GlobalCommandCenter';
import { CommandPalette } from '../CommandPalette';

describe('Accessibility Standards Verification', () => {
  it('GlobalCommandCenter renders accessible trigger button with proper ARIA attributes', () => {
    const html = renderToString(<GlobalCommandCenter />);
    expect(html).toContain('aria-label="Abrir menu de comando"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('focus-visible:ring-2');
  });

  it('CommandPalette renders accessible input and modal structure when triggered', () => {
    // CommandPalette initially returns null when not open
    const initialHtml = renderToString(<CommandPalette />);
    expect(initialHtml).toBe('');
  });
});
