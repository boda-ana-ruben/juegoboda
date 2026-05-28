## ADDED Requirements

### Requirement: Distance-based difficulty phases

The system SHALL apply difficulty progression using distance-based phases: 0-200m, 200-600m, 600-1200m, and 1200m+.

#### Scenario: Apply phase 1 baseline

- **WHEN** run distance is within 0-200m
- **THEN** the system SHALL use baseline world speed and generous obstacle spacing

#### Scenario: Escalate to higher phase

- **WHEN** run distance crosses a configured phase threshold
- **THEN** the system SHALL apply the next phase tuning for speed, spawn interval, and obstacle mix

### Requirement: Progressive speed and spawn tuning

The system SHALL increase `worldSpeed` and decrease `spawnInterval` gradually with configured safe limits.

#### Scenario: Increase challenge over time

- **WHEN** run distance increases within or across phases
- **THEN** world speed SHALL trend upward and spawn interval SHALL trend downward without abrupt spikes

#### Scenario: Enforce lower safety bound

- **WHEN** progression attempts to reduce spawn interval below configured minimum
- **THEN** the system SHALL clamp spawn interval at the minimum allowed value

### Requirement: Fairness constraints for obstacle generation

The obstacle generator MUST enforce constraints that prevent impossible jump sequences.

#### Scenario: Prevent impossible spacing

- **WHEN** generating a new obstacle
- **THEN** the generator SHALL enforce a minimum distance from prior obstacles based on current speed and jump envelope

#### Scenario: Reject invalid spawn candidate

- **WHEN** a randomly generated obstacle position violates fairness constraints
- **THEN** the system SHALL regenerate or delay the spawn until constraints are satisfied

### Requirement: Milestone and record feedback

The system SHALL provide gameplay feedback at regular distance milestones and when a new best score is achieved.

#### Scenario: Milestone message trigger

- **WHEN** the player reaches each 250m milestone in an active run
- **THEN** the system SHALL show a thematic progression message

#### Scenario: New record feedback

- **WHEN** the run distance exceeds stored best score
- **THEN** the system SHALL present immediate visual feedback indicating a new record
