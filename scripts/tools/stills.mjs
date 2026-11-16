#!/usr/bin/env node
// Images de contrôle d'une timeline déjà calculée (build/<id>/timeline-pilot.json ou timeline-long.json).
//   node scripts/tools/stills.mjs --timeline build/<id>/timeline-pilot.json --at 9.6,14.4 --out /tmp/stills
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { DIRS, parseArgs, readJson } from "../lib/common.mjs";
const args = parseArgs();
const timeline = readJson(path.resolve(String(args.timeline)));
const out = path.resolve(String(args.out ?? "/tmp/stills"));
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(DIRS.root, "src", "index.ts"), publicDir: DIRS.public, outDir: path.join(DIRS.build, ".bundle") });
const common = { serveUrl, browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE || null, chromiumOptions: { gl: "angle" }, logLevel: "error" };
const inputProps = { timeline, options: { burnSubtitles: false, audio: false } };
const composition = await selectComposition({ ...common, id: "Long", inputProps });
for (const t of String(args.at).split(",")) {
  const frame = Math.min(timeline.durationInFrames - 1, Math.round(Number(t) * timeline.fps));
  await renderStill({ ...common, composition, inputProps, frame, output: path.join(out, `t${String(t).replace(".", "_")}.jpg`), imageFormat: "jpeg", jpegQuality: 80 });
}
console.log("ok", out);
