// Wrapped in a function so a second injection can close the open simulator instead of redeclaring its names.
(async () => {
if (globalThis.__simMovil) return globalThis.__simMovil.close();
const t = (k) => chrome.i18n.getMessage(k);
// background.js can inject this before the page has a body.
if (!document.body) await new Promise((r) => addEventListener('DOMContentLoaded', r, { once: true }));

// Safari froze the UA's iOS version at 18_6 from iOS 26 on; only Version/ moves. Chrome on Android sends the reduced
// UA ("Android 10; K") with the running Chrome's major version.
const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1';
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1';
const ANDROID = `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] ?? 141}.0.0.0 Mobile Safari/537.36`;

// f = frame: b bezel [vertical, horizontal] or one value, r outer radius, rim metal color, sb status bar height,
// cut camera/cutout style, btns [side l|r|t, offset from the outer top (left for t), length].
const DEVICES = [
  { name: 'iPhone SE', w: 375, h: 667, ua: IOS, os: 'iOS',
    f: { b: [110, 22], r: 62, rim: '#3a3a3c', sb: 20, cut: 'home', btns: [['l', 120, 28], ['l', 180, 52], ['l', 245, 52], ['r', 180, 60]] } },
  { name: 'iPhone 13', w: 390, h: 844, ua: IOS, os: 'iOS',
    f: { b: 13, r: 60, rim: '#3b3f47', sb: 47, cut: 'notch', btns: [['l', 130, 28], ['l', 200, 58], ['l', 275, 58], ['r', 235, 95]] } },
  { name: 'iPhone 15', w: 393, h: 852, ua: IOS, os: 'iOS',
    f: { b: 12, r: 68, rim: '#4a4a4e', sb: 54, cut: 'island', btns: [['l', 150, 30], ['l', 215, 60], ['l', 290, 60], ['r', 245, 95]] } },
  { name: 'iPhone 15 Pro Max', w: 430, h: 932, ua: IOS, os: 'iOS',
    f: { b: 11, r: 70, rim: '#a39d92', sb: 59, cut: 'island', btns: [['l', 160, 32], ['l', 230, 64], ['l', 310, 64], ['r', 265, 105]] } },
  { name: 'iPhone 16 Pro', w: 402, h: 874, ua: IOS, os: 'iOS',
    f: { b: 10, r: 66, rim: '#c2a68e', sb: 62, cut: 'island', btns: [['l', 150, 30], ['l', 215, 60], ['l', 290, 60], ['r', 245, 95], ['r', 600, 48]] } },
  { name: 'Samsung Galaxy S24', w: 360, h: 780, ua: ANDROID, os: 'Android',
    f: { b: 8, r: 40, rim: '#34373f', sb: 32, cut: 'punch', btns: [['r', 180, 95], ['r', 310, 55]] } },
  { name: 'Samsung Galaxy S24 Ultra', w: 384, h: 824, ua: ANDROID, os: 'Android',
    f: { b: 8, r: 16, rim: '#8e9093', sb: 32, cut: 'punch', btns: [['r', 190, 100], ['r', 330, 58]] } },
  { name: 'Google Pixel 8', w: 412, h: 915, ua: ANDROID, os: 'Android',
    f: { b: 11, r: 48, rim: '#3d3d40', sb: 36, cut: 'punch', btns: [['r', 190, 55], ['r', 265, 110]] } },
  { name: `Galaxy Z Fold 5 (${t('unfolded')})`, w: 673, h: 841, ua: ANDROID, os: 'Android',
    f: { b: 10, r: 22, rim: '#b8c6d6', sb: 30, cut: 'punch-right', fold: true, btns: [['r', 170, 90], ['r', 285, 70]] } },
  { name: 'iPad Mini', w: 768, h: 1024, ua: IPAD, os: 'iOS', tablet: true,
    f: { b: 22, r: 40, rim: '#7d7d82', sb: 24, cut: 'cam-top', btns: [['t', 560, 45], ['t', 620, 45], ['t', 700, 55]] } },
  { name: 'iPad Air', w: 820, h: 1180, ua: IPAD, os: 'iOS', tablet: true,
    f: { b: 24, r: 42, rim: '#a8b8c9', sb: 24, cut: 'cam-side', btns: [['t', 740, 60], ['r', 110, 48], ['r', 170, 48]] } },
  { name: 'iPad Pro 12.9"', w: 1024, h: 1366, ua: IPAD, os: 'iOS', tablet: true,
    f: { b: 26, r: 44, rim: '#c8c9cb', sb: 24, cut: 'cam-top', btns: [['t', 940, 65], ['r', 110, 50], ['r', 175, 50]] } },
  { name: 'Galaxy Tab S9', w: 800, h: 1280, ua: ANDROID.replace(' Mobile', ''), os: 'Android', tablet: true,
    f: { b: 20, r: 32, rim: '#4a4b50', sb: 28, cut: 'cam-side', btns: [['r', 120, 55], ['r', 190, 75]] } },
];

// iOS 26/27 status glyphs, measured from a real iPhone screenshot in pt.
const GLYPH = {
  signal: '<svg width="17.2" height="12" viewBox="0 0 17.2 12" fill="currentColor"><rect x=".1" y="7.2" width="3.1" height="4.4" rx="1.55"/><rect x="4.7" y="5.6" width="3.1" height="6" rx="1.55"/><rect x="9.3" y="3.3" width="3.1" height="8.3" rx="1.55"/><rect x="13.9" y="1.1" width="3.1" height="10.5" rx="1.55"/></svg>',
  wifi: '<svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M1.42 4.72a9.3 9.3 0 0 1 13.16 0"/><path d="M4.04 7.34a5.6 5.6 0 0 1 7.92 0"/><path d="M8 11.3 6.3 9.6a2.4 2.4 0 0 1 3.4 0Z" fill="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  battery: '<svg width="26.1" height="13" viewBox="0 0 26.1 13"><rect x=".5" y=".75" width="21.5" height="11.5" rx="3.8" fill="none" stroke="currentColor" opacity=".35"/><rect x="2.25" y="2.5" width="18" height="8" rx="2.2" fill="currentColor"/><path d="M24 4.3c1.2.2 2.1 1.1 2.1 2.2s-.9 2-2.1 2.2Z" fill="currentColor" opacity=".4"/></svg>',
};


const { css, html } = globalThis.SIM_TEMPLATE;
// Set by background.js when it brings the simulator back after a page load: { url, scroll, csp }.
const start = globalThis.__simStart;
delete globalThis.__simStart;
const hostEl = document.createElement('sim-movil');
// all:initial resets what the host inherits from the page.
hostEl.style.cssText = `all:initial;position:fixed;inset:0;z-index:2147483647;display:block;opacity:${start ? 1 : 0};transition:opacity .25s cubic-bezier(.32,.72,0,1)`;
const ui = hostEl.attachShadow({ mode: 'closed' });
const sheet = new CSSStyleSheet();
sheet.replaceSync(css);
ui.adoptedStyleSheets = [sheet];
ui.innerHTML = html;
const pageOverflow = document.documentElement.style.overflow;
document.documentElement.style.overflow = 'hidden';
document.documentElement.append(hostEl); // a transformed <body> would become the containing block of position: fixed
requestAnimationFrame(() => (hostEl.style.opacity = '1'));
for (const t of ['keydown', 'keyup', 'keypress']) hostEl.addEventListener(t, (e) => e.stopPropagation());
const off = new AbortController(), { signal } = off;

const $ = (id) => ui.getElementById(id);
let frame = $('frame');
const device = $('device'), shell = $('shell'), screen = $('screen'), status = $('status'), main = ui.querySelector('main');
let landscape, currentUrl, scrollRatio = 0;
let barMin = false, scrollAnchor = 0, landBarY = 0, landFrame = 0;

const prefs = await chrome.storage.local.get(['device', 'zoom', 'settings', 'landscape']);
const store = (k, v) => {
  try { chrome.storage.local.set({ [k]: v }).catch(() => {}); } catch { closeSim(false); } // orphaned: see send()
};
landscape = !!prefs.landscape;

const menuGlyph = (d) => d.tablet
  ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="3" width="16" height="18" rx="2.5"/></svg>'
  : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6.5" y="2.5" width="11" height="19" rx="2.8"/>${d.f.cut === 'home' ? '<circle cx="12" cy="18.6" r=".9" fill="currentColor"/>' : '<path d="M10.5 5h3"/>'}</svg>`;
const groups = {};
DEVICES.forEach((d, i) => {
  (groups[d.tablet ? t('tablets') : d.os === 'iOS' ? 'iPhone' : 'Android'] ??= []).push(`<button class="opt" role="option" data-i="${i}">${menuGlyph(d)}<span>${d.name}</span><span class="dims">${d.w} × ${d.h}</span>
    <svg class="check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></button>`);
});
$('devMenu').innerHTML = Object.entries(groups).map(([g, opts]) => `<p class="section">${g}</p><div class="group">${opts.join('')}</div>`).join('');

function syncDevMenu() {
  $('devName').textContent = current().name;
  for (const o of $('devMenu').querySelectorAll('.opt')) o.setAttribute('aria-selected', +o.dataset.i === deviceIndex);
}

$('devMenu').onclick = (e) => {
  const o = e.target.closest('.opt');
  if (!o) return;
  $('devMenu').hidePopover();
  if (+o.dataset.i !== deviceIndex) changeDevice(+o.dataset.i);
};
$('devMenu').onkeydown = (e) => {
  const opts = [...$('devMenu').querySelectorAll('.opt')], i = opts.indexOf(ui.activeElement);
  const next = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: opts.length - 1 }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  opts[(next + opts.length) % opts.length].focus();
};
$('devMenu').addEventListener('toggle', (e) => {
  $('devBtn').setAttribute('aria-expanded', e.newState === 'open');
  if (e.newState === 'open') $('devMenu').querySelector('[aria-selected="true"]')?.focus({ preventScroll: false });
});
let deviceIndex = +(prefs.device ?? 1);
// Chrome's page zoom levels.
const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3];
let zoom = +prefs.zoom || 'fit', fitBox = { ow: 0, oh: 0, vw: 1 };

