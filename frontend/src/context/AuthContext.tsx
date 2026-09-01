import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import * as authApi from '../api/auth.api';
import type { PublicUser } from '../types/user.types';

interface AuthContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  login: (input: authApi.LoginInput) => Promise<PublicUser>;
  signup: (input: authApi.SignupInput) => Promise<PublicUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const ME_QUERY_KEY = ['auth', 'me'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => queryClient.setQueryData(ME_QUERY_KEY, user),
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (user) => queryClient.setQueryData(ME_QUERY_KEY, user),
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => queryClient.setQueryData(ME_QUERY_KEY, null),
  });

  const value: AuthContextValue = {
    user: meQuery.data ?? null,
    isLoading: meQuery.isLoading,
    login: (input) => loginMutation.mutateAsync(input),
    signup: (input) => signupMutation.mutateAsync(input),
    logout: () => logoutMutation.mutateAsync(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
