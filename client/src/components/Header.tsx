'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata as Record<string, string> | undefined;
        const name =
          meta?.first_name ||
          (meta?.full_name ? meta.full_name.split(' ')[0] : '') ||
          (user.email ? user.email.split('@')[0] : 'Client');
        setFirstName(name);
      }
    };
    fetchUser();
  }, []);

  const getPageTitle = () => {
    if (pathname === '/') return 'Overview';
    const path = pathname.split('/')[1];
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="h-16 md:h-20 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 font-sans w-full sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <button 
          className="md:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight">{getPageTitle()}</h1>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col p-4 md:hidden animate-in fade-in slide-in-from-left-8 duration-200">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="Logo" width={32} />
              <span className="font-bold text-xl dark:text-white">Client Portal</span>
            </div>
            <button 
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 bg-gray-50 dark:bg-slate-800 rounded-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 space-y-2">
            {[
              { name: 'Overview', path: '/' },
              { name: 'Projects', path: '/projects' },
              { name: 'Invoices', path: '/invoices' },
              { name: 'Channels', path: '/channels' },
              { name: 'Settings', path: '/settings' },
            ].map(item => (
              <Link 
                key={item.name} 
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-medium ${pathname === item.path ? 'bg-deep-green text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Dark Mode Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 md:p-2.5 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="Toggle Dark Mode"
        >
          {mounted && theme === 'dark' ? <Sun size={20} className="dark:text-gray-300" /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button className="p-2 md:p-2.5 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition-colors relative">
          <Bell size={20} className="dark:text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-1 md:mx-2 hidden md:block"></div>

        {/* Profile */}
        <Link href="/settings" className="flex items-center gap-3 p-1.5 pr-3 md:pr-4 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-700">
          <div className="w-8 h-8 rounded-full bg-deep-green text-white flex items-center justify-center font-bold text-sm">
            {firstName ? firstName.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{firstName || 'Client'}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
