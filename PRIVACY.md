# Privacy Policy

_Last updated: October 29, 2026_

Mobile Simulator is a browser extension that shows the page you're on inside a mobile or tablet device frame. This
policy explains what it does with data. In short: **it collects nothing.**

## Data collection

Mobile Simulator does not collect, transmit, sell or share any personal or browsing data. It has no analytics, no
tracking, no accounts and no servers, and it makes no network requests of its own.

## Data stored on your device

The extension saves your preferences with the browser's `chrome.storage` API, on your device only:

- the selected device, zoom level and orientation;
- your settings (device frame, synced scrolling, touch scrolling, theme and display mode);
- while the simulator is open in a tab, the address shown in the phone, so it can reopen there after the page reloads.
  This is kept in session storage, which the browser clears when it closes, and it's removed when you close the
  simulator or the tab.

Uninstalling the extension deletes all of this data.

## Screenshots

When you click the screenshot button, the extension captures the visible tab and downloads the image to your
computer. The image is never uploaded anywhere.

## Permissions

| Permission | Why it's needed |
| --- | --- |
| `declarativeNetRequestWithHostAccess` | To send a mobile user agent and let the page load inside the device frame. These changes apply only to the tab running the simulator, and they're removed when it closes. |
| `scripting` | To show the simulator in the current tab when you click the toolbar icon. |
| `storage` | To remember your preferences, as described above. |
| Access to all sites | So the simulator works on any site you open it on, and so it can take screenshots. The extension doesn't read or send page content. |

## Changes

Any change to this policy will be published in this file, with a new date, in the extension's public repository.

## Contact

Questions about this policy can be asked by opening an issue at
https://github.com/KevinMirandaPasiche/mobile-simulator/issues.
