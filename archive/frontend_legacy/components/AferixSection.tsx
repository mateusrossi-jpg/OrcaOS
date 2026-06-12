import React from 'react';
import { cn } from '../utils/ui';

interface AferixSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
}

/**
 * AferixSection: Standardized layout section with consistent spacing and typography.
 */
export const AferixSection: React.FC<AferixSectionProps> = ({ 
  title, 
  description, 
  className, 
  children, 
  ...props 
}) => {
  return (
    <section className={cn("flex flex-col gap-4", className)} {...props}>
      {title && (
        <div className="flex flex-col gap-0.5 px-1">
          <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            {title}
          </h2>
          {description && (
            <p className="text-[11px] text-white/20 font-medium">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};
