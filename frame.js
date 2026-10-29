// Messages go through relay.js, never postMessage, so a page that names its own iframe "__sim__…" can't read them.
if (window.name.startsWith('__sim__') && window !== top && parent === top) {
  const cfg = JSON.parse(window.name.slice(7));
  // window.name survives navigations, so it carries changed settings to the phone's next pages.
  const keep = () => { window.name = '__sim__' + JSON.stringify(cfg); };
  const { ua, mobile } = cfg;
  const tell = (msg) => dispatchEvent(new CustomEvent('__sim_out', { detail: JSON.stringify(msg) }));
  const def = (obj, key, value) => Object.defineProperty(obj, key, { get: () => value, configurable: true });
  def(Navigator.prototype, 'userAgent', ua);
  def(Navigator.prototype, 'appVersion', ua.slice(8));
  def(Navigator.prototype, 'platform', ua.match(/iPhone|iPad/)?.[0] ?? 'Linux armv8l');
  def(Navigator.prototype, 'maxTouchPoints', 5);
  if (navigator.userAgentData) def(navigator.userAgentData, 'mobile', mobile);
  window.ontouchstart = null;

  // Pages detect an installed PWA through the display-mode media query, and on iOS through navigator.standalone.
  const mm = window.matchMedia.bind(window);
  window.matchMedia = (q) => mm(String(q).replace(/\(\s*display-mode\s*:\s*([\w-]+)\s*\)/g, (_, v) => (v === cfg.display ? '(min-width: 0px)' : '(max-width: 0px)')));
  if (/iPhone|iPad/.test(ua)) def(Navigator.prototype, 'standalone', cfg.display !== 'browser');

  const report = () => tell({ simUrl: location.href });
  for (const k of ['pushState', 'replaceState']) {
    const orig = history[k];
    history[k] = function (...a) { const r = orig.apply(this, a); report(); return r; };
  }
  addEventListener('popstate', report);
  addEventListener('hashchange', report);
  setTimeout(report); // relay.js is injected after this script, so a synchronous report would be lost

  // sim.js scrolls the phone off screen while tiling a screenshot; muted observers keep pages from restyling mid-capture.
  let capturing = false;
  const IO = window.IntersectionObserver;
  window.IntersectionObserver = class extends IO {
    constructor(cb, opts) { super((entries, obs) => { if (!capturing) cb(entries, obs); }, opts); }
  };
  addEventListener('__sim_in', (e) => {
    const d = JSON.parse(e.detail);
    if (d.simCapture !== undefined) capturing = d.simCapture;
    if (d.simSet) Object.assign(cfg, d.simSet), (fingerCursor.disabled = !cfg.touch), keep();
    if (d.simNav === 'back') history.back();
    if (d.simNav === 'reload') location.reload();
  });

  const dot = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='9' fill='%23888' fill-opacity='.35' stroke='%23444' stroke-opacity='.6'/%3E%3C/svg%3E") 12 12, auto`;
  const hideScrollbars = new CSSStyleSheet(), fingerCursor = new CSSStyleSheet();
  hideScrollbars.replaceSync('*{scrollbar-width:none!important}::-webkit-scrollbar{display:none!important}');
  fingerCursor.replaceSync(`*{cursor:${dot}!important}`);
  fingerCursor.disabled = !cfg.touch;
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, hideScrollbars, fingerCursor];

  const page = () => document.scrollingElement;
  let ratio = cfg.scroll || 0, pending = false;
  const restore = () => { if (cfg.sync && !capturing) page().scrollTop = ratio * (page().scrollHeight - innerHeight); };
  const reportScroll = () => {
    const max = page().scrollHeight - innerHeight;
    ratio = max > 0 ? page().scrollTop / max : 0;
    // A scroll right after a resize is the browser clamping the offset, not the user; sim.js would toggle its bar in a loop.
    tell({ simScroll: ratio, simY: page().scrollTop, simResized: performance.now() - resizedAt < 150 });
  };
  let dirty = false;
  addEventListener('scroll', () => {
    if (pending) return void (dirty = true);
    reportScroll();
    pending = true;
    requestAnimationFrame(function next() {
      if (dirty) return (dirty = false), reportScroll(), requestAnimationFrame(next);
      pending = false;
    });
  }, { passive: true });
  // Only width changes re-apply the ratio: the Safari bar changes the height and keeps scrollTop.
  // resize fires before the clamped scroll event, so ratio still holds the old position.
  let lastWidth = innerWidth, resizedAt = -1e9;
  addEventListener('resize', () => {
    resizedAt = performance.now();
    if (innerWidth !== lastWidth) restore();
    lastWidth = innerWidth;
  });
  // Only the first page restores the passed scroll.
  addEventListener('load', () => { restore(); cfg.scroll = 0; keep(); });

  // Mouse as finger, in the order the Pointer Events and Touch Events specs give a touchscreen: pointerdown → touchstart,
  // pointermove → touchmove, pointerup → touchend, then the trusted mousedown/mouseup/click only for a tap whose pointer
  // and touch events weren't canceled. When the browser takes over to scroll, the page gets pointercancel.
  let start = null, gesture = null, moved = false, axis, samples, sx, sy, snaps, glide = 0;

  const scroller = (el, x) => {
    for (; el && el !== document.documentElement; el = el.parentElement) {
      const s = getComputedStyle(el);
      if (/auto|scroll/.test(x ? s.overflowX : s.overflowY) && (x ? el.scrollWidth > el.clientWidth : el.scrollHeight > el.clientHeight)) return el;
    }
    return document.scrollingElement;
  };

  const panAllowed = (el) => {
    let x = true, y = true;
    for (; el && el.nodeType === 1; el = el.parentElement) {
      const t = getComputedStyle(el).touchAction;
      if (t === 'none') return [false, false];
      if (/pan-(x|left|right)/.test(t) && !/pan-(y|up|down)/.test(t)) y = false;
      if (/pan-(y|up|down)/.test(t) && !/pan-(x|left|right)/.test(t)) x = false;
    }
    return [x, y];
  };

  const touch = (type, e) => {
    const t = new Touch({ identifier: 1, target: start.target, clientX: e.clientX, clientY: e.clientY, pageX: e.pageX, pageY: e.pageY, screenX: e.screenX, screenY: e.screenY, radiusX: 10, radiusY: 10, force: 1 });
    const list = type === 'touchend' ? [] : [t];
    // Chrome makes touchmove uncancelable once it is scrolling.
    return start.target.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: !(type === 'touchmove' && start.scrolling), composed: true, touches: list, targetTouches: list, changedTouches: [t] }));
  };

  // pointerId 1 is the real mouse's, so a page's setPointerCapture(e.pointerId) still finds an active pointer.
  const pointer = (type, e) => !start.pointerGone && start.target.dispatchEvent(new PointerEvent(type, {
    bubbles: true, cancelable: type !== 'pointercancel', composed: true, pointerId: 1, pointerType: 'touch', isPrimary: true,
    clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY, width: 20, height: 20,
    pressure: type === 'pointerup' || type === 'pointercancel' ? 0 : 0.5, button: type === 'pointermove' ? -1 : 0, buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
  }));

  const move = (dx, dy) => {
    const x0 = sx.scrollLeft, y0 = sy.scrollTop;
    if (sx === sy) sx.scrollBy({ left: -dx, top: -dy, behavior: 'instant' });
    else {
      sx.scrollBy({ left: -dx, behavior: 'instant' });
      sy.scrollBy({ top: -dy, behavior: 'instant' });
    }
    return sx.scrollLeft !== x0 || sy.scrollTop !== y0;
  };

  const velocity = (now) => {
    const a = samples[0], b = samples.at(-1);
    if (now - b.t > 50 || b.t === a.t) return [0, 0];
    return [(b.x - a.x) / (b.t - a.t), (b.y - a.y) / (b.t - a.t)];
  };

  // iOS's normal deceleration rate (UIScrollView.DecelerationRate.normal): velocity × 0.998 per ms.
  const fling = (vx, vy) => {
    let prev = performance.now();
    const step = (now) => {
      const dt = Math.min(now - prev, 32);
      prev = now;
      const k = 0.998 ** dt;
      vx *= k;
      vy *= k;
      if (Math.hypot(vx, vy) > 0.02 && move(vx * dt, vy * dt)) glide = requestAnimationFrame(step);
    };
    glide = requestAnimationFrame(step);
  };

  const end = (e) => {
    if (!start) return;
    pointer('pointerup', e);
    if (!touch('touchend', e)) start.noMouse = true;
    if (start.scrolling) {
      let [vx, vy] = velocity(e.timeStamp);
      // With snapping restored, a smooth scrollBy in the fling direction lets Chrome pick the next snap point.
      snaps.forEach((el) => {
        el.style.scrollSnapType = '';
        const x = el === sx;
        el.scrollBy({ [x ? 'left' : 'top']: -(x ? vx : vy) * 150, behavior: 'smooth' });
        if (x) vx = 0; else vy = 0;
      });
      if (vx || vy) fling(vx, vy);
    }
    gesture = { noMouse: start.noMouse || moved };
    if (!gesture.noMouse) {
      const at = document.elementFromPoint(e.clientX, e.clientY) ?? start.target;
      for (const type of ['mousedown', 'mouseup']) {
        at.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, composed: true, view: window, detail: 1, button: 0, buttons: type === 'mousedown' ? 1 : 0,
          clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY }));
      }
    }
    start = null;
  };

  const isRealMouse = (e) => cfg.touch && e.isTrusted && (!e.pointerType || e.pointerType === 'mouse');

  addEventListener('pointerdown', (e) => {
    cancelAnimationFrame(glide);
    if (!isRealMouse(e)) return;
    e.stopImmediatePropagation();
    gesture = null;
    if (e.button !== 0) return;
    start = { target: e.target, x: e.clientX, y: e.clientY, pan: panAllowed(e.target) };
    const pointerOk = pointer('pointerdown', e), touchOk = touch('touchstart', e);
    start.blocked = !touchOk;
    start.noMouse = !pointerOk || !touchOk; // canceled pointer/touch events suppress the compatibility mouse events
    samples = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }];
    moved = false;
    sx = scroller(e.target, true);
    sy = scroller(e.target, false);
  }, true);

  addEventListener('pointermove', (e) => {
    if (!isRealMouse(e)) return;
    e.stopImmediatePropagation(); // no hover on a phone
    if (!start) return;
    const releasedOutside = !(e.buttons & 1);
    if (releasedOutside) return end(e);
    const ax = Math.abs(e.clientX - start.x), ay = Math.abs(e.clientY - start.y);
    if (!moved) {
      if (Math.hypot(ax, ay) < 6) return pointer('pointermove', e), void touch('touchmove', e);
      moved = true;
      axis = ax > ay * 2 ? 'x' : ay > ax * 2 ? 'y' : 'xy';
      getSelection().removeAllRanges();
    }
    const last = samples.at(-1);
    const dx = axis === 'y' ? 0 : e.clientX - last.x, dy = axis === 'x' ? 0 : e.clientY - last.y;
    samples.push({ x: last.x + dx, y: last.y + dy, t: e.timeStamp });
    while (e.timeStamp - samples[0].t > 100) samples.shift();
    pointer('pointermove', e);
    const touchOk = touch('touchmove', e);
    if (!start.scrolling) {
      // The browser takes over only if the page let the touch through and touch-action allows this direction.
      const [px, py] = start.pan;
      if (!touchOk) start.blocked = true;
      if (start.blocked || !((dx && px) || (dy && py))) return;
      start.scrolling = true;
      pointer('pointercancel', e);
      start.pointerGone = true;
      // Scroll snapping fights pixel-by-pixel dragging, so it is paused until release.
      snaps = [...new Set([sx, sy])].filter((el) => getComputedStyle(el).scrollSnapType !== 'none');
      snaps.forEach((el) => { el.style.scrollSnapType = 'none'; });
    }
    const [px, py] = start.pan;
    if (!move(px ? dx : 0, py ? dy : 0) && dy > 0 && page().scrollTop <= 0) tell({ simPullDown: true });
  }, true);

  addEventListener('pointerup', (e) => { if (isRealMouse(e)) e.stopImmediatePropagation(), end(e); }, true);

  // stopImmediatePropagation hides these from the page but keeps their default actions, so inputs still take focus.
  for (const type of ['mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'pointerover', 'pointerout', 'pointerenter', 'pointerleave']) {
    addEventListener(type, (e) => {
      if (!isRealMouse(e)) return;
      e.stopImmediatePropagation();
      if (type === 'mousedown' && start?.noMouse) e.preventDefault();
    }, true);
  }
  addEventListener('click', (e) => {
    if (!isRealMouse(e) || e.button !== 0) return;
    if (gesture?.noMouse) e.stopImmediatePropagation(), e.preventDefault();
    gesture = null;
  }, true);
  addEventListener('wheel', (e) => {
    cancelAnimationFrame(glide);
    if (e.deltaY < 0 && !e.ctrlKey && page().scrollTop <= 0) tell({ simPullDown: true });
  }, { capture: true, passive: true });
  // Trackpad pinch arrives as ctrl+wheel; preventDefault keeps it from zooming the tab.
  addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    tell({ simZoom: { dy: e.deltaY, x: e.clientX, y: e.clientY } });
  }, { capture: true, passive: false });
  addEventListener('dragstart', (e) => cfg.touch && e.preventDefault(), true);
}
