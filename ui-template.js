// A global, not a const, so a second injection (which closes the simulator) doesn't redeclare it.
globalThis.SIM_TEMPLATE ??= ((t) => ({
  css: String.raw`
  :host {
    --scheme: dark;
    --bg: #0a0a0c; --stage-hi: #1c1c21;
    --glass: rgb(38 38 42 / 0.6); --glass-edge: rgb(255 255 255 / 0.1); --glass-hi: rgb(255 255 255 / 0.07);
    --text: #f5f5f7; --muted: rgb(235 235 245 / 0.62); --faint: rgb(235 235 245 / 0.32);
    --fill: rgb(118 118 128 / 0.24); --hover: rgb(255 255 255 / 0.08); --seg-on: rgb(99 99 102 / 0.95); --group: rgb(255 255 255 / 0.05);
    --line: rgb(255 255 255 / 0.1); --accent: #0a84ff; --track: rgb(120 120 128 / 0.36); --ok: #30d158; --bad: #ff453a;
    --float-shadow: 0 0 0 0.5px rgb(0 0 0 / 0.6), 0 12px 32px rgb(0 0 0 / 0.4), 0 2px 6px rgb(0 0 0 / 0.25);
    --device-shadow: 0 60px 100px -40px rgb(0 0 0 / 0.85), 0 24px 48px -24px rgb(0 0 0 / 0.6);
    --ease: cubic-bezier(0.32, 0.72, 0, 1);
  }
  :host([data-theme="light"]) {
    --scheme: light;
    --bg: #f5f5f7; --stage-hi: #ffffff;
    --glass: rgb(255 255 255 / 0.66); --glass-edge: rgb(0 0 0 / 0.07); --glass-hi: rgb(255 255 255 / 0.9);
    --text: #1d1d1f; --muted: rgb(60 60 67 / 0.62); --faint: rgb(60 60 67 / 0.3);
    --fill: rgb(118 118 128 / 0.12); --hover: rgb(0 0 0 / 0.05); --seg-on: #fff; --group: rgb(118 118 128 / 0.08);
    --line: rgb(0 0 0 / 0.08); --accent: #007aff; --track: rgb(120 120 128 / 0.18); --ok: #34c759; --bad: #ff3b30;
    --float-shadow: 0 0 0 0.5px rgb(0 0 0 / 0.05), 0 12px 32px rgb(0 0 0 / 0.08), 0 2px 6px rgb(0 0 0 / 0.04);
    --device-shadow: 0 60px 100px -40px rgb(0 0 0 / 0.4), 0 24px 48px -24px rgb(0 0 0 / 0.25);
  }
  :host(.no-anim), :host(.no-anim) * { transition: none !important; }
  * { box-sizing: border-box; }
  /* Styles inherit from #app: the page's CSS can reach the host element but not the shadow tree. */
  #app { color-scheme: var(--scheme); color: var(--text); font: 13px/1.35 -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif;
    letter-spacing: -0.006em; -webkit-font-smoothing: antialiased; }
  svg { flex: none; }
  button, input { font: inherit; color: inherit; letter-spacing: inherit; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  .float { position: fixed; z-index: 10; left: 50%; translate: -50% 0; display: flex; align-items: center; gap: 4px; padding: 6px;
    border: 1px solid transparent; border-radius: 18px; background: var(--glass); backdrop-filter: blur(28px) saturate(1.8);
    box-shadow: inset 0 0 0 0.5px var(--glass-edge), inset 0 1px 0 var(--glass-hi), var(--float-shadow); }
  @media (prefers-reduced-transparency: reduce) { .float, #settings { backdrop-filter: none; background: var(--bg); } }
  #toolbar { top: 14px; width: min(860px, calc(100vw - 28px)); }
  #zoombar { left: auto; right: 14px; top: 50%; translate: 0 -50%; flex-direction: column; gap: 2px; }
  #zoomLabel { height: 30px; color: var(--text); font-size: 11px; font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .icon[aria-pressed="true"] { background: var(--seg-on); color: var(--text); box-shadow: 0 0 0 0.5px var(--line), 0 1px 3px rgb(0 0 0 / 0.12); }
  .sep { flex: none; width: 18px; height: 1px; margin: 4px 0; background: var(--line); }
  #note { bottom: 18px; gap: 7px; padding: 8px 14px; border-radius: 14px; font-weight: 500; white-space: nowrap; opacity: 0; pointer-events: none;
    transition: opacity 200ms var(--ease); }
  #note.show { opacity: 1; }
  #note svg { color: var(--ok); }
  #note.error svg { color: var(--bad); }

  .picker { display: flex; align-items: center; gap: 8px; flex: 0 1 auto; min-width: 0; max-width: 280px; height: 34px; padding: 0 28px 0 12px; border: 0; border-radius: 12px; cursor: pointer;
    font-weight: 600; background: transparent no-repeat right 9px center
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%238e8e93' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3 4.5 3 3 3-3'/%3E%3C/svg%3E");
    transition: background-color 150ms ease; }
  .picker span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .picker .dims { flex: none; color: var(--muted); font-weight: 500; font-variant-numeric: tabular-nums; }
  .picker[aria-expanded="true"] { background-color: var(--hover); }

  .address { position: relative; flex: 1; min-width: 120px; display: flex; align-items: center; height: 34px; padding: 0 3px; overflow: hidden;
    border-radius: 12px; background: var(--fill); transition: box-shadow 150ms ease; }
  .address::before { content: ''; flex: none; width: 28px; } /* balances the reload button so the domain sits centered */
  .address:focus-within { box-shadow: inset 0 0 0 2px var(--accent); }
  .address input { flex: 1; min-width: 0; height: 100%; padding: 0 4px; border: 0; outline: 0; background: none; text-align: center; font-weight: 500; text-overflow: ellipsis; }
  .address input:focus { text-align: left; font-weight: 400; }
  .address input::placeholder { color: var(--faint); }
  .address .icon { width: 28px; height: 28px; border-radius: 9px; }
  .address::after { content: ''; position: absolute; left: 0; bottom: 0; height: 2px; width: 30%; border-radius: 1px; background: var(--accent); opacity: 0; transition: opacity 200ms ease; }
  .address.loading::after { opacity: 1; animation: load 1.1s linear infinite; }
  @keyframes load { from { translate: -100% 0; } to { translate: 340% 0; } }
  @media (prefers-reduced-motion: reduce) { .address.loading::after { animation: none; width: 100%; opacity: 0.5; } }

  .icon { display: grid; place-items: center; flex: none; width: 34px; height: 34px; padding: 0; border: 0; border-radius: 12px;
    background: none; color: var(--muted); cursor: pointer; transition: background-color 150ms ease, color 150ms ease, scale 150ms ease-out; }
  .icon:not(:disabled):active, .seg label:active, .picker:active { scale: 0.96; }
  .icon:disabled { opacity: 0.35; cursor: progress; }
  .icon[aria-expanded="true"] { background: var(--hover); color: var(--text); }


  .seg { display: inline-flex; gap: 2px; }
  .seg label { position: relative; cursor: pointer; transition: scale 150ms ease-out; }
  .seg input { position: absolute; opacity: 0; pointer-events: none; }
  .seg span { display: flex; align-items: center; justify-content: center; gap: 6px; height: 32px; padding: 0 11px; border-radius: 12px;
    color: var(--muted); font-weight: 500; font-variant-numeric: tabular-nums; transition: background-color 150ms ease, color 150ms ease; }
  .seg input:checked + span { background: var(--seg-on); color: var(--text); box-shadow: 0 0 0 0.5px var(--line), 0 1px 3px rgb(0 0 0 / 0.12); }
  .seg input:focus-visible + span { outline: 2px solid var(--accent); outline-offset: 1px; }

  @media (hover: hover) {
    .icon:not(:disabled):hover, .picker:hover { background-color: var(--hover); color: var(--text); }
    .seg label:hover input:not(:checked) + span { color: var(--text); }
    .row:hover, .opt:hover { background: var(--hover); }
  }
  @media (prefers-reduced-motion: reduce) { .icon:not(:disabled):active, .seg label:active, .picker:active { scale: none; } }
  @media (max-width: 640px) { .picker { max-width: 120px; } #toolbar .act-optional { display: none; } }

  #settings, .menu { position: fixed; inset: auto; top: 70px; margin: 0; max-width: calc(100vw - 28px); padding: 8px;
    border: 1px solid transparent; border-radius: 20px; color: var(--text); background: var(--glass); backdrop-filter: blur(28px) saturate(1.8);
    box-shadow: inset 0 0 0 0.5px var(--glass-edge), inset 0 1px 0 var(--glass-hi), var(--float-shadow);
    transition: opacity 150ms ease-out, scale 150ms ease-out, overlay 150ms allow-discrete, display 150ms allow-discrete; }
  #settings { right: 14px; width: 372px; transform-origin: top right; }
  .menu { left: 14px; width: 340px; max-height: calc(100vh - 96px); overflow: auto; overscroll-behavior: contain; scrollbar-width: none; transform-origin: top left; }
  @supports (anchor-name: --a) {
    #settings { position-anchor: --gear; top: anchor(bottom); right: anchor(right); margin-top: 10px; }
    .menu { position-anchor: --dev; top: anchor(bottom); left: anchor(left); margin-top: 10px; max-height: calc(100vh - anchor-size(height) - 48px); }
  }
  #settings:not(:popover-open), .menu:not(:popover-open) { opacity: 0; scale: 0.96; }
  #settings:popover-open, .menu:popover-open { transition-duration: 250ms; transition-timing-function: var(--ease); }
  @starting-style { #settings:popover-open, .menu:popover-open { opacity: 0; scale: 0.96; } }
  @media (prefers-reduced-motion: reduce) { #settings, #settings:not(:popover-open), .menu, .menu:not(:popover-open) { scale: none; } }
  .menu .section:first-child { margin-top: 4px; }
  .group + .section { margin-top: 14px; }
  .opt { display: grid; grid-template-columns: 22px 1fr auto 16px; align-items: center; gap: 10px; width: 100%; height: 38px; padding: 0 10px 0 12px;
    border: 0; background: none; text-align: left; cursor: pointer; transition: background-color 150ms ease; }
  .opt svg:first-child { color: var(--muted); }
  .opt span:not(.dims) { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .opt .dims { color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; }
  .opt .check { color: var(--accent); opacity: 0; }
  .opt[aria-selected="true"] { font-weight: 600; }
  .opt[aria-selected="true"] .check { opacity: 1; }
  .opt:focus-visible { outline: 0; background: var(--hover); }
  .opt + .opt { position: relative; }
  .opt + .opt::before { content: ''; position: absolute; top: 0; left: 44px; right: 0; height: 0.5px; background: var(--line); }
  .group { border-radius: 12px; background: var(--group); overflow: hidden; }
  .group + .group { margin-top: 14px; }
  .section { margin: 0 12px 6px; color: var(--muted); font-size: 11px; font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 44px; padding: 0 12px; cursor: pointer; transition: background-color 150ms ease; position: relative; }
  .row + .row::before { content: ''; position: absolute; top: 0; left: 12px; right: 0; height: 0.5px; background: var(--line); }
  .tiles { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 4px; padding: 4px; }
  .tiles span { flex-direction: column; gap: 6px; height: 64px; padding: 0 6px; border-radius: 8px; font-size: 12px; text-align: center; white-space: nowrap; }
  .tiles svg { width: 20px; height: 20px; }
  input[role="switch"] { appearance: none; position: relative; flex: none; width: 38px; height: 22px; margin: 0; border-radius: 11px;
    background: var(--track); cursor: pointer; transition: background-color 200ms ease; }
  input[role="switch"]::before { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 9px;
    background: #fff; box-shadow: 0 1px 3px rgb(0 0 0 / 0.25), 0 0 0 0.5px rgb(0 0 0 / 0.04); transition: translate 250ms var(--ease); }
  input[role="switch"]:checked { background: var(--ok); }
  input[role="switch"]:checked::before { translate: 16px 0; }
  @media (prefers-reduced-motion: reduce) { input[role="switch"]::before { transition: none; } }

  main { position: fixed; inset: 0; overflow: hidden; touch-action: none;
    background: radial-gradient(110% 85% at 50% 42%, var(--stage-hi), var(--bg) 72%) var(--bg); }
  /* While sim.js tiles a screenshot, anything overlapping the device or cut at a tile edge would land in the image. */
  :host(.capturing) main { background: #000; } /* matches the device rim at the cut-out edge (sim.js) */
  :host(.capturing) #toolbar, :host(.capturing) #zoombar { visibility: hidden; }
  :host(.capturing) #device { box-shadow: none; }


  #stage { position: absolute; left: 0; top: 0; transform-origin: 0 0; }
  #device { position: relative; box-shadow: var(--device-shadow); }
  #shell { position: absolute; left: 50%; top: 50%; box-sizing: border-box; border: solid #050505; pointer-events: none;
    transform: translate(-50%, -50%) rotate(var(--rot)); box-shadow: 0 0 0 2px var(--rim), 0 0 0 3.5px #000c; }
  #shell > * { position: absolute; }
  #shell b { background: var(--rim); border-radius: 2px; filter: brightness(.85); }
  .island { top: 11px; left: calc(50% - 62px); width: 124px; height: 36px; border-radius: 20px; background: #000; }
  .notch { top: -1px; left: calc(50% - 81px); width: 162px; height: 33px; border-radius: 0 0 21px 21px; background: #050505; }
  .notch::before, .notch::after { content: ''; position: absolute; top: 0; width: 8px; height: 8px; }
  .notch::before { left: -8px; background: radial-gradient(circle at 0 100%, transparent 7.5px, #050505 8px); }
  .notch::after { right: -8px; background: radial-gradient(circle at 100% 100%, transparent 7.5px, #050505 8px); }
  .punch { top: 9px; left: calc(50% - 6px); width: 12px; height: 12px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #33415f 0 2px, #050505 3px); }
  .speaker { left: calc(50% - 28px); width: 56px; height: 6px; border-radius: 3px; background: #262628; }
  .speaker::before { content: ''; position: absolute; left: -26px; top: -2px; width: 10px; height: 10px; border-radius: 50%; background: #1b1e27; }
  .homebtn { left: calc(50% - 31px); width: 62px; height: 62px; border-radius: 50%; box-shadow: inset 0 0 0 3px #2c2c2e; }
  .cam { width: 8px; height: 8px; border-radius: 50%; background: #1b1e27; box-shadow: 0 0 0 2px #111; }
  .crease { top: 0; bottom: 0; left: calc(50% - 8px); width: 16px; background: linear-gradient(90deg, transparent, #0000000a 40%, #ffffff1a 60%, transparent); }
  /* The screen shares the bars' background, so no hairline of another color shows where the page meets a bar. */
  #screen { position: absolute; overflow: hidden; background: var(--sys-bg);
    --sys-bg: #1c1c1e; --sys-fg: #fff; --sys-muted: rgb(235 235 245 / 0.6); --sys-field: #2c2c2e; --sys-edge: rgb(255 255 255 / 0.07); --sys-strip: #0e0e10; }
  :host([data-theme="light"]) #screen { --sys-bg: #f2f2f7; --sys-fg: #000; --sys-muted: rgb(60 60 67 / 0.6); --sys-field: #fff; --sys-edge: rgb(0 0 0 / 0.08); --sys-strip: #e3e3e8; }
  #status { position: absolute; top: 0; left: 0; right: 0; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0 22px; background: var(--sys-bg); color: var(--sys-fg); font-weight: 600; font-family: -apple-system, "SF Pro Text", Roboto, system-ui, sans-serif; }
  #status.ios-sb > * { position: absolute; top: var(--cy); translate: 0 -50%; display: flex; align-items: center; }
  #status.ios-sb .time { left: var(--tx); translate: -50% -50%; font: 700 14.7px/1 -apple-system, "SF Pro Text", Inter, system-ui, sans-serif; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  #status.ios-sb .glyphs { right: calc(var(--tx) - 14px); gap: 4px; translate: 0 calc(-50% - 0.5px); } /* mirrors the time's left inset (centered at --tx, ~28px wide) */
  #status.ios-sb.se .time { left: 50%; font-size: 12px; }
  #status.ios-sb.se .glyphs { right: 6px; scale: 0.8; transform-origin: right center; }
  #status.ios-sb.se .glyphs.start { right: auto; left: 6px; transform-origin: left center; }
  .icons { justify-self: end; display: flex; gap: 5px; align-items: center; }
  #home { position: absolute; z-index: 2; bottom: 8px; left: 50%; translate: -50% 0; height: 5px; border-radius: 3px; background: var(--sys-fg); opacity: 0.9; pointer-events: none; }
  iframe { position: absolute; display: block; border: 0; background: #fff; }
  #device.bare #shell { display: none; }
  #device.bare #screen { box-shadow: 0 0 0 0.5px var(--line); }

  #chrome { position: absolute; z-index: 1; pointer-events: none; background: var(--sys-bg); color: var(--sys-fg); font-family: -apple-system, "SF Pro Text", Roboto, system-ui, sans-serif; }
  #chrome > div:not(.ios, .ios-land) { height: 100%; } /* the iOS row is positioned by its own bottom offset */
  .domain { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
  .ios { position: absolute; left: 33px; right: 33px; bottom: var(--ios-bottom); display: flex; align-items: center; gap: 7px; }
  .cap { border: 0; color: var(--sys-fg); background: var(--sys-field); pointer-events: auto; cursor: pointer;
    box-shadow: inset 0 0 0 0.5px var(--sys-edge), 0 1px 3px rgb(0 0 0 / 0.12); }
  .ios .circle { display: grid; place-items: center; flex: none; width: 44px; height: 44px; padding: 0; border-radius: 22px;
    transition: opacity 200ms ease, scale 350ms var(--ease); }
  .ios .field { interpolate-size: allow-keywords; display: flex; align-items: center; gap: 8px; flex: 1 1 0; min-width: 0; max-width: 600px; height: 44px; margin-inline: auto; padding: 0 13px; border-radius: 22px;
    font: 600 15px/1 -apple-system, "SF Pro Text", Inter, system-ui, sans-serif; letter-spacing: -0.01em;
    transition-property: max-width, height, font-size, padding, translate; transition-duration: 350ms; transition-timing-function: var(--ease); }
  /* direction: rtl clips a long domain at its start, as Safari does; bdi keeps the text itself left to right. */
  :is(.ios, .ios-land) .domain { display: flex; justify-content: safe center; direction: rtl; mask-image: linear-gradient(to right, transparent, #000 12px); }
  :is(.ios, .ios-land) .domain bdi { flex: none; direction: ltr; white-space: nowrap; }
  .ios .field > svg, .ios [data-act="reload"] { display: flex; flex: none; }
  .ios.min .circle { opacity: 0; scale: 0.7; pointer-events: none; }
  .ios.min .field { max-width: max-content; height: 30px; padding: 0 16px; font-size: 13.5px;
    translate: 0 calc(var(--ios-bottom) + 22px - var(--ios-min-bottom) - 15px); }
  .ios.min .field > svg, .ios.min [data-act="reload"] { display: none; }
  @media (prefers-reduced-motion: reduce) { .ios .circle, .ios .field { transition: opacity 200ms ease; } }
  /* The landscape bar paints its own strip, so the strip slides with the capsules instead of popping in. */
  .ios-land { position: absolute; left: 0; right: 0; top: 0; height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 2px; background: var(--sys-bg); }
  #chrome:has(> .ios-land) { background: none; }
  .ios-land .grp { display: flex; gap: 10px; }
  .ios-land .circle { display: grid; place-items: center; width: 42px; height: 42px; padding: 0; border-radius: 21px; }
  .ios-land .field { position: absolute; left: 50%; translate: -50% 0; display: flex; align-items: center; gap: 8px; width: min(335px, 50%); height: 42px;
    padding: 0 13px; border-radius: 21px; font: 600 15px/1 -apple-system, "SF Pro Text", Inter, system-ui, sans-serif; letter-spacing: -0.01em; }
  .ios-land .tools { display: flex; align-items: center; gap: 18px; height: 42px; padding: 0 16px; border-radius: 21px; }
  .ios-land.min { translate: 0 -60px; pointer-events: none; }
  .ios-land.min * { pointer-events: none; }
  .safari-top { display: flex; align-items: center; gap: 18px; padding: 0 18px; color: var(--sys-fg); }
  .safari-top .pill { display: flex; align-items: center; gap: 8px; flex: 1; max-width: 520px; height: 34px; margin: 0 auto; padding: 0 12px; border-radius: 10px; background: var(--sys-field); box-shadow: inset 0 0 0 0.5px var(--sys-edge); font-size: 15px; }
  .chrome { display: flex; align-items: center; gap: 14px; padding: 0 14px; color: var(--sys-muted); }
  .chrome .pill { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; height: 40px; padding: 0 14px; border-radius: 20px; background: var(--sys-field); box-shadow: inset 0 0 0 0.5px var(--sys-edge); color: var(--sys-fg); font-size: 15px; }
  .chrome .pill .domain { text-align: left; }
  .tabcount { display: grid; place-items: center; width: 20px; height: 20px; border: 2px solid currentColor; border-radius: 5px; font: 700 11px Roboto, system-ui, sans-serif; }
  .chrome-tab { display: flex; flex-direction: column; }
  .chrome-tab .strip { display: flex; align-items: flex-end; gap: 8px; height: 40px; padding: 0 10px; background: var(--sys-strip); color: var(--sys-muted); }
  .chrome-tab .tab { display: flex; align-items: center; gap: 8px; width: 240px; height: 34px; padding: 0 12px; border-radius: 10px 10px 0 0; background: var(--sys-bg); color: var(--sys-fg); font-size: 13px; }
  .chrome-tab .tab .domain { text-align: left; }
  .chrome-tab .chrome { flex: 1; box-shadow: none; }
  #devBtn { anchor-name: --dev; }
  #gear { anchor-name: --gear; }
`,
  html: `<div id="app"><main>
  <div id="stage"><div id="device"><div id="screen"><div id="status"></div><div id="chrome"></div><iframe id="frame"></iframe><div id="home"></div></div><div id="shell"></div></div></div>
</main>

<nav id="toolbar" class="float" aria-label="${t('simulator')}">
  <button id="close" class="icon" title="${t('close')} (Esc)" aria-label="${t('close')}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
  <button id="devBtn" class="picker" popovertarget="devMenu" aria-haspopup="listbox" title="${t('device')}"><span id="devName"></span><span id="devDims" class="dims"></span></button>
  <div class="address" id="address">
    <input id="url" type="url" placeholder="${t('urlPlaceholder')}" spellcheck="false" aria-label="${t('address')}">
    <button id="reload" class="icon" title="${t('reload')}" aria-label="${t('reload')}"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.34-5.66L20 8.5"/><path d="M20 3.5v5h-5"/></svg></button>
  </div>
  <button id="rotate" class="icon" title="${t('rotate')}" aria-label="${t('rotate')}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="3" width="11" height="17" rx="2.5"/><path d="M3.5 14.5a6 6 0 0 0 5 6"/><path d="M3.5 18.5v-4h4"/></svg></button>
  <button id="shot" class="icon act-optional" title="${t('screenshot')}" aria-label="${t('screenshot')}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4.5h-5L8 7H5a2 2 0 0 0-2 2v8.5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.25"/></svg></button>
  <button id="gear" class="icon" popovertarget="settings" title="${t('settings')}" aria-label="${t('settings')}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg></button>
</nav>

<div id="zoombar" class="float" role="group" aria-label="Zoom">
  <button id="zoomIn" class="icon" title="${t('zoomIn')} (+)" aria-label="${t('zoomIn')}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5.5v13M5.5 12h13"/></svg></button>
  <button id="zoomLabel" class="icon" title="${t('actualSize')} (0)" aria-label="${t('actualSize')}"></button>
  <button id="zoomOut" class="icon" title="${t('zoomOut')} (−)" aria-label="${t('zoomOut')}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 12h13"/></svg></button>
  <div class="sep"></div>
  <button id="fit" class="icon" title="${t('fit')}" aria-label="${t('fit')}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/></svg></button>
</div>

<div id="note" class="float" role="status"></div>

<div id="devMenu" class="menu" popover role="listbox" aria-label="${t('device')}"></div>

<div id="settings" popover>
  <div class="group">
    <label class="row">${t('deviceFrame')}<input type="checkbox" role="switch" name="frame"></label>
    <label class="row">${t('syncScroll')}<input type="checkbox" role="switch" name="sync"></label>
    <label class="row">${t('touchScroll')}<input type="checkbox" role="switch" name="touch"></label>
  </div>
  <p class="section">${t('appearance')}</p>
  <div class="group seg tiles" role="radiogroup" aria-label="${t('theme')}">
    <label><input type="radio" name="theme" value="system"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></svg>${t('themeSystem')}</span></label>
    <label><input type="radio" name="theme" value="light"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>${t('themeLight')}</span></label>
    <label><input type="radio" name="theme" value="dark"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>${t('themeDark')}</span></label>
  </div>
  <p class="section">${t('screenMode')}</p>
  <div class="group seg tiles" role="radiogroup" aria-label="${t('screenMode')}">
    <label><input type="radio" name="mode" value="browser"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M9 18.5h6"/><path d="M6.5 15.5h11"/></svg>${t('modeBrowser')}</span></label>
    <label><input type="radio" name="mode" value="pwa"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="3"/><rect x="9" y="8" width="2.5" height="2.5" rx=".6" fill="currentColor" stroke="none"/><rect x="12.5" y="8" width="2.5" height="2.5" rx=".6" fill="currentColor" stroke="none"/><rect x="9" y="11.5" width="2.5" height="2.5" rx=".6" fill="currentColor" stroke="none"/></svg>PWA</span></label>
    <label><input type="radio" name="mode" value="fullscreen"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M9 6.5H8v1M15 6.5h1v1M9 17.5H8v-1M15 17.5h1v-1"/></svg>${t('modeFullscreen')}</span></label>
  </div>
</div></div>`,
}))((k) => chrome.i18n.getMessage(k));
