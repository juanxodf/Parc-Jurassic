import { loginRequest, registerRequest } from '../providers/auth.provider.ts';
import { saveSession } from '../models/auth.model.ts';
import { ROUTES } from '../constantes.ts';
import axios from 'axios';

export function initLoginForm(): void {
  setupTabs();
  setupLoginForm();
  setupRegisterForm();
}

function setupTabs(): void {
  const tabs = document.querySelectorAll<HTMLButtonElement>('.login-tab');
  const panels = document.querySelectorAll<HTMLElement>('.login-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset['target']!;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(target)?.classList.remove('hidden');
    });
  });
}

function setupLoginForm(): void {
  const form = document.getElementById('loginForm') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = (form.querySelector('#login-email') as HTMLInputElement).value;
    const password = (form.querySelector('#login-password') as HTMLInputElement).value;
    const errorEl  = form.querySelector<HTMLElement>('.alert-error');
    const btn      = form.querySelector<HTMLButtonElement>('button[type="submit"]');

    clearError(errorEl);
    setLoading(btn, true);

    try {
      const { token, user } = await loginRequest(email, password);
      saveSession(token, user);
      window.location.href = user.role === 'admin' ? ROUTES.ADMIN : ROUTES.LOBBY;
    } catch (err) {
      showError(errorEl, extractMessage(err));
    } finally {
      setLoading(btn, false);
    }
  });
}

function setupRegisterForm(): void {
  const form = document.getElementById('registerForm') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = (form.querySelector('#reg-name') as HTMLInputElement).value;
    const nick     = (form.querySelector('#reg-nick') as HTMLInputElement).value;
    const email    = (form.querySelector('#reg-email') as HTMLInputElement).value;
    const password = (form.querySelector('#reg-password') as HTMLInputElement).value;
    const confirm  = (form.querySelector('#reg-confirm') as HTMLInputElement).value;
    const role     = (form.querySelector('#reg-role') as HTMLSelectElement).value as 'admin' | 'veterinario' | 'mantenimiento';
    const errorEl  = form.querySelector<HTMLElement>('.alert-error');
    const btn      = form.querySelector<HTMLButtonElement>('button[type="submit"]');

    clearError(errorEl);

    if (password !== confirm) {
      showError(errorEl, 'Las contraseñas no coinciden');
      return;
    }

    setLoading(btn, true);
    try {
      const { token, user } = await registerRequest(nick, name, email, password, confirm, role);
      saveSession(token, user);
      window.location.href = user.role === 'admin' ? ROUTES.ADMIN : ROUTES.LOBBY;
    } catch (err) {
      showError(errorEl, extractMessage(err));
    } finally {
      setLoading(btn, false);
    }
  });
}

function showError(el: HTMLElement | null, msg: string): void {
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}
function clearError(el: HTMLElement | null): void {
  if (!el) return;
  el.textContent = '';
  el.classList.add('hidden');
}
function setLoading(btn: HTMLButtonElement | null, loading: boolean): void {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Cargando...' : btn.dataset['label'] ?? btn.textContent;
}
function extractMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const url = err.config?.url ?? '';
    const data = err.response?.data as { message?: string } | Record<string, string[]>;

    if (status === 419) {
      return 'No te pudimos iniciar sesión porque el servidor esperaba otra forma de acceso. Reinicia backend y vuelve a probar.';
    }
    if (status === 401) {
      return 'El email o la contraseña no coinciden.';
    }
    if (status === 404 && (url.includes('/login') || url.includes('/register'))) {
      return 'No encontramos la ruta de acceso. El frontend no está llegando al endpoint correcto del backend.';
    }
    if (status === 422 && data && typeof data === 'object') {
      const firstError = Object.values(data).find(v => Array.isArray(v) && v.length > 0) as string[] | undefined;
      if (firstError?.[0]) return firstError[0];
      return 'Hay datos incompletos o incorrectos. Revisa los campos e inténtalo de nuevo.';
    }
    if (status && status >= 500) {
      return 'El servidor tuvo un problema interno. No es un fallo de tus datos.';
    }
    if (typeof data?.message === 'string') return data.message;
    return 'No pudimos completar la operación. Inténtalo de nuevo en unos segundos.';
  }
  return 'No pudimos conectar con el servidor.';
}
