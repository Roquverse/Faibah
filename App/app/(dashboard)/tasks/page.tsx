'use client';

import React from 'react';
import KanbanBoard from '@/components/dashboard/KanbanBoard';

export default function TasksPage() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] w-full font-sans bg-white overflow-hidden">
      <div className="flex items-center px-6 pt-6 pb-2 shrink-0 bg-transparent">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Tasks</h1>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <KanbanBoard projectId="all" />
      </div>
    </div>
  );
}
