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

type Tab = 'overview' | 'proposal' | 'invoice' | 'channel' | 'files' | 'tasks' | 'schedule';

export default function ProjectDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams?.get('tab') as Tab) || 'overview');
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projectStatus, setProjectStatus] = useState('ONGOING');

  // Proposal state
  interface ProposalItem {
    id: string;
    description: string;
    amount: number;
  }
  
  interface ProposalData {
    title: string;
    description: string;
    items: ProposalItem[];
  }
  
  const defaultProposalData: ProposalData = {
    title: 'Untitled Proposal',
    description: '[Proposal Title]\n[Section Sub-heading]\n[Start typing your paragraph here...]',
    items: [
      { id: '1', description: 'Concept Development & Scouting', amount: 500000 }
    ]
  };

  const [proposalData, setProposalData] = useState<ProposalData>(defaultProposalData);
  const [isSavingProposal, setIsSavingProposal] = useState(false);
  
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await ProjectsApi.getOne(params.id as string);
        setProject(data);
        setProjectStatus(data.status || 'ONGOING');
        if (data.proposals && data.proposals.length > 0) {
          try {
            const parsed = JSON.parse(data.proposals[0].content);
            if (parsed && typeof parsed === 'object') {
              setProposalData(parsed);
            }
          } catch(e) {
            setProposalData({
              ...defaultProposalData,
              description: data.proposals[0].content || ''
            });
          }
        }
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

  const handleSaveProposal = async () => {
    if (!project?.proposals?.[0]?.id) {
      // If there is no existing proposal, create one
      try {
        setIsSavingProposal(true);
        const contentString = JSON.stringify(proposalData);
        const newProp = await ProjectsApi.createProposal(project.id, contentString);
        setProject({ ...project, proposals: [newProp, ...(project.proposals || [])] });
        toast.success('Proposal created successfully');
      } catch (e) {
        toast.error('Failed to create proposal');
      } finally {
        setIsSavingProposal(false);
      }
      return;
    }
    
    try {
      setIsSavingProposal(true);
      const contentString = JSON.stringify(proposalData);
      await ProjectsApi.updateProposal(project.id, project.proposals[0].id, contentString);
      toast.success('Proposal updated successfully');
    } catch (e) {
      toast.error('Failed to save proposal');
    } finally {
      setIsSavingProposal(false);
    }
  };

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

  const updateProposalData = (updates: Partial<ProposalData>) => {
    setProposalData(prev => ({ ...prev, ...updates }));
  };

  const addProposalItem = () => {
    setProposalData(prev => ({
      ...prev,
      items: [...prev.items, { id: Math.random().toString(), description: '', amount: 0 }]
    }));
  };

  const updateProposalItem = (id: string, field: keyof ProposalItem, value: any) => {
    setProposalData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeProposalItem = (id: string) => {
    setProposalData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
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

  const renderProposal = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleSaveProposal}
          disabled={isSavingProposal}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white border border-transparent text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-70"
        >
          {isSavingProposal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSavingProposal ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-12 max-w-4xl mx-auto min-h-[800px]">
        {/* Header */}
        <div className="flex justify-between items-start mb-16">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{project.company?.name || 'Avatec Interactives'}</h2>
            <div className="text-sm text-gray-500 space-y-1">
              <div>{project.company?.email || 'helpdesk@avatecinteractives.dev'}</div>
              <div>{project.company?.phone || '08035212521'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Proposal / Estimate</div>
            <div className="text-3xl font-bold text-gray-900 mb-4">#{project.projectRef || 'PRJ-092'}</div>
            <div className="text-sm text-gray-900 font-semibold">{project.client?.name || 'Arakunrin Cole'}</div>
            <div className="text-xs text-gray-500 mt-1">Client Recipient</div>
          </div>
        </div>

        <hr className="border-gray-100 mb-16" />

        {/* Main Content Editor */}
        <div className="mb-16">
          <input
            type="text"
            value={proposalData.title}
            onChange={(e) => updateProposalData({ title: e.target.value })}
            className="w-full text-4xl font-bold text-gray-900 mb-8 border-none p-0 focus:ring-0 placeholder-gray-300 bg-transparent"
            placeholder="Proposal Title"
          />
          <textarea
            value={proposalData.description}
            onChange={(e) => updateProposalData({ description: e.target.value })}
            className="w-full min-h-[200px] text-gray-700 text-base leading-relaxed border-none p-0 focus:ring-0 resize-none bg-transparent"
            placeholder="Start typing your paragraph here..."
          />
        </div>

        {/* Investment Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Investment</h3>
          
          <table className="w-full text-sm text-left mb-4">
            <thead className="border-b-2 border-gray-900">
              <tr>
                <th className="py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Description</th>
                <th className="py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right w-48">Amount</th>
                <th className="py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proposalData.items.map((item) => (
                <tr key={item.id} className="group">
                  <td className="py-4">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateProposalItem(item.id, 'description', e.target.value)}
                      className="w-full border-none p-0 focus:ring-0 bg-transparent font-medium text-gray-900"
                      placeholder="Item description"
                    />
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end font-bold text-gray-900">
                      <span>₦</span>
                      <input
                        type="number"
                        value={item.amount || ''}
                        onChange={(e) => updateProposalItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-24 text-right border-none p-0 focus:ring-0 bg-transparent font-bold ml-1"
                        placeholder="0.00"
                      />
                    </div>
                  </td>
                  <td className="py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => removeProposalItem(item.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button 
            onClick={addProposalItem}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
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
    { id: 'proposal', label: 'Proposal', icon: <FileText className="w-4 h-4" /> },
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
        {activeTab === 'proposal' && renderProposal()}
        {activeTab === 'invoice' && renderInvoice()}
        {activeTab === 'channel' && renderChannel()}
        {activeTab === 'files' && renderFiles()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'schedule' && renderSchedule()}
      </div>

    </div>
  );
}
