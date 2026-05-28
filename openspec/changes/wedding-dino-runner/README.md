# wedding-dino-runner

Juego runner de boda estilo Dino de Chrome. Un minijuego en TypeScript donde el jugador (novio/a) corre hacia el altar esquivando mariachis como obstáculos. El juego tiene un contador de distancia y récord. Estética divertida y temática de boda mexicana. Mecánica principal: salto para evitar obstáculos, velocidad creciente.

## Game Mechanics

### Core Loop

- El personaje avanza automaticamente hacia la derecha.
- El jugador solo controla el salto (tecla `Space` o `ArrowUp`; tap en movil).
- Obstaculos de tipo mariachi aparecen por la derecha y se desplazan a la izquierda.
- Si hay colision entre personaje y mariachi: termina la partida.
- Si el jugador evita el obstaculo: continua la carrera y aumenta el score.

### Player Rules

- Accion principal: salto de altura fija con gravedad consistente.
- No hay doble salto en la primera version para mantener simplicidad arcade.
- El personaje vuelve al suelo antes de poder volver a saltar.

### Obstacles (Mariachis)

- Tipo A: mariachi bajo (hitbox simple).
- Tipo B: mariachi medio (ligera variacion visual y de ancho).
- Tipo C: mariachi alto/ancho (requiere mejor timing).
- La variedad inicial es visual + hitbox; no se agregan patrones complejos al principio.

### Scoring and Counters

- Contador principal: distancia recorrida (metros simbolicos hacia el altar).
- Contador secundario: record historico local (best run).
- Regla de puntaje base: +1 unidad de distancia por tick de juego.
- Bonus opcional futuro (no MVP): +X por esquivar secuencias consecutivas sin fallo.

### Win/Loss Conditions

- Condicion de derrota: cualquier colision.
- Condicion de victoria abierta: no hay final fijo; el objetivo es superar el record.

## Progression

### Difficulty Curve by Phases

- Fase 1 (0-200m): ritmo accesible, separacion amplia entre mariachis.
- Fase 2 (200-600m): aumento gradual de velocidad horizontal y spawn rate.
- Fase 3 (600-1200m): combinaciones mas exigentes y ventanas de reaccion menores.
- Fase 4 (1200m+): dificultad sostenida alta con pequenos picos aleatorios controlados.

### Progression Variables

- `worldSpeed`: crece de forma suave por tramos, con tope maximo.
- `spawnInterval`: disminuye progresivamente hasta un minimo seguro.
- `obstacleMix`: mayor probabilidad de mariachis tipo B y C con la distancia.

### Fairness Constraints

- Nunca generar obstaculos imposibles de saltar por timing fisico del jugador.
- Mantener una distancia minima entre obstaculos segun velocidad actual.
- Evitar cambios bruscos de dificultad entre fases (curva continua).

### Milestones and Feedback

- Cada 250m mostrar hito tematico (ejemplo: "¡Ya casi llegan al altar!").
- Cada nuevo record: feedback visual inmediato y sonido celebratorio.
- Reinicio rapido tras Game Over para mantener ritmo arcade.

## MVP Scope

- Un solo personaje jugable.
- Un solo input de salto.
- Tres variantes de obstaculo mariachi.
- Contador de distancia + record local.
- Curva de dificultad por fases sin power-ups.

## Future Extensions (Out of Scope)

- Power-ups tematicos (ramo, confeti, serenata invencible temporal).
- Modo 2 jugadores por turnos.
- Misiones diarias y sistema de logros.
