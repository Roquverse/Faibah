'use client';

import React, { useEffect, useState } from 'react';
import { AdminApi } from '@/lib/api';
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Percent,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';

export default function DashboardOverview() {
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
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 bg-[#F8F9FA] min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Welcome back, Admin! Here's what's happening with your platform today.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-hairline rounded-lg text-sm font-medium text-foreground card-shadow hover:bg-background transition-colors">
          <Calendar size={16} className="text-muted" />
          <span>May 12, 2024 - Jun 12, 2024</span>
          <ChevronDown size={14} className="text-muted ml-1" />
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Revenue */}
        <div className="bg-surface rounded-2xl p-6 border border-hairline card-shadow flex flex-col gap-4 relative overflow-hidden group">
          <div className="flex items-start justify-between relative z-10">
            <span className="text-sm font-semibold text-foreground">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
              <DollarSign size={20} className="text-[#8B5CF6]" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-bold text-foreground mono-num flex items-baseline gap-3">
              ${(data?.platformMrr || 24780).toLocaleString()}
              <span className="text-xs font-semibold text-success flex items-center">
                <ArrowUpRight size={14} className="mr-0.5" /> 12.5%
              </span>
            </div>
            <p className="text-xs text-muted mt-1">vs last month</p>
          </div>
          <svg className="absolute bottom-0 left-0 w-full h-12 text-[#8B5CF6] opacity-30 group-hover:opacity-60 transition-opacity" preserveAspectRatio="none" viewBox="0 0 100 20">
            <path d="M0 20 L0 15 Q 10 5, 20 15 T 40 10 T 60 15 T 80 5 T 100 10 L100 20 Z" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
          </svg>
        </div>

        {/* Card 2: New Users */}
        <div className="bg-surface rounded-2xl p-6 border border-hairline card-shadow flex flex-col gap-4 relative overflow-hidden group">
          <div className="flex items-start justify-between relative z-10">
            <span className="text-sm font-semibold text-foreground">Active Tenants</span>
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
              <Users size={20} className="text-[#3B82F6]" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-bold text-foreground mono-num flex items-baseline gap-3">
              {(data?.totalBusinesses || 1248).toLocaleString()}
              <span className="text-xs font-semibold text-success flex items-center">
                <ArrowUpRight size={14} className="mr-0.5" /> 8.3%
              </span>
            </div>
            <p className="text-xs text-muted mt-1">vs last month</p>
          </div>
          <svg className="absolute bottom-0 left-0 w-full h-12 text-[#3B82F6] opacity-30 group-hover:opacity-60 transition-opacity" preserveAspectRatio="none" viewBox="0 0 100 20">
            <path d="M0 20 L0 10 Q 15 15, 30 5 T 50 15 T 70 10 T 85 15 T 100 5 L100 20 Z" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
          </svg>
        </div>

        {/* Card 3: Total Orders */}
        <div className="bg-surface rounded-2xl p-6 border border-hairline card-shadow flex flex-col gap-4 relative overflow-hidden group">
          <div className="flex items-start justify-between relative z-10">
            <span className="text-sm font-semibold text-foreground">Total Invoices</span>
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <ShoppingCart size={20} className="text-accent" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-bold text-foreground mono-num flex items-baseline gap-3">
              {2760}
              <span className="text-xs font-semibold text-success flex items-center">
                <ArrowUpRight size={14} className="mr-0.5" /> 15.2%
              </span>
            </div>
            <p className="text-xs text-muted mt-1">vs last month</p>
          </div>
          <svg className="absolute bottom-0 left-0 w-full h-12 text-accent opacity-30 group-hover:opacity-60 transition-opacity" preserveAspectRatio="none" viewBox="0 0 100 20">
            <path d="M0 20 L0 18 Q 10 10, 20 18 T 40 5 T 60 15 T 80 5 T 100 12 L100 20 Z" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
          </svg>
        </div>

        {/* Card 4: Conversion Rate */}
        <div className="bg-surface rounded-2xl p-6 border border-hairline card-shadow flex flex-col gap-4 relative overflow-hidden group">
          <div className="flex items-start justify-between relative z-10">
            <span className="text-sm font-semibold text-foreground">Conversion Rate</span>
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
              <Percent size={20} className="text-[#F59E0B]" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-bold text-foreground mono-num flex items-baseline gap-3">
              4.32%
              <span className="text-xs font-semibold text-danger flex items-center">
                <ArrowDownRight size={14} className="mr-0.5" /> 3.4%
              </span>
            </div>
            <p className="text-xs text-muted mt-1">vs last month</p>
          </div>
          <svg className="absolute bottom-0 left-0 w-full h-12 text-[#F59E0B] opacity-30 group-hover:opacity-60 transition-opacity" preserveAspectRatio="none" viewBox="0 0 100 20">
            <path d="M0 20 L0 5 Q 15 15, 30 10 T 50 18 T 70 5 T 85 15 T 100 10 L100 20 Z" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
          </svg>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Overview (Area Chart Placeholder) */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-hairline card-shadow p-6 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-foreground">Revenue Overview</h2>
            <button className="flex items-center gap-1 text-sm font-medium text-foreground bg-background px-3 py-1.5 rounded-lg border border-hairline">
              Daily <ChevronDown size={14} className="text-muted ml-1" />
            </button>
          </div>
          
          <div className="flex-1 min-h-[300px] relative w-full flex items-end">
            {/* Simple SVG Area Chart Mockup */}
            <div className="absolute inset-0 flex flex-col justify-between text-xs text-muted pb-8 z-0">
              <div className="border-b border-hairline w-full flex-1 flex items-start"><span>$30k</span></div>
              <div className="border-b border-hairline w-full flex-1 flex items-start"><span>$20k</span></div>
              <div className="border-b border-hairline w-full flex-1 flex items-start"><span>$10k</span></div>
              <div className="border-b border-hairline w-full flex-1 flex items-start"><span>$0</span></div>
            </div>
            
            {/* Chart Area */}
            <div className="w-full h-full relative z-10 pt-4 pl-10 pb-8">
               <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Area */}
                  <path d="M0 100 L0 60 Q 10 50, 20 60 T 40 40 T 60 70 T 80 40 T 100 30 L100 100 Z" fill="url(#gradient)" />
                  {/* Line */}
                  <path d="M0 60 Q 10 50, 20 60 T 40 40 T 60 70 T 80 40 T 100 30" fill="none" stroke="#8B5CF6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  
                  {/* Tooltip dot */}
                  <circle cx="40" cy="40" r="4" fill="#8B5CF6" stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
               </svg>
               
               {/* Floating Tooltip mock */}
               <div className="absolute top-[20%] left-[35%] bg-surface border border-hairline shadow-lg rounded-lg p-3 flex flex-col items-center">
                 <span className="text-[10px] text-muted">May 26, 2024</span>
                 <span className="font-bold text-sm">$18,920</span>
               </div>
            </div>
            
            {/* X Axis */}
            <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs text-muted pr-4">
              <span>May 12</span>
              <span>May 19</span>
              <span>May 26</span>
              <span>Jun 02</span>
              <span>Jun 09</span>
            </div>
          </div>
        </div>

        {/* Top Channels & Recent Activity */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Top Channels */}
          <div className="bg-surface rounded-2xl border border-hairline card-shadow p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-foreground">Top Channels</h2>
              <button className="text-accent text-sm font-medium hover:underline">View all</button>
            </div>
            <div className="flex-1 flex items-center justify-center py-4">
              {/* Donut Mockup */}
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path className="text-[#3B82F6]" strokeDasharray="40, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-[#10B981]" strokeDasharray="30, 100" strokeDashoffset="-40" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-[#F59E0B]" strokeDasharray="20, 100" strokeDashoffset="-70" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-[#8B5CF6]" strokeDasharray="10, 100" strokeDashoffset="-90" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-muted">Total</span>
                  <span className="text-lg font-bold">24,780</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface rounded-2xl border border-hairline card-shadow p-6 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-foreground">Recent Activity</h2>
              <button className="text-accent text-sm font-medium hover:underline">View all</button>
            </div>
            <div className="flex flex-col gap-6 relative">
              <div className="absolute left-4 top-4 bottom-4 w-px bg-hairline"></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#3B82F6]/10 border-2 border-surface flex items-center justify-center flex-shrink-0">
                  <Users size={14} className="text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground">New user registered</h4>
                  <p className="text-xs text-muted">Liam Johnson</p>
                </div>
                <span className="text-xs text-muted">2m ago</span>
              </div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#10B981]/10 border-2 border-surface flex items-center justify-center flex-shrink-0">
                  <ShoppingCart size={14} className="text-[#10B981]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground">Order completed</h4>
                  <p className="text-xs text-muted">#ORD-1732</p>
                </div>
                <span className="text-xs text-muted">15m ago</span>
              </div>
              
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-hairline card-shadow overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-hairline">
            <h2 className="font-bold text-foreground">Recent Orders</h2>
            <button className="text-accent text-sm font-medium hover:underline">View all</button>
          </div>
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-muted text-xs uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 font-semibold text-muted text-xs uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 font-semibold text-muted text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold text-muted text-xs uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 font-semibold text-muted text-xs uppercase tracking-wider">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {data?.recentSignups.slice(0,5).map((t: any, i: number) => (
                <tr key={i} className="hover:bg-background/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground mono-num">#ORD-174{5-i}</td>
                  <td className="px-6 py-4 text-foreground">{t.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success">
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground mono-num">$299.00</td>
                  <td className="px-6 py-4 text-muted mono-num">Jun 12, 2024</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-muted hover:text-foreground"><MoreVertical size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Users Overview (Map Mock) */}
        <div className="lg:col-span-1 bg-surface rounded-2xl border border-hairline card-shadow p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-foreground">Users Overview</h2>
            <button className="text-accent text-sm font-medium hover:underline">View all</button>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            {/* Fake SVG Map Area */}
            <div className="w-full h-32 bg-background rounded-lg border border-hairline flex items-center justify-center overflow-hidden relative">
               <span className="text-muted text-xs absolute z-10">World Map Graphic</span>
               {/* Abstract bubbles to look like a map */}
               <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/20 absolute left-8 top-4 blur-xl"></div>
               <div className="w-24 h-24 rounded-full bg-[#3B82F6]/20 absolute right-12 top-2 blur-xl"></div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="w-4 h-3 rounded-sm bg-blue-500 inline-block text-[8px] text-white flex items-center justify-center font-bold">US</span> United States</span>
                <span className="font-semibold mono-num">2,420</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="w-4 h-3 rounded-sm bg-red-500 inline-block text-[8px] text-white flex items-center justify-center font-bold">CA</span> Canada</span>
                <span className="font-semibold mono-num">1,120</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="w-4 h-3 rounded-sm bg-blue-800 inline-block text-[8px] text-white flex items-center justify-center font-bold">UK</span> United Kingdom</span>
                <span className="font-semibold mono-num">980</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
