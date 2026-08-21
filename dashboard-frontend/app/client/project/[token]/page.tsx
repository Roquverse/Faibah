'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Clock, LayoutDashboard, FileText, CheckCircle2 } from 'lucide-react';
import ProjectChannel from '@/components/dashboard/ProjectChannel';

export default function ClientProjectView() {
  const params = useParams();
  
  // Mock data for MVP
  const project = {
    id: 'p-1',
    title: 'Website Redesign',
    agency: 'Faibah Agency',
    status: 'ONGOING',
    dueDate: '2023-11-15'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Client Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1000px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              {project.agency} Client Portal
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              In Progress
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[1000px] w-full mx-auto px-6 py-8">
        
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Project Channel</h2>
            <p className="text-sm text-gray-500 mt-1">Chat directly with the team, review deliverables, and approve changes.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <Clock className="w-4 h-4" />
            Due: {project.dueDate}
          </div>
        </div>

        {/* The Channel Component in Client Mode */}
        <ProjectChannel projectId={project.id} isClientView={true} />
        
      </div>
      
    </div>
  );
}
