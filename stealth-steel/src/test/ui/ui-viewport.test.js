import test from 'node:test';
import assert from 'node:assert/strict';
import { createUiViewport, observePixelRatio, productionPixelRatio, uiPresentation, updateDiagnosticBacking } from '../../runtime/ui/ui-viewport.js';
import { GAME_VIEWPORT, logicalPointFromClient } from '../../runtime/gameplay/game-viewport.js';

const reference = GAME_VIEWPORT.referenceResolution;
function target(properties = {}) {
  const handlers = new Map();
  return Object.assign({
    addEventListener(type, handler) { const bucket = handlers.get(type) ?? new Set(); bucket.add(handler); handlers.set(type, bucket); },
    removeEventListener(type, handler) { handlers.get(type)?.delete(handler); },
    emit(type, event) { for (const handler of [...(handlers.get(type) ?? [])]) handler(event); },
    count(type) { return handlers.get(type)?.size ?? 0; },
  }, properties);
}

test('production backing ratio is bounded and never changes logical dimensions', () => {
  for (const [input,expected] of [[0.5,0.5],[1,1],[1.5,1.5],[4,2],[NaN,1],[0,1],[-1,1],[Infinity,1]]) {
    assert.equal(productionPixelRatio(input),expected);
    const canvas={width:0,height:0}; let transform;
    updateDiagnosticBacking(canvas,{setTransform(...values){transform=values;}},reference,input);
    assert.equal(canvas.width,Math.floor(576*expected));
    assert.equal(canvas.height,Math.floor(1024*expected));
    assert.deepEqual(transform,[canvas.width/576,0,0,canvas.height/1024,0,0]);
  }
  assert.deepEqual(reference,{width:576,height:1024});
});

test('zoom-equivalent frame changes keep UI geometry and pointer coordinates proportional', () => {
  for (const factor of [0.5,1,1.25,2]) {
    const frame={left:100/factor,top:0,width:506.25/factor,height:900/factor};
    const layout=uiPresentation(frame,frame,reference);
    assert.equal(layout.width,576);
    assert.equal(layout.height,1024);
    assert.equal(layout.scale*factor,900/1024);
    const fittedRect={left:frame.left,top:0};
    assert.deepEqual(logicalPointFromClient({x:frame.left+frame.width/2,y:frame.height/2},{fittedRect,scale:layout.scale}),{x:288,y:512});
  }
  const narrow=uiPresentation({left:0,top:0,width:320,height:900},{height:900},reference);
  assert.ok(narrow.width<576);
  assert.equal(narrow.width*narrow.scale,320);
});

test('plain wheel does not zoom the UI by default and releases all listeners', () => {
  const windowRef=target({innerWidth:1440,innerHeight:900});
  const documentRef=target({documentElement:{}});
  const frame={left:466.875,top:0,width:506.25,height:900,right:973.125,bottom:900};
  const frameElement={getBoundingClientRect:()=>frame};
  const properties=new Map();
  const element={style:{setProperty(key,value){properties.set(key,value);}},dataset:{},classList:{add(){}}};
  const ui=createUiViewport({element,frameElement,reference,windowRef,documentRef,ResizeObserverRef:null});
  assert.equal(element.dataset.uiZoom,'1');
  assert.equal(element.style.width,'576px');
  let prevented=0;
  const wheel=overrides=>windowRef.emit('wheel',{clientX:720,clientY:450,deltaY:-100,preventDefault(){prevented++;},...overrides});
  for(let i=0;i<10;i++) wheel({});
  assert.equal(prevented,0);
  assert.equal(element.dataset.uiZoom,'1');
  assert.deepEqual(frame,{left:466.875,top:0,width:506.25,height:900,right:973.125,bottom:900});
  ui.dispose();
  assert.equal(windowRef.count('wheel'),0);
  assert.equal(windowRef.count('resize'),0);
  assert.equal(documentRef.count('fullscreenchange'),0);
});

test('DPR observation re-arms for subsequent changes and disposes without polling', () => {
  const queries=[]; let updates=0;
  const windowRef={devicePixelRatio:1,matchMedia(query){const q=target({query});queries.push(q);return q;}};
  const dispose=observePixelRatio(windowRef,()=>updates++);
  windowRef.devicePixelRatio=2; queries[0].emit('change');
  windowRef.devicePixelRatio=0.5; queries[1].emit('change');
  assert.equal(updates,3);
  assert.match(queries[2].query,/0.5dppx/);
  assert.equal(queries[0].count('change'),0);
  dispose();assert.equal(queries[2].count('change'),0);
});
