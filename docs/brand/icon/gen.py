# Writes the icon SVGs next to this file; `npm run icons` (in docs/brand) renders them into icons/*.png.
import math, os
OUT = os.path.dirname(os.path.abspath(__file__))

def squircle(x, y, s, n=5, steps=120):
    """Superellipse |x|^n + |y|^n = 1, close to iOS's continuous-corner icon shape."""
    a = s / 2; cx, cy = x + a, y + a; pts = []
    for i in range(steps):
        t = 2 * math.pi * i / steps
        c, d = math.cos(t), math.sin(t)
        pts.append((cx + a * math.copysign(abs(c) ** (2 / n), c), cy + a * math.copysign(abs(d) ** (2 / n), d)))
    return 'M' + ' L'.join(f'{px:.2f},{py:.2f}' for px, py in pts) + ' Z'

DEFS = '''<defs>
  <linearGradient id="tile" x1="0.15" y1="0" x2="0.85" y2="1">
    <stop offset="0" stop-color="#ff8f5e"/><stop offset="0.42" stop-color="#ff4f8b"/><stop offset="1" stop-color="#7a5af8"/>
  </linearGradient>
  <radialGradient id="light" cx="0.5" cy="0" r="0.9">
    <stop offset="0" stop-color="#fff" stop-opacity="0.28"/><stop offset="0.6" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffd2a8"/><stop offset="0.5" stop-color="#ff9cb4"/><stop offset="1" stop-color="#c49bff"/>
  </linearGradient>
  <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="0.35" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <filter id="lift" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="{dy}" stdDeviation="{sd}" flood-color="#3a1670" flood-opacity="{op}"/>
  </filter>
</defs>'''

def tile(x, y, s, rim=True):
    p = squircle(x, y, s)
    out = f'<path d="{p}" fill="url(#tile)"/><path d="{p}" fill="url(#light)"/>'
    if rim:  # light catching the top edge
        out += f'<path d="{p}" fill="none" stroke="url(#rim)" stroke-width="{s / 64:.2f}"/>'
    return out

def large(size=128):
    # Chrome: 96×96 artwork centered in 128 with 16px transparent padding; scaled for 48.
    k = size / 128; o = 16 * k; s = 96 * k
    u = s / 96  # artwork unit
    g = lambda v: v * u + o
    f = lambda v: f'{v:.2f}'
    shadow = f'<path d="{squircle(o, o, s)}" fill="#3a1670" opacity="0.28" filter="url(#lift)" transform="translate(0 {1.5 * k:.2f})"/>'
    tablet = (f'<rect x="{f(g(15.5))}" y="{f(g(23))}" width="{f(46 * u)}" height="{f(56 * u)}" rx="{f(7 * u)}" '
              f'fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="{f(4.2 * u)}"/>')
    px, py, pw, ph, t = 48, 17, 33, 62, 3.4
    sx, sy, sw, sh = px + t, py + t, pw - 2 * t, ph - 2 * t
    # Screen scene: sky, sun and two ridges, clipped to the screen.
    ridge = lambda pts, c: '<polygon fill="' + c + '" points="' + ' '.join(f'{f(g(sx + a * sw))},{f(g(sy + b * sh))}' for a, b in pts) + '"/>'
    scene = (f'<clipPath id="scr"><rect x="{f(g(sx))}" y="{f(g(sy))}" width="{f(sw * u)}" height="{f(sh * u)}" rx="{f(6.4 * u)}"/></clipPath>'
             f'<g clip-path="url(#scr)"><rect x="{f(g(sx))}" y="{f(g(sy))}" width="{f(sw * u)}" height="{f(sh * u)}" fill="url(#screen)"/>'
             f'<circle cx="{f(g(sx + 0.66 * sw))}" cy="{f(g(sy + 0.5 * sh))}" r="{f(0.17 * sw * u)}" fill="#fff4d6"/>'
             + ridge([(0, .66), (.3, .52), (.55, .68), (.8, .55), (1, .64), (1, 1), (0, 1)], '#9b6cf0')
             + ridge([(0, .8), (.35, .7), (.7, .84), (1, .74), (1, 1), (0, 1)], '#5a35c9') + '</g>')
    phone = (f'<g filter="url(#lift)"><rect x="{f(g(px))}" y="{f(g(py))}" width="{f(pw * u)}" height="{f(ph * u)}" rx="{f(9.5 * u)}" fill="#fff"/></g>'
             + scene +
             f'<rect x="{f(g(px + pw / 2 - 5.5))}" y="{f(g(py + 7))}" width="{f(11 * u)}" height="{f(3.6 * u)}" rx="{f(1.8 * u)}" fill="#2b1663"/>')
    defs = DEFS.format(dy=f(2 * u), sd=f(2.6 * u), op='0.35')
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">{defs}{shadow}{tile(o, o, s)}{tablet}{phone}</svg>'

def small(size):
    # Toolbar sizes: full-bleed tile and a white phone outline on whole pixels.
    if size == 16:
        x, y, w, h, r, t = 5, 2, 6, 12, 2, 1
    else:
        x, y, w, h, r, t = 10, 3, 12, 26, 3.5, 2
    defs = DEFS.format(dy=0, sd=0, op=0)
    iw, ih = (2, 1) if size == 16 else (4, 2)
    island = f'<rect x="{x + (w - iw) / 2}" y="{y + t + 1}" width="{iw}" height="{ih}" rx="{ih / 2}" fill="#fff"/>'
    frame = (f'<path fill="#fff" fill-rule="evenodd" d="M{x + r},{y} h{w - 2 * r} a{r},{r} 0 0 1 {r},{r} v{h - 2 * r} a{r},{r} 0 0 1 -{r},{r} h-{w - 2 * r} a{r},{r} 0 0 1 -{r},-{r} v-{h - 2 * r} a{r},{r} 0 0 1 {r},-{r} Z '
             f'M{x + t},{y + t + 0.5} v{h - 2 * t - 1} a.5,.5 0 0 0 .5,.5 h{w - 2 * t - 1} a.5,.5 0 0 0 .5,-.5 v-{h - 2 * t - 1} a.5,.5 0 0 0 -.5,-.5 h-{w - 2 * t - 1} a.5,.5 0 0 0 -.5,.5 Z"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">{defs}{tile(0, 0, size, rim=size > 16)}{frame}{island}</svg>'

for name, svg in {'128': large(128), '48': large(48), '32': small(32), '16': small(16)}.items():
    open(f'{OUT}/{name}.svg', 'w').write(svg)
