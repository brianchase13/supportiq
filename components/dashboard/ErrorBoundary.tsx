'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Sentry, LogRocket, etc.
      console.error('Production Error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
    
    this.props.onError?.(error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, retryCount } = this.state;
      const isNetworkError = error?.message.includes('fetch') || error?.message.includes('network');
      const tooManyRetries = retryCount >= 3;

      return (
        <div className="p-6 space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isNetworkError 
                ? 'Network connection error. Please check your internet connection.'
                : 'Something went wrong with the dashboard. Our team has been notified.'
              }
            </AlertDescription>
          </Alert>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Dashboard Error
              </CardTitle>
              <CardDescription>
                We're sorry, but something went wrong while loading your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && (
                <div className="p-4 bg-slate-800 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Error Details (Development)</h4>
                  <pre className="text-xs text-red-400 whitespace-pre-wrap">
                    {error?.message}
                  </pre>
                  {error?.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-slate-400 cursor-pointer">Stack Trace</summary>
                      <pre className="text-xs text-slate-400 mt-1 whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  disabled={tooManyRetries}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {tooManyRetries ? 'Too many retries' : `Retry${retryCount > 0 ? ` (${retryCount})` : ''}`}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              {tooManyRetries && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-400">
                    Multiple retry attempts failed. Please try refreshing the page or contact support if the issue persists.
                  </p>
                </div>
              )}

              <div className="text-xs text-slate-400">
                <p>Error ID: {Date.now().toString(36)}</p>
                <p>Time: {new Date().toLocaleString()}</p>
                {isNetworkError && (
                  <p className="mt-1 text-yellow-400">
                    Tip: Check your internet connection and try again.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier usage
export function DashboardWithErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  return (
    <DashboardErrorBoundary 
      fallback={fallback}
      onError={(error, errorInfo) => {
        // Log to analytics/monitoring service
        console.error('Dashboard error:', { error, errorInfo });
      }}
    >
      {children}
    </DashboardErrorBoundary>
  );
}