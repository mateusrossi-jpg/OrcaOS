import { memo, type ReactNode } from 'react';
import { PrimaryPillButton } from '../../../ui/system/v12Components';
import { cn } from '../../../utils/ui';

export interface PrimaryCTAProps {
  /** Callback when the CTA is clicked */
  onClick?: () => void;
  /** Children (button label) */
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
}

/**
 * PrimaryCTA – Canonical Golden V12 high-contrast 56px action button.
 */
export const PrimaryCTA = memo(function PrimaryCTA({
  children,
  onClick,
  disabled = false,
  className = '',
  loading = false,
}: PrimaryCTAProps) {
  return (
    <PrimaryPillButton
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      className={cn("w-full", className)}
    >
      {children}
    </PrimaryPillButton>
  );
});

export default PrimaryCTA;
