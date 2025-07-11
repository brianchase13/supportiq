'use client';

export function DemoModeBadge() {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-sm">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      <span className="text-xs font-medium text-blue-400">Demo Mode</span>
    </div>
  );
}