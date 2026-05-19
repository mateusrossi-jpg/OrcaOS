import React, { useState, useEffect } from 'react';

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function PriceInput({ value, onChange, label, placeholder, className }: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  useEffect(() => {
    if (value === 0 && displayValue === '') return;
    // Só atualiza se o valor numérico mudar externamente de forma significativa
    const numericDisplay = parseBRL(displayValue);
    if (numericDisplay !== value) {
      setDisplayValue(value > 0 ? formatBRL(value) : '');
    }
  }, [value]);

  const parseBRL = (val: string) => {
    const cleanValue = val.replace(/\D/g, '');
    return cleanValue ? parseInt(cleanValue, 10) / 100 : 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseBRL(rawValue);
    
    // Evitar zeros à esquerda e formatar
    if (numericValue === 0 && rawValue === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    setDisplayValue(formatBRL(numericValue));
    onChange(numericValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (value === 0) {
      setDisplayValue('');
    }
  };

  const handleBlur = () => {
    if (value === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(formatBRL(value));
    }
  };

  return (
    <label className={`budget-field ${className || ''}`}>
      {label && <span>{label}</span>}
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || 'R$ 0,00'}
      />
    </label>
  );
}

function parseBRL(val: string) {
  const cleanValue = val.replace(/\D/g, '');
  return cleanValue ? parseInt(cleanValue, 10) / 100 : 0;
}
