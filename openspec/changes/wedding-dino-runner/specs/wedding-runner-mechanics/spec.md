## ADDED Requirements

### Requirement: Endless runner core loop

The system SHALL run an endless side-scrolling game loop where the player character advances automatically and obstacles move toward the player.

#### Scenario: Start a new run

- **WHEN** the player starts a run
- **THEN** the game enters running state with distance counter at 0 and active obstacle spawning

#### Scenario: Game over on collision

- **WHEN** the player collides with any mariachi obstacle during a run
- **THEN** the game SHALL immediately transition to game-over state and stop score progression

### Requirement: Single-action jump control

The system SHALL provide one primary jump action that can be triggered by keyboard (`Space`/`ArrowUp`) and touch input, and SHALL block double jump while airborne.

#### Scenario: Jump from ground

- **WHEN** the player triggers jump while grounded
- **THEN** the character SHALL perform one jump arc using configured jump force and gravity

#### Scenario: Ignore jump while airborne

- **WHEN** the player triggers jump while the character is airborne
- **THEN** the system SHALL ignore the input until grounded again

### Requirement: Mariachi obstacle variants

The system SHALL spawn at least three mariachi obstacle variants (A, B, C) with distinct hitbox profiles.

#### Scenario: Variant diversity during run

- **WHEN** a run progresses and multiple obstacles are spawned
- **THEN** spawned obstacles SHALL include the defined mariachi variants according to progression probabilities

### Requirement: Distance and best score counters

The system SHALL display current distance for the active run and SHALL persist a local best score across sessions.

#### Scenario: Distance updates during gameplay

- **WHEN** the game is in running state
- **THEN** the distance counter SHALL increase continuously over time

#### Scenario: Persist new best score

- **WHEN** a run ends with distance greater than stored best score
- **THEN** the system SHALL store and display the new best score for future runs
