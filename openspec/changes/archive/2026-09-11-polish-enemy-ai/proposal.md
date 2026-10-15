## Why

Adjacent Warrior combat currently feels too relentless, while Monk and Goblin
have less distinct environmental behavior than intended. C072 makes each
archetype more readable without weakening the existing perception, collision,
or player-only pickup contracts.

## What Changes

- Give each eligible adjacent player knife impact against a Warrior an
  independent outcome: 60% fight, 20% take the hit, 10% guard and block that
  hit, or 10% flee two to four cells.
- Make Monks non-damaging blockers: they flee when the player is within two
  cells and, after idling, have a 45% chance to walk to the nearest reachable
  gold pickup without collecting it.
- Raise the Goblin's post-combat patrol bush-burning roll from 25% to 35%.
- When the chosen Warrior or Monk flee has no safe two-to-four-cell route,
  abandon that flee choice and use the archetype's normal behavior rather
  than a shorter recovery escape.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `actor-ai-behaviors`: define Monk proximity fleeing and non-collecting gold
  seeking, update Goblin bush-burning probability, and distinguish tactical
  flee failure from shared movement recovery.
- `enemy-goap`: define profile-driven Warrior responses and Monk priorities in
  the shared brain without weakening perception or action-ownership rules.
- `warrior-character`: define knife-impact shield blocking and tactical flee
  outcomes alongside existing arrow defense.

## Impact

The shared enemy profile and GOAP brain, Warrior guard and melee damage
routing, main-loop world snapshots, focused AI/combat tests, and the three
enemy profile definitions are affected. No dependencies, map data, pickup
ownership, or player controls change.
