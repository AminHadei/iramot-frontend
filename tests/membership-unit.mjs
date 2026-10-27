import { execSync } from "node:child_process";
import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function esbuildBin() {
  const root = "node_modules/.pnpm";
  const entry = readdirSync(root).find((name) => name.startsWith("esbuild@"));
  if (!entry) throw new Error("esbuild is not installed");
  return join(root, entry, "node_modules/esbuild/bin/esbuild");
}

const dir = mkdtempSync(join(tmpdir(), "membership-unit-"));
const out = join(dir, "membership-unit.mjs");
execSync(
  `"${esbuildBin()}" tests/membership-unit.ts --bundle --format=esm --platform=node --alias:~=./app --outfile=${out}`,
  { stdio: "inherit" },
);
execSync(`node ${out}`, { stdio: "inherit" });
