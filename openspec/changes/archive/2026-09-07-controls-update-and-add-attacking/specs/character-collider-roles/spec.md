## MODIFIED Requirements

### Requirement: Combat overlap preserves existing damage rules
Projectile targeting and contact-damage overlap checks SHALL use combat colliders. Player-to-enemy walking/contact damage SHALL be disabled. Explicit knife impacts SHALL use direct damage-collider overlap at the swing midpoint and deal 25 damage per living enemy once per swing. Existing enemy attack-state gates, enemy-to-sheep contact behavior, projectile rules, and contact-pair reset behavior SHALL remain unchanged.

#### Scenario: Combat colliders overlap without an active damage trigger
- **WHEN** two combat colliders overlap but the existing actor-state and movement rules do not permit damage
- **THEN** neither actor receives damage solely because of the overlap

#### Scenario: Existing contact trigger is satisfied
- **WHEN** an enemy and sheep overlap and their existing contact rule permits damage
- **THEN** damage is applied with the existing amount and contact-pair behavior

### Requirement: Collider diagnostics distinguish both roles
Collision diagnostics SHALL render every living character's combat collider in red and SHALL then render that character's movement collider in green so the green movement shape appears on top wherever the two overlap.

#### Scenario: Diagnostics show overlapping collider roles
- **WHEN** collision diagnostics are visible for any supported character
- **THEN** its red combat rectangle is drawn first and its green movement circle is drawn afterward

### Requirement: Character collider roles are distinct
The player and enemies SHALL expose a green movement collider as a solid physics shape and a red combat collider as a separate trigger shape. Movement collision tests SHALL use only solid movement shapes; combat overlap tests SHALL use only combat trigger shapes.

#### Scenario: Movement colliders are routed to movement physics
- **WHEN** a character moves
- **THEN** its green movement shape SHALL participate in terrain and character separation, while its red combat shape SHALL be excluded from movement blocking

#### Scenario: Combat colliders are routed to combat events
- **WHEN** an attack checks targets
- **THEN** only the red trigger overlap SHALL determine candidate contact, subject to the existing combat rules
