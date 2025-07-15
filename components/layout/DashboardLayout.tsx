'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Users, 
  MessageCircle,
  Search,
  Bell,
  User,
  Menu,
  X,
  Zap,
  LogOut,
  Shield
} from 'lucide-react';
import { useUser } from '@/lib/auth/user-context';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Insights', href: '/insights', icon: MessageCircle },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { profile } = useUser();

  // Compose navigation with admin tab if admin
  const navWithAdmin = profile?.role === 'admin'
    ? [
        ...navigation,
        { name: 'Admin', href: '/admin', icon: Shield }
      ]
    : navigation;

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}> 
        <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-black shadow-lg">
          <div className="flex items-center justify-between h-16 px-6 border-b border-white">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              SupportIQ
            </Link>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <nav className="mt-6">
            {navWithAdmin.map((item) => {
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
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black border-r border-white">
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-white">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              SupportIQ
            </Link>
          </div>
          <nav className="flex flex-1 flex-col px-4">
            <ul className="flex flex-1 flex-col gap-y-1">
              {navWithAdmin.map((item) => {
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
            </ul>
            <div className="mt-auto mb-4">
              <button className="group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white hover:text-black hover:bg-white/10 w-full transition-all">
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
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-white bg-black px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="lg:hidden p-2 text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-white" />
              </div>
              <input
                className="block w-full rounded-lg border-0 bg-black py-2 pl-10 pr-3 text-white placeholder:text-white/60 focus:bg-white focus:text-black focus:ring-2 focus:ring-black sm:text-sm"
                placeholder="Search..."
                type="search"
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button className="p-2 text-white hover:text-black">
                <Bell className="h-5 w-5" />
              </button>
              <div className="h-6 w-px bg-white" />
              <div className="flex items-center gap-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-black" />
                </div>
                <div className="hidden lg:flex lg:flex-col">
                  <span className="text-sm font-medium text-white">Demo User</span>
                  <span className="text-xs text-white/60">demo@supportiq.com</span>
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