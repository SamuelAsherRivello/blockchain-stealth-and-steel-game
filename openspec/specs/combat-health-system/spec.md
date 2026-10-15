# combat-health-system Specification

## Purpose
Provides a shared health and defeat model so player, sheep, and goblin entities can
receive damage from defined combat interactions and transition into a consistent
death animation when health reaches zero.

## Requirements

### Requirement: Entities start with health
Each player, sheep, and goblin entity SHALL start with exactly 100 health points and SHALL track current health internally during gameplay.

#### Scenario: Initial health state
- **WHEN** gameplay starts
- **THEN** the hero, sheep, and enemy each have 100 current health points

### Requirement: Damage is applied only by defined sources and amounts
The system SHALL apply damage only through the defined interaction matrix and SHALL ignore all other contact sources for damage. A successful ordinary player dagger move SHALL deal exactly 25 base damage once to each eligible living Goblin, Warrior, Lancer, Archer, or Monk through direct damage-collider overlap at that move's configured impact. A confirmed C072 combo move SHALL instead deal its configured dagger multiplier times the same 25 base damage once to every eligible overlapping enemy. Dagger hits SHALL retain existing hit feedback, supported knockback, and death handling; projectile-only defense SHALL not reject dagger damage. An arrow approaching from the direction the Warrior is already facing SHALL always trigger defense and deal no damage. An arrow approaching from behind SHALL never trigger defense and SHALL reduce Warrior health by 50. An upward-moving arrow SHALL be defended only when its 50% defense attempt succeeds. A downward-moving arrow SHALL never be defended and SHALL reduce Warrior health by 50.

#### Scenario: Sheep is hit by goblin
- **WHEN** the sheep collider overlaps a goblin collider as a result of touch
- **THEN** sheep health is reduced by 100 and no other damage type is applied in the same frame

#### Scenario: Hero shoots sheep
- **WHEN** a hero arrow collider overlaps a sheep collider
- **THEN** sheep health is reduced by 100

#### Scenario: Hero shoots goblin
- **WHEN** a hero arrow collider overlaps a goblin collider
- **THEN** goblin health is reduced by 50

#### Scenario: Hero shoots undefended Warrior
- **WHEN** a hero arrow approaches from behind and overlaps the Warrior
- **THEN** Warrior health is reduced by 50 and the normal arrow-hit lifecycle applies

#### Scenario: Hero shoots defending Warrior
- **WHEN** a hero arrow approaches from the direction the Warrior is facing and overlaps the Warrior
- **THEN** Warrior health does not change and the arrow enters its deflected lifecycle

#### Scenario: Upward arrow hits Warrior
- **WHEN** an upward-moving hero arrow overlaps the Warrior after its 50% defense attempt
- **THEN** it is deflected for no damage on success or reduces Warrior health by 50 on failure

#### Scenario: Downward arrow hits Warrior
- **WHEN** a downward-moving hero arrow overlaps the Warrior
- **THEN** Warrior health is reduced by 50 and the normal arrow-hit lifecycle applies

#### Scenario: Hero walks into goblin
- **WHEN** the hero collider overlaps the goblin collider while the hero is moving
- **THEN** goblin health is unchanged unless a dagger move reaches its configured impact with overlapping damage colliders

#### Scenario: Goblin damages hero only during attack swing
- **WHEN** the goblin reaches its swing damage event and the living hero overlaps its committed directional damage area, including the cardinally adjacent cell
- **THEN** hero health is reduced by 25 exactly once for that swing

#### Scenario: Goblin touching hero outside attack swing
- **WHEN** the goblin overlaps the hero while not in an attack damage phase
- **THEN** the hero health does not change

#### Scenario: Knife hits each enemy type
- **WHEN** a successful ordinary or confirmed combo dagger move hits a living Goblin, Warrior, Lancer, Archer, or Monk
- **THEN** its health decreases by that move's base or configured combo damage once and existing hit or lethal feedback runs

#### Scenario: Four isolated knife hits defeat an enemy
- **WHEN** an enemy starting at its existing 100 health receives four successful ordinary dagger impacts with no other damage
- **THEN** its health progresses through 75, 50, 25, and 0
- **AND** at zero health its existing death lifecycle begins and it stops accepting damage

### Requirement: Death animation triggers at zero health
When an entity health reaches 0 or below, the entity SHALL stop voluntary movement and SHALL run a 250ms death animation unless a defined stealth execution applies. Normal non-player entities SHALL animate in place. The player SHALL complete the lethal hit's collision-limited knockback during its normal death animation, without accepting further attacks or player input. A stealth execution target SHALL instead receive a stronger execution knockback while shrinking, fading, and rotating three full times across 0.8 active seconds.

