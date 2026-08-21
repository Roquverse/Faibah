'use client';

import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Calendar, ArrowRight, CheckCircle2, Circle, Clock, LayoutGrid, List as ListIcon, Search, FileText, MessageSquare, Paperclip } from 'lucide-react';
import Link from 'next/link';

type ProjectStatus = 'DRAFT' | 'ONGOING' | 'AWAITING_PAYMENT' | 'COMPLETED' | 'CANCELLED';

interface ProjectTag {
  label: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}

interface Project {
  id: string;
  title: string;
  client: { name: string; avatar: string };
  status: ProjectStatus;
  invoiceStatus?: 'Draft' | 'Sent' | 'Paid';
  tags?: ProjectTag[];
  dueDate?: string;
  commentsCount?: number;
  attachmentsCount?: number;
}

const mockProjects: Project[] = [
  { id: '1', title: 'Website Redesign', client: { name: 'Acme Corp', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop' }, status: 'ONGOING', invoiceStatus: 'Draft', tags: [{ label: 'Internal', bgColor: 'bg-green-50', textColor: 'text-green-700', dotColor: 'text-green-500' }, { label: 'Urgent', bgColor: 'bg-red-50', textColor: 'text-red-700', dotColor: 'text-red-500' }], dueDate: '11 Jan 2025', commentsCount: 4, attachmentsCount: 1 },
  { id: '2', title: 'Brand Identity', client: { name: 'Globex', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop' }, status: 'DRAFT', tags: [{ label: 'Lead', bgColor: 'bg-orange-50', textColor: 'text-orange-700', dotColor: 'text-orange-500' }], dueDate: '15 Feb 2025', commentsCount: 0, attachmentsCount: 2 },
  { id: '3', title: 'Mobile App MVP', client: { name: 'Soylent', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop' }, status: 'AWAITING_PAYMENT', invoiceStatus: 'Sent', tags: [{ label: 'Internal', bgColor: 'bg-green-50', textColor: 'text-green-700', dotColor: 'text-green-500' }], dueDate: '20 Mar 2025', commentsCount: 1, attachmentsCount: 0 },
  { id: '4', title: 'SEO Audit', client: { name: 'Initech', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' }, status: 'COMPLETED', invoiceStatus: 'Paid', tags: [{ label: 'Internal', bgColor: 'bg-green-50', textColor: 'text-green-700', dotColor: 'text-green-500' }, { label: 'Lead', bgColor: 'bg-orange-50', textColor: 'text-orange-700', dotColor: 'text-orange-500' }], dueDate: '11 Jan 2025', commentsCount: 2, attachmentsCount: 1 },
  { id: '5', title: 'Social Media Strategy', client: { name: 'Umbrella', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop' }, status: 'ONGOING', tags: [{ label: 'Urgent', bgColor: 'bg-red-50', textColor: 'text-red-700', dotColor: 'text-red-500' }], dueDate: '05 Apr 2025', commentsCount: 8, attachmentsCount: 3 },
];

const COLUMNS: { id: ProjectStatus; label: string; dotColor: string }[] = [
  { id: 'DRAFT', label: 'Draft', dotColor: 'text-gray-400' },
  { id: 'ONGOING', label: 'Ongoing', dotColor: 'text-[#FBDF4B]' },
  { id: 'AWAITING_PAYMENT', label: 'Awaiting Payment', dotColor: 'text-orange-400' },
  { id: 'COMPLETED', label: 'Completed', dotColor: 'text-[#346E3A]' },
  { id: 'CANCELLED', label: 'Cancelled', dotColor: 'text-gray-900' },
];

export default function ProjectsPage() {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { ProjectsApi } = await import('@/lib/api');
      const data = await ProjectsApi.getAll();
      // Map backend fields to frontend interface
      const mapped = data.map((p: any) => ({
        id: p.id,
        title: p.name,
        client: {
          name: p.client?.name || 'Unknown Client',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.client?.name || 'Unknown')}&background=random`
        },
        status: p.status,
        invoiceStatus: p.invoices?.length > 0 ? p.invoices[0].status : undefined,
        tags: [{ label: 'Internal', bgColor: 'bg-green-50', textColor: 'text-green-700', dotColor: 'text-green-500' }],
        dueDate: '11 Jan 2025',
        commentsCount: Math.floor(Math.random() * 5),
        attachmentsCount: Math.floor(Math.random() * 3),
      }));
      // If db is empty, show mock projects for demo purposes until db has data
      setProjects(mapped.length > 0 ? mapped : mockProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      // Fallback to mock on failure
      setProjects(mockProjects);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Optimistic UI update
    setProjects(prev => prev.map(p => {
      if (p.id === draggedItem) {
        return { ...p, status };
      }
      return p;
    }));
    
    // Server update
    try {
      const { ProjectsApi } = await import('@/lib/api');
      // If it's a mock project (ID like '1', '2'), we don't call backend to avoid 404
      if (draggedItem.length > 10) {
        await ProjectsApi.updateStatus(draggedItem, status);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      // Optional: Revert optimistic update here if needed
    }

    setDraggedItem(null);
  };

  const renderInvoiceBadge = (status?: string) => {
    if (!status) return null;
    
    // Minimalist invoice styling
    return (
      <div className="text-[10px] font-medium px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-600 flex items-center gap-1.5 uppercase tracking-wider">
        <FileText className="w-3 h-3 text-gray-400" />
        {status}
      </div>
    );
  };

  return (
    <div className="p-8 w-full h-[calc(100vh-80px)] flex flex-col font-sans">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your ongoing work and client deliverables.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="pl-9 pr-4 py-2.5 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all border-none w-64"
            />
          </div>

          <div className="flex items-center bg-gray-50 border border-gray-200 p-1 rounded-xl">
            <button 
              onClick={() => setView('board')}
              className={`p-1.5 rounded-lg transition-colors ${view === 'board' ? 'bg-white text-gray-900 border border-gray-200' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-white text-gray-900 border border-gray-200' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <Link href="/projects/new" className="flex items-center gap-2 bg-[#FBDF4B] text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F3D740] transition-colors shrink-0">
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* Board View */}
      {view === 'board' && (
        <div className="flex gap-6 overflow-x-auto overflow-y-hidden flex-1 min-h-0 pb-4">
          {COLUMNS.map(col => (
            <div 
              key={col.id} 
              className="shrink-0 w-[320px] flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header (Editorial Style) */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Circle className={`w-2 h-2 fill-current ${col.dotColor}`} />
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{col.label}</h3>
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 rounded-sm ml-1">
                    {projects.filter(p => p.status === col.id).length}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-900 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {projects.filter(p => p.status === col.id).map(project => (
                  <Link href={`/projects/${project.id}`} key={project.id}>
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, project.id)}
                      className="bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all cursor-grab active:cursor-grabbing group mb-4 block"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-bold text-gray-900 text-[13px] group-hover:text-indigo-600 transition-colors leading-snug">
                          {project.title}
                        </h4>
                        <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-3 truncate">{project.client.name} deliverables and planning</p>
                      
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags.map((tag, idx) => (
                            <span key={idx} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold ${tag.bgColor} ${tag.textColor}`}>
                              <Circle className={`w-1.5 h-1.5 fill-current ${tag.dotColor}`} />
                              {tag.label}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due Date {project.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ListIcon className="w-3.5 h-3.5" />
                          <span>2/2</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex -space-x-1.5">
                          <img src={project.client.avatar} alt="Avatar" className="w-6 h-6 rounded-full border-2 border-white object-cover bg-gray-100" />
                          <img src={`https://ui-avatars.com/api/?name=${project.id}&background=random`} alt="Avatar" className="w-6 h-6 rounded-full border-2 border-white object-cover bg-gray-100" />
                        </div>
                        
                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
                          {project.attachmentsCount !== undefined && project.attachmentsCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Paperclip className="w-3.5 h-3.5" />
                              <span>{project.attachmentsCount}</span>
                            </div>
                          )}
                          {project.commentsCount !== undefined && project.commentsCount > 0 && (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{project.commentsCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {/* Empty State Dropzone */}
                {projects.filter(p => p.status === col.id).length === 0 && (
                  <div className="border-2 border-dashed border-gray-100 rounded-2xl h-24 flex items-center justify-center text-xs text-gray-400 font-medium">
                    Drop projects here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Project Name</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map(project => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/projects/${project.id}`} className="font-bold text-gray-900 group-hover:text-[#346E3A] transition-colors">
                      {project.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={project.client.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
                    <span className="font-semibold text-gray-600 text-xs tracking-wide uppercase">{project.client.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Circle className={`w-2 h-2 fill-current ${COLUMNS.find(c => c.id === project.status)?.dotColor}`} />
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        {COLUMNS.find(c => c.id === project.status)?.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {renderInvoiceBadge(project.invoiceStatus) || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-900">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
