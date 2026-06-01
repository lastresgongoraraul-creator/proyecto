# GameSphere: Guía de Estilos y Sistema de Diseño (UI/UX)

Esta guía documenta el sistema de diseño visual de la plataforma GameSphere. Explica la arquitectura de la interfaz de usuario, las decisiones tomadas respecto a colores, responsividad y componentes interactivos, asegurando una experiencia profesional y unificada en toda la aplicación.

---

## 1. Fundamentos del Diseño Visual

GameSphere está diseñada con una estética "Gamer Premium", combinando fondos oscuros inmersivos, efectos de cristal difuminado (*Glassmorphism*) y colores vibrantes de acento. El objetivo es que la interfaz se sienta viva, moderna y que ceda el protagonismo visual a las portadas de los juegos.

### Paleta de Colores y Contrastes

La selección de colores se basa en generar un alto contraste jerárquico. En lugar de usar un gris plano, se utilizan tonos oscuros azulados y negros puros para crear profundidad.

*   **Fondo General (Body/Root)**
    *   *Estilo*: Degradado suave desde un tono índigo muy profundo (`#1e1b4b`) en la parte superior izquierda, hasta un casi negro (`#020617`) en la parte inferior derecha.
    *   *Por qué*: Evita la sensación de una aplicación plana. El toque de índigo oscuro se conecta sutilmente con los colores de la marca, mientras que el fondo negro descansa la vista.

*   **Cabecera (Header) y Pie de Página (Footer)**
    *   *Estilo*: Negro translúcido (`bg-black/80` y `bg-black/95`) con un desenfoque muy fuerte (`backdrop-blur-3xl`). La cabecera incluye una línea superior de 2px con un degradado de índigo a morado.
    *   *Por qué*: Separación clara entre el contenido con scroll y la navegación principal. El fondo negro puro resalta los logotipos y evita que el contenido de fondo (como imágenes o tarjetas) ensucie la lectura de los menús al hacer scroll. La línea degradada aporta el toque "gaming" distintivo.

*   **Color de Acento Principal (Botones e Interactividad)**
    *   *Estilos*: Índigo (`#4f46e5` a `#4338ca`) y degradados hacia el púrpura.
    *   *Por qué*: Es el color central de la marca. Llama la atención sobre acciones clave (unirse a salas, enviar mensajes) sin ser agresivo a la vista como un rojo o un verde puro.

---

## 2. Adaptabilidad y Diseño Responsive

La aplicación está diseñada para ser 100% fluida, garantizando una excelente experiencia de usuario tanto en monitores panorámicos como en tablets y teléfonos móviles.

### Puntos de Ruptura (Breakpoints)
El punto de corte crítico se ha establecido en **1024px (`lg`)**. Esto significa que las tablets (como los iPad en formato vertical de 768px o apaisado de 820px) recibirán la experiencia "móvil optimizada", evitando interfaces sobrecargadas.

### Resoluciones Móviles y Tablets (`< 1024px`)

1. **Navegación Principal**
   * El menú horizontal clásico se oculta a favor de un **Menú de Hamburguesa** en la esquina superior derecha. 
   * *Por qué*: Mantiene la cabecera limpia. En un iPad, mostrar 6 enlaces de texto apretados perjudica la lectura; esconderlos en un menú desplegable mejora la limpieza visual.

2. **Salas de Comunidad (Community Rooms)**
   * **Problema inicial**: Tres columnas (Comunidades, Chat, Info) comprimían el chat a un espacio inutilizable en tablets.
   * **Solución**: La zona de chat ocupa el 100% de la pantalla. Las barras laterales se ocultan y solo aparecen al pulsar los botones dedicados en la cabecera (`Menu` e `Info`). Además, la lista redundante de "Usuarios en sala" se oculta en móviles para priorizar el chat, delegando esta información al contador del título.

3. **Mensajes Directos (Sistema de Doble Panel)**
   * **Solución**: Un diseño de dos paneles excluyentes. Al abrir los mensajes en el móvil, ves únicamente la lista de contactos ocupando el 100% del ancho. Al seleccionar un chat, la lista desaparece y el chat ocupa el 100% de la pantalla. Un botón "Volver" aparece en la cabecera del chat para regresar a la lista.
   * *Por qué*: Es el estándar en aplicaciones nativas de mensajería (como WhatsApp o Telegram iOS), ofreciendo el máximo espacio para leer y escribir.

4. **Prevención de Desbordamiento (Overflow)**
   * Se fuerza el ancho máximo de la etiqueta `body` y `#root` al 100% con `overflow-x: hidden`. 
   * *Por qué*: Evita huecos blancos a la derecha que rompen el diseño inmersivo cuando un elemento es ligeramente más grande que la pantalla. El texto del título de los juegos utiliza truncado elíptico ("Inazuma Eleven...") para no deformar las cabeceras.

---

## 3. Componentes Clave de UI

### Tarjetas de Juegos (GameCards)
Las tarjetas son el principal elemento de exploración. Necesitaban sentirse táctiles y separadas del fondo.
*   **Base**: Tienen un fondo gris azulado (`bg-slate-900`) con un sutil borde translúcido (`border-white/5`). Se les ha aplicado una sombra oscura y pronunciada (`shadow-xl shadow-black/40`).
*   **Interactividad**: Al pasar el ratón (Hover), la tarjeta se eleva ligeramente (`-translate-y-1`), el borde se ilumina (`border-indigo-500/50`) y la sombra crece (`shadow-2xl`).
*   *Por qué*: La sombra base soluciona el problema de que los elementos parecieran "pegatinas" sobre el fondo oscuro. La elevación da retroalimentación física al usuario de que el elemento es interactivo o clicable.

### Botones Flotantes y Elementos Fijos
Se ha evitado el uso de estilos de CSS puro (como `display: flex !important`) en clases customizadas (`.community-room-back-btn`), favoreciendo el uso de las clases de utilidad de Tailwind.
*   *Por qué*: Esto asegura que las reglas de visibilidad (como `lg:hidden`) de Tailwind funcionen correctamente y no sean anuladas por hojas de estilo secundarias, previniendo comportamientos extraños en móviles.

---

*Desarrollado y mantenido para ofrecer la mejor experiencia visual en la comunidad GameSphere.*
