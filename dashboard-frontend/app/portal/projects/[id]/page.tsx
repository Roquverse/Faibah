'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ProjectChannel from '@/components/dashboard/ProjectChannel';

export default function ClientProjectDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'quotation' | 'invoice' | 'channel' | 'files'>('channel');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/portal/projects" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Website Redesign Project</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-gray-500">with Neuvant Studios</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-wider">
              ONGOING
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl p-1 flex gap-1 overflow-x-auto hide-scrollbar shadow-sm">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('quotation')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'quotation' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          Quotation
        </button>
        <button 
          onClick={() => setActiveTab('invoice')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'invoice' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          Invoice
        </button>
        <button 
          onClick={() => setActiveTab('channel')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'channel' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          Channel
          <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md text-[10px]">2</span>
        </button>
        <button 
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'files' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          Files
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'channel' && (
          <ProjectChannel projectId={params.id} isClientView={true} />
        )}
        
        {activeTab !== 'channel' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize">{activeTab} View</h3>
            <p className="text-sm text-gray-500">This section is view-only for clients (with Accept/Pay actions).</p>
          </div>
        )}
      </div>
    </div>
  );
}
