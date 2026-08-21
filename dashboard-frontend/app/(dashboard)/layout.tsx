import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0 h-full relative z-0">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}