const current = () => DEVICES[deviceIndex] ?? DEVICES[1];
syncDevMenu();

const settings = { frame: true, sync: true, touch: true, theme: 'system', mode: 'browser' };
Object.assign(settings, typeof prefs.settings === 'object' && prefs.settings); // older versions saved a JSON string
for (const el of $('settings').querySelectorAll('input')) el.checked = el.type === 'checkbox' ? settings[el.name] : settings[el.name] === el.value;

$('settings').onchange = (e) => {
  const { name, type, checked, value } = e.target;
  settings[name] = type === 'checkbox' ? checked : value;
  store('settings', settings);
  if (name === 'theme') applyTheme();
  else if (name === 'touch' || name === 'sync') toFrame({ simSet: { [name]: settings[name] } });
  else {
    layout();
    if (name === 'mode') mount(currentUrl); // display-mode emulation in frame.js is fixed when the frame is created
  }
};

const systemDark = matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  hostEl.classList.add('no-anim'); // otherwise every color transition fires at once and the swap smears
  hostEl.dataset.theme = (settings.theme === 'system' ? systemDark.matches : settings.theme === 'dark') ? 'dark' : 'light';
  hostEl.offsetWidth;
  requestAnimationFrame(() => hostEl.classList.remove('no-anim'));
}
systemDark.onchange = applyTheme;
applyTheme();

