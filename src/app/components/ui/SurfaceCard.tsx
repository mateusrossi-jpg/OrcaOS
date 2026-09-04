import React, { memo, type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '../../../utils/ui';

export type PaddingSize = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface SurfaceCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  padding?: PaddingSize;
  variant?: 'default' | 'elevated' | 'cinematic';
  as?: React.ElementType;
}

/**
 * SurfaceCard: Canonical Golden V12 Container Surface
 * Standard: bg-[#363638] border border-white/5 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.12)]
 * Elevated/Cinematic: bg-[#3A3A3C] border border-white/10 rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.16)]
 */
export const SurfaceCard: React.FC<SurfaceCardProps> = memo(({
  children,
  padding = 'md',
  variant = 'default',
  as: Component = 'section',
  className = '',
  ...props
}) => {
  const paddingMap: Record<PaddingSize, string> = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const variantMap = {
    default: 'bg-[#363638] border border-white/5 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
    elevated: 'bg-[#3A3A3C] border border-white/10 rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.16)]',
    cinematic: 'bg-[#3A3A3C] border border-white/10 rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.16)]',
  };

  return (
    <Component
      className={cn(
        "transition-all duration-200 text-white relative",
        variantMap[variant] || variantMap.default,
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

export default SurfaceCard;
