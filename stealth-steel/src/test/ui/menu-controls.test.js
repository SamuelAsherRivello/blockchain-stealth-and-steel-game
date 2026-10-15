import test from "node:test";
import assert from "node:assert/strict";
import { createSliderControl, createToggleControl } from "../../runtime/ui/menu-controls.js";
class Element extends EventTarget {
  children = [];
  attributes = new Map();
  append(...children) { this.children.push(...children); }
  setAttribute(key, value) { this.attributes.set(key,value); }
}
const documentRef = { createElement: () => new Element() };

test("slider accepts a custom range and reports numeric input until disposed", () => {
  const changes = [];
  const control = createSliderControl({labelText:"Speed",min:1,max:5,step:.5,value:2,onChange:value=>changes.push(value),documentRef});
  assert.equal(control.slider.min,"1"); assert.equal(control.slider.max,"5");
  assert.equal(control.slider.step,"0.5"); assert.equal(control.slider.value,"2");
  assert.equal(control.row.children[0].textContent,"Speed");
  assert.equal(control.slider.attributes.get("aria-label"),"Speed");
  control.slider.value="3.5";
  control.slider.dispatchEvent(new Event("input"));
  control.dispose(); control.slider.dispatchEvent(new Event("input"));
  assert.deepEqual(changes,[3.5]);
});
test("slider defaults to the audio range of zero through one hundred", () => {
  const {slider}=createSliderControl({labelText:"Music",documentRef});
  assert.equal(slider.min,"0"); assert.equal(slider.max,"100"); assert.equal(slider.step,"1");
});
test("toggle initializes checked state and reports boolean changes until disposed", () => {
  const changes=[];
  const control=createToggleControl({labelText:"Enabled",checked:true,onChange:value=>changes.push(value),documentRef});
  assert.equal(control.checkbox.type,"checkbox"); assert.equal(control.checkbox.checked,true);
  assert.equal(control.row.children[0].textContent,"Enabled");
  control.checkbox.checked=false; control.checkbox.dispatchEvent(new Event("change"));
  control.dispose(); control.checkbox.dispatchEvent(new Event("change"));
  assert.deepEqual(changes,[false]);
});
