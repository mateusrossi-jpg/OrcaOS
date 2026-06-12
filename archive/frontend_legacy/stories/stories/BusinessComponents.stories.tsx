import type { Meta, StoryObj } from '@storybook/react';
import { Card, ValueCard } from '../ui/system/Cards';
import { HeroCard } from '../components/HeroCard';
import { ListCard, ListItem, OpsChip, StatusPill } from '../app/components/ui';

const meta = {
  title: 'Business/Components',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const RevenueHero = {
  render: () => (
    <div className="w-full max-w-md">
      <HeroCard
        primaryValue="R$ 42.500"
        subtitle="RECEITA PROJETADA MÊS ATUAL"
      >
        <div className="mt-4 flex gap-2">
          <OpsChip label="META 50K" accent="orange" />
        </div>
      </HeroCard>
    </div>
  ),
};

export const OpportunityCard = {
  render: () => (
    <div className="w-full max-w-md">
      <Card variant="default" padding="sm" className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-bold text-lg">Troca de Compressor 60k</h4>
          <p className="text-[var(--text-secondary)] text-sm">Empresa Alfa S.A. • Ar Central</p>
        </div>
        <div className="text-right">
          <p className="text-[var(--accent-gold)] font-bold text-lg">R$ 4.200</p>
          <StatusPill status="iniciado" />
        </div>
      </Card>
    </div>
  ),
};

export const ClientSnapshotCard = {
  render: () => (
    <div className="w-full max-w-md">
      <Card variant="elevated" padding="md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-white font-bold text-xl">Hospital São Lucas</h3>
            <p className="text-[var(--text-secondary)]">Cliente Premium • 5 Equipamentos</p>
          </div>
          <OpsChip label="CONTRATO ATIVO" accent="green" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ValueCard label="LTV" value="R$ 124k" />
          <ValueCard label="CHAMADOS" value="3 abertos" />
        </div>
      </Card>
    </div>
  ),
};

export const ProposalCard = {
  render: () => (
    <div className="w-full max-w-md">
      <ListCard>
        <ListItem 
          title="Manutenção Preventiva Semestral" 
          context="Condomínio Residencial Parque" 
          value="R$ 1.250" 
          status={<StatusPill status="enviado" />} 
          onClick={() => {}}
        />
      </ListCard>
    </div>
  ),
};

export const WorkOrderCard = {
  render: () => (
    <div className="w-full max-w-md">
      <ListCard>
        <ListItem 
          title="Conserto de Vazamento" 
          context="Hoje, 14:00 • Shopping Center" 
          status={<StatusPill status="execucao" />} 
          onClick={() => {}}
        />
      </ListCard>
    </div>
  ),
};

export const FinanceCard = {
  render: () => (
    <div className="w-full max-w-md flex flex-col gap-4">
      <Card variant="glass" padding="md">
        <h4 className="text-[var(--text-secondary)] text-xs font-mono font-bold tracking-widest uppercase mb-1">A Receber</h4>
        <p className="text-[var(--accent-green)] text-3xl font-black num">R$ 8.400</p>
        <p className="text-[var(--text-tertiary)] text-xs mt-2">Vencimento em 15/06</p>
      </Card>
    </div>
  ),
};