const host = () => { try { return new URL(currentUrl).hostname.replace(/^www\./, ''); } catch { return ''; } };
const svg = (body, size = 22, sw = 2) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const I = {
  back: '<path d="m14.5 18-6-6 6-6"/>', fwd: '<path d="m9.5 18 6-6-6-6"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  reload: '<path d="M20 12a8 8 0 1 1-2.3-5.7L20 8.5"/><path d="M20 3.5v5h-5"/>', menu: '<path d="M5 7h14M5 12h14M5 17h14"/>',
  book: '<path d="M3 4.5h5.5A3.5 3.5 0 0 1 12 8v12.5A2.5 2.5 0 0 0 9.5 18H3zM21 4.5h-5.5A3.5 3.5 0 0 0 12 8v12.5a2.5 2.5 0 0 1 2.5-2.5H21z"/>',
  share: '<path d="M8 9H6.5A1.5 1.5 0 0 0 5 10.5v9A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 17.5 9H16"/><path d="m8.5 6 3.5-3.5L15.5 6M12 2.5V15"/>',
  tabs: '<rect x="8" y="8" width="12.5" height="12.5" rx="3"/><path d="M16 5.2A2.5 2.5 0 0 0 13.6 3.5H6A2.5 2.5 0 0 0 3.5 6v7.6A2.5 2.5 0 0 0 5.2 16"/>',
  tune: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
};
const KEBAB = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';

// iOS 27 Safari Compact, measured on an iPhone 13 in pt: row bottom 33 and strip 89 expanded, capsule bottom 14 and
// strip 54 collapsed.
const iosBar = (d) => {
  const hasHomeButton = d.f.cut === 'home';
  const bottom = hasHomeButton ? 10 : 33, minBottom = hasHomeButton ? 6 : 14;
  return { bottom, minBottom, h: barMin ? minBottom + 30 + 10 : bottom + 44 + 12 };
};

function browserBar(d) {
  if (d.os === 'Android') return d.tablet ? { kind: 'chrome-tab', pos: 'top', h: 96 } : { kind: 'chrome', pos: 'top', h: 56 };
  if (d.tablet) return { kind: 'safari-top', pos: 'top', h: 50 };
  // iOS 27 iPhone landscape, measured: a 60pt row that hides entirely while scrolling down.
  if (landscape) return { kind: 'safari-land', pos: 'top', h: barMin ? 0 : 60 };
  return { kind: 'safari', pos: 'bottom', ...iosBar(d) };
}

