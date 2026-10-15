## MODIFIED Requirements

### Requirement: All supported enemies use one goal-oriented decision system
Every spawned Goblin, Warrior, Lancer, Archer, and Monk SHALL select autonomous activity through the shared GOAP system using its own knowledge and capability profile. Exactly one active action owner SHALL issue autonomous movement and voluntary attack requests for an enemy. Physical movement, animation, damage resolution, and immediate defensive reactions SHALL remain coordinated execution responsibilities rather than competing autonomous controllers. A profile-driven immediate response MAY interrupt or replace the current GOAP action only through that shared owner, and SHALL return control to a fresh applicable GOAP decision after the response completes or is abandoned.

#### Scenario: Complete roster is spawned
- **WHEN** authored spawners create any number of instances of the five supported enemy identities
- **THEN** each living instance has an independent goal, plan, and active action governed by the shared system
- **AND** no legacy autonomous decision path issues competing movement or attack requests

#### Scenario: Existing map loads
- **WHEN** an existing map uses the supported enemy identities
- **THEN** spawning, controls, HUD, art, sounds, health, damage, movement speeds, and collision rules retain their existing behavior

#### Scenario: Immediate response replaces a current route
- **WHEN** a Warrior's eligible knife-impact response selects guard or tactical flee while it has an interruptible autonomous route
- **THEN** the shared action owner coordinates the response without a second controller issuing movement or attack requests

## ADDED Requirements

### Requirement: Monk GOAP priorities remain non-combat
The Monk capability profile SHALL not offer a voluntary attack action. A permitted player-proximity flee within two cardinal grid cells SHALL outrank gold seeking and patrol. Gold seeking SHALL outrank patrol only after the Monk's normal idle interval and only when its configured 45 percent deterministic roll selects that behavior. Normal GOAP decisions SHALL use only the Monk's permitted per-enemy perception and current world snapshots.

#### Scenario: Flee preempts a selected gold route
- **WHEN** a Monk is pursuing gold and the player becomes eligible and within two cardinal grid cells
- **THEN** the shared action owner abandons the gold route and starts the Monk's applicable flee decision

#### Scenario: Monk has no combat action
- **WHEN** a player or sheep is adjacent to a Monk
- **THEN** the Monk's plan contains no voluntary attack action

### Requirement: Warrior knife responses are independently resolved
For every eligible adjacent player knife impact against a living Warrior, the shared GOAP integration SHALL request one independent deterministic response outcome before resolving the impact. The response SHALL not run when existing perception and interaction rules do not permit the Warrior to target the player. It SHALL neither refresh perception evidence nor reveal hidden player coordinates to another enemy.

#### Scenario: Consecutive eligible knife impacts
- **WHEN** two eligible adjacent player knife impacts occur against the same living Warrior
- **THEN** the system makes two independent response selections without applying a special-response cooldown

#### Scenario: Concealed player is not targetable
- **WHEN** existing concealment rules prevent a Warrior from targeting a player
- **THEN** a player knife impact does not grant an additional response that relies on the hidden player's location
