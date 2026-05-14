'use client';
import { HomeScreen } from '@/features/auth/HomeScreen';
import { withAuth } from '@/components/layout/withAuth';

export default withAuth(HomeScreen);
