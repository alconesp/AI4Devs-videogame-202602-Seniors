# Prompts para el desarrollo del videojuego Tiro al plato

## Assets

### Prompt inicial para generar el fondo
Agente: ChatGPT
Prompt:

![Boceto](./assets-prompts/campo-de-tiro.png)
![Hyper-Sport-2](./assets-prompts/hyper-sport-2.jpg)

Voy a realizar un video juego en el que jugaremos al tiro al plato. Crea una imagen en la que se vea una pista profunda de tiro al plato. Al fondo del campo de tiro habrá unas montañas. El campo de tiro tendrá dos rampas de lanzamiento de discos, una a la derecha y otra a la izquieda que apuntarán a izquierda y derecha respectivamente, ya que los discos que se lanzarán en horizontal, de derecha a izquierda y de izquierda a derecha.. En la parte de abajo de la imagen, tendremos un espacio en el que se colocará el jugador. En la parte de abajo a la derecha, tendremos un marcador de tiempo en el que se indicará lo que queda para terminar la ronda.  El estilo de la imagen debe ser similar al colorido de los juegos de los ochenta, aunque con calidad mejorada. No incluyas ningún elemento de los que aparecen en las imágenes que adjunto. Úsalas para tener una idea de lo que busco. No incluyas en la imagen los discos, ya que se generarán en el juego, ni la escopeta, ni al personaje. El marcador de tiempo tampoco debería de llevar ningún valor. La imagen la queremos para usarla de fondo y nosotros incluir los elementos móviles.

Resultados:

![Resultado 1](./assets-prompts/resultado-1.png)
![Resultado 2](./assets-prompts/resultado-2.png)

### Prompt para refinar un poco el fondo

Agente: ChatGPT
Prompt:

Usando esta imagen como base, ¿puedes crear una versión algo menos retro? Que contenga los mismos elementos, la misma disposición, pero con un aspecto más actualizado y mejor definición

Resultado:

![Resultado final del fondo](./assets-prompts/resultado-fondo.png)

### Prompt para generar el tirador

Agente: ChatGPT

Proceso:

He intentado generar las imágenes para el personaje y no he llegado a conseguir nada que me llegase a gustar. Además, no he sabido proporcionar el prompt adecuado y no ha sabido interpretar lo que le pedía por lo que todos los diseños incluían fallos que no me han permitido incluir los assets.

Al final, he ido a Nano Banana 2 con el siguiente prompt:

Necesito crear unos sprites para un juego que estoy creando de tiro al plato. Fíjate en la imagen que adjunto para utilizar el mismo estilo visual. Sigue el esquema que adjunto para crear el personaje en sus distintas posiciones. Las posiciones son las siguientes:
- Cuerpo y cabeza mirando norte-noreste y con la escopeta apuntando norte-noreste
- Cuerpo y cabeza mirando norte y con la escopeta mirando al norte
- Cuerpo y cabeza mirando norte-noroeste y con la escopeta mirando norte-noroeste
- Cuerpo mirando al norte y cabeza mirando al norte-noreste. No debe aparecer la escopeta.
- Cuerpo mirando al norte y cabeza mirando al norte-noroeste. No debe aparecer la escopeta.
- Cuerpo y cabeza mirando al norte. Brazo derecho arriba con el puño cerrado
- Cuerpo y cabeza mirando al norte. Brazo derecho a media altura con el puño cerrado

Resultado:

![Tirador](./assets-prompts/tirador.jpeg)

## Definición del proyecto

### Prompt inicial para generar una descripción básica de la funcionalidad

Agente: Gemini Razonamiento

Como Product Manager experto en desarrollo de videjuegos usando html y javascript

Vamos a desarrollar un videjuego de tipo al plato.

A Grandes rasgos, el juego constará de una pantalla inicial de bienvenida. En esa pantalla tendremos dos opciones, iniciar una nueva partida o ver las puntuaciones más altas.

La pantalla de bienvenida consta de un fondo, el mismo fondo que se utilizará para el juego, y una popup en el centro en el que se mostrarán las opciones.

Cuando el usuario pulse en ver las puntuaciones más altas, el popup central mostrará el listado de puntuaciones y nombres (tres letras por nombre) de las personas que realizaron esas puntuaciones. Debe aparece aquí un botón para volver atrás.

Cuando el usuario pulse en iniciar el juego, el popup desaparecerá, se mostrará el fondo y se mostrará el personaje del jugador. Y aquí empezará la mecánica del juego, que definiremos en detalle más adelante. Al terminar el juego, si ha conseguido estar entre las 10 puntuaciones más altas, aparecerá un popup que le permitirá introducir sus iniciales. Este popup mostrará todas las puntuaciones, y estará listo para poner las letras en la línea correspondiente, al estilo de los juegos de arcade antiguos.

Genera una descripción detallada del plan de implementación de este videojuego. Sugiere posibles frameworks que podríamos utilizar para su desarrollo, siempre que el uso de un framework javascript nos pueda ayudar a acelerar el desarrollo del juego y simplifique las siguientes fases.

Resultado:

¡Excelente concepto! Como tu Product Manager, me encanta la dirección que estás tomando. Los juegos "al plato" (estilo *skeet shooting* o *duck hunt*) son perfectos para la web porque dependen de una mecánica de entrada simple pero altamente adictiva.

Para que esto sea un éxito y no se convierta en un "espagueti" de código, necesitamos una estructura sólida. Aquí tienes el plan de implementación detallado y las herramientas recomendadas.

---

#### 1. Stack Tecnológico y Frameworks

Aunque podrías hacerlo con JavaScript "puro" (Vanilla) y la API de Canvas, para acelerar el desarrollo y garantizar la escalabilidad, mi recomendación profesional es:

##### **Framework Principal: Phaser 3**
Es el estándar de oro para juegos 2D en HTML5.
* **Por qué:** Gestiona automáticamente el bucle de juego (*game loop*), la carga de activos, las físicas y, lo más importante, tiene un sistema de escenas excelente para separar el menú del juego.

##### **Herramientas de Apoyo**
| Herramienta | Función |
| :--- | :--- |
| **Vite** | Para un entorno de desarrollo ultrarrápido y empaquetado del código. |
| **LocalStorage API** | Para guardar las puntuaciones localmente sin necesidad de un servidor (inicialmente). |
| **WebAudio API** | (Incluida en Phaser) para gestionar el sonido de los disparos y platos rotos. |

---

#### 2. Plan de Implementación por Fases

##### Fase 1: Arquitectura de Escenas
Dividiremos el juego en **Scenes** independientes. Esto facilita mucho el mantenimiento:
1.  **Boot/Preload:** Carga de imágenes, sprites del personaje y sonidos.
2.  **MainMenu:** Pantalla de bienvenida con el fondo y el sistema de popups.
3.  **HighScores:** Visualización de la tabla de líderes.
4.  **GameScene:** El núcleo del juego (disparos, platos, tiempo).
5.  **ScoreEntry:** El modo "arcade" para meter las iniciales.

##### Fase 2: Interfaz de Usuario (UI) y Sistema de Popups
En lugar de crear elementos HTML flotantes (que pueden dar problemas de enfoque), dibujaremos el popup directamente en el Canvas de Phaser para que el escalado sea perfecto.
* **El Fondo:** Un `Sprite` estático que persiste o se replica en todas las escenas.
* **Contenedores:** Usaremos `Phaser.GameObjects.Container` para agrupar el fondo del popup, los botones y el texto, permitiendo animar su aparición con un efecto *tween* (suavizado).

