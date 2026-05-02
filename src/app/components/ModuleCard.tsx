import { planLabel } from '../orcaAppData';
import type { ModuleCardData } from '../orcaAppTypes';

interface ModuleCardProps {
  module: ModuleCardData;
  compact?: boolean;
  onOpen?: () => void;
}

export function ModuleCard({ module, compact = false, onOpen }: ModuleCardProps) {
  return (
    <button className={module.available ? 'module-app-card' : 'module-app-card disabled'} type="button" onClick={onOpen}>
      <span className={`app-icon tone-${module.tone}`}>{module.icon}</span>
      <span className="module-card-body"><strong>{module.title}</strong><small>{compact ? module.count : module.description}</small></span>
      <em className={`module-plan-pill ${module.plan}`}>{planLabel(module.plan)}</em>
      {compact && <span className="chevron">›</span>}
    </button>
  );
}
