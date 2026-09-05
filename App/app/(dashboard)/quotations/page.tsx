'use client';

import React from 'react';
import { BarChart3, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTierAccess } from '@/lib/permissions/useTierAccess';
import { redirect } from 'next/navigation';

export default function QuotationsPage() {
  const { canAccess, loading } = useTierAccess();

  if (!loading && !canAccess('quotations')) {
    redirect('/?upgrade=agency');
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Quotations"
        description="Global pipeline view of all your active quotes and proposals."
        action={{ label: 'New Quotation', onClick: () => {}, icon: <Plus size={15} /> }}
      />
      <div className="flex-1 p-6">
        <EmptyState
          icon={<BarChart3 size={28} />}
          title="No quotations yet"
          description="Create quotations to track your deal pipeline and conversion rates."
          action={{ label: 'Create Quotation', onClick: () => {} }}
        />
      </div>
    </div>
  );
}
