import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {protectGameHtml,gameContentSecurityPolicy,gameSignerOrigin} from '../../../tools/release/content-security-policy.mjs';
import {testNetwork} from '@bis/integration';

test('Pages CSP precedes resources and permits only exact authored inline code',()=>{
  const style='body { color: white; }',script='window.authored=true';
  const input=`<html><head><style>${style}</style><script>${script}</script><script src="./game.js"></script></head><body></body></html>`;
  const output=protectGameHtml(input);
  assert.ok(output.indexOf('http-equiv="Content-Security-Policy"')<output.indexOf('<style>'));
  for(const value of [style,script])assert.ok(output.includes(`sha256-${createHash('sha256').update(value).digest('base64')}`));
  assert.doesNotMatch(output,/unsafe-inline|unsafe-eval|wasm-unsafe-eval/);
  assert.match(output,/script-src-attr 'none'/);assert.match(output,/style-src-attr 'none'/);
  assert.match(output,/default-src 'none'/);assert.match(output,/object-src 'none'/);
  assert.doesNotMatch(output,/script-src[^;]*https:|connect-src[^;]*\*/);
});

test('CSP hashes change with authored content and reject missing or competing policies',()=>{
  const first=protectGameHtml('<head><style>a{color:red}</style></head>');
  assert.notEqual(first,protectGameHtml('<head><style>a{color:blue}</style></head>'));
  assert.throws(()=>protectGameHtml('<body>no head</body>'),/requires a head/);
  assert.throws(()=>protectGameHtml(first),/explicit reconciliation/);
});

test('production build wires the Pages CSP independently of development and HMR',async()=>{
  const config=await readFile(new URL('../../../../vite.config.js',import.meta.url),'utf8');
  assert.match(config,/gameContentSecurityPolicy\(\)/);
  assert.equal(gameContentSecurityPolicy().apply,'build');
});

test('CSP permits the exact installed network providers and pinned covenant preflight without a broad HTTPS rule',async()=>{
  const policy=protectGameHtml('<head></head>').match(/content="([^"]+)"/)[1];
  const connection=policy.split('; ').find(value=>value.startsWith('connect-src '));
  for(const network of ['signet','mutinynet']){
    assert.ok(connection.includes(testNetwork(network).operator));
    assert.ok(connection.includes(new URL(testNetwork(network).explorerApiUrl).origin));
  }
  const source=await readFile(new URL('../../../../node_modules/@bis/integration/src/client/wallet-layer-arkade/treasure-capability.ts',import.meta.url),'utf8');
  const emulator=source.match(/url:'([^']+)'/)[1];
  assert.ok(connection.includes(new URL(emulator).origin));
  assert.equal(connection.includes('https://mempool.space'),false,'navigation links do not require connection permission');
  assert.doesNotMatch(connection,/(?:^|\s)https:(?:\s|$)|\*/);
});

test('an explicitly configured public signer grants only its exact HTTPS origin and rejects credential or directive injection',()=>{
  assert.equal(gameSignerOrigin('/api/bis/'),undefined);
  assert.equal(gameSignerOrigin(undefined),undefined);
  assert.equal(gameSignerOrigin('https://signer.example/api/bis/'),'https://signer.example');
  for(const value of ['//signer.example/api/bis','http://signer.example','https://user:secret@signer.example','https://signer.example/?token=secret',
    'https://signer.example/#secret','/api/bis/?token=secret','/api/bis/#secret',"https://signer.example/;script-src *",'https://signer.example/\n'])assert.throws(()=>gameSignerOrigin(value));
  const plugin=gameContentSecurityPolicy();plugin.configResolved({env:{VITE_BIS_SERVER_URL:'https://signer.example/api/bis/'}});
  const html=plugin.transformIndexHtml.handler('<head></head>');
  assert.match(html,/connect-src[^;]*https:\/\/signer\.example/);
  assert.doesNotMatch(html,/script-src[^;]*signer\.example/);
});
