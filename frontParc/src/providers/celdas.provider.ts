import api from '../api.ts';
import type { Celda } from '../types/index.ts';

export async function getCeldas(): Promise<Celda[]> {
  const { data } = await api.get<Celda[]>('/celdas');
  return data;
}

export async function getCelda(id: number): Promise<Celda> {
  const { data } = await api.get<Celda>(`/celdas/${id}`);
  return data;
}

export async function createCelda(payload: Partial<Celda>): Promise<Celda> {
  const { data } = await api.post<Celda>('/celdas', payload);
  return data;
}

export async function updateCelda(id: number, payload: Partial<Celda>): Promise<Celda> {
  const { data } = await api.put<Celda>(`/celdas/${id}`, payload);
  return data;
}

export async function deleteCelda(id: number): Promise<void> {
  await api.delete(`/celdas/${id}`);
}
