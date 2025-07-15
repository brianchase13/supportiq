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
  Shield,
  Menu,
  X,
  Search,
  Bell,
  LogOut
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

interface ModernNavigationProps {
  children: React.ReactNode;
}

export function ModernNavigation({ children }: ModernNavigationProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, user, signOut } = useUser();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}> 
        <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-black shadow-lg">
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-black" />
              </div>
              <span>SupportIQ</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <nav className="mt-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-white hover:text-black hover:bg-white/10'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-black' : 'text-white'}`} />
                  {item.name}
                </Link>
              );
            })}
            {/* Admin tab, only for admin users */}
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className={`group flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  pathname === '/admin'
                    ? 'bg-white text-black'
                    : 'text-white hover:text-black hover:bg-white/10'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Shield className={`mr-3 h-5 w-5 ${pathname === '/admin' ? 'text-black' : 'text-white'}`} />
                Admin
              </Link>
            )}
            <div className="mt-auto mb-4 px-6">
              <button 
                onClick={handleSignOut}
                className="group flex items-center w-full px-3 py-2 text-sm font-medium text-white hover:text-black hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 text-white group-hover:text-black" />
                Sign out
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black border-r border-white/10">
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-black" />
              </div>
              <span>SupportIQ</span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col px-4">
            <ul className="flex flex-1 flex-col gap-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-white text-black shadow-sm'
                          : 'text-white hover:text-black hover:bg-white/10'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-black' : 'text-white group-hover:text-black'}`} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
              {/* Admin tab, only for admin users */}
              {profile?.role === 'admin' && (
                <li>
                  <Link
                    href="/admin"
                    className={`group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      pathname === '/admin'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-white hover:text-black hover:bg-white/10'
                    }`}
                  >
                    <Shield className={`h-5 w-5 ${pathname === '/admin' ? 'text-black' : 'text-white group-hover:text-black'}`} />
                    Admin
                  </Link>
                </li>
              )}
            </ul>
            <div className="mt-auto mb-4">
              <button 
                onClick={handleSignOut}
                className="group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white hover:text-black hover:bg-white/10 w-full transition-all"
              >
                <LogOut className="h-5 w-5 text-white group-hover:text-black" />
                Sign out
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="lg:hidden p-2 text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                className="block w-full rounded-lg border-0 bg-gray-50 py-2 pl-10 pr-3 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-black sm:text-sm"
                placeholder="Search..."
                type="search"
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button className="p-2 text-gray-700 hover:text-black">
                <Bell className="h-5 w-5" />
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-x-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden lg:flex lg:flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {profile?.full_name || user?.email}
                  </span>
                  <span className="text-xs text-gray-500">
                    {profile?.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 