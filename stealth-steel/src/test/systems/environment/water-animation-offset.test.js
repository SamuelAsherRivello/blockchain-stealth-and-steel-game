import assert from 'node:assert/strict';
import test from 'node:test';
import {getColumnAnimationOffset} from '../../../../plugins/tiled-babylon-lite/terrain-runtime.js';
test('water offsets three frames per world column and wraps across the animation',()=>{
 const frames=Array.from({length:16},(_,tileid)=>({tileid,duration:100}));
 for(const [column,frame] of [[0,0],[1,3],[7,5],[8,8],[15,13],[16,0],[18,6],[-1,13]]) {
  assert.deepEqual(getColumnAnimationOffset(frames,column),{frame,elapsed:frame*100});
 }
});
