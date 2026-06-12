/**
 * SystemFeatureInventory
 * RC14 Phase 1: Complete mapping of Aferix capabilities.
 * Categorized by Tier (S-D) and Intent Zone.
 */

export interface FeatureAudit {
  id: string;
  name: string;
  intentZone: 'HOME' | 'RECEITA' | 'OPERAÇÃO' | 'RELACIONAMENTOS' | 'ADMINISTRAÇÃO';
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  purpose: string;
  actionable: boolean;
}

export const SystemFeatureInventory: FeatureAudit[] = [
  // S TIER: Core Business Drivers
  { id: 'next-money', name: 'Next Money Engine', intentZone: 'RECEITA', tier: 'S', purpose: 'Revenue prioritization', actionable: true },
  { id: 'proposal-cart', name: 'Proposal Cart', intentZone: 'RECEITA', tier: 'S', purpose: 'Rapid revenue generation', actionable: true },
  { id: 'execution-cockpit', name: 'Execution Cockpit', intentZone: 'OPERAÇÃO', tier: 'S', purpose: 'Field service completion', actionable: true },
  { id: 'morning-briefing', name: 'Morning Briefing', intentZone: 'HOME', tier: 'S', purpose: 'Daily operational habit', actionable: true },
  
  // A TIER: High Value Accelerators
  { id: 'follow-up-engine', name: 'Follow-Up Engine', intentZone: 'RECEITA', tier: 'A', purpose: 'Recover stalled sales', actionable: true },
  { id: 'collection-radar', name: 'Collection Radar', intentZone: 'RECEITA', tier: 'A', purpose: 'Recover outstanding payments', actionable: true },
  { id: 'client-360', name: 'Client 360 Dossier', intentZone: 'RELACIONAMENTOS', tier: 'A', purpose: 'Deep customer relationship memory', actionable: false },
  { id: 'voice-notes', name: 'Voice Notes', intentZone: 'OPERAÇÃO', tier: 'A', purpose: 'Zero-typing field reporting', actionable: true },
  { id: 'pmoc-shield', name: 'PMOC Renewal Shield', intentZone: 'RECEITA', tier: 'A', purpose: 'Recurring revenue protection', actionable: true },
  
  // B TIER: Supporting Utilities
  { id: 'catalog', name: 'Service Catalog', intentZone: 'RECEITA', tier: 'B', purpose: 'Solution standardization', actionable: true },
  { id: 'shopping-list', name: 'Shopping List JIT', intentZone: 'OPERAÇÃO', tier: 'B', purpose: 'Material logistics efficiency', actionable: true },
  { id: 'reputation-score', name: 'Reputation Engine', intentZone: 'RELACIONAMENTOS', tier: 'B', purpose: 'Organic growth triggers', actionable: true },
  { id: 'route-planning', name: 'Today\'s Route', intentZone: 'OPERAÇÃO', tier: 'B', purpose: 'Physical logistics speed', actionable: true },
  
  // C TIER: Secondary Administrative
  { id: 'team-management', name: 'Team & Roles', intentZone: 'ADMINISTRAÇÃO', tier: 'C', purpose: 'Account delegation', actionable: true },
  { id: 'company-identity', name: 'Company Settings', intentZone: 'ADMINISTRAÇÃO', tier: 'C', purpose: 'Branding and fiscal data', actionable: true },
  { id: 'profit-analysis', name: 'Profit Analysis', intentZone: 'RECEITA', tier: 'C', purpose: 'Margin visibility', actionable: false },
  
  // D TIER: Hidden/Noise Technical
  { id: 'sync-logs', name: 'Technical Sync Logs', intentZone: 'ADMINISTRAÇÃO', tier: 'D', purpose: 'Debug (Hide)', actionable: false },
  { id: 'diagnostics', name: 'Diagnostics', intentZone: 'ADMINISTRAÇÃO', tier: 'D', purpose: 'System health (Hide)', actionable: false }
];
