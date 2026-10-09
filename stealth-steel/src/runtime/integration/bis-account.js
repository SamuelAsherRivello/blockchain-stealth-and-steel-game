import { bindToGameFrame } from "../ui/game-frame-bounds.js";

// The game consumes only the public BIS package. Loading is independent of game startup.
const loadPackage = () => Promise.all([import('@bis/integration'), import('@bis/integration/style.css')]).then(([api]) => api);

export function createBisAccount({host, pauseController, restartGame, documentRef = globalThis.document,
  load = loadPackage, timeoutMs = 15000, onClose = () => {}, getBisGame = () => undefined,
  frameElement = null}) {
  const overlay = documentRef.createElement('div');
  overlay.className = 'game-account-host'; overlay.hidden = true; overlay.tabIndex = -1;
  const status = documentRef.createElement('section'); status.className = 'game-account-status';
  status.setAttribute('role', 'dialog'); status.setAttribute('aria-label', 'Account loading');
  const message = documentRef.createElement('p'); message.setAttribute('role', 'status');
  const back = documentRef.createElement('button'); back.type = 'button'; back.textContent = 'Back to Settings';
  status.append(message, back);
  const mount = documentRef.createElement('div'); mount.className = 'game-account-mount';
  overlay.append(status, mount);
  const overlayParent = () => documentRef.fullscreenElement ?? documentRef.body ?? host;
  overlayParent().append(overlay);
  const disposeFrameBounds = bindToGameFrame({overlay, frameElement, windowRef: globalThis.window});
  let disposed = false, active = false, visit = 0, restarting = false, initialization;
  /** @type {import('@bis/integration').IBis | undefined} */
  let bis;
  /** @type {Set<(snapshot: import('@bis/integration').BisSnapshot) => void>} */
  const listeners = new Set();
  function passive() {
    overlay.className = 'game-account-host game-account-passive';
    overlay.hidden = false; status.hidden = true; mount.hidden = false;
  }
  const restarts = new Set(); const inertBefore = new Map();
  const focusables = () => /** @type {HTMLElement[]} */ ([...overlay.querySelectorAll('button:not(:disabled), input:not(:disabled), [tabindex="0"]')]).filter(el => !el.closest('[hidden]') && el.getClientRects().length);
  const focusInside = () => (focusables()[0] ?? overlay).focus();
  const keepFocus = event => { if (active && !overlay.contains(event.target)) focusInside(); };
  const keydown = event => {
    if (event.key === 'Tab') {
      const items = focusables(), index = items.indexOf(/** @type {HTMLElement} */ (documentRef.activeElement));
      if (!items.length || index < 0 || (!event.shiftKey && index === items.length - 1) || (event.shiftKey && index === 0)) {
        event.preventDefault(); (event.shiftKey ? items.at(-1) : items[0])?.focus();
      }
    }
    // BIS owns Escape and its operation guards. Never turn it into a host close.
    event.stopPropagation();
  };
  const stop = event => event.stopPropagation();
  overlay.addEventListener('keydown', keydown);
  for (const type of ['keyup','pointerdown','pointerup','click','touchstart','touchend']) overlay.addEventListener(type, stop);
  function restoreInteraction() {
    for (const [element, value] of inertBefore) element.inert = value;
    inertBefore.clear();
  }
  function blockInteraction() {
    // Walk to the document root so canvas, controls and Settings are all inactive.
    for (let branch = /** @type {HTMLElement | null} */ (overlay); branch; branch = branch.parentElement) {
      const parent = branch.parentElement ?? (branch === overlay ? host : null);
      for (const child of parent?.children ?? []) if (child !== branch) {
        inertBefore.set(child, child.inert); child.inert = true;
      }
    }
  }
  function moveOverlay() {
    restoreInteraction(); overlayParent().append(overlay);
    if (active) { blockInteraction(); focusInside(); }
  }
  documentRef.addEventListener('fullscreenchange', moveOverlay);
  function close() {
    if (!active || restarting) return;
    active = false; visit++; passive();
    documentRef.removeEventListener('focusin', keepFocus, true);
    restoreInteraction();
    onClose();
    pauseController.resume('bis-account');
  }
  back.addEventListener('click', close);
  /** Called only by the game-owned IBisGame.onBisEvent implementation. */
  function onBisEvent(event) {
    if (disposed) return;
    if (event.type === 'stateChanged') {
      for (const listener of listeners) { try { listener(event.snapshot); } catch { /* Isolate game views. */ } }
    } else if (event.type === 'accountClosed') {
      // Logout's stable restart event can follow in the same turn.
      queueMicrotask(() => { if (!disposed && !restarting) close(); });
    } else if (event.type === 'restartRequested' && !restarts.has(event.logoutId)) {
      restarts.add(event.logoutId); restarting = true;
      pauseController.pause('bis-account');
      try { restartGame(); }
      catch { status.hidden = false; mount.hidden = true; message.textContent = 'Account logged out. Reload the game to continue.'; back.hidden = true; }
    }
  }
  function initialize() {
    if (initialization) return initialization;
    initialization = (async () => {
      const api = await load(); if (disposed) return;
      if (!api.BisService) throw Error('BIS contract is unavailable.');
      const current = new api.BisService({getBisGame});
      bis = current;
      await current.ready(); if (disposed) return;
      current.mount(mount);
      if (!active) passive();
      return current;
    })().catch(error => { bis?.dispose(); bis = undefined; initialization = undefined; throw error; });
    return initialization;
  }
  async function open() {
    if (disposed || active || restarting) return;
    active = true; const currentVisit = ++visit;
    overlay.className = 'game-account-host';
    pauseController.pause('bis-account');
    blockInteraction();
    overlay.hidden = false; status.hidden = true; mount.hidden = true; message.textContent = '';
    documentRef.addEventListener('focusin', keepFocus, true); overlay.focus();
    let timer;
    try {
      const current = await Promise.race([initialize(), new Promise((_, reject) => { timer = setTimeout(() => reject(Error('timeout')), timeoutMs); })]);
      if (disposed || !active || visit !== currentVisit || !current) return;
      current.openAccountDialog(); status.hidden = true; mount.hidden = false;
      queueMicrotask(() => { if (active && visit === currentVisit) focusInside(); });
    } catch { if (!disposed && active && visit === currentVisit) { status.hidden = false; message.textContent = 'Account is unavailable. Return to Settings and try again.'; back.focus(); } }
    finally { clearTimeout(timer); }
  }
  return {open, onBisEvent, getBis:()=>bis, getSnapshot:()=>bis?.getSnapshot(),
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getPlayerProfileId:()=>bis?.getSnapshot().account.playerWallet?.profileId,
    hasItemSupport:()=>bis?.hasItemSupport() ?? false,
    hasAssetMintingSupport:()=>bis?.hasAssetMintingSupport() ?? false,
    hasContractSupport:()=>bis?.hasContractSupport() ?? false,
    async ready() {
      let timer;
      try { return await Promise.race([initialize(), new Promise((_, reject) => { timer=setTimeout(()=>reject(Error('BIS unavailable')),timeoutMs); })]); }
      finally { clearTimeout(timer); }
    }, get isOpen() { return active; }, dispose({preserveContracts=false}={}) {
    if (disposed) return; disposed = true; restarting = false; close();
    listeners.clear();
    documentRef.removeEventListener('fullscreenchange', moveOverlay);
    bis?.dispose({preserveContracts}); bis = undefined; disposeFrameBounds(); overlay.remove();
  }};
}

