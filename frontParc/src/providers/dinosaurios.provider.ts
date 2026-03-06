import api from '../api.ts';
import type { Dinosaurio } from '../types/index.ts';

export async function getDinosaurios(): Promise<Dinosaurio[]> {
  const { data } = await api.get<Dinosaurio[]>('/dinosaurios');
  return data;
}

export async function getDinosaurio(id: number): Promise<Dinosaurio> {
  const { data } = await api.get<Dinosaurio>(`/dinosaurios/${id}`);
  return data;
}

export async function getRazas(): Promise<string[]> {
  const { data } = await api.get<string[]>('/dinosaurios/razas');
  return data;
}

export async function createDinosaurio(payload: Partial<Dinosaurio>): Promise<Dinosaurio> {
  const { data } = await api.post<Dinosaurio>('/dinosaurios', payload);
  return data;
}

export async function updateDinosaurio(id: number, payload: Partial<Dinosaurio>): Promise<Dinosaurio> {
  const { data } = await api.put<Dinosaurio>(`/dinosaurios/${id}`, payload);
  return data;
}

export async function deleteDinosaurio(id: number): Promise<void> {
  await api.delete(`/dinosaurios/${id}`);
}
