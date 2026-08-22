'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart, 
  Building2, 
  Users, 
  CreditCard,
  LifeBuoy,
  Activity,
  ScrollText,
  Flag,
  Users2,
  Settings,
  LogOut,
  Shield,
  Sun,
  Bell
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const MAIN_NAV = [
  { label: 'Overview', href: '/', icon: BarChart },
  { label: 'Businesses', href: '/businesses', icon: Building2 },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
];

const PLATFORM_NAV = [
  { label: 'Support', href: '/support', icon: LifeBuoy },
  { label: 'System Health', href: '/health', icon: Activity },
  { label: 'Audit Log', href: '/audit', icon: ScrollText },
  { label: 'Feature Flags', href: '/features', icon: Flag },
];

const SETTINGS_NAV = [
  { label: 'Team & Roles', href: '/team', icon: Users2 },
  { label: 'Platform Config', href: '/config', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const NavItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
    return (
      <Link 
        href={item.href}
        className={`flex items-center gap-3 px-4 py-2.5 mx-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive 
            ? 'bg-accent/10 text-accent' 
            : 'text-muted hover:text-foreground hover:bg-black/5'
        }`}
      >
        <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 border-r border-hairline flex flex-col bg-surface z-10 relative">
        <div className="h-[72px] flex items-center px-8 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-lg shadow-sm">
              <Shield className="text-white w-4 h-4" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">Faibah</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            {MAIN_NAV.map((item) => <NavItem key={item.href} item={item} />)}
          </div>

          <div className="flex flex-col gap-1">
            <div className="px-8 mb-2 mt-4 text-[11px] font-bold text-muted/60 uppercase tracking-wider">Platform</div>
            {PLATFORM_NAV.map((item) => <NavItem key={item.href} item={item} />)}
          </div>

          <div className="flex flex-col gap-1">
            <div className="px-8 mb-2 mt-4 text-[11px] font-bold text-muted/60 uppercase tracking-wider">Settings</div>
            {SETTINGS_NAV.map((item) => <NavItem key={item.href} item={item} />)}
          </div>
        </div>

        {/* Sidebar Bottom Profile */}
        <div className="p-4 border-t border-hairline shrink-0 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=16A34A&color=fff" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-bold text-foreground truncate">Admin User</span>
              <span className="text-xs text-muted truncate">Super Admin</span>
            </div>
            <button onClick={handleLogout} className="text-muted hover:text-danger p-1 rounded-md transition-colors">
               <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-background min-w-0">
        
        {/* Top Header */}
        <header className="h-[72px] bg-surface border-b border-hairline flex items-center justify-between px-8 shrink-0">
          {/* Search */}
          <div className="relative w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full pl-10 pr-12 py-2 bg-background border border-hairline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-surface border border-hairline rounded text-[10px] text-muted font-mono">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-surface border border-hairline rounded text-[10px] text-muted font-mono">K</kbd>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-background transition-colors text-muted">
              <Sun size={18} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-background transition-colors text-muted relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-danger rounded-full border border-surface"></span>
            </button>
            <div className="h-6 w-[1px] bg-hairline mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm font-semibold text-foreground">Admin User</span>
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=16A34A&color=fff" alt="Profile" className="w-8 h-8 rounded-full border border-hairline" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
