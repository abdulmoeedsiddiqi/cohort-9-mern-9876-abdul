import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { getSocket } from '../lib/socket';

const NOTE_EVENTS = ['note:created', 'note:updated', 'note:deleted', 'note:restored', 'note:purged'] as const;

export function useNotesRealtime(): void {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      return;
    }

    const socket = getSocket();
    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
    };

    NOTE_EVENTS.forEach((event) => socket.on(event, invalidate));
    socket.connect();

    return () => {
      NOTE_EVENTS.forEach((event) => socket.off(event, invalidate));
      socket.disconnect();
    };
  }, [user, queryClient]);
}
