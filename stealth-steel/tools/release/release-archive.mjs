import { deflateRawSync, inflateRawSync } from 'node:zlib';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { allFiles, assertTag, redirectHtml } from './release-core.mjs';

const LOCAL = 0x04034b50;
const CENTRAL = 0x02014b50;
const END = 0x06054b50;
const MAX_UNPACKED = 1_000_000_000;
const TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = value & 1 ? (value >>> 1) ^ 0xedb88320 : value >>> 1;
  return value >>> 0;
});

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) value = TABLE[(value ^ byte) & 255] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function archiveName(name) {
  if (!name || name.startsWith('/') || name.includes('\\') || name.includes(':') ||
      name.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error(`Unsafe archive entry: ${name}`);
  }
  return name;
}

export async function createBrowserZip(dist, output) {
  const entries = await allFiles(dist);
  if (!entries.length || entries.length > 65535 || !entries.some(entry => entry.name === 'index.html')) {
    throw new Error('Browser build must contain index.html and fit a standard ZIP');
  }
  const local = [], central = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(archiveName(entry.name), 'utf8');
    const raw = await readFile(entry.path);
    const packed = deflateRawSync(raw, { level: 9 });
    const compressed = packed.length < raw.length ? packed : raw;
    const method = packed.length < raw.length ? 8 : 0;
    if (raw.length > 0xffffffff || compressed.length > 0xffffffff || offset > 0xffffffff) throw new Error('ZIP exceeds standard size limit');
    const crc = crc32(raw);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(LOCAL, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x0800, 6); // UTF-8 names
    header.writeUInt16LE(method, 8);
    header.writeUInt16LE(0, 10); // 1980-01-01 00:00:00
    header.writeUInt16LE(33, 12);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(compressed.length, 18);
    header.writeUInt32LE(raw.length, 22);
    header.writeUInt16LE(name.length, 26);
    local.push(header, name, compressed);

    const record = Buffer.alloc(46);
    record.writeUInt32LE(CENTRAL, 0);
    record.writeUInt16LE(0x0314, 4);
    record.writeUInt16LE(20, 6);
    record.writeUInt16LE(0x0800, 8);
    record.writeUInt16LE(method, 10);
    record.writeUInt16LE(0, 12);
    record.writeUInt16LE(33, 14);
    record.writeUInt32LE(crc, 16);
    record.writeUInt32LE(compressed.length, 20);
    record.writeUInt32LE(raw.length, 24);
    record.writeUInt16LE(name.length, 28);
    record.writeUInt32LE((0o100644 << 16) >>> 0, 38);
    record.writeUInt32LE(offset, 42);
    central.push(record, name);
    offset += header.length + name.length + compressed.length;
  }
  const directory = Buffer.concat(central);
  if (offset + directory.length > 0xffffffff) throw new Error('ZIP exceeds standard size limit');
  const end = Buffer.alloc(22);
  end.writeUInt32LE(END, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, Buffer.concat([...local, directory, end]));
  return entries.length;
}

export async function extractBrowserZip(archive, destination) {
  const zip = await readFile(archive);
  let end = -1;
  for (let cursor = zip.length - 22; cursor >= Math.max(0, zip.length - 65557); cursor--) {
    if (zip.readUInt32LE(cursor) === END) { end = cursor; break; }
  }
  if (end < 0) throw new Error('ZIP end record is missing');
  if (zip.readUInt16LE(end + 4) || zip.readUInt16LE(end + 6)) throw new Error('Multi-disk ZIP is unsupported');
  const count = zip.readUInt16LE(end + 10);
  const directoryEnd = zip.readUInt32LE(end + 16) + zip.readUInt32LE(end + 12);
  if (directoryEnd > end) throw new Error('ZIP directory exceeds archive bounds');
  let cursor = zip.readUInt32LE(end + 16);
  let total = 0;
  const seen = new Set();
  for (let index = 0; index < count; index++) {
    if (cursor + 46 > directoryEnd || zip.readUInt32LE(cursor) !== CENTRAL) throw new Error('Invalid ZIP directory');
    const flags = zip.readUInt16LE(cursor + 8);
    const method = zip.readUInt16LE(cursor + 10);
    const crc = zip.readUInt32LE(cursor + 16);
    const packedSize = zip.readUInt32LE(cursor + 20);
    const rawSize = zip.readUInt32LE(cursor + 24);
    const nameLength = zip.readUInt16LE(cursor + 28);
    const extraLength = zip.readUInt16LE(cursor + 30);
    const commentLength = zip.readUInt16LE(cursor + 32);
    const mode = zip.readUInt32LE(cursor + 38) >>> 16;
    const localOffset = zip.readUInt32LE(cursor + 42);
    if (flags & 1 || ![0, 8].includes(method) || (mode & 0o170000) === 0o120000) throw new Error('Unsupported ZIP entry');
    const name = zip.subarray(cursor + 46, cursor + 46 + nameLength).toString('utf8');
    const isDirectory = name.endsWith('/');
    const safeName = archiveName(isDirectory ? name.slice(0, -1) : name);
    if (seen.has(safeName.toLowerCase())) throw new Error(`Duplicate ZIP entry: ${name}`);
    seen.add(safeName.toLowerCase());
    if (localOffset + 30 > zip.length || zip.readUInt32LE(localOffset) !== LOCAL) throw new Error('Invalid ZIP local entry');
    const dataStart = localOffset + 30 + zip.readUInt16LE(localOffset + 26) + zip.readUInt16LE(localOffset + 28);
    if (dataStart + packedSize > zip.length) throw new Error('ZIP entry exceeds archive bounds');
    total += rawSize;
    if (total > MAX_UNPACKED) throw new Error('ZIP exceeds safe uncompressed size');
    const packed = zip.subarray(dataStart, dataStart + packedSize);
    const raw = method === 8 ? inflateRawSync(packed, { maxOutputLength: rawSize + 1 }) : packed;
    if (raw.length !== rawSize || crc32(raw) !== crc) throw new Error(`ZIP entry checksum mismatch: ${name}`);
    const target = join(destination, ...safeName.split('/'));
    if (isDirectory) {
      if (rawSize) throw new Error('ZIP directory contains data');
      await mkdir(target, { recursive: true });
    } else {
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, raw);
    }
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  if (!seen.has('index.html')) throw new Error('Browser ZIP lacks index.html');
  return count;
}

export async function stagePages(archives, latestTag, site) {
  assertTag(latestTag);
  if (!archives.some(entry => entry.tag === latestTag)) throw new Error('Latest release archive is missing');
  await mkdir(site, { recursive: true });
  const tags = new Set();
  for (const { tag, path } of archives) {
    assertTag(tag);
    if (tags.has(tag)) throw new Error(`Duplicate release archive: ${tag}`);
    tags.add(tag);
    await extractBrowserZip(path, join(site, 'releases', tag));
  }
  await mkdir(join(site, 'latest'), { recursive: true });
  await writeFile(join(site, 'index.html'), redirectHtml(`releases/${latestTag}/`));
  await writeFile(join(site, 'latest', 'index.html'), redirectHtml(`../releases/${latestTag}/`));
  await writeFile(join(site, '.nojekyll'), '');
  return tags.size;
}
