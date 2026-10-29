// node render.js          → ../hero.png (2560×1280) and ../social-preview.png (1280×640) from hero.html
// node render.js devices  → devices/*.png, captured with the extension's own screenshot button on site/index.html
// node render.js icons    → icons/*.png at the extension root, from icon/*.svg (written by icon/gen.py)
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const EXT = path.resolve(__dirname, '../..');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// Index in sim.js DEVICES → output file.
const DEVICES = { 4: 'iphone', 7: 'pixel', 10: 'ipad' };
// Chrome for Testing has no AppArmor profile on Ubuntu 23.10+, so its sandbox can't start there.
const ARGS = ['--no-sandbox'];

async function hero() {
  const browser = await puppeteer.launch({ args: ARGS });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 640, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(__dirname, 'hero.html'), { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(__dirname, '../hero.png') });
  await page.setViewport({ width: 1280, height: 640, deviceScaleFactor: 1 });
  await page.screenshot({ path: path.join(__dirname, '../social-preview.png') });
  await browser.close();
}

async function icons() {
  const browser = await puppeteer.launch({ args: ARGS });
  const page = await browser.newPage();
  for (const size of [16, 32, 48, 128]) {
    await page.setViewport({ width: size, height: size });
    await page.setContent('<style>body{margin:0}svg{display:block}</style>' + fs.readFileSync(path.join(__dirname, `icon/${size}.svg`)));
    await page.screenshot({ path: path.join(EXT, `icons/${size}.png`), omitBackground: true });
  }
  await browser.close();
}

async function devices() {
  const site = fs.readFileSync(path.join(__dirname, 'site/index.html'));
  const server = http.createServer((_, res) => res.end(site)).listen(8765);
  const downloads = fs.mkdtempSync(path.join(os.tmpdir(), 'hero-'));
  for (const [index, name] of Object.entries(DEVICES)) {
    const browser = await puppeteer.launch({
      pipe: true, enableExtensions: [EXT],
      // .example is reserved for documentation; HTTPS upgrades would loop on a plain-http local server.
      args: [...ARGS, '--host-resolver-rules=MAP horizon.example 127.0.0.1:8765', '--disable-features=HttpsUpgrades'],
      env: { ...process.env, LANGUAGE: 'en_US' }, // the extension's UI language comes from LANGUAGE on Linux
      defaultViewport: { width: 1280, height: 800 }, downloadBehavior: { policy: 'allow', downloadPath: downloads },
    });
    const sw = await (await browser.waitForTarget((t) => t.type() === 'service_worker')).worker();
    await sw.evaluate((d) => chrome.storage.local.set({ device: d, zoom: 0, landscape: false, settings: { theme: 'light' } }), +index);
    const page = (await browser.pages())[0];
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await page.goto('http://horizon.example/', { waitUntil: 'networkidle0' });
    await sw.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true });
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['ui-template.js', 'sim.js'] });
    });
    await wait(2500);
    const before = new Set(fs.readdirSync(downloads));
    // The capture button's offset in the centered 860px toolbar; the UI is in a closed shadow root, so it's clicked by position.
    await page.mouse.click((1280 - 860) / 2 + 797, 37);
    let file;
    for (let i = 0; i < 120 && !file; i++) {
      await wait(500);
      file = fs.readdirSync(downloads).find((f) => !before.has(f) && f.endsWith('.png'));
    }
    if (!file) throw new Error(`no capture for ${name}`);
    fs.copyFileSync(path.join(downloads, file), path.join(__dirname, 'devices', name + '.png'));
    console.log(name, '←', file);
    await browser.close();
  }
  server.close();
}

({ devices, icons }[process.argv[2]] ?? hero)().catch((e) => { console.error(e); process.exit(1); });
