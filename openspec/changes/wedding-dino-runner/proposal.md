## Why

Queremos un minijuego web ligero, divertido y rejugable para una boda con identidad propia. Un runner tipo Dino en TypeScript permite construir una experiencia simple de aprender, facil de mantener y con foco en una mecanica central pulida.

## What Changes

- Crear un runner 2D de desplazamiento automatico con input principal de salto.
- Introducir obstaculos tematicos de mariachis con variaciones de hitbox.
- Implementar deteccion de colisiones con condicion de Game Over inmediata.
- Implementar contador principal de distancia y record local persistente.
- Definir y aplicar progresion de dificultad por fases segun distancia recorrida.
- Mostrar feedback de hitos de progreso y de nuevo record.

## Capabilities

### New Capabilities

- `wedding-runner-mechanics`: Define la jugabilidad base del runner (movimiento automatico, salto, obstaculos mariachi, colisiones, contador y game over).
- `wedding-runner-progression`: Define la curva de dificultad por fases, reglas de fairness y milestones de feedback durante la partida.

### Modified Capabilities

- Ninguna.

## Impact

- Afecta el codigo del cliente del juego (loop, fisica simple, spawn, colisiones, UI HUD).
- Requiere almacenamiento local para record historico (por ejemplo, localStorage).
- No introduce APIs de backend ni cambios de infraestructura para el MVP.
- Establece la base para futuras extensiones (power-ups, logros, modos adicionales).
