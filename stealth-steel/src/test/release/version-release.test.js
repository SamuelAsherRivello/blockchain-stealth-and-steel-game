import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assertTag, nextPatch, planRelease, releaseBase, versionFiles } from '../../../tools/release/release-core.mjs';

const source = {
  version: '0.1.15', lockVersion: '0.1.15', latestTag: 'v0.1.15',
  head: 'new-main', remoteMain: 'new-main', currentTagCommit: 'prior-release', currentPublished: true,
};

test('patch planning uses the checked-in version and the authoritative main commit', () => {
  assert.equal(nextPatch('0.1.15'), '0.1.16');
  assert.deepEqual(planRelease(source), { mode: 'new', tag: 'v0.1.16', version: '0.1.16', sourceCommit: 'new-main' });
  assert.equal(releaseBase('v0.1.16'), '/blockchain-stealth-and-steel-game/releases/v0.1.16/');
});

test('release planning can publish an explicitly checked-in catch-up version', () => {
  assert.deepEqual(planRelease({ version: '0.0.16', lockVersion: '0.0.16', latestTag: 'v0.1.15',
    head: 'new-main', remoteMain: 'new-main', currentTagCommit: null, allowVersionCatchUp: true }),
    { mode: 'new', tag: 'v0.0.16', version: '0.0.16', sourceCommit: 'new-main' });
});

test('release planning rejects malformed versions, stale checkout, disagreement, and duplicate tag', () => {
  for (const tag of ['v0.1', 'V0.1.16', 'v0.1.16-beta', 'v01.1.16']) assert.throws(() => assertTag(tag));
  assert.throws(() => planRelease({ ...source, remoteMain: 'other' }), /origin\/main/);
  assert.throws(() => planRelease({ ...source, lockVersion: '0.1.14' }), /disagree/);
  assert.throws(() => planRelease({ ...source, latestTag: 'v0.1.14' }), /latest/);
  assert.throws(() => planRelease({ ...source, nextTagExists: true }), /already exists/);
  assert.throws(() => planRelease({ ...source, currentPublished: false }), /Complete publication/);
});

test('an incomplete current tag resumes without a new version; complete tags do not duplicate', () => {
  const current = { ...source, version: '0.1.16', lockVersion: '0.1.16', latestTag: 'v0.1.16',
    head: 'release-commit', remoteMain: 'release-commit', currentTagCommit: 'release-commit' };
  assert.deepEqual(planRelease({ ...current, currentPublished: false }),
    { mode: 'resume', tag: 'v0.1.16', version: '0.1.16', sourceCommit: 'release-commit' });
  assert.throws(() => planRelease({ ...current, currentPublished: true }), /No unreleased/);
  assert.deepEqual(planRelease({ ...current, retryTag: 'v0.1.16', retryTagCommit: 'release-commit', retryAncestor: true }),
    { mode: 'resume', tag: 'v0.1.16', version: '0.1.16', sourceCommit: 'release-commit' });
  assert.throws(() => planRelease({ ...current, retryTag: 'v0.1.16', retryTagCommit: 'release-commit', retryAncestor: true, retryPublished: true }), /fully published/);
  assert.throws(() => planRelease({ ...current, latestTag: 'v0.1.17', retryTag: 'v0.1.16',
    retryTagCommit: 'release-commit', retryAncestor: true }), /latest release tag/);
});

test('version update keeps npm manifest and lockfile root aligned', () => {
  const manifest = { name: 'game', version: '0.1.15', dependencies: { example: '1' } };
  const lock = { name: 'game', version: '0.1.15', packages: { '': { name: 'game', version: '0.1.15' } } };
  const updated = versionFiles(manifest, lock, '0.1.16');
  assert.equal(updated.manifest.version, '0.1.16');
  assert.equal(updated.lock.version, '0.1.16');
  assert.equal(updated.lock.packages[''].version, '0.1.16');
  assert.equal(manifest.version, '0.1.15');
});

test('Vite always uses the stable repository base, ignoring obsolete tag routing', () => {
  const root = fileURLToPath(new URL('../../../../', import.meta.url));
  const inspect = tag => {
    const env = { ...process.env };
    if (tag === null) delete env.GAME_RELEASE_TAG;
    else env.GAME_RELEASE_TAG = tag;
    return spawnSync(process.execPath, ['--input-type=module', '--eval',
      'import config from "./vite.config.js"; process.stdout.write(config.base);'],
    { cwd: root, env, encoding: 'utf8' });
  };
  const local = inspect(null);
  assert.equal(local.status, 0, local.stderr);
  assert.equal(local.stdout, '/blockchain-stealth-and-steel-game/');
  const release = inspect('v0.1.16');
  assert.equal(release.status, 0, release.stderr);
  assert.equal(release.stdout, '/blockchain-stealth-and-steel-game/');
  const invalid = inspect('v0.1.16-beta');
  assert.equal(invalid.status, 0, invalid.stderr);
  assert.equal(invalid.stdout, '/blockchain-stealth-and-steel-game/');
});
