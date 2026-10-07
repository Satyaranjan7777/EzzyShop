import React, { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * Global React Error Boundary Component
 *
 * Catches JavaScript rendering errors anywhere in the child component tree,
 * logs the full error and component stack to the browser console for debugging,
 * and displays a user-friendly fallback UI without exposing stack traces or file paths.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log full error details and component stack trace for developer debugging
    console.error("[React ErrorBoundary Caught Error]", {
      error,
      componentStack: errorInfo?.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-heading mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              We encountered an unexpected issue while loading this page. Our team
              has been notified. Please refresh or return to the store.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
