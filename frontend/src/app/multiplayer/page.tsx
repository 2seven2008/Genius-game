'use client';
import { Suspense } from 'react';
import { MultiplayerScreen } from '@/features/multiplayer/MultiplayerScreen';
import { withAuth } from '@/components/layout/withAuth';

const Protected = withAuth(MultiplayerScreen);

export default function MultiplayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Protected />
    </Suspense>
  );
}
