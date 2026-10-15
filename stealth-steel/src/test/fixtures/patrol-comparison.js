import { patrolAction } from '../../runtime/ai/actions/patrol.js';
import { patrolAction as originalPatrolAction } from './independent-patrol.js';
import { createNavigation } from '../../runtime/ai/navigation.js';
export function seededRandom(seed) {
  let value = seed >>> 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}
export function comparePatrol(seed, original = false, corridor = false) {
  const grid = { columns: corridor ? 18 : 24, rows: corridor ? 1 : 24, tileSizePx: 64 }, records = [];
  const factory = original ? originalPatrolAction : patrolAction;
  for (let i = 0; i < 10; i++) {
    let position = { x: (corridor ? i+1 : 8+i%5) * 64+32, y: (corridor ? 0 : 10+Math.floor(i/5)) *64+32 }, intent = {x:0,y:0};
    const record = { id: String(i), destination: null, action: null }, random = seededRandom(seed*100+i+1);
    const actor = { getPosition: () => ({...position}), getGridPosition: () => ({ x: Math.floor(position.x/64), y: Math.floor(position.y/64) }), setMovementIntent(v) { intent = v; } };
    const isWalkable = cell => !records.some(other => other !== record && other.actor.getGridPosition().x === cell.x && other.actor.getGridPosition().y === cell.y);
    const profile = { patrolMode: i % 5 === 0 ? 'route' : 'timed', patrolCells: [2,5], homeRadius: i%5===0 ? 4 : null };
    const context = { id: record.id, actor, grid, profile, spawnCell: actor.getGridPosition(), random,
      choose: values => values[Math.floor(random()*values.length)],
      getPatrolPeers: () => records.map(other => ({ id:other.id,cell:other.actor.getGridPosition(),patrolDestination:other.destination })),
      setPatrolDestination: value => { record.destination=value; }, navigation: createNavigation({actor,grid,isWalkable}) };
    Object.assign(record,{actor,context,random,idle:3+2*random(),advance(delta) { position.x+=intent.x*120*delta;position.y+=intent.y*120*delta; }});records.push(record);
  }
  let separation = 0, sectors = 0, samples = 0, moves = 0;
  for(let frame=0;frame<4800;frame++) {
    for(const record of records) {
      if(!record.action) {
        record.idle-=.025;
        if(record.idle<=0) { record.action=factory({duration:2+3*record.random()}).create();record.action.start(record.context); }
      } else {
        const status=record.action.update(record.context,.025);
        if(status!=='running') {record.action.cancel();record.action=null;record.idle=3+2*record.random();}
      }
      const before=record.actor.getPosition(); record.advance(.025);
      if(JSON.stringify(before)!==JSON.stringify(record.actor.getPosition())) moves++;
    }
    if(frame>=1200 && frame%40===0) {
      const cells=records.map(r=>r.actor.getGridPosition());
      separation+=cells.reduce((sum,cell,i)=>sum+Math.min(...cells.filter((_,j)=>i!==j).map(other=>Math.abs(cell.x-other.x)+Math.abs(cell.y-other.y))),0)/cells.length;
      sectors+=new Set(cells.map(cell=>`${Math.floor(cell.x/6)},${Math.floor(cell.y/6)}`)).size;samples++;
    }
  }
  records.forEach(r=>r.action?.cancel());
  return { separation: separation/samples, sectors:sectors/samples, moves };
}