#### Scenario: Entity dies from projectile
- **WHEN** hero arrow damage causes a target health to reach 0 or below
- **THEN** the target stops moving immediately and plays a 250ms in-place death animation that scales from current scale to 0, fades opacity from 1 to 0, and rotates randomly by -20° or +20°

#### Scenario: Player dies from an enemy hit
- **WHEN** an enemy hit reduces player health to zero or below
- **THEN** the player receives that hit's knockback while shrinking, fading, and rotating for 250ms, and finishes forced travel before death completion

#### Scenario: Enemy dies from a stealth execution
- **WHEN** a current rear-cell execution defeats a living enemy
- **THEN** that enemy receives the defined stronger execution knockback while shrinking and fading through three full rotations for 0.8 active seconds

### Requirement: Stealth execution is a defined lethal combat source
A valid stealth execution SHALL reduce only its selected living enemy to zero health immediately. It SHALL reveal the existing health meter's zero state and remove that enemy's active combat collider during its execution death presentation. It SHALL not apply ordinary knife damage to the target or any other entity.

#### Scenario: Execution target is living
- **WHEN** the player begins a valid execution against its selected living enemy
- **THEN** that enemy's health becomes zero exactly once
- **AND** it cannot accept later damage during its death presentation

#### Scenario: Nearby enemy overlaps the player
- **WHEN** an unselected living enemy overlaps the player during an execution start
- **THEN** that enemy's health does not change because of the execution

### Requirement: Execution grants temporary player damage immunity
While a valid execution presentation is active, every defined incoming damage source SHALL leave player health unchanged. The immunity SHALL end when the 0.8-second execution presentation ends or when normal player teardown takes precedence.

#### Scenario: Arrow reaches the player during execution
- **WHEN** a gameplay enemy arrow overlaps the player during an execution presentation
- **THEN** the player takes no arrow damage

#### Scenario: Melee impact reaches the player during execution
- **WHEN** an enemy committed melee impact reaches the player during an execution presentation
- **THEN** the player takes no melee damage

### Requirement: Shared character health visibility on change
Every player, enemy character type, and sheep SHALL use the same compact green health fill, dark background, and thin border without numeric text. A meter SHALL start hidden and appear only when its character's current health changes. Actual health SHALL change immediately; presentation SHALL animate independently using gameplay time and pause with gameplay.

#### Scenario: A character takes damage while its meter is hidden
- **WHEN** current health changes from a previous value to a new value
- **THEN** the meter fades in for 0.1 seconds while showing the previous value, then animates its fill to the new value over 0.1 seconds
- **AND** after 1 second measured from the latest health change it fades out over 0.1 seconds

#### Scenario: Another change arrives during a fill transition
- **WHEN** health changes while the fill is animating or holding
- **THEN** the fill animates from its currently displayed value to the latest health over a fresh 0.1 seconds without snapping
- **AND** the hide timer restarts at that health change

#### Scenario: Another change arrives during a fade
- **WHEN** health changes during fade-in
- **THEN** the existing fade-in finishes while retaining the displayed health, then the fill animates to the latest health over 0.1 seconds
- **WHEN** health changes during fade-out
- **THEN** the meter fades back in from its current opacity over 0.1 seconds, then animates to the latest health over 0.1 seconds
- **AND** either change restarts the hide timer

#### Scenario: Health does not change
- **WHEN** a character spawns, a hit is blocked, or an update leaves current health unchanged
- **THEN** its meter is not revealed and its hide timer is not extended

#### Scenario: A character dies or revives
- **WHEN** lethal damage reduces character health to zero or below
- **THEN** the displayed fill animates to zero and the meter remains eligible to render during the existing 0.25-second death animation
- **AND** the meter disappears when the character becomes dead, even if its normal timeout has not elapsed
- **WHEN** an existing dead character revives with restored health
- **THEN** the meter starts a fresh reveal and fill transition for the restored health

### Requirement: Shared overhead placement
Perception icons and health meters SHALL be anchored to each character's logical center plus a centrally configured character-type-specific overhead offset, separate from artwork offsets. The perception icon SHALL occupy a fixed slot above the health bar, which SHALL clear the character's head. Both elements SHALL follow the same movement, visual jump displacement, and camera translation independently of debug visibility settings.

