'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Folder,
  Users,
  FileText,
  CreditCard,
  Settings,
  ChevronDown,
  Building2,
  ListTodo,
  Calendar,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CompanyApi, UsersApi } from '@/lib/api';

const MAIN_MENU = [
  { name: 'Overview', icon: LayoutDashboard, path: '/' },
  { name: 'Projects', icon: Folder, path: '/projects' },
  { name: 'Tasks', icon: ListTodo, path: '/tasks' },
  { name: 'Schedule', icon: Calendar, path: '/schedule' },
  { name: 'Channels', icon: MessageSquare, path: '/channels' },
];

const CRM_MENU = [
  { name: 'Clients', icon: Building2, path: '/clients' },
  { name: 'Invoices', icon: ListTodo, path: '/invoices' },
  { name: 'Receipts', icon: FileText, path: '/receipts' },
  { name: 'Payments', icon: CreditCard, path: '/payments' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [crmOpen, setCrmOpen] = useState(true);
  const [companyName, setCompanyName] = useState('Faibah Agency');
  const [user, setUser] = useState<any>(null);

  const loadData = async () => {
    try {
      const [companyData, userData] = await Promise.all([
        CompanyApi.getProfile().catch(() => null),
        UsersApi.getProfile().catch(() => null)
      ]);
      if (companyData && companyData.name) {
        setCompanyName(companyData.name);
      }
      if (userData) {
        setUser(userData);
      }
    } catch (e) {}
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('company-updated', loadData);
    return () => window.removeEventListener('company-updated', loadData);
  }, []);

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-50 w-64 h-screen bg-white border-r border-gray-200 flex-col font-sans">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <img src="/favicon.png" alt="Logo" width={32} />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">

        {/* Main Section */}
        <div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Main</div>
          <div className="space-y-0.5">
            {MAIN_MENU.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${isActive
                    ? 'bg-gray-50 text-black'
                    : 'text-black hover:bg-gray-50 hover:text-black'
                    }`}
                >
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* CRM & Sales Section */}
        <div>
          <button
            onClick={() => setCrmOpen(!crmOpen)}
            className="w-full flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2 hover:text-gray-600 transition-colors"
          >
            <span>CRM & Sales</span>
            <ChevronDown size={14} className={`transform transition-transform ${crmOpen ? '' : '-rotate-90'}`} />
          </button>

          {crmOpen && (
            <div className="space-y-0.5">
              {CRM_MENU.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${isActive
                      ? 'bg-gray-50 text-black'
                      : 'text-black hover:bg-gray-50 hover:text-black'
                      }`}
                  >
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <Link href="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#346E3A]/10 text-[#346E3A] flex items-center justify-center font-bold text-sm shrink-0">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : companyName}
            </div>
            <div className="text-[11px] font-medium text-gray-500 truncate">{companyName}</div>
          </div>
          <Settings size={16} className="text-gray-400 shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
