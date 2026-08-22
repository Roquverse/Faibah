'use client';

import React, { useEffect, useState } from 'react';
import { Search, UserPlus, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { AdminApi } from '@/lib/api';

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminApi.getTeam().then(res => {
      setTeam(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-muted">Loading team...</div>;

  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8 bg-[#F8F9FA] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Team & Roles</h1>
          <p className="text-sm text-muted mt-1">Manage internal platform administrators.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search team..." 
              className="pl-9 pr-4 py-2 bg-surface border border-hairline rounded-lg text-sm focus:outline-none focus:border-accent w-64 card-shadow"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white hover:bg-accent/90 transition-colors text-sm font-semibold rounded-lg card-shadow">
            <UserPlus size={14} /> Invite Admin
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
              <th className="px-4 py-3 font-semibold text-muted">Role</th>
              <th className="px-4 py-3 font-semibold text-muted">Joined</th>
              <th className="px-4 py-3 font-semibold text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {team.length > 0 ? team.map((member) => (
              <tr key={member.id} className="hover:bg-background/80 transition-colors group">
                <td className="px-4 py-3 font-semibold text-foreground">
                  {member.name}
                </td>
                <td className="px-4 py-3 text-muted">
                  {member.email}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 w-max px-2 py-0.5 rounded-sm">
                    <ShieldCheck size={12} /> Super Admin
                  </span>
                </td>
                <td className="px-4 py-3 mono-num text-muted text-xs">{member.date}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="p-8 text-center text-muted">No team members found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
