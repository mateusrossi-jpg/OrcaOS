export type AferixRole = 'FIELD' | 'SALES' | 'MANAGER' | 'OWNER' | 'CUSTOMER';

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
    features: ['REVENUE_INBOX', 'PROPOSALS', 'APPROVALS', 'FORECAST'],
    defaultRoute: '/sales'
  },
  MANAGER: {
    features: ['OPERATIONS', 'REVENUE', 'CONTRACTS', 'TEAM', 'CRITICAL_CLIENTS'],
    defaultRoute: '/manager'
  },
  OWNER: {
    features: ['MRR', 'REVENUE_ALL', 'CHURN', 'WORKFORCE', 'PROPOSALS_ALL', 'CONTRACTS_ALL'],
    defaultRoute: '/owner'
  },
  CUSTOMER: {
    features: ['PORTAL'],
    defaultRoute: '/portal'
  }
};

export const hasFeature = (role: AferixRole, feature: string) => {
  return RoleFeatureMatrix[role].features.includes(feature);
};
