import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogFromFiles,createLevelProgress,RUN_STORAGE_KEY} from '../../runtime/gameplay/level-progress.js';
test('catalog ignores backups and sorts real levels; gaps fail explicitly',()=>{
  assert.deepEqual(catalogFromFiles(['Level02.tmj','Level01.tmj.bak.tmj','Level01.tmj']).map(l=>l.number),[1,2]);
  assert.throws(()=>catalogFromFiles(['Level01.tmj','Level03.tmj']),/contiguous/);
});
test('continue persists level, final omits next, and restart preserves wallet without persisting navigation',()=>{
  const values=new Map([['wallet','untouched']]);let reloads=0;
  const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
  const catalog=catalogFromFiles(['Level01.tmj','Level02.tmj']);
  const first=createLevelProgress(catalog,storage,()=>reloads++);assert.equal(first.current,1);assert.equal(first.hasNext,true);first.advance();
  const final=createLevelProgress(catalog,storage,()=>reloads++);assert.equal(final.current,2);assert.equal(final.completed,1);assert.equal(final.hasNext,false);final.advance();assert.equal(reloads,1);final.restart();
  assert.equal(values.get(RUN_STORAGE_KEY),'null');assert.equal(values.get('wallet'),'untouched');assert.equal(reloads,1);
});
test('storage failure never claims navigation and does not prevent an in-memory restart',()=>{
  let reloads=0;const restarts=[];const progress=createLevelProgress(catalogFromFiles(['Level01.tmj']),{getItem:()=>null,setItem:()=>{throw Error('storage');}},()=>reloads++,()=>[],{onRestart:run=>restarts.push(run)});
  progress.restart();assert.deepEqual(restarts,[{order:[1],completed:0}]);assert.equal(reloads,0);
});

test('continue can hand the next level to the in-process run coordinator',()=>{
  const values=new Map(); let reloads=0; const advances=[];
  const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
  const progress=createLevelProgress(catalogFromFiles(['Level01.tmj','Level02.tmj']),storage,()=>reloads++,()=>[],{onAdvance:run=>advances.push(run)});
  progress.advance();
  assert.deepEqual(advances,[{order:[1,2],completed:1}]);
  assert.equal(reloads,0);
  const next=createLevelProgress(catalogFromFiles(['Level01.tmj','Level02.tmj']),storage,()=>{},()=>[],{initialRun:advances[0]});
  assert.equal(next.current,2);
  assert.equal(values.get(RUN_STORAGE_KEY),'null');
});

test('restart hands the current preferred first map to an in-place fresh run without reloading',()=>{
  const values=new Map([['wallet','untouched'],[RUN_STORAGE_KEY,JSON.stringify({order:[1,2,3],completed:2,pendingTransition:true})]]);
  const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
  let reloads=0;const restarts=[];
  const progress=createLevelProgress(catalogFromFiles(['Level01.tmj','Level02.tmj','Level03.tmj']),storage,()=>reloads++,()=>[3,2,1],{onRestart:run=>restarts.push(run)});
  progress.restart();
  assert.deepEqual(restarts,[{order:[3,2,1],completed:0}]);
  assert.equal(values.get(RUN_STORAGE_KEY),'null');
  assert.equal(values.get('wallet'),'untouched');
  assert.equal(reloads,0);
});

test('refresh starts level one after a Continue transition has been consumed',()=>{
  const values=new Map();
  const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
  const catalog=catalogFromFiles(['Level01.tmj','Level02.tmj']);
  createLevelProgress(catalog,storage,()=>{}).advance();
  assert.equal(createLevelProgress(catalog,storage,()=>{}).current,2);
  const refreshed=createLevelProgress(catalog,storage,()=>{});
  assert.equal(refreshed.current,1);
  assert.equal(refreshed.completed,0);
  assert.equal(refreshed.file,'Level01.tmj');
});

test('refresh ignores progress saved by previous versions',()=>{
  const values=new Map([[RUN_STORAGE_KEY,JSON.stringify({current:2,completed:1})]]);
  const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
  const progress=createLevelProgress(catalogFromFiles(['Level01.tmj','Level02.tmj']),storage,()=>{});
  assert.equal(progress.current,1);
  assert.equal(progress.completed,0);
});
