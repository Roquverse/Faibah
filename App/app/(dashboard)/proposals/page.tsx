'use client';

import React, { useState, useEffect } from 'react';
import { Plus, FileText, Eye, MoreHorizontal, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { ProjectsApi, ClientsApi } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { StatusPill } from '@/components/shared/StatusPill';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTierAccess } from '@/lib/permissions/useTierAccess';
import { redirect } from 'next/navigation';

type Proposal = {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  status: string;
  createdAt: string;
  content?: string;
};

export default function ProposalsPage() {
  const { canAccess, loading: tierLoading } = useTierAccess();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState({ projectId: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!tierLoading && !canAccess('proposals')) {
    redirect('/?upgrade=contractor');
  }

  const fetchProposals = async () => {
    setLoading(true);
    try {
      // Proposals live under projects — fetch all projects that have proposals
      const allProjects = await ProjectsApi.getAll();
      const allProposals: Proposal[] = [];
      for (const project of (allProjects ?? [])) {
        if (project.proposals?.length) {
          for (const p of project.proposals) {
            allProposals.push({
              id: p.id,
              projectId: project.id,
              projectName: project.name ?? 'Unnamed Project',
              clientName: project.client?.name ?? 'Unknown Client',
              status: p.status ?? 'DRAFT',
              createdAt: p.createdAt,
              content: p.content,
            });
          }
        }
      }
      setProposals(allProposals);
      setProjects(allProjects ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProposals(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || !form.content.trim()) return;
    setIsSubmitting(true);
    try {
      await ProjectsApi.createProposal(form.projectId, form.content);
      setShowCreate(false);
      setForm({ projectId: '', content: '' });
      fetchProposals();
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  // ── KPIs ──────────────────────────────────────────────────────────────
  const total = proposals.length;
  const sent = proposals.filter(p => p.status === 'SENT' || p.status === 'VIEWED').length;
  const accepted = proposals.filter(p => p.status === 'ACCEPTED').length;
  const winRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

  // ── Filtered ──────────────────────────────────────────────────────────
  const filtered = proposals.filter(p => {
    const q = search.toLowerCase();
    return !q || p.projectName.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q);
  });

  const columns: ColumnDef<Proposal>[] = [
    {
      key: 'projectName', header: 'Project',
      render: p => (
        <div>
          <div className="font-semibold text-sm text-gray-900">{p.projectName}</div>
          <div className="text-xs text-gray-400">{p.clientName}</div>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', headerClassName: 'text-center',
      render: p => <div className="flex justify-center"><StatusPill status={p.status} /></div>,
    },
    {
      key: 'createdAt', header: 'Created',
      render: p => (
        <span className="text-sm text-gray-500">
          {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions', header: '',
      render: p => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/projects/${p.projectId}?tab=proposal`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Eye size={12} /> View Proposal
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Proposals"
        description="Create and track proposals sent to clients for project approval."
        action={{ label: 'New Proposal', onClick: () => setShowCreate(true), icon: <Plus size={15} /> }}
      />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Proposals" value={total} icon={<FileText size={18} />} />
          <StatCard title="Sent / In Review" value={sent} icon={<Eye size={18} />} />
          <StatCard
            title="Win Rate"
            value={`${winRate}%`}
            icon={<FileText size={18} />}
            delta={accepted > 0 ? { value: `${accepted} accepted`, positive: true } : undefined}
          />
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search proposals..." className="pl-9" />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No proposals yet"
          emptyDescription="Create a proposal for a project to start winning new work."
          emptyAction={{ label: 'Create Proposal', onClick: () => setShowCreate(true) }}
        />
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">New Proposal</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Project</label>
                <select required value={form.projectId}
                  onChange={e => setForm({ ...form, projectId: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FFBA00]"
                >
                  <option value="">Select a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.client?.name ?? 'No client'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Proposal Content</label>
                <textarea required rows={8} value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Describe the scope of work, deliverables, timeline, and pricing..."
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FFBA00] resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Create Proposal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
