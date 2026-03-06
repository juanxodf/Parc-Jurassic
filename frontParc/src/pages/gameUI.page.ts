import { getUser, clearSession, isAuthenticated } from '../models/auth.model.ts';
import { logoutRequest } from '../providers/auth.provider.ts';
import { getCeldas } from '../providers/celdas.provider.ts';
import { getTareas, iniciarTarea, finalizarTarea, createTarea } from '../providers/tareas.provider.ts';
import { getEcho, isRealtimeEnabled } from '../echo.ts';
import { ROUTES, NIVEL_PELIGROSIDAD_LABEL, ESTADO_TAREA_LABEL } from '../constantes.ts';
import type { Celda, Tarea } from '../types/index.ts';

let selectedCelda: Celda | null = null;
let allTareas: Tarea[] = [];

export async function initGameUI(): Promise<void> {
  if (!isAuthenticated()) {
    window.location.href = ROUTES.LOGIN;
    return;
  }

  renderNavbar();
  setupLogout();
  await loadGrid();
  subscribeRealtime();
}

function renderNavbar(): void {
  const user = getUser();
  const nameEl = document.getElementById('navbar-user-name');
  const roleEl = document.getElementById('navbar-user-role');
  const navbarUser = document.querySelector('.navbar-user');
  if (nameEl && user) nameEl.textContent = user.name;
  if (roleEl && user) roleEl.textContent = user.role;
  if (user?.role === 'admin' && navbarUser && !document.getElementById('admin-link')) {
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

async function loadGrid(): Promise<void> {
  const gridEl = document.getElementById('celda-grid');
  if (!gridEl) return;

  gridEl.innerHTML = '<p class="loader">Cargando mapa...</p>';

  const [celdas, tareas] = await Promise.all([
    getCeldas().catch(() => [] as Celda[]),
    getTareas().catch(() => [] as Tarea[]),
  ]);

  allTareas = tareas;
  gridEl.innerHTML = '';

  if (celdas.length === 0) {
    gridEl.innerHTML = '<p class="loader">Sin celdas registradas.</p>';
    return;
  }

  celdas.forEach(celda => {
    const card = buildCeldaCard(celda);
    card.addEventListener('click', () => selectCelda(celda));
    gridEl.appendChild(card);
  });
}

function buildCeldaCard(c: Celda): HTMLElement {
  const div = document.createElement('div');
  div.className = `celda-card estado-${c.estado}`;
  div.dataset['celdaId'] = String(c.id);

  const dinos = c.dinosaurios ?? [];

  div.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <span class="celda-nombre">${c.nombre}</span>
      <div class="celda-estado-dot"></div>
    </div>
    <span class="celda-dinos">${dinos.length} dinos</span>
    <span style="font-size:9px;color:var(--color-muted)">Seg. ${c.nivel_seguridad}</span>`;

  return div;
}

function selectCelda(celda: Celda): void {
  selectedCelda = celda;

  document.querySelectorAll('.celda-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`[data-celda-id="${celda.id}"]`)?.classList.add('selected');

  renderCeldaDetail(celda);
  renderTareasCelda(celda.id);
  renderAddTareaForm(celda.id);
}

function renderCeldaDetail(c: Celda): void {
  const el = document.getElementById('celda-detail');
  if (!el) return;

  const dinos = c.dinosaurios ?? [];

  el.innerHTML = `
    <div class="celda-detail">
      <h3>${c.nombre}</h3>
      <div class="stat-row"><span class="stat-label">Estado</span><span>${c.estado}</span></div>
      <div class="stat-row"><span class="stat-label">Seguridad</span><span>${c.nivel_seguridad}/10</span></div>
      <div class="stat-row"><span class="stat-label">Alimento</span><span>${c.cantidad_alimento}%</span></div>
      <div class="stat-row"><span class="stat-label">Averías</span><span>${c.averias_pendientes}</span></div>
      ${c.notas ? `<div class="stat-row"><span class="stat-label">Notas</span><span>${c.notas}</span></div>` : ''}
    </div>
    ${dinos.length > 0 ? `
      <div style="margin-top:16px">
        <p class="section-title">Dinosaurios</p>
        ${dinos.map(d => `
          <div class="dino-list-item">
            <span><strong>${d.nick}</strong> <span style="color:var(--color-muted)">${d.raza}</span></span>
            <span style="font-size:11px">${NIVEL_PELIGROSIDAD_LABEL[d.nivel_peligrosidad] ?? d.nivel_peligrosidad}</span>
          </div>`).join('')}
      </div>` : ''}`;
}

function renderTareasCelda(celdaId: number): void {
  const el = document.getElementById('tareas-celda');
  if (!el) return;

  const tareas = allTareas.filter(t => t.celda_id === celdaId);

  el.innerHTML = `<p class="section-title">Tareas de la celda</p>`;

  if (tareas.length === 0) {
    el.innerHTML += '<p style="font-size:12px;color:var(--color-muted)">Sin tareas.</p>';
    return;
  }

  el.innerHTML += tareas.map(t => `
    <div class="tarea-item">
      <div class="tarea-titulo">${t.descripcion ?? 'Tarea sin descripción'}</div>
      <div class="tarea-meta">${ESTADO_TAREA_LABEL[t.estado] ?? t.estado} · ${t.tipo}</div>
      <div class="tarea-actions">
        ${t.estado === 'pendiente'
          ? `<button class="btn-ghost" style="padding:4px 8px;font-size:11px" data-iniciar="${t.id}">Iniciar</button>`
          : t.estado === 'en_progreso'
          ? `<button class="btn-primary" style="padding:4px 8px;font-size:11px" data-finalizar="${t.id}">Finalizar</button>`
          : '<span style="font-size:11px;color:var(--color-primary)">✓ Finalizada</span>'}
      </div>
    </div>`).join('');

  el.querySelectorAll<HTMLButtonElement>('[data-iniciar]').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      await iniciarTarea(parseInt(btn.dataset['iniciar']!)).catch(() => {});
      await refreshTareas(celdaId);
    });
  });

  el.querySelectorAll<HTMLButtonElement>('[data-finalizar]').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      await finalizarTarea(parseInt(btn.dataset['finalizar']!)).catch(() => {});
      await refreshTareas(celdaId);
    });
  });
}

async function refreshTareas(celdaId: number): Promise<void> {
  allTareas = await getTareas().catch(() => allTareas);
  renderTareasCelda(celdaId);
}

function renderAddTareaForm(celdaId: number): void {
  const el = document.getElementById('add-tarea-form');
  if (!el || el.dataset['bound']) return;
  el.dataset['bound'] = '1';

  el.classList.remove('hidden');

  el.querySelector('form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const btn  = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
      const user = getUser();
      await createTarea({
        descripcion: data.get('descripcion') as string,
        tipo:        data.get('tipo') as Tarea['tipo'],
        celda_id:    celdaId,
        user_id:     user?.id,
      });
      form.reset();
      await refreshTareas(celdaId);
    } catch {
      // silently fail
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

function subscribeRealtime(): void {
  if (!isRealtimeEnabled()) return;
  try {
    const echo = getEcho();

    echo.channel('celdas').listen('.celda.updated', async () => {
      await loadGrid();
      if (selectedCelda) {
        const celdas = await getCeldas().catch(() => [] as Celda[]);
        const updated = celdas.find(c => c.id === selectedCelda!.id);
        if (updated) selectCelda(updated);
      }
    });

    echo.channel('tareas').listen('.tarea.updated', async () => {
      allTareas = await getTareas().catch(() => allTareas);
      if (selectedCelda) renderTareasCelda(selectedCelda.id);
    });
  } catch {
    // Echo no disponible, modo sin realtime
    console.warn('Realtime no disponible. Continuando en modo offline.');
  }
}
