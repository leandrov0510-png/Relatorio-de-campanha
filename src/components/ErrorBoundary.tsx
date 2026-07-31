import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Error caught:', error, errorInfo);
  }

  handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
  };

  render() {
    const state = (this as any).state as State;
    const props = (this as any).props as Props;

    if (state && state.hasError) {
      return (
        <div className="p-6 bg-slate-900/90 backdrop-blur-xl border border-rose-500/30 rounded-3xl shadow-2xl text-center space-y-4 max-w-lg mx-auto my-8 text-slate-100">
          <div className="w-14 h-14 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              {props.fallbackTitle || 'Ocorreu um pequeno erro de digitação no formulário'}
            </h3>
            <p className="text-xs text-slate-300">
              O sistema evitou que a tela ficasse em branco. Clique abaixo para continuar digitando.
            </p>
          </div>

          {state.error?.message && (
            <div className="p-3 bg-slate-950/60 rounded-xl text-[11px] font-mono text-rose-300/80 border border-white/5 truncate max-w-full">
              {state.error.message}
            </div>
          )}

          <button
            type="button"
            onClick={this.handleReset}
            className="py-2.5 px-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 mx-auto transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recarregar Formulário</span>
          </button>
        </div>
      );
    }

    return props.children;
  }
}
