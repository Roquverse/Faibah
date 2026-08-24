"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TimeTracker } from './TimeTracker';

interface Task {
  id: string;
  title: string;
  status: string;
  billable: boolean;
  timeLogs: any[];
}

interface TaskCardProps {
  task: Task;
  userId: string;
}

export function TaskCard({ task, userId }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 mb-2 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-400 transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800">{task.title}</h4>
        {task.billable && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
            Billable
          </span>
        )}
      </div>
      <div onPointerDown={(e) => e.stopPropagation()}>
        {/* Stop propagation so clicking buttons doesn't trigger drag */}
        <TimeTracker taskId={task.id} userId={userId} initialTimeLogs={task.timeLogs} />
      </div>
    </div>
  );
}
