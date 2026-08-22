import React, { useState } from 'react';
import { Plus, Search, Filter, MessageSquare, Paperclip, MoreHorizontal, Calendar, ArrowUpRight } from 'lucide-react';

interface KanbanBoardProps {
  projectId: string;
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Prepare Q4 Budget Report', status: 'TODO', tags: ['Report', 'Budget'], dueDate: 'Mar 15, 2025', progress: 0 },
    { id: 2, title: 'SaaS Website Project', status: 'TODO', tags: ['SaaS', 'Urgent'], dueDate: 'April 12, 2025', progress: 0 },
    { id: 3, title: 'Personal Fintech Management', status: 'IN_PROGRESS', tags: ['Fintech', 'Dashboard'], dueDate: 'May 24, 2025', progress: 20 },
    { id: 4, title: 'Email Marketing Dashboard', status: 'IN_PROGRESS', tags: ['Email', 'Marketing'], dueDate: 'June 30, 2025', progress: 40 },
    { id: 5, title: 'Ai Chat bot User interface Des...', status: 'IN_REVISION', tags: ['Ai', 'Urgent'], dueDate: 'March 22, 2025', progress: 80 },
    { id: 6, title: 'Follow-up with New Leads', status: 'IN_REVISION', tags: ['Follow-up', 'Urgent'], dueDate: 'March 22, 2025', progress: 80 },
    { id: 7, title: 'Develop Metrics for KPIs', status: 'DONE', tags: ['Dev', 'Done'], dueDate: 'Feb 22, 2025', progress: 100 },
  ]);

  const columns = [
    { id: 'TODO', label: 'To-do', count: 3 },
    { id: 'IN_PROGRESS', label: 'In progress', count: 3 },
    { id: 'IN_REVISION', label: 'In Revision', count: 3 },
    { id: 'DONE', label: 'Done', count: 3 },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F9F9FA]">
      
      {/* Board Header Toolbar */}
      <div className="h-16 flex items-center justify-between px-6 shrink-0 border-b border-gray-100">
        <div className="flex bg-white border border-gray-200 rounded-lg p-0.5">
          <button className="px-3 py-1.5 text-sm font-bold bg-gray-100 text-gray-900 rounded-md">Kanban</button>
          <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">List</button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Tasks" 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-600/20">
            <Plus className="w-4 h-4" /> Add Tasks
          </button>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-6 h-full items-start">
          
          {columns.map(col => (
            <div key={col.id} className="w-80 shrink-0 flex flex-col max-h-full">
              
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-gray-400" />
                  <h3 className="font-bold text-gray-900">{col.label}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {col.count}
                </div>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-10">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div key={task.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing">
                    
                    {/* Tags */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        {task.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-gray-900 text-sm mb-2">{task.title}</h4>
                    
                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mb-4">
                      <Calendar className="w-3 h-3" />
                      {task.dueDate}
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-400 rounded-full" 
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer (Comments, Attachements, Avatars) */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
                        <div className="flex items-center gap-1 hover:text-gray-900 cursor-pointer transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" /> 7
                        </div>
                        <div className="flex items-center gap-1 hover:text-gray-900 cursor-pointer transition-colors">
                          <Paperclip className="w-3.5 h-3.5" /> 8
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        <img src="https://ui-avatars.com/api/?name=J&background=random" className="w-6 h-6 rounded-full border-2 border-white relative z-20" />
                        <img src="https://ui-avatars.com/api/?name=A&background=random" className="w-6 h-6 rounded-full border-2 border-white relative z-10" />
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-600 flex items-center justify-center relative z-0">
                          4+
                        </div>
                      </div>
                    </div>
                    
                  </div>
                ))}

                {/* Add Task Button at bottom of column */}
                <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-900 hover:border-gray-300 hover:bg-white transition-all">
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
