'use client';

import React, { useEffect, useState } from 'react';
import { Flag, Search, Filter } from 'lucide-react';
import { AdminApi } from '@/lib/api';

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminApi.getFeatureFlags().then(res => {
      setFlags(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-muted">Loading feature flags...</div>;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 bg-background min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Feature Flags</h1>
          <p className="text-sm text-muted mt-1">Manage global feature rollouts and platform toggles.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search flags..." 
              className="pl-9 pr-4 py-2 bg-surface border border-hairline rounded-lg text-sm focus:outline-none focus:border-accent w-64 card-shadow"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white hover:bg-accent/90 transition-colors text-sm font-semibold rounded-lg card-shadow">
            <Flag size={14} /> New Flag
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flags.length > 0 ? flags.map((flag: any) => (
          <div key={flag.id} className="bg-surface rounded-2xl border border-hairline card-shadow p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground mono-num text-sm">{flag.name}</h3>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-muted bg-background px-2 py-0.5 rounded-sm border border-hairline">
                  {flag.key}
                </span>
              </div>
              
              {/* Toggle Mock */}
              <button 
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${flag.enabled ? 'bg-[#6D9773]' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <p className="text-sm text-muted leading-relaxed flex-1">
              {flag.description || 'No description provided.'}
            </p>
            
            <div className="pt-4 border-t border-hairline flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${flag.enabled ? 'text-[#6D9773]' : 'text-muted'}`}>
                {flag.enabled ? 'Enabled' : 'Disabled'}
              </span>
              <button className="text-xs font-semibold text-accent hover:underline">Edit Rules</button>
            </div>
          </div>
        )) : (
          <div className="col-span-full p-8 text-center text-muted border border-dashed border-hairline rounded-2xl">
            No feature flags found.
          </div>
        )}
      </div>
      
    </div>
  );
}
