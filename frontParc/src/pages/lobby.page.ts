import { getUser, clearSession, isAuthenticated } from '../models/auth.model.ts';
import { logoutRequest } from '../providers/auth.provider.ts';
import { getTareas, iniciarTarea, finalizarTarea } from '../providers/tareas.provider.ts';
import { getDinosaurios } from '../providers/dinosaurios.provider.ts';
import { getCeldas } from '../providers/celdas.provider.ts';
import { ROUTES, NIVEL_PELIGROSIDAD_LABEL, ESTADO_TAREA_LABEL } from '../constantes.ts';
import type { Tarea, Dinosaurio, Celda } from '../types/index.ts';

export async function initLobby(): Promise<void> {
  if (!isAuthenticated()) {
    window.location.href = ROUTES.LOGIN;
    return;
  }

  renderNavbar();
  setupLogout();

  await Promise.all([loadResumen(), loadMisTareas()]);
}

function renderNavbar(): void {
  const user = getUser();
  if (!user) return;
  const nameEl = document.getElementById('navbar-user-name');
  const roleEl = document.getElementById('navbar-user-role');
  const navbarUser = document.querySelector('.navbar-user');
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role;
  if (user.role === 'admin' && navbarUser && !document.getElementById('admin-link')) {
    const adminLink = document.createElement('a');
    adminLink.id = 'admin-link';
    adminLink.href = ROUTES.ADMIN;
    adminLink.textContent = 'Admin';
    navbarUser.insertBefore(adminLink, document.getElementById('logout-btn'));
  }
}

function setupLogout(): void {
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await logoutRequest().catch(() => {});
    clearSession();
    window.location.href = ROUTES.LOGIN;
  });
}

async function loadResumen(): Promise<void> {
  const [celdas, dinos] = await Promise.all([getCeldas(), getDinosaurios()]);

  setCount('resumen-celdas', celdas.length);
  setCount('resumen-dinos', dinos.length);
  setCount('resumen-avisos', calcAvisos(celdas, dinos));
}

function calcAvisos(celdas: Celda[], dinos: Dinosaurio[]): number {
  const cMan = celdas.filter(c => c.estado === 'mantenimiento').length;
  const dEnf = dinos.filter(d => d.estado === 'enfermo' || d.estado === 'herido').length;
  return cMan + dEnf;
}

async function loadMisTareas(): Promise<void> {
  const user = getUser();
  const container = document.getElementById('mis-tareas-list');
  if (!container) return;

  container.innerHTML = '<p class="loader">Cargando tareas...</p>';

  try {
    const todas = await getTareas();
    const misTareas = todas.filter(t => t.user_id === user?.id || !t.user_id);

    if (misTareas.length === 0) {
      container.innerHTML = '<p class="loader">Sin tareas asignadas.</p>';
      return;
    }

    container.innerHTML = misTareas.map(t => renderTareaCard(t)).join('');
    bindTareaButtons(container);
  } catch {
    container.innerHTML = '<p class="loader" style="color:var(--color-danger)">Error al cargar tareas.</p>';
  }
}

function renderTareaCard(t: Tarea): string {
  const acciones = t.estado === 'pendiente'
    ? `<button class="btn-ghost" data-action="iniciar" data-id="${t.id}">Iniciar</button>`
    : t.estado === 'en_progreso'
    ? `<button class="btn-primary" data-action="finalizar" data-id="${t.id}">Finalizar</button>`
    : '';

  return `
    <div class="card" style="margin-bottom:12px">
      <div class="flex-row" style="justify-content:space-between;margin-bottom:8px">
        <strong>${t.descripcion ?? 'Tarea sin descripción'}</strong>
        <span class="badge badge-gray">${t.tipo}</span>
      </div>
      <div style="font-size:12px;color:var(--color-muted);margin-bottom:8px">
        ${ESTADO_TAREA_LABEL[t.estado] ?? t.estado} · ${t.tipo} · ${t.celda?.nombre ?? 'Sin celda'}
      </div>
      <div class="flex-row">${acciones}</div>
    </div>`;
}

function bindTareaButtons(container: HTMLElement): void {
  container.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset['id'] ?? '0');
      const action = btn.dataset['action'];
      btn.disabled = true;
      try {
        if (action === 'iniciar') await iniciarTarea(id);
        if (action === 'finalizar') await finalizarTarea(id);
        await loadMisTareas();
      } catch {
        btn.disabled = false;
      }
    });
  });

  // Renderizar lista resumen de peligrosidad
  renderDinoResumen();
}

async function renderDinoResumen(): Promise<void> {
  const container = document.getElementById('dino-peligro-list');
  if (!container) return;

  const dinos = await getDinosaurios().catch(() => []);
  const peligrosos = dinos
    .filter(d => ['extremo', 'critico', 'muy_alto'].includes(d.nivel_peligrosidad))
    .slice(0, 5);

  if (peligrosos.length === 0) {
    container.innerHTML = '<p style="font-size:12px;color:var(--color-muted)">Sin alertas críticas.</p>';
    return;
  }

  container.innerHTML = peligrosos.map(d => `
    <div class="dino-list-item">
      <span><strong>${d.nick}</strong> <span style="color:var(--color-muted)">(${d.raza})</span></span>
      <span style="font-size:11px">${NIVEL_PELIGROSIDAD_LABEL[d.nivel_peligrosidad] ?? d.nivel_peligrosidad}</span>
    </div>`).join('');
}

function setCount(id: string, n: number): void {
  const el = document.getElementById(id);
  if (el) el.textContent = String(n);
}