function barHTML(kind) {
  const domain = `<span class="domain">${host()}</span>`;
  const chromeRow = `<div class="pill">${svg(I.tune, 18)}${domain}</div><span class="tabcount">1</span>${KEBAB}`;
  return {
    safari: `<div class="ios"><button class="cap circle" data-act="back" aria-label="${t('back')}">${svg(I.back, 22, 2.1)}</button>
      <div class="cap field" data-act="url">${svg(I.menu, 18)}<span class="domain"><bdi>${host()}</bdi></span><span data-act="reload" aria-label="${t('reload')}">${svg(I.reload, 18)}</span></div>
      <button class="cap circle" data-act="tabs" aria-label="${t('tabs')}">${svg(I.tabs, 21, 1.9)}</button></div>`,
    'safari-land': `<div class="ios-land"><div class="grp"><button class="cap circle" data-act="back" aria-label="${t('back')}">${svg(I.back, 22, 2.1)}</button><span class="cap circle">${svg(I.book, 21, 1.9)}</span></div>
      <div class="cap field" data-act="url">${svg(I.menu, 18)}<span class="domain"><bdi>${host()}</bdi></span><span data-act="reload" aria-label="${t('reload')}">${svg(I.reload, 18)}</span></div>
      <div class="cap tools">${svg(I.share, 21, 1.9)}${svg(I.plus, 21, 1.9)}${svg(I.tabs, 20, 1.9)}</div></div>`,
    'safari-top': `<div class="safari-top">${svg(I.back)}${svg(I.fwd)}<div class="pill">${svg(I.menu, 16)}${domain}${svg(I.reload, 16)}</div>${svg(I.plus)}${svg(I.tabs, 20, 1.9)}</div>`,
    chrome: `<div class="chrome">${chromeRow}</div>`,
    'chrome-tab': `<div class="chrome-tab"><div class="strip"><div class="tab">${domain}${svg(I.x, 14)}</div>${svg(I.plus, 18)}</div>
      <div class="chrome">${svg(I.back)}${svg(I.fwd)}${svg(I.reload)}${chromeRow}</div></div>`,
  }[kind];
}

const applyRule = () => { const d = current(); return send({ rule: { ua: d.ua, mobile: !d.tablet, platform: d.os } }); };

function layout() {
  const d = current(), f = d.f;
  const [by, bx] = settings.frame ? [f.b, f.b].flat() : [0, 0];
  const W = d.w + 2 * bx, H = d.h + 2 * by; // portrait outer size
  const sw = landscape ? d.h : d.w, sh = landscape ? d.w : d.h;

  const mode = settings.mode;
  let top = 0, left = 0, right = 0, bottom = 0;
  if (mode === 'browser' || mode === 'pwa') {
    if (!landscape || d.tablet) top = f.sb;
    else if (f.cut === 'island' || f.cut === 'notch') left = right = f.sb;
    else if (f.cut.startsWith('punch')) left = f.sb;
  }
  const statusH = top, bar = mode === 'browser' ? browserBar(d) : null;
  if (bar?.pos === 'top') top += bar.h;
  if (bar?.pos === 'bottom') bottom += bar.h;
  const vw = sw - left - right, vh = sh - top - bottom;
  device.classList.toggle('bare', !settings.frame);

  const ow = landscape ? H : W, oh = landscape ? W : H;
  device.style.borderRadius = (settings.frame ? f.r : 0) + 'px';
  device.style.width = ow + 'px';
  device.style.height = oh + 'px';
  shell.style.cssText = `width:${W}px;height:${H}px;border-width:${by}px ${bx}px;border-radius:${f.r}px;--rim:${f.rim};--rot:${landscape ? -90 : 0}deg`;
  const btn = ([side, at, len]) => side === 't'
    ? `<b style="top:${-by - 4}px;left:${at - bx}px;width:${len}px;height:4px"></b>`
    : `<b style="${side === 'l' ? 'left' : 'right'}:${-bx - 4}px;top:${at - by}px;width:4px;height:${len}px"></b>`;
  shell.innerHTML = f.btns.map(btn).join('') + (f.fold ? '<i class="crease"></i>' : '') + {
    island: '<i class="island"></i>',
    notch: '<i class="notch"></i>',
    punch: '<i class="punch"></i>',
    'punch-right': '<i class="punch" style="left:auto;right:48px"></i>',
    home: `<i class="speaker" style="top:${-by / 2 - 3}px"></i><i class="homebtn" style="bottom:${-(by + 62) / 2}px"></i>`,
    'cam-top': `<i class="cam" style="top:${-by / 2 - 4}px;left:calc(50% - 4px)"></i>`,
    'cam-side': `<i class="cam" style="right:${-bx / 2 - 4}px;top:calc(50% - 4px)"></i>`,
  }[f.cut];

  screen.style.cssText = `left:${landscape ? by : bx}px;top:${landscape ? bx : by}px;width:${sw}px;height:${sh}px;border-radius:${settings.frame ? Math.max(0, f.r - Math.max(bx, by)) : 0}px`;
  frame.style.cssText = `left:${left}px;top:${top}px;width:${vw}px;height:${vh}px`;
  if (d.os === 'iOS' && !d.tablet) {
    // Measured on a 390pt iPhone: time centered at 12.4% of the width, vertically on the cutout's center line.
    status.className = 'ios-sb' + (f.cut === 'home' ? ' se' : '');
    status.style.cssText = `display:${statusH ? 'block' : 'none'};height:${statusH}px;--cy:${{ island: 29, notch: 23.5 }[f.cut] ?? statusH / 2}px;--tx:${(d.w * 0.124).toFixed(1)}px`;
    status.innerHTML = f.cut === 'home'
      ? `<span class="glyphs start">${GLYPH.signal}${GLYPH.wifi}</span><span class="time">9:41</span><span class="glyphs">${GLYPH.battery}</span>`
      : `<span class="time">9:41</span><span class="glyphs">${GLYPH.signal}${GLYPH.wifi}${GLYPH.battery}</span>`;
  } else {
    status.className = '';
    status.style.cssText = `display:${statusH ? 'grid' : 'none'};height:${statusH}px;font-size:13px`;
    status.innerHTML = `<span>${d.os === 'iOS' ? '9:41' : '12:30'}</span><span></span><span class="icons">${GLYPH.signal}${GLYPH.wifi}${GLYPH.battery}</span>`;
  }
  $('home').style.cssText = `display:${f.cut === 'home' ? 'none' : ''};width:${Math.min(sw * 0.34, 300)}px`;
  const chrome = $('chrome');
  chrome.style.cssText = bar
    ? `left:${left}px;width:${vw}px;height:${bar.h}px;top:${bar.pos === 'top' ? statusH : sh - bar.h}px;--ios-bottom:${bar.bottom}px;--ios-min-bottom:${bar.minBottom}px`
    : 'display:none';
  // Rebuilt only when it changes, so the collapse transition survives the layout() that resizes the viewport.
  const key = bar ? bar.kind + host() : '';
  if (chrome.dataset.key !== key) {
    chrome.innerHTML = bar ? barHTML(bar.kind) : '';
    chrome.dataset.key = key;
  }
  chrome.firstElementChild?.classList.toggle('min', barMin);

  const prev = fitBox;
  fitBox = { ow, oh, vw };
  if (prev.ow !== ow || prev.oh !== oh || prev.vw !== vw) placeDevice(prev);
  $('devDims').textContent = `${vw} × ${vh}`;
}

