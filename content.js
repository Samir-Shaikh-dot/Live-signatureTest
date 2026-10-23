(() => {
  try {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL('page-hook.js');
    s.async = false;
    (document.documentElement || document.head).appendChild(s);
    s.onload = () => s.remove();
  } catch (e) {}
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.__wingoLab !== true) return;
    const payload = event.data.payload;
    if (!payload || typeof payload !== 'object') return;
    chrome.runtime.sendMessage({type: 'WINGO_CAPTURE', payload}).catch(() => {});
  });
})();