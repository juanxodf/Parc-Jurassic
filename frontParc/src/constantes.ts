export const API_BASE_URL = 'http://localhost:8000/api';

export const PUSHER_APP_KEY = 'jurassickey';
export const PUSHER_CLUSTER = 'mt1';
export const PUSHER_HOST = 'localhost';
export const PUSHER_PORT = 8080;

export const TOKEN_KEY = 'jp_token';
export const USER_KEY = 'jp_user';

export const ROUTES = {
  LOGIN: '/indexUI.html',
  LOBBY: '/lobby.html',
  ADMIN: '/admin.html',
  GAME: '/gameUI.html',
} as const;

export const NIVEL_PELIGROSIDAD_LABEL: Record<string, string> = {
  bajo: '🟢 Bajo',
  medio: '🟡 Medio',
  alto: '🟠 Alto',
  muy_alto: '🔴 Muy alto',
  extremo: '☠️ Extremo',
  critico: '💀 Crítico',
};

export const ESTADO_TAREA_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  finalizada: 'Finalizada',
};
