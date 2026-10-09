import {mutedGameUrl,browserOptions} from './bis-smoke-options.mjs';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const captureDirectory = new URL('../../../../output/playwright/', import.meta.url);
mkdirSync(captureDirectory, { recursive: true });
const capturePath = name => fileURLToPath(new URL(name, captureDirectory));
// Fresh browser profile, guest movement only; no live account creation.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
import assert from 'node:assert/strict';
const b=await chromium.launch(browserOptions);
try{const p=await b.newPage({viewport:{width:1000,height:900}});const warnings=[];p.on('console',m=>{if(m.type()==='error')warnings.push(m.text().slice(0,400));});await p.goto(mutedGameUrl(process.argv[2] ?? 'http://127.0.0.1:5175/'));await p.getByRole('button',{name:'Start',exact:true}).click({timeout:60000});
await p.screenshot({path:capturePath('treasure-guest-level.png')});assert.equal(await p.getByRole('dialog',{name:'Treasure Chest',exact:true}).count(),0,'Guest level opened treasure interaction without BIS setup');
const pos=()=>p.locator('#coordinates-ui-pixel').textContent();
console.log('initial',await pos());
let movement;
for(const key of ['ArrowRight','ArrowDown','ArrowLeft','ArrowUp']){const before=await pos();await p.keyboard.down(key);await p.waitForTimeout(500);await p.keyboard.up(key);const after=await pos();console.log(key,before,after);if(before!==after){movement=key;break;}}
assert.ok(movement,'Guest player did not move in any direction');
await p.keyboard.down(movement);await p.getByRole('button',{name:'Open settings',exact:true}).click();await p.getByRole('button',{name:'⚡ Account',exact:true}).click();await p.getByRole('button',{name:'⚡ Create Account',exact:true}).waitFor();const paused=await pos();await p.waitForTimeout(500);assert.equal(await pos(),paused);await p.keyboard.up(movement);
await p.getByRole('button',{name:'Back',exact:true}).click();await p.getByRole('button',{name:'Close settings',exact:true}).first().click();const released=await pos();await p.waitForTimeout(500);assert.equal(await pos(),released,'Held input replayed on resume');
let resumed=false;for(const key of ['ArrowRight','ArrowDown','ArrowLeft','ArrowUp']){const before=await pos();await p.keyboard.down(key);await p.waitForTimeout(400);await p.keyboard.up(key);if(before!==await pos()){resumed=true;break;}}
assert.ok(resumed,'Guest player did not resume movement');await p.screenshot({path:capturePath("bis-game-resumed.png")});console.log('PASS guest movement, held-key pause, no replay and resumed movement; console errors:',JSON.stringify(warnings));
}finally{await b.close();}
