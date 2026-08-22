'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Hash, 
  MessageSquare, 
  CheckSquare, 
  Settings, 
  ArrowLeft,
  LayoutDashboard,
  Users,
  FileBox,
  Plus,
  Link as LinkIcon
} from 'lucide-react';
import ProjectChannel from '@/components/dashboard/ProjectChannel';
import KanbanBoard from '@/components/dashboard/KanbanBoard';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [activeView, setActiveView] = useState<'tasks' | 'general' | 'design' | 'frontend'>('tasks');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Mock project data for UI shell
  const project = {
    id: projectId,
    title: 'Conceptzilla Website v3.0',
    client: { name: 'Conceptzilla', avatar: 'C' },
    status: 'ONGOING'
  };

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-white font-sans">
      
      {/* Left Sidebar (Slack-like navigation) */}
      <div className="w-64 shrink-0 border-r border-gray-100 flex flex-col bg-[#F8F9FA]">
        
        {/* Workspace Header */}
        <div className="h-14 flex items-center px-4 border-b border-gray-200 bg-white">
          <button 
            onClick={() => router.push('/projects')}
            className="p-1.5 -ml-1.5 mr-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="font-bold text-gray-900 truncate flex-1">{project.title}</div>
          <button onClick={() => router.push(`/projects/${projectId}`)} className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md hover:bg-gray-100 mr-2 transition-colors">
            Finances
          </button>
          <button className="text-gray-400 hover:text-gray-900">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          
          {/* Main Navigation */}
          <div className="px-3 space-y-0.5">
            <button 
              onClick={() => setActiveView('tasks')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeView === 'tasks' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/60' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CheckSquare className={`w-4 h-4 ${activeView === 'tasks' ? 'text-indigo-600' : 'text-gray-400'}`} />
              Tasks Kanban
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              Direct messages
              <span className="ml-auto bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">1</span>
            </button>
          </div>

          {/* Channels List */}
          <div>
            <div className="px-6 flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Channels</h3>
              <button className="text-gray-400 hover:text-gray-900"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <div className="px-3 space-y-0.5">
              <button 
                onClick={() => setActiveView('general')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'general' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Hash className="w-4 h-4 text-gray-400" />
                general
              </button>
              <button 
                onClick={() => setActiveView('design')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'design' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Hash className="w-4 h-4 text-gray-400" />
                design
              </button>
              <button 
                onClick={() => setActiveView('frontend')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'frontend' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Hash className="w-4 h-4 text-gray-400" />
                frontend
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500"></span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Top bar for context */}
        <div className="h-14 flex items-center px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            {activeView === 'tasks' ? (
              <>
                <CheckSquare className="w-5 h-5 text-gray-400" />
                <h2 className="font-bold text-gray-900">Project Tasks</h2>
              </>
            ) : (
              <>
                <Hash className="w-5 h-5 text-gray-400" />
                <h2 className="font-bold text-gray-900">{activeView}</h2>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex -space-x-2">
              <img src="https://ui-avatars.com/api/?name=Andrew&background=random" className="w-7 h-7 rounded-full border-2 border-white relative z-20" />
              <img src="https://ui-avatars.com/api/?name=Diana&background=random" className="w-7 h-7 rounded-full border-2 border-white relative z-10" />
            </div>
            <button 
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className={`p-1.5 rounded-lg transition-colors border ${isRightPanelOpen ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-white border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-hidden relative">
          {activeView === 'tasks' ? (
            <KanbanBoard projectId={projectId} />
          ) : (
            <ProjectChannel projectId={projectId} channelName={activeView} isClientView={false} />
          )}
        </div>
      </div>

      {/* Right Sidebar (Info Panel) */}
      {isRightPanelOpen && (
        <div className="w-72 shrink-0 border-l border-gray-100 bg-white flex flex-col">
          <div className="flex border-b border-gray-100 p-2">
            <button className="flex-1 py-1.5 text-xs font-bold text-gray-900 bg-gray-100 rounded-md">Info</button>
            <button className="flex-1 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">Pins</button>
            <button className="flex-1 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">Files</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-8">
            
            {/* Main Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Main Info</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Users className="w-4 h-4" /> Client</span>
                  <span className="font-semibold text-gray-900">{project.client.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Settings className="w-4 h-4" /> Status</span>
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full uppercase">Active</span>
                </div>
              </div>
            </div>

            {/* Linked Threads / Resources */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Resources</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm group cursor-pointer">
                  <div className="flex items-center gap-2 text-gray-600 group-hover:text-indigo-600 transition-colors">
                    <FileBox className="w-4 h-4 text-gray-400" />
                    <span>Design Assets</span>
                  </div>
                  <span className="text-xs font-medium text-gray-400">12 Files</span>
                </div>
                <div className="flex items-center justify-between text-sm group cursor-pointer">
                  <div className="flex items-center gap-2 text-gray-600 group-hover:text-indigo-600 transition-colors">
                    <LinkIcon className="w-4 h-4 text-gray-400" />
                    <span>Figma Prototype</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
