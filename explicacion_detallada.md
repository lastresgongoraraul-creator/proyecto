# Explicación Detallada de la Arquitectura del Proyecto

Este documento está diseñado para ser tu "mapa del tesoro" definitivo. Si en algún momento te sientes perdido navegando por las carpetas o no entiendes cómo se comunican las distintas piezas del proyecto, vuelve aquí. 

Hemos dividido el proyecto en **Microservicios**. En lugar de tener un solo programa gigante que hace todo (lo que se llama un monolito), tenemos pequeños programas especializados que hablan entre ellos. Esto hace que el código sea más limpio, más seguro y más fácil de escalar.

A continuación, analizaremos cada bloque estructural, qué hace y por qué es importante.

---

## 1. El Orquestador Global (Raíz del Proyecto)

La carpeta raíz (`/`) es el centro de control. Desde aquí se levanta todo el ecosistema con un solo comando.

*   `docker-compose.yml`: Es el director de orquesta. Define los 6 contenedores principales del ecosistema (Frontend, Gateway, Backend, AI, Chat y Base de Datos) y cómo se conectan en una red privada virtual llamada `app-network`. Gracias a esto, los servicios pueden hablar entre sí usando sus nombres (ej: el backend se conecta a la base de datos llamándola `postgres-db` en lugar de una IP complicada).
*   `generate_100_games.py`: Un pequeño script "salvavidas" que escribimos para llenar rápidamente la base de datos con información realista y vectores matemáticos. Así no tienes que introducir datos a mano cada vez que reinicias la base de datos.
*   `guia_estilos.md`: El manual de diseño visual de la interfaz.

---

## 2. API Gateway (`/api-gateway/`) - *El Portero de la Discoteca*

**Tecnología**: Nginx (Un servidor web súper rápido).

Piensa en el API Gateway como el portero de un edificio de oficinas corporativo. El usuario nunca habla directamente con los empleados (los microservicios); siempre habla con el portero, y el portero redirige la petición al departamento correcto.

*   **¿Qué hace?**: 
    1. Unifica todo en un solo puerto (`:80`). El navegador web del usuario cree que está hablando con un solo servidor gigante.
    2. Recibe peticiones a `/api/...` y se las envía al **Backend** (Java).
    3. Recibe peticiones a `/socket.io/...` y se las envía al **Chat Service** (Node.js).
    4. El resto de las peticiones normales (como abrir la web) se las manda al **Frontend**.
*   **¿Por qué es vital?**: Resuelve el temido problema de "CORS" (Cross-Origin Resource Sharing) en los navegadores. Al unificar todo bajo una misma URL de origen, el navegador no bloquea por seguridad las peticiones cruzadas.
*   **Archivos clave**: `nginx.conf` contiene las rutas (location) que definen hacia dónde va cada petición.

---

## 3. Backend Principal (`/backend/`) - *El Cerebro Lógico y Transaccional*

**Tecnología**: Java 21, Spring Boot, Spring Security, Hibernate.

Este es el corazón tradicional de la aplicación. Maneja las cuentas de usuario, el catálogo de videojuegos, las reseñas y las amistades. Es el servicio más estricto y seguro de todos.

*   **¿Qué hace?**: Lee y escribe permanentemente en la base de datos PostgreSQL. Valida contraseñas, genera tokens de seguridad JWT y se asegura de que nadie haga trampa (por ejemplo, validando que no intentes borrar una reseña que no es tuya).
*   **Estructura Interna**:
    *   `/controller/`: Las "ventanillas de atención al público". Reciben peticiones HTTP desde el frontend (ej. "Dame la lista de juegos" en `GameController.java`).
    *   `/service/`: Los "trabajadores de trastienda". Contienen la lógica compleja (cálculos matemáticos de medias de reseñas, lógica de añadir amigos).
    *   `/model/`: Plantillas (Entidades) que mapean exactamente cómo es una tabla en la base de datos (ej. `User.java` representa la tabla `users`).
    *   `/security/`: Los guardias de seguridad internos. Aquí está el `JwtTokenProvider` que cifra los accesos, y el `RateLimitFilter` (basado en Bucket4j) que bloquea a los usuarios maliciosos que intentan tumbar el servidor haciendo miles de peticiones por segundo.
    *   `/resources/db/migration/`: Archivos SQL (Flyway) que crean las tablas automáticamente cuando el programa arranca por primera vez.

---

## 4. Servicio de Chat (`/chat-service/`) - *El Operador de Telecomunicaciones*

**Tecnología**: Node.js, Socket.io.

¿Por qué separamos el chat del backend de Java? Porque el chat necesita comunicarse en **Tiempo Real** a través de canales bidireccionales permanentes (WebSockets). Node.js es estructuralmente mucho más ligero y rápido gestionando miles de conexiones simultáneas sin bloquearse.

