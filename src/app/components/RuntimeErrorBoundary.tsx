import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * RuntimeErrorBoundary: Professional crash recovery screen.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export class RuntimeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Runtime Error Boundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-shell flex flex-col items-center justify-center">
          <div className="bg-[var(--accent-red)]/5 border border-[var(--accent-red)]/20 p-card rounded-[var(--radius-modal)] max-w-lg w-full shadow-[var(--shadow-card)] backdrop-blur-xl">
            <h1 className="text-h3 font-black text-[var(--accent-red)] mb-4 uppercase tracking-widest">Erro de Sistema</h1>
            <p className="text-[var(--text-secondary)] font-bold mb-8">A interface encontrou um estado inválido e não pôde continuar.</p>
            
            <div className="bg-black/40 p-shell rounded-[var(--radius-card)] border var(--border-subtle) mb-10 overflow-auto max-h-60 text-[11px] font-mono text-[var(--accent-red)]/80 leading-relaxed shadow-inset">
              <p className="font-black mb-2 text-ui-xs">{this.state.error?.toString()}</p>
              <pre className="opacity-60">{this.state.errorInfo?.componentStack}</pre>
            </div>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full h-16 bg-[var(--bg-surface-glass)] hover:bg-white/[0.08] text-[var(--text-primary)] border var(--border-soft) rounded-[var(--radius-button)] font-black uppercase tracking-widest transition-all active:scale-[0.98]"
            >
              Reiniciar Sistema
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
