async (page) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const check = (ok, message) => { if (!ok) throw Error(message); };
  const base = 'http://127.0.0.1:5177/src/test/browser/player-knife.html';
  const results = [];
  const open = async (enemy = 'goblin') => { await page.goto(`${base}?enemy=${enemy}`); await page.waitForFunction(() => !!window.knifeQA); };
  for (const enemy of ['goblin','warrior','lancer','archer','monk']) {
    await open(enemy);
    await page.keyboard.press('v');
    const frames = [await page.evaluate(() => knifeQA.snapshot())];
    for(let i=0;i<3;i++)frames.push(await page.evaluate(() => knifeQA.step(.1)));
    check(frames[0].animation==='attack' && frames[1].health[0]===100 && frames[2].health[0]===75, `${enemy} midpoint`);
    check(new Set(frames.map(f=>JSON.stringify(f.uv))).size===4, `${enemy} four distinct displayed frames`);
    await page.screenshot({path:`output/playwright/c067-${enemy}-swing.png`});
    const end = await page.evaluate(() => knifeQA.step(.1));
    check(end.animation==='idle' && end.impacts===1, `${enemy} completion`);
    for(let hit=2;hit<=4;hit++) {
      await page.keyboard.press('v');
      const atImpact = await page.evaluate(() => knifeQA.advance(.2));
      check(atImpact.health[0]===100-25*hit && atImpact.health[1]===100, `${enemy} hit ${hit}`);
      const done = await page.evaluate(() => knifeQA.advance(.2));
      if(hit===4) {
        const death = await page.evaluate(() => knifeQA.advance(.1));
        check(death.dead[0],`${enemy} death animation completion`);
      }
    }
    results.push({enemy,health:[100,75,50,25,0],frames:4,dead:true});
  }
  await open();
  await page.keyboard.press('2'); await page.keyboard.press('c'); await page.keyboard.press('1');
  let s = await page.evaluate(() => knifeQA.snapshot());
  check(s.loadout.item==='gold' && s.loadout.weapon==='axe' && s.impacts===0,'C/item/alternate loadout');
  await page.evaluate(() => {knifeQA.advance(.4);knifeQA.place(0,-40);knifeQA.place(1,40);});
  await page.keyboard.press('v');
  s=await page.evaluate(() => knifeQA.advance(.2));
  check(s.health.every(h=>h===75) && s.animation==='attack','all overlapping colliders regardless of direction and preview expiry');
  await page.evaluate(() => knifeQA.advance(.2));
  await page.keyboard.press('v');
  s=await page.evaluate(() => {knifeQA.advance(.1);knifeQA.place(0,200);return knifeQA.advance(.1);});
  check(s.health[0]===75&&s.health[1]===50,'live collider position at impact');
  await page.evaluate(() => knifeQA.advance(.2));
  await page.keyboard.press('v');
  const before=await page.evaluate(() => {knifeQA.advance(.1);knifeQA.pause(true);return knifeQA.snapshot();});
  s=await page.evaluate(() => {knifeQA.advance(5);return knifeQA.snapshot();});
  check(JSON.stringify(s)===JSON.stringify(before),'pause freezes animation and impact');
  s=await page.evaluate(() => {knifeQA.pause(false);return knifeQA.advance(.1);});
  check(s.health[1]===25,'resume delivers midpoint once');
  await page.evaluate(() => knifeQA.advance(.2));
  await page.keyboard.press('v');
  s=await page.evaluate(() => {knifeQA.advance(.1);knifeQA.kill();return knifeQA.advance(1);});
  check(s.health[1]===25,'death cancels unfinished impact');
  await open();
  await page.getByRole('button',{name:'Action (V)',exact:true}).focus();
  await page.keyboard.press('Enter');
  s=await page.evaluate(() => knifeQA.advance(.5));
  check(s.impacts===1&&s.health[0]===75,'accessible Enter and coarse update');
  await page.keyboard.down('v');
  await page.evaluate(() => knifeQA.advance(.4));
  await page.keyboard.down('v');
  s=await page.evaluate(() => knifeQA.advance(.4));
  await page.keyboard.up('v');
  check(s.impacts===2,'held V does not repeat');
  await open();
  const cdp = await page.context().newCDPSession(page);
  const joystick = await page.locator('#movement-joystick').boundingBox();
  const attack = await page.locator('#attack-action').boundingBox();
  const finger = {id:1,x:joystick.x+joystick.width-5,y:joystick.y+joystick.height/2};
  const actionFinger = {id:2,x:attack.x+attack.width/2,y:attack.y+attack.height/2};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger,actionFinger]});
  s=await page.evaluate(() => knifeQA.advance(.2));
  check(s.impacts===1&&s.position.x>352,'simultaneous movement and touch Attack');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[finger]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  check(await page.locator('#item-action').count()===0,'Item absent');
  check(errors.length===0,errors.join('; '));
  return {passed:true,results,overlap:true,pause:true,death:true,accessible:true,touch:true,errors};
}