*   **¿Qué hace?**: Mantiene a los usuarios conectados a las "Salas de Comunidad". Cuando alguien escribe un mensaje, este servicio lo recibe y lo reparte instantáneamente (en milisegundos) a todos los demás usuarios que están en esa misma sala viendo la pantalla.
*   **Estructura Interna**:
    *   `socket.js` (o similar): Mantiene las conexiones activas, detecta cuando alguien se conecta ("en línea") o se desconecta.
    *   **Comunicación interna**: Este servicio, antes de enviar un mensaje delicado, envía una consulta HTTP secreta (por detrás) al servicio de IA (`/ai-service`) para preguntarle: *"Oye, ¿este mensaje es tóxico o es un insulto?"*. Si la IA dice que sí, el servicio de chat bloquea el mensaje.

---

## 5. Servicio de Inteligencia Artificial (`/ai-service/`) - *El Analista Matemático*

**Tecnología**: Python, FastAPI, HuggingFace Transformers, Base de datos Vectorial (pgvector).

Python es el rey indiscutible de la inteligencia artificial. Java no es bueno para esto, por eso hemos aislado todo el cálculo pesado de IA en este pequeño y potente contenedor.

*   **¿Qué hace?**: 
    1. **Búsqueda Semántica**: Cuando buscas "juego de tiros en el espacio", este servicio convierte esa frase en un "Vector" (una lista gigante de coordenadas matemáticas). Luego compara esas coordenadas con las descripciones de los juegos en la base de datos usando geometría para encontrar el más similar (aunque no hayas usado las palabras exactas).
    2. **Moderación de Texto**: Analiza si un mensaje de chat es agresivo o spam devolviendo una probabilidad matemática.
    3. **Análisis de Sentimiento**: Lee todas las reseñas escritas sobre un juego y determina si, en general, el público está feliz o enfadado con el título.
*   **Archivos clave**: `main.py` y los controladores de FastAPI exponen rutas web internas para que el Backend (Java) o el Chat (Node) le hagan preguntas. **Importante**: El frontend nunca habla con la IA directamente, siempre es a través del backend por seguridad.

---

## 6. Frontend (`/frontend/`) - *El Escaparate Interactívo*

**Tecnología**: React, Vite, TypeScript, TailwindCSS.

Esta es la aplicación que el usuario descarga en su navegador. Es un programa por sí mismo (Single Page Application). Pide los datos al backend y "dibuja" la interfaz en la pantalla de forma reactiva.

*   **¿Qué hace?**: Renderiza el diseño visual, gestiona las pulsaciones de botones, navega entre pantallas sin recargar la página web, y mantiene la sesión del usuario guardada de forma segura en la memoria del navegador.
*   **Estructura Interna**:
    *   `/src/api/axios.ts`: Probablemente el archivo de fontanería más importante. Configura cómo se hacen las peticiones a la API. Incluye "interceptores" que vigilan si el token de seguridad del usuario ha caducado, y automáticamente (sin que el usuario se entere) piden un token de refresco (`Refresh Token`) para mantener la sesión abierta.
    *   `/src/context/`: Aquí guardamos los datos que toda la aplicación necesita saber en todo momento (Ej. ¿Quién está logueado ahora mismo? -> `AuthContext.tsx`).
    *   `/src/components/`: Las piezas de LEGO reutilizables de nuestra app (Tarjetas de juegos, botones, barras de navegación).
    *   `/src/pages/`: Las pantallas completas que se montan uniendo varios componentes (La página de inicio, la pantalla del chat, etc).
    *   `/src/index.css`: El archivo de diseño donde se declara toda la paleta de colores, degradados interactivos y el comportamiento Responsive (adaptación a móviles) mediante Tailwind CSS.

---

### En resumen: El Flujo de Vida de una Petición

Para entenderlo de forma práctica, imagina que el usuario escribe un mensaje en la Sala de Chat de un juego:

1. El **Frontend (React)** captura la pulsación de la tecla "Enter" y envía el texto por WebSocket.
2. El **API Gateway (Nginx)** ve la conexión de WebSocket y la enruta directamente al contenedor del **Chat-Service (Node.js)**.
3. El **Chat-Service** recibe el mensaje. Antes de publicarlo, hace una llamada secreta HTTP al **AI-Service (Python)**.
4. El **AI-Service** analiza las palabras, determina que es seguro (0% toxicidad) y responde "OK".
5. El **Chat-Service** emite un "evento de difusión" a todos los ordenadores conectados a esa sala.
6. Al mismo tiempo, el **Chat-Service** llama al **Backend (Java)** para guardar el mensaje en el disco duro.
7. El **Backend** escribe la fila en la tabla correspondiente de la **Base de Datos (PostgreSQL)** para que perdure.
8. Los ordenadores de los demás usuarios (en su propio **Frontend**) reciben la señal de Node.js y pintan la nueva burbuja de texto en la pantalla, reproduciendo una animación fluida dictada por **TailwindCSS**.
