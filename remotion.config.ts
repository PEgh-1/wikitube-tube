import { Config } from "@remotion/cli/config";

// Réglages partagés par le Studio et la CLI. Les rendus de production passent par
// scripts/render.mjs (API @remotion/renderer) qui applique les mêmes valeurs.
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(20);
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(Number(process.env.REMOTION_CONCURRENCY ?? 2));
Config.setPublicDir("./public");

// En local (bac à sable), on pointe sur un Chromium Playwright ; sur GitHub Actions
// `npx remotion browser ensure` télécharge le navigateur et cette variable reste vide.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