function setBarMin(v) {
  if (v === barMin) return;
  barMin = v;
  layout();
  // The bar and the page's top edge move in the same frame, so no gap opens between them.
  const bar = $('chrome').querySelector('.ios-land');
  if (!bar) return;
  const to = barMin ? -60 : 0, sh = parseFloat(screen.style.height);
  const put = () => {
    bar.style.translate = `0 ${landBarY}px`;
    frame.style.top = 60 + landBarY + 'px';
    frame.style.height = sh - 60 - landBarY + 'px';
  };
  cancelAnimationFrame(landFrame);
  if (reduced()) return (landBarY = to), put();
  const from = landBarY;
  let start = null;
  const tick = (now) => {
    start ??= now;
    const p = Math.min(1, (now - start) / 200);
    landBarY = from + (to - from) * (1 - Math.cos(Math.PI * p)) / 2;
    put();
    if (p < 1) landFrame = requestAnimationFrame(tick);
  };
  put(); // the old position, before the first paint, so the page never shows its end state early
  landFrame = requestAnimationFrame(tick);
}

// Safari shrinks its bar while scrolling down and restores it when scrolling up or at the top.
function onPageScroll(y, resized) {
  if (resized) { scrollAnchor = y; return; }
  const d = y - scrollAnchor;
  if (y < 10 || d < -12) setBarMin(false);
  else if (d > 12) setBarMin(true);
  else return;
  scrollAnchor = y;
}

$('chrome').onclick = (e) => {
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'back' || act === 'reload') toFrame({ simNav: act });
  if (act === 'url') {
    if (barMin) setBarMin(false);
    else $('url').focus();
  }
};

// Chrome only applies an iframe's name at creation, so a fresh iframe carries the device UA to frame.js.
function mount(src) {
  setBarMin(false); // before cloning, so the new frame gets the expanded-bar size
  scrollAnchor = 0;
  const d = current(), f = frame.cloneNode();
  const display = { browser: 'browser', pwa: 'standalone', fullscreen: 'fullscreen' }[settings.mode];
  f.name = '__sim__' + JSON.stringify({ ua: d.ua, mobile: !d.tablet, touch: settings.touch, sync: settings.sync, display, scroll: settings.sync ? scrollRatio : 0 });
  f.src = src;
  frame.replaceWith(f);
  frame = f;
  $('address').classList.add('loading');
  f.onload = () => $('address').classList.remove('loading');
}

const pretty = (u) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

function setUrl(url) {
  currentUrl = url;
  if (ui.activeElement !== $('url')) $('url').value = pretty(url);
  layout();
}

function go(url, scroll = 0) {
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  scrollRatio = scroll;
  setUrl(url);
  $('url').value = url;
  mount(url);
}

