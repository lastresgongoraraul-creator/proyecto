# Monorepo Infraestructure

Este proyecto utiliza un monorepo con servicios en React, Spring Boot, FastAPI y Node.js.

## Estructura
- `/frontend`: React (Nginx en producción)
- `/backend`: Spring Boot (Java 17)
- `/ai-service`: FastAPI (Python 3.11)
- `/chat-service`: Node.js

## Runbook de Inicio Rápido

Para levantar todo el entorno de desarrollo con un solo comando:

1. **Configurar Variables de Entorno**:
   Copia el archivo de ejemplo y ajusta según sea necesario:
   ```bash
   cp .env.example .env
   ```

2. **Levantar Infraestructura y Servicios**:
   Asegúrate de tener Docker y Docker Compose instalados. Ejecuta:
   ```bash
   docker compose up --build
   ```

---

## Tecnologías Utilizadas
- **Base de Datos**: PostgreSQL 16 con extensión `pgvector` para soporte de vectores (AI).
- **Caché**: Redis 7.
- **Orquestación**: Docker Compose.
- **CI/CD**: GitHub Actions con linting automático (ESLint, Checkstyle, Ruff).

## Desarrollo
Los servicios están configurados con healthchecks:
- El `backend` esperará a que `postgres` y `redis` estén saludables antes de iniciar.
- Todos los servicios se comunican a través de la red interna de Docker usando los nombres de servicio definidos en `docker-compose.yml`.
