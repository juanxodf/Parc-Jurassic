import { getUser, clearSession, isAuthenticated, isAdmin } from '../models/auth.model.ts';
import { logoutRequest } from '../providers/auth.provider.ts';
import { getUsuarios, createUsuario, deleteUsuario } from '../providers/usuarios.provider.ts';
import { getCeldas, createCelda, deleteCelda } from '../providers/celdas.provider.ts';
import { getDinosaurios, getRazas, createDinosaurio, deleteDinosaurio } from '../providers/dinosaurios.provider.ts';
import {
  getSimulaciones,
  simulacionNormal,
  simulacionBrecha,
  type ResultadoBrecha,
  type ResultadoNormal,
} from '../providers/simulaciones.provider.ts';
import { ROUTES, NIVEL_PELIGROSIDAD_LABEL } from '../constantes.ts';
import { showError, showSuccess, showInfo, showWarning } from '../services/toast.ts';
import type { User, Celda, Dinosaurio, Simulacion } from '../types/index.ts';

export async function initAdmin(): Promise<void> {
  if (!isAuthenticated() || !isAdmin()) {
    window.location.href = ROUTES.LOBBY;
    return;
  }
  renderNavbar();
  setupLogout();
  setupResultModal();
  setupTabs();
  await loadActiveTab('tab-usuarios');
}

function renderNavbar(): void {
  const user  = getUser();
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

async function loadUsuarios(): Promise<void> {
  const tbody = document.querySelector<HTMLElement>('#tab-usuarios tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" class="loader">Cargando...</td></tr>';

  try {
    const users = await getUsuarios();
    const me    = getUser();

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="loader">Sin usuarios.</td></tr>';
      setupCreateUserForm();
      return;
    }

    tbody.innerHTML = users.map((u: User) => `
      <tr>
        <td>${u.nick ?? '—'} / ${u.name}</td>
        <td>${u.email}</td>
        <td><span class="badge badge-gray">${u.role}</span></td>
        <td>
          ${u.id !== me?.id
            ? `<button class="btn-danger" style="padding:4px 10px;font-size:11px" data-delete-user="${u.id}">Eliminar</button>`
            : '<span style="color:var(--color-muted);font-size:11px">Tu cuenta</span>'}
        </td>
      </tr>`).join('');

    tbody.querySelectorAll<HTMLButtonElement>('[data-delete-user]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset['deleteUser']!);
        btn.disabled = true;
        try {
          await deleteUsuario(id);
          showSuccess('Usuario eliminado.');
          await loadUsuarios();
        } catch {
          btn.disabled = false;
        }
      });
    });
  } catch {
    tbody.innerHTML = '<tr><td colspan="4" class="loader">Error al cargar usuarios.</td></tr>';
    showError('No se pudo cargar la lista de usuarios.');
  }

  setupCreateUserForm();
}

function setupCreateUserForm(): void {
  const form = document.getElementById('create-user-form') as HTMLFormElement | null;
  if (!form || form.dataset['bound']) return;
  form.dataset['bound'] = '1';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const btn  = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      await createUsuario({
        nick:     data.get('nick') as string,
        name:     data.get('name') as string,
        email:    data.get('email') as string,
        password: data.get('password') as string,
        role: data.get('role') as 'admin' | 'veterinario' | 'mantenimiento',
      });
      form.reset();
      showSuccess('Usuario creado correctamente.');
      await loadUsuarios();
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

async function loadCeldas(): Promise<void> {
  const tbody = document.querySelector<HTMLElement>('#tab-celdas tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" class="loader">Cargando...</td></tr>';

  try {
    const celdas = await getCeldas();

    if (celdas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="loader">Sin celdas.</td></tr>';
      setupCreateCeldaForm();
      return;
    }

    tbody.innerHTML = celdas.map((c: Celda) => `
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
        const id = parseInt(btn.dataset['deleteCelda']!);
        btn.disabled = true;
        try {
          await deleteCelda(id);
          showSuccess('Celda eliminada.');
          await loadCeldas();
        } catch {
          btn.disabled = false;
        }
      });
    });
  } catch {
    tbody.innerHTML = '<tr><td colspan="5" class="loader">Error al cargar celdas.</td></tr>';
    showError('No se pudo cargar la lista de celdas.');
  }

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
        cantidad_alimento: parseFloat(data.get('cantidad_alimento') as string),
        estado:            data.get('estado') as Celda['estado'],
      });
      form.reset();
      showSuccess('Celda creada correctamente.');
      await loadCeldas();
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

async function loadDinosaurios(): Promise<void> {
  const tbody = document.querySelector<HTMLElement>('#tab-dinosaurios tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" class="loader">Cargando...</td></tr>';

  try {
    const [dinos, razasObj, celdas] = await Promise.all([getDinosaurios(), getRazas(), getCeldas()]);
    const razas = Array.isArray(razasObj) ? razasObj : Object.keys(razasObj);

    if (dinos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="loader">Sin dinosaurios.</td></tr>';
    } else {
      tbody.innerHTML = dinos.map((d: Dinosaurio) => `
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
          const id = parseInt(btn.dataset['deleteDino']!);
          btn.disabled = true;
          try {
            await deleteDinosaurio(id);
            showSuccess('Dinosaurio eliminado.');
            await loadDinosaurios();
          } catch {
            btn.disabled = false;
          }
        });
      });
    }

    populateRazasSelect(razas);
    populateCeldasSelect('dino-celda-select', celdas);
  } catch {
    tbody.innerHTML = '<tr><td colspan="5" class="loader">Error al cargar dinosaurios.</td></tr>';
    showError('No se pudo cargar la lista de dinosaurios.');
  }

  setupCreateDinoForm();
}

