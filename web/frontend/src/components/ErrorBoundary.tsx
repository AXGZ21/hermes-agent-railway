import { Component, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center bg-surface-0 noise relative overflow-hidden">
          {/* Atmospheric background */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent/[0.04] blur-[120px] pointer-events-none" />

          <div className="relative z-10 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-red-500/[0.08] border border-red-500/20 flex items-center justify-center mb-6 mx-auto ambient-glow">
              <span className="text-3xl font-light text-red-400">!</span>
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Something went wrong</h2>
            <p className="text-[14px] text-zinc-500 mb-2 max-w-xs leading-relaxed">
              An unexpected error occurred. Try refreshing to recover.
            </p>
            {this.state.error && (
              <p className="text-[12px] text-red-400/60 font-mono mb-6 max-w-xs truncate">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-brand text-white rounded-xl text-[14px] font-semibold hover:opacity-90 transition-opacity ambient-glow"
            >
              <RefreshCw size={15} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
