'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard, Folder, Users, FileText, CreditCard, Settings,
  ChevronDown, Building2, ListTodo, Calendar, MessageSquare, Repeat,
  BarChart3, UserCheck, Lock,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CompanyApi, UsersApi } from '@/lib/api';
import { useTierAccess } from '@/lib/permissions/useTierAccess';
import { cn } from '@/lib/utils';

// ─── Nav item definitions ──────────────────────────────────────────────────
// feature key maps directly to lib/config/tiers.ts TIER_FEATURES entries
const MAIN_NAV = [
  { name: 'Overview',    icon: LayoutDashboard, path: '/',            feature: 'overview'   },
  { name: 'Projects',    icon: Folder,           path: '/projects',   feature: 'projects'   },
  { name: 'Proposals',   icon: FileText,          path: '/proposals',  feature: 'proposals'  },
  { name: 'Tasks',       icon: ListTodo,          path: '/tasks',      feature: 'tasks'      },
  { name: 'Schedule',    icon: Calendar,          path: '/schedule',   feature: 'schedule'   },
  { name: 'Channels',    icon: MessageSquare,     path: '/channels',   feature: 'channels'   },
  { name: 'Team',        icon: UserCheck,         path: '/team',       feature: 'team'       },
];

const CRM_NAV = [
  { name: 'Clients',       icon: Building2,  path: '/clients',       feature: 'clients'       },
  { name: 'Invoices',      icon: ListTodo,   path: '/invoices',      feature: 'invoices'      },
  { name: 'Receipts',      icon: FileText,   path: '/receipts',      feature: 'receipts'      },
  { name: 'Payments',      icon: CreditCard, path: '/payments',      feature: 'payments'      },
  { name: 'Subscriptions', icon: Repeat,     path: '/subscriptions', feature: 'subscriptions' },
];

// ─── Tier badge ───────────────────────────────────────────────────────────
const TIER_LABEL: Record<string, { label: string; colour: string }> = {
  solo:       { label: 'Solo',       colour: 'bg-blue-100 text-blue-700'    },
  contractor: { label: 'Contractor', colour: 'bg-purple-100 text-purple-700' },
  agency:     { label: 'Agency',     colour: 'bg-[#FFBA00]/15 text-[#8B6200]' },
};

// ─── NavItem ─────────────────────────────────────────────────────────────
function NavItem({
  item,
  isActive,
  locked,
}: {
  item: { name: string; icon: React.ElementType; path: string };
  isActive: boolean;
  locked?: boolean;
}) {
  const Icon = item.icon;

  if (locked) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 dark:text-slate-600 cursor-not-allowed select-none">
        <Icon size={18} strokeWidth={2} />
        <span className="flex-1">{item.name}</span>
        <Lock size={12} className="opacity-50" />
      </div>
    );
  }

  return (
    <Link
      href={item.path}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm',
        isActive
          ? 'bg-[#FFBA00]/10 text-gray-900 dark:text-white'
          : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white'
      )}
    >
      <Icon
        size={18}
        strokeWidth={isActive ? 2.5 : 2}
        className={isActive ? 'text-[#FFBA00]' : ''}
      />
      <span>{item.name}</span>
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFBA00]" />
      )}
    </Link>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const [crmOpen, setCrmOpen] = useState(true);
  const [companyName, setCompanyName] = useState('Faibah');
  const [user, setUser] = useState<any>(null);
  const { canAccess, tier } = useTierAccess();

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [company, userData] = await Promise.all([
          CompanyApi.getProfile().catch(() => null),
          UsersApi.getProfile().catch(() => null),
        ]);
        if (company?.name) setCompanyName(company.name);
        if (userData) setUser(userData);
      } catch {}
    };
    loadData();
    window.addEventListener('company-updated', loadData);
    return () => window.removeEventListener('company-updated', loadData);
  }, []);

  const tierBadge = TIER_LABEL[tier] ?? TIER_LABEL.agency;

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-50 w-64 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-col font-sans">

      {/* Logo + Tier badge */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Faibah" className="h-7 w-auto" />
        </Link>
        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', tierBadge.colour)}>
          {tierBadge.label}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">

        {/* Main */}
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-3">
            Main
          </div>
          <div className="space-y-0.5">
            {MAIN_NAV.map((item) => {
              const has = canAccess(item.feature);
              const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
              return (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={isActive}
                  locked={!has}
                />
              );
            })}
          </div>
        </div>

        {/* CRM & Sales */}
        <div>
          <button
            onClick={() => setCrmOpen(!crmOpen)}
            className="w-full flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-3 hover:text-gray-600 transition-colors"
          >
            <span>CRM & Finance</span>
            <ChevronDown size={13} className={cn('transition-transform', crmOpen ? '' : '-rotate-90')} />
          </button>
          {crmOpen && (
            <div className="space-y-0.5">
              {CRM_NAV.map((item) => {
                const has = canAccess(item.feature);
                const isActive = pathname === item.path || pathname.startsWith(item.path);
                return (
                  <NavItem
                    key={item.name}
                    item={item}
                    isActive={isActive}
                    locked={!has}
                  />
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* User Profile + Settings */}
      <div className="p-3 border-t border-gray-200 dark:border-slate-800">
        <Link
          href="/settings"
          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#FFBA00]/15 text-[#8B6200] flex items-center justify-center font-bold text-sm shrink-0">
              {user?.firstName?.charAt(0).toUpperCase() ?? 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : companyName}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-slate-400 truncate">{companyName}</div>
          </div>
          <Settings size={15} className="text-gray-400 shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
