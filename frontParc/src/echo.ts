import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { PUSHER_APP_KEY, PUSHER_CLUSTER, PUSHER_HOST, PUSHER_PORT } from './constantes.ts';
import { getToken } from './models/auth.model.ts';
import { API_BASE_URL } from './constantes.ts';

// Pusher necesita ser global para que Echo lo encuentre
(window as unknown as Record<string, unknown>)['Pusher'] = Pusher;

let echoInstance: Echo<'pusher'> | null = null;
const REALTIME_ENABLED = (import.meta.env['VITE_REALTIME_ENABLED'] ?? 'false') === 'true';

export function isRealtimeEnabled(): boolean {
  return REALTIME_ENABLED;
}

export function getEcho(): Echo<'pusher'> {
  if (!REALTIME_ENABLED) {
    throw new Error('Realtime desactivado');
  }
  if (echoInstance) return echoInstance;

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: PUSHER_APP_KEY,
    cluster: PUSHER_CLUSTER,
    wsHost: PUSHER_HOST,
    wsPort: PUSHER_PORT,
    wssPort: PUSHER_PORT,
    enabledTransports: ['ws', 'wss'],
    httpHost: PUSHER_HOST,
    httpPort: PUSHER_PORT,
    httpsPort: PUSHER_PORT,
    forceTLS: false,
    disableStats: true,
    authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
    auth: {
      headers: { Authorization: `Bearer ${getToken()}` },
    },
  });

  return echoInstance;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
