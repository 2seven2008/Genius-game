'use client';
import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/services/socket';

export function useSocket(): Socket {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();
    return () => {
      // Don't disconnect on unmount — reuse socket across pages
    };
  }, []);

  return socketRef.current ?? getSocket();
}
