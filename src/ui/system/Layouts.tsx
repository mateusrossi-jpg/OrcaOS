import React from 'react';
import { ERPTokens } from './tokens';

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function ERPGrid({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ERPSection({ children, className = '', ...props }: LayoutProps) {
  return (
    <section className={`flex flex-col gap-4 w-full ${className}`} {...props}>
      {children}
    </section>
  );
}

export function ERPPanel({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={`bg-gray-950/20 border ${ERPTokens.colors.borderBase} rounded-xl p-4 sm:p-6 w-full ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ERPStack({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ERPToolbar({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 px-4 ${ERPTokens.colors.bgHeader} border-b ${ERPTokens.colors.borderLight} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function OperationalDashboardLayout({ header, toolbar, children, className = '' }: { header?: React.ReactNode; toolbar?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${className}`}>
      {header && (
        <div className={`px-6 py-4 border-b ${ERPTokens.colors.borderBase} ${ERPTokens.colors.bgHeader}`}>
          {header}
        </div>
      )}
      {toolbar && (
        <ERPToolbar>{toolbar}</ERPToolbar>
      )}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        {children}
      </div>
    </div>
  );
}
