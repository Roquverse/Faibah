'use client';

import React from 'react';
import { Activity, Server, ShieldAlert, CheckCircle2 } from 'lucide-react';

const WEBHOOK_LOGS = [
  { id: 'wh_1', provider: 'Paystack', event: 'charge.success', status: 'Failed', tenant: 'Nexora Solutions', time: '2 mins ago', retryCount: 2 },
  { id: 'wh_2', provider: 'Termii', event: 'whatsapp.delivered', status: 'Success', tenant: 'NovaTech', time: '5 mins ago', retryCount: 0 },
  { id: 'wh_3', provider: 'Paystack', event: 'charge.success', status: 'Success', tenant: 'Studio Alpha', time: '12 mins ago', retryCount: 0 },
  { id: 'wh_4', provider: 'Termii', event: 'whatsapp.failed', status: 'Failed', tenant: 'Greenhouse Devs', time: '18 mins ago', retryCount: 1 },
  { id: 'wh_5', provider: 'Paystack', event: 'subscription.create', status: 'Success', tenant: 'Apex Design', time: '1 hour ago', retryCount: 0 },
];

export default function SystemHealthPage() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">System Health</h1>
          <p className="text-sm text-muted mt-1">Platform stability, queue depth, and webhook delivery status.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
          </span>
          All Systems Operational
        </div>
      </div>

      {/* Snapshot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-hairline bg-surface p-5 flex flex-col justify-between h-28">
          <div className="text-[11px] text-muted font-bold uppercase tracking-wider flex items-center gap-2">
            <Activity size={12}/> API Error Rate (1h)
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-semibold text-foreground mono-num">0.01%</div>
          </div>
        </div>
        
        <div className="border border-hairline bg-surface p-5 flex flex-col justify-between h-28">
          <div className="text-[11px] text-muted font-bold uppercase tracking-wider flex items-center gap-2">
            <Server size={12}/> Job Queue Depth
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-semibold text-foreground mono-num">42</div>
            <div className="text-xs text-muted font-semibold">Processing...</div>
          </div>
        </div>

        <div className="border border-danger/50 bg-danger/5 p-5 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="text-[11px] text-danger font-bold uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert size={12}/> Webhook Failures (24h)
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-semibold text-danger mono-num">2</div>
            <div className="text-xs text-danger font-bold">Needs review</div>
          </div>
        </div>
      </div>

      {/* Webhook Delivery Log */}
      <div className="border border-hairline bg-surface flex flex-col">
        <div className="p-4 border-b border-hairline flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Webhook Delivery Log</h3>
            <p className="text-xs text-muted mt-0.5">Paystack & Termii incoming events.</p>
          </div>
          <button className="text-xs font-semibold text-accent hover:underline">Retry All Failed</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-hairline bg-background/50">
                <th className="px-4 py-3 font-semibold text-muted">Time</th>
                <th className="px-4 py-3 font-semibold text-muted">Provider</th>
                <th className="px-4 py-3 font-semibold text-muted">Event</th>
                <th className="px-4 py-3 font-semibold text-muted">Tenant</th>
                <th className="px-4 py-3 font-semibold text-muted">Retries</th>
                <th className="px-4 py-3 font-semibold text-muted">Status</th>
                <th className="px-4 py-3 font-semibold text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {WEBHOOK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-background/80 transition-colors">
                  <td className="px-4 py-3 mono-num text-xs text-muted">{log.time}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{log.provider}</td>
                  <td className="px-4 py-3 mono-num text-xs text-foreground">{log.event}</td>
                  <td className="px-4 py-3 text-muted">{log.tenant}</td>
                  <td className="px-4 py-3 mono-num text-muted">{log.retryCount}</td>
                  <td className="px-4 py-3">
                    {log.status === 'Success' ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[#16A34A] uppercase tracking-wider">
                        <CheckCircle2 size={12} /> OK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-danger uppercase tracking-wider">
                        <ShieldAlert size={12} /> Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {log.status === 'Failed' && (
                      <button className="text-xs font-semibold text-accent hover:underline">Manual Retry</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