// After an extension reload or update, sendMessage throws "Extension context invalidated" in this orphaned script.
function send(msg) {
  try {
    return chrome.runtime.sendMessage(msg).catch(() => undefined);
  } catch {
    closeSim(false);
    return Promise.resolve();
  }
}

const toFrame = (msg) => send({ toFrame: msg });
function onRuntime(m) {
  const data = m.simOut;
  if (!data) return;
  if (data.simUrl) setUrl(data.simUrl);
  if (data.simZoom) {
    const r = frame.getBoundingClientRect(), k = r.width / parseFloat(frame.style.width);
    wheelZoom(data.simZoom.dy, r.top + data.simZoom.y * k);
  }
  if (typeof data.simScroll === 'number') scrollRatio = data.simScroll;
  if (typeof data.simY === 'number') onPageScroll(data.simY, data.simResized);
  if (data.simPullDown) setBarMin(false);
}
chrome.runtime.onMessage.addListener(onRuntime);

// The device's CSS zoom (committed) renders sharp. Between commits a transform on the stage only scales it down,
// since scaling a raster up blurs it.
const view = { x: 0, y: 0, s: 1 };
let committed = 1, goal = null, zoomFrame = 0;
const stage = $('stage');
// vw*s whole, or the page sees a viewport 1px narrower. The epsilon keeps it idempotent: 402/393*393 is 401.999…
const quant = (s) => Math.floor(fitBox.vw * s + 1e-6) / fitBox.vw;
const snap = (v) => Math.round(v * devicePixelRatio) / devicePixelRatio;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const capturing = () => $('shot').disabled;

function area() {
  const tb = $('toolbar').getBoundingClientRect(), right = $('zoombar').getBoundingClientRect().left - 16;
  return { left: innerWidth - right, top: tb.bottom + 16, right, bottom: innerHeight - 56 };
}
const fitScale = () => { const a = area(); return Math.min(1, (a.right - a.left) / fitBox.ow, (a.bottom - a.top) / fitBox.oh); };
const centerX = (s) => (innerWidth - fitBox.ow * s) / 2;
function placeY(s, y) {
  const a = area(), h = fitBox.oh * s;
  return h <= a.bottom - a.top ? (a.top + a.bottom - h) / 2 : Math.min(a.top, Math.max(a.bottom - h, y));
}
const centered = (s) => ({ s, x: centerX(s), y: placeY(s, 0) });

