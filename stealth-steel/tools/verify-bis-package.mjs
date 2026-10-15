// Verify the fixed public package without reading account state or requiring a sibling checkout.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const vendor = new URL('stealth-steel/vendor/', root);
const installed = new URL('node_modules/@bis/integration/', root);
const json = async url => JSON.parse(await readFile(url, 'utf8'));
const hash = async url => createHash('sha256').update(await readFile(url)).digest('hex');
const inventory = await json(new URL('bis-package-inventory.json', vendor));
const manifest = await json(new URL('package.json', root));
assert.equal(manifest.dependencies['@bis/integration'], `file:stealth-steel/vendor/${inventory.artifact}`);
assert.equal(await hash(new URL(inventory.artifact, vendor)), inventory.sha256, 'Archive differs from the recorded snapshot');
for (const [path, expected] of Object.entries(inventory.files)) {
  assert.equal(await hash(new URL(path, installed)), expected, `Installed package differs: ${path}`);
}
const pkg = await json(new URL('package.json', installed));
assert.equal(pkg.name, '@bis/integration');
assert.equal(inventory.artifact, `bis-integration-${pkg.version}.tgz`);
assert.ok(inventory.files[pkg.exports['.'].types.replace(/^\.\//, '')], 'Missing actual public types export');
for (const entry of ['.', './style.css']) {
  for (const condition of ['development', 'default']) {
    const path = pkg.exports[entry][condition].replace(/^\.\//, '');
    assert.ok(inventory.files[path], `Missing public export: ${entry} (${condition})`);
  }
}
console.log(`PASS @bis/integration ${pkg.version}: archive hash, ${Object.keys(inventory.files).length} installed files, public development/production JS and CSS exports`);
