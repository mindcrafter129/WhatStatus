// starts the native host and sends activity to the page
const HOST = "com.whatstauts.host";
const ports = new Set();
let host = null;
let activity;

function connectHost() {
  host = chrome.runtime.connectNative(HOST);
  host.onMessage.addListener((msg) => {
    if (!msg || !("game" in msg)) return;
    activity = { game: msg.game ?? null, music: msg.music ?? null };
    for (const p of ports) p.postMessage(activity);
  });
  host.onDisconnect.addListener(() => {
    console.warn("[whatstauts] host disconnected:", chrome.runtime.lastError?.message);
    host = null;
    setTimeout(connectHost, 10_000);
  });
}
connectHost();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "whatstauts") return;
  ports.add(port);
  if (activity !== undefined) port.postMessage(activity);
  port.onDisconnect.addListener(() => ports.delete(port));
});
