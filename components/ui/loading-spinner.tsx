'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-slate-200 border-t-blue-600',
        sizeClasses[size]
      )} />
      {text && (
        <div className="text-sm text-slate-600 font-medium animate-pulse">
          {text}
        </div>
      )}
    </div>
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
    </div>
  );
}

export function LoadingCard({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white border border-slate-200 rounded-lg p-6', className)}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
      </div>
      {children}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">Loading SupportIQ</h3>
        <p className="text-slate-600 text-sm">Setting up your hands-off support automation...</p>
        <LoadingDots className="mt-4 justify-center" />
      </div>
    </div>
  );
}