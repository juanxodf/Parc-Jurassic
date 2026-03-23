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

## Guía de uso del proyecto

Dentro de la aplicación, cada usuario podrá acceder a distintas funciones según su rol.

### Usuario autenticado

- Podrá iniciar sesión y mantener la sesión activa mediante token.
- Podrá entrar al `lobby` y ver un resumen general del parque.
- Podrá consultar el número total de celdas, dinosaurios y alertas activas.
- Podrá ver sus tareas asignadas o las tareas disponibles sin asignar.
- Podrá iniciar o finalizar tareas desde el `lobby` cuando el estado de la tarea lo permita.
- Podrá acceder al mapa de celdas y consultar el estado de cada zona del parque.
- Podrá seleccionar una celda para ver sus dinosaurios, nivel de seguridad, alimento, averías y notas.
- Podrá consultar las tareas asociadas a una celda concreta desde el mapa.
- Si tiene permisos suficientes, podrá crear tareas nuevas desde la vista del mapa.
- Podrá entrar en su perfil para cambiar el nombre, actualizar la contraseña y modificar la foto de perfil.

### Administrador

- Podrá acceder al panel de administración.
- Podrá ver los usuarios registrados, crear nuevos usuarios y eliminar cuentas que no sean la suya.
- Podrá ver las celdas disponibles, crear nuevas celdas y eliminar las existentes.
- Podrá ver los dinosaurios registrados, crear nuevos dinosaurios y eliminar individuos existentes.
- Podrá consultar las razas disponibles al registrar un dinosaurio.
- Podrá lanzar simulaciones normales para recalcular el estado de las celdas.
- Podrá lanzar simulaciones de brecha sobre una celda concreta o de forma aleatoria.
- Podrá consultar el historial de simulaciones ejecutadas.
- Podrá abrir el resultado de cada simulación en un modal y revisar su detalle.
- Podrá ver los dinosaurios disponibles en cada celda y el nivel de riesgo asociado cuando proceda.

### Simulaciones

- En una simulación normal podrá ver el estado actualizado de alimento, averías y alertas de cada celda afectada.
- En una simulación de brecha podrá ver si la fuga se contiene o si termina en desastre o caos.
- En una simulación de brecha podrá revisar la probabilidad calculada, la tirada obtenida y los dinosaurios en riesgo.
- Tras ejecutar una simulación, el resultado quedará guardado en el historial para su consulta posterior.

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
