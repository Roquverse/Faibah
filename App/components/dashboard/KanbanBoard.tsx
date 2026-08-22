import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MessageSquare, Paperclip, MoreHorizontal, Calendar, ArrowUpRight } from 'lucide-react';
import { TasksApi } from '@/lib/api';
import { io } from 'socket.io-client';

interface KanbanBoardProps {
  projectId: string;
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // New task state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'TODO', dueDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!projectId || projectId === 'all') return;

    // Initial fetch
    TasksApi.getTasks(projectId).then(setTasks).catch(console.error);

    // Socket setup
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005');
    
    socket.on('connect', () => {
      socket.emit('joinProject', projectId);
    });

    socket.on('task_created', (newTask) => {
      setTasks((prev: any[]) => [newTask, ...prev]);
    });

    socket.on('task_status_changed', (updatedTask) => {
      setTasks((prev: any[]) => prev.map((t: any) => t.id === updatedTask.id ? updatedTask : t));
      setSelectedTask((prev: any | null) => prev?.id === updatedTask.id ? updatedTask : prev);
    });

    socket.on('new_message', (msg) => {
      // Re-fetch tasks if we get a new message so counts are correct
      // This is a naive approach, we could just update the specific task's msg count
      if (msg.taskId) {
        TasksApi.getTasks(projectId).then(setTasks).catch(console.error);
      }
    });

    return () => {
      socket.emit('leaveProject', projectId);
      socket.disconnect();
    };
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setIsSubmitting(true);
    try {
      const taskData = {
        ...newTask,
        projectId,
      };
      await TasksApi.createTask(taskData);
      setShowAddTaskModal(false);
      setNewTask({ title: '', description: '', status: 'TODO', dueDate: '' });
    } catch (error) {
      console.error('Failed to create task', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { id: 'TODO', label: 'To-do', count: tasks.filter(t => t.status === 'TODO').length },
    { id: 'IN_PROGRESS', label: 'In progress', count: tasks.filter(t => t.status === 'IN_PROGRESS').length },
    { id: 'IN_REVISION', label: 'In Revision', count: tasks.filter(t => t.status === 'IN_REVISION').length },
    { id: 'DONE', label: 'Done', count: tasks.filter(t => t.status === 'DONE').length },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F9F9FA] relative">
      
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
          <button onClick={() => setShowAddTaskModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#346E3A] text-white rounded-lg text-sm font-bold hover:bg-[#2b592f] shadow-sm shadow-[#346E3A]/20">
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
                  <div 
                    key={task.id} 
                    onClick={() => setSelectedTask(task)}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer active:cursor-grabbing"
                  >
                    
                    {/* Tags */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        {(task.labels || []).map((tag: string, idx: number) => (
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
                    <h4 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-[#346E3A] transition-colors">{task.title}</h4>
                    
                    {/* Date */}
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mb-4">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                        <span>Progress</span>
                        <span>{task.progressPercent || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#A5D149] rounded-full" 
                          style={{ width: `${task.progressPercent || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer (Comments, Attachements, Avatars) */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
                        <div className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" /> {task._count?.messages || 0}
                        </div>
                        <div className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                          <Paperclip className="w-3.5 h-3.5" /> 0
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        {task.assignees?.slice(0, 3).map((assignee: any) => (
                           <img key={assignee.id} src={assignee.projectMember?.user?.avatarUrl || `https://ui-avatars.com/api/?name=${assignee.projectMember?.user?.firstName || assignee.projectMember?.clientContact?.name || 'U'}&background=random`} className="w-6 h-6 rounded-full border-2 border-white relative z-20" />
                        ))}
                        {(task.assignees?.length || 0) > 3 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-600 flex items-center justify-center relative z-0">
                            +{(task.assignees?.length || 0) - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    
                  </div>
                ))}

                {/* Add Task Button at bottom of column */}
                <button 
                  onClick={() => {
                    setNewTask(prev => ({ ...prev, status: col.id }));
                    setShowAddTaskModal(true);
                  }}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-900 hover:border-gray-300 hover:bg-white transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>

            </div>
          ))}

        </div>
      </div>

      {/* Task Detail Modal / Slide-over */}
      {selectedTask && (
        <div className="absolute inset-y-0 right-0 w-[400px] bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col animate-in slide-in-from-right duration-300">
          
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Task Details</h2>
            <button 
              onClick={() => setSelectedTask(null)}
              className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                {(selectedTask.labels || []).map((tag: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-[#A5D149]/20 text-[#346E3A] text-xs font-bold rounded uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedTask.title}</h3>
              <div className="flex items-center gap-4 text-sm font-semibold text-gray-500">
                {selectedTask.dueDate && (
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> Due {new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                )}
                <span className="flex items-center gap-1.5 border border-gray-200 px-2 py-1 rounded-md bg-gray-50 uppercase text-[10px] tracking-wider text-gray-600">{selectedTask.status.replace('_', ' ')}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {selectedTask.description || "No description provided."}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Progress</h4>
                <span className="text-xs font-bold text-gray-500">{selectedTask.progressPercent || 0}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#346E3A] rounded-full" 
                  style={{ width: `${selectedTask.progressPercent || 0}%` }}
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Assignees</h4>
              <div className="flex items-center gap-3">
                {selectedTask.assignees?.map((assignee: any) => (
                  <div key={assignee.id} className="flex items-center gap-2">
                    <img src={assignee.projectMember?.user?.avatarUrl || `https://ui-avatars.com/api/?name=${assignee.projectMember?.user?.firstName || assignee.projectMember?.clientContact?.name || 'U'}&background=random`} className="w-8 h-8 rounded-full border border-gray-200" />
                    <span className="text-sm font-semibold text-gray-700">{assignee.projectMember?.user?.firstName || assignee.projectMember?.clientContact?.name || 'Unknown'}</span>
                  </div>
                ))}
                <button className="w-8 h-8 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-400 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            <button className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors">
              Edit Task
            </button>
            <button className="flex-1 py-2.5 bg-[#346E3A] text-white font-bold text-sm rounded-xl hover:bg-[#2b592f] shadow-sm transition-colors">
              Mark Complete
            </button>
          </div>

        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Create New Task</h3>
            <p className="text-sm text-gray-500 mb-6">Fill in the details for the new task.</p>
            
            <form onSubmit={handleCreateTask} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="Task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#A5D149] focus:ring-1 focus:ring-[#A5D149] placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea 
                  placeholder="Task description..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#A5D149] focus:ring-1 focus:ring-[#A5D149] placeholder:text-gray-400 min-h-[80px]"
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select 
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#A5D149]"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVISION">In Revision</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                  <input 
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#A5D149]"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddTaskModal(false)} 
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !newTask.title.trim()}
                  className="px-4 py-2 text-sm font-semibold bg-[#346E3A] text-white rounded-lg hover:bg-[#2b592f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
