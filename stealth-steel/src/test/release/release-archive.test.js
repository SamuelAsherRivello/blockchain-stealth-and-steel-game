import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { createBrowserZip, extractBrowserZip, stagePages } from '../../../tools/release/release-archive.mjs';
import { finalizeMetadata, metadataText, totalBytes } from '../../../tools/release/release-core.mjs';

async function fixture(fn) {
  const root = await mkdtemp(join(tmpdir(), 'stealth-release-test-'));
  try { return await fn(root); }
  finally {
    assert.ok(resolve(root).startsWith(resolve(tmpdir()) + sep));
    await rm(root, { recursive: true, force: true });
  }
}

async function build(root, tag, content) {
  const dist = join(root, tag);
  await mkdir(join(dist, 'assets'), { recursive: true });
  await writeFile(join(dist, 'index.html'), `<title>${content}</title>`);
  await writeFile(join(dist, 'assets', 'main.js'), `console.log(${JSON.stringify(content)});`);
  await writeFile(join(dist, 'environment.json'), metadataText(tag));
  return dist;
}

test('fixed-width metadata records the final uncompressed total', async () => fixture(async root => {
  const dist = await build(root, 'v0.1.16', 'new');
  const total = await finalizeMetadata(dist, 'v0.1.16');
  assert.equal(await totalBytes(dist), total);
  assert.deepEqual(JSON.parse(await readFile(join(dist, 'environment.json'), 'utf8')),
    { releaseVersion: 'v0.1.16', downloadSize: String(total).padStart(12, '0') });
  await assert.rejects(() => finalizeMetadata(dist, 'v0.1.16'), /placeholder/);
}));

test('browser ZIP is reproducible and stages current and previous releases with redirects', async () => fixture(async root => {
  const oldDist = await build(root, 'v0.1.15', 'old');
  const newDist = await build(root, 'v0.1.16', 'new');
  await finalizeMetadata(oldDist, 'v0.1.15');
  await finalizeMetadata(newDist, 'v0.1.16');
  const oldZip = join(root, 'old.zip'), newZip = join(root, 'new.zip'), repeat = join(root, 'repeat.zip');
  await createBrowserZip(oldDist, oldZip);
  await createBrowserZip(newDist, newZip);
  await createBrowserZip(newDist, repeat);
  assert.deepEqual(await readFile(newZip), await readFile(repeat));
  const site = join(root, 'site');
  assert.equal(await stagePages([{ tag: 'v0.1.15', path: oldZip }, { tag: 'v0.1.16', path: newZip }], 'v0.1.16', site), 2);
  assert.match(await readFile(join(site, 'index.html'), 'utf8'), /releases\/v0\.1\.16\//);
  assert.match(await readFile(join(site, 'index.html'), 'utf8'), /location\.search \+ location\.hash/);
  assert.match(await readFile(join(site, 'latest', 'index.html'), 'utf8'), /\.\.\/releases\/v0\.1\.16\//);
  assert.match(await readFile(join(site, 'releases', 'v0.1.15', 'index.html'), 'utf8'), /old/);
  assert.match(await readFile(join(site, 'releases', 'v0.1.16', 'index.html'), 'utf8'), /new/);
}));

test('archive extraction rejects path traversal and invalid CRC', async () => fixture(async root => {
  const dist = await build(root, 'v0.1.16', 'new');
  await finalizeMetadata(dist, 'v0.1.16');
  const archive = join(root, 'safe.zip');
  await createBrowserZip(dist, archive);
  const bytes = await readFile(archive);
  const central = bytes.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  assert.ok(central >= 0);
  const nameLength = bytes.readUInt16LE(central + 28);
  const unsafe = Buffer.from('../bad.txt'.padEnd(nameLength, '.'));
  unsafe.copy(bytes, central + 46);
  const bad = join(root, 'bad.zip');
  await writeFile(bad, bytes);
  await assert.rejects(() => extractBrowserZip(bad, join(root, 'extract')), /Unsafe archive entry/);
  const corrupt = await readFile(archive);
  corrupt.writeUInt32LE(0, central + 16);
  await writeFile(bad, corrupt);
  await assert.rejects(() => extractBrowserZip(bad, join(root, 'extract2')), /checksum mismatch/);
}));
