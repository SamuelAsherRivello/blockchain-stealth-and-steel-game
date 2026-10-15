import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire, registerHooks } from "node:module";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Pin the reviewed CLI; adapt only this invocation, never the installed package.
// This repository extends change metadata with a validated permanent C### ID.
const require = createRequire(import.meta.url);
const candidates = [];
if (process.env.OPENSPEC_CLI) candidates.push(resolve(process.env.OPENSPEC_CLI));
try { candidates.push(require.resolve("@fission-ai/openspec/bin/openspec.js")); } catch {}
for (const entry of (process.env.PATH ?? "").split(delimiter).filter(Boolean)) {
  candidates.push(join(entry, "node_modules/@fission-ai/openspec/bin/openspec.js"));
  candidates.push(join(entry, "../lib/node_modules/@fission-ai/openspec/bin/openspec.js"));
}
const cli = candidates.find(existsSync);
if (!cli) throw new Error("Install OpenSpec 1.14.0, or set OPENSPEC_CLI to its bin/openspec.js path.");
const packageRoot = resolve(dirname(cli), "..");
const { version } = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
if (version !== "1.14.0") throw new Error(`Unsupported OpenSpec ${version}; review the openspec adapter before upgrading.`);
const changes = join(import.meta.dirname, 'changes');
const identities = new Map();
for (const entry of readdirSync(changes, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === 'archive') continue;
  const metadata = join(changes, entry.name, '.openspec.yaml');
  if (!existsSync(metadata)) continue;
  const id = readFileSync(metadata, 'utf8').match(/^id:\s*(C\d{3})\s*$/m)?.[1];
  if (id) identities.set(id, [...(identities.get(id) ?? []), entry.name]);
}
process.argv = process.argv.map((arg, i) => {
  if (i < 2 || !/^C\d{3}$/.test(arg)) return arg;
  const names = identities.get(arg);
  if (!names) throw Error(`Unknown active canonical change ID: ${arg}`);
  if (names.length !== 1) throw Error(`Ambiguous canonical change ID ${arg}: ${names.join(', ')}`);
  return names[0];
});
const distUrl = pathToFileURL(join(packageRoot, "dist") + "/").href;
registerHooks({
  load(url, context, nextLoad) {
    const result = nextLoad(url, context);
    if (!url.startsWith(distUrl) || !url.endsWith(".js") || result.format !== "module") return result;
    const source = typeof result.source === "string" ? result.source : Buffer.from(result.source).toString("utf8");
    let adapted = source;
    if (url.endsWith('/core/change-metadata/schema.js')) {
      const keys = "    'retire_capabilities',";
      const schema = 'export const ChangeMetadataSchema = z.object({';
      if (!source.includes(keys) || !source.includes(schema)) throw Error('Unsupported change metadata schema; review the adapter.');
      adapted = source.replace(keys, keys + "\n    'id',")
        .replace(schema, schema + "\n    id: z.string().regex(/^C\\d{3}$/, { message: 'id must be C###' }).optional(),");
    }
    return { ...result, source: adapted
      .replace(/\bopenspec (?=(?:archive|config|context|doctor|feedback|instructions|list|new|schemas|show|status|store|update|validate|view)\b)/g, "npm run openspec -- ") };
  },
});
process.env.OPENSPEC_TELEMETRY = "0";
process.argv[1] = fileURLToPath(pathToFileURL(cli));
await import(pathToFileURL(cli).href);
