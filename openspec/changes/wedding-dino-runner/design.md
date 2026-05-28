## Context

El cambio propone un juego arcade de una sola mecanica principal (saltar) sobre una fantasia de boda con mariachis como obstaculos. El estado actual del repo no contiene implementacion de gameplay ni specs previas, por lo que este cambio define la base funcional completa para un MVP.

Restricciones clave:

- Debe sentirse inmediato y justo como un endless runner clasico.
- Debe ser simple de implementar en TypeScript y facil de iterar.
- Debe funcionar en desktop y movil con un solo input principal.

## Goals / Non-Goals

**Goals:**

- Implementar loop de juego continuo con avance automatico.
- Ofrecer salto responsivo con reglas fisicas consistentes.
- Gestionar spawns de mariachis con dificultad progresiva por distancia.
- Registrar distancia actual y mejor marca local.
- Garantizar fairness para evitar patrones imposibles.

**Non-Goals:**

- Implementar multiplayer, economia o backend online.
- Introducir sistema complejo de power-ups en MVP.
- Crear niveles con final narrativo; el modo es endless.

## Decisions

1. Mecanica de input unico (salto)

- Decision: Un unico input para saltar (`Space`, `ArrowUp`, tap).
- Rationale: Minimiza friccion, mantiene accesibilidad y replica el feel del Dino original.
- Alternative considered: Agacharse y doble salto desde MVP.
- Why not now: Aumenta complejidad de animaciones/hitboxes y riesgo de tuning temprano.

2. Obstaculos de tres variantes de mariachi

- Decision: Definir tipos A/B/C con diferencias principalmente de hitbox y frecuencia.
- Rationale: Da variedad sin romper simplicidad.
- Alternative considered: Patrones de obstaculos compuestos desde inicio.
- Why not now: Mayor costo de balance antes de validar el core loop.

3. Progresion por fases basada en distancia

- Decision: Cuatro fases de dificultad (0-200, 200-600, 600-1200, 1200+).
- Rationale: Permite calibracion progresiva y comprensible.
- Alternative considered: Escalado totalmente continuo sin fases explicitas.
- Why not now: Las fases facilitan debug, ajuste y comunicacion de diseño.

4. Record local en cliente

- Decision: Persistir best score en almacenamiento local.
- Rationale: Aumenta rejugabilidad sin dependencias externas.
- Alternative considered: Leaderboard remoto.
- Why not now: Requiere backend/autenticacion fuera de alcance MVP.

5. Fairness como restriccion del spawner

- Decision: Enforzar separacion minima dinamica entre obstaculos segun velocidad y ventana de salto.
- Rationale: Evita muertes injustas y frustracion temprana.
- Alternative considered: Spawn aleatorio puro.
- Why not now: El aleatorio puro puede generar secuencias imposibles.

## Risks / Trade-offs

- [Riesgo: dificultad mal calibrada] -> Mitigacion: exponer constantes de tuning (velocidad base, crecimiento, intervalo spawn minimo) y ajustar con playtesting rapido.
- [Riesgo: colisiones percibidas como injustas] -> Mitigacion: hitboxes ligeramente conservadoras y pruebas visuales con debug overlays.
- [Riesgo: monotonia tras varios intentos] -> Mitigacion: milestones cada 250m, micro-variacion de obstaculos y feedback de nuevo record.
- [Trade-off: simplicidad vs profundidad] -> Mitigacion: fijar base robusta en MVP y planear extensiones posteriores (power-ups/logros).
