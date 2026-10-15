## ADDED Requirements

### Requirement: Warrior varies its response to an eligible player knife impact
For every eligible adjacent player knife impact against a living Warrior, the Warrior SHALL make one independent deterministic selection before the impact resolves: fight with 60 percent probability, take the hit without an immediate response with 20 percent probability, guard and block that triggering knife hit with 10 percent probability, or choose a tactical flee two to four cells from the player with 10 percent probability. The four outcomes SHALL use non-overlapping probability buckets that cover every roll. Only the guard outcome SHALL block the triggering knife hit; fight and tactical flee preserve the normal damage resolution for that hit. The Warrior SHALL not apply a special-response cooldown. The selected tactical flee SHALL use a safe reachable destination in the required range or be abandoned as specified by the shared tactical-flee rule.

#### Scenario: Fight outcome is selected
- **WHEN** an eligible knife-impact response roll is below 0.60
- **THEN** the Warrior preserves normal combat behavior and the triggering knife hit resolves normally

#### Scenario: Take-hit outcome is selected
- **WHEN** an eligible knife-impact response roll is at least 0.60 and below 0.80
- **THEN** the Warrior does not start an immediate guard or tactical flee response and the triggering knife hit resolves normally

#### Scenario: Guard outcome is selected
- **WHEN** an eligible knife-impact response roll is at least 0.80 and below 0.90
- **THEN** the Warrior enters guard in time to fully negate the triggering knife hit

#### Scenario: Tactical flee outcome is selected
- **WHEN** an eligible knife-impact response roll is at least 0.90
- **THEN** the Warrior attempts a safe reachable flee route to a destination two to four cells from the player and the triggering knife hit resolves normally

#### Scenario: Tactical flee cannot be routed
- **WHEN** the tactical flee outcome is selected but no safe reachable destination in the two-to-four-cell range exists
- **THEN** the Warrior abandons the flee without taking a shorter escape and follows normal fight-or-take-hit behavior
