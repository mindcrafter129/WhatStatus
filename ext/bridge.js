// relays activity from the background worker to page.js
function attach() {
  const port = chrome.runtime.connect({ name: "whatstatus" });
  port.onMessage.addListener((msg) => {
    document.dispatchEvent(new CustomEvent("whatstatus:game", { detail: JSON.stringify(msg) }));
  });
  port.onDisconnect.addListener(() => setTimeout(attach, 5_000));
}

attach();
