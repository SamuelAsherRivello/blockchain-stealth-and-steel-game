/** Game-owned loss lifecycle. BIS owns price, payment, toast and result delivery. */
/** @param {{accountHost: ReturnType<typeof import('./bis-account.js').createBisAccount>, ui: any, restart: () => void}} options */
export function createPayToContinue({ accountHost, ui, restart }) {
  let generation = 0, disposed = false, workflowId, state, unsubscribe;
  /** @type {import('@bis/integration').IBis} */
  let bis;
  /** @param {import('@bis/integration').BisSnapshot} snapshot */
  function update(snapshot) {
    if(disposed || !workflowId)return;
    const next=snapshot.continuations.find(value=>value.workflowId===workflowId);
    if(!next)return;
    state=next;
    if(next.effectReceipt?.status==='applied'){generation++;ui.hide();clear();}
    else ui.setState({...next,paymentSupported:bis.hasPaymentSupport?.() ?? true});
  }
  const clear = () => { unsubscribe?.(); unsubscribe = undefined; const id=workflowId; workflowId=undefined; if(id)bis?.endContinuation(id); };
  return {
    async show() {
      if (disposed) return;
      const current = ++generation; clear();
      ui.setState({sats:null,canPay:false,status:'idle',paymentSupported:false,message:'Loading payment service…'}); ui.show();
      try {
        const next = await accountHost.readyAsync();
        if (disposed || current !== generation || !next) return;
        bis=next;
        state=bis.beginContinuation();workflowId=state.workflowId;
        unsubscribe=accountHost.subscribe(update);
        ui.setState({...state,paymentSupported:bis.hasPaymentSupport?.() ?? true});update(bis.getSnapshot());
      } catch {
        if (!disposed && current === generation) ui.setState({sats:null,canPay:false,status:'failed',paymentSupported:false,message:'Payment service is unavailable. You can restart for free.'});
      }
    },
    pay() { return workflowId ? bis.payContinuationAsync(workflowId) : undefined; },
    check() { return workflowId ? bis.checkContinuationAsync(workflowId) : undefined; },
    restart() {
      if (disposed || state?.status === 'pending') return;
      generation++; clear(); restart();
    },
    dispose() { disposed = true; generation++; clear(); },
  };
}
