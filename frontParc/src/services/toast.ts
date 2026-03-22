export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  timer: ReturnType<typeof setTimeout>;
}

const DURATION_MS = 3000;
let counter = 0;
const toasts: Toast[] = [];
let container: HTMLElement | null = null;

function getContainer(): HTMLElement {
  if (container && document.body.contains(container)) return container;
  container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
  return container;
}

function buildElement(toast: Toast): HTMLElement {
  const el = document.createElement('div');
  el.className = `toast toast-${toast.type}`;
  el.dataset['id'] = String(toast.id);

  const icons: Record<ToastType, string> = {
    success: '✓',
    error:   '✕',
    warning: '⚠',
    info:    'ℹ',
  };

  el.innerHTML = `
    <span class="toast-icon">${icons[toast.type]}</span>
    <span class="toast-message">${toast.message}</span>
    <button class="toast-close" aria-label="Cerrar">×</button>
  `;

  el.querySelector('.toast-close')!.addEventListener('click', () => dismiss(toast.id));
  return el;
}

function dismiss(id: number): void {
  const idx = toasts.findIndex(t => t.id === id);
  if (idx === -1) return;
  clearTimeout(toasts[idx].timer);
  toasts.splice(idx, 1);
  const el = getContainer().querySelector(`[data-id="${id}"]`);
  if (el) {
    el.classList.add('toast-exit');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}

export function toast(type: ToastType, message: string): void {
  const id    = ++counter;
  const timer = setTimeout(() => dismiss(id), DURATION_MS);
  toasts.push({ id, type, message, timer });
  const el = buildElement({ id, type, message, timer });
  getContainer().appendChild(el);
  requestAnimationFrame(() => el.classList.add('toast-enter'));
}

export const showSuccess = (msg: string) => toast('success', msg);
export const showError   = (msg: string) => toast('error',   msg);
export const showWarning = (msg: string) => toast('warning', msg);
export const showInfo    = (msg: string) => toast('info',    msg);