#### Scenario: Perception and damage occur together
- **WHEN** a perception icon and health bar are visible for the same character
- **THEN** both remain readable with a gap accommodating the icon at its full animation size
- **AND** neither element changes position when the other appears or disappears

### Requirement: Bushes participate in shared health without visible UI
Each bush SHALL start with exactly 100 health, accept damage only while living, and expose no health bar or numeric health value during gameplay.

#### Scenario: Bush starts undamaged
- **WHEN** a bush placement becomes active in gameplay
- **THEN** it has 100 current health and no visible health UI

#### Scenario: Non-goblin contact reaches a bush
- **WHEN** character movement, a projectile, or another undefined source overlaps a bush
- **THEN** the bush takes no damage

### Requirement: Goblin fire swings deal 50 bush damage once per swing
A successful goblin fire swing SHALL reduce the targeted living bush's health by exactly 50 once, regardless of how many update frames its colliders remain overlapping. A swing SHALL be successful only when the goblin movement-collider center cell and bush combat-collider center cell are exactly one cardinal cell apart at attack commitment. An undamaged bush SHALL therefore require two successful swings to reach zero health.

#### Scenario: First fire swing lands
- **WHEN** a goblin's committed bush swing reaches its damage event against a 100-health bush
- **THEN** the bush has 50 health and starts one Fire 3 cycle

#### Scenario: Second fire swing lands
- **WHEN** a later committed bush swing reaches its damage event against the same 50-health bush
- **THEN** the bush reaches zero health and starts its second Fire 3 cycle

#### Scenario: Swing remains overlapped
- **WHEN** one goblin swing overlaps the bush combat collider across multiple update frames
- **THEN** only one 50-damage event and one Fire 3 cycle are recorded for that swing

#### Scenario: Hit geometry overlaps without cardinal adjacency
- **WHEN** projected attack geometry overlaps a bush but the authoritative collider-center cells are not exactly one cardinal cell apart
- **THEN** no bush attack is committed and the bush takes no damage

### Requirement: Lethal bush damage waits for the second fire cycle before visual death
When a bush reaches zero health from its second fire swing, it SHALL immediately stop accepting damage and cease being a living AI target, but SHALL remain visibly in place until that swing's complete Fire 3 cycle ends. It SHALL then run the shared 250 ms in-place death animation, shrinking to zero, fading from opaque to transparent, and rotating randomly by -20 degrees or +20 degrees before removal.

#### Scenario: Second fire cycle is playing
- **WHEN** a bush has reached zero health and its second Fire 3 cycle has not completed
- **THEN** the bush remains visible but is not attackable, targetable, or damageable

#### Scenario: Second fire cycle completes
- **WHEN** the zero-health bush's second Fire 3 cycle reaches its final frame
- **THEN** the bush begins the shared 250 ms spin, fade, and shrink death animation

#### Scenario: Death animation completes
- **WHEN** the bush's death animation reaches zero scale and opacity
- **THEN** the bush and its gameplay fire-effect resources are removed from active rendering and updates

### Requirement: Enemy melee hits are counted per committed swing
Goblin, Warrior, and Lancer SHALL deal 25 damage to a living player once per successful committed swing at the attack damage event. The directional hit area SHALL include the attacker's cell and the immediately cardinally adjacent cell in its locked attack direction. The player's current combat collider SHALL overlap that area at impact. Body overlap SHALL NOT be required for an adjacent hit. Idle contact, recovery, misses, and Archer shooting SHALL NOT inflict melee damage. Each later accepted swing SHALL be eligible to hit again without requiring body separation.

#### Scenario: Four successful melee hits
- **WHEN** a 100-health player receives four successful swings
- **THEN** health progresses through 75, 50, 25, and 0 and defeat begins on the fourth hit

#### Scenario: Consecutive adjacent attacks
- **WHEN** any melee enemy attacks a player in its adjacent target cell across multiple swings without overlapping bodies
- **THEN** each successful swing deals exactly 25 damage once

#### Scenario: Repeated frames or multiple attackers
- **WHEN** one swing remains active across multiple updates while another enemy lands an independent swing
- **THEN** each swing contributes at most one 25-damage hit and no damage is accepted after death begins

#### Scenario: Player escapes the committed direction
- **WHEN** the player leaves the committed directional damage area before impact
- **THEN** the swing misses without retargeting or damaging the player

