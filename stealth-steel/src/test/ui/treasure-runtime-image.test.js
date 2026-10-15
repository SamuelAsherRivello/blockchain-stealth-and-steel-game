import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('treasure runtime atlas uses a decodable PNG instead of the editor SVG', async () => {
  const main = await readFile(new URL('../../runtime/main.js', import.meta.url), 'utf8');
  assert.ok(main.includes('assets/images/ui/spawners/treasure-chest.png'));
  const png = await readFile(new URL('../../../public/assets/images/ui/spawners/treasure-chest.png', import.meta.url));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 64);
  assert.equal(png.readUInt32BE(20), 64);
});
