import type { Meta } from '@storybook/react';
import { Card, ValueCard } from '../ui/system/Cards';
import { HeroCard } from '../components/HeroCard';
import { ListCard, ListItem, OpsChip, StatusPill, PrimaryButton } from '../app/components/ui';
import { PageHeader } from '../ui/system';
import { CheckCircle, Search, Calendar, FileText, User } from 'lucide-react';

const meta = {
  title: 'Business/Layouts',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const HomeLayout = {
  render: () => (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-md flex flex-col gap-8">
        <PageHeader title="Aferix OS" />
        
        <HeroCard primaryValue="R$ 42.500" subtitle="RECEITA PROJETADA MÊS ATUAL">
          <div className="mt-4 flex gap-2">
            <OpsChip label="META 50K" accent="orange" />
          </div>
        </HeroCard>
        
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-bold text-lg">Oportunidades</h3>
          <Card variant="default" padding="sm" className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-bold">Troca de Compressor 60k</h4>
              <p className="text-[var(--text-secondary)] text-sm">Empresa Alfa S.A.</p>
            </div>
            <div className="text-right">
              <p className="text-[var(--accent-gold)] font-bold">R$ 4.200</p>
              <StatusPill status="iniciado" />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <PrimaryButton>NOVO ORÇAMENTO</PrimaryButton>
        </div>
      </div>
    </div>
  ),
};

export const AgendaLayout = {
  render: () => (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-md flex flex-col gap-8">
        <PageHeader title="Agenda" />
        
        <div className="flex gap-4 mb-4">
          <OpsChip label="HOJE" accent="blue" />
          <OpsChip label="AMANHÃ" accent="default" />
          <OpsChip label="ATRASADAS" accent="red" />
        </div>
        
        <ListCard title="EM EXECUÇÃO">
          <ListItem 
            title="Conserto de Vazamento" 
            context="Hoje, 14:00 • Shopping Center" 
            status={<StatusPill status="execucao" />} 
          />
        </ListCard>
        
        <ListCard title="AGENDADAS">
          <ListItem 
            title="Manutenção Preventiva" 
            context="Amanhã, 09:00 • Condomínio Parque" 
            status={<StatusPill status="aprovado" />} 
          />
          <ListItem 
            title="Instalação Split 12k" 
            context="Quarta, 14:00 • Residência Silva" 
            status={<StatusPill status="aprovado" />} 
          />
        </ListCard>
      </div>
    </div>
  ),
};

export const FinanceLayout = {
  render: () => (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-md flex flex-col gap-8">
        <PageHeader title="Financeiro" />
        
        <div className="grid grid-cols-2 gap-4">
          <Card variant="glass" padding="md" className="col-span-2">
            <h4 className="text-[var(--text-secondary)] text-xs font-mono font-bold tracking-widest uppercase mb-1">A Receber</h4>
            <p className="text-[var(--accent-green)] text-3xl font-black num">R$ 8.400</p>
          </Card>
          
          <ValueCard label="LUCRO REAL" value="R$ 3.200" trend="+5%" />
          <ValueCard label="CUSTOS" value="R$ 1.100" />
        </div>
        
        <ListCard title="HISTÓRICO">
          <ListItem 
            title="Instalação Split" 
            context="Hoje" 
            value="R$ 1.500"
            status={<StatusPill status="paid" />} 
          />
          <ListItem 
            title="Manutenção" 
            context="Ontem" 
            value="R$ 400"
            status={<StatusPill status="paid" />} 
          />
        </ListCard>
      </div>
    </div>
  ),
};

export const Client360Layout = {
  render: () => (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-md flex flex-col gap-8">
        <PageHeader title="Cliente 360" />
        
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
        
        <div className="flex gap-2">
          <PrimaryButton className="flex-1 text-xs">NOVA O.S.</PrimaryButton>
          <PrimaryButton className="flex-1 text-xs" tone="default">NOVA PROPOSTA</PrimaryButton>
        </div>
        
        <ListCard title="TIMELINE">
          <ListItem 
            title="O.S. Finalizada" 
            context="Há 2 dias" 
            status={<StatusPill status="done" />} 
          />
          <ListItem 
            title="Proposta Aprovada" 
            context="Há 1 semana" 
            status={<StatusPill status="aprovado" />} 
          />
        </ListCard>
      </div>
    </div>
  ),
};
