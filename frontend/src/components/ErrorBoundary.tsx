import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AGROBUS] Uncaught render error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mt-2 max-w-md text-slate-500">
            An unexpected error occurred. Open the browser console (F12) for details.
          </p>
          <pre className="mt-4 max-w-lg overflow-auto rounded-xl bg-slate-900 p-4 text-left text-xs text-green-400">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            <RefreshCw className="h-4 w-4" /> Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
