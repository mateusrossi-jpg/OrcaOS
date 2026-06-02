import React from 'react';
import { cn } from '../utils/ui';

interface HeroCardProps {
  /** The massive, dominant primary value or metric */
  primaryValue: string | React.ReactNode;
  /** The technical, monospaced subtitle */
  subtitle: string;
  /** Additional elements (like smaller tags or content) */
  children?: React.ReactNode;
  /** Optional class names */
  className?: string;
}

/**
 * HeroCard – The dominant element of the screen per the Visual OS Spec.
 * Uses a large border radius, extreme whitespace, and monumental typography.
 */
export const HeroCard: React.FC<HeroCardProps> = ({
  primaryValue,
  subtitle,
  children,
  className,
}) => {
  return (
    <div className={cn("hero-card surface-elev animate-fade-in", className)}>
      <div className="hero-card-content">
        <div className="hero-card-value num">
          {primaryValue}
        </div>
        <div className="hero-card-subtitle">
          {subtitle}
        </div>
      </div>
      {children && (
        <div className="hero-card-extra">
          {children}
        </div>
      )}
    </div>
  );
};
