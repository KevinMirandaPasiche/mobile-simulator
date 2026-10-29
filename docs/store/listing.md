# Chrome Web Store listing

Texts for the Developer Dashboard, ready to paste. Images are in this folder (`screenshot-*.png`,
`promo-440x280.png`); the icon comes from the package. The name and summary come from `_locales/*/messages.json`.

## Store listing tab

**Category:** Developer Tools
**Language:** English
**Homepage URL:** https://github.com/KevinMirandaPasiche/mobile-simulator
**Support URL:** https://github.com/KevinMirandaPasiche/mobile-simulator/issues

### Description — English

```
Mobile Simulator shows the page you're on inside a realistic phone or tablet, right in the same tab. Click the toolbar icon, check your layout, and click again to close it.

Unlike resizing the window, the page runs inside a real device frame on the same origin, so your cookies, login session and local storage keep working.

FEATURES
• 13 devices: iPhone SE, 13, 15, 15 Pro Max and 16 Pro, Samsung Galaxy S24 and S24 Ultra, Google Pixel 8, Galaxy Z Fold 5, iPad Mini, iPad Air, iPad Pro 12.9" and Galaxy Tab S9
• Real device frames with Dynamic Island, notch, punch-hole camera and side buttons
• Mobile user agent and client hints, so sites serve their mobile version
• Touch emulation: drag to scroll with momentum, as on a real phone
• Safari's toolbar that collapses as you scroll, Chrome for Android and iPad Safari
• Landscape rotation, zoom and fit to window
• HD screenshots at the device's real pixel density, with a transparent background
• Browser, installed PWA and fullscreen display modes
• Stays open while your dev server reloads the page
• Light and dark themes, in 15 languages

KEYBOARD SHORTCUTS
Esc: close · + / −: zoom · 0: actual size · Ctrl + scroll or trackpad pinch: zoom around the cursor

PRIVACY
Mobile Simulator collects no data and makes no network requests of its own. Its header changes apply only to the tab running the simulator, and they're removed when you close it.

Open source (MIT): https://github.com/KevinMirandaPasiche/mobile-simulator
```

### Description — Spanish (add it as a translation)

```
Mobile Simulator muestra la página en la que estás dentro de un teléfono o una tablet realistas, en la misma pestaña. Pulsa el icono de la barra, revisa tu diseño y vuelve a pulsarlo para cerrarlo.

A diferencia de redimensionar la ventana, la página se ejecuta dentro de un marco de dispositivo real y en el mismo origen, así que tus cookies, tu sesión iniciada y el almacenamiento local siguen funcionando.

FUNCIONES
• 13 dispositivos: iPhone SE, 13, 15, 15 Pro Max y 16 Pro, Samsung Galaxy S24 y S24 Ultra, Google Pixel 8, Galaxy Z Fold 5, iPad Mini, iPad Air, iPad Pro 12.9" y Galaxy Tab S9
• Marcos de dispositivo reales con Dynamic Island, notch, cámara perforada y botones laterales
• User agent y client hints móviles, para que las webs sirvan su versión móvil
• Emulación táctil: arrastra para desplazarte con inercia, como en un teléfono real
• La barra de Safari que se pliega al hacer scroll, Chrome para Android y Safari de iPad
• Rotación a horizontal, zoom y ajuste a la ventana
• Capturas en HD a la densidad de píxeles real del dispositivo, con fondo transparente
• Modos de pantalla navegador, PWA instalada y pantalla completa
• Sigue abierto mientras tu servidor de desarrollo recarga la página
• Tema claro y oscuro, en 15 idiomas

ATAJOS DE TECLADO
Esc: cerrar · + / −: zoom · 0: tamaño real · Ctrl + rueda o pellizco en el trackpad: zoom alrededor del cursor

PRIVACIDAD
Mobile Simulator no recopila datos ni hace peticiones de red propias. Sus cambios de cabeceras solo afectan a la pestaña donde está abierto el simulador y se eliminan al cerrarlo.

Código abierto (MIT): https://github.com/KevinMirandaPasiche/mobile-simulator
```

## Privacy tab

**Single purpose:**

```
Preview the current web page inside realistic mobile and tablet device frames to test responsive design.
```

**Permission justifications:**

| Field | Text |
| --- | --- |
| declarativeNetRequestWithHostAccess | `Sets a mobile User-Agent and client hints, and removes X-Frame-Options and Content-Security-Policy, only for requests from the tab where the user opened the simulator, so the page can load inside the device frame. The rules are session-scoped to that tab and removed when the simulator closes, the tab navigates away or the tab closes.` |
| scripting | `Injects the simulator interface into the current tab when the user clicks the toolbar icon.` |
| storage | `Saves the user's preferences (device, zoom, orientation, theme and display settings) locally, and remembers per tab, in session storage, that the simulator is open so it can reopen after the page reloads.` |
| Host permission (all URLs) | `The simulator must work on any site the user opens it on: it emulates touch and the mobile user agent inside the device frame (a content script that only acts inside the simulator's own iframe), and captures the visible tab when the user takes a screenshot. No page content is read or sent anywhere.` |

**Are you using remote code?** No, I am not using remote code.

**Data usage:** check none of the data types, then check the three certifications.

**Privacy policy URL:** https://github.com/KevinMirandaPasiche/mobile-simulator/blob/main/PRIVACY.md

## Distribution tab

**Payments:** Free of charge · **Visibility:** Public · **Regions:** All regions

## Notes for the reviewer (if the form asks for test instructions)

```
No account needed. Open any https page (for example https://en.wikipedia.org), click the toolbar icon to open the simulator, and click it again or press Esc to close it.
```