function populateRazasSelect(razas: string[]): void {
  const sel = document.getElementById('dino-raza-select') as HTMLSelectElement | null;
  if (!sel || sel.dataset['populated']) return;
  sel.dataset['populated'] = '1';
  sel.innerHTML = '<option value="">Selecciona una raza</option>';
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
        nick:     data.get('nick') as string,
        raza:     data.get('raza') as string,
        edad:     parseInt(data.get('edad') as string),
        estado:   data.get('estado') as Dinosaurio['estado'],
        celda_id: parseInt(data.get('celda_id') as string) || undefined,
      });
      form.reset();
      showSuccess('Dinosaurio registrado.');
      await loadDinosaurios();
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

async function loadSimulaciones(): Promise<void> {
  const tbody = document.querySelector<HTMLElement>('#tab-simulaciones tbody');

  try {
    const celdas = await getCeldas();
    populateCeldasSelect('sim-celda-select', celdas);
    setupSimulacionForm();
  } catch {
    showError('No se pudo cargar la lista de celdas.');
  }

  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" class="loader">Cargando...</td></tr>';

  try {
    const sims = await getSimulaciones();
    if (sims.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="loader">Sin simulaciones registradas.</td></tr>';
      return;
    }
    tbody.innerHTML = sims.map((s: Simulacion) => `
      <tr>
        <td>${s.id}</td>
        <td><span class="badge ${s.tipo === 'brecha' ? 'badge-red' : 'badge-green'}">${s.tipo}</span></td>
        <td>${s.celda?.nombre ?? 'Aleatoria'}</td>
        <td><span class="badge badge-gray">${s.estado ?? '—'}</span></td>
        <td style="font-size:11px;color:var(--color-muted)">${new Date(s.created_at ?? '').toLocaleString('es-ES')}</td>
        <td>
          <button
            class="btn-ghost"
            style="padding:4px 10px;font-size:11px"
            data-view-sim="${s.id}"
          >Ver</button>
        </td>
      </tr>`).join('');

    tbody.querySelectorAll<HTMLButtonElement>('[data-view-sim]').forEach(btn => {
      btn.addEventListener('click', () => {
        const simId = Number.parseInt(btn.dataset['viewSim'] ?? '0', 10);
        const sim = sims.find(item => item.id === simId);
        if (!sim) return;
        openResultModal(renderResultadoHistorial(sim));
      });
    });
  } catch {
    tbody.innerHTML = '<tr><td colspan="6" class="loader">Error al cargar simulaciones.</td></tr>';
    showError('No se pudo cargar el historial de simulaciones.');
  }
}

function setupSimulacionForm(): void {
  const form = document.getElementById('sim-form') as HTMLFormElement | null;
  if (!form || form.dataset['bound']) return;
  form.dataset['bound'] = '1';

  form.querySelectorAll<HTMLButtonElement>('[data-sim-type]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tipo    = btn.dataset['simType'] as 'normal' | 'brecha';
      const sel     = form.querySelector<HTMLSelectElement>('#sim-celda-select');
      const parsed  = parseInt(sel?.value ?? '0');
      const celdaId = Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
      const buttons = Array.from(form.querySelectorAll<HTMLButtonElement>('[data-sim-type]'));

      if (tipo === 'brecha' && !celdaId) {
        showWarning('Selecciona una celda o se elegirá una aleatoriamente.');
      }

      buttons.forEach(button => { button.disabled = true; });
      showInfo('Ejecutando simulación…');

      try {
        if (tipo === 'normal') {
          const result = await simulacionNormal(celdaId);
          openResultModal(renderResultadoNormal(result));
        }

        if (tipo === 'brecha') {
          const result = await simulacionBrecha(celdaId);
          openResultModal(renderResultadoBrecha(result));
        }

        showSuccess(`Simulación de tipo "${tipo}" completada.`);
        await loadSimulaciones();
      } finally {
        buttons.forEach(button => { button.disabled = false; });
      }
    });
  });
}

