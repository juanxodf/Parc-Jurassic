import api from '../api.ts';
import type { Simulacion } from '../types/index.ts';

export async function getSimulaciones(): Promise<Simulacion[]> {
  const { data } = await api.get<Simulacion[]>('/simulaciones');
  return data;
}

export async function simulacionNormal(celda_id?: number): Promise<Simulacion> {
  const { data } = await api.post<Simulacion>('/simulaciones/normal', celda_id ? { celda_id } : {});
  return data;
}

export async function simulacionBrecha(celda_id?: number): Promise<Simulacion> {
  const { data } = await api.post<Simulacion>('/simulaciones/brecha', celda_id ? { celda_id } : {});
  return data;
}
