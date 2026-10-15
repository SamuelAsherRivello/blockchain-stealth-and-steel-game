import { createStealthAttackController, createStealthAttackGravity, createStealthAttackShadowLifecycle, createStealthExecution } from '../../runtime/gameplay/stealth-attack.js';
import { createCombatActorState } from '../../runtime/gameplay/combat-actor.js';

const canvas = document.querySelector('#scene');
const context = canvas.getContext('2d');
const output = document.querySelector('#result');
const tile = 64;
const enemy = { id: 'goblin-1', isAlive: true, cell: { x: 4, y: 1 }, position: { x: 288, y: 96 }, heading: 'right' };
const opportunities = createStealthAttackController({ tileSize: tile });
const shadows = createStealthAttackShadowLifecycle();
const gravity = createStealthAttackGravity();
const execution = createStealthExecution();
let killed = false;
const combat = createCombatActorState({ getCombatCollider: () => ({ x: 256, y: 64, width: 64, height: 64 }), setVisualTransform() {} });

function draw({ shadow, player, lunge = 0, dead = false }) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#466a4a';
  for (let x = 0; x <= canvas.width; x += tile) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke(); }
  for (let y = 0; y <= canvas.height; y += tile) { context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke(); }
  if (shadow) { context.fillStyle = `rgb(255 214 26 / ${shadow.opacity})`; context.fillRect(shadow.interactionPosition.x - tile / 2, shadow.interactionPosition.y - tile / 2, tile, tile); }
  context.fillStyle = dead ? '#77344b' : '#d65b4c'; context.fillRect(256, 64, 64, 64);
  context.fillStyle = '#62d1a8'; context.fillRect(player.x - 22 + lunge, player.y - 22, 44, 44);
}

const zones = opportunities.update([enemy], .251);
const fadedIn = shadows.update(zones, .125)[0];
const player = { x: 184, y: 96 };
gravity.observe(zones, player);
Object.assign(player, gravity.step(.125));
const sourcePosition = gravity.getSourcePosition();
const audioSuppressed = gravity.isAudioSuppressed();
const armed = gravity.consume(player);
const lunge = execution.start({ x: 1, y: 0 }) && execution.advance(.4);
if (armed) killed = combat.applyStealthKill({ x: 1, y: 0 });
draw({ shadow: fadedIn, player, lunge: lunge.visualOffset.x, dead: killed });

const cancellation = createStealthAttackController({ tileSize: tile });
cancellation.update([enemy], .251);
const cancelled = cancellation.update([{ ...enemy, heading: 'up' }], 0).length === 0;
const overlap = createStealthAttackGravity();
overlap.observe([
  { id: 'later', enemyId: 'later', token: 0, order: 1, interactionPosition: player },
  { id: 'first', enemyId: 'first', token: 0, order: 0, interactionPosition: player },
], player);
const result = {
  complete: Boolean(fadedIn && armed && killed && lunge.active && cancelled && overlap.getArmed()?.enemyId === 'first'),
  yellowFade: fadedIn.opacity,
  rearPull: player,
  immediateTurnCancellation: cancelled,
  deterministicOverlapOwner: overlap.getArmed()?.enemyId,
  horizontalOnly: cancelled,
  playerFacesSource: sourcePosition?.x > player.x,
  audioSuppressedDuringEntry: audioSuppressed,
  visualOnlyLungePixels: lunge.visualOffset.x,
  targetDead: combat.health === 0,
  executionDurationSeconds: .8,
};
result.complete &&= result.horizontalOnly && result.playerFacesSource && result.audioSuppressedDuringEntry;
output.dataset.result = JSON.stringify(result);
output.textContent = `${result.complete ? 'PASS' : 'FAIL'}\n${JSON.stringify(result, null, 2)}`;
