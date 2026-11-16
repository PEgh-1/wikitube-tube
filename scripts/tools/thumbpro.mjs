#!/usr/bin/env node
// Miniatures « clic » : node scripts/tools/thumbpro.mjs [--out publish/thumbs]
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { DIRS, parseArgs, readJson } from "../lib/common.mjs";
const args = parseArgs();
const specs = readJson(path.join(DIRS.root, "publish", "thumbs.json"));
const out = path.resolve(String(args.out ?? path.join(DIRS.root, "publish", "thumbs")));
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(DIRS.root, "src", "index.ts"), publicDir: DIRS.public, outDir: path.join(DIRS.build, ".bundle") });
const common = { serveUrl, browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE || null, chromiumOptions: { gl: "angle" }, logLevel: "error" };
for (const [id, inputProps] of Object.entries(specs)) {
  if (args.only && !id.includes(String(args.only))) continue;
  const composition = await selectComposition({ ...common, id: "ThumbPro", inputProps });
  await renderStill({ ...common, composition, inputProps, output: path.join(out, `${id}.jpg`), imageFormat: "jpeg", jpegQuality: 92 });
  console.log("✔", id);
}
