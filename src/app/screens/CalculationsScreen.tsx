import { lazy } from 'react';
import type { UserPlan } from '../../core/access/featureAccess';
import type { CalculationCapture } from '../../core/types/workflow';
import type { ActiveWorkContext, AppTab } from '../appTypes';

const PricingWorkspace = lazy(() => import('../../features/calculators/components/PricingWorkspace').then((module) => ({ default: module.PricingWorkspace })));

interface CalculationsScreenProps {
  goTo: (tab: AppTab) => void;
  userPlan: UserPlan;
  onCaptureCalculation: (capture: CalculationCapture) => void;
  context: ActiveWorkContext;
  captures: CalculationCapture[];
}

export function CalculationsScreen({
  goTo,
  userPlan: activeUserPlan,
  onCaptureCalculation,
  context,
  captures
}: CalculationsScreenProps) {
  const linkedCalculationCount = context.activeWorkOrder
    ? captures.filter((capture) => capture.workOrderId === context.activeWorkOrder?.id).length
    : 0;
  
  const calculationContext = context.activeWorkOrder
    ? {
        label: 'Cálculo vinculado',
        title: context.activeWorkOrder.title,
      }
    : {
        label: 'Cálculo avulso',
        title: 'Sem atendimento ativo',
      };

  return (
    <section className="app-screen calculations-overview-screen">
      <header className="page-header">
        <div>
          <h1>Precificação</h1>
          <p>Cálculos comerciais para formar preço, calcular margem e entender seu lucro real.</p>
        </div>
      </header>

      <div className="metric-grid compact-metric-grid">
        <article className="metric-card">
          <span>Modo de uso</span>
          <strong>{context.activeWorkOrder ? 'Vinculado' : 'Consulta avulsa'}</strong>
          <small>{calculationContext.title}</small>
        </article>
        <article className="metric-card">
          <span>Resultados</span>
          <strong>{context.activeWorkOrder ? linkedCalculationCount : 0}</strong>
          <small>{context.activeWorkOrder ? 'No atendimento atual' : 'Nenhum atendimento ativo'}</small>
        </article>
      </div>

      <div className="aferix-panel-card">
        <header className="section-header">
          <div>
            <span className="orca-kicker">Comercial</span>
            <h2>Ferramentas financeiras</h2>
            <p>Precificação, margem, markup e taxas.</p>
          </div>
        </header>
        
        <PricingWorkspace 
          userPlan={activeUserPlan} 
          onUpgradeRequest={() => goTo('store')} 
          onCaptureCalculation={onCaptureCalculation} 
        />
      </div>
    </section>
  );
}
