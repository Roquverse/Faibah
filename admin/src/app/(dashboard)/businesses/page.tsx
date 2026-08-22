'use client';

import React from 'react';
import { Search, Filter, MoreHorizontal, Users, Building2 } from 'lucide-react';
import Link from 'next/link';

const DUMMY_BUSINESSES = [
  { id: 'b_1', name: 'Nexora Solutions', owner: 'Alex Chen', email: 'alex@nexora.io', plan: 'Pro', mrr: '$120', team: 4, clients: 12, status: 'Active', date: '2023-10-12' },
  { id: 'b_2', name: 'NovaTech', owner: 'Sarah Jones', email: 'sarah@novatech.co', plan: 'Starter', mrr: '$49', team: 1, clients: 3, status: 'Active', date: '2023-11-05' },
  { id: 'b_3', name: 'Studio Alpha', owner: 'Marcus Wright', email: 'm.wright@studioalpha.net', plan: 'Pro', mrr: '$120', team: 2, clients: 8, status: 'Trial', date: '2023-11-20' },
  { id: 'b_4', name: 'Greenhouse Devs', owner: 'Elena Silva', email: 'elena@greenhouse.dev', plan: 'Enterprise', mrr: '$499', team: 12, clients: 45, status: 'Active', date: '2023-08-01' },
  { id: 'b_5', name: 'Apex Design', owner: 'Tom Hardy', email: 'tom@apexdesign.com', plan: 'Starter', mrr: '$0', team: 1, clients: 0, status: 'Suspended', date: '2023-09-15' },
];

export default function BusinessesPage() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Businesses</h1>
          <p className="text-sm text-muted mt-1">Manage tenants on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search businesses..." 
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
            {DUMMY_BUSINESSES.map((b) => (
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