function paint() {
  stage.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.s / committed})`;
  $('zoomLabel').textContent = `${Math.round(view.s * 100)}%`;
}

function commit(z) {
  committed = z;
  device.style.zoom = z;
}

function settle() {
  cancelAnimationFrame(zoomFrame);
  zoomFrame = 0;
  if (goal) Object.assign(view, goal), (goal = null);
  view.s = quant(view.s);
  view.x = snap(view.x);
  view.y = snap(view.y);
  stage.style.willChange = '';
  commit(view.s);
  paint();
}

// s, x and y approach by the same fraction each frame, so a cursor anchor stays put the whole way.
function glideTo(g, animate = true) {
  goal = { s: quant(g.s), x: g.x, y: g.y }; // exact, so repeated zooms around one anchor don't accumulate rounding
  // Render at least as large as anything this glide will show, then only shrink it (headroom spares re-renders mid-pinch).
  if (goal.s > committed + 1e-6) {
    commit(Math.min(3, quant(goal.s * 1.25)));
    paint();
  }
  if (!animate || reduced()) return settle();
  if (zoomFrame) return; // already gliding: it just re-aims at the new goal
  stage.style.willChange = 'transform';
  let prev = null;
  const tick = (now) => {
    // Time only from frame timestamps; a timestamp from the input event can be later and give a negative step.
    const dt = prev === null ? 16 : now - prev;
    prev = now;
    const f = 1 - Math.exp(-dt / 70);
    view.s += (goal.s - view.s) * f;
    view.x += (goal.x - view.x) * f;
    view.y += (goal.y - view.y) * f;
    const done = Math.abs(goal.s - view.s) < 0.002 && Math.abs(goal.x - view.x) < 0.3 && Math.abs(goal.y - view.y) < 0.3;
    if (done) Object.assign(view, { s: goal.s, x: snap(goal.x), y: snap(goal.y) }); // the last frame sits exactly where the sharp render lands next frame
    paint();
    zoomFrame = requestAnimationFrame(done ? settle : tick);
  };
  zoomFrame = requestAnimationFrame(tick);
}

const target = () => goal ?? view;

function zoomAt(s, ay) {
  s = quant(s); // anchor with the zoom that will actually be rendered
  const t = target();
  glideTo({ s, x: centerX(s), y: placeY(s, ay - (ay - t.y) * (s / t.s)) });
}

function setZoom(z, ay) {
  if (capturing()) return;
  zoom = z === 'fit' ? 'fit' : Math.min(3, Math.max(0.25, z));
  store('zoom', zoom);
  $('fit').setAttribute('aria-pressed', zoom === 'fit');
  if (zoom === 'fit') return glideTo(centered(fitScale()));
  const a = area();
  zoomAt(zoom, ay ?? (a.top + a.bottom) / 2);
}

function placeDevice(prev = fitBox) {
  if (!fitBox.ow) return;
  if (zoom === 'fit' || !prev.ow) return glideTo(centered(zoom === 'fit' ? fitScale() : zoom), false);
  const cy = view.y + (prev.oh * view.s) / 2, s = quant(zoom);
  glideTo({ s, x: centerX(s), y: placeY(s, cy - (fitBox.oh * s) / 2) }, false);
}

function scrollDevice(dy) {
  if (capturing()) return;
  const t = target(), y = placeY(t.s, t.y - dy);
  if (goal) goal.y = y;
  if (zoomFrame) return; // the running glide paints
  view.y = snap(y);
  paint();
}

const stepZoom = (dir) => setZoom(dir > 0
  ? ZOOM_STEPS.find((v) => v > target().s + 0.005) ?? 3
  : ZOOM_STEPS.findLast((v) => v < target().s - 0.005) ?? 0.25);

$('zoomIn').onclick = () => stepZoom(1);
$('zoomOut').onclick = () => stepZoom(-1);
$('zoomLabel').onclick = () => setZoom(1);
$('fit').onclick = () => setZoom('fit');

// Trackpad pinch arrives as ctrl+wheel. Clamping to ±40 caps a mouse notch (~100) at about 15% while pinch steps stay fine.
const wheelZoom = (dy, y) => setZoom(target().s * Math.exp(-Math.max(-40, Math.min(40, dy)) * 0.004), y);
main.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (e.ctrlKey) wheelZoom(e.deltaY, e.clientY);
  else scrollDevice(e.deltaY);
}, { passive: false });

function closeSim(tell = true) {
  if (globalThis.__simMovil?.close !== closeSim) return;
  globalThis.__simMovil = null;
  off.abort();
  try { chrome.runtime.onMessage.removeListener(onRuntime); } catch {}
  systemDark.onchange = null;
  cancelAnimationFrame(zoomFrame);
  if (tell) send({ closed: true });
  document.documentElement.style.overflow = pageOverflow;
  hostEl.style.opacity = '0';
  setTimeout(() => hostEl.remove(), 250);
}
globalThis.__simMovil = { close: closeSim };
// An extension reload or update clears chrome.runtime.id here even if nothing calls sendMessage.
const orphanCheck = setInterval(() => chrome.runtime?.id || closeSim(false), 2000);
off.signal.addEventListener('abort', () => clearInterval(orphanCheck));
$('close').onclick = closeSim;

ui.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !ui.querySelector(':popover-open')) return closeSim();
  if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('input, select, textarea, [contenteditable]')) return;
  const dir = { '+': 1, '=': 1, '-': -1, '_': -1 }[e.key];
  if (dir) stepZoom(dir);
  else if (e.key === '0') setZoom(1);
  else return;
  e.preventDefault();
});

let noteTimer;
function notify(text, kind = 'ok') {
  const icon = { ok: 'M20 6 9 17l-5-5', error: 'M18 6 6 18M6 6l12 12' }[kind];
  $('note').className = `float show ${kind}`;
  $('note').innerHTML = icon ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${icon}"/></svg>` : '';
  $('note').append(text);
  clearTimeout(noteTimer);
  if (kind !== 'busy') noteTimer = setTimeout(() => $('note').classList.remove('show'), 2400);
}

async function changeDevice(i) {
  deviceIndex = i;
  store('device', i);
  syncDevMenu();
  layout();
  await applyRule();
  mount(currentUrl);
}

$('rotate').onclick = () => { landscape = !landscape; store('landscape', landscape); layout(); };
$('url').onkeydown = (e) => { if (e.key === 'Enter' && $('url').value.trim()) go($('url').value.trim()); };
$('url').onfocus = () => { $('url').value = currentUrl; $('url').select(); };
$('url').onblur = () => { $('url').value = pretty(currentUrl); };
$('settings').addEventListener('toggle', (e) => $('gear').setAttribute('aria-expanded', e.newState === 'open'));
$('reload').onclick = () => mount(currentUrl);
addEventListener('resize', () => { layout(); placeDevice(); }, { signal });
// Restored from the back/forward cache: the page that replaced this one dropped the rule.
addEventListener('pageshow', (e) => e.persisted && applyRule(), { signal });

// No sandbox: the page needs allow-scripts and allow-same-origin, which together let it remove the sandbox. This blocks
// a framebuster (top.location = location), which would reload the tab into the simulator in a loop. The URL is read
// directly because the phone's own report arrives after such a script runs.
const phoneUrl = () => { try { return frame.contentWindow.location.href; } catch { return null; } };
navigation?.addEventListener('navigate', (e) => {
  if (e.cancelable && !e.userInitiated && e.navigationType !== 'reload' && e.destination.url === phoneUrl()) e.preventDefault();
}, { signal });

