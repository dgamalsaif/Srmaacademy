import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(apiDir, "dist", "sync-research-catalog.mjs");

await build({
  entryPoints: [path.join(apiDir, "scripts", "syncResearchCatalogFromCsv.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: outputPath,
  logLevel: "info",
  banner: {
    js: `import { createRequire } from "node:module";
const require = createRequire(import.meta.url);`,
  },
});

const child = spawn(process.execPath, [outputPath, ...process.argv.slice(2)], {
  cwd: apiDir,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));