function setupResultModal(): void {
  const modal = document.getElementById('result-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal || !closeBtn || modal.dataset['bound']) return;

  modal.dataset['bound'] = '1';
  modal.classList.add('hidden');

  closeBtn.addEventListener('click', closeResultModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeResultModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeResultModal();
  });
}

function openResultModal(content: string): void {
  const modal = document.getElementById('result-modal');
  const contentEl = document.getElementById('result-modal-content');

  if (!modal || !contentEl) return;

  contentEl.innerHTML = content;
  modal.classList.remove('hidden');
}

function closeResultModal(): void {
  const modal = document.getElementById('result-modal');
  const contentEl = document.getElementById('result-modal-content');

  if (!modal || !contentEl) return;

  modal.classList.add('hidden');
  contentEl.innerHTML = '';
}

function renderResultadoNormal(result: ResultadoNormal): string {
  const rows = result.resultados.map((item) => `
    <tr>
      <td>${item.nombre}</td>
      <td>${item.fila}/${item.columna}</td>
      <td>${item.alimento_anterior} → ${item.alimento_actual}</td>
      <td>${item.averias}</td>
      <td>${item.alertas.length > 0 ? item.alertas.join(', ') : 'Sin alertas'}</td>
    </tr>
  `).join('');

  return `
    <div class="sim-result">
      <p class="section-title">Resultado de simulación normal</p>
      <div class="sim-summary">
        <span class="badge badge-green">Celdas: ${result.resumen.total_celdas}</span>
        <span class="badge ${result.resumen.requieren_atencion > 0 ? 'badge-yellow' : 'badge-gray'}">
          Requieren atención: ${result.resumen.requieren_atencion}
        </span>
      </div>
      <table>
        <thead>
          <tr><th>Celda</th><th>Posición</th><th>Alimento</th><th>Averías</th><th>Alertas</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderResultadoBrecha(result: ResultadoBrecha): string {
  const data = result.resultado;
  const dinosaurios = data.dinosaurios_en_riesgo.length > 0
    ? `
      <ul class="sim-list">
        ${data.dinosaurios_en_riesgo.map((dino) => `
          <li>${dino.nick} (${dino.raza}) - ${dino.peligrosidad}</li>
        `).join('')}
      </ul>
    `
    : '<p class="loader" style="padding:12px 0">No hay dinosaurios carnívoros implicados.</p>';

  return `
    <div class="sim-result">
      <p class="section-title">Resultado de simulación de brecha</p>
      <div class="sim-summary">
        <span class="badge ${data.fuga_ocurre ? 'badge-red' : 'badge-green'}">
          ${data.fuga_ocurre ? 'Brecha activa' : 'Brecha contenida'}
        </span>
        <span class="badge badge-gray">Estado final: ${data.estado_final}</span>
      </div>
      <div class="card" style="padding:16px;margin-bottom:16px">
        <p><strong>Celda:</strong> ${data.celda.nombre} (${data.celda.fila}/${data.celda.columna})</p>
        <p><strong>Probabilidad:</strong> ${data.probabilidad_fuga}%</p>
        <p><strong>Tirada:</strong> ${data.tirada}</p>
      </div>
      <p class="section-title">Detalles</p>
      <ul class="sim-list">
        ${data.detalles.map(detalle => `<li>${detalle}</li>`).join('')}
      </ul>
      <p class="section-title" style="margin-top:16px">Dinosaurios en riesgo</p>
      ${dinosaurios}
    </div>
  `;
}

function renderResultadoHistorial(sim: Simulacion): string {
  if (sim.tipo === 'normal') {
    const resultado = sim.resultado as {
      celdas?: ResultadoNormal['resultados'];
    };
    const resultados = resultado.celdas ?? [];

    return renderResultadoNormal({
      simulacion_id: sim.id,
      tipo: 'normal',
      resultados,
      resumen: {
        total_celdas: resultados.length,
        requieren_atencion: resultados.filter(item => item.requiere_atencion).length,
      },
    });
  }

  const resultado = sim.resultado as ResultadoBrecha['resultado'];

  return renderResultadoBrecha({
    simulacion_id: sim.id,
    resultado,
  });
}

function estadoBadge(estado: string): string {
  const map: Record<string, string> = {
    operativa:     'badge-green',
    mantenimiento: 'badge-yellow',
    brecha:        'badge-red',
    evacuada:      'badge-gray',
  };
  return map[estado] ?? 'badge-gray';
}
