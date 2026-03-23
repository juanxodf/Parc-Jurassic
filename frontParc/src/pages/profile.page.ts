import { getUser, saveSession, clearSession, isAuthenticated } from '../models/auth.model.ts';
import { getMeRequest, updateProfileRequest, logoutRequest } from '../providers/auth.provider.ts';
import { ROUTES } from '../constantes.ts';
import { showSuccess, showError, showInfo } from '../services/toast.ts';
import type { User } from '../types/index.ts';

export async function initProfile(): Promise<void> {
  if (!isAuthenticated()) {
    window.location.href = ROUTES.LOGIN;
    return;
  }
  renderNavbar();
  setupLogout();
  await loadProfile();
  setupProfileForm();
}

function renderNavbar(): void {
  const user   = getUser();
  const nameEl = document.getElementById('navbar-user-name');
  const roleEl = document.getElementById('navbar-user-role');
  if (nameEl && user) nameEl.textContent = user.name;
  if (roleEl && user) roleEl.textContent = user.role;
}

function setupLogout(): void {
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await logoutRequest().catch(() => {});
    clearSession();
    window.location.href = ROUTES.LOGIN;
  });
}

async function loadProfile(): Promise<void> {
  try {
    const user = await getMeRequest();
    const token = localStorage.getItem('jp_token') ?? '';
    saveSession(token, user);
    renderProfileData(user);
  } catch {
    showError('No se pudo cargar el perfil.');
  }
}

function renderProfileData(user: User): void {
  const nameEl  = document.getElementById('profile-name')  as HTMLInputElement | null;
  const emailEl = document.getElementById('profile-email') as HTMLInputElement | null;
  const nickEl  = document.getElementById('profile-nick');
  const roleEl  = document.getElementById('profile-role');
  const photoEl = document.getElementById('profile-photo') as HTMLImageElement | null;
  const photoPreview = document.getElementById('photo-preview') as HTMLImageElement | null;

  if (nameEl)  nameEl.value      = user.name;
  if (emailEl) emailEl.value     = user.email;
  if (nickEl)  nickEl.textContent = user.nick ?? '—';
  if (roleEl)  roleEl.textContent = user.role;

  if (photoEl) {
    const url = user.photo_url;
    if (url) {
      photoEl.src = url;
      photoEl.style.display = 'block';
    } else {
      photoEl.removeAttribute('src');
      photoEl.style.display = 'none';
    }
  }

  if (photoPreview) {
    photoPreview.removeAttribute('src');
    photoPreview.style.display = 'none';
  }
}

function setupProfileForm(): void {
  const form = document.getElementById('profile-form') as HTMLFormElement | null;
  if (!form) return;

  const photoInput    = document.getElementById('photo-input')   as HTMLInputElement | null;
  const photoPreview  = document.getElementById('photo-preview') as HTMLImageElement | null;

  photoInput?.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    if (file && photoPreview) {
      photoPreview.src          = URL.createObjectURL(file);
      photoPreview.style.display = 'block';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data     = new FormData(form);
    const btn      = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const name     = data.get('name') as string;
    const password = data.get('password') as string;
    const confirm  = data.get('password_confirmation') as string;
    const photo    = photoInput?.files?.[0];

    if (password && password !== confirm) {
      showError('Las contraseñas no coinciden.');
      return;
    }

    if (btn) btn.disabled = true;
    showInfo('Guardando cambios…');

    try {
      const updated = await updateProfileRequest(
        { name: name || undefined, password: password || undefined, password_confirmation: confirm || undefined },
        photo
      );
      const token = localStorage.getItem('jp_token') ?? '';
      saveSession(token, updated);
      renderProfileData(updated);
      renderNavbar();
      showSuccess('Perfil actualizado correctamente.');
      form.querySelector<HTMLInputElement>('[name="password"]')!.value              = '';
      form.querySelector<HTMLInputElement>('[name="password_confirmation"]')!.value = '';
      if (photoInput) photoInput.value = '';
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}
