'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Settings, Bell, Moon, Sun, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { CompanyApi } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [companyName, setCompanyName] = useState('Faiba Agency');

  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadCompany = async () => {
    try {
      const data = await CompanyApi.getProfile();
      if (data && data.name) {
        setCompanyName(data.name);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadCompany();
    window.addEventListener('company-updated', loadCompany);
    return () => window.removeEventListener('company-updated', loadCompany);
  }, []);

  // Mount effect for next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const getPageTitle = () => {
    if (pathname === '/') return 'Overview';
    const path = pathname.split('/')[1];
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="h-20 bg-transparent flex items-center justify-between px-8 font-sans w-full relative z-40">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{getPageTitle()}</h1>
      </div>

      {/* Search - Centered */}
      <div className="flex-1 flex justify-center relative">
        <div className="relative w-full max-w-[400px] hidden md:block">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-gray-900' : 'text-gray-400'}`} size={16} />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search..." 
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full pl-10 pr-12 py-2.5 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all border-none"
          />
          {!isSearchFocused && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="text-[10px] font-medium text-gray-400 border border-gray-100 rounded px-1.5 py-0.5 bg-gray-50">⌘</kbd>
              <kbd className="text-[10px] font-medium text-gray-400 border border-gray-100 rounded px-1.5 py-0.5 bg-gray-50">K</kbd>
            </div>
          )}

          {/* Search Command Palette Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 pb-2 mb-2 border-b border-gray-100">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</span>
              </div>
              <Link href="/quotations" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                <FileText size={16} className="text-gray-400" />
                Create New Quote
              </Link>
              <Link href="/invoices" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                <ArrowRight size={16} className="text-gray-400" />
                Go to Invoices
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-end gap-6 relative">
        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link href="/settings" className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <Settings size={18} strokeWidth={2} />
          </Link>

          <div className="relative">
            <button 
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors relative"
            >
              <Bell size={18} strokeWidth={2} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F8F9FA]"></span>
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <span className="text-sm font-bold text-gray-900 tracking-tight">Notifications</span>
                  <button className="text-xs font-medium text-[#346E3A] hover:underline">Mark all read</button>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} className="text-[#346E3A]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 leading-tight mb-1">Invoice #092 Paid</div>
                      <div className="text-xs text-gray-500">Acme Corp paid ₦120,000 for Cloud Hosting.</div>
                      <div className="text-[10px] text-gray-400 font-medium mt-1">2 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            {mounted && theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
          </button>
        </div>

        {/* Profile */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
          >
            <div className="flex flex-col items-end">
              <span className="text-gray-900 text-sm font-semibold leading-none mb-1">{companyName}</span>
              <span className="text-[11px] font-medium text-gray-500 leading-none">personal manager</span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover"
            />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 pb-2 mb-2 border-b border-gray-100">
                <div className="text-sm font-bold text-gray-900 tracking-tight">My Account</div>
                <div className="text-xs text-gray-500">faiba@agency.com</div>
              </div>
              <Link href="/settings" className="flex items-center px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                Settings
              </Link>
              <button className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                Billing & Plan
              </button>
              <div className="h-px bg-gray-100 my-1"></div>
              <button 
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL || 'http://localhost:3000';
                  window.location.href = `${landingUrl}/login`;
                }}
                className="w-full text-left flex items-center px-4 py-2 hover:bg-red-50 text-sm font-medium text-red-600 transition-colors"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
