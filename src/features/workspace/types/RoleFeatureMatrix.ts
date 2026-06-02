export type AferixRole = 'FIELD' | 'SALES' | 'MANAGER' | 'OWNER' | 'CUSTOMER' | 'SOLO';

export interface RoleConfig {
  features: string[];
  defaultRoute: string;
}

export const RoleFeatureMatrix: Record<AferixRole, RoleConfig> = {
  FIELD: {
    features: ['AGENDA', 'CHECKLIST', 'ASSETS', 'SIGNATURES'],
    defaultRoute: '/field'
  },
  SALES: {
    features: ['REVENUE_INBOX', 'PROPOSALS', 'APPROVALS', 'FORECAST', 'CLIENTS'],
    defaultRoute: '/sales'
  },
  MANAGER: {
    features: ['OPERATIONS', 'REVENUE', 'CONTRACTS', 'TEAM', 'CRITICAL_CLIENTS', 'AGENDA', 'DISPATCH'],
    defaultRoute: '/manager'
  },
  OWNER: {
    features: ['MRR', 'REVENUE_ALL', 'CHURN', 'WORKFORCE', 'PROPOSALS_ALL', 'CONTRACTS_ALL', 'TEAM', 'CLIENTS'],
    defaultRoute: '/owner'
  },
  CUSTOMER: {
    features: ['PORTAL'],
    defaultRoute: '/portal'
  },
  SOLO: {
    features: ['AGENDA', 'CHECKLIST', 'ASSETS', 'SIGNATURES', 'REVENUE_INBOX', 'PROPOSALS', 'CLIENTS', 'CONTRACTS', 'MRR', 'SETTINGS_ALL'],
    defaultRoute: '/solo'
  }
};

export const hasFeature = (role: AferixRole, feature: string) => {
  return RoleFeatureMatrix[role].features.includes(feature);
};
