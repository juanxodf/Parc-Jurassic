import axios, { type AxiosRequestConfig } from 'axios';
import { API_BASE_URL, ROUTES } from './constantes.ts';
import { getToken, clearSession } from './models/auth.model.ts';
import { showError, showWarning } from './services/toast.ts';

const RETRY_STATUS = new Set([500, 502, 503, 504]);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

// Añade el token en cada petición
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Si 401 → limpiar sesión y redirigir al login
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const status = error.response?.status;
    const config = error.config as AxiosRequestConfig & { _retried?: boolean };

    if (status === 401) {
      clearSession();
      window.location.href = ROUTES.LOGIN;
      return Promise.reject(error);
    }

    if (status === 403) {
      showError('No tienes permisos para realizar esta acción.');
      return Promise.reject(error);
    }

    if (status === 422) {
      const data  = error.response?.data as { message?: string; errors?: Record<string, string[]> };
      const first = data?.errors
        ? (Object.values(data.errors).flat()[0] ?? data?.message)
        : data?.message;
      showError(first ?? 'Datos incorrectos o incompletos.');
      return Promise.reject(error);
    }

    if ((RETRY_STATUS.has(status ?? 0) || error.code === 'ECONNABORTED') && !config._retried) {
      config._retried = true;
      showWarning('Error de conexión. Reintentando automáticamente…');
      await new Promise(r => setTimeout(r, 1200));
      return api(config);
    }

    if (error.code === 'ERR_NETWORK') {
      showError('Sin conexión con el servidor. Comprueba que el backend está activo.');
      return Promise.reject(error);
    }

    showError('Error del servidor. Inténtalo de nuevo.');
    return Promise.reject(error);
  }
);

export default api;
