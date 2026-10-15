import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { browserOptions, mutedGameUrl } from './bis-smoke-options.mjs';

const output=resolve('output/screenshots/respect-dpi-game-layout');
mkdirSync(output,{recursive:true});
const extension=resolve(output,'native-zoom-extension');
mkdirSync(extension,{recursive:true});
writeFileSync(resolve(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'Local DPI acceptance zoom control',version:'1.0',permissions:['tabs'],background:{service_worker:'worker.js'}}));
writeFileSync(resolve(extension,'worker.js'),'chrome.runtime.onInstalled.addListener(() => {});\n');
const context=await chromium.launchPersistentContext(mkdtempSync(resolve(output,'profile-')),{...browserOptions,
  viewport:{width:1440,height:900},deviceScaleFactor:1,ignoreDefaultArgs:['--disable-extensions'],
  args:[...browserOptions.args,`--disable-extensions-except=${extension}`,`--load-extension=${extension}`],
});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
const measurements=[];
const read=()=>page.evaluate(()=>{
  const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
  const canvas=document.querySelector('#renderCanvas'), debug=document.querySelector('#debugCanvas');
  return {dpr:devicePixelRatio,frame:rect('.game-frame'),ui:rect('#uiLayer'),menu:rect('.start-game-prompt-panel'),
    paper:rect('.start-game-prompt-panel > .framed-slices'),start:rect('.start-game-prompt-start'),
    settings:rect('.settings-gear'),joystick:rect('#movement-joystick'),action:rect('#attack-action'),metadata:rect('.release-metadata'),
    render:[canvas.width,canvas.height],debug:[debug.width,debug.height],uiZoom:document.querySelector('#uiLayer').dataset.uiZoom};
});
const contained=(outer,inner)=>inner.left>=outer.left-1&&inner.top>=outer.top-1&&inner.right<=outer.right+1&&inner.bottom<=outer.bottom+1;
// Sample the rendered world itself in logical coordinates. Canvas rectangles
// alone cannot detect a backing-pixel projection that doubles every sprite.
const readWorld=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>{
  const sample=document.createElement('canvas');sample.width=576;sample.height=1024;
  const ctx=sample.getContext('2d');ctx.imageSmoothingEnabled=false;
  ctx.drawImage(document.querySelector('#renderCanvas'),0,0,576,1024);
  const {data}=ctx.getImageData(0,0,576,1024), colors=[];
  for(let y=4;y<1024;y+=8)for(let x=4;x<576;x+=8){const p=(y*576+x)*4;colors.push(data[p],data[p+1],data[p+2]);}
  resolve(colors);
})));
const compareWorld=(reference,current,label)=>{
  assert.ok(new Set(reference).size>20,'world samples must contain rendered artwork');
  const meanColorError=current.reduce((sum,value,i)=>sum+Math.abs(value-reference[i]),0)/current.length;
  assert.ok(meanColorError<15,`${label}: rendered world projection drift (${meanColorError.toFixed(2)})`);
  measurements.push({kind:'world-projection',label,meanColorError});
};
try {
  const worker=context.serviceWorkers()[0]??await context.waitForEvent('serviceworker',{timeout:10000});
  await page.goto(mutedGameUrl(process.argv[2]??'http://127.0.0.1:5175/blockchain-stealth-and-steel-game/'));
  await page.getByRole('button',{name:'Start',exact:true}).waitFor({timeout:30000});
  const cdp=await context.newCDPSession(page);
  let baseline, baselineWorld;
  for(const zoom of [1,0.5,1.25]) {
    await worker.evaluate(async zoom=>{
      const tabs=await chrome.tabs.query({});
      const tab=tabs.find(tab=>tab.url?.includes('muteMusic=true'));
      if(!tab)throw Error('Local acceptance tab missing');
      await chrome.tabs.setZoom(tab.id,zoom);
    },zoom);
    await page.waitForFunction(expected=>Math.abs(devicePixelRatio-expected)<0.01,zoom);
    await page.waitForTimeout(200);
    const result=await read(); measurements.push({kind:'native-browser-zoom',zoom,...result});
    assert.deepEqual(result.render,[Math.floor(576*Math.min(zoom,2)),Math.floor(1024*Math.min(zoom,2))]);
    assert.deepEqual(result.debug,result.render);
    baseline??=result;
    const world=await readWorld();baselineWorld??=world;
    compareWorld(baselineWorld,world,`native ${zoom}`);
    for(const name of ['frame','ui','menu','paper','start','settings','joystick','action','metadata']) {
      const current=result[name], previous=baseline[name];
      for(const dimension of ['width','height']) assert.ok(Math.abs(current[dimension]*zoom-previous[dimension])<1,`${zoom}: ${name} ${dimension} physical geometry drift`);
      assert.ok(contained(result.frame,current),`${zoom}: ${name} outside game frame`);
    }
    assert.ok(contained(result.paper,result.start),'Start must remain inside parchment');
    const logical=await page.evaluate(async()=>{
      const {measureGameViewport,logicalPointFromClient}=await import(new URL('src/runtime/gameplay/game-viewport.js',location.href).href);
      const viewport=measureGameViewport();
      return logicalPointFromClient({x:viewport.fittedRect.left+viewport.fittedRect.width/2,y:viewport.fittedRect.top+viewport.fittedRect.height/2},viewport);
    });
    assert.deepEqual(logical,{x:288,y:512});
    const capture=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    writeFileSync(resolve(output,`native-${zoom*100}.png`),Buffer.from(capture.data,'base64'));
    await page.getByRole('button',{name:'Open settings',exact:true}).click();
    const settings=await page.locator('.game-window').evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom};});
    assert.ok(contained(result.frame,settings),`${zoom}: Settings outside frame`);
    await page.locator('.game-window').getByRole('button',{name:'Close settings',exact:true}).click();
  }
  await worker.evaluate(async()=>{const tabs=await chrome.tabs.query({});await chrome.tabs.setZoom(tabs.find(t=>t.url?.includes('muteMusic=true')).id,1);});
  await page.waitForFunction(()=>devicePixelRatio===1);
  await page.waitForFunction(()=>innerWidth===1440&&innerHeight===900&&Math.abs(document.querySelector('#uiLayer').getBoundingClientRect().width-document.querySelector('.game-frame').getBoundingClientRect().width)<0.1);
  await page.waitForTimeout(200);
  const beforeDpr=await read();
  for(const dpr of [3,0.5,1]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:dpr,mobile:false});
    // CDP changes the DPR getter without reliably firing resolution media events.
    // Supply the viewport signal while leaving CSS dimensions unchanged.
    await page.evaluate(()=>window.dispatchEvent(new Event('resize')));
    const bounded=Math.min(dpr,2);
    await page.waitForFunction(ratio=>document.querySelector('#renderCanvas').width===Math.floor(576*ratio)&&document.querySelector('#debugCanvas').width===Math.floor(576*ratio),bounded);
    const result=await read();measurements.push({kind:'dpr-only-with-resize-signal',...result});
    assert.deepEqual(result.render,[Math.floor(576*bounded),Math.floor(1024*bounded)]);
    assert.deepEqual(result.debug,result.render);
    assert.deepEqual(result.frame,beforeDpr.frame);
    assert.deepEqual(result.start,beforeDpr.start);
    compareWorld(baselineWorld,await readWorld(),`DPR ${dpr}`);
  }
  const beforeWheel=await read();
  await page.mouse.move(720,450);
  await page.mouse.wheel(0,-100);
  await page.waitForFunction(()=>document.querySelector('#uiLayer').dataset.uiZoom==='1.1');
  for(let i=0;i<10;i++)await page.mouse.wheel(0,-100);
  await page.waitForFunction(()=>document.querySelector('#uiLayer').dataset.uiZoom==='1.5');
  let result=await read();assert.deepEqual(result.frame,beforeWheel.frame);assert.deepEqual(result.render,beforeWheel.render);
  assert.ok(Math.abs(result.ui.left+result.ui.width/2-720)<1);
  assert.ok(Math.abs(result.ui.top+result.ui.height/2-450)<1);
  for(let i=0;i<20;i++)await page.mouse.wheel(0,100);
  await page.waitForFunction(()=>document.querySelector('#uiLayer').dataset.uiZoom==='0.5');
  const modifierResults=await page.evaluate(()=>['ctrlKey','metaKey','altKey'].map(key=>{
    const e=new WheelEvent('wheel',{clientX:720,clientY:450,deltaY:-100,cancelable:true,[key]:true});
    return window.dispatchEvent(e);
  }));
  assert.deepEqual(modifierResults,[true,true,true]);assert.equal((await read()).uiZoom,'0.5');
  measurements.push({kind:'ui-wheel',minZoom:'0.5',maxZoom:'1.5',modifierEventsUnconsumed:true});
  for(let i=0;i<5;i++)await page.mouse.wheel(0,-100);
  await page.waitForFunction(()=>document.querySelector('#uiLayer').dataset.uiZoom==='1');
  await page.getByRole('button',{name:'Open settings',exact:true}).click();
  await page.getByRole('button',{name:'⚡ Account',exact:true}).click();
  await page.getByRole('button',{name:'⚡ Create Account',exact:true}).waitFor({timeout:20000});
  const accountBounds=await page.locator('.game-account-host').evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom};});
  assert.ok(contained(beforeWheel.frame,accountBounds),'body-mounted Account must use physical frame bounds');
  assert.deepEqual(errors,[]);
  console.log('PASS native 100%/50%/125% zoom, DPR-only backing, logical pointer mapping, centered UI wheel limits/modifiers, Settings and guest Account bounds');
} finally {
  writeFileSync(resolve(output,'acceptance.json'),JSON.stringify({measurements,errors},null,2));
  await context.close();
}
