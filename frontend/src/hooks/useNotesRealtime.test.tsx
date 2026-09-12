import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useNotesRealtime } from './useNotesRealtime';

const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('../lib/socket', () => ({
  getSocket: () => mockSocket,
}));

let mockUser: { id: string } | null = null;
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

describe('useNotesRealtime', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockUser = null;
  });

  it('does not connect when there is no authenticated user', () => {
    const { Wrapper } = createWrapper();
    renderHook(() => useNotesRealtime(), { wrapper: Wrapper });

    expect(mockSocket.connect).not.toHaveBeenCalled();
  });

  it('connects and subscribes to every note event when a user is authenticated', () => {
    mockUser = { id: 'user-1' };
    const { Wrapper } = createWrapper();
    renderHook(() => useNotesRealtime(), { wrapper: Wrapper });

    expect(mockSocket.connect).toHaveBeenCalled();
    for (const event of ['note:created', 'note:updated', 'note:deleted', 'note:restored', 'note:purged']) {
      expect(mockSocket.on).toHaveBeenCalledWith(event, expect.any(Function));
    }
  });

  it('invalidates the notes query cache when a note event fires', () => {
    mockUser = { id: 'user-1' };
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    renderHook(() => useNotesRealtime(), { wrapper: Wrapper });

    const createdHandler = mockSocket.on.mock.calls.find(([event]) => event === 'note:created')?.[1] as () => void;
    createdHandler();

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notes'] });
  });

  it('unsubscribes and disconnects on unmount', () => {
    mockUser = { id: 'user-1' };
    const { Wrapper } = createWrapper();
    const { unmount } = renderHook(() => useNotesRealtime(), { wrapper: Wrapper });

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(mockSocket.off).toHaveBeenCalledWith('note:created', expect.any(Function));
  });
});
