'use client';

import React from 'react';
import { Users, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTierAccess } from '@/lib/permissions/useTierAccess';
import { redirect } from 'next/navigation';

export default function TeamPage() {
  const { canAccess, loading } = useTierAccess();

  if (!loading && !canAccess('team')) {
    redirect('/?upgrade=agency');
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Team"
        description="Manage team members, roles and project access."
        action={{ label: 'Invite Member', onClick: () => {}, icon: <Plus size={15} /> }}
      />
      <div className="flex-1 p-6">
        <EmptyState
          icon={<Users size={28} />}
          title="No team members yet"
          description="Invite team members to collaborate on projects, tasks and channels."
          action={{ label: 'Invite Member', onClick: () => {} }}
        />
      </div>
    </div>
  );
}
