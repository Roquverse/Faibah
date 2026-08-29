'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Moon, Sun, Menu, X, MessageSquare, CheckCircle2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ProjectsApi, ChannelsApi, CompanyApi, UsersApi } from '@/lib/api';

export default function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [firstName, setFirstName] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);

  const notificationRef = useRef<HTMLDivElement>(null);

  // Click outside listener for notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const loadNotifications = async () => {
    try {
      const items: any[] = [];

      // 1. Pending Channel Invitations
      try {
        const invs = await ProjectsApi.getPendingInvitations();
        if (invs && invs.length > 0) {
          invs.forEach((inv: any) => {
            items.push({
              id: `inv-${inv.id}`,
              type: 'INVITATION',
              title: `Channel Request: ${inv.project?.name || 'Project'}`,
              description: `You have been invited to join this project channel.`,
              link: `/channels?project=${inv.projectId}`,
              createdAt: inv.createdAt || new Date().toISOString(),
            });
          });
        }
      } catch (e) {}

      // 2. Channel Activities
      try {
        const channelsData = await ChannelsApi.getAll();
        if (channelsData && channelsData.length > 0) {
          channelsData.slice(0, 5).forEach((ch: any) => {
            if (ch._count?.messages > 0) {
              items.push({
                id: `ch-${ch.id}`,
                type: 'CHANNEL_ACTIVITY',
                title: `Channel Activity: #${ch.name}`,
                description: `${ch.project?.name || 'Project'} channel updated. Click to view messages.`,
                link: `/channels?project=${ch.projectId}`,
                createdAt: ch.updatedAt || ch.createdAt || new Date().toISOString(),
              });
            }
          });
        }
      } catch (e) {}

      // 3. Company Overview Reminders
      try {
        const overview = await CompanyApi.getOverview();
        if (overview && overview.reminders) {
          overview.reminders.forEach((rem: any) => {
            items.push({
              id: `rem-${rem.id}`,
              type: 'REMINDER',
              title: rem.title,
              description: rem.description || 'System notification',
              link: rem.link || '/',
              createdAt: rem.createdAt || new Date().toISOString(),
            });
          });
        }
      } catch (e) {}

      const sorted = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(sorted);
    } catch (e) {}
  };

  useEffect(() => {
    setMounted(true);

    const fetchUser = async () => {
      try {
        const [profile, { data: { user } }] = await Promise.all([
          UsersApi.getProfile().catch(() => null),
          createClient().auth.getUser()
        ]);
        if (profile) setUserProfile(profile);
        if (user) {
          setSupabaseUser(user);
          const meta = user.user_metadata as Record<string, string> | undefined;
          const name =
            meta?.first_name ||
            (meta?.full_name ? meta.full_name.split(' ')[0] : '') ||
            (user.email ? user.email.split('@')[0] : 'Client');
          setFirstName(name);
        }
      } catch (e) {}
    };
    fetchUser();
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
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

        {/* Notifications Dropdown Container */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 md:p-2.5 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell size={20} className="dark:text-gray-300" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="fixed sm:absolute top-16 right-4 sm:top-full sm:right-0 mt-2 w-[calc(100vw-32px)] sm:w-88 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Notifications</span>
                  {notifications.length > 0 && (
                    <span className="px-2 py-0.5 bg-[#0C3B2E]/10 text-[#0C3B2E] dark:bg-green-900/40 dark:text-green-400 rounded-full text-[10px] font-bold">
                      {notifications.length}
                    </span>
                  )}
                </div>
                <button onClick={() => setNotifications([])} className="text-xs font-medium text-[#0C3B2E] dark:text-green-400 hover:underline">
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-88 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="p-3.5 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex gap-3 block"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        {n.type === 'INVITATION' ? (
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                            📩
                          </div>
                        ) : n.type === 'CHANNEL_ACTIVITY' ? (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 flex items-center justify-center">
                            <MessageSquare size={15} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-green-50 text-[#0C3B2E] dark:bg-green-900/40 dark:text-green-400 flex items-center justify-center">
                            <CheckCircle2 size={15} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-900 dark:text-white leading-snug truncate mb-0.5">{n.title}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-tight">{n.description}</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-1">
                          {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400">No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-1 md:mx-2 hidden md:block"></div>

        {/* Profile */}
        {(() => {
          const avatarUrl = userProfile?.avatarUrl || userProfile?.avatar_url || supabaseUser?.user_metadata?.avatar_url || supabaseUser?.user_metadata?.picture;
          const fullName = (userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : '') ||
                           supabaseUser?.user_metadata?.full_name ||
                           supabaseUser?.user_metadata?.name ||
                           firstName ||
                           'Client';
          return (
            <Link href="/settings" className="flex items-center gap-3 p-1.5 pr-3 md:pr-4 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-700">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200 dark:border-slate-700" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-deep-green text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{fullName}</span>
              </div>
            </Link>
          );
        })()}
      </div>
    </header>
  );
}
