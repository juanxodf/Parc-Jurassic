import api from '../api.ts';
import type { Simulacion } from '../types/index.ts';

export interface ResultadoNormal {
  simulacion_id: number;
  tipo: 'normal';
  resultados: Array<{
    celda_id: number;
    nombre: string;
    fila: number;
    columna: number;
    alimento_anterior: number;
    alimento_actual: number;
    averias: number;
    alertas: string[];
    requiere_atencion: boolean;
  }>;
  resumen: {
    total_celdas: number;
    requieren_atencion: number;
  };
}

export interface ResultadoBrecha {
  simulacion_id: number;
  resultado: {
    celda: { id: number; nombre: string; fila: number; columna: number };
    probabilidad_fuga: number;
    tirada: number;
    fuga_ocurre: boolean;
    estado_final: 'contenida' | 'desastre' | 'caos';
    detalles: string[];
    dinosaurios_en_riesgo: Array<{ nick: string; raza: string; peligrosidad: string }>;
  };
}

export async function getSimulaciones(): Promise<Simulacion[]> {
  const { data } = await api.get<Simulacion[]>('/simulaciones');
  return data;
}

export async function simulacionNormal(celda_id?: number): Promise<ResultadoNormal> {
  const payload = celda_id ? { celda_id } : {};
  const { data } = await api.post<ResultadoNormal>('/simulaciones/normal', payload);
  return data;
}

export async function simulacionBrecha(celda_id?: number): Promise<ResultadoBrecha> {
  const payload = celda_id ? { celda_id } : {};
  const { data } = await api.post<ResultadoBrecha>('/simulaciones/brecha', payload);
  return data;
}
