import React from 'react';
import { ERPTokens } from './tokens';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function ERPDisplay({ children, className = '', as: Component = 'h1', ...props }: TextProps) {
  return <Component className={`text-2xl sm:text-3xl font-bold ${ERPTokens.colors.textPrimary} ${className}`} {...props}>{children}</Component>;
}

export function ERPSectionTitle({ children, className = '', as: Component = 'h2', ...props }: TextProps) {
  return <Component className={`text-lg font-bold ${ERPTokens.colors.textPrimary} ${className}`} {...props}>{children}</Component>;
}

export function ERPCardTitle({ children, className = '', as: Component = 'h3', ...props }: TextProps) {
  return <Component className={`text-sm font-semibold ${ERPTokens.colors.textPrimary} ${className}`} {...props}>{children}</Component>;
}

export function ERPMetric({ children, className = '', as: Component = 'span', ...props }: TextProps) {
  return <Component className={`text-xl font-bold ${ERPTokens.colors.textPrimary} ${className}`} {...props}>{children}</Component>;
}

export function ERPLabel({ children, className = '', as: Component = 'span', ...props }: TextProps) {
  return <Component className={`text-xs font-semibold uppercase tracking-wider ${ERPTokens.colors.textSecondary} ${className}`} {...props}>{children}</Component>;
}

export function ERPCaption({ children, className = '', as: Component = 'p', ...props }: TextProps) {
  return <Component className={`text-xs ${ERPTokens.colors.textTertiary} ${className}`} {...props}>{children}</Component>;
}
