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
  HelpCircle,
  Zap,
  BookOpen,
  User,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useUser } from '@/lib/auth/user-context';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Deflection',
    href: '/dashboard/deflection',
    icon: Zap,
  },
  {
    name: 'Knowledge Base',
    href: '/dashboard/knowledge-base',
    icon: BookOpen,
  },
  {
    name: 'Insights',
    href: '/insights',
    icon: Brain,
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: User,
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
  const { profile } = useUser();

  return (
    <aside className={clsx(
      'h-screen bg-black border-r border-white transition-all duration-300 flex flex-col',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white">
        <Link href="/dashboard" className={clsx(
          'flex items-center gap-2 transition-opacity',
          isCollapsed && 'opacity-0'
        )}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-black" />
          </div>
          <span className="font-semibold text-lg text-white">SupportIQ</span>
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-white" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white" />
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
                      ? 'bg-white text-black'
                      : 'text-white hover:text-black hover:bg-white/10'
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
          {/* Admin tab, only for admin users */}
          {profile?.role === 'admin' && (
            <li key="/admin">
              <Link
                href="/admin"
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                  pathname === '/admin'
                    ? 'bg-white text-black'
                    : 'text-white hover:text-black hover:bg-white/10'
                )}
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span className={clsx(
                  'transition-opacity',
                  isCollapsed && 'opacity-0 w-0'
                )}>Admin</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className={clsx(
        'p-4 border-t border-white',
        isCollapsed && 'hidden'
      )}>
        <div className="flex items-center gap-3 text-white text-sm">
          <Users className="w-4 h-4" />
          <span>5 team members</span>
        </div>
        <div className="flex items-center gap-3 text-white text-sm mt-2">
          <HelpCircle className="w-4 h-4" />
          <span>Get help</span>
        </div>
      </div>
    </aside>
  );
}