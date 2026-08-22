'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';
import { AdminApi } from '@/lib/api';

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminApi.getOverview().then(res => {
      setData(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-muted">Loading overview...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Overview</h1>
        <p className="text-sm text-muted mt-1">Platform performance and key metrics.</p>
      </div>

      {/* Alerts Strip */}
      <div className="border border-hairline bg-surface p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
          <AlertTriangle size={16} className="text-accent" />
          Attention Required
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-sm flex items-center justify-between py-1">
            <span className="text-muted">3 webhook delivery failures detected (Paystack)</span>
            <button className="text-accent hover:underline text-xs font-semibold">View Logs</button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard label="Total Businesses" value={data?.totalBusinesses?.toString() || '0'} trend="-" trendUp={true} />
        <MetricCard label="Monthly Recurring Revenue" value={`$${data?.mrr?.toLocaleString() || '0'}`} trend="-" trendUp={true} />
        <MetricCard label="Active Users (All Time)" value={data?.activeUsers?.toString() || '0'} trend="-" trendUp={true} />
        <MetricCard label="Tx Volume Processed" value={`$${data?.transactionVolume?.toLocaleString() || '0'}`} trend="-" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Placeholder */}
        <div className="lg:col-span-2 border border-hairline bg-surface p-6 h-80 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-4">New Signups (30 Days)</h3>
          <div className="flex-1 flex items-center justify-center border border-dashed border-hairline bg-background/50">
            <span className="text-sm text-muted">Chart placeholder</span>
          </div>
        </div>

        {/* Recent Signups Feed */}
        <div className="border border-hairline bg-surface p-0 flex flex-col">
          <div className="p-4 border-b border-hairline">
            <h3 className="text-sm font-semibold text-foreground">Recent Signups</h3>
          </div>
          <div className="divide-y divide-hairline flex-1 overflow-y-auto">
            {data?.recentSignups?.length > 0 ? data.recentSignups.map((c: any) => (
              <SignupRow key={c.id} name={c.name} plan={c.plan} date={new Date(c.date).toLocaleDateString()} />
            )) : (
              <div className="p-4 text-sm text-muted">No recent signups.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

function MetricCard({ label, value, trend, trendUp }: { label: string, value: string, trend: string, trendUp: boolean }) {
  return (
    <div className="border border-hairline bg-surface p-5 flex flex-col justify-between h-28">
      <div className="text-xs text-muted font-medium">{label}</div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-semibold text-foreground mono-num">{value}</div>
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${trendUp ? 'text-accent' : 'text-danger'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
    </div>
  );
}

function SignupRow({ name, plan, date }: { name: string, plan: string, date: string }) {
  return (
    <div className="p-4 flex flex-col gap-1 hover:bg-background/50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{name}</span>
        <span className="text-[10px] text-muted mono-num uppercase">{date}</span>
      </div>
      <div className="text-xs text-muted">
        Plan: <span className="text-foreground font-medium">{plan}</span>
      </div>
    </div>
  );
}
