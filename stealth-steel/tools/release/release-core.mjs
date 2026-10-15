import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

export const RELEASE_ASSET = 'stealth-and-steel-web-build.zip';
export const SIZE_PLACEHOLDER = '000000000000';
export const REPOSITORY_BASE = '/blockchain-stealth-and-steel-game/';
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const TAG = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function assertVersion(version) {
  if (typeof version !== 'string' || !VERSION.test(version)) throw new Error(`Invalid three-component version: ${version}`);
  return version;
}

export function assertTag(tag) {
  if (typeof tag !== 'string' || !TAG.test(tag)) throw new Error(`Invalid release tag: ${tag}`);
  return tag;
}

export function nextPatch(version) {
  const parts = assertVersion(version).split('.');
  const patch = Number(parts[2]);
  if (!Number.isSafeInteger(patch) || patch === Number.MAX_SAFE_INTEGER) throw new Error('Patch version exceeds safe integer range');
  return `${parts[0]}.${parts[1]}.${patch + 1}`;
}

export function releaseBase(tag) {
  return `${REPOSITORY_BASE}releases/${assertTag(tag)}/`;
}

export function planRelease({ version, lockVersion, latestTag, head, remoteMain, currentTagCommit,
  currentPublished = false, nextTagExists = false, retryTag = null, retryTagCommit = null,
  retryPublished = false, retryAncestor = false, allowVersionCatchUp = false } = {}) {
  assertVersion(version);
  if (version !== lockVersion) throw new Error('package.json and package-lock.json versions disagree');
  if (retryTag) {
    assertTag(retryTag);
    if (latestTag !== retryTag) throw new Error('Retry tag must be the latest release tag');
    if (retryTag !== `v${version}` || !retryTagCommit || retryTagCommit !== head || !retryAncestor) {
      throw new Error('Retry tag does not identify the checked-out version and commit');
    }
    if (retryPublished) throw new Error(`Release ${retryTag} is already fully published`);
    return { mode: 'resume', tag: retryTag, version, sourceCommit: head };
  }
  if (!head || head !== remoteMain) throw new Error('Checkout differs from origin/main');
  const targetTag = `v${version}`;
  if (allowVersionCatchUp && latestTag !== targetTag && !currentTagCommit) {
    if (currentPublished) throw new Error(`Release ${targetTag} is already fully published`);
    return { mode: 'new', tag: targetTag, version, sourceCommit: head };
  }
  if (latestTag !== targetTag || !currentTagCommit) {
    throw new Error('Checked-in version must match the latest existing release tag');
  }
  if (head === currentTagCommit) {
    if (currentPublished) throw new Error('No unreleased main commit to publish');
    return { mode: 'resume', tag: latestTag, version, sourceCommit: head };
  }
  if (!currentPublished) throw new Error(`Complete publication of ${latestTag} before a new version`);
  const nextVersion = nextPatch(version);
  const nextTag = `v${nextVersion}`;
  if (nextTagExists) throw new Error(`Release tag ${nextTag} already exists`);
  return { mode: 'new', tag: nextTag, version: nextVersion, sourceCommit: head };
}

export function versionFiles(manifest, lock, version) {
  assertVersion(version);
  if (!lock?.packages?.['']) throw new Error('Missing lockfile root package');
  return {
    manifest: { ...manifest, version },
    lock: { ...lock, version, packages: { ...lock.packages, '': { ...lock.packages[''], version } } },
  };
}

export function metadataText(tag, size = SIZE_PLACEHOLDER) {
  assertTag(tag);
  if (!/^\d{12}$/.test(size)) throw new Error('Release size must contain exactly twelve digits');
  return `${JSON.stringify({ releaseVersion: tag, downloadSize: size }, null, 2)}\n`;
}

export async function allFiles(root) {
  const result = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile()) result.push({ path, name: relative(root, path).replaceAll('\\', '/') });
      else throw new Error(`Unsupported build entry: ${path}`);
    }
  }
  await walk(root);
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export async function totalBytes(root) {
  let total = 0;
  for (const file of await allFiles(root)) total += (await stat(file.path)).size;
  return total;
}

export async function finalizeMetadata(dist, tag) {
  const path = join(dist, 'environment.json');
  const before = await readFile(path, 'utf8');
  if (before !== metadataText(tag)) throw new Error('Built metadata does not contain the expected tag and size placeholder');
  const total = await totalBytes(dist);
  if (total > 999_999_999_999) throw new Error('Build exceeds twelve-digit size field');
  const size = String(total).padStart(12, '0');
  const after = metadataText(tag, size);
  if (after.length !== before.length) throw new Error('Final metadata changes its file length');
  await writeFile(path, after, 'utf8');
  if (await totalBytes(dist) !== total) throw new Error('Final metadata changed the measured build size');
  return total;
}

export function redirectHtml(target) {
  if (!/^(?:\.\.\/)?releases\/v\d+\.\d+\.\d+\/$/.test(target)) throw new Error(`Invalid redirect target: ${target}`);
  const escaped = target.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${escaped}"><link rel="canonical" href="${escaped}"><title>Stealth and Steel</title><script>location.replace(new URL(${JSON.stringify(target)}, location.href).href + location.search + location.hash);</script></head><body><p><a href="${escaped}">Open the latest release</a></p></body></html>\n`;
}
