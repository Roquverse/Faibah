'use client';

import React from 'react';
import { ArrowLeft, ExternalLink, ShieldAlert, BarChart, Users, FileText, Activity } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BusinessDetailPage() {
  const params = useParams();
  
  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8">
      
      {/* Back & Breadcrumb */}
      <div className="flex items-center gap-4 text-sm">
        <Link href="/businesses" className="text-muted hover:text-foreground flex items-center gap-1 transition-colors">
          <ArrowLeft size={16} /> Back to Businesses
        </Link>
        <span className="text-hairline">|</span>
        <span className="text-muted mono-num">ID: {params.id}</span>
      </div>

      {/* Header Profile */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Nexora Solutions</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-[#16A34A]/10 text-[#16A34A]">
              Active
            </span>
          </div>
          <p className="text-sm text-muted mt-1">Owner: Alex Chen (alex@nexora.io)</p>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-hairline bg-surface hover:bg-background transition-colors text-sm font-medium">
            <ExternalLink size={14} /> View As
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-danger text-danger bg-danger/5 hover:bg-danger/10 transition-colors text-sm font-medium">
            <ShieldAlert size={14} /> Suspend
          </button>
        </div>
      </div>

      {/* Snapshot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-hairline bg-surface p-4 flex flex-col justify-between h-24">
          <div className="text-[11px] uppercase font-bold tracking-wider text-muted flex items-center gap-2">
            <BarChart size={12}/> Current MRR
          </div>
          <div className="text-xl font-bold text-foreground mono-num">$120.00</div>
        </div>
        <div className="border border-hairline bg-surface p-4 flex flex-col justify-between h-24">
          <div className="text-[11px] uppercase font-bold tracking-wider text-muted flex items-center gap-2">
            <Users size={12}/> Team Size
          </div>
          <div className="text-xl font-bold text-foreground mono-num">4</div>
        </div>
        <div className="border border-hairline bg-surface p-4 flex flex-col justify-between h-24">
          <div className="text-[11px] uppercase font-bold tracking-wider text-muted flex items-center gap-2">
            <FileText size={12}/> Invoices Sent
          </div>
          <div className="text-xl font-bold text-foreground mono-num">145</div>
        </div>
        <div className="border border-hairline bg-surface p-4 flex flex-col justify-between h-24">
          <div className="text-[11px] uppercase font-bold tracking-wider text-muted flex items-center gap-2">
            <Activity size={12}/> Vol. Processed
          </div>
          <div className="text-xl font-bold text-foreground mono-num">$24,500</div>
        </div>
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Billing History */}
        <div className="border border-hairline bg-surface">
          <div className="p-4 border-b border-hairline">
            <h3 className="text-sm font-bold text-foreground">Billing History</h3>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-hairline">
                <tr className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 mono-num text-xs text-muted">2023-11-12</td>
                  <td className="px-4 py-3">Pro Plan (Monthly)</td>
                  <td className="px-4 py-3 text-right mono-num font-medium">$120.00</td>
                  <td className="px-4 py-3 text-right"><span className="text-[#16A34A] text-xs font-bold">PAID</span></td>
                </tr>
                <tr className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 mono-num text-xs text-muted">2023-10-12</td>
                  <td className="px-4 py-3">Pro Plan (Monthly)</td>
                  <td className="px-4 py-3 text-right mono-num font-medium">$120.00</td>
                  <td className="px-4 py-3 text-right"><span className="text-[#16A34A] text-xs font-bold">PAID</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Support Tickets */}
        <div className="border border-hairline bg-surface">
          <div className="p-4 border-b border-hairline">
            <h3 className="text-sm font-bold text-foreground">Recent Support Tickets</h3>
          </div>
          <div className="p-4 text-sm text-muted">
            No recent support tickets for this business.
          </div>
        </div>

      </div>

    </div>
  );
}
