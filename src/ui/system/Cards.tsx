import React from 'react';
import { ERPTokens } from './tokens';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function ERPCard({ children, className = '', onClick, hoverable = false, ...props }: CardProps) {
  const hoverStyles = hoverable ? `hover:${ERPTokens.colors.bgCardHover} hover:border-gray-700 cursor-pointer ${ERPTokens.animation.fast}` : '';
  
  return (
    <div 
      onClick={onClick}
      className={`${ERPTokens.colors.bgCard} border ${ERPTokens.colors.borderBase} rounded-lg ${ERPTokens.elevation.sm} overflow-hidden flex flex-col ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function ERPCardHeader({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`px-4 py-3 border-b ${ERPTokens.colors.borderLight} ${ERPTokens.colors.bgHeader} flex items-center justify-between gap-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ERPCardContent({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`p-4 flex flex-col gap-3 flex-1 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ERPCardFooter({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`px-4 py-3 bg-gray-950/30 border-t ${ERPTokens.colors.borderLight} flex items-center justify-between text-xs ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ERPCardMetric({ label, value, valueColor = ERPTokens.colors.textPrimary, className = '' }: { label: string; value: React.ReactNode; valueColor?: string; className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className={`text-[10px] uppercase font-semibold tracking-wider ${ERPTokens.colors.textTertiary}`}>{label}</span>
      <span className={`text-lg font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}
