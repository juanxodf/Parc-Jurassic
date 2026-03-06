import api from '../api.ts';
import type { Tarea } from '../types/index.ts';

export async function getTareas(): Promise<Tarea[]> {
  const { data } = await api.get<Tarea[]>('/tareas');
  return data;
}

export async function getTarea(id: number): Promise<Tarea> {
  const { data } = await api.get<Tarea>(`/tareas/${id}`);
  return data;
}

export async function createTarea(payload: Partial<Tarea>): Promise<Tarea> {
  const { data } = await api.post<Tarea>('/tareas', payload);
  return data;
}

export async function iniciarTarea(id: number): Promise<Tarea> {
  const { data } = await api.patch<Tarea>(`/tareas/${id}/iniciar`);
  return data;
}

export async function finalizarTarea(id: number): Promise<Tarea> {
  const { data } = await api.patch<Tarea>(`/tareas/${id}/finalizar`);
  return data;
}

export async function deleteTarea(id: number): Promise<void> {
  await api.delete(`/tareas/${id}`);
}
