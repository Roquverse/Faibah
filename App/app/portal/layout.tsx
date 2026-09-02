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
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full min-h-screen relative">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
