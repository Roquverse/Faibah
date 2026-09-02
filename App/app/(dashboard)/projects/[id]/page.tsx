'use client';

import React, { useState } from 'react';
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
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProjectChannel from '@/components/dashboard/ProjectChannel';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import ProjectSchedule from '@/components/dashboard/ProjectSchedule';
import ShareDropdown from '@/components/shared/ShareDropdown';

type Tab = 'overview' | 'proposal' | 'quotation' | 'invoice' | 'channel' | 'files' | 'tasks' | 'schedule';

export default function ProjectDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [projectStatus, setProjectStatus] = useState('ONGOING');

  // Mock data for UI
  const project = {
    id: params.id,
    title: 'Website Redesign',
    client: { name: 'Acme Corp', avatar: 'A', email: 'hello@acmecorp.com' },
    createdAt: '2023-10-24',
    dueDate: '2023-11-15',
    value: '₦450,000'
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Client</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#6D9773]/20 text-[#0C3B2E] flex items-center justify-center text-xs font-bold">
                {project.client.avatar}
              </div>
              <span className="font-medium text-gray-900">{project.client.name}</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <select 
              value={projectStatus} 
              onChange={(e) => setProjectStatus(e.target.value)}
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
            <div className="font-medium text-gray-900">{project.createdAt}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Project Value</div>
            <div className="font-medium text-gray-900">{project.value}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProposal = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div className="font-medium text-gray-900">Project Proposal</div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FFBA00] text-gray-900 border border-transparent text-sm font-semibold rounded-lg hover:bg-[#E6A700] transition-colors shadow-sm">
            <Sparkles className="w-4 h-4" />
            Generate Quotation
          </button>
        </div>
        <div className="p-6">
          <textarea 
            className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6D9773] focus:ring-1 focus:ring-[#6D9773] resize-none"
            placeholder="Type your raw proposal or notes here..."
            defaultValue={`We will redesign the Acme Corp website over 4 weeks.
Phase 1: Discovery & Design (₦150,000)
Phase 2: Development & Testing (₦200,000)
Phase 3: Launch & SEO setup (₦100,000)

Total: ₦450,000`}
          />
        </div>
      </div>
    </div>
  );

  const renderQuotation = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="font-medium text-gray-900">Quotation #Q-001</div>
            <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
              Draft
            </span>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              PDF
            </button>
            <ShareDropdown
              itemType="Proposal"
              itemRef="Q-001"
              publicUrl={typeof window !== 'undefined' ? `${window.location.origin}/portal/projects/${project.id}` : ''}
              client={project.client}
            />
          </div>
        </div>
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium text-right">Qty</th>
                <th className="px-6 py-3 font-medium text-right">Price</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-6 py-4">Phase 1: Discovery & Design</td>
                <td className="px-6 py-4 text-right">1</td>
                <td className="px-6 py-4 text-right">₦150,000</td>
                <td className="px-6 py-4 text-right">₦150,000</td>
              </tr>
              <tr>
                <td className="px-6 py-4">Phase 2: Development</td>
                <td className="px-6 py-4 text-right">1</td>
                <td className="px-6 py-4 text-right">₦200,000</td>
                <td className="px-6 py-4 text-right">₦200,000</td>
              </tr>
              <tr>
                <td className="px-6 py-4">Phase 3: Launch</td>
                <td className="px-6 py-4 text-right">1</td>
                <td className="px-6 py-4 text-right">₦100,000</td>
                <td className="px-6 py-4 text-right">₦100,000</td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-medium text-gray-500">Total</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">₦450,000</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FFBA00] text-gray-900 border border-transparent text-sm font-semibold rounded-lg hover:bg-[#E6A700] transition-colors shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            Convert to Invoice
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
    { id: 'quotation', label: 'Quotation', icon: <FileBox className="w-4 h-4" /> },
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
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">For {project.client.name}</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Due Nov 15</span>
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
        {activeTab === 'quotation' && renderQuotation()}
        {activeTab === 'invoice' && renderInvoice()}
        {activeTab === 'channel' && renderChannel()}
        {activeTab === 'files' && renderFiles()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'schedule' && renderSchedule()}
      </div>

    </div>
  );
}
