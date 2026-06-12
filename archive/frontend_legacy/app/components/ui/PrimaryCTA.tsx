import { memo, ReactNode } from 'react';
import { PrimaryButton } from './index'; // Re‑exported from ui components

/**
 * PrimaryCTA – botão de chamada à ação premium.
 * Usa o visual padrão gold do Aferix e garante altura fixa (44 px).
 */
interface PrimaryCTAProps {
  /** Callback when the CTA is clicked */
  onClick?: () => void;
  /** Children (button label) */
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const PrimaryCTA = memo(function PrimaryCTA({
  children,
  onClick,
  disabled = false,
  className = '',
}: PrimaryCTAProps) {
  return (
    <PrimaryButton
      onClick={onClick}
      disabled={disabled}
      className={`aferix-btn-primary min-h-[var(--spacing-lg)] rounded-[var(--radius-md)] ${className}`}
    >
      {children}
    </PrimaryButton>
  );
});