##### Fase 3: Mecánica de Juego (Gameplay)
Aquí es donde definiremos la física de los platos.
* **Lógica de Trayectoria:** Los platos seguirán una trayectoria parabólica. La ecuación de posición vertical será:
    $$y(t) = y_0 + v_{y0}t - \frac{1}{2}gt^2$$
    Donde $g$ es la gravedad simulada.
* **Detección de Acierto:** Usaremos punteros (ratón o táctil) para detectar colisiones con los *hitboxes* circulares de los platos.

##### Fase 4: El Sistema de Puntuación Arcade
Este es el "toque maestro" de tu propuesta.
* **Persistencia:** Crearemos un array de objetos `[{name: 'AAA', score: 1000}, ...]` guardado en un string JSON dentro del `localStorage`.
* **Entrada de Iniciales:** No usaremos el teclado estándar. Implementaremos un selector cíclico (A-Z) donde el usuario se mueve con flechas o botones en pantalla, replicando la sensación de las máquinas de los 80.

---

#### 3. Desglose del "High Score Entry" (Estilo Retro)

Para lograr esa estética de arcade antiguo, el flujo será:
1.  **Validación:** Al morir, el script comprueba si `currentScore > scores[9].score`.
2.  **Interfaz:** Se resalta la línea de la nueva puntuación con guiones bajos parpadeantes `_ _ _`.
3.  **Control:** * Flecha Arriba/Abajo: Cambia el carácter actual (A -> B -> C...).
    * Botón "Siguiente/Aceptar": Salta al siguiente espacio o confirma la entrada.

---

#### 4. Sugerencia de PM para el "MVP" (Producto Mínimo Viable)

Para la primera versión, sugiero:
* **Feedback Visual:** Un pequeño "destello" o efecto de partículas cuando el plato se rompe. Sin eso, el juego se siente vacío.
* **Dificultad Progresiva:** A medida que el jugador acierta, los platos deben salir con un ángulo más bajo o a mayor velocidad inicial.

**¿Quieres que profundicemos en el código de la lógica de rotación de los platos o prefieres que diseñemos primero la estructura de objetos para la tabla de puntuaciones?**

### Generación del product roadmap

Actúa como Product Owner senior, experto en desarrollo de videojuegos y metodologías ágiles.
Utiliza la descripción del juego anterior para proponer un product roadmap de alto nivel. Vamos a ir inicialmente a crear las épicas necesarias para podor generar el MVP propuesto, con el feedback visual y la dificultad progresiva.

Resultado:

¡Excelente! Como **Senior Product Owner**, mi objetivo es asegurar que el equipo construya el producto correcto, maximizando el valor en cada entrega. Para este juego de tiro al plato, vamos a estructurar el trabajo para pasar de un "lienzo en blanco" a una experiencia adictiva con "jugo" (feedback visual) en el menor tiempo posible.

Aquí tienes el **Product Roadmap** y el desglose de **Épicas** para el MVP.

---

#### 1. Product Roadmap de Alto Nivel (MVP Focus)

Dividiremos el desarrollo en **3 fases críticas** dentro de un horizonte temporal ágil (ej. 6 sprints de una semana):

* **Fase 1: Cimientos y Core Loop (Mecánica Base):** El jugador puede disparar y los platos se rompen. Sin adornos, solo funcionalidad pura.
* **Fase 2: Meta-game y Persistencia:** Pantallas de inicio, sistema de puntuación y la tabla de clasificación local.
* **Fase 3: "Juice" y Balance:** Feedback visual (partículas), sonidos y la curva de dificultad progresiva que mencionamos.

---

#### 2. Definición de Épicas para el MVP

He definido estas 5 épicas para cubrir los requisitos técnicos y de experiencia de usuario:

##### Épica 1: Arquitectura del Motor y Assets (Foundation)
* **Objetivo:** Configurar el entorno de desarrollo y cargar todos los recursos necesarios.
* **Historias de Usuario clave:**
    * Configuración del *Boilerplate* con Phaser 3 y Vite.
    * Implementación del sistema de gestión de Escenas (Boot, Menú, Juego, Puntuaciones).
    * Carga de *Spritesheets* (personaje, platos, fondo) y assets de audio.

##### Épica 2: El Core Gameplay (The Shooting Loop)
* **Objetivo:** Conseguir que la mecánica principal sea funcional y precisa.
* **Historias de Usuario clave:**
    * Implementación del sistema de disparo mediante clic/tap con detección de colisión circular.
    * Lógica de lanzamiento de platos (Trayectoria parabólica mediante física 2D).
    * Controlador del personaje (animación de disparo y posición estática).
    * Sistema de gestión de "Vidas" (platos perdidos) y fin de partida.

##### Épica 3: Interfaz de Usuario y Navegación (Menus & UI)
* **Objetivo:** Crear el flujo de navegación entre la pantalla de bienvenida y el juego.
* **Historias de Usuario clave:**
    * Creación del Popup central dinámico para el Menú Principal.
    * Integración del fondo persistente entre escenas.
    * Implementación de la lógica de "Volver al Menú" desde cualquier pantalla.

##### Épica 4: Sistema de Puntuación "Old School" (Data & Entry)
* **Objetivo:** Gestionar la persistencia de datos y la entrada de iniciales estilo arcade.
* **Historias de Usuario clave:**
    * Desarrollo de la lógica de persistencia en `LocalStorage`.
    * Creación de la pantalla de visualización de los Top 10 mejores puntajes.
    * **Feature Estrella:** Implementación del componente de entrada de iniciales (3 letras) con scroll cíclico (A-Z).

##### Épica 5: Experiencia Sensorial y Pulido (The Juice & Balance)
* **Objetivo:** Hacer que el juego pase de ser funcional a ser "divertido".
* **Historias de Usuario clave:**
    * **Feedback Visual:** Sistema de partículas para la explosión de platos y "flash" de pantalla al disparar.
    * **Dificultad Progresiva:** Algoritmo que reduce el tiempo entre lanzamientos y aumenta la velocidad de los platos según la puntuación.
    * **Feedback Auditivo:** Efectos de sonido para acierto, fallo y música de fondo.

---

#### 3. Priorización del Backlog (Matriz de Valor vs. Esfuerzo)

Para el MVP, priorizaremos de la siguiente manera:

1.  **Must Have:** Épica 1, Épica 2 y Épica 4 (La base mecánica y el sistema arcade).
2.  **Should Have:** Épica 3 (UI limpia) y Épica 5 (Feedback visual y dificultad).
3.  **Could Have (Post-MVP):** Power-ups, diferentes tipos de platos o multijugador local.

---

#### 4. Sugerencia de PM: El "Diferenciador"
Para que este juego destaque, aunque sea un MVP, te sugiero añadir un **"Combo Multiplier"**. Si el jugador rompe 3 platos seguidos sin fallar, la puntuación se duplica. Esto añade una capa estratégica a la dificultad progresiva que estamos planeando.

**Como Product Owner, mi siguiente paso sería redactar los Criterios de Aceptación para la Épica 4 (el sistema de puntuación arcade). ¿Te gustaría que los definamos o prefieres empezar con la arquitectura técnica de la Épica 1?**

### Definición de las historias de la primera épica

