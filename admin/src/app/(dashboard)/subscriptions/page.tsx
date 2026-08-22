'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreHorizontal, CreditCard } from 'lucide-react';
import { AdminApi } from '@/lib/api';

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminApi.getSubscriptions().then(res => {
      setSubs(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-muted">Loading subscriptions...</div>;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Subscriptions</h1>
          <p className="text-sm text-muted mt-1">Platform-wide tenant billing records.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search tenant..." 
              className="pl-9 pr-4 py-1.5 bg-background border border-hairline text-sm focus:outline-none focus:border-accent w-64 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-hairline bg-surface hover:bg-background transition-colors text-sm font-medium">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-hairline bg-surface overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-hairline bg-background/50">
              <th className="px-4 py-3 font-semibold text-muted">Tenant</th>
              <th className="px-4 py-3 font-semibold text-muted">Plan</th>
              <th className="px-4 py-3 font-semibold text-muted">Amount</th>
              <th className="px-4 py-3 font-semibold text-muted">Frequency</th>
              <th className="px-4 py-3 font-semibold text-muted">Status</th>
              <th className="px-4 py-3 font-semibold text-muted">Next Billing</th>
              <th className="px-4 py-3 font-semibold text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {subs.length > 0 ? subs.map((s) => (
              <tr key={s.id} className="hover:bg-background/80 transition-colors group">
                <td className="px-4 py-3 font-semibold text-foreground">
                  {s.tenant}
                </td>
                <td className="px-4 py-3 text-muted">
                  {s.plan}
                </td>
                <td className="px-4 py-3 mono-num text-foreground">
                  ${s.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-muted">
                  {s.frequency}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                    s.status === 'ACTIVE' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-danger/10 text-danger'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 mono-num text-muted text-xs">{s.nextBilling}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="p-4 text-center text-muted">No subscriptions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
