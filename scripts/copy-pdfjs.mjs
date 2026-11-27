import { cp, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = join(root, "node_modules", "pdfjs-dist");
const destination = join(root, "dist", "analisador", "vendor", "pdfjs");

await mkdir(join(destination, "legacy", "build"), { recursive: true });
for (const path of [
  "legacy/build/pdf.mjs",
  "legacy/build/pdf.worker.min.mjs",
  "cmaps",
  "iccs",
  "standard_fonts",
  "wasm",
  "LICENSE",
]) {
  await cp(join(source, path), join(destination, path), { recursive: true });
}