Vamos a empezar a definir las User Stories de la primera épica.
Actúa como Product Owner senior con experiencia en metodologías ágiles y experto en desarrollo de videojuegos. Tienes, además, el conocimiento de un experto desarrollador senior de videojuegos.

A partir de la descripción de la primera épica, genera las User Stories necesarias para desarrollar esa funcionalidad, que cumplan los criterios INVEST. Para cada una incluye:
- Título descriptivo
- Historia en formato "Como [rol], quiero [acción], para [beneficio]"
- 3 criterios de aceptación en formato BDD (Dado que/Cuando/Entonces)
- Estimación de complejidad (S/M/L)
- Evaluación breve contra INVEST

Después de generar las historias, sugiere un orden de priorización y justifica tu decisión.
Ten en cuenta que estamos generando desde cero el proyecto, por lo que serán necesarias, posiblemente, historias para la configuración del entorno de desarrollo.

Resultado:

Como Senior Product Owner y Lead Developer, entiendo que la **Épica 1 (Foundation)** es el "esqueleto" que sostendrá toda la lógica posterior. Si los cimientos son débiles, el desarrollo se ralentizará en las fases de pulido.

Aquí tienes el desglose de User Stories para esta primera fase, diseñadas para ser ejecutables y técnicamente sólidas.

---

#### Épica 1: Arquitectura del Motor y Assets

##### US1.1: Configuración del entorno de desarrollo (Scaffolding)
* **Historia:** Como **desarrollador**, quiero un **entorno de desarrollo basado en Vite y Phaser 3**, para poder **escribir código con hot-reload y empaquetar el juego eficientemente**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Inicio del servidor local.
        * **Dado que** he instalado las dependencias con `npm install`.
        * **Cuando** ejecuto el comando `npm run dev`.
        * **Entonces** el servidor se inicia y el juego es accesible en el navegador en menos de 2 segundos.
    * **Escenario 2:** Inicialización de Phaser.
        * **Dado que** el juego carga en el navegador.
        * **Cuando** inspecciono la consola.
        * **Entonces** debe aparecer el banner de Phaser 3 confirmando que el contexto de Canvas/WebGL se ha creado correctamente.
    * **Escenario 3:** Estructura de carpetas.
        * **Dado que** abro el proyecto.
        * **Cuando** reviso el directorio `src/`.
        * **Entonces** deben existir carpetas separadas para `scenes/`, `assets/` y `prefabs/`.
* **Estimación:** **S** (Pequeña).
* **Evaluación INVEST:** Cumple. Es **I**ndependiente (es el inicio), **V**aliosa (habilita al equipo) y **T**esteable (el servidor corre o no).

---

##### US1.2: Implementación del Sistema de Escenas (Scene Manager)
* **Historia:** Como **desarrollador**, quiero un **sistema de gestión de escenas**, para **separar lógicamente el flujo del juego (Carga -> Menú -> Partida -> Puntuaciones)**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Flujo de arranque.
        * **Dado que** inicio el juego.
        * **Cuando** termina la escena de `Boot`.
        * **Entonces** el motor debe hacer la transición automática a la escena de `MainMenu`.
    * **Escenario 2:** Registro de escenas.
        * **Dado que** el archivo `main.js` configura el juego.
        * **Cuando** se instancia la clase `Phaser.Game`.
        * **Entonces** deben estar registradas al menos las clases `Boot`, `Preloader`, `MainMenu` y `GameScene`.
    * **Escenario 3:** Persistencia del estado.
        * **Dado que** cambio de la escena `GameScene` a `MainMenu`.
        * **Cuando** vuelvo a entrar en `GameScene`.
        * **Entonces** la escena debe reiniciarse limpiamente sin fugas de memoria de la sesión anterior.
* **Estimación:** **M** (Media).
* **Evaluación INVEST:** Cumple. Es **E**stimable y **S**mall (pequeña) al enfocarse solo en la navegación, no en el contenido.

---

##### US1.3: Sistema de Precarga de Assets (Asset Loader)
* **Historia:** Como **jugador**, quiero ver una **pantalla de carga**, para **saber que el juego se está iniciando y evitar ver elementos visuales "parpadeando" al aparecer**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Feedback visual de carga.
        * **Dado que** estoy en la escena de `Preloader`.
        * **Cuando** los assets se están descargando.
        * **Entonces** se debe mostrar una barra de progreso que se llene proporcionalmente al % de carga.
    * **Escenario 2:** Carga de recursos críticos.
        * **Dado que** el método `preload()` se ejecuta.
        * **Cuando** termina la fase de carga.
        * **Entonces** deben estar disponibles en la caché de Phaser el fondo, el sprite del personaje y el sprite del plato.
    * **Escenario 3:** Gestión de errores.
        * **Dado que** un asset falla al cargar (404).
        * **Cuando** termina el intento de carga.
        * **Entonces** el juego debe loguear un error en consola pero permitir la transición al menú para evitar un bloqueo total.
* **Estimación:** **S** (Pequeña).
* **Evaluación INVEST:** Cumple. Es **V**aliosa para la UX y **N**egociable (podemos empezar con una barra simple).

---

##### US1.4: Layout Base y Fondo Persistente
* **Historia:** Como **Product Owner**, quiero que el **fondo del juego esté presente en todas las pantallas**, para **mantener la coherencia visual desde el primer momento**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Renderizado del fondo.
        * **Dado que** entro en la escena `MainMenu` o `GameScene`.
        * **Cuando** el motor renderiza el primer frame.
        * **Entonces** el sprite de fondo debe cubrir el 100% del área visible (ajuste tipo "cover").
    * **Escenario 2:** Posicionamiento del personaje.
        * **Dado que** estoy en la escena de juego.
        * **Cuando** se instancia el personaje del jugador.
        * **Entonces** debe aparecer centrado en la parte inferior o en la posición de disparo definida, listo para ser animado.
    * **Escenario 3:** Adaptabilidad (Responsividad).
        * **Dado que** cambio el tamaño de la ventana del navegador.
        * **Cuando** el evento `resize` se dispara.
        * **Entonces** el fondo debe reescalarse sin perder su relación de aspecto.
* **Notas adicionales:**
    * Todos los assets del jugador (n1.png, n2.png, tc.png, td.png, ti.png, v1.png y v2.png) tienen el mismo tamaño que el asset fondo.png. A la hora de colocarlos en pantalla se deben colocar justo encima del fondo ocupando exactamente el mismo tamaño.
    * La pantalla principal puede hacer una pequeña animación del jugador siguiendo el siguiente flujo n1.png -> v2.png -> n1.png -> n2.png -> n1.png (punto de inicio). Esta animación debe estar espaciada en el tiempo y cada cambio tendrá una duración aleatoria, no debe ser una animación rápida.
* **Estimación:** **M** (Media, por la lógica de reescalado).
* **Evaluación INVEST:** Cumple. Es **T**esteable visualmente.

---

#### Sugerencia de Priorización

El orden sugerido de ejecución es el siguiente:

1.  **US1.1 (Configuración):** Es el bloqueante técnico. Sin esto, nadie puede picar código.
2.  **US1.2 (Escenas):** Establece el flujo de navegación. Es más fácil construir el resto si ya tenemos "donde ponerlo".
3.  **US1.3 (Asset Loader):** Necesaria para gestionar los recursos que usaremos en las siguientes épicas (platos, sonidos, etc.).
4.  **US1.4 (Layout/Fondo):** Es la última de esta épica porque, aunque es visual, depende de que las escenas y los assets funcionen.

