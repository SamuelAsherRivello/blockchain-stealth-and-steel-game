// Read-only projection of protected authorization metadata. Never returns keys,
// phrases, recovery artifacts, raw journals or provider responses.
const {Vault}=await import(new URL('../../../blockchain-integration-service/BIS/scripts/test-wallets/vault.ts',import.meta.url));
const {verifiedInventory}=await import(new URL('../../../blockchain-integration-service/BIS/scripts/test-wallets/inventory.ts',import.meta.url));
try{
  const result=await new Vault().transaction(async state=>{
    await verifiedInventory(state);
    if(process.argv[2]==='--runs')return Object.entries(state.treasureProofRuns??{}).map(([id,run])=>({
      id,network:run.network,scenario:run.scenario,completedAt:run.completedAt??null,
      receipts:run.receipts??[],
      requests:Object.entries(run.recovery??{}).map(([operation,requests])=>({operation,
        kinds:requests.map(request=>request.kind)})),
      operations:(state.operations??[]).filter(row=>row.intent?.id?.startsWith(id+'-'))
        .map(row=>({id:row.intent.id,state:row.state,providerId:row.providerId??null})),
    }));
    return state.accounts.map(account=>({
      label:account.label,
      grant:{active:account.grant?.active===true,networks:account.grant?.networks??[],source:account.grant?.source??'unknown'},
      holds:['signet','mutinynet'].map(network=>({
        network,reportedOnboarding:!!account.reportedPending?.[network],
        unresolvedOperations:(state.operations??[]).filter(row=>row.intent?.network===network&&
          [row.intent?.profileId,row.intent?.target?.profileId].includes(account.profileId)&&
          !['settled','failed','cancelled'].includes(row.state)).map(row=>({id:row.intent.id,state:row.state})),
      })),
    }));
  });
  process.stdout.write(JSON.stringify({ok:true,accounts:result})+'\n');
}catch{
  process.stdout.write(JSON.stringify({ok:false,reason:'protected-test-grants-unavailable'})+'\n');
  process.exitCode=1;
}
