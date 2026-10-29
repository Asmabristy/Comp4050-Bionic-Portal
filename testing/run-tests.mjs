import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
const suite = process.argv[2];
if (!["backend", "frontend"].includes(suite)) {
  console.error("Usage: node testing/run-tests.mjs backend|frontend");
  process.exit(2);
}
const app = suite === "backend" ? "server" : "web";
const cli = fileURLToPath(new URL(`../${app}/node_modules/vitest/vitest.mjs`, import.meta.url));
if (!existsSync(cli)) {
  console.error(`Vitest is missing from ${app}/node_modules. Install the documented dependencies first.`);
  process.exit(2);
}
mkdirSync(new URL("./node_modules/", import.meta.url), { recursive: true });
const config = fileURLToPath(new URL(`vitest.${suite}.config.mjs`, import.meta.url));
const result = spawnSync(process.execPath, [cli, "run", "--config", config], {
  cwd: fileURLToPath(new URL(`../${app}/`, import.meta.url)),
  stdio: "inherit",
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
