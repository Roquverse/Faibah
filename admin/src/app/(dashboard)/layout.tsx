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
  Shield
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
        className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
          isActive 
            ? 'bg-accent/10 text-accent font-semibold border-l-2 border-accent -ml-[2px]' 
            : 'text-muted hover:text-foreground border-l-2 border-transparent -ml-[2px]'
        }`}
      >
        <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-hairline flex flex-col bg-background">
        <div className="h-16 flex items-center px-6 border-b border-hairline shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent flex items-center justify-center rounded-sm">
              <Shield className="text-white w-3 h-3" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">Faibah Admin</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-8">
          <div>
            <div className="px-6 mb-2 text-[10px] font-semibold text-muted uppercase tracking-wider">Main</div>
            <div className="flex flex-col px-3">
              {MAIN_NAV.map((item) => <NavItem key={item.href} item={item} />)}
            </div>
          </div>

          <div>
            <div className="px-6 mb-2 text-[10px] font-semibold text-muted uppercase tracking-wider">Platform</div>
            <div className="flex flex-col px-3">
              {PLATFORM_NAV.map((item) => <NavItem key={item.href} item={item} />)}
            </div>
          </div>

          <div>
            <div className="px-6 mb-2 text-[10px] font-semibold text-muted uppercase tracking-wider">Settings</div>
            <div className="flex flex-col px-3">
              {SETTINGS_NAV.map((item) => <NavItem key={item.href} item={item} />)}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-hairline shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
