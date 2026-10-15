## Purpose

Define reliable goal-oriented enemy decisions across the complete enemy roster while preserving the game's perception, combat, movement, and presentation contracts.

## ADDED Requirements

### Requirement: All supported enemies use one goal-oriented decision system
Every spawned Goblin, Warrior, Lancer, Archer, and Monk SHALL select autonomous activity through the shared GOAP system using its own knowledge and capability profile. Exactly one active action owner SHALL issue autonomous movement and voluntary attack requests for an enemy. Physical movement, animation, damage resolution, and immediate defensive reactions SHALL remain coordinated execution responsibilities rather than competing autonomous controllers.

#### Scenario: Complete roster is spawned
- **WHEN** authored spawners create any number of instances of the five supported enemy identities
- **THEN** each living instance has an independent goal, plan, and active action governed by the shared system
- **AND** no legacy autonomous decision path issues competing movement or attack requests

#### Scenario: Existing map loads
- **WHEN** an existing map uses the supported enemy identities
- **THEN** spawning, controls, HUD, art, sounds, health, damage, movement speeds, and collision rules retain their existing behavior

### Requirement: Planning composes actions with bounded work
Given a fact snapshot, selected goal, and finite available action instances, planning SHALL return a sequence whose predicted effects satisfy the goal, an already-satisfied outcome, or an explicit failure. Planning SHALL NOT mutate live game state. Identical inputs SHALL produce identical results. Configured work limits SHALL bound search for each request and across a gameplay update. Unreachable goals, cycles, and budget exhaustion SHALL terminate without executing an incomplete plan.

#### Scenario: Goal requires preparation
- **WHEN** shooting requires a valid firing position and a movement action can establish that condition
- **THEN** planning can produce movement followed by shooting, or just shooting when already eligible

#### Scenario: No solution or work budget exhausted
- **WHEN** no valid sequence is found within the configured limits
- **THEN** the result identifies unreachable or budget-exhausted status and the enemy follows bounded fallback behavior without blocking the game loop

#### Scenario: Already satisfied goal
- **WHEN** the input facts already satisfy the selected goal
- **THEN** no redundant action executes and the next meaningful decision does not enter a same-update infinite loop

### Requirement: Enemy knowledge remains local and time-bounded
Planning and target binding SHALL use only information permitted for that enemy by current perception, local interaction eligibility, and remembered evidence. One enemy's confirmation SHALL NOT reveal the player to another. The four perception states, evidence refresh rules, marker data, and configured de-escalation timers SHALL remain in effect. A visually confirmed ALERT enemy SHALL retain C060 hidden tracking only until its remaining timer expires; hidden tracking SHALL NOT refresh that timer. Non-tracking enemies SHALL retain occupied-bush traversal and attack restrictions.

#### Scenario: Two enemies observe concealment differently
- **WHEN** only one enemy confirmed the player before the player entered a bush
- **THEN** only that enemy can track hidden movement and choose eligible attacks during its remaining ALERT duration

#### Scenario: Hidden tracking expires
- **WHEN** that enemy's ALERT expires while the player remains hidden
- **THEN** live hidden coordinates become unavailable to its decision system, its remembered point freezes, and uncommitted player attacks cancel
- **AND** investigation uses remembered evidence without entering the player-occupied bush or bypassing normal collision

#### Scenario: Audio or local adjacency provides evidence
- **WHEN** an enemy receives an audio event or qualifies for a local adjacent-player interaction
- **THEN** that input grants only its existing scoped evidence or interaction eligibility, not ongoing knowledge of a non-adjacent unseen player's location

### Requirement: Priorities preserve immediate combat and awareness interruption
Eligible cardinal adjacent-player attacks for Goblin, Warrior, Lancer, and Archer SHALL take priority over patrol, investigation, pursuit, route retry, and alternate targets on the next active update, subject to concealment and protected action rules. Planning budgets SHALL NOT delay this existing response. Non-NONE awareness transitions SHALL discard obsolete navigation and preserve the existing entry stop before fresh reaction locomotion; repeated same-state detections SHALL NOT repeatedly stop valid movement. Returning to NONE SHALL allow a fresh normal decision without restoring obsolete routes.

#### Scenario: Player becomes adjacent during a bush decision
- **WHEN** a Goblin has selected a bush but an eligible player becomes cardinally adjacent
- **THEN** the next active update starts player attack preparation and obsolete bush navigation cannot overwrite it

