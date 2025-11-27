import React, { Component, ErrorInfo, ReactNode } from 'react';
import { IconAlertCircle } from '../icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // TODO: Log to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-center mb-6">
              <IconAlertCircle className="w-20 h-20 text-red-500" />
            </div>
            
            <h2 className="text-3xl font-bold text-red-600 mb-4 text-center">
              Oops! Something went wrong
            </h2>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold mb-2">Error Details:</p>
              <p className="text-red-700 text-sm font-mono">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 mb-2">
                  Show technical details
                </summary>
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-48">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold shadow-lg transform hover:scale-105 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 font-semibold shadow-lg transform hover:scale-105 transition-all"
              >
                Reload Page
              </button>
            </div>

            <p className="text-center text-gray-500 text-sm mt-6">
              If this problem persists, please contact support
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
