async (page) => {
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  const check=(ok,msg)=>{if(!ok)throw Error(msg);};
  const layouts=[];
  for(const size of [{width:1280,height:720},{width:320,height:720}]) {
    await page.setViewportSize(size);
    await page.goto('http://127.0.0.1:5177/');
    await page.getByRole('button',{name:'Start',exact:true}).waitFor();
    await page.getByRole('button',{name:'Start',exact:true}).click();
    await page.getByRole('button',{name:'Start',exact:true}).waitFor({state:'hidden'});
    check(await page.locator('#item-action').count()===0,'Item still present');
    const attack=await page.getByRole('button',{name:'Action (V)',exact:true}).boundingBox();
    const move=await page.getByRole('button',{name:'Move joystick',exact:true}).boundingBox();
    check(attack.x>=0&&attack.y>=0&&attack.x+attack.width<=size.width&&attack.y+attack.height<=size.height,'Attack clipped');
    check(move.x+move.width<attack.x,'controls overlap');
    await page.keyboard.press('2');await page.keyboard.press('c');
    await page.keyboard.press('v');
    await page.screenshot({path:`output/playwright/c067-hud-${size.width}.png`});
    await page.getByRole('button',{name:'Open settings'}).click();
    const paused=await page.evaluate(()=>levelCameraDebug.snapshot().paused);
    check(paused,'settings pause');
    layouts.push({width:size.width,attack,move,paused});
  }
  check(errors.length===0,errors.join(';'));
  return {passed:true,layouts,errors};
}
