"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';

interface BoardColumnProps {
  id: string;
  title: string;
  tasks: any[];
  userId: string;
}

export function BoardColumn({ id, title, tasks, userId }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col bg-gray-50 rounded-lg p-4 min-w-[300px] w-full max-w-sm shrink-0 shadow-inner">
      <h3 className="font-semibold text-gray-700 mb-4 px-1">{title} <span className="text-gray-400 text-sm font-normal ml-2">{tasks.length}</span></h3>
      <div ref={setNodeRef} className="flex-1 min-h-[200px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} userId={userId} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
