import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
test('real installed package checks host, consumers and negative public contract fixtures',()=>{
  const result=spawnSync(process.execPath,[join(root,'node_modules/typescript/bin/tsc'),'--project','tsconfig.bis-contract.json'],{cwd:root,encoding:'utf8',timeout:60000});
  assert.equal(result.status,0,result.stdout+result.stderr);
  const config=JSON.parse(readFileSync(join(root,'tsconfig.bis-contract.json'),'utf8'));
  assert.equal(config.compilerOptions.paths,undefined);
  assert.equal(existsSync(join(root,'stealth-steel/src/runtime/integration/bis-contract.d.ts')),false);
});
test('runtime integration imports only public BIS entries and exposes no old composition backdoors',()=>{
  const directory=join(root,'stealth-steel/src/runtime/integration');
  for(const name of readdirSync(directory).filter(value=>value.endsWith('.js'))){
    const source=readFileSync(join(directory,name),'utf8');
    assert.doesNotMatch(source,/@bis\/integration\/(?!style\.css)|createBisContext|createBisUi|createBisLto|createBisEquipment|createBisContinue|createBisAssetCollection|getSession\(|\.lto\b/,name);
  }
});
