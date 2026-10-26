import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { coordinateProject, identityMiddleware } from './project-run-coordination.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const { values } = parseArgs({ options: {
  port: { type: 'string', default: '5176' }, host: { type: 'string', default: '127.0.0.1' },
  strictPort: { type: 'boolean' }, isolated: { type: 'boolean' }, 'no-hmr': { type: 'boolean' },
} });
const result = await coordinateProject({
  root, port: Number(values.port), canonicalPort: 5176, isolated: values.isolated === true,
  routes: [{ label: 'BIS Stealth & Steel', route: '/blockchain-stealth-and-steel-game/' }],
  start: async identity => {
    const candidate = await createServer({ root: fileURLToPath(new URL('../../', import.meta.url)), configFile: fileURLToPath(new URL('../../../vite.config.js', import.meta.url)),
      plugins: [{ name: 'project-run-identity', configureServer(server) { server.middlewares.use(identityMiddleware(identity)); } }],
      server: { host: values.host, port: Number(values.port), strictPort: true, ...(values['no-hmr'] ? { hmr: false } : {}) } });
    try { await candidate.listen(); return candidate; }
    catch (error) { await candidate.close(); throw error; }
  },
});
if (result.reused) process.exit(0);
console.log('Stealth & Steel: http://127.0.0.1:' + result.port + '/blockchain-stealth-and-steel-game/');
let stopping = false;
async function stop() { if (stopping) return; stopping = true; await result.server.close(); process.exit(0); }
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
