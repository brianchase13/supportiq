'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Brain, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  HelpCircle
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Insights',
    href: '/insights',
    icon: Brain,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={clsx(
      'h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <Link href="/dashboard" className={clsx(
          'flex items-center gap-2 transition-opacity',
          isCollapsed && 'opacity-0'
        )}>
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">SupportIQ</span>
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className={clsx(
                    'transition-opacity',
                    isCollapsed && 'opacity-0 w-0'
                  )}>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className={clsx(
        'p-4 border-t border-slate-800',
        isCollapsed && 'hidden'
      )}>
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <Users className="w-4 h-4" />
          <span>5 team members</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-sm mt-2">
          <HelpCircle className="w-4 h-4" />
          <span>Get help</span>
        </div>
      </div>
    </aside>
  );
}