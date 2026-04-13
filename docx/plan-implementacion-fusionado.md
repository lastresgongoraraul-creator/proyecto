# Plan de Implementación Fusionado
> Fusión estratégica de los tres planes: velocidad del Plan 1, solidez del Plan 2, rigor arquitectónico del Plan 3.

---

## Principios de diseño del plan

- **Entregar valor pronto**: las primeras semanas producen algo visible y funcional (Plan 1).
- **Stack profesional desde el inicio**: Java + Python + Docker, con decisiones arquitectónicas justificadas (Plan 2 y 3).
- **Seguridad y calidad no son fases, son transversales**: checklist de seguridad, pirámide de tests y moderación integrados desde el principio (Plan 3).
- **Evitar sobreingeniería**: Redis y optimizaciones avanzadas se introducen cuando hay una necesidad real, no como especulación (Plan 1 + Plan 3).

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React | Ecosistema maduro, compatible con todos los planes |
| Backend API | Spring Boot | Tipado fuerte, ecosistema robusto, escalable |
| IA / Recomendaciones | Python + FastAPI | scikit-learn + sentence-transformers |
| Base de datos | PostgreSQL + pgvector | Relacional + soporte embeddings |
| Mensajería en tiempo real | Socket.io (Node microservicio) | Chat completo bidireccional (ventaja exclusiva Plan 1) |
| Caché | Redis | Introducido en Fase 3, cuando hay datos reales |
| Contenerización | Docker Compose | Entorno reproducible desde el día 1 |
| CI/CD | GitHub Actions | Pipelines desde Fase 1 |
| Despliegue | Railway / Render + Vercel | Sencillo pero migrable |

---

## Estructura de fases

### Fase 0 — Fundamentos y arquitectura (Semanas 1–2)

**Objetivo:** sentar bases que no habrá que reescribir.

#### Arquitectura
- Diagrama C4 (contexto, contenedor, componente) — *Plan 3*
- Decisiones descartadas documentadas (por qué no GraphQL, por qué no MongoDB, etc.)
- Monorepo con estructura: `/frontend`, `/backend`, `/ai-service`, `/chat-service`

#### Infraestructura
- Docker Compose de desarrollo con: PostgreSQL, Redis (preparado, no usado aún), Spring Boot, FastAPI, Node chat service
- Variables de entorno centralizadas (`.env.example` completo)
- GitHub Actions: lint + build en cada PR

#### Base de datos
- Schema inicial con Flyway para migraciones versionadas
- Índices planificados desde el diseño (*no* añadidos a posteriori): `idx_games_genre`, `idx_reviews_user_id`, `idx_reviews_game_id`
- Estrategia de paginación: cursor-based desde el inicio (evita el problema de offset con grandes datasets) — *Plan 3*

#### Seguridad (checklist inicial) — *Plan 3*
- [ ] BCrypt con factor 12 para contraseñas
- [ ] JWT con refresh token (TTL corto en access token)
- [ ] Rate limiting en endpoints de auth
- [ ] Headers de seguridad (Helmet / Spring Security defaults)
- [ ] CSRF habilitado para endpoints con estado

---

### Fase 1 — Core funcional (Semanas 3–6)

**Objetivo:** producto mínimo usable. Un usuario puede registrarse, ver juegos y escribir reseñas.

#### Autenticación y usuarios
- Registro / login con JWT + refresh token
- OAuth2 con Google (preparado desde el inicio, no parchado después) — *Plan 2*
- Roles: `USER`, `MODERATOR`, `ADMIN` en base de datos desde el día 1 — *Plan 3*

#### Catálogo de juegos
- Integración con IGDB API (estructura de Docker Compose del Plan 2 como referencia)
- Endpoint de búsqueda con filtros: género, plataforma, año
- Paginación cursor-based implementada

#### Reseñas
- CRUD de reseñas con validación
- **Atención al race condition en `avg_score`**: usar `SELECT FOR UPDATE` o función PostgreSQL atómica al actualizar la media — *Plan 3 (aviso explícito)*
- Puntuación 1–10 con recalculo seguro

#### Testing — Pirámide desde Fase 1 — *Plan 3*
- Unit tests con JUnit 5 + Mockito para servicios críticos (auth, reviews)
- Integration tests con Testcontainers para repositorios
- Cobertura mínima: 70% en servicios de dominio

#### API
- Swagger / OpenAPI generado automáticamente — *Plan 2*
- Contratos de error consistentes (`ErrorResponse` estándar)

---

### Fase 2 — Social y moderación (Semanas 7–10)

**Objetivo:** plataforma social básica y moderación operativa. **La moderación no puede dejarse para después.** — *Plan 3 (aviso explícito)*

#### Chat en tiempo real — *Plan 1 (ventaja exclusiva)*
- Microservicio Node.js + Socket.io
- Mensajería privada bidireccional
- Salas por juego (chat de comunidad)
- Persistencia de mensajes en PostgreSQL

#### Sistema social
- Seguir / dejar de seguir usuarios
- Feed de actividad (reseñas recientes de usuarios seguidos)
- Notificaciones SSE para eventos que no requieren bidireccionalidad (likes, comentarios) — *Plan 2 y 3*

#### Moderación — integrada en esta fase, no pospuesta — *Plan 3*
- Flujo de reporte: usuario reporta → ticket en tabla `moderation_queue`
- Panel de moderador con acciones: `APPROVE`, `REMOVE`, `BAN_USER`
- Rol `MODERATOR` ya estaba en base de datos desde Fase 1
- Audit log de acciones de moderación

