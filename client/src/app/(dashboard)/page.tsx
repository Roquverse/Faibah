'use client';

import React from 'react';
import { CreditCard, FileText, Folder, CheckCircle2 } from 'lucide-react';

export default function ClientOverviewPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-deep-green to-[#2a5a2e] rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2 text-center md:text-left mb-6 md:mb-0">
          <h2 className="text-2xl md:text-3xl font-bold">Welcome back, Client!</h2>
          <p className="text-green-100/90 text-sm md:text-base max-w-xl leading-relaxed">
            Here's an overview of your active projects and outstanding invoices.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Active Projects', value: '2', icon: Folder, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { title: 'Outstanding Invoices', value: '1', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
          { title: 'Amount Due', value: 'NGN 150,000', icon: CreditCard, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
          { title: 'Completed Projects', value: '4', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Invoices</h3>
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <FileText size={48} className="mb-4 opacity-50" />
            <p>No recent invoices</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Active Projects</h3>
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Folder size={48} className="mb-4 opacity-50" />
            <p>No active projects</p>
          </div>
        </div>
      </div>
    </div>
  );
}
