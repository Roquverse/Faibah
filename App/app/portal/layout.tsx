'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  Receipt,
  User
} from 'lucide-react';

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Overview', href: '/portal/overview', icon: LayoutDashboard },
    { name: 'My Projects', href: '/portal/projects', icon: Briefcase },
    { name: 'Messages', href: '/portal/messages', icon: MessageSquare },
    { name: 'Invoices', href: '/portal/invoices', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
          <Link href="/portal/overview" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Faiba</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Client Portal</div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-gray-300' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 shrink-0">
          <Link 
            href="/portal/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <img src="https://ui-avatars.com/api/?name=Acme+Client" alt="User" className="w-9 h-9 rounded-full bg-gray-200" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">Acme Client</div>
              <div className="text-[11px] text-gray-500 truncate">acme@example.com</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen relative">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