**Justificación:** Seguimos un enfoque de **"Arquitectura de Caminos Críticos"**. Primero habilitamos la herramienta (Vite), luego el flujo (Escenas) y finalmente el contenido (Assets/Layout). Esto minimiza el retrabajo y permite que, a partir de la US1.2, varios desarrolladores puedan trabajar en paralelo (uno en el menú, otro en la lógica de disparo).

**¿Te parece bien este orden o prefieres que prioricemos la US1.4 para tener algo visual que mostrar a los stakeholders lo antes posible?**

### Definición de las historias de la segunda épica

Épica 2: El Core Gameplay (The Shooting Loop)
* **Objetivo:** Conseguir que la mecánica principal sea funcional y precisa.
* **Descripción de la mecánica:**
    * La mecánica de juego será la siguiente:
        * En el centro de la pantalla deben aparecer dos cuadrados rojos, separados por un espacio. Cada cuadrado representa la zona de tiro del jugador. El cuadrado de la derecha se activa pulsando la tecla de "Flecha derecha", y el cuadrado de la izquierda se activa pulsando la tecla "Flecha Izquierda" del teclado.
        * Del lado derecho de la pantalla, irán apareciendo los platos. Cada uno de los los platos saldrá con un ángulo diferente y harán un movimiento diferente por la pantalla.
        * Los cuadrados centrales se mueven de arriba a abajo manteniendo siempre la altura del plato más cercano que tengan.
        * Cuando el plato llega a la altura del cuadrado derecho, si el usuario pulsa la tecla "Flecha derecha", el plato se debe romper si está dentro del cuadrado. Cuando el plato llega a la altura del cuadrado izquierdo, si el usuario pulsa la tecla "Flecha izquierda", el plato se debe romper si está dentro del cuadrado.
        * Al pulsar la tecla "Flecha derecha", se debe cambiar la imagen del personaje y poner el asset td.png.
        * Al pulsar la tecla "Flecha izquierda", se debe cambiar la imagen del personaje y poner el asset ti.png.
        * Cada vez que se rompe un plato, se deben sumar 100 puntos al marcador.
        * Cada vez que se rompe un plato la velocidad de todos los platos se incrementa un poco y el tamaño de los cuadrados centrales se aumenta un poco hasta llegar a un aumento del doble de tamaño inicial para los cuadrados, y un aumento de un 50% de la velocidad inicial para los platos.
        * Cada 10 platos que se lancen por la derecha se lanzará un plato por la izquierda. Si el jugador ha conseguido acertar en todos los platos de la derecha, el plato que aparece por la izquierda será de otro color y valor: azul - 200ptos, rojo - 500ptos, verde - 1000ptos (Este será el último plato a lanzar de la partida)
        * Si el jugador falla en algún momento, la velocidad de los platos se reseteará a la velocidad inicial y el tamaño de los cuadrados centrales se cambiará para ser del tamaño inicial.
        * Si el jugador ha conseguido acertar en todos los platos de la partida, como punto extra, debe aparecer una nave extraterrestre cruzando el cielo a gran velocidad. Los cuadros centrales se moveran a la altura de la nave para poder dispararle. Si consigue acertar el tiro, la nave se romperá y se sumarán 5000ptos.
* **Historias de Usuario clave:**
    * Implementación del sistema de disparo con detección de colisión.
    * Lógica de lanzamiento de platos (Trayectoria parabólica mediante física 2D).
    * Controlador del personaje (animación de disparo y posición estática).
    * Sistema de gestión de "Vidas" (platos perdidos) y fin de partida.


A partir de la descripción de la segunda épica, genera las User Stories necesarias para desarrollar esa funcionalidad, que cumplan los criterios INVEST. Para cada una incluye:
- Título descriptivo
- Historia en formato "Como [rol], quiero [acción], para [beneficio]"
- 3 criterios de aceptación en formato BDD (Dado que/Cuando/Entonces)
- Estimación de complejidad (S/M/L)
- Evaluación breve contra INVEST

Después de generar las historias, sugiere un orden de priorización y justifica tu decisión.
Ten en cuenta que estamos generando desde cero el proyecto, por lo que serán necesarias, posiblemente, historias para la configuración del entorno de desarrollo.

Respuesta:

Esta es una épica densa, con mecánicas muy específicas de los juegos de arcade. Como tu PO y Lead Dev, voy a desglosar esta complejidad en historias que permitan probar el "bucle de juego" lo antes posible.

Aquí tienes las User Stories para la **Épica 2: El Core Gameplay**.

---

#### Épica 2: El Core Gameplay (The Shooting Loop)

##### US 2.1: Sistema de Control y Zonas de Tiro
* **Historia:** Como **jugador**, quiero **controlar dos zonas de tiro con el teclado y ver cambios en mi personaje**, para **reaccionar a los platos que se aproximan**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Activación de zonas.
        * **Dado que** estoy en la partida.
        * **Cuando** pulso "Flecha Derecha" o "Flecha Izquierda".
        * **Entonces** el cuadrado rojo correspondiente debe emitir una señal visual de activación y el personaje debe cambiar su imagen a `td.png` o `ti.png` respectivamente.
    * **Escenario 2:** Seguimiento automático de altura.
        * **Dado que** hay un plato en pantalla.
        * **Cuando** el plato se desplaza verticalmente.
        * **Entonces** el cuadrado de tiro más cercano debe ajustar su posición Y automáticamente para coincidir con la del plato.
    * **Escenario 3:** Reposo del personaje.
        * **Dado que** no estoy pulsando ninguna tecla.
        * **Cuando** pasa el tiempo de la animación de disparo.
        * **Entonces** el personaje debe volver a su frame estático por defecto.
* **Estimación:** **M** (Media).
* **Evaluación INVEST:** Cumple. Es **V**aliosa (define el control) y **T**esteable (verificación visual de inputs).

---

##### US 2.2: Motor de Lanzamiento y Trayectorias
* **Historia:** Como **desarrollador**, quiero un **sistema que genere platos con ángulos aleatorios**, para **crear un reto variable para el jugador**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Lanzamiento desde la derecha. Las coordenadas de salida son 1536x600. El ángulo de salida no puede ser inferior a 18 grados.
        * **Dado que** el temporizador de generación se activa.
        * **Cuando** el sistema crea un plato.
        * **Entonces** este debe aparecer en el borde derecho y moverse hacia la izquierda con un ángulo de trayectoria aleatorio.
    * **Escenario 2:** Rotación y Movimiento.
        * **Dado que** un plato está activo.
        * **Cuando** transcurre el tiempo.
        * **Entonces** el plato debe actualizar su posición X/Y basándose en su vector de velocidad y ángulo inicial.
    * **Escenario 3:** Limpieza de memoria.
        * **Dado que** un plato sale de los límites de la pantalla por la izquierda sin ser destruido.
        * **Cuando** cruza el límite.
        * **Entonces** el objeto debe ser destruido (o devuelto al pool) para no consumir recursos.
* **Estimación:** **M** (Media).
* **Evaluación INVEST:** Cumple. Es **I**ndependiente del sistema de puntos y **S**mall (enfocada solo en movimiento).

---

