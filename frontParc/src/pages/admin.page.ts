import { getUser, clearSession, isAuthenticated, isAdmin } from '../models/auth.model.ts';
import { logoutRequest } from '../providers/auth.provider.ts';
import { getUsuarios, createUsuario, deleteUsuario } from '../providers/usuarios.provider.ts';
import { getCeldas, createCelda, deleteCelda } from '../providers/celdas.provider.ts';
import { getDinosaurios, getRazas, createDinosaurio, deleteDinosaurio } from '../providers/dinosaurios.provider.ts';
import { getSimulaciones, simulacionNormal, simulacionBrecha } from '../providers/simulaciones.provider.ts';
import { ROUTES, NIVEL_PELIGROSIDAD_LABEL } from '../constantes.ts';
import type { User, Celda, Dinosaurio, Simulacion } from '../types/index.ts';
import axios from 'axios';

export async function initAdmin(): Promise<void> {
  if (!isAuthenticated() || !isAdmin()) {
    window.location.href = ROUTES.LOBBY;
    return;
  }

  renderNavbar();
  setupLogout();
  setupTabs();
  await loadActiveTab('tab-usuarios');
}

function renderNavbar(): void {
  const user = getUser();
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

function setupTabs(): void {
  document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll<HTMLElement>('.tab-panel').forEach(p => p.classList.add('hidden'));
      btn.classList.add('active');
      const target = btn.dataset['tab']!;
      document.getElementById(target)?.classList.remove('hidden');
      await loadActiveTab(target);
    });
  });
}

async function loadActiveTab(tab: string): Promise<void> {
  if (tab === 'tab-usuarios')     await loadUsuarios();
  if (tab === 'tab-celdas')       await loadCeldas();
  if (tab === 'tab-dinosaurios')  await loadDinosaurios();
  if (tab === 'tab-simulaciones') await loadSimulaciones();
}

// ── USUARIOS ──────────────────────────────────────────────────────────

async function loadUsuarios(): Promise<void> {
  const tbody = document.querySelector<HTMLElement>('#tab-usuarios tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" class="loader">Cargando...</td></tr>';

  const users = await getUsuarios().catch(() => [] as User[]);
  const me = getUser();

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td><span class="badge badge-gray">${u.role}</span></td>
      <td>
        ${u.id !== me?.id
          ? `<button class="btn-danger" style="padding:4px 10px;font-size:11px" data-delete-user="${u.id}">Eliminar</button>`
          : '<span style="color:var(--color-muted);font-size:11px">Tú</span>'}
      </td>
    </tr>`).join('');

  tbody.querySelectorAll<HTMLButtonElement>('[data-delete-user]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar usuario?')) return;
      const id = parseInt(btn.dataset['deleteUser']!);
      await deleteUsuario(id).catch(() => {});
      await loadUsuarios();
    });
  });

  setupCreateUserForm();
}

function setupCreateUserForm(): void {
  const form = document.getElementById('create-user-form') as HTMLFormElement | null;
  if (!form || form.dataset['bound']) return;
  form.dataset['bound'] = '1';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
      await createUsuario({
        nick: data.get('nick') as string,
        name: data.get('name') as string,
        email: data.get('email') as string,
        password: data.get('password') as string,
        role: data.get('role') as User['role'],
      });
      form.reset();
      await loadUsuarios();
    } catch (err) {
      alert(extractMessage(err));
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

// ── CELDAS ────────────────────────────────────────────────────────────

async function loadCeldas(): Promise<void> {
  const tbody = document.querySelector<HTMLElement>('#tab-celdas tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" class="loader">Cargando...</td></tr>';

  const celdas = await getCeldas().catch(() => [] as Celda[]);

  tbody.innerHTML = celdas.map(c => `
    <tr>
      <td>${c.nombre}</td>
      <td>${c.fila} / ${c.columna}</td>
      <td>${c.nivel_seguridad}</td>
      <td><span class="badge ${estadoBadge(c.estado)}">${c.estado}</span></td>
      <td>
        <button class="btn-danger" style="padding:4px 10px;font-size:11px" data-delete-celda="${c.id}">Eliminar</button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll<HTMLButtonElement>('[data-delete-celda]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar celda?')) return;
      await deleteCelda(parseInt(btn.dataset['deleteCelda']!)).catch(() => {});
      await loadCeldas();
    });
  });

  setupCreateCeldaForm();
}