#### Scenario: Awareness changes while moving
- **WHEN** an enemy enters a different non-NONE perception state during interruptible movement
- **THEN** old movement stops for the existing entry interruption and later movement comes from a fresh applicable goal
- **AND** protected attacks and higher-priority adjacent combat keep their existing precedence

### Requirement: Actions report actual execution outcomes
Actions SHALL distinguish running, succeeded, failed, and cancelled outcomes. Goal satisfaction SHALL reflect observed completion rather than merely applying predicted planning effects to the live world. Uncommitted actions SHALL revalidate relevant eligibility; committed attacks SHALL preserve existing target capture, animation, impact, projectile, and recovery rules. Death, disposal, and forced displacement SHALL follow existing interruption rules, and each gameplay timer SHALL advance at most once per active update.

#### Scenario: Shot misses
- **WHEN** an Archer finishes an accepted shot but the projectile misses
- **THEN** the completed shot is recorded without claiming the player was hit or killed

#### Scenario: Target changes before and after commitment
- **WHEN** a player becomes ineligible during attack centering
- **THEN** preparation cancels without sound, damage, or projectile release
- **AND** an already committed attack is not restarted or retargeted by ordinary replanning

#### Scenario: Immediate defense interrupts an action
- **WHEN** an existing eligible automatic defense supersedes movement or an attack
- **THEN** the executor observes the interruption, cancels obsolete pending work, and preserves the current defense and impact-cancellation rules

### Requirement: Recovery avoids stale plans and repeated failure loops
Relevant world changes or action failure SHALL invalidate affected future steps. Failed target and destination choices SHALL not be selected continuously from unchanged evidence; retries SHALL be delayed or an alternative reachable choice SHALL be used. Repeated valid evidence SHALL NOT cause unnecessary target switching or restart completed preparation. Fallback SHALL respect awareness, collision, concealment, and capabilities.

#### Scenario: Selected route becomes blocked
- **WHEN** an occupied cell or terrain change prevents reaching the bound destination
- **THEN** movement stops, the failure is recorded, and the enemy chooses a valid alternative or waits for bounded retry without teleporting or attacking out of range

#### Scenario: Several equivalent targets remain available
- **WHEN** current target and action remain valid and no higher-priority goal becomes eligible
- **THEN** equal-cost alternatives do not repeatedly replace the current action

### Requirement: Pause and lifecycle govern the complete brain
Paused gameplay SHALL freeze action progress, recovery, and perception timers. Dead or disposed enemies SHALL stop planning and issuing requests, release action resources, and invalidate delayed completion callbacks. Respawned instances SHALL start with fresh knowledge and action state.

#### Scenario: Pause during a shot or movement
- **WHEN** gameplay pauses during an action or recovery
- **THEN** no gameplay timer advances and resuming does not duplicate an attack or skip remaining recovery

#### Scenario: Enemy is replaced
- **WHEN** an enemy is disposed and another of the same type spawns
- **THEN** the old instance cannot affect the new one through targets, callbacks, routes, or cooldowns

### Requirement: Decisions expose developer diagnostics
The system SHALL provide a read-only diagnostic snapshot containing enemy identity, selected goal, planned steps, current action and phase, permitted target or remembered point, last replan or failure reason, and planning work consumed. These diagnostics SHALL leave normal gameplay unchanged with labels disabled and SHALL NOT expose forbidden live hidden-player coordinates. Developer Settings SHALL optionally present goal and action through Enemy AI Labels using boolean `debug.showEnemyAiLabels`, default `false`, with the existing persistence and Reset behavior.

#### Scenario: Developer inspects a stopped enemy
- **WHEN** an enemy cannot find a route or plan
- **THEN** its snapshot distinguishes blocked execution, exhausted planning budget, protected action, and waiting for retry

### Requirement: Optional labels expose current enemy intent
Developer Settings SHALL expose Enemy AI Labels independently of collider diagnostics, disabled by default and persisted/reset through existing settings. When enabled, each living enemy SHALL show its current goal and action above its displayed position, including waiting, recovery, and defense phases. Labels SHALL remain passive and SHALL NOT reveal forbidden hidden-player coordinates or affect decisions.

#### Scenario: Labels are toggled
- **WHEN** Enemy AI Labels is enabled while collider diagnostics is disabled
- **THEN** living enemies display readable Goal and Action labels and normal gameplay inputs continue working
- **AND** disabling or resetting the setting removes all labels immediately

#### Scenario: Enemy or viewport changes
- **WHEN** the enemy moves, the viewport resizes, or the enemy dies or is disposed
- **THEN** labels follow the displayed living enemy or disappear for an inactive enemy without stale graphics
