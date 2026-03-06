# Parc-Jurassic

## Tecnologías utilizadas
- Backend: Laravel 12 (`backParc`)
- Frontend: Vite + TypeScript (`frontParc`)
- Base de datos: MySQL 8
- Auth API: Laravel Sanctum (token Bearer)  

## Arranque rápido (Docker)

Desde la raíz del repositorio:

```bash
docker compose up -d --build
```

Servicios:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`
- phpMyAdmin: `http://localhost:8080`

## Credenciales de prueba

Usuarios creados por seeder:

- Admin
  - Email: `admin@jurassicpark.com`
  - Password: `password`
- Veterinario
  - Email: `vet@jurassicpark.com`
  - Password: `password`
- Mantenimiento
  - Email: `mant@jurassicpark.com`
  - Password: `password`

## Pantallas principales

- Login/Registro: `/indexUI.html`
- Lobby: `/lobby.html`
- Panel admin: `/admin.html`
- Mapa de celdas: `/gameUI.html`

## Funcionalidades implementadas

- Autenticación y sesión por token.
- Gestión de usuarios, celdas y dinosaurios.
- Gestión de tareas (pendiente, en progreso, finalizada).
- Simulación normal y simulación de brecha con historial.
- Relaciones Eloquent con migraciones y seeders.

## Pruebas y compilación

Frontend:

```bash
cd frontParc
npm run build
```

Backend:

```bash
cd backParc
php artisan test
```

## Cliente HTTP

Puedes probar endpoints con:

- [cliente.http](/Users/juancaravantes/Documents/GitHub/Parc-Jurassic/backParc/cliente.http)
