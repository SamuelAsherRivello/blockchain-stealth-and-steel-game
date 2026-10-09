import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {assertVersion,metadataText,finalizeMetadata} from './release-core.mjs';

export function pagesReleaseVersion(manifest) {
  const version=assertVersion(manifest.version);
  if(manifest.dependencies?.['@bis/integration']!==`file:stealth-steel/vendor/bis-integration-${version}.tgz`)
    throw Error('Coordinated game and imported BIS versions must match completely.');
  return `v${version}`;
}

/** Vite build hook: finished browser files, fixed-width metadata, exact final size. */
export function pagesMetadataPlugin({manifestPath,distPath}) {
  return {name:'game-pages-metadata',apply:'build',async closeBundle(){
    const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
    const label=pagesReleaseVersion(manifest);
    await writeFile(join(distPath,'environment.json'),metadataText(label),'utf8');
    const bytes=await finalizeMetadata(distPath,label);
    console.info(`Pages metadata: ${label}, ${bytes} uncompressed bytes (BIS ${manifest.version})`);
  }};
}
