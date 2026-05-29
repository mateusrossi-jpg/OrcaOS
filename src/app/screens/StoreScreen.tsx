import { 
  PageTitle, 
  PageShell, 
  Badge, 
  ContextBanner, 
  Card, 
  SectionLabel, 
  MetricCard 
} from '../components/ui';
import { planStatusTitle } from '../utils/planHelpers';
import { proPlanBenefits } from '../../core/access/planStrategy';
import { Star, CheckCircle2 } from 'lucide-react';

interface StoreScreenProps {
  account: { plan: string };
  onBack?: () => void;
  onAccountChange?: () => void;
}

/**
 * StoreScreen: License and subscription management.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export function StoreScreen({ account, onBack }: StoreScreenProps) {
  return (
    <PageShell>
      <PageTitle 
        onBack={onBack}
        eyebrow="Configurações" 
        title="Licença e Plano" 
        subtitle="Gerencie os detalhes da sua assinatura e recursos ativos."
      />

      <div className="flex flex-col gap-lg">

        <Card className="p-card text-center flex flex-col items-center">
          <Badge tone="warning" className="mb-6">CONTA {account.plan.toUpperCase()}</Badge>
          <h2 className="text-h2 text-[var(--text-primary)] mb-2">Status da Assinatura</h2>
          <p className="text-ui-sm text-[var(--text-muted)] leading-relaxed max-w-[280px]">Sua licença atual é vitalícia durante o período Beta.</p>

          <div className="mt-10 pt-8 border-t var(--border-subtle) grid grid-cols-2 gap-md w-full">
            <MetricCard 
              label="Plano Atual" 
              value={planStatusTitle(account)} 
            />
            <MetricCard 
              label="Próxima Cobrança" 
              value="R$ 0,00" 
            />
          </div>
        </Card>

        <Card className="p-card">
          <SectionLabel className="mt-0 mb-8">Recursos Habilitados</SectionLabel>
          <ul className="flex flex-col gap-sm">
            {proPlanBenefits.slice(0, 4).map(b => (
              <li key={b.title} className="flex items-start gap-md text-ui-base font-medium leading-snug">
                <CheckCircle2 className="h-5 w-5 text-[var(--accent-green)] shrink-0" />
                <span className="text-[var(--text-secondary)]">{b.title}</span>
              </li>
            ))}
          </ul>
        </Card>

        <ContextBanner
          title="Aferix Pro em Preparação"
          meta="Novos recursos como sincronismo avançado e multiusuário serão liberados automaticamente para sua conta."
          icon={<Star className="h-5 w-5" />}
        />
      </div>
    </PageShell>
  );
}
