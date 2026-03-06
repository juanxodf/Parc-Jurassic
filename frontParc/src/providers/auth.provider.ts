import api from '../api.ts';
import type { AuthResponse, User } from '../types/index.ts';

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/login', { email, password });
  return data;
}

export async function registerRequest(
  nick: string,
  name: string,
  email: string,
  password: string,
  password_confirmation: string,
  role: User['role'],
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/register', {
    nick, name, email, password, password_confirmation, role,
  });
  return data;
}

export async function logoutRequest(): Promise<void> {
  await api.post('/logout');
}

export async function getMeRequest(): Promise<User> {
  const { data } = await api.get<User>('/me');
  return data;
}

export async function updateProfileRequest(payload: Partial<User & { password?: string }>): Promise<User> {
  const { data } = await api.patch<User>('/me', payload);
  return data;
}