##### US 2.3: Sistema de Colisión e Impacto (Hitbox)
* **Historia:** Como **jugador**, quiero **romper los platos cuando están dentro del cuadrado**, para **progresar en el juego y ganar puntos**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Acierto (Hit).
        * **Dado que** un plato está colisionando con el área del cuadrado rojo.
        * **Cuando** pulso la tecla de dirección correspondiente a ese cuadrado.
        * **Entonces** el plato debe desaparecer, se deben sumar 100 puntos y el sistema debe registrar un "acierto".
    * **Escenario 2:** Fallo por tiempo (Miss).
        * **Dado que** un plato cruza el cuadrado de tiro.
        * **Cuando** el jugador no pulsa la tecla o la pulsa fuera de tiempo.
        * **Entonces** el plato continúa su camino y el sistema debe registrar un "fallo".
    * **Escenario 3:** Feedback de rotura.
        * **Dado que** un plato es impactado.
        * **Cuando** ocurre la colisión.
        * **Entonces** se debe instanciar un efecto visual de "plato roto" en la posición del impacto.
* **Estimación:** **S** (Pequeña).
* **Evaluación INVEST:** Cumple. Es **V**aliosa y muy específica (**S**mall).

---

##### US 2.4: Dificultad Dinámica y Escalado
* **Historia:** Como **Product Owner**, quiero que **el juego sea más difícil a medida que el jugador acierta**, para **mantener el interés y el flujo de juego (Flow State)**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Incremento por acierto.
        * **Dado que** el jugador rompe un plato con éxito.
        * **Cuando** se actualiza el estado.
        * **Entonces** la velocidad global de los platos debe aumentar un pequeño porcentaje (hasta un tope de +50%) y el tamaño de los cuadrados debe crecer (hasta un máximo de 2x).
    * **Escenario 2:** Reset por fallo.
        * **Dado que** el sistema registra un fallo (plato perdido).
        * **Cuando** ocurre el evento de fallo.
        * **Entonces** la velocidad de los platos y el tamaño de los cuadrados deben volver instantáneamente a sus valores iniciales.
* **Estimación:** **S** (Pequeña).
* **Evaluación INVEST:** Cumple. Es **N**egociable (los porcentajes exactos pueden ajustarse en el testing).

---

##### US 2.5: Lógica de Platos Especiales y Evento Nave (Endgame)
* **Historia:** Como **jugador experto**, quiero **enfrentarme a platos especiales y una nave final**, para **obtener puntuaciones masivas y un cierre épico**.
* **Descripción**:
El número total de platos que deben salir por pantalla son 33. Si ha acertado los 33 platos, aparecerá una nave cruzando de izquierda a derecha, solamente aparece en ese caso.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Plato por la izquierda.
        * **Dado que** se han lanzado 10 platos por la derecha.
        * **Cuando** toca el siguiente lanzamiento.
        * **Entonces** el plato debe salir por el lado izquierdo. Las coordenadas de salida son 0x600. El ángulo de salida no puede ser inferior a 18 grados.
    * **Escenario 2:** Colores y Valores.
        * **Dado que** el jugador tiene un "Perfect Streak" (no ha fallado ningún plato de la derecha).
        * **Cuando** sale el plato de la izquierda.
        * **Entonces** este debe ser de color (Azul, Rojo o Verde) y otorgar el puntaje correspondiente (200, 500, 1000).
    * **Escenario 3:** Evento Nave Extraterrestre.
        * **Dado que** el jugador ha acertado todos los platos de la partida (incluyendo el verde final).
        * **Cuando** termina la secuencia de platos.
        * **Entonces** debe aparecer la Nave cruzando el cielo, los cuadrados deben seguir su altura y, al acertar, otorgar 5000 puntos.
* **Estimación:** **L** (Grande). Requiere gestión de estados complejos (Perfect streak, contadores, comportamiento de la nave).
* **Evaluación INVEST:** Cumple. Aunque es más grande, es **E**stimable y es la fuente principal de **V**alor para el "re-playability".

---

#### Priorización y Justificación

El orden sugerido es:
1.  **US 2.1 (Control)** & **US 2.2 (Lanzamiento):** Es imposible probar el juego sin movimiento ni entrada. Se pueden desarrollar en paralelo.
2.  **US 2.3 (Colisiones):** Cierra el ciclo básico de juego (*Core Loop*). Sin esto, es solo un protector de pantalla.
3.  **US 2.4 (Dificultad):** Una vez que el juego "se puede jugar", necesitamos que "se sienta bien". El escalado es clave para el balance.
4.  **US 2.5 (Especiales/Nave):** Es el contenido de "endgame". Se deja para el final porque depende de que toda la lógica de colisión, movimiento y puntuación esté perfectamente pulida.

**Justificación:** Seguimos la regla de oro del desarrollo de videojuegos: **"Find the fun first"**. El "fun" está en el ritmo de disparar a los platos (2.1, 2.2, 2.3). Las reglas especiales (2.5) son la "guinda del pastel".

**¿Te gustaría que profundice en el algoritmo matemático para el escalado de la velocidad en la US 2.4 o pasamos a definir los componentes de la Épica 3 (UI)?**

### Definición de la tercera épica

Épica 3: Interfaz de Usuario y Navegación (Menus & UI)
* **Objetivo:** Mejorar la interfaz de usuario y la navegación entre pantallas
* **Descripción:**
En esta épica vamos a mejorar la interfaz de usuario del menú principal y la escena de juego para que sea mucho mejor:
    * El popup del menú principal debe incluir el título del juego (Tiro al Plato), un botón para entrar en la partida (Nueva partida), un botón para ver las mejores puntuaciones (Ranking), y un botón de ayuda para mostrar información sobre los controles del juego (Controles)
    * En la pantalla de juego debemos quitar el popup con toda la información ya que molesta bastante a la hora de jugar.
    * El contador de tiempo lo pondremos en el marcador que hay en la parte baja a la derecha del fondo. Ajustando la visual del marcador de tiempo para que parezca integrado en la pantalla.
    * La puntuación y el número de platos que hemso roto los mostraremos en una barra superior, de estilo similar al popup. El formato para los platos será: Platos 2/33, donde 2 es el número de aciertos que hemos tenido.
    * Hay que crear una nueva escena para el ranking de puntuaciones. Por ahora aparecerá vacía y con la opción de volver al menú principal
    * Hay que crear una nueva escena para mostrar los controles. Debe poner toda la información sobre las teclas que usamos durante el juego. Debería ser una información visual.
* **Historias de Usuario clave:**
    * Actualización del popup del menú principal para hacerlo más llamativo
    * Actualización de la interfaz de la escena de juego para que esté mejor integrada
    * Creación de la escena para mostrar los controles
    * Creación de la escena para mostrar el ranking

A partir de la descripción de la tercera épica, genera las User Stories necesarias para desarrollar esa funcionalidad, que cumplan los criterios INVEST. Para cada una incluye:
- Título descriptivo
- Historia en formato "Como [rol], quiero [acción], para [beneficio]"
- 3 criterios de aceptación en formato BDD (Dado que/Cuando/Entonces)
- Estimación de complejidad (S/M/L)
- Evaluación breve contra INVEST

Después de generar las historias, sugiere un orden de priorización y justifica tu decisión.
Ten en cuenta que estamos generando desde cero el proyecto, por lo que serán necesarias, posiblemente, historias para la configuración del entorno de desarrollo.

