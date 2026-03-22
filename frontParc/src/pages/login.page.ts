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
  const tabs   = document.querySelectorAll<HTMLButtonElement>('.login-tab');
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
      showError(errorEl, 'Las contraseñas no coinciden.');
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
  btn.disabled    = loading;
  btn.textContent = loading ? 'Cargando...' : (btn.dataset['label'] ?? btn.textContent);
}

function extractMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: Record<string, string[]> };
    if (data?.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (first) return first;
    }
    return data?.message ?? 'Error al iniciar sesión.';
  }
  return 'No se pudo conectar con el servidor.';
}
