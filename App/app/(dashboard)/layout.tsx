import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import InactivityGuard from '@/components/auth/InactivityGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <InactivityGuard>
      <div className="dashboard-layout flex h-screen print:h-auto w-full overflow-hidden print:overflow-visible bg-white print:block">
        <div className="print:hidden">
          <Sidebar />
        </div>
        <div className="flex-1 md:ml-64 print:ml-0 flex flex-col min-w-0 h-full print:h-auto print:block relative z-0">
          <div className="print:hidden">
            <Header />
          </div>
          <main className="flex-1 overflow-x-hidden overflow-y-auto print:overflow-visible print:h-auto w-full relative">
            {children}
          </main>
        </div>
      </div>
    </InactivityGuard>
  );
}
