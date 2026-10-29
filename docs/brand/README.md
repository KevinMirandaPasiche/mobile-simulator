# Brand assets

Source of the extension icon (`icons/*.png`), `docs/hero.png` (README), `docs/social-preview.png` (GitHub social
preview) and the Chrome Web Store images in `docs/store/`.

| File | What it is |
| --- | --- |
| `hero.html` | The composition. Open it in a browser to preview it; edit the text, colors and device positions here. |
| `promo.html` | The Chrome Web Store small promo tile (440×280). |
| `devices/` | The three device images, captured with the extension's own screenshot button. |
| `site/index.html` | "Horizon", the demo website shown on the screens. |
| `icon/gen.py` | The icon, drawn in code: 128 and 48 px show a phone in front of a tablet; 16 and 32 px are a simplified phone on whole pixels for the toolbar. |
| `render.js` | Renders the images. |

## Update for a new release

```sh
cd docs/brand
npm install           # once; downloads Chrome for Testing
npm run icons         # only if icon/gen.py changed; run it before hero, which shows the icon
npm run devices       # only if the frames or the demo site changed
npm run hero          # writes ../hero.png, ../social-preview.png and ../store/promo-440x280.png
npm run store         # writes the five 1280×800 store screenshots to ../store/
```

Then upload `docs/social-preview.png` in the repository's **Settings → General → Social preview**.

For the device status bars to use Inter, as in the current images, install it first. On Ubuntu,
run `sudo apt install fonts-inter`. On macOS, the status bars use SF Pro.