#### Seguridad (ampliación)
- [ ] Validación de inputs con Bean Validation
- [ ] Sanitización de contenido (prevención XSS en reseñas)
- [ ] Logs estructurados (JSON) con contexto de usuario — *Plan 3*

#### Tests
- E2E básico con Cypress: flujo registro → reseña → reporte
- Tests de integración para el flujo de moderación

---

### Fase 3 — Motor de IA y recomendaciones (Semanas 11–16)

**Objetivo:** recomendaciones reales basadas en comportamiento del usuario.

#### Motor de recomendaciones (Python / FastAPI) — *Plan 2 y 3*
- **Content-based filtering**: sentence-transformers sobre descripción + géneros + tags
- **Collaborative filtering**: scikit-learn con ratings de usuarios
- **Blend configurable**: peso ajustable entre CF y content-based vía parámetro
- Endpoint: `GET /recommendations/{userId}?blend=0.6`

#### Problema N+1 — *Plan 3 (aviso explícito)*
- Auditar todos los endpoints con `spring.jpa.show-sql=true` en desarrollo
- Añadir `@EntityGraph` o JOIN FETCH donde corresponda antes de exponer el motor

#### Redis — introducido ahora que hay datos reales — *Plan 3*
- Caché de recomendaciones precalculadas con TTL configurable (por defecto 6h)
- Invalidación al actualizar reseñas del usuario
- Caché de resultados de búsqueda frecuentes

#### pgvector
- Embeddings de juegos almacenados en columna `vector(384)`
- Índice HNSW para búsqueda por similitud eficiente
- Endpoint: `GET /games/{id}/similar`

#### Tests
- Tests de performance con k6: benchmark de endpoints de recomendación bajo carga — *Plan 3*
- Test de regresión: las recomendaciones para un fixture conocido no cambian

---

### Fase 4 — Pulido, escalabilidad y producción (Semanas 17–20)

**Objetivo:** producto listo para usuarios reales. Nada de deuda técnica aplazada.

#### Panel de administración — *Plan 3*
- Dashboard con métricas: usuarios activos, reseñas por día, tickets de moderación pendientes
- Gestión de usuarios: ban, promote to moderator, reset password
- Monitorización del motor de IA: distribución de scores, blend actual

#### Escalabilidad
- Revisión de todos los índices con `EXPLAIN ANALYZE` sobre datos de prueba reales
- Paginación cursor-based verificada en colecciones > 10.000 registros
- Redis hit rate monitorizando (si < 60%, ajustar TTL)

#### CI/CD completo — *Plan 3*
- Pipeline: lint → unit tests → integration tests → build → deploy a staging
- E2E en staging antes de merge a main
- Health checks y rollback automático

#### Seguridad (revisión final) — *Plan 3*
- [ ] Penetration testing básico (OWASP Top 10 checklist)
- [ ] Revisión de dependencias con `npm audit` / `./mvnw dependency-check`
- [ ] Secrets rotation documentada
- [ ] Backups automáticos de PostgreSQL verificados

#### Documentación final — *Plan 3*
- Apéndice de decisiones arquitectónicas: qué se evaluó y por qué se descartó
- Runbook de operaciones: cómo escalar cada servicio, cómo hacer rollback
- Diagrama C4 actualizado con la arquitectura real desplegada

---

## Resumen de duración

| Fase | Semanas | Entregable clave |
|---|---|---|
| Fase 0 — Fundamentos | 1–2 | Infraestructura, schema, CI básico |
| Fase 1 — Core | 3–6 | Auth, catálogo, reseñas, tests |
| Fase 2 — Social | 7–10 | Chat, feed, moderación operativa |
| Fase 3 — IA | 11–16 | Recomendaciones reales + Redis |
| Fase 4 — Producción | 17–20 | Panel admin, CI/CD completo, hardening |

**Total estimado: 20 semanas** (pragmático vs. las 26 del Plan 3 puro, sin sacrificar calidad estructural).

---

## Trampas a evitar — alertas explícitas

> Extraídas del Plan 3, que es el único que las documenta proactivamente.

1. **Race condition en `avg_score`**: nunca calcular la media en aplicación con lecturas concurrentes. Usar función SQL atómica o `SELECT FOR UPDATE`.
2. **Problema N+1**: auditar con `show-sql` antes de cada release. Un endpoint de listado de reseñas con autor es el caso más común.
3. **Moderación "para después"**: si hay contenido público, la moderación debe estar operativa antes de abrir el registro.
4. **Paginación offset**: con > 5.000 registros, `OFFSET 4000` hace full scan. Cursor-based desde el principio.
5. **JWT sin refresh token**: el access token de larga duración es deuda de seguridad. Implementar el par access/refresh desde Fase 1.
6. **Redis sin invalidación**: cachear sin estrategia de invalidación produce datos obsoletos. Definir TTL y eventos de invalidación antes de activar la caché.

---

## Decisiones descartadas y razones

| Alternativa | Razón del descarte |
|---|---|
| GraphQL | Overhead de setup para un equipo pequeño; REST + Swagger cubre las necesidades |
| MongoDB | El modelo de datos es relacional; forzar document store complica las queries de recomendación |
| Kafka | Overkill para el volumen esperado; SSE + Socket.io cubre los casos de tiempo real |
| Next.js SSR | La app es altamente interactiva; CSR con React es suficiente y más simple |
| tRPC | Acopla frontend y backend al mismo lenguaje; el stack Java/Python hace esto inviable |
