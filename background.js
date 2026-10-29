// executeScript rejects on pages extensions can't script, such as chrome:// and the Web Store.
const injectUI = (tabId) => chrome.scripting.executeScript({ target: { tabId }, files: ['ui-template.js', 'sim.js'] }).catch(() => {});
chrome.action.onClicked.addListener((tab) => injectUI(tab.id));

// Session storage, because the service worker can be stopped between page loads.
const stateKey = (tabId) => 'sim' + tabId;
const getState = async (tabId) => (await chrome.storage.session.get(stateKey(tabId)))[stateKey(tabId)];
const setState = (tabId, st) => chrome.storage.session.set({ [stateKey(tabId)]: st });
const scrolls = new Map();

// Rule ids must fit in a 32-bit int, so the page rule's id is folded into the upper half of that range.
const pageRule = (tabId) => 0x40000000 + (tabId % 0x3fffffff);

// Only this extension's scripts can reach onMessage: the manifest sets no externally_connectable.
chrome.runtime.onMessage.addListener((m, sender, reply) => {
  const tab = sender.tab;
  if (!tab) return;
  if (m.topLoaded) return void (sender.frameId === 0 && pageLoaded(tab.id, sender.url));
  if (m.opened) setState(tab.id, { url: m.opened });
  // A CSP arrives with the page's response and can't be lifted afterwards, so the tab reloads without it.
  if (m.reloadForFrames) {
    chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [pageRule(tab.id)],
      addRules: [{
        id: pageRule(tab.id),
        priority: 1,
        condition: { tabIds: [tab.id], resourceTypes: ['main_frame'] },
        action: { type: 'modifyHeaders', responseHeaders: [{ header: 'content-security-policy', operation: 'remove' }] },
      }],
    })
      .then(() => setState(tab.id, { url: m.reloadForFrames, csp: true }))
      .then(() => chrome.tabs.reload(tab.id));
  }
  if (m.rule) {
    chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [tab.id],
      addRules: [{
        id: tab.id,
        priority: 1,
        condition: { tabIds: [tab.id] },
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            { header: 'user-agent', operation: 'set', value: m.rule.ua },
            { header: 'sec-ch-ua-mobile', operation: 'set', value: m.rule.mobile ? '?1' : '?0' },
            { header: 'sec-ch-ua-platform', operation: 'set', value: `"${m.rule.platform}"` },
          ],
          responseHeaders: [
            { header: 'x-frame-options', operation: 'remove' },
            { header: 'content-security-policy', operation: 'remove' },
          ],
        },
      }],
    }).then(() => reply(true));
    return true;
  }
  if (m.closed) forget(tab.id);
  // Sent to every frame; relay.js only listens in the phone's frame.
  if (m.toFrame) chrome.tabs.sendMessage(tab.id, { simIn: m.toFrame }).catch(() => {});
  if (m.simOut) {
    chrome.tabs.sendMessage(tab.id, { simOut: m.simOut }, { frameId: 0 }).catch(() => {});
    if (m.simOut.simUrl) getState(tab.id).then((st) => st && setState(tab.id, { ...st, url: m.simOut.simUrl }));
    if (typeof m.simOut.simScroll === 'number') scrolls.set(tab.id, m.simOut.simScroll);
  }
  if (m.capture) {
    chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }).then(reply, (e) => reply({ error: e.message }));
    return true;
  }
});

const dropRule = (tabId) => chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [tabId, pageRule(tabId)] });
const forget = (tabId) => {
  dropRule(tabId);
  chrome.storage.session.remove(stateKey(tabId));
  scrolls.delete(tabId);
};
chrome.tabs.onRemoved.addListener(forget);

async function pageLoaded(tabId, pageUrl) {
  await dropRule(tabId);
  const st = await getState(tabId);
  if (!st) return;
  const same = new URL(st.url).origin === new URL(pageUrl).origin;
  const start = { url: same ? st.url : pageUrl, scroll: same ? scrolls.get(tabId) ?? 0 : 0, csp: !!st.csp };
  if (st.csp) setState(tabId, { url: st.url });
  await chrome.scripting.executeScript({ target: { tabId }, func: (s) => (globalThis.__simStart = s), args: [start] }).catch(() => {});
  injectUI(tabId);
}
