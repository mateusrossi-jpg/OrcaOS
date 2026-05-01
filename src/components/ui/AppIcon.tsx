import type { LucideIcon } from 'lucide-react';

type AppIconVariant = 'nav' | 'module' | 'calculator' | 'hero' | 'badge';
type AppIconTone = 'green' | 'blue' | 'orange' | 'gray' | 'danger';

interface AppIconProps {
  icon: LucideIcon;
  label?: string;
  variant?: AppIconVariant;
  tone?: AppIconTone;
  active?: boolean;
  size?: number;
  className?: string;
}

export function AppIcon({
  icon: Icon,
  label,
  variant = 'module',
  tone = 'green',
  active = false,
  size,
  className,
}: AppIconProps) {
  const iconSize = size ?? (variant === 'hero' ? 30 : variant === 'nav' ? 22 : 24);
  const classes = ['orca-app-icon', `variant-${variant}`, `tone-${tone}`, active ? 'is-active' : '', className ?? ''].filter(Boolean).join(' ');

  return (
    <span className={classes} aria-hidden={label ? undefined : true} aria-label={label} role={label ? 'img' : undefined}>
      <Icon size={iconSize} strokeWidth={2.15} />
    </span>
  );
}
