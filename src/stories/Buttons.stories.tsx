import type { Meta, StoryObj } from '@storybook/react';
import { Button, PrimaryButton, SecondaryButton, DangerButton, FAB } from '../app/components/ui';

const meta = {
  title: 'Core/Buttons',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => <PrimaryButton>AÇÃO PRINCIPAL</PrimaryButton>,
};

export const Secondary: Story = {
  render: () => <SecondaryButton>AÇÃO SECUNDÁRIA</SecondaryButton>,
};

export const Danger: Story = {
  render: () => <DangerButton>AÇÃO DESTRUTIVA</DangerButton>,
};

export const FloatingAction: Story = {
  render: () => (
    <div style={{ width: '300px', height: '300px', position: 'relative' }}>
      <FAB label="Novo" onClick={() => {}} />
    </div>
  ),
};
