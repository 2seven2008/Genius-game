'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/contexts/auth.store';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedPage(props: P) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace('/');
      }
    }, [isAuthenticated, isLoading, router]);

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-dark-base flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    return <Component {...props} />;
  };
}
