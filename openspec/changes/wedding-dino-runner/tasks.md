## 1. Foundation and Setup

- [x] 1.1 Crear estructura base del juego en TypeScript (estado de juego, loop y sistema de entidades)
- [x] 1.2 Definir constantes configurables de fisica y progresion (`jumpForce`, `gravity`, `worldSpeed`, `spawnInterval`)
- [x] 1.3 Implementar inicializacion/reinicio de partida con transiciones `idle -> running -> gameOver`

## 2. Core Mechanics

- [x] 2.1 Implementar control de salto para teclado (`Space`, `ArrowUp`) y touch
- [x] 2.2 Implementar restriccion de salto unico (sin doble salto en estado airborne)
- [x] 2.3 Implementar sistema de spawn de mariachis tipo A/B/C con hitboxes diferenciadas
- [x] 2.4 Implementar deteccion de colisiones y condicion de derrota inmediata

## 3. Scoring and Progression

- [x] 3.1 Implementar contador de distancia que aumente de forma continua en estado running
- [x] 3.2 Implementar persistencia local y visualizacion del record historico
- [x] 3.3 Implementar fases de dificultad por distancia (0-200, 200-600, 600-1200, 1200+)
- [x] 3.4 Ajustar `worldSpeed`, `spawnInterval` y mezcla de obstaculos segun fase
- [x] 3.5 Implementar constraints de fairness para evitar secuencias imposibles

## 4. Feedback and Polish

- [x] 4.1 Implementar mensajes de milestone cada 250m
- [x] 4.2 Implementar feedback visual de nuevo record al superar best score
- [ ] 4.3 Validar jugabilidad en desktop y movil con pruebas manuales de timing y dificultad
- [x] 4.4 Realizar pase de tuning final de dificultad y hitboxes para minimizar frustracion
