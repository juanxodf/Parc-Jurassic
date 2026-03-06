import './styles/global.css';
import './styles/layout.css';

import { isAuthenticated } from './models/auth.model.ts';
import { ROUTES } from './constantes.ts';

const path = window.location.pathname;

// Redirigir raíz al login
if (path === '/' || path === '/index.html') {
  window.location.replace(ROUTES.LOGIN);
}

// Proteger rutas privadas
const PRIVATE: string[] = [ROUTES.LOBBY, ROUTES.ADMIN, ROUTES.GAME];
if (PRIVATE.includes(path) && !isAuthenticated()) {
  window.location.replace(ROUTES.LOGIN);
}

// Cargar estilos específicos de página + inicializar
async function boot(): Promise<void> {
  if (path.includes('indexUI')) {
    const { initLoginForm } = await import('./pages/login.page.ts');
    const { default: css } = await import('./styles/login.css?inline');
    injectStyle(css);
    initLoginForm();
    return;
  }

  if (path.includes('lobby')) {
    const { initLobby } = await import('./pages/lobby.page.ts');
    await initLobby();
    return;
  }

  if (path.includes('admin')) {
    const { initAdmin } = await import('./pages/admin.page.ts');
    await initAdmin();
    return;
  }

  if (path.includes('gameUI')) {
    const { initGameUI } = await import('./pages/gameUI.page.ts');
    const { default: css } = await import('./styles/gameUI.css?inline');
    injectStyle(css);
    await initGameUI();
    return;
  }
}

function injectStyle(css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

boot().catch(console.error);
