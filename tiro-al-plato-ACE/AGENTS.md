# AGENTS.md

## Objetivo

Este proyecto es un videojuego pequeño construido con Phaser 3 y Vite. Las contribuciones deben priorizar cambios simples, coherentes con la estructura actual y fáciles de validar con `npm run build`.

## Stack y estructura

- Runtime: JavaScript ES modules, sin TypeScript.
- Motor: Phaser 3.
- Bundler: Vite.
- Entrada principal: `src/main.js`.
- Configuración global del juego: `src/game/config.js`.
- Escenas: `src/scenes/`.
- Prefabs reutilizables: `src/prefabs/`.
- Registro de assets: `src/assets/manifest.js`.
- Assets públicos servidos por Vite: carpeta `assets/`.

## Flujo actual del juego

Mantén este flujo salvo que la tarea pida explícitamente cambiarlo:

1. `BootScene` carga recursos mínimos.
2. `BootScene` arranca `MainMenuScene`.
3. `MainMenuScene` usa `PreloaderScene` como paso intermedio antes de entrar en `GameScene`.
4. `GameScene` guarda puntuación y duración en el `registry` y navega a `ScoresScene`.
5. `ScoresScene` permite volver al menú o reiniciar partida.

Si introduces una escena nueva, registra la escena en `src/game/config.js` y añade su clave en `src/scenes/sceneKeys.js`.

## Convenciones de código

- Usa clases con `export class ... extends Phaser.Scene` para escenas.
- Usa clases con `export class ... extends Phaser.GameObjects.Container` para prefabs reutilizables.
- Mantén imports con rutas relativas y sufijo `.js`.
- Sigue el estilo ya existente: métodos cortos, nombres explícitos y sin abstracciones innecesarias.
- Inicializa propiedades de instancia en el `constructor`.
- Si una escena necesita reinicializar estado en cada entrada, usa `init(data)` para resetear propiedades.
- No introduzcas librerías nuevas salvo que la tarea lo exija claramente.

## Patrón obligatorio para escenas

Al crear o modificar una escena, sigue este patrón:

1. Declarar en el `constructor` todas las referencias importantes (`background`, `layout`, `onResize`, timers, handlers, etc.).
2. Crear la UI en métodos pequeños como `createBackground`, `createHud`, `createOverlay` o equivalentes.
3. Registrar listeners en `create()`.
4. Limpiar listeners y timers en `handleShutdown()`.
5. Registrar el cleanup con `this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)`.

Esto es especialmente importante para:

- `this.scale.on('resize', ...)`
- `this.input.keyboard.on(...)`
- `this.time.addEvent(...)`
- `this.time.delayedCall(...)`

No dejes listeners activos tras salir de una escena.

## Resize y layout

- El juego usa `Phaser.Scale.RESIZE` con ancho y alto ligados a la ventana.
- Las escenas deben responder al cambio de tamaño mediante `handleResize(gameSize)`.
- El fondo se reposiciona al centro y se escala con `Math.max(width / background.width, height / background.height)`.
- Los paneles principales suelen centrarse con contenedores (`Phaser.GameObjects.Container`).

Si añades UI nueva, asegúrate de que siga funcionando en escritorio y en pantallas pequeñas.

## UI y estilo visual

Preserva el lenguaje visual existente salvo petición contraria:

- Fondo oscuro con dominante azul.
- Paneles rectangulares semitransparentes.
- Tipografía principal: `Trebuchet MS`.
- Texto claro (`#f5f1d6`, `#ffffff`, `#dbe9f4`).
- Color de acento para botones y bordes destacados: gama dorada (`#e5b75c`).

Los botones actuales siguen este patrón:

- `rectangle` interactivo como fondo.
- `text` centrado encima.
- Ambos agrupados en un `container`.
- Estados `pointerover`, `pointerout` y `pointerup` definidos explícitamente.

Reutiliza este patrón antes de introducir componentes distintos.

## Assets

Cuando añadas un asset visual:

1. Coloca el archivo en `assets/`.
2. Declara una clave en `src/assets/manifest.js`.
3. Declara su path en `texturePaths`.
4. Carga el asset en la escena adecuada.

No hardcodees nombres de textura repartidos por el código si pueden centralizarse en `manifest.js`.

## Navegación y estado

- Usa `sceneKeys` para evitar literales dispersos.
- Usa `PreloaderScene` como transición entre escenas cuando el flujo actual ya lo hace.
- Para datos de fin de partida, el proyecto ya usa `this.registry.set(...)` como persistencia ligera.
- Si una escena puede recibir datos directos y también leer del `registry`, mantén ambas rutas solo si aportan robustez y no complican el flujo.

## Prefabs

Los prefabs deben seguir la pauta de `PlayerPrefab`:

- Extender `Phaser.GameObjects.Container`.
- Construir sus hijos dentro del constructor.
- Llamar a `scene.add.existing(this)`.
- Evitar lógica de escena dentro del prefab salvo que sea estrictamente visual o autocontenida.

## Qué hacer al implementar cambios

- Cambia solo lo necesario para la tarea.
- Mantén el flujo de escenas existente si no hay un requisito explícito para alterarlo.
- Si introduces nuevas teclas o eventos, elimina sus listeners en `handleShutdown()`.
- Si añades textos o paneles, intégralos en el sistema de `handleResize()`.
- Si añades una escena, verifica su registro completo: clave, import y alta en `gameConfig`.

## Qué evitar

- No dejar listeners ni timers vivos al abandonar una escena.
- No romper la navegación `MainMenu -> Preloader -> GameScene` sin motivo.
- No duplicar claves de escena o de texturas.
- No mover assets fuera de `assets/` sin actualizar `vite.config.js`.
- No introducir una arquitectura más compleja que la necesaria para un juego pequeño.

## Validación mínima

Antes de dar por terminado un cambio, ejecuta:

```bash
npm run build
```

Si el cambio afecta al flujo de escenas, comprueba también manualmente que:

1. El menú abre la partida.
2. La partida responde a input.
3. La escena de puntuaciones recibe datos válidos.
4. Volver al menú o reiniciar no deja comportamiento duplicado.

## Prioridades para futuros agentes

Cuando generes código en este repositorio, prioriza en este orden:

1. Mantener consistencia con el patrón Phaser actual.
2. Evitar fugas de listeners, timers y estado entre escenas.
3. Mantener la UI responsive.
4. Reutilizar `sceneKeys`, `manifest.js` y patrones de botones ya existentes.
5. Entregar cambios pequeños, verificables y fáciles de mantener.