Respuesta:

En esta etapa, como tu **Senior Product Owner**, nos enfocaremos en la "capa de barniz" y la experiencia de usuario (UX). Ya tenemos la mecánica (Épica 2), ahora necesitamos que el jugador entienda qué hacer y se sienta inmerso en la estética arcade.

Aquí tienes el desglose de User Stories para la **Épica 3: Interfaz de Usuario y Navegación**.

---

#### Épica 3: Interfaz de Usuario y Navegación (Menus & UI)

##### US 3.1: Menú Principal Extendido y Popup Visual
* **Historia:** Como **jugador**, quiero un **menú principal con opciones claras y un diseño atractivo**, para **navegar fácilmente hacia las distintas secciones del juego**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Visualización de elementos.
        * **Dado que** estoy en el menú principal.
        * **Cuando** carga la escena.
        * **Entonces** debo ver el título "Tiro al Plato" y tres botones: "Nueva Partida", "Ranking" y "Controles", todos dentro del popup central.
    * **Escenario 2:** Estilo visual.
        * **Dado que** se despliega el popup.
        * **Cuando** el usuario lo visualiza.
        * **Entonces** el diseño debe ser consistente con la estética del juego, utilizando el fondo común detrás del popup.
    * **Escenario 3:** Funcionalidad de botones.
        * **Dado que** interactúo con los botones.
        * **Cuando** hago clic en cualquiera de ellos.
        * **Entonces** el sistema debe cambiar a la escena correspondiente (GameScene, RankingScene o ControlsScene).
* **Estimación:** **M** (Media, por el diseño y pulido estético).
* **Evaluación INVEST:** Cumple. Es **V**aliosa para la imagen del producto y **T**esteable mediante navegación.

---

##### US 3.2: HUD de Juego Integrado y Barra Superior
* **Historia:** Como **jugador**, quiero que **la información de la partida esté integrada visualmente en el entorno**, para **poder concentrarme en disparar sin distracciones de popups**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Barra superior de estado.
        * **Dado que** estoy en la escena de juego.
        * **Cuando** miro la parte superior.
        * **Entonces** debo ver una barra (estilo popup) que muestre la puntuación actual y el contador de platos en formato "Platos X/33".
    * **Escenario 2:** Temporizador integrado.
        * **Dado que** el tiempo de la partida transcurre.
        * **Cuando** miro el marcador del fondo (inferior derecha).
        * **Entonces** el valor numérico del tiempo debe aparecer renderizado dentro de ese marcador, pareciendo parte del dibujo del fondo.
    * **Escenario 3:** Limpieza visual.
        * **Dado que** la partida comienza.
        * **Cuando** el juego está activo.
        * **Entonces** no debe haber ningún popup central bloqueando la visibilidad de los platos o el personaje.
* **Estimación:** **M** (Media, requiere ajustes finos de coordenadas sobre el asset del fondo).
* **Evaluación INVEST:** Cumple. Es **I**ndependiente de las otras escenas y **S**mall.

---

##### US 3.3: Escena de Ayuda Visual (Controles)
* **Historia:** Como **jugador nuevo**, quiero ver una **guía visual de los controles**, para **aprender a jugar rápidamente sin frustraciones**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Representación gráfica.
        * **Dado que** entro en la escena de "Controles".
        * **Cuando** se muestra la información.
        * **Entonces** debo ver iconos de las teclas "Flecha Izquierda" y "Flecha Derecha" asociados a sus acciones de tiro de forma visual.
    * **Escenario 2:** Retorno al menú.
        * **Dado que** estoy leyendo los controles.
        * **Cuando** pulso el botón de "Atrás".
        * **Entonces** el juego debe regresar a la escena de Menú Principal inmediatamente.
* **Estimación:** **S** (Pequeña).
* **Evaluación INVEST:** Cumple. Es **N**egociable en cuanto a qué tan compleja es la ilustración y **E**stimable.

---

##### US 3.4: Escena de Ranking (Estructura de Datos)
* **Historia:** Como **jugador competitivo**, quiero una **pantalla dedicada al ranking**, para **prepararme para ver mis futuros récords**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Visualización inicial.
        * **Dado que** entro en la escena de "Ranking".
        * **Cuando** no hay datos guardados aún.
        * **Entonces** se debe mostrar la lista vacía o con placeholders (ej. "AAA - 000") y el botón para volver al menú.
    * **Escenario 2:** Estética coherente.
        * **Dado que** la escena carga.
        * **Cuando** se visualiza el fondo.
        * **Entonces** debe ser el mismo fondo del juego pero con el listado de puntuaciones en el centro.
* **Estimación:** **S** (Pequeña, la lógica de guardado real vendrá en la Épica 4).
* **Evaluación INVEST:** Cumple. Es **V**aliosa como base y **S**mall.

---

#### Priorización Sugerida y Justificación

Como PO, priorizo el orden de la siguiente manera:

1.  **US 3.2 (HUD de Juego):** **Prioridad Máxima**. Es vital para el "Game Feel". La Épica 2 ya definió cómo se juega, pero sin esta historia, la experiencia de juego es molesta. Necesitamos ver la puntuación y el tiempo integrados para validar que el juego es divertido.
2.  **US 3.1 (Menú Principal):** Es el punto de entrada. Permite conectar todas las piezas que estamos construyendo.
3.  **US 3.3 (Controles):** Fundamental para el *onboarding*. Un jugador que no sabe cómo disparar abandonará el juego en 10 segundos.
4.  **US 3.4 (Ranking):** Es la de menor prioridad en esta fase, ya que es una cáscara vacía hasta que implementemos la persistencia en la siguiente épica.

**Justificación:** Seguimos la filosofía de **"Gameplay First"**. Primero nos aseguramos de que la pantalla de juego se vea profesional y limpia (HUD), y luego construimos los accesos (Menú y Ayuda) que rodean a esa experiencia central.

**¿Damos el visto bueno a esta priorización para empezar a definir la Épica 4 (Persistencia y el sistema de iniciales arcade)?**

### Definición de la cuarta épica

Épica 4: Sistema de Puntuación "Old School" (Data & Entry)
* **Objetivo:** Gestionar la persistencia de datos y la entrada de iniciales estilo arcade.
* **Descripción:**
Cada vez que un usuario termine una partida, se debe repasar el listado de mejores puntuaciones, hasta 10. Si el usuario ha conseguido entrar en esa lista de mejores puntuaciones, debe aparecer una opción para que pueda meter sus iniciales.
* **Historias de Usuario clave:**
    * Desarrollo de la lógica de persistencia en `LocalStorage`.
    * Creación de la pantalla de visualización de los Top 10 mejores puntajes.
    * **Feature Estrella:** Implementación del componente de entrada de iniciales (3 letras) con scroll cíclico (A-Z).

A partir de la descripción de la cuarta épica, genera las User Stories necesarias para desarrollar esa funcionalidad, que cumplan los criterios INVEST. Para cada una incluye:
- Título descriptivo
- Historia en formato "Como [rol], quiero [acción], para [beneficio]"
- 3 criterios de aceptación en formato BDD (Dado que/Cuando/Entonces)
- Estimación de complejidad (S/M/L)
- Evaluación breve contra INVEST

Después de generar las historias, sugiere un orden de priorización y justifica tu decisión.
Ten en cuenta que estamos generando desde cero el proyecto, por lo que serán necesarias, posiblemente, historias para la configuración del entorno de desarrollo.