// A page whose CSP limits frame-src (GitHub, for one) refuses the phone's later navigations; only the first load,
// started by the extension, is exempt. If the reload without the header still refuses, the CSP is in the HTML.
document.addEventListener('securitypolicyviolation', (e) => {
  if (!/^(frame|child)-src/.test(e.violatedDirective) || !/^https?:/.test(e.blockedURI)) return;
  if (start?.csp) return notify(t('cspBlocked'), 'error');
  notify(t('cspReloading'), 'busy');
  send({ reloadForFrames: e.blockedURI });
}, { signal });

$('shot').onclick = () => screenshot().then((size) => notify(`${t('shotSaved')} · ${size}`), (e) => notify(`${t('shotFailed')}: ${e.message}`, 'error'));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function grab() {
  const img = new Image();
  const shot = await send({ capture: true }); // captureVisibleTab isn't available to content scripts
  if (!shot || shot.error) throw new Error(shot?.error ?? t('noResponse'));
  img.src = shot;
  await img.decode();
  return img;
}

// captureVisibleTab only sees the screen, so the device is enlarged to its real pixel density and captured in tiles.
async function screenshot() {
  const d = current(), btn = $('shot');
  const density = d.tablet || d.f.cut === 'home' ? 2 : 3;
  settle(); // land any glide first, or its last frame would overwrite the capture zoom
  const saved = { ...view };
  btn.disabled = true;
  notify(t('capturing'), 'busy');
  hostEl.classList.add('capturing');
  try {
    view.s = quant(density / devicePixelRatio);
    // Side buttons stick out 4px past the bezel.
    const pad = settings.frame ? Math.ceil(6 * view.s) : 0;
    toFrame({ simCapture: true });
    commit(view.s);
    paint();
    await wait(300); // let the page re-raster at the new scale

    const k = devicePixelRatio, W = fitBox.ow * view.s + 2 * pad, H = fitBox.oh * view.s + 2 * pad;
    const dev = device.getBoundingClientRect();
    const buttons = settings.frame ? [...shell.querySelectorAll('b')].map((b) => { const r = b.getBoundingClientRect(); return [r.left - dev.left, r.top - dev.top, r.width, r.height]; }) : [];
    const c = document.createElement('canvas');
    c.width = Math.round(W * k);
    c.height = Math.round(H * k);
    const ctx = c.getContext('2d');
    // Stop above the progress pill and its shadow, the only UI still visible while capturing.
    const clip = { left: 0, top: 0, right: innerWidth, bottom: snap($('note').getBoundingClientRect().top - 48) };

    for (let ty = 0; ty < H; ty += clip.bottom - clip.top) {
      for (let tx = 0; tx < W; tx += clip.right - clip.left) {
        view.x = clip.left + pad - tx;
        view.y = clip.top + pad - ty;
        paint();
        await wait(550); // captureVisibleTab is limited to 2 calls per second
        const img = await grab(), ox = view.x - pad, oy = view.y - pad;
        const L = Math.max(ox, clip.left), T = Math.max(oy, clip.top), R = Math.min(ox + W, clip.right), B = Math.min(oy + H, clip.bottom);
        // Whole device pixels, so tile seams are copied 1:1 instead of resampled.
        const sx = Math.round(L * k), sy = Math.round(T * k), w = Math.round(R * k) - sx, h = Math.round(B * k) - sy;
        if (w > 0 && h > 0) ctx.drawImage(img, sx, sy, w, h, sx - Math.round(ox * k), sy - Math.round(oy * k), w, h);
      }
    }
    // The black capture backdrop matches the rim, so the anti-aliased cut leaves no light halo.
    const ring = settings.frame ? 3.5 * view.s : 0, o = pad - ring;
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.roundRect(o * k, o * k, (W - 2 * o) * k, (H - 2 * o) * k, ((settings.frame ? d.f.r * view.s : 0) + ring) * k);
    for (const [x, y, w, h] of buttons) ctx.rect((pad + x) * k, (pad + y) * k, w * k, h * k);
    ctx.fill();
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = `${d.name.replace(/\W+/g, '-')}-${c.width}x${c.height}.png`;
    a.click();
    return `${c.width}×${c.height}`;
  } finally {
    Object.assign(view, saved);
    commit(view.s);
    paint();
    hostEl.classList.remove('capturing');
    toFrame({ simCapture: false });
    btn.disabled = false;
  }
}

layout();
await applyRule();
go(start?.url ?? location.href, start?.scroll);
send({ opened: currentUrl });
main.tabIndex = -1; // focusable, so the zoom shortcuts and Esc work right away
main.focus({ preventScroll: true });
})();
