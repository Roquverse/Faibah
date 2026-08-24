'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, Folder, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

import { ProjectsApi, InvoicesApi } from '@/lib/api';

export default function ClientOverviewPage() {
  const [firstName, setFirstName] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
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

        const [projData, invData] = await Promise.all([
          ProjectsApi.getAll().catch(() => []),
          InvoicesApi.getAll().catch(() => []),
        ]);
        setProjects(projData || []);
        setInvoices(invData || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeProjectsCount = projects.filter(p => p.status === 'ONGOING' || p.status === 'AWAITING_PAYMENT' || p.status === 'DRAFT').length;
  const completedProjectsCount = projects.filter(p => p.status === 'COMPLETED').length;

  const unpaidInvoices = invoices.filter(inv => inv.status !== 'PAID' && inv.status !== 'CANCELLED');
  const outstandingInvoicesCount = unpaidInvoices.length;

  const totalAmountDue = unpaidInvoices.reduce((acc, inv) => {
    const itemsTotal = inv.items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
    const withTax = itemsTotal + (itemsTotal * ((inv.taxRate || 0) / 100));
    return acc + withTax;
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-6 lg:p-8 w-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-deep-green to-[#2a5a2e] rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2 text-center md:text-left mb-6 md:mb-0">
          <h2 className="text-2xl md:text-3xl font-bold">Welcome back, {firstName || 'Client'}!</h2>
          <p className="text-green-100/90 text-sm md:text-base max-w-xl leading-relaxed">
            Here's an overview of your active projects and outstanding invoices.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Active Projects', value: activeProjectsCount.toString(), icon: Folder, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { title: 'Outstanding Invoices', value: outstandingInvoicesCount.toString(), icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
          { title: 'Amount Due', value: `₦${totalAmountDue.toLocaleString()}`, icon: CreditCard, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
          { title: 'Completed Projects', value: completedProjectsCount.toString(), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Invoices</h3>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <FileText size={48} className="mb-4 opacity-50" />
              <p>No recent invoices</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {invoices.slice(0, 5).map((inv, idx) => {
                const total = (inv.items?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0) * (1 + (inv.taxRate || 0)/100);
                return (
                  <div key={inv.id || idx} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{inv.invoiceRef || 'INV-0001'}</div>
                      <div className="text-xs text-gray-500">{inv.project?.name || 'General Invoice'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-gray-900 dark:text-white">₦{total.toLocaleString()}</div>
                      <span className={`text-[10px] font-bold uppercase ${inv.status === 'PAID' ? 'text-green-600' : 'text-orange-500'}`}>{inv.status || 'SENT'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Active Projects</h3>
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Folder size={48} className="mb-4 opacity-50" />
              <p>No active projects</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {projects.slice(0, 5).map((proj, idx) => (
                <div key={proj.id || idx} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{proj.name}</div>
                    <div className="text-xs text-gray-500">{proj.client?.name || 'Project'}</div>
                  </div>
                  <span className="text-xs font-bold text-deep-green bg-green-50 px-2.5 py-1 rounded-full">{proj.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
