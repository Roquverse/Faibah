'use client';

import React from 'react';
import ProjectSchedule from '@/components/dashboard/ProjectSchedule';

export default function SchedulePage() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] w-full font-sans bg-white overflow-hidden">
      <div className="flex items-center px-6 pt-6 pb-2 shrink-0 bg-transparent">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Schedule</h1>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <ProjectSchedule projectId="all" />
      </div>
    </div>
  );
}
