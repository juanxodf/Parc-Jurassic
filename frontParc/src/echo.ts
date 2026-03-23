import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from './models/auth.model.ts';
import { API_BASE_URL } from './constantes.ts';

(window as unknown as Record<string, unknown>)['Pusher'] = Pusher;

type ReverbEcho = Echo<'reverb'>;

let echoInstance: ReverbEcho | null = null;

const REVERB_KEY = import.meta.env['VITE_REVERB_APP_KEY'] ?? 'jurassickey';
const REVERB_HOST = import.meta.env['VITE_REVERB_HOST'] ?? window.location.hostname ?? 'localhost';
const REVERB_PORT = Number.parseInt(import.meta.env['VITE_REVERB_PORT'] ?? '8080', 10);
const REVERB_SCHEME = import.meta.env['VITE_REVERB_SCHEME'] ?? 'http';
const REALTIME_ENABLED = (import.meta.env['VITE_REALTIME_ENABLED'] ?? 'false') === 'true';

export function isRealtimeEnabled(): boolean {
  return REALTIME_ENABLED;
}

export function getEcho(): ReverbEcho {
  if (!REALTIME_ENABLED) throw new Error('Realtime desactivado');
  if (echoInstance) return echoInstance;

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: REVERB_KEY,
    wsHost: REVERB_HOST,
    wsPort: Number.isNaN(REVERB_PORT) ? 8080 : REVERB_PORT,
    wssPort: Number.isNaN(REVERB_PORT) ? 8080 : REVERB_PORT,
    forceTLS: REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
    auth: {
      headers: { Authorization: `Bearer ${getToken()}` },
    },
  });

  return echoInstance as ReverbEcho;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
