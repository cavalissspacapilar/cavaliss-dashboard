import puppeteer from "puppeteer";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const [,, version = "v1"] = process.argv;
const htmlFile = version === "v3"
  ? "ad-cancun-cuero-cabelludo-v3.html"
  : version === "v2"
  ? "ad-cancun-cuero-cabelludo-v2.html"
  : "ad-cancun-cuero-cabelludo.html";
const outFile  = version === "v3"
  ? "C:\\mnt\\user-data\\outputs\\protocolo_cancun_reel_v3.png"
  : version === "v2"
  ? "C:\\mnt\\user-data\\outputs\\protocolo_cancun_reel_v2.png"
  : "C:\\mnt\\user-data\\outputs\\protocolo_cancun_reel_v1.png";

const htmlPath = resolve(__dirname, "../public", htmlFile);

console.log(`Capturing ${htmlFile} → ${outFile}`);

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 2100, deviceScaleFactor: 1 });
await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle0" });

// Wait for the reference image to finish loading
await page.waitForFunction(() => {
  const imgs = [...document.querySelectorAll("img")];
  return imgs.length > 0 && imgs.every(img => img.complete && img.naturalWidth > 0);
}, { timeout: 15000 }).catch(() => console.warn("Image load timeout — continuing"));

// Settle time for layout paint
await new Promise(r => setTimeout(r, 700));

const adEl = await page.$(".ad");
if (!adEl) throw new Error("Cannot find .ad element");

await adEl.screenshot({ path: outFile, type: "png" });
await browser.close();

console.log(`Saved → ${outFile}`);
