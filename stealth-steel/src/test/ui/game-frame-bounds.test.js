import test from "node:test";
import assert from "node:assert/strict";

import { bindToGameFrame } from "../../runtime/ui/game-frame-bounds.js";

test("a fixed overlay tracks the exact game-frame rectangle", () => {
  const listeners = new Map();
  const windowRef = {
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type) { listeners.delete(type); },
  };
  const frameElement = {
    getBoundingClientRect: () => ({ left: 684, top: 3, width: 680, height: 1180 }),
  };
  const overlay = { style: {} };

  const dispose = bindToGameFrame({ overlay, frameElement, windowRef, ResizeObserverRef: null });

  assert.deepEqual(overlay.style, {
    left: "684px",
    top: "3px",
    width: "680px",
    height: "1180px",
  });
  dispose();
  assert.equal(listeners.size, 0);
});

test('menus use local logical bounds inside the scaled UI containing block', () => {
  const layer={style:{width:'576px',height:'1024px'}};
  const frameElement={ownerDocument:{querySelector:()=>layer},getBoundingClientRect:()=>({left:400,top:0,width:1012.5,height:1800})};
  const overlay={style:{}};
  const dispose=bindToGameFrame({overlay,frameElement,coordinateRoot:layer,windowRef:null,ResizeObserverRef:null});
  assert.deepEqual(overlay.style,{left:'0px',top:'0px',width:'576px',height:'1024px'});
  dispose();
});

test('body-mounted Account overlays keep physical frame coordinates', () => {
  const frameElement={ownerDocument:{querySelector:()=>({style:{width:'576px',height:'1024px'}})},getBoundingClientRect:()=>({left:400,top:0,width:1012.5,height:1800})};
  const overlay={style:{},closest:()=>null};
  const dispose=bindToGameFrame({overlay,frameElement,windowRef:null,ResizeObserverRef:null});
  assert.deepEqual(overlay.style,{left:'400px',top:'0px',width:'1012.5px',height:'1800px'});
  dispose();
});
