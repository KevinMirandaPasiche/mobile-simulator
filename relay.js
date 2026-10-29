// frame.js runs in the page's world, which has no chrome.runtime, so its messages pass through this isolated world.
// After an extension reload or update, sendMessage throws "Extension context invalidated" instead of rejecting.
const send = (m) => { try { chrome.runtime.sendMessage(m).catch(() => {}); } catch {} };

if (window.name.startsWith('__sim__') && window !== top && parent === top) {
  addEventListener('__sim_out', (e) => send({ simOut: JSON.parse(e.detail) }));
  chrome.runtime.onMessage.addListener((m) => {
    if (m.simIn) dispatchEvent(new CustomEvent('__sim_in', { detail: JSON.stringify(m.simIn) }));
  });
}

// Content scripts run once per document, so same-document navigations such as pushState don't report here.
if (window === top) send({ topLoaded: true });