Respuesta:

Esta es la épica que le da el alma competitiva al juego. Como **Senior Product Owner**, entiendo que el sistema de "High Scores" no es solo una base de datos; es el sistema de recompensas que invita al jugador a volver. La mecánica de entrada de iniciales debe ser fluida y evocar esa nostalgia de los salones de arcade.

Aquí tienes el desglose de User Stories para la **Épica 4: Sistema de Puntuación "Old School"**.

---

#### Épica 4: Sistema de Puntuación "Old School" (Data & Entry)

##### US 4.1: Persistencia de Datos con LocalStorage
* **Historia:** Como **desarrollador**, quiero un **sistema para guardar y recuperar las 10 mejores puntuaciones de forma local**, para que **el progreso competitivo se mantenga entre sesiones de juego**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Inicialización de datos.
        * **Dado que** es la primera vez que se abre el juego.
        * **Cuando** el sistema intenta leer las puntuaciones.
        * **Entonces** debe generar una lista por defecto de 10 entradas (ej. "CPU - 500", "CPU - 400"...) para que el ranking nunca aparezca vacío.
    * **Escenario 2:** Guardado persistente.
        * **Dado que** se ha validado una nueva puntuación alta.
        * **Cuando** el usuario guarda sus iniciales.
        * **Entonces** la cadena JSON en `localStorage` debe actualizarse inmediatamente.
    * **Escenario 3:** Recuperación y orden.
        * **Dado que** hay múltiples puntuaciones guardadas.
        * **Cuando** se solicitan los datos.
        * **Entonces** la lógica debe devolver siempre un array de exactamente 10 objetos, ordenados de mayor a menor puntuación.
* **Estimación:** **S** (Pequeña).
* **Evaluación INVEST:** Cumple. Es **I**ndependiente de la UI y **V**aliosa para la persistencia.

---

##### US 4.2: Lógica de Validación de Récord
* **Historia:** Como **jugador**, quiero que **el juego detecte automáticamente si he entrado en el Top 10**, para **poder registrar mi nombre solo cuando realmente he superado un récord**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Superar el récord mínimo.
        * **Dado que** termino una partida con 1500 puntos y la décima puntuación más baja es 1400.
        * **Cuando** el juego transiciona a la pantalla de resultados.
        * **Entonces** debe mostrarse automáticamente el popup de "Introduce tus iniciales".
    * **Escenario 2:** No alcanzar el Top 10.
        * **Dado que** termino una partida con 500 puntos y el Top 10 empieza en 1000.
        * **Cuando** el juego termina.
        * **Entonces** el sistema debe mostrar la pantalla actual de finalización de juego.
    * **Escenario 3:** Empate de puntuación.
        * **Dado que** mi puntuación es igual a la del puesto 10.
        * **Cuando** se realiza la validación.
        * **Entonces** el sistema debe priorizar al nuevo jugador, desplazando al antiguo fuera del Top 10.
* **Estimación:** **S** (Pequeña).
* **Evaluación INVEST:** Cumple. Es **T**esteable mediante pruebas unitarias de lógica.

---

##### US 4.3: Feature Estrella: Entrada de Iniciales Arcade
* **Historia:** Como **jugador nostálgico**, quiero **introducir mis 3 iniciales mediante un scroll cíclico (A-Z)**, para **sentir la experiencia auténtica de una máquina arcade**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Ciclo de letras (A-Z).
        * **Dado que** estoy editando una inicial.
        * **Cuando** pulso "Flecha Arriba" en la letra 'Z'.
        * **Entonces** el carácter debe cambiar a 'A' (y viceversa con 'A' y Flecha Abajo).
    * **Escenario 2:** Confirmación de iniciales.
        * **Dado que** estoy en el popup de entrada.
        * **Cuando** pulso la tecla "Espacio" o "Enter".
        * **Entonces** se debe confirmar la letra actual y saltar a la siguiente posición, o finalizar el registro si es la tercera letra.
    * **Escenario 3:** Feedback visual.
        * **Dado que** estoy eligiendo una letra.
        * **Cuando** la posición está activa.
        * **Entonces** la letra o el guion bajo deben tener un efecto de parpadeo (*blink*) para indicar foco.
* **Estimación:** **L** (Grande). Requiere una gestión de inputs muy fina y feedback visual específico de Phaser.
* **Evaluación INVEST:** Cumple. Es **N**egociable (podríamos empezar con solo teclado y luego añadir el scroll).

---

##### US 4.4: Ranking Dinámico Actualizado
* **Historia:** Como **jugador**, quiero **ver mi nombre y puntuación resaltados en la tabla de clasificación**, para **celebrar mi victoria**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Visualización de datos reales.
        * **Dado que** entro en la escena de Ranking.
        * **Cuando** la escena se renderiza.
        * **Entonces** los datos mostrados deben coincidir exactamente con los almacenados en `localStorage`.
    * **Escenario 2:** Resaltado de nueva entrada.
        * **Dado que** acabo de introducir mis iniciales.
        * **Cuando** se muestra la tabla.
        * **Entonces** mi fila (nombre y puntos) debe aparecer con un color diferente o efecto de brillo para distinguirla del resto.
    * **Escenario 3:** Limpieza del Top 10.
        * **Dado que** hay más de 10 puntuaciones registradas en el historial interno.
        * **Cuando** se visualiza la tabla.
        * **Entonces** solo deben mostrarse las 10 mejores, truncando el resto.
* **Estimación:** **M** (Media).
* **Evaluación INVEST:** Cumple. Es la culminación **V**aliosa de toda la épica.

---

#### Priorización Sugerida y Justificación

El orden de implementación propuesto es:

1.  **US 4.1 (Persistencia):** Es la base técnica. Sin el "almacén" de datos, no podemos probar nada más.
2.  **US 4.2 (Lógica de Validación):** Es una lógica invisible pero crítica para decidir el flujo de pantallas.
3.  **US 4.3 (Entrada de Iniciales):** Es la pieza de mayor esfuerzo. Se prioriza aquí para tener tiempo de pulir la experiencia de usuario (UX), que es el punto fuerte del juego.
4.  **US 4.4 (Ranking Dinámico):** Se deja para el final porque es la representación visual de los datos que ya sabemos que se guardan correctamente.

**Justificación:** Seguimos un enfoque de **"Datos -> Lógica -> Interfaz"**. Aseguramos que la información fluye correctamente desde el final de la partida hasta el almacenamiento antes de dedicar tiempo a que la tabla de clasificación se vea bonita.

**¿Te gustaría que definamos ahora los activos gráficos (assets) necesarios para el feedback visual de la Épica 5 o prefieres que revisemos la lógica del temporizador de la US 3.2?**

### Definición de la quinta épica

Épica 5: Experiencia Sensorial y Pulido (The Juice & Balance)
* **Objetivo:** Hacer que el juego pase de ser funcional a ser "divertido".
* **Historias de Usuario clave:**
    * **Feedback Visual:** Sistema de partículas para la explosión de platos y "flash" de pantalla al disparar.
    * **Feedback Auditivo:** Efectos de sonido para disparo, acierto, fallo y música de fondo.

