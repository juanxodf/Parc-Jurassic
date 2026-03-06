import api from '../api.ts';
import type { User } from '../types/index.ts';

export async function getUsuarios(): Promise<User[]> {
  const { data } = await api.get<User[]>('/usuarios');
  return data;
}

export async function getUsuario(id: number): Promise<User> {
  const { data } = await api.get<User>(`/usuarios/${id}`);
  return data;
}

export async function createUsuario(payload: Partial<User & { password: string }>): Promise<User> {
  const { data } = await api.post<User>('/usuarios', payload);
  return data;
}

export async function updateUsuario(id: number, payload: Partial<User>): Promise<User> {
  const { data } = await api.put<User>(`/usuarios/${id}`, payload);
  return data;
}

export async function deleteUsuario(id: number): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}
