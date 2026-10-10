import test from "node:test";
import assert from "node:assert/strict";
import { createLevelCompleteUi, createLevelLostUi } from "../../runtime/ui/level-complete-ui.js";

class FakeElement extends EventTarget {
  _text = "";
  set textContent(value) { this._text = value; this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent ?? "").join(""); }
  children = [];
  parentNode = null;
  hidden = false;
  append(...children) { for (const child of children) { child.parentNode = this; this.children.push(child); } }
  remove() { this.parentNode?.children.splice(this.parentNode.children.indexOf(this), 1); this.parentNode = null; }
  setAttribute() {}
  focus() {}
}

const documentRef = { createElement: () => new FakeElement() };

test('paid loss has BIS-priced Pay first, Restart second and guards disabled actions',()=>{
 const host=new FakeElement();let pays=0,restarts=0;
 const ui=createLevelLostUi({host,documentRef,onPay:()=>pays++,onRestart:()=>restarts++});
 ui.setState({sats:2345,canPay:false,status:'idle',message:''});ui.show();
 assert.equal(ui.payButton.textContent,'⚡Pay 2345 Sats To Continue');assert.equal(ui.restartButton.textContent,'Restart Game');
 assert.equal(ui.payButton.children[0].textContent,'⚡');
 assert.deepEqual(ui.actions.children, [ui.payButton, ui.restartButton]);
 ui.payButton.dispatchEvent(new Event('click'));assert.equal(pays,0);
 ui.setState({sats:2345,canPay:true,status:'failed',message:'Try again'});ui.payButton.dispatchEvent(new Event('click'));assert.equal(pays,1);
 ui.setState({sats:2345,canPay:false,status:'pending',message:'Processing'});ui.restartButton.dispatchEvent(new Event('click'));assert.equal(restarts,0);
 ui.dispose();assert.equal(host.children.length,0);
});

test('paid loss hides Pay when BIS payment support is unavailable', () => {
  const host = new FakeElement();
  const ui = createLevelLostUi({ host, documentRef, onPay: () => {}, onRestart: () => {} });
  ui.setState({ sats: 1000, canPay: false, paymentSupported: false, status: 'idle', message: 'Wallets unavailable' });
  assert.equal(ui.payButton.hidden, true);
  assert.equal(ui.restartButton.hidden, false);
  ui.dispose();
});

test('loss prompt has restart copy and cannot be dismissed by backdrop', () => {
  const host = new FakeElement();
  const ui = createLevelLostUi({host, onPay:()=>{}, onRestart:()=>{}, documentRef});
  ui.show();
  assert.match(ui.panel.textContent, /^You LostTry again!/);
  assert.deepEqual(ui.actions.children, [ui.payButton, ui.restartButton]);
  ui.backdrop.dispatchEvent(new Event('click'));
  assert.equal(host.children.length, 1);
});

test("level complete requires Continue and ignores background clicks", () => {
  const host = new FakeElement();
  let continued = 0;
  const ui = createLevelCompleteUi({ host, onContinue: () => { continued += 1; }, documentRef });
  ui.show();
  const panel = ui.panel;
  const button = ui.continueButton;
  assert.ok(ui.actions.children.includes(button));
  ui.backdrop.dispatchEvent(new Event("click", { bubbles: true }));
  assert.equal(host.children.length, 1);
  assert.equal(continued, 0);
  button.dispatchEvent(new Event("click", { bubbles: true }));
  assert.equal(host.children.length, 1);
  assert.equal(continued, 1);
  ui.backdrop.dispatchEvent(new Event("click", { bubbles: true }));
  assert.equal(host.children.length, 1);
  ui.dispose();
});

test("level complete hides trophy controls and copy without asset minting support", () => {
  const host = new FakeElement();
  const ui = createLevelCompleteUi({ host, documentRef, showTrophyActions: () => false });
  ui.setState({ status: "error", canCollect: true, canCheck: true, message: "Trophies are unavailable." });
  ui.show();
  assert.equal(ui.collectButton.hidden, true);
  assert.equal(ui.checkButton.hidden, true);
  assert.doesNotMatch(ui.panel.children[1].children[0].textContent, /Trophies are unavailable/);
  ui.dispose();
});

for (const outcome of ["level complete", "game complete", "paid loss"]) {
  test(`${outcome} menu blocks keyboard activation and background dismissal`, () => {
    const host = new FakeElement();
    let actions = 0;
    const ui = outcome === "paid loss"
      ? createLevelLostUi({ host, documentRef, onPay: () => actions++, onRestart: () => actions++ })
      : createLevelCompleteUi({ host, documentRef, onContinue: () => actions++, onRestart: () => actions++ });
    if (outcome === "game complete") ui.setCompletion({ hasNext: false });
    ui.show();
    for (const type of ["keydown", "keyup"]) {
      for (const key of ["Enter", " "]) {
        const event = new Event(type, { cancelable: true, bubbles: true });
        Object.defineProperty(event, "key", { value: key });
        ui.backdrop.dispatchEvent(event);
        assert.equal(event.defaultPrevented, true, `${type} ${key} must not activate an action`);
      }
    }
    ui.backdrop.dispatchEvent(new Event("click"));
    assert.equal(host.children.length, 1);
    assert.equal(ui.backdrop.hidden, false);
    assert.equal(actions, 0);
    (outcome === "level complete" ? ui.continueButton : ui.restartButton).dispatchEvent(new Event("click"));
    assert.equal(actions, 1);
    ui.dispose();
  });
}