A partir de la descripción de la quinta épica, genera las User Stories necesarias para desarrollar esa funcionalidad, que cumplan los criterios INVEST. Para cada una incluye:
- Título descriptivo
- Historia en formato "Como [rol], quiero [acción], para [beneficio]"
- 3 criterios de aceptación en formato BDD (Dado que/Cuando/Entonces)
- Estimación de complejidad (S/M/L)
- Evaluación breve contra INVEST

Después de generar las historias, sugiere un orden de priorización y justifica tu decisión.
Ten en cuenta que estamos generando desde cero el proyecto, por lo que serán necesarias, posiblemente, historias para la configuración del entorno de desarrollo.

Respuesta:

Esta es la fase que separa a un prototipo técnico de un **videojuego real**. En la industria lo llamamos el *"Game Feel"* o *"Juice"*. Como tu **Senior Product Owner**, mi prioridad aquí es el refuerzo positivo: que cada acción del jugador (disparar, acertar, fallar) se sienta satisfactoria y emocionante.

Aquí tienes las User Stories para la **Épica 5: Experiencia Sensorial y Pulido**.

---

#### Épica 5: Experiencia Sensorial y Pulido (The Juice & Balance)

##### US 5.1: Sistema de Partículas y Feedback de Impacto
* **Historia:** Como **jugador**, quiero ver **una explosión de fragmentos cuando rompo un plato**, para **sentir visualmente la potencia de mi disparo**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Partículas de fragmentación.
        * **Dado que** un plato es alcanzado por un disparo.
        * **Cuando** el objeto se destruye.
        * **Entonces** el motor debe instanciar un emisor de partículas que genere al menos 10 fragmentos con la misma paleta de colores que el plato (rojo, azul o verde).
    * **Escenario 2:** Flash de disparo.
        * **Dado que** el jugador pulsa la tecla de disparo.
        * **Cuando** se activa el cuadrado de tiro.
        * **Entonces** debe aparecer un "muzzle flash" (destello blanco momentáneo) en la posición del cañón del personaje y un breve destello blanco transparente sobre toda la pantalla (0.05s).
    * **Escenario 3:** Rendimiento del emisor.
        * **Dado que** hay múltiples explosiones seguidas.
        * **Cuando** las partículas terminan su trayectoria de caída.
        * **Entonces** deben ser destruidas automáticamente para evitar la saturación de la memoria del navegador.
* **Estimación:** **M** (Media, requiere tunear los parámetros del `ParticleEmitter` de Phaser).
* **Evaluación INVEST:** Cumple. Es **V**aliosa para el *engagement* y **E**stimable.

---

##### US 5.2: Paisaje Sonoro y Feedback Auditivo
* **Historia:** Como **jugador**, quiero **escuchar efectos de sonido para cada acción**, para **tener una experiencia inmersiva y feedback auditivo de mis aciertos**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Sonido de disparo vs impacto.
        * **Dado que** el jugador dispara.
        * **Cuando** se pulsa la tecla.
        * **Entonces** debe sonar un efecto de "bang" seco; si hay impacto, debe sonar inmediatamente un efecto de "cerámica rompiéndose".
    * **Escenario 2:** Música de fondo (BGM).
        * **Dado que** el jugador está en la escena de juego.
        * **Cuando** comienza la partida.
        * **Entonces** debe sonar una música en bucle (loop) cuyo volumen baje ligeramente cuando ocurra un efecto de sonido de impacto.
    * **Escenario 3:** Feedback de fallo.
        * **Dado que** un plato sale de la pantalla sin ser destruido.
        * **Cuando** se registra el fallo.
        * **Entonces** debe sonar un tono grave o "buzz" sutil para indicar la pérdida del combo o velocidad.
* **Estimación:** **S** (Pequeña).
* **Evaluación INVEST:** Cumple. Es **I**ndependiente y **T**esteable.

---

##### US 5.3: Dinámica de Cámara y Sacudida (Screen Shake)
* **Historia:** Como **jugador**, quiero que **la cámara reaccione a los eventos importantes**, para **percibir la intensidad de los disparos y los aciertos críticos**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Sacudida por disparo estándar.
        * **Dado que** el jugador dispara.
        * **Cuando** la tecla es presionada.
        * **Entonces** la cámara debe realizar un `shake` muy leve (intensidad 0.005) durante 0.1 segundos.
    * **Escenario 2:** Sacudida por acierto crítico (Nave/Plato Verde).
        * **Dado que** el jugador acierta a la Nave Extraterrestre o al plato final verde.
        * **Cuando** se procesa el impacto.
        * **Entonces** la sacudida de cámara debe ser el doble de intensa y duradera que la estándar.
    * **Escenario 3:** Estabilidad de la UI.
        * **Dado que** la cámara se sacude.
        * **Cuando** ocurre el evento.
        * **Entonces** los elementos de la barra superior (puntos y platos) NO deben sacudirse (usando una cámara secundaria o ignorando el scroll).
* **Estimación:** **S** (Pequeña).
* **Evaluación INVEST:** Cumple. Es una mejora **N**egociable pero de alto **V**alor percibido.

---

##### US 5.4: Transiciones y Pulido de Menús
* **Historia:** Como **jugador**, quiero **transiciones suaves entre escenas**, para **sentir que el juego tiene una calidad profesional**.
* **Criterios de Aceptación (BDD):**
    * **Escenario 1:** Fundido a negro (Fade out).
        * **Dado que** el jugador pulsa "Nueva Partida".
        * **Cuando** se cambia de escena.
        * **Entonces** la pantalla debe hacer un fundido a negro antes de mostrar el nivel de juego.
    * **Escenario 2:** Animación del Popup.
        * **Dado que** aparece el menú principal o el ranking.
        * **Cuando** la escena se inicia.
        * **Entonces** el popup central debe aparecer con un efecto de escalado (de 0 a 1) con rebote (*bounce*).
* **Estimación:** **S** (Pequeña).
* **Evaluación INVEST:** Cumple. Es **S**mall y mejora mucho la **V**aloración del usuario.

---

#### Priorización y Justificación

El orden sugerido es:

1.  **US 5.1 (Visual) & US 5.2 (Audio):** **Prioridad Crítica**. El feedback visual y auditivo básico es lo que hace que el jugador quiera seguir disparando. Sin esto, el juego se siente "muerto".
2.  **US 5.4 (Transiciones):** Es un esfuerzo muy bajo con un impacto alto en la percepción de "producto terminado".
3.  **US 5.3 (Screen Shake):** Es la última porque es un detalle de pulido fino que, si se calibra mal, puede marear al jugador. Requiere pruebas después de tener lo visual y auditivo listo.

**Justificación:** Implementamos primero el **feedback reactivo** (lo que ocurre cuando el jugador actúa) y dejamos el **pulido pasivo** (transiciones) para el final.

---

#### Conclusión del Product Roadmap para el MVP

Hemos definido un plan robusto que cubre:
1.  **Arquitectura** (Cimientos).
2.  **Gameplay** (Mecánicas arcade únicas).
3.  **UI/UX** (Navegación fluida).
4.  **Meta-game** (Ranking y persistencia).
5.  **Juice** (Diversión sensorial).

Como tu **Senior Product Owner**, te aseguro que seguir este orden nos permitirá tener una versión jugable y "enseñable" desde la Épica 2, mejorando incrementalmente hasta llegar al producto final.

**¿Deseas que profundicemos en la redacción técnica de alguna de estas historias o que preparemos el "Sprint 1" seleccionando las historias de la Épica 1 y 2?**