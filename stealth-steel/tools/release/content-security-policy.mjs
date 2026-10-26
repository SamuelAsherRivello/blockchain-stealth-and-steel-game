import {createHash} from 'node:crypto';

// Pinned BIS 0.0.27 test-network providers. Navigation links need no connection,
// script or frame permission. Re-audit these origins on every package import.
const connections=[
  'https://signet.arkade.sh','https://mutinynet.arkade.sh',
  'https://mempool.signet.arkade.sh','https://mempool.mutinynet.arkade.sh',
  'https://emulator.mutinynet.arkade.sh',
  'https://faucet.signet.arkade.sh',
];
const hashes=(html,tag)=>[...new Set([...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}\\s*>`,'gi'))]
  .filter(match=>!/(?:^|\s)src\s*=/i.test(match[1])&&match[2].trim())
  .map(match=>`'sha256-${createHash('sha256').update(match[2]).digest('base64')}'`))];

export function gameSignerOrigin(endpoint){
  if(endpoint===undefined||endpoint==='')return undefined;
  if(typeof endpoint!=='string'||/[;'"<>\\?#\x00-\x20]/.test(endpoint))throw Error('Invalid public BIS signer endpoint.');
  // A same-origin proxy needs no additional CSP authority.
  if(endpoint.startsWith('/')&&!endpoint.startsWith('//'))return undefined;
  let url;try{url=new URL(endpoint);}catch{throw Error('Invalid public BIS signer endpoint.');}
  if(!endpoint.startsWith('https://')||url.protocol!=='https:'||url.username||url.password||url.search||url.hash)
    throw Error('Invalid public BIS signer endpoint.');
  return url.origin;
}

export function protectGameHtml(html,{signerEndpoint}={}){
  if(!/<head\b[^>]*>/i.test(html))throw Error('Game HTML requires a head for CSP.');
  if(/<meta\b[^>]*http-equiv\s*=\s*["']content-security-policy["']/i.test(html))throw Error('Existing game CSP requires explicit reconciliation.');
  const signerOrigin=gameSignerOrigin(signerEndpoint);
  const policy=[
    "default-src 'none'",
    ["script-src 'self'",...hashes(html,'script')].join(' '),
    "script-src-attr 'none'",
    ["style-src 'self'",...hashes(html,'style')].join(' '),
    "style-src-attr 'none'",
    "img-src 'self' data:","font-src 'self'","media-src 'self'",
    "worker-src 'none'","frame-src 'none'","object-src 'none'",
    "base-uri 'self'","form-action 'none'",
    ["connect-src 'self'",...new Set([...connections,...(signerOrigin?[signerOrigin]:[])])].join(' '),
  ].join('; ');
  return html.replace(/<head\b[^>]*>/i,head=>`${head}\n<meta name="game-content-security-policy" http-equiv="Content-Security-Policy" content="${policy}">`);
}

// GitHub Pages cannot supply custom response headers. The build's first head
// element enforces the same static policy without a nonce or hosted middleware.
// Development/HMR is deliberately separate from this production policy.
export function gameContentSecurityPolicy(){
  let signerEndpoint;
  return {name:'game-content-security-policy',apply:'build',
    configResolved(config){signerEndpoint=config.env?.VITE_BIS_SERVER_URL;},
    transformIndexHtml:{order:'post',handler:html=>protectGameHtml(html,{signerEndpoint})}};
}
