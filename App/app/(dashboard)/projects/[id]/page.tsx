'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MoreHorizontal, 
  FileText, 
  Sparkles, 
  Send, 
  Download, 
  Plus,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  FileBox,
  Receipt,
  MessageSquare,
  CheckSquare,
  Calendar,
  Save,
  Loader2,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import ProjectChannel from '@/components/dashboard/ProjectChannel';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import ProjectSchedule from '@/components/dashboard/ProjectSchedule';
import ShareDropdown from '@/components/shared/ShareDropdown';
import { ProjectsApi } from '@/lib/api';
import { toast } from 'sonner';

type Tab = 'overview' | 'invoice' | 'channel' | 'files' | 'tasks' | 'schedule';

export default function ProjectDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams?.get('tab') as Tab) || 'overview');
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projectStatus, setProjectStatus] = useState('ONGOING');


  
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await ProjectsApi.getOne(params.id as string);
        setProject(data);
        setProjectStatus(data.status || 'ONGOING');

      } catch (e) {
        console.error(e);
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);


  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setProjectStatus(newStatus);
    try {
      await ProjectsApi.updateStatus(project.id, newStatus);
      toast.success('Project status updated');
    } catch (err) {
      toast.error('Failed to update project status');
      setProjectStatus(project.status); // revert
    }
  };



  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  if (!project) {
    return <div className="p-8">Project not found</div>;
  }

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Client</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#6D9773]/20 text-[#0C3B2E] flex items-center justify-center text-xs font-bold uppercase">
                {project.client?.name?.[0] || 'C'}
              </div>
              <span className="font-medium text-gray-900">{project.client?.name || 'Unknown Client'}</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <select 
              value={projectStatus} 
              onChange={handleStatusChange}
              className="text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#6D9773]"
            >
              <option value="DRAFT">Draft</option>
              <option value="ONGOING">Ongoing</option>
              <option value="AWAITING_PAYMENT">Awaiting Payment</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Created</div>
            <div className="font-medium text-gray-900">
              {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Project Currency</div>
            <div className="font-medium text-gray-900">{project.currency || 'NGN'}</div>
          </div>
        </div>
      </div>
    </div>
  );



  const renderInvoice = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-12 flex flex-col items-center justify-center text-center">
        <Receipt className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoice Yet</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Convert an accepted quotation to an invoice, or create a new invoice directly for this project.
        </p>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#FFBA00] text-gray-900 border border-transparent text-sm font-semibold rounded-lg hover:bg-[#E6A700] transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>
    </div>
  );

  const renderFiles = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl border border-gray-200 border-dashed p-12 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
        <FileBox className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Click to upload or drag and drop</h3>
        <p className="text-xs text-gray-500 max-w-sm">
          SVG, PNG, JPG, PDF or ZIP (max. 10MB)
        </p>
      </div>
    </div>
  );

  const renderChannel = () => (
    <div className="animate-in fade-in duration-300">
      <ProjectChannel projectId={project.id as string} isClientView={false} />
    </div>
  );

  const renderTasks = () => (
    <div className="animate-in fade-in duration-300 h-[650px] border border-gray-200 rounded-xl overflow-hidden">
      <KanbanBoard projectId={project.id as string} />
    </div>
  );

  const renderSchedule = () => (
    <div className="animate-in fade-in duration-300 h-[650px] border border-gray-200 rounded-xl overflow-hidden">
      <ProjectSchedule projectId={project.id as string} />
    </div>
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'invoice', label: 'Invoice', icon: <Receipt className="w-4 h-4" /> },
    { id: 'channel', label: 'Channel', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'files', label: 'Files', icon: <Download className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="p-8 w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/projects" className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name || 'Untitled Project'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">For {project.client?.name || 'Unknown Client'}</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Created {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="ml-auto">
          <button className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-[#0C3B2E] text-[#0C3B2E]' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'invoice' && renderInvoice()}
        {activeTab === 'channel' && renderChannel()}
        {activeTab === 'files' && renderFiles()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'schedule' && renderSchedule()}
      </div>

    </div>
  );
}
