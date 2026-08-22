'use client';

import React from 'react';
import { Save, Key, Globe, Shield, CreditCard } from 'lucide-react';

export default function ConfigPage() {
  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Platform Configuration</h1>
          <p className="text-sm text-muted mt-1">Global settings, API keys, and limits.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white hover:bg-accent/90 transition-colors text-sm font-semibold">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Nav */}
        <div className="md:col-span-1 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-accent bg-accent/10 border-l-2 border-accent text-left">
            <Globe size={16} /> General
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-foreground text-left border-l-2 border-transparent hover:bg-background/50 transition-colors">
            <Key size={16} /> API Keys
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-foreground text-left border-l-2 border-transparent hover:bg-background/50 transition-colors">
            <CreditCard size={16} /> Billing Config
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-foreground text-left border-l-2 border-transparent hover:bg-background/50 transition-colors">
            <Shield size={16} /> Security
          </button>
        </div>

        {/* Form Content */}
        <div className="md:col-span-3 space-y-8">
          
          <section className="border border-hairline bg-surface">
            <div className="p-4 border-b border-hairline">
              <h3 className="font-semibold text-foreground text-sm">Platform Basics</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Platform Name</label>
                  <input type="text" defaultValue="Faibah" className="w-full bg-background border border-hairline p-2 text-sm focus:outline-none focus:border-accent text-foreground" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Support Email</label>
                  <input type="email" defaultValue="support@faibah.com" className="w-full bg-background border border-hairline p-2 text-sm focus:outline-none focus:border-accent text-foreground" />
                </div>
              </div>
            </div>
          </section>

          <section className="border border-hairline bg-surface">
            <div className="p-4 border-b border-hairline">
              <h3 className="font-semibold text-foreground text-sm">Default Limits (Free Tier)</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Max Projects</label>
                  <input type="number" defaultValue={3} className="w-full bg-background border border-hairline p-2 text-sm focus:outline-none focus:border-accent text-foreground mono-num" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Max Team Members</label>
                  <input type="number" defaultValue={2} className="w-full bg-background border border-hairline p-2 text-sm focus:outline-none focus:border-accent text-foreground mono-num" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Storage Limit (GB)</label>
                  <input type="number" defaultValue={5} className="w-full bg-background border border-hairline p-2 text-sm focus:outline-none focus:border-accent text-foreground mono-num" />
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
      
    </div>
  );
}
