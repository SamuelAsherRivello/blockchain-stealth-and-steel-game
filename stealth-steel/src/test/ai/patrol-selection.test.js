import test from 'node:test';
import assert from 'node:assert/strict';
import { patrolAction } from '../../runtime/ai/actions/patrol.js';

const candidate = (x, y = 0) => ({ cell: { x, y }, route: [{ x, y }] });
function select(options, peers, draws = [0, 0], extra = {}) {
  let selector, destination = null, index = 0;
  const random = () => draws[index++] ?? 0;
  const context = { id: 'self', actor: { getGridPosition: () => ({ x: 0, y: 0 }) }, grid: { tileSizePx: 64 },
    profile: { patrolMode: 'route', patrolCells: [1, 5], homeRadius: null }, spawnCell: { x: 0, y: 0 }, random,
    choose: values => values[Math.min(values.length - 1, Math.floor(random() * values.length))],
    getPatrolPeers: () => peers, setPatrolDestination: cell => { destination = cell; },
    navigation: { start: fn => { selector = fn; }, cancel() {}, snapshot: () => ({}) }, ...extra };
  const action = patrolAction({ duration: 5 }).create(); action.start(context);
  const chosen = selector(options);
  return { chosen, destination, action, context };
}

test('normal patrol favors separation but unrestricted branch can choose nearby cells', () => {
  const options = [candidate(1), candidate(5)], peers = [{ id: 'other', cell: { x: 0, y: 0 } }];
  assert.equal(select(options, peers).chosen, options[1]);
  assert.equal(select(options, peers, [.9, 0]).chosen, options[0]);
  let far = 0;
  for (let branch = 0; branch < 10; branch++) for (let choice = 0; choice < 10; choice++) {
    if (select(options, peers, [(branch + .5) / 10, (choice + .5) / 10]).chosen === options[1]) far++;
  }
  assert.equal(far, 90);
});

test('patrol excludes self and dead peers, and includes current and intended cells', () => {
  const options = [candidate(1), candidate(5)];
  assert.equal(select(options, [{ id: 'self', cell: { x: 0, y: 0 } }, { id: 'dead', isAlive: false, cell: { x: 0, y: 0 } }]).chosen, options[0]);
  assert.equal(select(options, [{ id: 'peer', cell: { x: 0, y: 0 }, patrolDestination: { x: 5, y: 0 } }]).chosen, options[0]);
  assert.equal(select(options, [{ id: 'peer', cell: { x: 0, y: 0 } }]).chosen, options[1]);
});

test('ties, empty and single sets remain usable and selected intent is copied and cleared', () => {
  const options = [candidate(1), candidate(5)];
  assert.equal(select(options, [], [1]).chosen, options[1]);
  assert.equal(select([], []).chosen, undefined);
  assert.equal(select([options[0]], []).chosen, options[0]);
  const result = select(options, []);
  assert.deepEqual(result.destination, options[0].cell);
  assert.notEqual(result.destination, options[0].cell);
  result.action.cancel();
});

test('timed patrol keeps straight only as a soft tie preference and stops on its original clock', () => {
  let current = { x: 0, y: 0 }, selector, draws = [0, 0], at = 0, selected;
  const ctx = { id: 'self', actor: { getGridPosition: () => current }, grid: { tileSizePx: 64 },
    profile: { patrolMode: 'timed' }, getPatrolPeers: () => [], random: () => draws[at++] ?? 0,
    setPatrolDestination: value => { selected = value; },
    navigation: { start(fn) { selector = fn; }, update: () => 'succeeded', cancel() {} } };
  const action = patrolAction({ duration: 5 }).create(); action.start(ctx);
  selector([candidate(1), candidate(-1)]); current = { x: 1, y: 0 };
  assert.equal(action.update(ctx, 1), 'running'); assert.equal(selected, null);
  const straight = candidate(2), turn = candidate(1, 1);
  assert.equal(selector([turn, straight]), straight);
  action.update(ctx, 1); draws = [.9, 0]; at = 0;
  assert.equal(selector([turn, straight]), turn);
  ctx.getPatrolPeers = () => [{ id: 'peer', cell: { x: 1, y: 2 } }];
  action.update(ctx, 1); draws = [0, 0]; at = 0;
  assert.equal(selector([turn, straight]), straight);
  assert.equal(action.update(ctx, 2), 'succeeded'); action.cancel(); assert.equal(selected, null);
});

test('selection reads peers when a deferred route resolves and preserves home/distance limits', () => {
  let peers = [], selector;
  const ctx = { id: 'self', actor: { getGridPosition: () => ({ x: 0, y: 0 }) }, grid: { tileSizePx: 64 },
    profile: { patrolMode: 'route', patrolCells: [2, 3], homeRadius: 4 }, spawnCell: { x: 0, y: 0 },
    random: () => 0, getPatrolPeers: () => peers, setPatrolDestination() {}, navigation: { start(fn) { selector = fn; } } };
  patrolAction().create().start(ctx);
  const near = { cell: { x: 2, y: 0 }, route: [{x:1,y:0},{x:2,y:0}] };
  const far = { cell: { x: 3, y: 0 }, route: [...near.route,{x:3,y:0}] };
  const outside = { cell: { x: 5, y: 0 }, route: near.route };
  peers = [{ id: 'peer', cell: { x: 0, y: 0 } }];
  assert.equal(selector([candidate(1), near, far, outside]), far);
  peers[0].patrolDestination = far.cell;
  assert.equal(selector([near, far, outside]), near);
});

test('unfinished patrol does not retarget just because peers move', () => {
  let selected, selector, starts=0, peers=[{id:'peer',cell:{x:0,y:0}}];
  const ctx={id:'self',actor:{getGridPosition:()=>({x:0,y:0})},grid:{tileSizePx:64},spawnCell:{x:0,y:0},
    profile:{patrolMode:'timed'},random:()=>0,getPatrolPeers:()=>peers,setPatrolDestination:value=>{selected=value;},
    navigation:{start(fn){starts++;selector=fn;},update:()=> 'running',cancel(){}}};
  const action=patrolAction({duration:5}).create();action.start(ctx);selector([candidate(1),candidate(-1)]);
  const before={...selected};peers=[{id:'peer',cell:{...selected}}];action.update(ctx,.1);
  assert.deepEqual(selected,before);assert.equal(starts,1);action.cancel();assert.equal(selected,null);
});
