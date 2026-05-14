'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LandingScreen } from '@/features/auth/LandingScreen';
import { useAuthStore } from '@/contexts/auth.store';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.replace('/home');
  }, [isAuthenticated, router]);

  return <LandingScreen />;
}
