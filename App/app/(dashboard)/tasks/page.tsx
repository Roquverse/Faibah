'use client';

import React from 'react';
import KanbanBoard from '@/components/dashboard/KanbanBoard';

export default function TasksPage() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] w-full font-sans bg-white overflow-hidden">
      <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Global Tasks</h1>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <KanbanBoard projectId="all" />
      </div>
    </div>
  );
}
