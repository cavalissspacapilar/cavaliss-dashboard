import puppeteer from "puppeteer";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const [,, version = "v4"] = process.argv;
const htmlPath  = resolve(__dirname, `../public/ad-cancun-cuero-cabelludo-${version}.html`);
const outPath   = `C:\\mnt\\user-data\\outputs\\protocolo_cancun_reel_${version}.jpg`;

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
const page    = await browser.newPage();
await page.setViewport({ width: 1200, height: 2100, deviceScaleFactor: 1 });
await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle0" });

await page.waitForFunction(() => {
  const imgs = [...document.querySelectorAll("img")];
  return imgs.length > 0 && imgs.every(i => i.complete && i.naturalWidth > 0);
}, { timeout: 15000 }).catch(() => {});

await new Promise(r => setTimeout(r, 800));

const el = await page.$(".ad");
await el.screenshot({ path: outPath, type: "jpeg", quality: 88 });
await browser.close();

console.log("Saved → " + outPath);
