import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = ".output/public";
const candidates = [join(root, "auth/login/index.html"), join(root, "auth/login.html")];
const source = candidates.find((path) => existsSync(path));
if (!source) {
  console.error("spa fallback: auth login shell was not generated");
  process.exit(1);
}
const target = join(root, "404.html");
copyFileSync(source, target);
console.log(`spa fallback: wrote 404.html from ${source}`);
