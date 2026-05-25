import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

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
        <div className="min-h-screen bg-gray-950 text-white p-8 flex flex-col items-center justify-center font-sans">
          <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-[2rem] max-w-lg w-full shadow-2xl">
            <h1 className="text-2xl font-black text-red-500 mb-4 uppercase tracking-widest">Erro de Execução</h1>
            <p className="text-gray-300 font-bold mb-6">A tela falhou ao carregar.</p>
            
            <div className="bg-black/50 p-4 rounded-xl border border-gray-800 mb-8 overflow-auto max-h-60 text-[10px] font-mono text-red-400 leading-relaxed">
              <p className="font-black mb-2 text-xs">{this.state.error?.toString()}</p>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </div>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-colors"
            >
              Voltar para o Início
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
