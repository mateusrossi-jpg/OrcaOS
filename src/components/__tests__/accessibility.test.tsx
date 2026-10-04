import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { GlobalCommandCenter } from '../GlobalCommandCenter';

describe('Accessibility Standards Test', () => {
  it('renders GlobalCommandCenter trigger button with accessible name and title', () => {
    const html = renderToString(<GlobalCommandCenter />);
    expect(html).toContain('aria-label="Abrir Menu Principal"');
    expect(html).toContain('title="Abrir Menu Principal"');
    expect(html).toContain('focus-visible:ring-2');
  });
});
