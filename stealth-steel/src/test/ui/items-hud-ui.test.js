import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createItemsHudUi } from "../../runtime/ui/items-hud-ui.js";

class Element { children=[]; attributes=new Map(); textContent=""; hidden=false; append(...items){this.children.push(...items);} setAttribute(key,value){this.attributes.set(key,String(value));} }
const documentRef={createElement:()=>new Element()};

test("HUD shows only active chain icons after the Items label", () => {
  const host=new Element();
  const hud=createItemsHudUi({host,documentRef,snapshot:{slots:{Shoes:{name:"Shoes I",effect:"10% speed",iconUrl:"https://chain.example/shoes.png"}}}});
  assert.equal(hud.element.hidden,false);
  assert.equal(hud.element.children[0].textContent,"Items:");
  assert.equal(hud.element.children[1].children[0].src,"https://chain.example/shoes.png");
  assert.equal(hud.element.children[2].hidden,true);
  assert.equal(hud.element.children[3].hidden,true);
});

test("HUD hides the Items display when no item is in use", () => {
  const host=new Element();
  const hud=createItemsHudUi({host,documentRef,snapshot:{slots:{}}});
  assert.equal(hud.element.hidden,true);
  hud.render({slots:{Shield:{name:"Shield I",effect:"10% defense",iconUrl:"https://chain.example/shield.png"}}});
  assert.equal(hud.element.hidden,false);
  hud.render({slots:{}});
  assert.equal(hud.element.hidden,true);
});

test("HUD can move from mixed to full slots without changing its Shoes, Dagger, Shield order", () => {
  const host=new Element();
  const hud=createItemsHudUi({host,documentRef,snapshot:{slots:{Dagger:{name:"Dagger II",effect:"20% damage",iconUrl:"https://chain.example/dagger.png"}}}});
  assert.equal(hud.element.children[1].hidden,true);
  assert.equal(hud.element.children[2].children[0].src,"https://chain.example/dagger.png");
  assert.equal(hud.element.children[3].hidden,true);
  hud.render({slots:{Shoes:{name:"Shoes III",effect:"30% speed",iconUrl:"https://chain.example/shoes.png"},Dagger:{name:"Dagger II",effect:"20% damage",iconUrl:"https://chain.example/dagger.png"},Shield:{name:"Shield I",effect:"10% defense",iconUrl:"https://chain.example/shield.png"}}});
  assert.deepEqual([hud.element.children[1].children[0].src,hud.element.children[2].children[0].src,hud.element.children[3].children[0].src],["https://chain.example/shoes.png","https://chain.example/dagger.png","https://chain.example/shield.png"]);
});

test("startup applies the completed equipment refresh to the HUD", async () => {
  const main = await readFile(new URL("../../runtime/main.js", import.meta.url), "utf8");
  assert.match(main, /void initialEquipmentState\.then\(applyEquipmentState\)\.catch\(\(\) => \{\}\);/);
});

test("HUD item slots use icon-sized, low-opacity item-label yellow squares", async () => {
  const styles = await readFile(new URL("../../runtime/ui/tiny-swords-hud.css", import.meta.url), "utf8");
  const slotRules = styles.match(/\.ui-layer \.items-counter-slot\s*\{([^}]*)\}/s)?.[1] ?? "";
  assert.match(slotRules, /width:\s*1\.15em/);
  assert.match(slotRules, /height:\s*1\.15em/);
  assert.match(slotRules, /background:\s*rgb\(255\s+245\s+217\s+\/\s*18%\)/);
});
