// Utilitaires partagés par tous les scripts du pipeline.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const DIRS = {
  root: ROOT,
  data: path.join(ROOT, "data"),
  queue: path.join(ROOT, "data", "queue"),
  done: path.join(ROOT, "data", "done"),
  episodes: path.join(ROOT, "data", "episodes"),
  build: path.join(ROOT, "build"),
  out: path.join(ROOT, "out"),
  public: path.join(ROOT, "public"),
  assets: path.join(ROOT, "public", "assets"),
};

export const FPS = 30;

// ---------- .env minimal (pas de dépendance) ----------
export function loadEnv() {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m || line.trim().startsWith("#")) continue;
    if (process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

export function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Variable d'environnement manquante : ${name}`);
  return v;
}

// ---------- CLI args ----------
export function parseArgs(argv = process.argv.slice(2)) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      if (v !== undefined) args[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith("--")) args[k] = argv[++i];
      else args[k] = true;
    } else args._.push(a);
  }
  return args;
}

// ---------- Logs ----------
const t0 = Date.now();
export const log = {
  info: (...m) => console.log(`[${stamp()}]`, ...m),
  warn: (...m) => console.warn(`[${stamp()}] ⚠`, ...m),
  error: (...m) => console.error(`[${stamp()}] ✖`, ...m),
  step: (title) => console.log(`\n[${stamp()}] ━━ ${title} ━━`),
};
function stamp() {
  return `${((Date.now() - t0) / 1000).toFixed(1)}s`;
}

// ---------- FS ----------
export const ensureDir = (d) => (fs.mkdirSync(d, { recursive: true }), d);
export const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
export const writeJson = (f, data) => {
  ensureDir(path.dirname(f));
  fs.writeFileSync(f, JSON.stringify(data, null, 2) + "\n");
};
export const exists = (f) => fs.existsSync(f);

// ---------- Processus ----------
export function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: opts.quiet ? ["ignore", "pipe", "pipe"] : "inherit", ...opts.spawn });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => (stdout += d));
    child.stderr?.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0 || opts.allowFail) resolve({ code, stdout, stderr });
      else reject(new Error(`${cmd} ${args.join(" ")} → code ${code}\n${stderr.slice(-2000)}`));
    });
  });
}

export function runSync(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} → code ${r.status}\n${r.stderr}`);
  return r.stdout;
}

// ---------- ffprobe / ffmpeg ----------
export function ffprobe(file) {
  const out = runSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file]);
  return JSON.parse(out);
}

export function mediaDuration(file) {
  const info = ffprobe(file);
  const d = Number(info.format?.duration);
  if (!Number.isFinite(d)) throw new Error(`Durée illisible : ${file}`);
  return d;
}

/** Mesure l'intégrale de loudness (LUFS) via loudnorm (1re passe). */
export async function measureLoudness(file) {
  const r = await run(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", file, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
    { quiet: true, allowFail: true },
  );
  const m = r.stderr.match(/\{[\s\S]*?\}\s*$/);
  if (!m) return null;
  const j = JSON.parse(m[0]);
  return {
    integrated: Number(j.input_i),
    truePeak: Number(j.input_tp),
    lra: Number(j.input_lra),
    threshold: Number(j.input_thresh),
    raw: j,
  };
}

// ---------- Texte ----------
export const wordCount = (s) => (s || "").trim().split(/\s+/).filter(Boolean).length;
export const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function fmtTime(sec) {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function todayISO(tz = "Europe/Paris") {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
