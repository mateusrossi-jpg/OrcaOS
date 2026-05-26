import React from 'react';
import { ERPTokens } from './tokens';

interface StateProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function ERPLoader({ className = '', message = 'Carregando dados operacionais...' }: StateProps & { message?: string }) {
  return (
    <div className={`w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${ERPTokens.colors.borderFocus}`}></div>
      {message && <span className={`text-sm ${ERPTokens.colors.textSecondary} animate-pulse`}>{message}</span>}
    </div>
  );
}

export function ERPEmptyState({ title = 'Nenhum registro', description, icon, className = '' }: StateProps & { title?: string; description?: string; icon?: React.ReactNode }) {
  return (
    <div className={`w-full py-12 flex flex-col items-center justify-center gap-3 border border-dashed ${ERPTokens.colors.borderLight} rounded-xl bg-gray-900/20 ${className}`}>
      {icon ? (
        <div className="text-gray-600 mb-2">{icon}</div>
      ) : (
        <svg className="w-10 h-10 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
      )}
      <h3 className={`text-sm font-medium ${ERPTokens.colors.textSecondary}`}>{title}</h3>
      {description && <p className={`text-xs ${ERPTokens.colors.textTertiary} max-w-sm text-center`}>{description}</p>}
    </div>
  );
}

export function ERPErrorState({ title = 'Erro na operação', error, onRetry, className = '' }: StateProps & { title?: string; error?: Error | string; onRetry?: () => void }) {
  return (
    <div className={`w-full py-8 px-6 flex flex-col items-center justify-center gap-4 bg-red-950/20 border border-red-900/30 rounded-xl ${className}`}>
      <svg className="w-10 h-10 text-red-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <div className="text-center">
        <h3 className="text-sm font-medium text-red-400">{title}</h3>
        {error && <p className="text-xs text-red-500/70 mt-1 max-w-md">{typeof error === 'string' ? error : error.message}</p>}
      </div>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 px-4 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs font-medium rounded transition-colors border border-red-800/30">
          Tentar Novamente
        </button>
      )}
    </div>
  );
}
