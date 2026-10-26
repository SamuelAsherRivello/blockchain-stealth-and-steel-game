import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {SingleKey,CSVMultisigTapscript,buildOffchainTx,verifyTapscriptSignatures,Transaction} from '@arkade-os/sdk';
import {hex} from '@scure/base';
import {compileTreasureProof,treasureDeadlineSeconds} from './treasure-contract-proof.mjs';

// Public deterministic identities, never funded. The VM binary executes emitted
// covenant bytecode; it is not a JavaScript copy of contract rules.
const identities=[1,2,3,4].map(n=>SingleKey.fromHex(n.toString(16).padStart(64,'0')));
const keys=await Promise.all(identities.map(async key=>hex.encode(await key.xOnlyPublicKey())));
const p={network:'signet',player:keys[0],game:keys[1],operator:keys[2],emulator:keys[3],
  playerDestination:keys[0],gameDestination:keys[1],deadline:2000000000,startedAtMs:1999999910000,exitDelay:2048};

test('C094 deadline rounds down for every millisecond of the original start second',()=>{
  for(let fraction=0;fraction<1000;fraction++){
    const startedAtMs=p.startedAtMs+fraction;
    const deadline=treasureDeadlineSeconds(startedAtMs);
    assert.equal(deadline,p.deadline);
    assert.ok(deadline*1000<=startedAtMs+90000);
    assert.ok(deadline*1000>startedAtMs+89000);
    assert.equal(compileTreasureProof({...p,startedAtMs}).args.deadline,BigInt(deadline));
  }
  for(const invalid of [-1,NaN,Infinity,0.1,Number.MAX_SAFE_INTEGER])
    assert.throws(()=>treasureDeadlineSeconds(invalid));
  assert.throws(()=>compileTreasureProof({...p,deadline:p.deadline+1}));
});

test('C094 proof commits timing, identities and network with no late player exit',()=>{
  const original=compileTreasureProof(p);
  assert.deepEqual(original.functions.map(f=>f.name),['claim','reject','cancel','refund','exit']);
  assert.equal(original.functions.find(f=>f.name==='exit').covenant,undefined);
  assert.deepEqual(original.program.functions.exit.tapscript.signers,['$game']);
  for(const change of [{deadline:p.deadline+1,startedAtMs:p.startedAtMs+1000},{network:'mutinynet'},{player:keys[3]},{gameDestination:keys[3]}])
    assert.notDeepEqual(compileTreasureProof({...p,...change}).script.pkScript,original.script.pkScript);
});

test('C094 emitted covenant enforces time and exact destinations in pinned upstream VM',()=>{
  const cases=[],expected=[];
  for(const network of ['signet','mutinynet']){
    const compiled=compileTreasureProof({...p,network});
    for(const fn of compiled.functions.filter(fn=>fn.covenant)){
      const dest=fn.name==='claim'?p.playerDestination:p.gameDestination;
      for(const now of [p.deadline-1,p.deadline,p.deadline+1,p.deadline+120]){
        const base={script:fn.covenant,inputAmount:1000,inputs:1,now,outputs:[
          {script:'5120'+dest,amount:1000},{script:'6a',amount:0},{script:'51024e73',amount:0},
        ]};
        cases.push(base);expected.push(fn.name==='refund'?now>=p.deadline:now<p.deadline);
        cases.push({...base,outputs:[{script:'5120'+keys[3],amount:1000},...base.outputs.slice(1)]});expected.push(false);
        cases.push({...base,inputAmount:999});expected.push(false);
        cases.push({...base,inputs:2});expected.push(false);
        cases.push({...base,outputs:[...base.outputs,{script:'5120'+keys[3],amount:1}]});expected.push(false);
        cases.push({...base,outputs:[{...base.outputs[0],amount:999},...base.outputs.slice(1)]});expected.push(false);
      }
    }
  }
  const vmRoot=process.env.TREASURE_VM_ROOT??resolve('../blockchain-integration-service/output/tools/conditional-vault/emulator');
  for(let restart=0;restart<2;restart++){
    const result=spawnSync(resolve(vmRoot,'conditional-vault-vm-clock.exe'),
      ['-test.run=^TestBISConditionalVaultClockFixtures$','-test.v'],{
        input:JSON.stringify(cases),encoding:'utf8',windowsHide:true,timeout:30000,
      });
    assert.equal(result.status,0,result.error?.message??result.stderr);
    const encoded=/BIS_RESULTS=(\[[^\r\n]+\])/.exec(result.stdout)?.[1];
    assert.ok(encoded,result.stdout);assert.deepEqual(JSON.parse(encoded),expected);
  }
});

test('C094 proof requires actual player/game signatures on their authorized branches',async()=>{
  const compiled=compileTreasureProof(p);
  const unroll=CSVMultisigTapscript.encode({pubkeys:[hex.decode(p.operator)],timelock:{type:'seconds',value:2048n}});
  for(const [name,required] of [['claim',[0]],['reject',[0,1]],['cancel',[0,1]],['refund',[1]]]){
    const fn=compiled.script.functionByName(name);
    const build=()=>buildOffchainTx([{txid:'ab'.repeat(32),vout:0,value:1000,
      tapLeafScript:fn.tapLeafScript,tapTree:compiled.script.encode()}],
      [{script:hex.decode('5120'+(name==='claim'?p.playerDestination:p.gameDestination)),amount:1000n}],unroll).arkTx;
    const requiredKeys=required.map(i=>keys[i]);
    assert.throws(()=>verifyTapscriptSignatures(build(),0,requiredKeys));
    let tx=build();
    for(const i of required)tx=await identities[i].sign(tx,[0]);
    assert.doesNotThrow(()=>verifyTapscriptSignatures(tx,0,requiredKeys));
    const wrong=await identities[2].sign(build(),[0]);
    assert.throws(()=>verifyTapscriptSignatures(wrong,0,requiredKeys));
  }
});

test('C094 only emergency branch executes Bitcoin CSV with game ownership',async()=>{
  const cases=[],expected=[];
  for(const network of ['signet','mutinynet']){
    const compiled=compileTreasureProof({...p,network});
    const fn=compiled.script.functionByName('exit');
    for(const [sequence,valid] of [[0x400004,true],[0x400003,false],[0x80000004,false],[4,false]]){
      const tx=new Transaction({version:2,allowUnknownOutputs:true});
      tx.addInput({txid:'ab'.repeat(32),index:0,sequence,
        witnessUtxo:{script:compiled.script.pkScript,amount:1000n},tapLeafScript:[fn.tapLeafScript]});
      tx.addOutput({script:hex.decode('5120'+p.gameDestination),amount:330n});
      const signed=await identities[1].sign(tx,[0]);signed.finalize();
      cases.push({bitcoinTx:hex.encode(signed.extract()),previousScript:hex.encode(compiled.script.pkScript),inputAmount:1000});
      expected.push(valid);
    }
  }
  const vmRoot=process.env.TREASURE_VM_ROOT??resolve('../blockchain-integration-service/output/tools/conditional-vault/emulator');
  const result=spawnSync(resolve(vmRoot,'conditional-vault-vm.exe'),[],{
    input:JSON.stringify(cases),encoding:'utf8',windowsHide:true,timeout:30000,
  });
  assert.equal(result.status,0,result.error?.message??result.stderr);
  assert.deepEqual(JSON.parse(result.stdout),expected);
});
