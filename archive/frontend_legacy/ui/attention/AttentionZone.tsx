import React, { type ReactNode, memo } from 'react';
import { cn } from '../../utils/ui';
import { AttentionPriority, AttentionContext } from './attentionContext';

interface AttentionZoneProps {
  priority: AttentionPriority;
  children: ReactNode;
  className?: string;
}

/**
 * AttentionZone: Orchestrates visual priority within a screen.
 * P0: Critical (Glow, Contrast)
 * P1: Primary (Standard)
 * P2: Secondary (Lower Opacity)
 * P3: Ambient (Minimal Contrast)
 */
export const AttentionZone = memo(({ 
  priority, 
  children, 
  className 
}: AttentionZoneProps) => {
  const map = {
    P0: "z-50 opacity-100 scale-[1.01] filter drop-shadow-glow brightness-110",
    P1: "z-10 opacity-100",
    P2: "z-0 opacity-70",
    P3: "z-0 opacity-40",
  };

  return (
    <AttentionContext.Provider value={priority}>
      <div className={cn(
        "transition-all duration-500",
        map[priority],
        className
      )}>
        {children}
      </div>
    </AttentionContext.Provider>
  );
});

export const Priority = {
  P0: ({ children, className }: { children: ReactNode; className?: string }) => <AttentionZone priority="P0" className={className}>{children}</AttentionZone>,
  P1: ({ children, className }: { children: ReactNode; className?: string }) => <AttentionZone priority="P1" className={className}>{children}</AttentionZone>,
  P2: ({ children, className }: { children: ReactNode; className?: string }) => <AttentionZone priority="P2" className={className}>{children}</AttentionZone>,
  P3: ({ children, className }: { children: ReactNode; className?: string }) => <AttentionZone priority="P3" className={className}>{children}</AttentionZone>,
};
