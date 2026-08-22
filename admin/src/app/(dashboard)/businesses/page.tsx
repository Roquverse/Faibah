'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreHorizontal, Users, Building2 } from 'lucide-react';
import Link from 'next/link';
import { AdminApi } from '@/lib/api';

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminApi.getBusinesses().then(res => {
      setBusinesses(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-muted">Loading businesses...</div>;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 bg-background min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Businesses (Tenants)</h1>
          <p className="text-sm text-muted mt-1">Manage all tenant workspaces and their configurations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              className="pl-9 pr-4 py-2 bg-surface border border-hairline rounded-lg text-sm focus:outline-none focus:border-accent w-64 card-shadow"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-hairline bg-surface hover:bg-background transition-colors text-sm font-medium rounded-lg card-shadow">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-hairline card-shadow overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-hairline bg-background/50">
              <th className="px-4 py-3 font-semibold text-muted">Business Name</th>
              <th className="px-4 py-3 font-semibold text-muted">Owner</th>
              <th className="px-4 py-3 font-semibold text-muted">Plan</th>
              <th className="px-4 py-3 font-semibold text-muted">MRR</th>
              <th className="px-4 py-3 font-semibold text-muted">Usage</th>
              <th className="px-4 py-3 font-semibold text-muted">Signup Date</th>
              <th className="px-4 py-3 font-semibold text-muted">Status</th>
              <th className="px-4 py-3 font-semibold text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {businesses.map((b) => (
              <tr key={b.id} className="hover:bg-background/80 transition-colors group">
                <td className="px-4 py-3">
                  <Link href={`/businesses/${b.id}`} className="font-semibold text-foreground hover:text-accent">
                    {b.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-foreground">{b.owner}</span>
                    <span className="text-[11px] text-muted">{b.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-foreground">{b.plan}</span>
                </td>
                <td className="px-4 py-3 mono-num text-foreground">{b.mrr}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-xs text-muted mono-num">
                    <span title="Team Size"><Users size={12} className="inline mr-1"/>{b.team}</span>
                    <span title="Clients"><Building2 size={12} className="inline mr-1"/>{b.clients}</span>
                  </div>
                </td>
                <td className="px-4 py-3 mono-num text-muted text-xs">{b.date}</td>
                <td className="px-4 py-3">
                  <StatusPill status={b.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  let bg = 'bg-gray-500/10';
  let text = 'text-gray-500';
  
  if (status === 'Active') {
    bg = 'bg-[#16A34A]/10'; // Success green
    text = 'text-[#16A34A]';
  } else if (status === 'Trial') {
    bg = 'bg-[#F59E0B]/10'; // Warning amber
    text = 'text-[#F59E0B]';
  } else if (status === 'Suspended') {
    bg = 'bg-[#DC2626]/10'; // Danger red
    text = 'text-[#DC2626]';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${bg} ${text}`}>
      {status}
    </span>
  );
}
