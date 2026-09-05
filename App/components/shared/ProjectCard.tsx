import React from 'react';
import Link from 'next/link';
import { Folder, Users, MessageSquare } from 'lucide-react';
import { StatusPill } from '@/components/shared/StatusPill';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  status: string;
  client?: { name?: string } | null;
  taskSummary?: { completed: number; total: number };
  unreadMessages?: number;
}

interface ProjectCardProps {
  project: Project;
  showTaskProgress?: boolean;    // Agency only — `canAccess('tasks')`
  showChannelBadge?: boolean;    // Agency only — `canAccess('channels')`
  className?: string;
}

/**
 * ProjectCard — same component across all tiers.
 * Tier-specific sections are hidden via props, not a forked component.
 *
 * @example (Agency)
 * <ProjectCard project={p} showTaskProgress={canAccess('tasks')} showChannelBadge={canAccess('channels')} />
 *
 * @example (Solo)
 * <ProjectCard project={p} />
 */
export function ProjectCard({ project, showTaskProgress, showChannelBadge, className }: ProjectCardProps) {
  const taskPct =
    showTaskProgress && project.taskSummary && project.taskSummary.total > 0
      ? Math.round((project.taskSummary.completed / project.taskSummary.total) * 100)
      : null;

  return (
    <Link
      href={`/projects/${project.id}`}
      className={cn(
        'block rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-[#FFBA00] transition-colors group',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-md bg-[#FFBA00]/10 text-[#FFBA00] shrink-0">
            <Folder size={14} />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#FFBA00] transition-colors">
            {project.name}
          </span>
        </div>
        <StatusPill status={project.status} className="shrink-0" />
      </div>

      {/* Client */}
      {project.client?.name && (
        <div className="flex items-center gap-1.5 mb-3">
          <Users size={12} className="text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500 dark:text-slate-400 truncate">
            {project.client.name}
          </span>
        </div>
      )}

      {/* Task progress — Agency only */}
      {taskPct !== null && project.taskSummary && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 dark:text-slate-400">Tasks</span>
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
              {project.taskSummary.completed}/{project.taskSummary.total}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-700">
            <div
              className="h-1.5 rounded-full bg-[#FFBA00] transition-all"
              style={{ width: `${taskPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Channel badge — Agency only */}
      {showChannelBadge && (project.unreadMessages ?? 0) > 0 && (
        <div className="flex items-center gap-1.5">
          <MessageSquare size={12} className="text-[#FFBA00]" />
          <span className="text-xs font-medium text-[#FFBA00]">
            {project.unreadMessages} new message{project.unreadMessages !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </Link>
  );
}
