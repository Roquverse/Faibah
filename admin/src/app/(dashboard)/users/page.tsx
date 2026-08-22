'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreHorizontal, Mail } from 'lucide-react';
import { AdminApi } from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminApi.getUsers().then(res => {
      setUsers(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-muted">Loading users...</div>;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 bg-background min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Global Users</h1>
          <p className="text-sm text-muted mt-1">Directory of all users across the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search users by email..." 
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
              <th className="px-4 py-3 font-semibold text-muted">Name</th>
              <th className="px-4 py-3 font-semibold text-muted">Email</th>
              <th className="px-4 py-3 font-semibold text-muted">Type</th>
              <th className="px-4 py-3 font-semibold text-muted">Company (Tenant)</th>
              <th className="px-4 py-3 font-semibold text-muted">Joined Date</th>
              <th className="px-4 py-3 font-semibold text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {users.length > 0 ? users.map((u) => (
              <tr key={u.id} className="hover:bg-background/80 transition-colors group">
                <td className="px-4 py-3 font-semibold text-foreground">
                  {u.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-muted">
                    <Mail size={12} /> {u.email}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                    u.type === 'PROFESSIONAL' ? 'bg-accent/10 text-accent' : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    {u.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{u.company}</td>
                <td className="px-4 py-3 mono-num text-muted text-xs">{u.date}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="p-4 text-center text-muted">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
