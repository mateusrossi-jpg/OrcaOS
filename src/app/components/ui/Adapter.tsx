// src/app/components/ui/Adapter.tsx
import React from 'react';
import { Input as BaseInput } from './index';

type InputAdapterProps = Omit<React.ComponentProps<typeof BaseInput>, 'onChange'> & {
  /** Design‑system Input expects a string value */
  onValueChange: (value: string) => void;
};

export const InputAdapter: React.FC<InputAdapterProps> = ({ onValueChange, ...rest }) => (
  <BaseInput {...rest} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onValueChange((e.target as HTMLInputElement).value)} />
);

type TextAreaAdapterProps = Omit<React.HTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  /** Design‑system TextArea expects a string value */
  onValueChange: (value: string) => void;
  rows?: number;
  value?: string;
  className?: string;
};

export const TextAreaAdapter: React.FC<TextAreaAdapterProps> = ({ onValueChange, rows, value, className, ...rest }) => (
  <textarea
    rows={rows}
    value={value}
    className={className}
    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onValueChange(e.target.value)}
    {...rest}
  />
);
