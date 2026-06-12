import type { Meta, StoryObj } from '@storybook/react';
import { QueueEmptyState } from '../app/components/ui';
import { Badge, StatusPill, StatusDot, OpsChip } from '../ui/system/Badges';
import { ShieldCheck, Zap } from 'lucide-react';

const meta = {
  title: 'Core/Feedback',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const Badges = {
  render: () => (
    <div className="flex flex-col gap-4 bg-[var(--bg-surface)] p-8 rounded-xl border border-white/5">
      <div className="flex gap-4">
        <Badge variant="default" label="DEFAULT" />
        <Badge variant="accent" label="ACCENT" />
        <Badge variant="success" label="SUCCESS" />
      </div>
      <div className="flex gap-4">
        <Badge variant="danger" label="DANGER" />
        <Badge variant="warning" label="WARNING" />
        <Badge variant="info" label="INFO" />
        <Badge variant="muted" label="MUTED" />
      </div>
    </div>
  ),
};

export const StatusPills = {
  render: () => (
    <div className="flex flex-col gap-4 bg-[var(--bg-surface)] p-8 rounded-xl border border-white/5">
      <div className="flex gap-4">
        <StatusPill status="iniciado" />
        <StatusPill status="enviado" />
        <StatusPill status="aprovado" />
      </div>
      <div className="flex gap-4">
        <StatusPill status="autorizado" />
        <StatusPill status="execucao" />
        <StatusPill status="finalizado" />
      </div>
      <div className="flex gap-4">
        <StatusPill status="pending" />
        <StatusPill status="rejected" />
        <StatusPill status="cancelled" />
      </div>
    </div>
  ),
};

export const OperationalChips = {
  render: () => (
    <div className="flex gap-4 bg-[var(--bg-surface)] p-8 rounded-xl border border-white/5">
      <OpsChip label="TECNICO" accent="blue" />
      <OpsChip label="CRÍTICO" accent="red" icon={<Zap size={10} />} />
      <OpsChip label="PAGO" accent="green" icon={<ShieldCheck size={10} />} />
      <OpsChip label="AGENDADO" accent="orange" />
      <OpsChip label="ARQUIVADO" accent="default" />
    </div>
  ),
};

export const EmptyStates = {
  render: () => (
    <div className="w-[400px]">
      <QueueEmptyState 
        title="Nenhum item encontrado" 
        meta="Tudo certo por aqui. Não há itens na fila de processamento atual." 
      />
    </div>
  ),
};

export const Dots = {
  render: () => (
    <div className="flex gap-4 bg-[var(--bg-surface)] p-8 rounded-xl border border-white/5">
      <StatusDot tone="success" />
      <StatusDot tone="warning" />
      <StatusDot tone="danger" />
      <StatusDot tone="info" />
    </div>
  ),
};