### Requirement: Enemy arrows can damage the player
A gameplay enemy Archer arrow SHALL participate in collision and SHALL deal 25 damage once when it hits the living player, then disappear immediately with its collider and never land. Collision SHALL follow the visible ballistic arrow throughout flight, including rise, descent, and the final pre-landing segment, without tunneling across a player during long frames. Player-owned arrows SHALL NOT damage the player. Existing damage and defense behavior for other targets SHALL remain unchanged.

#### Scenario: Four enemy arrows hit
- **WHEN** four enemy arrows successfully hit a player initially at 100 health
- **THEN** each arrow deals 25 damage and the fourth starts defeat

#### Scenario: Mixed attack sources
- **WHEN** two successful melee hits and two enemy arrow hits reach a player initially at 100 health
- **THEN** the fourth total hit starts defeat

#### Scenario: Own projectile or repeated arrow overlap
- **WHEN** a player-owned arrow overlaps the player or a consumed enemy arrow overlaps again
- **THEN** no player damage is applied

### Requirement: Every successful enemy hit applies ranked player knockback
Every successful enemy hit SHALL push the player in the hit direction over 200 ms of active gameplay time, including lethal hits. In unobstructed space an isolated Goblin hit SHALL move the player 0.25 grid cell, Archer 0.5, Warrior 0.75, and Lancer 1.0, using the configured grid dimensions. Melee SHALL push away from the attacker and arrows SHALL push along their travel direction. Blocking terrain, world bounds, and blocking actors SHALL limit travel without penetration. Missed, ignored, or duplicate hits SHALL produce no knockback. Voluntary input SHALL NOT cancel knockback. A later accepted hit SHALL replace unfinished knockback from the current player position.

#### Scenario: Ordered distances in open space
- **WHEN** each enemy type independently lands one hit on a stationary player with unobstructed travel
- **THEN** displacement is 0.25, 0.5, 0.75, and 1.0 grid cells for Goblin, Archer, Warrior, and Lancer respectively, within 5 percent of each target distance across supported frame rates

#### Scenario: Wall blocks the push
- **WHEN** the player's knockback path reaches blocking geometry before the intended distance
- **THEN** movement stops at the collision boundary without passing through the obstacle

#### Scenario: Another hit during knockback
- **WHEN** a second successful hit arrives before the first impulse finishes
- **THEN** it deals its damage and starts its own knockback from the current position, replacing remaining travel

#### Scenario: Lethal Lancer hit
- **WHEN** a Lancer hit is lethal and the path is unobstructed
- **THEN** the player travels approximately one full grid cell during the death animation before the loss prompt appears

### Requirement: Grounded arrows are harmless owner-only pickups
An Archer arrow that finishes its flight without a consumed hit SHALL stick in the ground. Only then SHALL its non-blocking pickup combat collider activate around the visible grounded arrow. Overlap with the living Archer who fired it SHALL immediately disable the pickup collider and play the existing bush sound exactly once. The arrow SHALL rise 50 pixels and fade over 0.18 active seconds using the gold pickup animation, then its sprite SHALL be removed. During that animation it SHALL have no further interactions. This SHALL be its only interaction after landing: it SHALL NOT damage, block, deflect, or react to the player, other Archers, other characters, or objects. Uncollected arrows SHALL persist until ordinary level cleanup with no timeout or capacity-based eviction; new shots SHALL remain possible when the initial sprite capacity is filled.

#### Scenario: Player is struck anywhere along flight
- **WHEN** an arrow crosses the living player's combat collider during ascent, descent, or the final segment of a long update before landing
- **THEN** the player takes one 25-damage hit and the arrow disappears immediately without leaving a grounded arrow

#### Scenario: Only the firing Archer collects a missed arrow
- **WHEN** the living firing Archer's combat collider overlaps its grounded arrow
- **THEN** the pickup collider disappears and the bush sound plays once in the same update, while the arrow sprite rises and fades like gold for 0.18 active seconds before removal

#### Scenario: Flying arrow is not a pickup
- **WHEN** the firing Archer overlaps its arrow before it has landed
- **THEN** no pickup occurs and no pickup sound plays

#### Scenario: Another entity overlaps a grounded arrow
- **WHEN** the player, another Archer, an NPC, another enemy, or an object overlaps a grounded arrow
- **THEN** the arrow remains with no damage, blocking, defense, pickup sound, or other interaction

#### Scenario: Grounded arrows outlast their owner and initial capacity
- **WHEN** an arrow remains uncollected, its owner dies, or later shots exceed the initial sprite capacity
- **THEN** the grounded arrow stays visible and harmless until ordinary level cleanup, and later shots can still be created
