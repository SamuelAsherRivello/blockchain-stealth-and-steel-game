async (page) => {
  await page.waitForFunction(() => {
    const raw=document.querySelector('#result')?.dataset.result;
    return raw && JSON.parse(raw).complete;
  }, null, {timeout:45000});
  const result=await page.locator('#result').evaluate(el=>JSON.parse(el.dataset.result));
  if(!result.cleanup || result.interruptions!==result.rows.length || result.rows.some(r=>r.moved===0) || result.diagonalIntents || result.teleports) throw new Error(JSON.stringify(result));
  if(!result.corridor && (result.nearChoices===0 || result.meanSeparation<=result.initialSeparation)) throw new Error(JSON.stringify(result));
  await page.locator('.scene').screenshot({path:`output/playwright/c069-${result.corridor?'corridor':'spread'}.png`});
  return {...result,rows:result.rows.map(r=>({character:r.character,moved:r.moved,position:r.position}))};
}
