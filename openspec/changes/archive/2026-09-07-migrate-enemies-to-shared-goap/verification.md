# C063 implementation verification — 2026-09-07

Implemented all five profiles, the shared planner/executor/action library, production spawn/update/disposal wiring, and optional Enemy AI Labels. Confirmed interview decisions are incorporated into proposal, design, diagnostics specification and C063-T028. Existing task IDs are preserved.

## Automated checks

- Focused GOAP, real-actor adjacency and real-actor attack preparation: **276/276 passed**. Existing combat regressions now exercise the shared brain, including exact centering, configured grid sizes, concealment expiry, heading/animation, recovery timing, stale targets, pause and disposal.
- New planner/executor/profile/navigation/label tests cover cost composition, deterministic ties, depth/expansion limits, cycles, scalar bindings, isolated execution state, generation invalidation, FIFO service, expired knowledge, deferred-plan priority, target capabilities, independent settings, and cleanup.
- A 900-frame simulation with 20 mixed brains, repeated enclosure and release passed under deliberately tighter budgets of 8 ordinary planning expansions and 128 navigation cells per active frame. All 20 received movement service; disposal cleared every queued request.
- Full repository suite: **838/840 passed** at the final run. No C063-specific failures remain.
- Production build: **passed** (existing large-bundle advisory remains).
- Strict validation: `npm run openspec -- validate migrate-enemies-to-shared-goap --strict` **passed**.
- Scoped whitespace checks for C063 pass. Repository-wide `git diff --check` reports unrelated trailing spaces in the concurrently edited `Level01.tmj` (lines 172, 197, 245, 257, 493 at the check).

Two unrelated full-suite failures were left untouched:

1. `release/repository-layout.test.js`: public UI artwork remains outside `public/assets/images`; the initial baseline already failed this rule (then `Icon_03.png`, final run `BigBlueButton_Regular.png`). Initial baseline was 804/805 passing.
2. `systems/environment/reactive-decoration-tiled.test.js`: the concurrently edited Level01 now normalizes six bushes while the test expects five. C063 does not edit that map or test.

## Browser acceptance

Live development URL: **http://127.0.0.1:5174/**. Port 5173 was occupied. Chrome was used with production Babylon rendering and real actor, animation, projectile, melee-impact and reactive-decoration modules.

Main game: all five production enemy types expose GOAP snapshots through the existing navigation diagnostics. Startup, HUD, controls and settings work; no browser errors were observed. Labels were visibly rendered above Goblin, Warrior, Lancer, Archer and Monk with Collider off. Archer's old automatic shot selector is removed rather than left behind a migration switch.

Controlled fixture: `/src/test/browser/goap-roster.html`, 20 enemies per scenario, four instances of each type:

- **Combat:** each Goblin started three attacks; each Warrior eight; each Lancer eleven. Production melee impacts applied damage. Each Archer started four shots, with three actual arrows released before the capture ended during the fourth animation. No enemy moved during a committed attack. Every Monk recorded zero attacks and heals.
- **Range:** each Archer moved into range and released two arrows from three accepted shots. No retreat behavior was introduced.
- **Bush:** each Goblin completed two accepted burns; four production reactive bushes lost 100 health each, for 400 damage total, and Goblins resumed patrol. Damage remains 50 per burn.
- **Blocked:** every type stopped safely and displayed retry/waiting, with bounded planning and no movement or attacks through enclosure.
- **Roam:** all five types moved in the coarse-step exercise. A second run at the production 0.05 s timestep cap recorded no active retries after 3.05 s.
- **Knowledge:** only visually confirmed enemies tracked the hidden player. Fifteen unconfirmed enemies retained no hidden-player memory and initiated no attacks. After alert expiry, confirmed enemies retained the old remembered cell despite a later hidden move; both isolation and expiry assertions passed.
- **Pause/disposal:** every completed scenario preserved snapshots on zero delta and removed disposed-enemy label commands. The canvas is cleared on completion.

The main Developer Settings checkbox was default-off, could be enabled with Collider off, survived reload independently, and could be disabled with Collider on. Reset cleared both preferences and immediately removed label graphics. A real rendered-viewport resize from 960 to 480 px kept the gameplay and label canvases at matching widths/heights (1024 to 512 px) and labels followed the actors. The Chrome browser-level viewport override did not change its reported viewport dimensions, so that mechanism is not counted as mobile-window coverage; canvas resize, camera-compatible positioning and height/jump calculations were checked separately.

## Measured work and timing

Measurements are CPU time around scheduler + 20 brain/actor updates, excluding GPU rendering. Each row below has 61 samples. The first five scenarios used a deliberately coarse 0.1 s active step; the last uses the production maximum 0.05 s step.

| Scenario | Median update ms | P95 update ms | Max ordinary expansions | Max immediate expansions | Max navigation cells |
| --- | ---: | ---: | ---: | ---: | ---: |
| Combat | 0.90 | 1.80 | 3 | 16 | 5 |
| Roam, coarse step | 0.80 | 2.60 | 20 | 20 | 283 |
| Enclosed | 0.60 | 2.00 | 20 | 20 | 20 |
| Bush | 0.80 | 3.30 | 20 | 16 | 960 |
| Range | 0.90 | 2.80 | 24 | 16 | 960 |
| Roam, production cap | 0.90 | 2.20 | 20 | 0 | 275 |

All measured work is below configured ordinary planning/navigation caps (1024/4096). Immediate one-action requests are separately counted and do not wait behind ordinary requests. The coarse timestep intentionally also exercises recovery beyond normal frame clamping.

Chrome throttled these background automation tabs: observed frame intervals were approximately **1000 ms median / 1017 ms P95**. This is an explicit measurement limitation; these runs establish bounded work and functional behavior, not foreground FPS or a speedup over the previous AI. No performance superiority is claimed.

## Scope and handoff

The reusable action contract, profile units, compatibility matrix, folder structure and two-profile melee example are in `stealth-steel/src/runtime/ai/README.md`. Deliberate changes are Archer approach-to-range, stable valid bush binding, and bounded invalid-plan recovery. Legacy controller modules remain available to historical fixtures/tests but are absent from production factory wiring. Player, Sheep, defense probabilities, damage/stat tuning, Tiled authoring, and unrelated UI/camera changes were not migrated by C063.

Implementation acceptance preceded release work. On 2026-09-07, the user approved the result and requested synchronization, archive, commit, push, and a new release. C063's three delta capabilities were verified against the synchronized main specifications before archiving; all 48 main specifications validated and all 28 task IDs were preserved.

The release preflight completed a clean `npm ci` (zero reported vulnerabilities), all 843 repository tests, all seven publishing checks, and the production build. This preflight covers the current combined checkout, including concurrent camera/UI changes; release scope and branch reconciliation remain to be settled before publishing. The earlier two full-suite exceptions no longer occur in this checkout.
