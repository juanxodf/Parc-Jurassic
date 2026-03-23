export interface User {
  id: number;
  nick?: string;
  name: string;
  email: string;
  role: 'admin' | 'veterinario' | 'mantenimiento';
  photo?: string | null;
  photo_url?: string | null;
  created_at?: string;
}

export interface Celda {
  id: number;
  nombre: string;
  fila: number;
  columna: number;
  nivel_seguridad: number;
  cantidad_alimento: number;
  averias_pendientes: number;
  estado: 'operativa' | 'mantenimiento' | 'brecha' | 'evacuada';
  notas?: string;
  dinosaurios?: Dinosaurio[];
  created_at?: string;
  updated_at?: string;
}

export interface Dinosaurio {
  id: number;
  nick: string;
  raza: string;
  dieta: 'herbivoro' | 'carnivoro' | 'omnivoro';
  nivel_peligrosidad: 'bajo' | 'medio' | 'alto' | 'muy_alto' | 'extremo' | 'critico';
  edad: number;
  descripcion?: string;
  estado: 'sano' | 'herido' | 'enfermo' | 'muerto';
  celda_id?: number;
  celda?: Celda;
  created_at?: string;
  updated_at?: string;
}

export interface Tarea {
  id: number;
  descripcion?: string;
  tipo: 'veterinario' | 'mantenimiento';
  estado: 'pendiente' | 'en_progreso' | 'finalizada';
  celda_id?: number;
  celda?: Celda;
  user_id?: number;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface Simulacion {
  id: number;
  tipo: 'normal' | 'brecha';
  user_id: number;
  celda_id?: number | null;
  resultado: Record<string, unknown>;
  estado?: 'contenida' | 'desastre' | 'caos' | null;
  user?: User;
  celda?: Celda;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}
