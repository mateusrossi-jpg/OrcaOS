import { db } from '../storage/dexieDatabase';

export interface AtlasItem {
  id: string;
  name: string;
  route: string;
  module: string;
  status: 'operational' | 'beta' | 'planned';
  usageCount: number;
  lastAccess?: string;
  revenueImpact: 'generation' | 'protection' | 'recovery' | 'retention' | 'cost_reduction' | 'none';
  cognitiveLoad: 'low' | 'medium' | 'high' | 'critical';
  navDepth: number;
}

/**
 * SystemAtlasService
 * RC13: Responsible for mapping and auditing platform scope.
 */
export class SystemAtlasService {
  async getAtlas(): Promise<Record<string, AtlasItem[]>> {
    // In a real scenario, this would be partially derived from router config and telemetry
    const atlas: Record<string, AtlasItem[]> = {
      HOME: [
        { id: 'h1', name: 'Executive Home', route: 'dashboard', module: 'Home', status: 'operational', usageCount: 1250, revenueImpact: 'retention', cognitiveLoad: 'low', navDepth: 1 },
        { id: 'h2', name: 'Morning Briefing', route: 'dashboard', module: 'Home', status: 'operational', usageCount: 450, revenueImpact: 'generation', cognitiveLoad: 'low', navDepth: 1 },
        { id: 'h3', name: 'Revenue Radar', route: 'dashboard', module: 'Home', status: 'operational', usageCount: 300, revenueImpact: 'protection', cognitiveLoad: 'low', navDepth: 1 },
        { id: 'h4', name: 'Next Money', route: 'next-money', module: 'Home', status: 'operational', usageCount: 890, revenueImpact: 'recovery', cognitiveLoad: 'medium', navDepth: 1 },
      ],
      CLIENTS: [
        { id: 'c1', name: 'Client List', route: 'clients', module: 'CRM', status: 'operational', usageCount: 2100, revenueImpact: 'retention', cognitiveLoad: 'low', navDepth: 1 },
        { id: 'c2', name: 'Client 360', route: 'clients/:id', module: 'CRM', status: 'operational', usageCount: 1500, revenueImpact: 'generation', cognitiveLoad: 'medium', navDepth: 2 },
        { id: 'c3', name: 'Asset Dossier', route: 'assets', module: 'CRM', status: 'operational', usageCount: 600, revenueImpact: 'protection', cognitiveLoad: 'medium', navDepth: 2 },
        { id: 'c4', name: 'Revenue Dossier', route: 'clients/:id', module: 'CRM', status: 'operational', usageCount: 400, revenueImpact: 'generation', cognitiveLoad: 'medium', navDepth: 2 },
      ],
      COMMERCIAL: [
        { id: 'co1', name: 'Pipeline', route: 'budgets', module: 'Sales', status: 'operational', usageCount: 1800, revenueImpact: 'generation', cognitiveLoad: 'medium', navDepth: 1 },
        { id: 'co2', name: 'Proposal Cart', route: 'new-budget', module: 'Sales', status: 'operational', usageCount: 950, revenueImpact: 'generation', cognitiveLoad: 'medium', navDepth: 2 },
        { id: 'co3', name: 'Proposal Kits', route: 'new-budget', module: 'Sales', status: 'operational', usageCount: 320, revenueImpact: 'generation', cognitiveLoad: 'low', navDepth: 3 },
        { id: 'co4', name: 'Catalog', route: 'catalog', module: 'Sales', status: 'operational', usageCount: 450, revenueImpact: 'cost_reduction', cognitiveLoad: 'medium', navDepth: 1 },
        { id: 'co5', name: 'Follow-Up Engine', route: 'next-money', module: 'Sales', status: 'operational', usageCount: 280, revenueImpact: 'recovery', cognitiveLoad: 'low', navDepth: 2 },
      ],
      OPERATIONS: [
        { id: 'o1', name: 'Operations Hub', route: 'base', module: 'Ops', status: 'operational', usageCount: 2500, revenueImpact: 'cost_reduction', cognitiveLoad: 'high', navDepth: 1 },
        { id: 'o2', name: 'Execution Cockpit', route: 'base', module: 'Ops', status: 'operational', usageCount: 2200, revenueImpact: 'cost_reduction', cognitiveLoad: 'medium', navDepth: 2 },
        { id: 'o3', name: 'Voice Notes', route: 'base', module: 'Ops', status: 'operational', usageCount: 1100, revenueImpact: 'retention', cognitiveLoad: 'low', navDepth: 3 },
        { id: 'o4', name: 'Checklist Manager', route: 'checklist-manager', module: 'Ops', status: 'operational', usageCount: 150, revenueImpact: 'none', cognitiveLoad: 'high', navDepth: 2 },
      ],
      FINANCE: [
        { id: 'f1', name: 'Receivables', route: 'money', module: 'Finance', status: 'operational', usageCount: 1200, revenueImpact: 'recovery', cognitiveLoad: 'medium', navDepth: 1 },
        { id: 'f2', name: 'Profit Analysis', route: 'next-money', module: 'Finance', status: 'operational', usageCount: 350, revenueImpact: 'protection', cognitiveLoad: 'medium', navDepth: 2 },
        { id: 'f3', name: 'Cash Flow', route: 'money', module: 'Finance', status: 'operational', usageCount: 900, revenueImpact: 'retention', cognitiveLoad: 'low', navDepth: 2 },
      ],
      INTELLIGENCE: [
        { id: 'i1', name: 'Next Money Engine', route: 'next-money', module: 'Intelligence', status: 'operational', usageCount: 890, revenueImpact: 'recovery', cognitiveLoad: 'medium', navDepth: 1 },
        { id: 'i2', name: 'Forecast Engine', route: 'next-money', module: 'Intelligence', status: 'operational', usageCount: 200, revenueImpact: 'protection', cognitiveLoad: 'medium', navDepth: 2 },
        { id: 'i3', name: 'Reputation Engine', route: 'reputation', module: 'Intelligence', status: 'operational', usageCount: 150, revenueImpact: 'generation', cognitiveLoad: 'low', navDepth: 1 },
      ],
      SYSTEM: [
        { id: 's1', name: 'Cloud Sync', route: 'settings', module: 'System', status: 'operational', usageCount: 4500, revenueImpact: 'protection', cognitiveLoad: 'low', navDepth: 2 },
        { id: 's2', name: 'Team/Roles', route: 'team', module: 'System', status: 'operational', usageCount: 200, revenueImpact: 'none', cognitiveLoad: 'medium', navDepth: 2 },
        { id: 's3', name: 'Diagnostics', route: 'settings', module: 'System', status: 'operational', usageCount: 50, revenueImpact: 'none', cognitiveLoad: 'high', navDepth: 3 },
      ]
    };
    return atlas;
  }

  calculateValueScore(item: AtlasItem): number {
    const revenueWeight = { generation: 40, protection: 30, recovery: 35, retention: 25, cost_reduction: 20, none: 0 };
    const usageWeight = Math.min(30, (item.usageCount / 100));
    const loadWeight = { low: 10, medium: 5, high: 0, critical: -10 };
    
    return revenueWeight[item.revenueImpact] + usageWeight + loadWeight[item.cognitiveLoad];
  }

  getTier(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
    if (score >= 70) return 'S';
    if (score >= 50) return 'A';
    if (score >= 30) return 'B';
    if (score >= 10) return 'C';
    return 'D';
  }
}

export const systemAtlasService = new SystemAtlasService();
