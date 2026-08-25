import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import InactivityGuard from '@/components/auth/InactivityGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InactivityGuard>
      <div className="flex h-screen bg-gray-50 dark:bg-slate-950 font-sans dashboard-layout overflow-hidden">
        {/* Sidebar - fixed width */}
        <Sidebar />

        {/* Main Content Area - fluid width */}
        <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all">
          <Header />
          
          {/* Scrollable Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-[#0A0F1C]">
            <div className="w-full h-full min-h-[calc(100vh-5rem)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </InactivityGuard>
  );
}
