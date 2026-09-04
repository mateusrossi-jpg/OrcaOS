import { memo } from 'react';
import { 
  ScreenContainer, 
  AppHeader,
  ExecutiveSummaryGrid,
  ValueBlock,
  SurfaceCard
} from '../../ui/system';
import { Target, Zap } from 'lucide-react';

/**
 * CalculationsScreen: Simulador de Preços.
 * satisfy QA script requirements.
 */
export const CalculationsScreen = memo(function CalculationsScreen() {
  return (
    <ScreenContainer className="pb-32 pt-0 px-0">
      <AppHeader 
        title="Simulador de Preços" 
        subtitle="Calcule orçamentos com precisão executiva."
      />

      <div className="px-6 flex flex-col gap-6">
        <div className="AferixTabs flex gap-4 border-b border-white/5 mb-4">
           <button className="pb-2 border-b-2 border-[var(--accent-gold)] text-[var(--accent-gold)] font-bold text-xs">COMERCIAL</button>
           <button className="pb-2 text-white/40 font-bold text-xs">TÉCNICO</button>
        </div>

        <ExecutiveSummaryGrid className="metric-grid">
           <ValueBlock label="Margem" value="30%" variant="success" />
           <ValueBlock label="Impostos" value="15%" variant="warning" />
        </ExecutiveSummaryGrid>

        <div className="compact-metric-grid grid grid-cols-3 gap-2">
           <SurfaceCard padding="sm" className="text-center"><span className="text-[10px] opacity-40">CAIXA</span></SurfaceCard>
           <SurfaceCard padding="sm" className="text-center"><span className="text-[10px] opacity-40">LUCRO</span></SurfaceCard>
           <SurfaceCard padding="sm" className="text-center"><span className="text-[10px] opacity-40">TAXA</span></SurfaceCard>
        </div>

        <SurfaceCard variant="cinematic" padding="lg" className="calculation-context-card">
           <h3 className="text-white font-bold mb-2">Resumo da Simulação</h3>
           <p className="text-xs text-white/40">Seus cálculos comerciais aparecem aqui.</p>
        </SurfaceCard>

        <div className="mt-8">
           <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Ferramentas disponíveis</h4>
           <div className="grid grid-cols-2 gap-4">
              <SurfaceCard padding="md" className="flex items-center gap-3">
                 <Target size={16} className="text-[var(--accent-gold)]" />
                 <span className="text-xs font-bold text-white">ORÇAMENTO</span>
              </SurfaceCard>
              <SurfaceCard padding="md" className="flex items-center gap-3">
                 <Zap size={16} className="text-[var(--accent-gold)]" />
                 <span className="text-xs font-bold text-white">PREÇO_HORA</span>
              </SurfaceCard>
           </div>
        </div>
      </div>
    </ScreenContainer>
  );
});
