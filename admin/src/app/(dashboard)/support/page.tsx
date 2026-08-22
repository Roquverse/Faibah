'use client';

import React from 'react';
import { Search, Filter, LifeBuoy, MessageSquare, Clock } from 'lucide-react';

const TICKETS = [
  { id: 'tic_001', subject: 'Billing cycle issue', tenant: 'Nexora Solutions', priority: 'High', status: 'Open', time: '10 mins ago' },
  { id: 'tic_002', subject: 'How to add custom domain?', tenant: 'Studio Alpha', priority: 'Low', status: 'Pending', time: '2 hours ago' },
  { id: 'tic_003', subject: 'Webhook signature validation fails', tenant: 'Greenhouse Devs', priority: 'Critical', status: 'Open', time: '5 hours ago' },
];

export default function SupportPage() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 bg-[#F8F9FA] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Support Tickets</h1>
          <p className="text-sm text-muted mt-1">Manage platform and tenant support inquiries.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              className="pl-9 pr-4 py-2 bg-surface border border-hairline rounded-lg text-sm focus:outline-none focus:border-accent w-64 card-shadow"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-hairline bg-surface hover:bg-background transition-colors text-sm font-medium rounded-lg card-shadow">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-surface rounded-2xl border border-hairline card-shadow flex flex-col h-[700px] overflow-hidden">
          <div className="p-4 border-b border-hairline">
            <h3 className="font-semibold text-sm text-foreground">Open Tickets (3)</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-hairline">
            {TICKETS.map(ticket => (
              <div key={ticket.id} className="p-4 hover:bg-background/50 transition-colors cursor-pointer flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                    ticket.priority === 'Critical' ? 'bg-danger/10 text-danger' : 
                    ticket.priority === 'High' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {ticket.priority}
                  </span>
                  <span className="text-xs text-muted mono-num flex items-center gap-1"><Clock size={10} /> {ticket.time}</span>
                </div>
                <h4 className="font-semibold text-sm text-foreground">{ticket.subject}</h4>
                <div className="text-xs text-muted">From: <span className="font-medium text-foreground">{ticket.tenant}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Detail (Placeholder) */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-hairline card-shadow flex flex-col h-[700px] overflow-hidden">
          <div className="p-6 border-b border-hairline flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Webhook signature validation fails</h2>
              <span className="text-xs font-bold uppercase tracking-wider text-accent border border-accent/20 px-2 py-1 bg-accent/5">Ticket Open</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span>Tenant: <span className="font-medium text-foreground">Greenhouse Devs</span></span>
              <span>Reported: <span className="mono-num">5 hours ago</span></span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/30">
            {/* User Message */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-surface border border-hairline flex flex-shrink-0 items-center justify-center">
                <LifeBuoy size={14} className="text-muted" />
              </div>
              <div className="flex flex-col gap-1 w-full max-w-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Elena Silva</span>
                  <span className="text-xs text-muted mono-num">5 hours ago</span>
                </div>
                <div className="text-sm text-muted leading-relaxed bg-surface border border-hairline p-4 rounded-b-md rounded-tr-md">
                  Hi team, we are trying to integrate your webhooks into our internal accounting system but the signature validation keeps failing using the shared secret. Can you check if the secret was rotated on your end?
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-hairline bg-surface">
            <div className="relative">
              <textarea 
                placeholder="Type your reply..." 
                className="w-full bg-background border border-hairline p-3 pr-12 text-sm focus:outline-none focus:border-accent min-h-[100px] resize-none"
              />
              <button className="absolute bottom-4 right-3 text-accent hover:text-accent/80 transition-colors">
                <MessageSquare size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  );
}
