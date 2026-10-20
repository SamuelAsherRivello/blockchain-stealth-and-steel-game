import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const mapPath = name => new URL(`../../../../public/assets/levels/tiled/maps/${name}.tmj`, import.meta.url);

test('Level03 is an exact copy of the final Level01 map', async () => {
  const [levelOne, levelThree] = await Promise.all([
    readFile(mapPath('Level01'), 'utf8'),
    readFile(mapPath('Level03'), 'utf8'),
  ]);
  assert.equal(levelThree, levelOne);
});
