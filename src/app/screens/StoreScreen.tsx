import { memo } from 'react';
import { 
  ScreenContainer, 
  SurfaceCard, 
  SectionLabel,
  SemanticBadge,
  ExecutiveSummaryGrid,
  ValueBlock,
  AppHeader,
  OpsChip,
  InteractiveRow
} from '../../ui/system';
import { planStatusTitle } from '../utils/planHelpers';
import { proPlanBenefits } from '../../core/access/planStrategy';
import { Star, CheckCircle2, ChevronLeft, CreditCard, ShieldCheck, Zap, Info, Activity } from 'lucide-react';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import { cn } from '../../utils/ui';
import { formatCurrencyBRL } from '../../utils/formatters';

interface StoreScreenProps {
  account: AferixAccountState;
  onBack?: () => void;
  onAccountChange?: () => void;
}

/**
 * StoreScreen: License and subscription management.
 * Refactored for absolute Home DNA parity (Phase 4D).
 */
export const StoreScreen = memo(function StoreScreen({ account, onBack }: StoreScreenProps) {
  const chips = (
    <>
      <OpsChip icon={<Star size={11} />} label={account.plan.toUpperCase()} accent="orange" />
      <OpsChip icon={<ShieldCheck size={11} />} label="VERIFICADA" accent="green" />
      <OpsChip icon={<Info size={11} />} label="CONTA_EARLY_ADOPTER" accent={false} />
    </>
  );

  return (
    <ScreenContainer className="pb-32 pt-0 px-0">
      {/* ━━━ AUTHORITATIVE HEADER ━━━ */}
      <AppHeader 
        title="Licença." 
        onBack={onBack}
        chips={chips}
      />

      <div className="px-6 flex flex-col gap-6">
        
        {/* ━━━ EXECUTIVE COCKPIT ━━━ */}
        <ExecutiveSummaryGrid>
           <ValueBlock 
            label="Plano" 
            value={account.plan === 'pro' ? 'PREMIUM' : 'BETA'} 
            icon={<ShieldCheck size={12} className="text-[var(--accent-green)]" />} 
            variant="success"
           />
           <ValueBlock 
            label="Expiração" 
            value="VITALÍCIA" 
            icon={<Zap size={12} className="text-[var(--accent-gold)]" />} 
            variant="warning"
           />
        </ExecutiveSummaryGrid>

        <SurfaceCard variant="cinematic" padding="lg">
           <div className="flex flex-col items-center text-center py-4 relative z-10">
              <SemanticBadge variant="accent" label={`CONTA_${account.plan.toUpperCase()}`} className="mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Status da Assinatura</h2>
              <p className="text-sm font-medium text-white/40 leading-relaxed max-w-[240px]">Sua licença atual foi concedida permanentemente pelo programa Early Adopter.</p>
              
              <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 gap-8 w-full">
                 <div className="flex flex-col gap-1 text-left">
                    <SectionLabel className="!text-[8.5px]">PROX_COBRANÇA</SectionLabel>
                    <span className="text-[17px] font-bold text-white num">R$ 0,00</span>
                 </div>
                 <div className="flex flex-col gap-1 text-right">
                    <SectionLabel className="!text-[8.5px]">MÉTODO_PGTO</SectionLabel>
                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest font-mono mt-1">Isento Beta</span>
                 </div>
              </div>
           </div>
        </SurfaceCard>

        <div className="flex flex-col gap-3">
           <SectionLabel className="ml-1">Recursos Habilitados</SectionLabel>
           <SurfaceCard padding="none" className="overflow-hidden">
              {proPlanBenefits.slice(0, 5).map((b, i) => (
                <InteractiveRow 
                  key={b.title} 
                  className={i !== 0 ? "border-t border-white/[0.05]" : ""}
                >
                   <div className="flex items-center gap-4 w-full">
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(50,215,75,0.05)", border: "1px solid rgba(50,215,75,0.15)", display: "grid", placeItems: "center" }} className="shrink-0">
                         <CheckCircle2 className="h-4 w-4 text-[var(--accent-green)]" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[14px] font-bold text-white uppercase">{b.title}</span>
                         <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider">{b.description?.slice(0, 40)}...</span>
                      </div>
                   </div>
                </InteractiveRow>
              ))}
           </SurfaceCard>
        </div>

        <SurfaceCard className="bg-[var(--accent-gold)]/5 border-[var(--accent-gold)]/20" padding="lg">
          <div className="flex items-start gap-4">
            <Star className="h-5 w-5 text-[var(--accent-gold)] shrink-0" fill="currentColor" />
            <div>
              <p className="text-sm font-bold text-[var(--accent-gold)] mb-1 uppercase tracking-tight">Vantagem Exclusiva Beta</p>
              <p className="text-[11px] text-[var(--accent-gold)]/60 leading-relaxed">Você possui acesso a todos os futuros módulos Pro sem custo adicional como agradecimento por ser um dos primeiros usuários do Aferix.</p>
            </div>
          </div>
        </SurfaceCard>

      </div>
    </ScreenContainer>
  );
});
