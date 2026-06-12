import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input, Select, TextArea, MonetaryInput } from '../app/components/ui';

const meta = {
  title: 'Core/Inputs',
  component: Input,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StandardInput: Story = {
  render: () => <Input label="NOME DO CLIENTE" placeholder="Ex: Maria Silva" />,
};

export const SearchInputPattern: Story = {
  render: () => <Input label="BUSCA" placeholder="Buscar orçamentos..." type="search" />,
};

export const CurrencyInput: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return <MonetaryInput label="VALOR COBRADO" value={value} onChange={setValue} />;
  },
};

export const SelectInput: Story = {
  render: () => {
    const [value, setValue] = useState('1');
    return (
      <Select label="STATUS" value={value} onChange={setValue}>
        <option value="1">Aprovado</option>
        <option value="2">Pendente</option>
        <option value="3">Recusado</option>
      </Select>
    );
  },
};

export const DateInputType: Story = {
  render: () => <Input label="DATA AGENDADA" type="date" />,
};
