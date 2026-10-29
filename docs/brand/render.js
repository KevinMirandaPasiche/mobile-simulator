// node render.js          → ../hero.png (2560×1280), ../social-preview.png (1280×640) and ../store/promo-440x280.png
// node render.js devices  → devices/*.png, captured with the extension's own screenshot button on site/index.html
// node render.js icons    → icons/*.png at the extension root, from icon/*.svg (written by icon/gen.py)
// node render.js store    → ../store/screenshot-*.png, the Chrome Web Store screenshots
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

// [html file, width, height, [[output, device pixel ratio], ...]]
const ART = [
  ['hero.html', 1280, 640, [['../hero.png', 2], ['../social-preview.png', 1]]],
  ['promo.html', 440, 280, [['../store/promo-440x280.png', 1]]],
];

async function hero() {
  const browser = await puppeteer.launch({ args: ARGS });
  const page = await browser.newPage();
  for (const [file, width, height, outputs] of ART) {
    await page.setViewport({ width, height });
    await page.goto('file://' + path.join(__dirname, file), { waitUntil: 'networkidle0' });
    for (const [out, deviceScaleFactor] of outputs) {
      await page.setViewport({ width, height, deviceScaleFactor });
      await page.screenshot({ path: path.join(__dirname, out) });
    }
  }
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

// Toolbar buttons by offset from the left of the centered 860px toolbar. The UI is in a closed shadow root, so it's
// driven by position.
const BUTTON = { device: 135, capture: 797, settings: 835 };
const press = (page, button) => page.mouse.click((1280 - 860) / 2 + BUTTON[button], 37);

// Serves site/index.html as http://horizon.example/ and runs fn(page) with the simulator open on it.
async function withSimulator(prefs, fn, downloads) {
  const browser = await puppeteer.launch({
    pipe: true, enableExtensions: [EXT],
    // .example is reserved for documentation; HTTPS upgrades would loop on a plain-http local server.
    args: [...ARGS, '--host-resolver-rules=MAP horizon.example 127.0.0.1:8765', '--disable-features=HttpsUpgrades'],
    env: { ...process.env, LANGUAGE: 'en_US' }, // the extension's UI language comes from LANGUAGE on Linux
    defaultViewport: { width: 1280, height: 800 }, downloadBehavior: downloads && { policy: 'allow', downloadPath: downloads },
  });
  const sw = await (await browser.waitForTarget((t) => t.type() === 'service_worker')).worker();
  await sw.evaluate((p) => chrome.storage.local.set(p), { zoom: 0, landscape: false, ...prefs });
  const page = (await browser.pages())[0];
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await page.goto('http://horizon.example/', { waitUntil: 'networkidle0' });
  await sw.evaluate(async () => {
    const [tab] = await chrome.tabs.query({ active: true });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['ui-template.js', 'sim.js'] });
  });
  await wait(2500);
  await fn(page);
  await browser.close();
}

function serve(fn) {
  const site = fs.readFileSync(path.join(__dirname, 'site/index.html'));
  const server = http.createServer((_, res) => res.end(site)).listen(8765);
  return fn().finally(() => server.close());
}

const devices = () => serve(async () => {
  const downloads = fs.mkdtempSync(path.join(os.tmpdir(), 'hero-'));
  for (const [index, name] of Object.entries(DEVICES)) {
    await withSimulator({ device: +index, settings: { theme: 'light' } }, async (page) => {
      const before = new Set(fs.readdirSync(downloads));
      await press(page, 'capture');
      let file;
      for (let i = 0; i < 120 && !file; i++) {
        await wait(500);
        file = fs.readdirSync(downloads).find((f) => !before.has(f) && f.endsWith('.png'));
      }
      if (!file) throw new Error(`no capture for ${name}`);
      fs.copyFileSync(path.join(downloads, file), path.join(__dirname, 'devices', name + '.png'));
      console.log(name, '←', file);
    }, downloads);
  }
});

// Chrome Web Store screenshots: 1280×800, at most 5.
const SCREENSHOTS = [
  ['1-iphone', { device: 4 }],
  ['2-android-dark', { device: 7, settings: { theme: 'dark' } }],
  ['3-ipad-landscape', { device: 10, landscape: true }],
  ['4-devices', { device: 8 }, 'device'],
  ['5-settings', { device: 2 }, 'settings'],
];

const store = () => serve(async () => {
  for (const [name, prefs, open] of SCREENSHOTS) {
    await withSimulator({ settings: { theme: 'light' }, ...prefs }, async (page) => {
      if (open) { await press(page, open); await wait(700); }
      await page.screenshot({ path: path.join(__dirname, `../store/screenshot-${name}.png`) });
      console.log(name);
    });
  }
});

({ devices, icons, store }[process.argv[2]] ?? hero)().catch((e) => { console.error(e); process.exit(1); });
