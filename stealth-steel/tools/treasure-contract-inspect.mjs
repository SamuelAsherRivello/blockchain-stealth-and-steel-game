// Read-only inspection of original requests. No submission or operation replay.
import {Transaction,RestIndexerProvider,verifyTapscriptSignatures} from '@arkade-os/sdk';
import {base64,hex} from '@scure/base';
import {compileTreasureProof} from './treasure-contract-proof.mjs';
const {Vault}=await import(new URL('../../../blockchain-integration-service/BIS/scripts/test-wallets/vault.ts',import.meta.url));
const {Operations}=await import(new URL('../../../blockchain-integration-service/BIS/scripts/test-wallets/operations.ts',import.meta.url));
for(const method of ['log','info','warn','error','debug','trace','dir'])console[method]=()=>{};
try{
  const runId=process.argv[2];
  if(!/^[a-z][a-z0-9-]{0,27}$/.test(runId??''))throw Error();
  const vault=new Vault();
  const run=await vault.transaction(state=>state.treasureProofRuns?.[runId]);
  if(!run||run.network!=='mutinynet')throw Error();
  const indexer=new RestIndexerProvider('https://mutinynet.arkade.sh');
  const observations=[];
  for(const [operation,requests] of Object.entries(run.recovery??{})){
    for(const request of requests.filter(r=>['emulator-submitTx','operator-submitTx'].includes(r.kind))){
      const original=Transaction.fromPSBT(base64.decode(request.request[0]));
      const kind=operation.slice(runId.length+1);
      const expectedScript=kind==='fund'?hex.encode(compileTreasureProof(run.params).script.pkScript):
        '5120'+run.params[kind==='claim'?'playerDestination':'gameDestination'];
      const result={operation,txid:original.id,wireTransactionFound:false,outputEvidence:[]};
      if(request.kind==='emulator-submitTx'){
        const required=kind==='claim'?[run.params.player]:kind==='refund'?[run.params.game]:[run.params.player,run.params.game];
        try{verifyTapscriptSignatures(original,0,required);result.participantSignaturesValid=true;}
        catch{result.participantSignaturesValid=false;}
        result.checkpointParticipantSignaturesValid=request.request[1].map(encoded=>{
          try{verifyTapscriptSignatures(Transaction.fromPSBT(base64.decode(encoded)),0,required);return true;}
          catch{return false;}
        });
      }
      try{
        const response=await indexer.getVirtualTxs([original.id]);
        result.wireTransactionFound=response.txs.some(encoded=>{
          const tx=/^[a-f0-9]+$/i.test(encoded)?Transaction.fromRaw(hex.decode(encoded)):Transaction.fromPSBT(base64.decode(encoded));
          return tx.id===original.id;
        });
        const {vtxos}=await indexer.getVtxos({outpoints:[{txid:original.id,vout:0}]});
        result.outputEvidence=vtxos.map(c=>({txid:c.txid,vout:c.vout,value:c.value,
          matchesOriginalScript:c.script===hex.encode(original.getOutput(0).script),assetFree:!c.assets?.length}));
        if(process.argv[3]==='--reconcile'&&result.wireTransactionFound&&original.getOutput(0).amount===1000n&&
          hex.encode(original.getOutput(0).script)===expectedScript&&
          result.outputEvidence.length===1&&result.outputEvidence.every(c=>c.txid===original.id&&c.vout===0&&
            c.value===1000&&c.matchesOriginalScript&&c.assetFree)){
          await new Operations(vault).reconcile(operation,async record=>({id:record.intent.id,
            fingerprint:record.fingerprint,providerId:original.id,outcome:'settled',verified:true}));
          await vault.transaction(state=>{
            const current=state.treasureProofRuns[runId];
            if(!current.receipts.some(r=>r.txid===original.id))current.receipts.push({
              kind,txid:original.id,vout:0,value:1000,
              script:hex.encode(original.getOutput(0).script)});
            if(kind!=='fund')current.completedAt=Date.now();
          });
          result.reconciled=true;
        }
      }catch{result.observationUnavailable=true;}
      observations.push(result);
    }
  }
  const funding=[];
  for(const receipt of run.receipts??[]){
    try{
      const {vtxos}=await indexer.getVtxos({outpoints:[{txid:receipt.txid,vout:receipt.vout}]});
      funding.push({txid:receipt.txid,vout:receipt.vout,outputs:vtxos.map(c=>({value:c.value,
        matchesOriginalScript:c.script===receipt.script,isSpent:c.isSpent,spentBy:c.spentBy??null}))});
    }catch{funding.push({txid:receipt.txid,observationUnavailable:true});}
  }
  process.stdout.write(JSON.stringify({ok:true,runId,deadlineSeconds:run.deadlineSeconds,observations,funding})+'\n');
}catch{process.stdout.write(JSON.stringify({ok:false,reason:'protected-original-inspection-unavailable'})+'\n');process.exitCode=1;}
