import {collidersOverlap} from '../../gameplay/game-logic.js';

export function createTreasureChest({position,sensor={x:-24,y:-20,width:48,height:40},canEnter=()=>true,onEnter}) {
  let overlapping=false,disposed=false;
  const collider={x:position.x+sensor.x,y:position.y+sensor.y,width:sensor.width,height:sensor.height};
  return {
    position, sensor:collider,
    update(actor,enabled=true) {
      if(disposed)return;
      const body=enabled&&actor?.getMovementCollider();
      const inside=!!body&&collidersOverlap(body,collider);
      const entered=inside&&!overlapping;overlapping=inside;
      if(entered&&canEnter())onEnter();
    },
    dispose(){disposed=true;},
  };
}
