'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IntroScreen } from '@/components/layout/IntroScreen';
import { LandingScreen } from '@/features/auth/LandingScreen';
import { useAuthStore } from '@/contexts/auth.store';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [introDone, setIntroDone] = useState(false);

  const handleIntroComplete = () => {
    setIntroDone(true);
    if (isAuthenticated) router.replace('/home');
  };

  return (
    <>
      {!introDone && <IntroScreen onComplete={handleIntroComplete} />}
      {introDone && !isAuthenticated && <LandingScreen />}
    </>
  );
}
