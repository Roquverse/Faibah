'use client';

import React from 'react';
import {
  LayoutDashboard,
  Folder,
  FileText,
  Settings,
  MessageSquare,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const MAIN_MENU = [
  { name: 'Overview', icon: LayoutDashboard, path: '/' },
  { name: 'Projects', icon: Folder, path: '/projects' },
  { name: 'Invoices', icon: FileText, path: '/invoices' },
  { name: 'Channels', icon: MessageSquare, path: '/channels' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Redirect to centralized auth app login
    const authUrl = process.env.NEXT_PUBLIC_AUTH_APP_URL || 'http://localhost:3001';
    window.location.href = `${authUrl}/login`;
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-50 w-64 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-col font-sans">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <img src="/favicon.png" alt="Logo" width={32} />
          <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">Client Portal</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Menu</div>
          <div className="space-y-0.5">
            {MAIN_MENU.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${isActive
                    ? 'bg-gray-100 dark:bg-slate-700 text-black dark:text-white'
                    : 'text-black dark:text-slate-300 hover:bg-gray-50 hover:dark:bg-slate-800/50 hover:text-black dark:hover:text-white'
                    }`}
                >
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-0.5">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${pathname === '/settings'
              ? 'bg-gray-100 dark:bg-slate-700 text-black dark:text-white'
              : 'text-black dark:text-slate-300 hover:bg-gray-50 hover:dark:bg-slate-800/50 hover:text-black dark:hover:text-white'
            }`}
        >
          <Settings size={18} strokeWidth={pathname === '/settings' ? 2.5 : 2} />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-sm"
        >
          <LogOut size={18} strokeWidth={2} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
