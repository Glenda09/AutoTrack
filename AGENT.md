# AutoTrack · Manual de instalacion y uso

Guia completa para levantar el proyecto (backend FastAPI + frontend React) con Docker o en local, incluyendo herramientas y comandos clave.

## Requisitos globales
- Docker y Docker Compose (opcional, recomendado para levantar todo).
- Sin contenedores:
  - Python 3.11 y Poetry 1.8.3.
  - MySQL 8.x.
  - Node.js >= 18 (recomendado 20.x) y npm.

## Estructura rapida
- backend/: API FastAPI, migraciones Alembic, seeds.
- frontend/: Vite + React.
- docker-compose.yml: stack completo (db, api, web).
- autotrack.postman_collection.json: coleccion de pruebas manuales.

## Variables de entorno
- Backend (`backend/.env`, parte en `backend/.env.example`):
  - APP_NAME, API_PREFIX, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES
  - MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB
  - CORS_ORIGINS, LOG_LEVEL
  - En Docker `MYSQL_HOST=db`; en local tipicamente `localhost`.
- Frontend (`frontend/.env` opcional):
  - VITE_API_BASE_URL (default interno: http://localhost:8000/api/v1)

## Opcion 1: Docker Compose (stack completo)
1) Copia el env del backend: `cp backend/.env.example backend/.env` y ajusta si hace falta.
2) Levanta todo: `docker-compose up --build`.
   - Servicios: MySQL (3306), API (8000), Vite (5173).
   - El contenedor API corre `alembic upgrade head`, siembra `app.seeds.seed_data` y arranca Uvicorn.
3) Accesos:
   - API: http://localhost:8000/api/v1 (docs en http://localhost:8000/docs).
   - Web: http://localhost:5173.
4) Detener/limpiar: `docker-compose down` (agrega `-v` para borrar volumen de datos).

## Opcion 2: Instalacion local (sin Docker)
### Backend (`backend/`)
1) Dependencias del SO para mysqlclient (Linux): `sudo apt-get install build-essential default-libmysqlclient-dev pkg-config`. En Windows/macOS instala MySQL client y headers equivalentes.
2) Entorno: copia `backend/.env.example` a `backend/.env` y ajusta credenciales/host.
3) Instala deps: `cd backend && poetry install`.
4) Prepara base de datos MySQL:
   - Crea la base: `CREATE DATABASE autotrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
   - Revisa que `MYSQL_USER/MYSQL_PASSWORD` tengan permisos sobre esa base.
5) Migraciones: `poetry run alembic upgrade head`.
6) Seeds (elige una):
   - Dataset completo: `poetry run python -m app.seeds.seed_data`.
   - Dataset minimo ABD: `poetry run python -m app.seeds.seed_abd_minimos`.
   - Accesos de prueba (seed_data): `admin/admin123`, `supervisor/supervisor123`, `mecanico/mecanico123`, `facturacion/facturacion123`, `inventario/inventario123`, `cliente_portal/cliente123`.
7) Servidor dev: `poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`.
8) Pruebas: `poetry run pytest`.
9) Extras base de datos: scripts SQL manuales en `backend/sql/` (creacion, vistas, funciones, procedimientos, triggers, seed SQL).
10) Migraciones nuevas: `poetry run alembic revision --autogenerate -m "descripcion"` y luego `poetry run alembic upgrade head`.

### Frontend (`frontend/`)
1) Instala deps: `cd frontend && npm install` (o `npm ci` para reproducibilidad exacta).
2) Configura API si difiere: crea `frontend/.env` con `VITE_API_BASE_URL=http://localhost:8000/api/v1`.
3) Dev server: `npm run dev -- --host --port 5173` (abre en http://localhost:5173).
4) Lint: `npm run lint`.
5) Build prod: `npm run build` (salida en `frontend/dist/`); vista previa: `npm run preview`.

## Uso rapido
- Salud API: `GET /health`.
- OpenAPI/Swagger: http://localhost:8000/docs.
- Base API por defecto: http://localhost:8000/api/v1.
- Frontend consume `VITE_API_BASE_URL`; al no definirlo usa `http://localhost:8000/api/v1`.

## Herramientas y tips
- Poetry: gestiona deps backend (`pyproject.toml`).
- Alembic: migraciones en `alembic/versions` y `app/db/migrations/versions`; configura conexion en `app/core/config.py` via env.
- Seeds Python: `app/seeds/seed_data.py` (dataset completo) y `app/seeds/seed_abd_minimos.py` (dataset compacto).
- Seeds SQL y utilidades: `backend/sql/` (00_create_database.sql, 01_schema_patch.sql, etc).
- Postman: usa `autotrack.postman_collection.json` para probar endpoints.

## Puertos por defecto
- API: 8000
- Frontend: 5173
- MySQL: 3306

## Problemas comunes
- Puerto en uso: cambia `--port` en uvicorn o `npm run dev -- --port 5174`.
- mysqlclient falla al compilar: instala headers/client de MySQL (ver paso de dependencias del SO) y asegurate de tener un compilador.
- CORS: ajusta `CORS_ORIGINS` en `backend/.env` si usas otro host/puerto para el frontend.
- Auth 401 desde frontend: revisa `VITE_API_BASE_URL` y tokens almacenados; la app borra token y redirige a `/login` en 401.
