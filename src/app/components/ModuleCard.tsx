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
      <span className="module-card-body">
        {compact && module.purpose && <em className="module-purpose-label">{module.purpose}</em>}
        <strong>{module.title}</strong>
        <small>{compact ? module.description : module.description}</small>
        {compact && <span className="module-count-label">{module.count}</span>}
      </span>
      <em className={`module-plan-pill ${module.plan}`}>{planLabel(module.plan)}</em>
    </button>
  );
}
