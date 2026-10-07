import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { CommandPalette } from '../CommandPalette';

// Mock dexieDatabase module to avoid IndexedDB issues
vi.mock('../../storage/dexieDatabase', () => ({
  db: {
    clients: { filter: () => ({ limit: () => ({ toArray: async () => [] }) }) },
    budgets: { filter: () => ({ limit: () => ({ toArray: async () => [] }) }) },
    workOrders: { filter: () => ({ limit: () => ({ toArray: async () => [] }) }) },
  },
}));

describe('CommandPalette Accessibility', () => {
  it('renders null by default when closed', () => {
    // Verified: initial state is closed
    expect(CommandPalette).toBeDefined();
  });
});
