'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, CheckCircle2, MessageSquare, Plus, ExternalLink, Calendar, 
  Clock, DollarSign, FileText, UserPlus, Send, Edit2, Check, Trash2, 
  Sparkles, Layers, ChevronRight, User, ShieldCheck
} from 'lucide-react';
import { useProjectDrawer } from '@/context/ProjectDrawerContext';
import { ProjectsApi, ChannelsApi, TasksApi, InvoicesApi, ScheduleEventsApi } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 border-gray-200',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200',
  ONGOING: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200',
  REVIEW: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200',
  ON_HOLD: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200',
  CANCELLED: 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500 border-gray-200'
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  ONGOING: 'Ongoing',
  REVIEW: 'In Review',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled'
};

export default function ProjectQuickPanel() {
  const router = useRouter();
  const { activeProjectId, closeProjectDrawer } = useProjectDrawer();

  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  // Status dropdown state
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  // URL creation state
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [urlLabel, setUrlLabel] = useState('');
  const [urlAddress, setUrlAddress] = useState('');
  const [isAddingUrl, setIsAddingUrl] = useState(false);

  // Collaborator invite state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('CONTRACTOR');
  const [isInviting, setIsInviting] = useState(false);

  // Selected collaborator popover
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Quick Task Creation state
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Escape key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeProjectId) {
        closeProjectDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProjectId, closeProjectDrawer]);

  // Load project details whenever activeProjectId changes
  useEffect(() => {
    if (!activeProjectId) {
      setProject(null);
      return;
    }

    const fetchProjectDetails = async () => {
      try {
        setIsLoading(true);
        const [data, allProjects, liveTasks, allInvoices, liveEvents] = await Promise.all([
          ProjectsApi.getOne(activeProjectId).catch(() => null),
          ProjectsApi.getAll().catch(() => []),
          TasksApi.getTasks(activeProjectId).catch(() => []),
          InvoicesApi.getAll().catch(() => []),
          ScheduleEventsApi.getEvents(activeProjectId).catch(() => []),
        ]);

        const target = data || allProjects.find((p: any) => p.id === activeProjectId);

        if (target) {
          const projectInvoices = (allInvoices && allInvoices.length > 0)
            ? allInvoices.filter((inv: any) => inv.projectId === activeProjectId || (target.clientId && inv.clientId === target.clientId))
            : (target.invoices || []);

          const combinedTasks = (liveTasks && liveTasks.length > 0) ? liveTasks : (target.tasks || []);
          const combinedEvents = (liveEvents && liveEvents.length > 0) ? liveEvents : (target.scheduleEvents || []);

          const merged = {
            ...target,
            name: target.name || target.title || 'Untitled Project',
            tasks: combinedTasks,
            invoices: projectInvoices,
            scheduleEvents: combinedEvents,
          };

          setProject(merged);
          setTitleInput(merged.name);
        }
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [activeProjectId]);

  if (!activeProjectId) return null;

  const handleSaveTitle = async () => {
    if (!titleInput.trim() || !project) return;
    try {
      setProject((prev: any) => ({ ...prev, name: titleInput }));
      setIsEditingTitle(false);
      await ProjectsApi.updateName(project.id, titleInput).catch(() => null);
    } catch (err) {
      console.error('Failed to update project name:', err);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!project) return;
    setIsStatusMenuOpen(false);
    setProject((prev: any) => ({ ...prev, status: newStatus }));
    try {
      await ProjectsApi.updateStatus(project.id, newStatus).catch(() => null);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleOpenOrCreateChannel = async () => {
    if (!project) return;
    try {
      const channels = project.channels || [];
      if (channels.length > 0) {
        closeProjectDrawer();
        router.push(`/channels?project=${project.id}&channelId=${channels[0].id}`);
      } else {
        // Create a channel for this project
        const newChan = await ChannelsApi.create({
          channelName: `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-general`,
          projectId: project.id
        }).catch(() => null);
        
        closeProjectDrawer();
        if (newChan) {
          router.push(`/channels?project=${project.id}&channelId=${newChan.id}`);
        } else {
          router.push(`/channels?project=${project.id}`);
        }
      }
    } catch (err) {
      console.error('Error opening channel:', err);
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlLabel.trim() || !urlAddress.trim() || !project) return;
    setIsAddingUrl(true);
    try {
      let finalUrl = urlAddress.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
      }
      
      const newUrl = await ProjectsApi.addUrl(project.id, urlLabel.trim(), finalUrl).catch(() => ({
        id: Date.now().toString(),
        label: urlLabel.trim(),
        url: finalUrl,
        createdAt: new Date().toISOString()
      }));

      setProject((prev: any) => ({
        ...prev,
        urls: [...(prev.urls || []), newUrl]
      }));

      setUrlLabel('');
      setUrlAddress('');
      setShowAddUrl(false);
    } catch (err) {
      console.error('Failed to add project URL:', err);
    } finally {
      setIsAddingUrl(false);
    }
  };

  const handleDeleteUrl = async (urlId: string) => {
    if (!project) return;
    setProject((prev: any) => ({
      ...prev,
      urls: (prev.urls || []).filter((u: any) => u.id !== urlId)
    }));
    try {
      await ProjectsApi.deleteUrl(urlId).catch(() => null);
    } catch (err) {
      console.error('Failed to delete URL:', err);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !project) return;
    setIsInviting(true);
    try {
      const res = await ProjectsApi.inviteMember(project.id, inviteEmail.trim(), inviteRole).catch(() => null);
      if (res) {
        setProject((prev: any) => ({
          ...prev,
          members: [...(prev.members || []), res]
        }));
      }
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (err) {
      console.error('Failed to invite member:', err);
    } finally {
      setIsInviting(false);
    }
  };

  const handleQuickCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !project) return;
    setIsCreatingTask(true);
    try {
      const newTask = await TasksApi.createTask({
        title: taskTitle.trim(),
        projectId: project.id,
        status: 'TODO'
      }).catch(() => ({
        id: Date.now().toString(),
        title: taskTitle.trim(),
        status: 'TODO',
        createdAt: new Date().toISOString()
      }));

      setProject((prev: any) => ({
        ...prev,
        tasks: [...(prev.tasks || []), newTask]
      }));

      setTaskTitle('');
      setShowAddTask(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Compute stats
  const tasks = project?.tasks || [];
  const completedTasksCount = tasks.filter((t: any) => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const totalTasksCount = tasks.length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const invoices = project?.invoices || [];
  const totalInvoiced = invoices.reduce((sum: number, inv: any) => {
    const invTotal = inv.amount || (inv.items?.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0) || 0) * (1 + ((inv.taxRate || 0) / 100));
    return sum + Number(invTotal || 0);
  }, 0);

  const totalPaid = invoices.filter((i: any) => i.status === 'PAID').reduce((sum: number, inv: any) => {
    const invTotal = inv.amount || (inv.items?.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0) || 0) * (1 + ((inv.taxRate || 0) / 100));
    return sum + Number(invTotal || 0);
  }, 0);

  const outstanding = Math.max(0, totalInvoiced - totalPaid);

  const recentInvoices = invoices.slice(0, 3);
  const scheduleEvents = (project?.scheduleEvents || []).slice(0, 3);
  const latestInvoice = invoices[invoices.length - 1];
  const quotationStatus = project?.proposals && project.proposals.length > 0 ? 'Accepted' : 'None';

  return (
    <div className="fixed inset-0 z-[150] flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={closeProjectDrawer} />

      {/* Slide-out Drawer Panel */}
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300 relative border-l border-gray-100 dark:border-slate-800">
        
        {/* Loading Spinner */}
        {isLoading && !project && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
            <div className="w-8 h-8 border-3 border-[#346E3A] border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-semibold">Loading project details...</span>
          </div>
        )}

        {project && (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 shrink-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                
                {/* Title */}
                <div className="flex-1 min-w-0">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-[#346E3A] rounded-lg text-lg font-bold text-gray-900 dark:text-white w-full focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveTitle}
                        className="p-1.5 bg-[#346E3A] text-white rounded-lg hover:bg-[#2b592f] transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight truncate leading-tight">
                        {project.name || project.title || 'Untitled Project'}
                      </h2>
                      <Edit2 className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  )}

                  {/* Client Info */}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <div className="w-5 h-5 rounded-full bg-[#346E3A]/10 text-[#346E3A] font-bold flex items-center justify-center text-[10px] shrink-0">
                      {project.client?.name?.charAt(0) || 'C'}
                    </div>
                    <span className="truncate">{project.client?.name || 'Unassigned Client'}</span>
                    {project.client?.companyName && (
                      <span className="text-gray-400">({project.client.companyName})</span>
                    )}
                  </div>
                </div>

                {/* Status Dropdown & Close Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <button
                      onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${STATUS_COLORS[project.status] || STATUS_COLORS.DRAFT}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{STATUS_LABELS[project.status] || project.status}</span>
                    </button>

                    {isStatusMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-30 animate-in fade-in zoom-in-95">
                        {Object.keys(STATUS_LABELS).map((statusKey) => (
                          <button
                            key={statusKey}
                            onClick={() => handleUpdateStatus(statusKey)}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 ${project.status === statusKey ? 'text-[#346E3A] font-bold' : 'text-gray-700 dark:text-gray-200'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[statusKey]?.split(' ')[0] || 'bg-gray-400'}`} />
                            {STATUS_LABELS[statusKey]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={closeProjectDrawer}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Close (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100 dark:border-slate-700/50">
                <button
                  onClick={handleOpenOrCreateChannel}
                  className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-800 hover:bg-[#346E3A]/5 dark:hover:bg-[#346E3A]/20 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-[#346E3A] dark:hover:text-green-400 transition-colors cursor-pointer group"
                >
                  <MessageSquare className="w-4 h-4 mb-1 text-gray-400 group-hover:text-[#346E3A]" />
                  <span className="text-[11px] truncate w-full text-center">
                    {project.channels && project.channels.length > 0 ? 'Open Channel' : 'Create Channel'}
                  </span>
                </button>

                <button
                  onClick={() => setShowAddTask(true)}
                  className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-800 hover:bg-[#346E3A]/5 dark:hover:bg-[#346E3A]/20 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-[#346E3A] dark:hover:text-green-400 transition-colors cursor-pointer group"
                >
                  <Plus className="w-4 h-4 mb-1 text-gray-400 group-hover:text-[#346E3A]" />
                  <span className="text-[11px] truncate w-full text-center">New Task</span>
                </button>

                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-800 hover:bg-[#346E3A]/5 dark:hover:bg-[#346E3A]/20 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-[#346E3A] dark:hover:text-green-400 transition-colors cursor-pointer group"
                >
                  <UserPlus className="w-4 h-4 mb-1 text-gray-400 group-hover:text-[#346E3A]" />
                  <span className="text-[11px] truncate w-full text-center">Collaborator</span>
                </button>

                <button
                  onClick={() => {
                    closeProjectDrawer();
                    router.push('/invoices');
                  }}
                  className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-800 hover:bg-[#346E3A]/5 dark:hover:bg-[#346E3A]/20 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-[#346E3A] dark:hover:text-green-400 transition-colors cursor-pointer group"
                >
                  <FileText className="w-4 h-4 mb-1 text-gray-400 group-hover:text-[#346E3A]" />
                  <span className="text-[11px] truncate w-full text-center">New Invoice</span>
                </button>
              </div>
            </div>

            {/* Quick Task Creation Form Inline */}
            {showAddTask && (
              <form onSubmit={handleQuickCreateTask} className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700/40 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#346E3A]"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="px-3 py-1.5 bg-[#346E3A] text-white text-xs font-bold rounded-lg hover:bg-[#2b592f] transition-colors disabled:opacity-50"
                >
                  {isCreatingTask ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Body Content */}
            <div className="flex-1 p-6 space-y-6">
              
              {/* Section 1: At a Glance */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">At a Glance</h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Progress Card */}
                  <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-800">
                    <div className="text-[11px] font-semibold text-gray-400 mb-1">Task Completion</div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{progressPercent}%</span>
                      <span className="text-xs text-gray-500 font-medium">({completedTasksCount}/{totalTasksCount})</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-[#346E3A] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Badges Card */}
                  <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-semibold text-[11px]">Quotation:</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{quotationStatus}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-semibold text-[11px]">Latest Invoice:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {latestInvoice ? latestInvoice.status : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-100 dark:border-slate-700/50 text-[10px] text-gray-400">
                      <span>Created:</span>
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Upcoming (Schedule Preview) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Upcoming Schedule</h3>
                  <button 
                    onClick={() => {
                      closeProjectDrawer();
                      router.push(`/projects/${project.id}?tab=schedule`);
                    }}
                    className="text-xs font-bold text-[#346E3A] hover:underline flex items-center gap-1"
                  >
                    View Full Schedule <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {scheduleEvents.length > 0 ? (
                    scheduleEvents.map((evt: any) => (
                      <div key={evt.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{evt.title}</div>
                            <div className="text-[10px] text-gray-400 font-medium mt-0.5">{evt.date || new Date().toLocaleDateString()} {evt.time || ''}</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded text-[10px] font-bold">
                          {evt.eventType || 'Event'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-gray-200 dark:border-slate-800 text-xs text-gray-400 italic text-center">
                      No upcoming schedule events for this project.
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Financials */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Financials</h3>
                  <button 
                    onClick={() => {
                      closeProjectDrawer();
                      router.push(`/projects/${project.id}?tab=invoice`);
                    }}
                    className="text-xs font-bold text-[#346E3A] hover:underline flex items-center gap-1"
                  >
                    View All Invoices <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3 Financial Numbers */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-800">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Invoiced</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">₦{totalInvoiced.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                    <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">Outstanding</div>
                    <div className="text-sm font-bold text-amber-700 dark:text-amber-300 mt-1">₦{outstanding.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Paid</div>
                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-1">₦{totalPaid.toLocaleString()}</div>
                  </div>
                </div>

                {/* Recent Invoices List */}
                <div className="space-y-2">
                  {recentInvoices.length > 0 ? (
                    recentInvoices.map((inv: any) => {
                      const invTotal = inv.amount || (inv.items?.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0) || 0) * (1 + ((inv.taxRate || 0) / 100));
                      return (
                        <div key={inv.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs font-bold text-gray-900 dark:text-white">Invoice #{inv.id.slice(0, 8)}</div>
                              <div className="text-[10px] text-gray-400">₦{Number(invTotal || 0).toLocaleString()}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {inv.status || 'SENT'}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl text-xs text-gray-400 italic text-center">
                      No invoices issued yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Project URLs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Links & Resources</h3>
                  <button
                    onClick={() => setShowAddUrl(!showAddUrl)}
                    className="text-xs font-bold text-[#346E3A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </button>
                </div>

                {/* Inline Add Link Form */}
                {showAddUrl && (
                  <form onSubmit={handleAddUrl} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2 mb-3">
                    <input
                      type="text"
                      placeholder="Label (e.g. Figma Design, Live Staging)"
                      value={urlLabel}
                      onChange={(e) => setUrlLabel(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#346E3A]"
                      required
                    />
                    <input
                      type="url"
                      placeholder="URL (https://...)"
                      value={urlAddress}
                      onChange={(e) => setUrlAddress(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#346E3A]"
                      required
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddUrl(false)}
                        className="px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isAddingUrl}
                        className="px-3 py-1 text-xs font-bold bg-[#346E3A] text-white rounded-lg hover:bg-[#2b592f] transition-colors disabled:opacity-50"
                      >
                        {isAddingUrl ? 'Saving...' : 'Save Link'}
                      </button>
                    </div>
                  </form>
                )}

                {/* List of URLs */}
                <div className="space-y-2">
                  {(project.urls && project.urls.length > 0) ? (
                    project.urls.map((linkItem: any) => (
                      <div key={linkItem.id} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center justify-between group">
                        <a
                          href={linkItem.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-[#346E3A] transition-colors truncate flex-1 min-w-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{linkItem.label}</span>
                          <span className="text-[10px] text-gray-400 font-normal truncate opacity-60">({linkItem.url})</span>
                        </a>
                        <button
                          onClick={() => handleDeleteUrl(linkItem.id)}
                          className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl text-xs text-gray-400 italic text-center">
                      No project URLs added yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Section 5: Collaborators */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Collaborators</h3>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="text-xs font-bold text-[#346E3A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Add Member
                  </button>
                </div>

                {/* Inline Invite Form Modal */}
                {showInviteModal && (
                  <form onSubmit={handleInviteMember} className="p-3.5 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl space-y-3 mb-3">
                    <div className="text-xs font-bold text-gray-900 dark:text-white">Invite Collaborator to Project</div>
                    <input
                      type="email"
                      placeholder="e.g. colleague@agency.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#346E3A]"
                      required
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#346E3A]"
                    >
                      <option value="CONTRACTOR">Contractor / Member</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="PRIMARY_CONTACT">Primary Contact</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowInviteModal(false)}
                        className="px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isInviting}
                        className="px-3 py-1 text-xs font-bold bg-[#FBDF4B] text-gray-900 rounded-lg hover:bg-[#F3D53C] transition-colors disabled:opacity-50"
                      >
                        {isInviting ? 'Inviting...' : 'Send Invite'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Member Avatars Grid */}
                <div className="space-y-2">
                  {(project.members && project.members.length > 0) ? (
                    project.members.map((mem: any) => {
                      const name = mem.user?.firstName ? `${mem.user.firstName} ${mem.user.lastName || ''}` : mem.clientContact?.name || 'Collaborator';
                      const email = mem.user?.email || mem.clientContact?.email || '';
                      const role = mem.role || 'Member';
                      const avatar = mem.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

                      return (
                        <div
                          key={mem.id}
                          onClick={() => setSelectedMember(selectedMember?.id === mem.id ? null : { name, email, role })}
                          className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img src={avatar} alt={name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-200" />
                            <div>
                              <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{name}</div>
                              <div className="text-[10px] text-gray-400">{email}</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-[#346E3A]/10 text-[#346E3A] dark:text-green-400 rounded text-[10px] font-bold uppercase tracking-wider">
                            {role}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl text-xs text-gray-400 italic text-center">
                      Only project owner assigned so far.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
