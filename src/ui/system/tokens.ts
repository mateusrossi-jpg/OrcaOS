export const ERPTokens = {
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    '2xl': '3rem', // 48px
  },
  radius: {
    sm: '0.25rem', // 4px
    md: '0.5rem',  // 8px
    lg: '0.75rem', // 12px
    xl: '1rem',    // 16px
    full: '9999px',
  },
  colors: {
    // Backgrounds
    bgBase: 'bg-gray-950',
    bgPanel: 'bg-gray-900',
    bgCard: 'bg-gray-900',
    bgCardHover: 'bg-gray-800',
    bgHeader: 'bg-gray-900/50',
    
    // Borders
    borderBase: 'border-gray-800',
    borderLight: 'border-gray-800/60',
    borderFocus: 'border-yellow-500/50',
    
    // Text
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-400',
    textTertiary: 'text-gray-500',
    
    // Brand
    brandAccent: 'text-yellow-500',
    brandBg: 'bg-yellow-500',
    
    // Semantics (Operational & SLA)
    semantic: {
      healthy: { bg: 'bg-green-900/40', text: 'text-green-400', border: 'border-green-800/50', dot: 'bg-green-500' },
      warning: { bg: 'bg-yellow-900/40', text: 'text-yellow-500', border: 'border-yellow-800/50', dot: 'bg-yellow-500' },
      critical: { bg: 'bg-red-900/40', text: 'text-red-400', border: 'border-red-800/50', dot: 'bg-red-500' },
      blocked: { bg: 'bg-red-950/60', text: 'text-red-500', border: 'border-red-900/50', dot: 'bg-red-600' },
      stalled: { bg: 'bg-gray-800/60', text: 'text-gray-400', border: 'border-gray-700/50', dot: 'bg-gray-500' },
      info: { bg: 'bg-blue-900/40', text: 'text-blue-400', border: 'border-blue-800/50', dot: 'bg-blue-500' },
    },
    
    // CRM Stages
    crm: {
      lead: 'bg-blue-500',
      proposal_sent: 'bg-yellow-500',
      approved: 'bg-green-500',
      execution: 'bg-purple-500',
      finalized: 'bg-gray-500',
      recurring_candidate: 'bg-indigo-500'
    }
  },
  elevation: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  },
  animation: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-300',
  },
  zIndices: {
    base: 'z-0',
    sticky: 'z-10',
    drawer: 'z-40',
    modal: 'z-50',
    toast: 'z-60',
  }
};
