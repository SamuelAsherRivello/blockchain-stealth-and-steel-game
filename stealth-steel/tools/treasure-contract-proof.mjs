// Isolated C094 feasibility artifact. Never wired to game funding or signing.
import {arkade} from '@arkade-os/sdk';
import {hex} from '@scure/base';

export function treasureDeadlineSeconds(startedAtMs) {
  if(!Number.isSafeInteger(startedAtMs)||startedAtMs<0||
    startedAtMs>Number.MAX_SAFE_INTEGER-90000)throw Error('Invalid offer start');
  return Math.floor(startedAtMs/1000)+90;
}

export function compileTreasureProof(p) {
  const deadline=treasureDeadlineSeconds(p.startedAtMs);
  for(const key of ['player','game','operator','emulator','playerDestination','gameDestination'])
    if(!/^[a-f0-9]{64}$/.test(p[key]))throw Error('Invalid public proof key');
  if(deadline<500000000||(p.deadline!==undefined&&p.deadline!==deadline)||
    !Number.isSafeInteger(p.exitDelay)||p.exitDelay<512||p.exitDelay%512)throw Error('Invalid proof timing');
  if(!['signet','mutinynet'].includes(p.network))throw Error('Invalid proof network');
  const spend=(destination,signers,expired)=>({
    inputs:[],tapscript:{signers},
    arkadeScript:{asm:[
      '$scope','DROP',
      '$deadline','CHECKTIME',...(expired?[]:['NOT']),'VERIFY',
      'INSPECTNUMINPUTS',1,'EQUALVERIFY',
      0,'INSPECTINPUTVALUE',1000,'EQUALVERIFY',
      'INSPECTNUMOUTPUTS',3,'EQUALVERIFY',
      0,'INSPECTPACKET','NOT','VERIFY','DROP',
      0,'INSPECTOUTPUTSCRIPTPUBKEY',1,'EQUALVERIFY',destination,'EQUALVERIFY',
      0,'INSPECTOUTPUTVALUE',1000,'EQUALVERIFY',
      1,'INSPECTOUTPUTVALUE',0,'EQUALVERIFY',
      2,'INSPECTOUTPUTSCRIPTPUBKEY',1,'EQUALVERIFY',new Uint8Array([0x4e,0x73]),'EQUALVERIFY',
      2,'INSPECTOUTPUTVALUE',0,'EQUAL',
    ],witness:[]},
  });
  const program={version:0,name:'BISTreasureFeasibilityV1',params:[
    {name:'scope',type:'bytes'},{name:'deadline',type:'int'},{name:'exitDelay',type:'int'},
    ...['player','game','operator'].map(name=>({name,type:'pubkey'})),
    ...['playerDestination','gameDestination'].map(name=>({name,type:'bytes'})),
  ],functions:{
    claim:spend('$playerDestination',['$operator','$player'],false),
    reject:spend('$gameDestination',['$operator','$player','$game'],false),
    cancel:spend('$gameDestination',['$operator','$player','$game'],false),
    refund:spend('$gameDestination',['$operator','$game'],true),
    // No player exit bypass. Recovery is game-owned after the operator CSV delay.
    exit:{tapscript:{signers:['$game'],csv:{type:'seconds',value:'$exitDelay'}}},
  }};
  const args={scope:new TextEncoder().encode('bis:treasure:proof:v1:'+p.network+':'+p.startedAtMs),
    deadline:BigInt(deadline),exitDelay:BigInt(p.exitDelay)};
  for(const name of ['player','game','operator','playerDestination','gameDestination'])args[name]=hex.decode(p[name]);
  const script=new arkade.ArkadeProgramScript(program,args,{
    serverKey:args.operator,userKey:args.player,emulatorKey:hex.decode(p.emulator),
  });
  return {program,args,script,functions:script.compiled.map(fn=>({
    name:fn.name,tapscript:hex.encode(fn.leafScript),
    covenant:fn.arkadeScript?hex.encode(fn.arkadeScript):undefined,
  }))};
}
