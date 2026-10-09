import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
const documents=['README.md','stealth-steel/documentation/deep-dive.md','stealth-steel/documentation/BIS_GAME_COMMUNICATION_EXPLORATION.md','stealth-steel/documentation/PROJECT_REFACTOR_THOUGHTS.md','stealth-steel/documentation/treasure-lto.md',...['runtime-controller.js','dom-ui-module.js','node-feature-test.js'].map(name=>`stealth-steel/documentation/Code Templates/${name}.md`)];
test('current BIS guides/templates resolve local and companion-source links',()=>{
  for(const file of documents){
    const text=readFileSync(resolve(root,file),'utf8');
    for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
      const target=match[1];if(/^(?:https?:|#)/.test(target))continue;
      const path=resolve(dirname(resolve(root,file)),decodeURIComponent(target.split('#')[0]));assert.ok(existsSync(path),`${file}: ${target}`);
    }
  }
});
test('deep dive canonical bootstrap is the real compiled public example and keeps the one shared diagram',()=>{
  const doc=readFileSync(resolve(root,'stealth-steel/documentation/deep-dive.md'),'utf8'),fixture=readFileSync(resolve(root,'stealth-steel/src/test/integration/fixtures/bis-contract-types.ts'),'utf8');
  const example=text=>text.match(/export async function mountBis[\s\S]*?\n}/)?.[0];
  assert.ok(example(doc));assert.equal(example(doc),example(fixture));
  assert.ok(doc.includes('blockchain-integration-service/main/BIS/documentation/diagrams/bis-sequence-diagram-2.png'));
  assert.doesNotMatch(doc,/a TypeScript stealth|services\.createContinue|StealthAndSteelBisGame/);
});
test('communication inventory names actual public exports and distinguishes adopted from historical contracts',()=>{
  const doc=readFileSync(resolve(root,'stealth-steel/documentation/BIS_GAME_COMMUNICATION_EXPLORATION.md'),'utf8'),exports=readFileSync(resolve(root,'node_modules/@bis/integration/src/index.ts'),'utf8');
  assert.match(doc,/## 1\. Contracts/);assert.match(doc,/\| Role \| BIS offers \| Game offers \| Current Contracts \| Proposed Contracts \|/);
  for(const [,name]of doc.matchAll(/`((?:IBis|Bis)[A-Z]\w+)`/g))assert.ok(exports.includes(name),`Undeclared public type ${name}`);
  assert.match(doc,/Historical|historical/);assert.match(doc,/implementation-selector/);
});
