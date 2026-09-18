/**
 * Records the deck as two video segments, held on each slide for exactly as
 * long as SCRIPT.md gives that slide.
 *
 *   node deck/record-deck.mjs
 *
 * Output: deck/out/deck-intro.mp4  (slides 1-6, before the demo)
 *         deck/out/deck-outro.mp4  (slides 7-9, after it)
 */
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const OUT = new URL("out/", import.meta.url).pathname;
const DECK = new URL("index.html", import.meta.url).href;
const W = 1600, H = 900;

/** Seconds per slide, taken from the timings in SCRIPT.md. */
const INTRO = [
  { slide: 1, hold: 12 },
  { slide: 2, hold: 50 },
  { slide: 3, hold: 33 },
  { slide: 4, hold: 37 },
  { slide: 5, hold: 43 },
  { slide: 6, hold: 7 },
];
const OUTRO = [
  { slide: 7, hold: 45 },
  { slide: 8, hold: 35 },
  { slide: 9, hold: 23 },   // 20s of narration plus a 3s hold before you cut
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function segment(name, beats) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: OUT, size: { width: W, height: H } },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(DECK);
  await page.evaluate(() => document.fonts.ready);
  // Hide the progress bar and slide counter — presenter chrome, not video.
  await page.keyboard.press("h");
  await wait(600);

  for (const { slide, hold } of beats) {
    await page.keyboard.press(String(slide));
    console.log(`  slide ${slide} · ${hold}s`);
    await wait(hold * 1000);
  }

  await context.close();
  await browser.close();

  const webm = readdirSync(OUT).find((f) => f.endsWith(".webm") && !f.startsWith("deck-") && !f.startsWith("demo"));
  if (!webm) throw new Error("no video produced for " + name);
  const src = join(OUT, `${name}.webm`);
  renameSync(join(OUT, webm), src);

  try {
    execFileSync("ffmpeg", [
      "-y", "-i", src,
      "-c:v", "libx264", "-preset", "slow", "-crf", "20",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart",
      join(OUT, `${name}.mp4`),
    ], { stdio: "ignore" });
    console.log(`  → deck/out/${name}.mp4`);
  } catch {
    console.log(`  → deck/out/${name}.webm (ffmpeg missing)`);
  }
}

mkdirSync(OUT, { recursive: true });
console.log("intro (slides 1-6)");
await segment("deck-intro", INTRO);
console.log("outro (slides 7-9)");
await segment("deck-outro", OUTRO);
console.log("\ndone");
