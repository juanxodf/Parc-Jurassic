import './styles/global.css';
import './styles/layout.css';

import { isAuthenticated } from './models/auth.model.ts';
import { ROUTES } from './constantes.ts';

const path = window.location.pathname;

if (path === '/' || path === '/index.html') {
  window.location.replace(ROUTES.LOGIN);
}

const PRIVATE: string[] = [ROUTES.LOBBY, ROUTES.ADMIN, ROUTES.GAME, '/profile.html'];
if (PRIVATE.includes(path) && !isAuthenticated()) {
  window.location.replace(ROUTES.LOGIN);
}

async function boot(): Promise<void> {
  if (path.includes('indexUI')) {
    const { initLoginForm } = await import('./pages/login.page.ts');
    // el ?inline es una convención para indicar que queremos el contenido del archivo como string, en lugar de su URL
    const { default: css }  = await import('./styles/login.css?inline');
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

  if (path.includes('profile')) {
    const { initProfile } = await import('./pages/profile.page.ts');
    await initProfile();
    return;
  }
}

function injectStyle(css: string): void {
  const style       = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

boot().catch(console.error);