function setupCreateCeldaForm(): void {
  const form = document.getElementById('create-celda-form') as HTMLFormElement | null;
  if (!form || form.dataset['bound']) return;
  form.dataset['bound'] = '1';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const btn  = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
      await createCelda({
        nombre:            data.get('nombre') as string,
        fila:              parseInt(data.get('fila') as string),
        columna:           parseInt(data.get('columna') as string),
        nivel_seguridad:   parseInt(data.get('nivel_seguridad') as string),
        cantidad_alimento: parseInt(data.get('cantidad_alimento') as string),
        estado:            data.get('estado') as Celda['estado'],
      });
      form.reset();
      await loadCeldas();
    } catch (err) {
      alert(extractMessage(err));
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

// ── DINOSAURIOS ───────────────────────────────────────────────────────

async function loadDinosaurios(): Promise<void> {
  const tbody = document.querySelector<HTMLElement>('#tab-dinosaurios tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" class="loader">Cargando...</td></tr>';

  const [dinos, razas, celdas] = await Promise.all([
    getDinosaurios().catch(() => [] as Dinosaurio[]),
    getRazas().catch(() => [] as string[]),
    getCeldas().catch(() => [] as Celda[]),
  ]);

  tbody.innerHTML = dinos.map(d => `
    <tr>
      <td>${d.nick}</td>
      <td>${d.raza}</td>
      <td>${d.dieta}</td>
      <td>${NIVEL_PELIGROSIDAD_LABEL[d.nivel_peligrosidad] ?? d.nivel_peligrosidad}</td>
      <td>
        <button class="btn-danger" style="padding:4px 10px;font-size:11px" data-delete-dino="${d.id}">Eliminar</button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll<HTMLButtonElement>('[data-delete-dino]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar dinosaurio?')) return;
      await deleteDinosaurio(parseInt(btn.dataset['deleteDino']!)).catch(() => {});
      await loadDinosaurios();
    });
  });

  populateRazasSelect(razas);
  populateCeldasSelect('dino-celda-select', celdas);
  setupCreateDinoForm();
}

function populateRazasSelect(razas: string[]): void {
  const sel = document.getElementById('dino-raza-select') as HTMLSelectElement | null;
  if (!sel || sel.dataset['populated']) return;
  sel.dataset['populated'] = '1';
  razas.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r; opt.textContent = r;
    sel.appendChild(opt);
  });
}

function populateCeldasSelect(id: string, celdas: Celda[]): void {
  const sel = document.getElementById(id) as HTMLSelectElement | null;
  if (!sel || sel.dataset['populated']) return;
  sel.dataset['populated'] = '1';
  celdas.forEach(c => {
    const opt = document.createElement('option');
    opt.value = String(c.id); opt.textContent = c.nombre;
    sel.appendChild(opt);
  });
}

function setupCreateDinoForm(): void {
  const form = document.getElementById('create-dino-form') as HTMLFormElement | null;
  if (!form || form.dataset['bound']) return;
  form.dataset['bound'] = '1';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const btn  = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
      await createDinosaurio({
        nick:               data.get('nick') as string,
        raza:               data.get('raza') as string,
        edad:               parseInt(data.get('edad') as string),
        estado:             data.get('estado') as Dinosaurio['estado'],
        celda_id:           parseInt(data.get('celda_id') as string) || undefined,
      });
      form.reset();
      await loadDinosaurios();
    } catch (err) {
      alert(extractMessage(err));
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

// ── SIMULACIONES ──────────────────────────────────────────────────────

async function loadSimulaciones(): Promise<void> {
  const tbody = document.querySelector<HTMLElement>('#tab-simulaciones tbody');
  const celdas = await getCeldas().catch(() => [] as Celda[]);
  populateCeldasSelect('sim-celda-select', celdas);
  setupSimulacionForm();

  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" class="loader">Cargando...</td></tr>';

  const sims = await getSimulaciones().catch(() => [] as Simulacion[]);

  if (sims.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loader">Sin simulaciones.</td></tr>';
    return;
  }

  tbody.innerHTML = sims.map(s => `
    <tr>
      <td>${s.id}</td>
      <td><span class="badge ${s.tipo === 'brecha' ? 'badge-red' : 'badge-green'}">${s.tipo}</span></td>
      <td>${s.celda?.nombre ?? 'Aleatoria'}</td>
      <td><span class="badge badge-gray">${s.estado}</span></td>
      <td style="font-size:11px;color:var(--color-muted)">${new Date(s.created_at ?? '').toLocaleString('es-ES')}</td>
    </tr>`).join('');
}

function setupSimulacionForm(): void {
  const form = document.getElementById('sim-form') as HTMLFormElement | null;
  if (!form || form.dataset['bound']) return;
  form.dataset['bound'] = '1';

  form.querySelectorAll<HTMLButtonElement>('[data-sim-type]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tipo = btn.dataset['simType'] as 'normal' | 'brecha';
      const sel  = form.querySelector<HTMLSelectElement>('#sim-celda-select');
      const parsed = parseInt(sel?.value ?? '0');
      const celdaId = Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;

      btn.disabled = true;
      try {
        if (tipo === 'normal')  await simulacionNormal(celdaId);
        if (tipo === 'brecha')  await simulacionBrecha(celdaId);
        alert('Simulación lanzada');
        await loadSimulaciones();
      } catch (err) {
        alert(extractMessage(err));
      } finally {
        btn.disabled = false;
      }
    });
  });
}

// ── Helpers ──────────────────────────────────────────────────────────

function estadoBadge(estado: string): string {
  const map: Record<string, string> = { operativa: 'badge-green', mantenimiento: 'badge-yellow', brecha: 'badge-red', evacuada: 'badge-gray' };
  return map[estado] ?? 'badge-gray';
}

function extractMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string };
    return data?.message ?? 'No se pudo completar la operación.';
  }
  return 'Ocurrió un error inesperado.';
}
