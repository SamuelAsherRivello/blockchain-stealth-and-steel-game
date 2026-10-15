import { appendFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserZip, stagePages } from './release-archive.mjs';
import { RELEASE_ASSET, assertTag, finalizeMetadata, metadataText, nextPatch, planRelease, releaseBase, versionFiles } from './release-core.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const manifestPath = join(root, 'package.json');
const lockPath = join(root, 'package-lock.json');
const sourceMetadataPath = join(root, 'stealth-steel', 'public', 'environment.json');
const releaseWork = process.env.RELEASE_WORK;

function run(program, args) {
  return execFileSync(program, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function tagCommit(tag) {
  try { return run('git', ['rev-parse', '--verify', `refs/tags/${assertTag(tag)}^{commit}`]); }
  catch { return null; }
}

function tagUsesReleaseTool(tag) {
  try { run('git', ['cat-file', '-e', `refs/tags/${assertTag(tag)}:stealth-steel/tools/release/release-cli.mjs`]); return true; }
  catch { return false; }
}

function semverParts(tag) { return assertTag(tag).slice(1).split('.').map(BigInt); }

function latestTag() {
  const tags = run('git', ['tag', '--list', 'v*']).split(/\r?\n/).filter(Boolean).filter(tag => {
    try { assertTag(tag); return true; } catch { return false; }
  });
  return tags.sort((a, b) => {
    const x = semverParts(a), y = semverParts(b);
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
    return 0;
  }).at(-1) ?? null;
}

function release(tag) {
  try {
    return JSON.parse(run('gh', ['release', 'view', assertTag(tag), '--json', 'assets,body,isDraft,tagName']));
  } catch (error) {
    const message = String(error.stderr ?? error.message);
    if (/release not found|HTTP 404|Not Found/i.test(message)) return null;
    throw new Error(`Cannot inspect GitHub Release ${tag}: ${message}`);
  }
}

function publication(tag) {
  const found = release(tag);
  const hasAsset = found?.assets?.some(asset => asset.name === RELEASE_ASSET) ?? false;
  const marked = found?.body?.includes(`<!-- pages-published:${tag} -->`) ?? false;
  return { exists: Boolean(found), hasAsset, complete: marked, isDraft: found?.isDraft ?? false };
}

async function output(values) {
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, Object.entries(values).map(([key, value]) => `${key}=${value}\n`).join(''));
  }
  process.stdout.write(`${JSON.stringify(values)}\n`);
}

async function prepare() {
  if (process.env.GITHUB_EVENT_NAME !== 'workflow_dispatch' || process.env.GITHUB_REF !== 'refs/heads/main') {
    throw new Error('Release must be manually dispatched on main');
  }
  run('git', ['fetch', '--prune', 'origin', 'main', '--tags']);
  const remoteMain = run('git', ['rev-parse', 'refs/remotes/origin/main']);
  if (run('git', ['rev-parse', 'HEAD']) !== remoteMain) throw new Error('Workflow checkout is not origin/main');
  const retryTag = process.env.RETRY_TAG || null;
  let retryTagCommit = null, retryAncestor = false;
  if (retryTag) {
    retryTagCommit = tagCommit(retryTag);
    if (!retryTagCommit) throw new Error(`Retry tag ${retryTag} does not exist`);
    try { run('git', ['merge-base', '--is-ancestor', retryTagCommit, remoteMain]); retryAncestor = true; }
    catch { throw new Error('Retry tag is not an ancestor of origin/main'); }
    run('git', ['checkout', '--detach', `refs/tags/${retryTag}`]);
  }
  const head = run('git', ['rev-parse', 'HEAD']);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  if (lock.packages?.['']?.version !== lock.version) throw new Error('Lockfile root version disagrees with lockfile version');
  const currentTag = `v${manifest.version}`;
  const current = publication(currentTag);
  const currentTagCommit = tagCommit(currentTag);
  const latest = latestTag();
  const nextTag = `v${nextPatch(manifest.version)}`;
  const retry = retryTag ? publication(retryTag) : null;
  const plan = planRelease({ version: manifest.version, lockVersion: lock.version, latestTag: latest,
    head, remoteMain, currentTagCommit,
    currentPublished: current.complete || (current.exists && !current.hasAsset && !tagUsesReleaseTool(currentTag)),
    nextTagExists: Boolean(tagCommit(nextTag)), retryTag, retryTagCommit, retryPublished: retry?.complete,
    retryAncestor, allowVersionCatchUp: true });
  if (plan.mode === 'new') {
    const updated = versionFiles(manifest, lock, plan.version);
    await writeFile(manifestPath, `${JSON.stringify(updated.manifest, null, 2)}\n`);
    await writeFile(lockPath, `${JSON.stringify(updated.lock, null, 2)}\n`);
    await writeFile(sourceMetadataPath, metadataText(plan.tag));
  } else if (await readFile(sourceMetadataPath, 'utf8') !== metadataText(plan.tag)) {
    throw new Error('Retry source metadata does not match its tag and placeholder');
  }
  await output({ mode: plan.mode, tag: plan.tag, version: plan.version,
    source_sha: plan.sourceCommit, base: releaseBase(plan.tag) });
}

function workPath(...segments) {
  if (!releaseWork) throw new Error('RELEASE_WORK must identify a temporary release directory');
  return join(resolve(releaseWork), ...segments);
}

async function finalize() {
  const tag = assertTag(process.env.RELEASE_TAG);
  const dist = join(root, 'dist');
  const total = await finalizeMetadata(dist, tag);
  const archive = workPath(RELEASE_ASSET);
  const count = await createBrowserZip(dist, archive);
  const sha = createHash('sha256').update(await readFile(archive)).digest('hex');
  await output({ asset: archive, asset_sha256: sha, build_bytes: total, packed_files: count });
}

async function stage() {
  const tag = assertTag(process.env.RELEASE_TAG);
  const work = resolve(releaseWork ?? '');
  const site = workPath('site');
  if (!site.startsWith(work + sep)) throw new Error('Site directory escaped RELEASE_WORK');
  await rm(site, { recursive: true, force: true });
  const currentArchive = workPath(RELEASE_ASSET);
  const releases = JSON.parse(run('gh', ['release', 'list', '--limit', '1000', '--json', 'tagName,isDraft,isPrerelease']));
  const archives = [];
  for (const item of releases) {
    if (item.isDraft || item.isPrerelease || item.tagName === tag) continue;
    try { assertTag(item.tagName); } catch { continue; }
    if (!publication(item.tagName).hasAsset) continue;
    const downloadDir = workPath('downloads', item.tagName);
    await mkdir(downloadDir, { recursive: true });
    run('gh', ['release', 'download', item.tagName, '--pattern', RELEASE_ASSET, '--dir', downloadDir]);
    archives.push({ tag: item.tagName, path: join(downloadDir, RELEASE_ASSET) });
  }
  archives.push({ tag, path: currentArchive });
  const count = await stagePages(archives, tag, site);
  await output({ site, release_count: count });
}

const action = process.argv[2];
if (action === 'prepare') await prepare();
else if (action === 'finalize') await finalize();
else if (action === 'stage') await stage();
else throw new Error('Use prepare, finalize, or stage');
