import axios from 'axios';

import type { PublicUser } from '../types/user.types';
import { apiClient } from './client';

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<PublicUser> {
  const res = await apiClient.post<{ user: PublicUser }>('/auth/login', input);
  return res.data.user;
}

export async function signup(input: SignupInput): Promise<PublicUser> {
  const res = await apiClient.post<{ user: PublicUser }>('/auth/signup', input);
  return res.data.user;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function me(): Promise<PublicUser | null> {
  try {
    const res = await apiClient.get<{ user: PublicUser }>('/auth/me');
    return res.data.user;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return null;
    }
    throw err;
  }
}
