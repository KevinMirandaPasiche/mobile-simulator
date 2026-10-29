# Hero image

Source of `docs/hero.png` (README) and `docs/social-preview.png` (GitHub social preview).

| File | What it is |
| --- | --- |
| `hero.html` | The composition. Open it in a browser to preview it; edit the text, colors and device positions here. |
| `devices/` | The three device images, captured with the extension's own screenshot button. |
| `site/index.html` | "Horizon", the demo website shown on the screens. |
| `render.js` | Renders the images. |

## Update for a new release

```sh
cd docs/hero
npm install           # once; downloads Chrome for Testing
npm run devices       # only if the frames or the demo site changed
npm run hero          # writes ../hero.png and ../social-preview.png
```

Then upload `docs/social-preview.png` in the repository's **Settings → General → Social preview**.

For the device status bars to use Inter, as in the current images, install it first. On Ubuntu,
run `sudo apt install fonts-inter`. On macOS, the status bars use SF Pro.
