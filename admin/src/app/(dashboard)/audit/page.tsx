'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, ScrollText, Download } from 'lucide-react';
import { AdminApi } from '@/lib/api';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminApi.getAuditLogs().then(res => {
      setLogs(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-muted">Loading audit logs...</div>;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 bg-[#F8F9FA] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Audit Log</h1>
          <p className="text-sm text-muted mt-1">Live stream of platform activities and events.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="pl-9 pr-4 py-2 bg-surface border border-hairline rounded-lg text-sm focus:outline-none focus:border-accent w-64 card-shadow"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-hairline bg-surface hover:bg-background transition-colors text-sm font-medium rounded-lg card-shadow">
            <Filter size={14} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-hairline bg-surface hover:bg-background transition-colors text-sm font-medium rounded-lg card-shadow">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-hairline card-shadow overflow-hidden flex flex-col h-[700px]">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-hairline bg-background/50">
                <th className="px-4 py-3 font-semibold text-muted">Timestamp</th>
                <th className="px-4 py-3 font-semibold text-muted">Action</th>
                <th className="px-4 py-3 font-semibold text-muted">Details</th>
                <th className="px-4 py-3 font-semibold text-muted">Event ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {logs.length > 0 ? logs.map((l) => (
                <tr key={l.id} className="hover:bg-background/80 transition-colors group">
                  <td className="px-4 py-3 mono-num text-muted text-xs">
                    {new Date(l.date).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent">
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">
                    {l.message}
                  </td>
                  <td className="px-4 py-3 mono-num text-muted text-xs">
                    {l.id}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted">
                    <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No audit logs available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
