import api from '../api.ts';
import type { AuthResponse, User } from '../types/index.ts';

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function registerRequest(
  nick: string,
  name: string,
  email: string,
  password: string,
  password_confirmation: string,
  role: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    nick, name, email, password, password_confirmation, role,
  });
  return data;
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getMeRequest(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function updateProfileRequest(
  fields: { name?: string; password?: string; password_confirmation?: string },
  photo?: File
): Promise<User> {
  const formData = new FormData();

  if (fields.name)                  formData.append('name', fields.name);
  if (fields.password)              formData.append('password', fields.password);
  if (fields.password_confirmation) formData.append('password_confirmation', fields.password_confirmation);
  if (photo)                        formData.append('photo', photo);

  const { data } = await api.post<User>('/auth/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params:  { _method: 'PATCH' },
  });

  return data;
}
