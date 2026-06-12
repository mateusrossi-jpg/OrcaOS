import type { Meta, StoryObj } from '@storybook/react';
import { Card, ValueCard, ValueBlock } from '../ui/system/Cards';
import { Modal, ListCard, ListItem } from '../app/components/ui';

const meta = {
  title: 'Core/Containers',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const SurfaceCard = {
  render: () => (
    <Card variant="default">
      <h3 className="text-white text-lg font-bold">Surface Card</h3>
      <p className="text-[var(--text-secondary)] mt-2">Container padrão para blocos de informação.</p>
    </Card>
  ),
};

export const ElevatedCard = {
  render: () => (
    <Card variant="elevated">
      <h3 className="text-white text-lg font-bold">Elevated Card</h3>
      <p className="text-[var(--text-secondary)] mt-2">Container com sombra e profundidade maior.</p>
    </Card>
  ),
};

export const CinematicCard = {
  render: () => (
    <Card variant="cinematic">
      <h3 className="text-[var(--accent-gold)] text-lg font-bold">Cinematic Card</h3>
      <p className="text-white mt-2">Container hero com iluminação dourada sutil.</p>
    </Card>
  ),
};

export const ValueCards = {
  render: () => (
    <div className="flex gap-4">
      <ValueCard label="FATURAMENTO" value="R$ 15.000" trend="+12%" />
      <ValueCard label="OS ABERTAS" value="42" />
    </div>
  ),
};

export const ValueBlocks = {
  render: () => (
    <div className="flex gap-4">
      <ValueBlock label="AGENDADO" value="5" variant="default" />
      <ValueBlock label="ATRASO" value="2" variant="danger" />
      <ValueBlock label="PAGO" value="R$ 5k" variant="success" />
    </div>
  ),
};

export const StandardListCard = {
  render: () => (
    <ListCard title="PRÓXIMAS MANUTENÇÕES">
      <ListItem title="Ar Condicionado Split 12k" context="Sala de Reuniões" value="R$ 150" />
      <ListItem title="Troca de Compressor" context="Recepção" value="R$ 800" />
    </ListCard>
  ),
};

export const CommandModal = {
  render: () => (
    <div className="h-[400px]">
      <Modal isOpen={true} title="APROVAR ORÇAMENTO" onClose={() => {}}>
        <p>Tem certeza que deseja aprovar este orçamento? Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  ),
};
