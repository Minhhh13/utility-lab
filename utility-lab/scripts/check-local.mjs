import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const startedAt = new Date().toISOString();
const checks = [
  ["Audited map catalogue", ["--experimental-strip-types", "scripts/build-expanded-catalogue.mjs"]],
  ["Standing-location catalogue", ["--experimental-strip-types", "scripts/build-origin-catalogue.mjs"]],
  ["TypeScript", ["node_modules/typescript/bin/tsc", "--noEmit"]],
  ["Production build", ["node_modules/vite/bin/vite.js", "build"]],
  [
    "Content and model checks",
    ["--experimental-strip-types", "--test", "tests/*.test.ts"],
  ],
  ["Edge browser checks", ["node_modules/@playwright/test/cli.js", "test"]],
  [
    "WebKit phone and map-focus checks",
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      "--config",
      "playwright.webkit.config.ts",
    ],
  ],
];
const report = { startedAt, finishedAt: null, passed: false, checks: [] };
const output = join(root, "outputs", "checks");
await mkdir(output, { recursive: true });

for (const [name, args] of checks) {
  const start = Date.now();
  console.log(`\n${name}\n`);
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: root,
      stdio: "inherit",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  }).catch((error) => {
    console.error(error.message);
    return 1;
  });
  report.checks.push({
    name,
    exitCode,
    seconds: Number(((Date.now() - start) / 1000).toFixed(2)),
  });
  await writeFile(join(output, "latest.json"), JSON.stringify(report, null, 2));
  if (exitCode !== 0) break;
}
report.finishedAt = new Date().toISOString();
report.passed =
  report.checks.length === checks.length &&
  report.checks.every((check) => check.exitCode === 0);
await writeFile(join(output, "latest.json"), JSON.stringify(report, null, 2));
console.log(
  `\n${report.passed ? "All local checks passed." : "A local check failed; see outputs/checks/latest.json."}`,
);
process.exitCode = report.passed ? 0 : 1;
