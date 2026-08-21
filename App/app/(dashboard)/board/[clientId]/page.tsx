import { Board } from '@/components/board/Board';
import React from 'react';

export default async function BoardPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  return (
    <main className="min-h-screen bg-gray-100">
      <Board clientId={clientId} />
    </main>
  );
}
