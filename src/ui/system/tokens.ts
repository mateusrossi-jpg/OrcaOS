/**
 * AFERIX DESIGN TOKENS (Source of Truth)
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export const ERPTokens = {
  colors: {
    bgPrimary: 'var(--bg-primary)',
    bgSecondary: 'var(--bg-secondary)',
    bgSurface: 'var(--bg-surface)',
    bgHeader: 'var(--bg-surface-glass)',
    bgOverlay: 'var(--bg-overlay)',
    
    borderLight: 'var(--border-soft)',
    borderMedium: 'var(--border-subtle)',
    borderGold: 'var(--border-primary)',
    
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    textTertiary: 'var(--text-muted)',
    
    gold: 'var(--accent-gold)',
    green: 'var(--accent-green)',
    blue: 'var(--accent-blue)',
    red: 'var(--accent-red)',
    purple: 'var(--accent-purple)',
  },
  
  status: {
    healthy: { bg: 'bg-[var(--accent-green)]/15', text: 'text-[var(--accent-green)]', border: 'border-[var(--accent-green)]/20', dot: 'bg-[var(--accent-green)]' },
    warning: { bg: 'bg-[var(--accent-gold)]/15', text: 'text-[var(--accent-gold)]', border: 'border-[var(--accent-gold)]/20', dot: 'bg-[var(--accent-gold)]' },
    critical: { bg: 'bg-[var(--accent-red)]/15', text: 'text-[var(--accent-red)]', border: 'border-[var(--accent-red)]/20', dot: 'bg-[var(--accent-red)]' },
    info: { bg: 'bg-[var(--accent-blue)]/15', text: 'text-[var(--accent-blue)]', border: 'border-[var(--accent-blue)]/20', dot: 'bg-[var(--accent-blue)]' },
  },
  
  radii: {
    xs: 'var(--radius-xs)',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-card)',
    xl: 'var(--radius-modal)',
    full: 'var(--radius-pill)',
  },
  
  spacing: {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)',
    section: 'var(--spacing-section)',
  },
  
  z: {
    base: 'z-0',
    header: 'z-10',
    sticky: 'z-100',
    drawer: 'z-500',
    modal: 'z-1000',
    toast: 'z-2000',
  }
};
