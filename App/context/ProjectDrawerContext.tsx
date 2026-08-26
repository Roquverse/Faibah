'use client';

import React, { createContext, useContext, useState } from 'react';

interface ProjectDrawerContextType {
  activeProjectId: string | null;
  openProjectDrawer: (projectId: string) => void;
  closeProjectDrawer: () => void;
}

const ProjectDrawerContext = createContext<ProjectDrawerContextType>({
  activeProjectId: null,
  openProjectDrawer: () => {},
  closeProjectDrawer: () => {},
});

export function ProjectDrawerProvider({ children }: { children: React.ReactNode }) {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const openProjectDrawer = (projectId: string) => {
    setActiveProjectId(projectId);
  };

  const closeProjectDrawer = () => {
    setActiveProjectId(null);
  };

  return (
    <ProjectDrawerContext.Provider value={{ activeProjectId, openProjectDrawer, closeProjectDrawer }}>
      {children}
    </ProjectDrawerContext.Provider>
  );
}

export function useProjectDrawer() {
  return useContext(ProjectDrawerContext);
}
