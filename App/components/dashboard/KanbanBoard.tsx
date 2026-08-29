import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MessageSquare, Paperclip, MoreHorizontal, Calendar, ArrowUpRight, FolderGit2, UserCheck, AlertCircle, ShieldAlert, AlertTriangle, ArrowDown } from 'lucide-react';
import { TasksApi, ProjectsApi, UsersApi } from '@/lib/api';
import { io } from 'socket.io-client';

import { useProjectDrawer } from '@/context/ProjectDrawerContext';

interface KanbanBoardProps {
  projectId: string;
}

export default function KanbanBoard({ projectId: initialProjectId }: KanbanBoardProps) {
  const { openProjectDrawer } = useProjectDrawer();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [myTasksOnly, setMyTasksOnly] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New task state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    status: 'TODO', 
    priority: 'MEDIUM',
    dueDate: '',
    projectId: initialProjectId === 'all' ? '' : initialProjectId,
    collaboratorEmails: '',
    clientContactIds: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  // Load current user profile for "My Tasks" filter
  useEffect(() => {
    UsersApi.getProfile()
      .then(setCurrentUser)
      .catch(console.error);

    ProjectsApi.getAll()
      .then(setProjects)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedTask?.projectId) {
      ProjectsApi.getMembers(selectedTask.projectId)
        .then(setProjectMembers)
        .catch(console.error);
    }
  }, [selectedTask?.projectId]);

  // Fetch tasks and listen to sockets
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const assignedTo = myTasksOnly && currentUser?.id ? currentUser.id : undefined;
        const fetchedTasks = await TasksApi.getTasks(selectedProjectId, assignedTo);
        setTasks(fetchedTasks || []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    fetchTasks();

    // Socket setup
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005');
    
    socket.on('connect', () => {
      if (selectedProjectId === 'all') {
        projects.forEach(p => socket.emit('joinProject', p.id));
      } else {
        socket.emit('joinProject', selectedProjectId);
      }
    });

    socket.on('task_created', (createdTask) => {
      setTasks((prev: any[]) => [createdTask, ...prev]);
    });

    socket.on('task_status_changed', (updatedTask) => {
      setTasks((prev: any[]) => prev.map((t: any) => t.id === updatedTask.id ? updatedTask : t));
      setSelectedTask((prev: any | null) => prev?.id === updatedTask.id ? updatedTask : prev);
    });

    socket.on('new_message', (msg) => {
      if (msg.taskId) {
        fetchTasks();
      }
    });

    return () => {
      if (selectedProjectId === 'all') {
        projects.forEach(p => socket.emit('leaveProject', p.id));
      } else {
        socket.emit('leaveProject', selectedProjectId);
      }
      socket.disconnect();
    };
  }, [selectedProjectId, myTasksOnly, currentUser?.id, projects]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    if (!newTask.projectId) {
      alert("Please select a project");
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        projectId: newTask.projectId,
        collaboratorEmails: newTask.collaboratorEmails.split(',').map(e => e.trim()).filter(Boolean),
        clientContactIds: newTask.clientContactIds,
      };
      await TasksApi.createTask(taskData);
      
      const assignedTo = myTasksOnly && currentUser?.id ? currentUser.id : undefined;
      const refetched = await TasksApi.getTasks(selectedProjectId, assignedTo);
      setTasks(refetched || []);

      setShowAddTaskModal(false);
      setNewTask({ 
        title: '', 
        description: '', 
        status: 'TODO', 
        priority: 'MEDIUM',
        dueDate: '',
        projectId: selectedProjectId === 'all' ? '' : selectedProjectId,
        collaboratorEmails: '',
        clientContactIds: []
      });
    } catch (error) {
      console.error('Failed to create task', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignUser = async (memberId: string) => {
    if (!selectedTask) return;
    try {
      const updatedTask = await TasksApi.assignUser(selectedTask.id, memberId);
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      setSelectedTask(updatedTask);
      setShowAssigneeDropdown(false);
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { id: 'TODO', label: 'To-do' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'IN_REVISION', label: 'In Revision' },
    { id: 'DONE', label: 'Done' },
  ];

  const filteredTasks = tasks.filter(t => {
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.project?.name?.toLowerCase().includes(q)
    );
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold rounded flex items-center gap-1 uppercase tracking-wider">
            <ShieldAlert className="w-3 h-3 text-rose-600" /> Urgent
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold rounded flex items-center gap-1 uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold rounded uppercase tracking-wider">
            Medium
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-semibold rounded uppercase tracking-wider">
            Low
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white relative">
      
      {/* Board Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-gray-100 bg-white gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-0.5 shrink-0">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Kanban
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              List
            </button>
          </div>

          {/* Project Filter Dropdown (Jira style roll-up filter) */}
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-gray-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#0C3B2E]"
            >
              <option value="all">All Projects (Roll-up View)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* "My Tasks" Toggle */}
          <button
            onClick={() => setMyTasksOnly(!myTasksOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              myTasksOnly
                ? 'bg-[#0C3B2E]/10 text-[#0C3B2E] border-[#0C3B2E]/30'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            My Tasks Only
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none w-full md:w-56"
            />
          </div>

          <button 
            onClick={() => {
              setNewTask(prev => ({ 
                ...prev, 
                projectId: selectedProjectId === 'all' ? (projects[0]?.id || '') : selectedProjectId 
              }));
              setShowAddTaskModal(true);
            }} 
            className="flex items-center justify-center gap-2 bg-[#FFBA00] text-gray-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#E6A700] transition-colors border border-transparent shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Main Board View */}
      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-gray-50/50">
          <div className="flex gap-6 h-full items-start">
            
            {columns.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.id);
              return (
                <div key={col.id} className="w-80 shrink-0 flex flex-col max-h-full">
                  
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 bg-white px-4 py-3 rounded-xl border border-gray-200/80 shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        col.id === 'TODO' ? 'bg-slate-400' :
                        col.id === 'IN_PROGRESS' ? 'bg-blue-500' :
                        col.id === 'IN_REVISION' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <h3 className="font-bold text-gray-900 text-sm">{col.label}</h3>
                    </div>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-10">
                    {colTasks.map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)}
                        className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs hover:shadow-md hover:border-[#0C3B2E]/40 transition-all group cursor-pointer"
                      >
                        
                        {/* Project Tag Badge (Global roll-up view indicator) */}
                        {selectedProjectId === 'all' && (task.project?.name || projects.find(p => p.id === task.projectId)?.name) && (
                          <div className="mb-2">
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                openProjectDrawer(task.projectId);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0C3B2E]/10 text-[#0C3B2E] hover:bg-[#0C3B2E]/20 text-[10px] font-bold rounded-full cursor-pointer transition-colors"
                            >
                              <FolderGit2 className="w-3 h-3" />
                              {task.project?.name || projects.find(p => p.id === task.projectId)?.name}
                            </span>
                          </div>
                        )}

                        {/* Tags & Priority */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {getPriorityBadge(task.priority)}
                            {(task.labels || []).map((tag: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-[#0C3B2E] transition-colors line-clamp-2">
                          {task.title}
                        </h4>
                        
                        {/* Due Date */}
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mb-3">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{task.progressPercent || 0}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#6D9773] rounded-full" 
                              style={{ width: `${task.progressPercent || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Assignee Avatars */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-[10px] text-gray-400 font-semibold uppercase">Assignees</span>
                          <div className="flex -space-x-2">
                            {task.assignees?.slice(0, 3).map((assignee: any) => (
                              <img 
                                key={assignee.id} 
                                src={assignee.projectMember?.user?.avatarUrl || `https://ui-avatars.com/api/?name=${assignee.projectMember?.user?.firstName || assignee.projectMember?.clientContact?.name || 'U'}&background=random`} 
                                title={assignee.projectMember?.user?.firstName || assignee.projectMember?.clientContact?.name}
                                className="w-6 h-6 rounded-full border-2 border-white relative z-10" 
                              />
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

                    <button 
                      onClick={() => {
                        setNewTask(prev => ({ 
                          ...prev, 
                          status: col.id,
                          projectId: selectedProjectId === 'all' ? (projects[0]?.id || '') : selectedProjectId
                        }));
                        setShowAddTaskModal(true);
                      }}
                      className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 hover:border-gray-300 hover:bg-white transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Task
                    </button>
                  </div>

                </div>
              );
            })}

          </div>
        </div>
      ) : (
        /* List View */
        <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold text-gray-700">Task</th>
                  {selectedProjectId === 'all' && <th className="px-6 py-3 font-bold text-gray-700">Project</th>}
                  <th className="px-6 py-3 font-bold text-gray-700">Priority</th>
                  <th className="px-6 py-3 font-bold text-gray-700">Status</th>
                  <th className="px-6 py-3 font-bold text-gray-700">Due Date</th>
                  <th className="px-6 py-3 font-bold text-gray-700">Assignees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50/80 cursor-pointer transition-colors" onClick={() => setSelectedTask(task)}>
                    <td className="px-6 py-4 font-bold text-gray-900">{task.title}</td>
                    {selectedProjectId === 'all' && (
                      <td className="px-6 py-4 font-semibold text-[#0C3B2E]">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openProjectDrawer(task.projectId);
                          }}
                          className="font-bold text-[#0C3B2E] hover:underline cursor-pointer text-left"
                        >
                          {task.project?.name || projects.find(p => p.id === task.projectId)?.name || '-'}
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-4">{getPriorityBadge(task.priority)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-bold text-[10px] uppercase rounded-full">
                        {columns.find(c => c.id === task.status)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-semibold">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {task.assignees?.map((assignee: any) => (
                          <img key={assignee.id} src={assignee.projectMember?.user?.avatarUrl || `https://ui-avatars.com/api/?name=${assignee.projectMember?.user?.firstName || assignee.projectMember?.clientContact?.name || 'U'}&background=random`} className="w-6 h-6 rounded-full border-2 border-white" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-medium">No tasks found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="absolute inset-y-0 right-0 w-[420px] bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col animate-in slide-in-from-right duration-300">
          
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Task Details</span>
              {selectedTask.project?.name && (
                <div className="text-xs font-bold text-[#0C3B2E]">{selectedTask.project.name}</div>
              )}
            </div>
            <button 
              onClick={() => setSelectedTask(null)}
              className="p-1.5 text-gray-400 hover:text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {getPriorityBadge(selectedTask.priority)}
                {(selectedTask.labels || []).map((tag: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedTask.title}</h3>
              
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs font-semibold text-gray-500">Status:</span>
                <select
                  value={selectedTask.status}
                  onChange={async (e) => {
                    const updated = await TasksApi.updateStatus(selectedTask.id, e.target.value);
                    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
                    setSelectedTask(updated);
                  }}
                  className="text-xs font-bold bg-gray-100 border border-gray-200 rounded px-2 py-1"
                >
                  <option value="TODO">To-do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVISION">In Revision</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                {selectedTask.description || "No description provided."}
              </p>
            </div>

            {/* Assignees with Role Badges */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Assigned Members</h4>
              </div>
              <div className="space-y-2">
                {selectedTask.assignees?.map((assignee: any) => {
                  const isTeam = assignee.projectMember?.memberType === 'TEAM_USER';
                  const name = assignee.projectMember?.user?.firstName || assignee.projectMember?.clientContact?.name || 'Member';
                  const role = assignee.projectMember?.role || (isTeam ? 'Team' : 'Client');
                  return (
                    <div key={assignee.id} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <img src={assignee.projectMember?.user?.avatarUrl || `https://ui-avatars.com/api/?name=${name}&background=random`} className="w-7 h-7 rounded-full" />
                        <span className="text-xs font-bold text-gray-900">{name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isTeam ? 'bg-[#0C3B2E]/10 text-[#0C3B2E]' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {role}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Assign User Dropdown */}
              <div className="mt-3 relative">
                <button
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                  className="text-xs font-bold text-[#0C3B2E] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Assign Project Member
                </button>

                {showAssigneeDropdown && (
                  <div className="absolute left-0 bottom-full mb-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase px-2 py-1">Project Members</div>
                    {projectMembers.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleAssignUser(m.id)}
                        className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-100 rounded font-semibold text-gray-700 flex justify-between"
                      >
                        <span>{m.user?.firstName || m.clientContact?.name || 'Member'}</span>
                        <span className="text-[10px] text-gray-400 uppercase">{m.role}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Create Project Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Project (Required)</label>
                <select
                  required
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0C3B2E]"
                >
                  <option value="">Select Project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="Task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0C3B2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0C3B2E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0C3B2E]"
                  >
                    <option value="TODO">To-do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVISION">In Revision</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0C3B2E]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0C3B2E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#FFBA00] text-gray-900 font-bold rounded-lg text-xs hover:bg-[#E6A700] transition-colors"
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
