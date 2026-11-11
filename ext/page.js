// sets the About from the host's activity, using WhatsApp's own modules
(() => {
  if (window.__whatstauts) return;

  const MAX_LEN = 50;
  const LIFETIME = 3600;              // seconds, has to be on whatsapp's allowlist
  const RENEW_MS = 45 * 60 * 1000;
  const SETTLE_MS = 2_000;
  const MIN_GAP_MS = 4_000;
  const K = { saved: "whatstauts:saved", applied: "whatstauts:applied", settings: "whatstauts:settings" };

  const DEFAULTS = {
    game: { enabled: true, template: "Playing {game}", emoji: "" },
    music: { enabled: true, template: "Listening to {song} by {artist}", emoji: "", stripParens: false },
    priority: "game",   // or "music"
    idle: "restore",    // or "clear" / "keep"
  };
  const PLACEHOLDERS = { game: ["game"], music: ["song", "artist"] };

  const mod = (name) => { try { return window.require(name); } catch { return null; } };
  const unixNow = () => Math.floor(Date.now() / 1000);
  const log = (...a) => console.log("[whatstatus]", ...a);

  const load = (key) => { try { const v = localStorage.getItem(key); return v == null ? undefined : JSON.parse(v); } catch { return undefined; } };
  const store = (key, v) => (v === undefined ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(v)));

  const TPL = {
    en: { game: "Playing {game}", music: "Listening to {song} by {artist}" },
    es: { game: "Jugando a {game}", music: "Escuchando {song} de {artist}" },
    fr: { game: "Joue à {game}", music: "Écoute {song} de {artist}" },
    ca: { game: "Jugant a {game}", music: "Escoltant {song} de {artist}" },
  };
  const detectLang = () => {
    const l = (document.documentElement.lang || navigator.language || "en").slice(0, 2).toLowerCase();
    return TPL[l] ? l : "en";
  };
  const effLang = () => { const v = (load(K.settings) || {}).lang; return TPL[v] ? v : detectLang(); };

  function getSettings() {
    const s = load(K.settings) || {};
    const lang = effLang();
    return {
      lang: TPL[s.lang] ? s.lang : "auto",
      game: { ...DEFAULTS.game, template: TPL[lang].game, ...s.game },
      music: { ...DEFAULTS.music, template: TPL[lang].music, ...s.music },
      priority: s.priority === "music" ? "music" : "game",
      idle: ["restore", "clear", "keep"].includes(s.idle) ? s.idle : DEFAULTS.idle,
    };
  }
  function setSettings(s) {
    store(K.settings, s);
    log("settings changed");
    pendingSince = 0;
    sync();
  }
  // only stores the keys you change, so defaults stay per language
  function patchSettings(fn) {
    const raw = load(K.settings) || {};
    fn(raw);
    setSettings(raw);
  }

  const stripParens = (t) => String(t ?? "").replace(/\s*[(\[][^()\[\]]*[)\]]/g, "").replace(/\s{2,}/g, " ").trim();
  const songName = (song, s = getSettings()) => (s.music.stripParens ? stripParens(song) || song : song);

  // over 50 chars: shorten the longest placeholder value, never the user's text
  function render(template, vars) {
    const used = Object.keys(vars).filter((k) => template.includes(`{${k}}`));
    const vals = Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, String(v ?? "")]));
    const fill = () => template.replace(/\{(\w+)\}/g, (m, k) => (k in vals ? vals[k] : m)).trim();
    let out = fill();
    while ([...out].length > MAX_LEN) {
      const k = used.filter((k) => vals[k].length > 1).sort((a, b) => vals[b].length - vals[a].length)[0];
      if (!k) return [...out].slice(0, MAX_LEN - 1).join("") + "…";
      const over = [...out].length - MAX_LEN;
      const chars = [...vals[k].replace(/…$/, "")];
      vals[k] = chars.slice(0, Math.max(1, chars.length - over - 1)).join("") + "…";
      out = fill();
    }
    return out;
  }

  const staticLength = (template, kind) =>
    [...PLACEHOLDERS[kind].reduce((t, k) => t.replaceAll(`{${k}}`, ""), template)].length;

  const me = () => mod("WAWebContactCollection")?.ContactCollection?.getMeContact?.();
  const ready = () =>
    !!(me() && mod("WAWebContactTextStatusBridge") && mod("WAWebTextStatusGatingUtils")?.sendTextStatusEnabled?.());

  function currentAbout() {
    const m = me();
    return {
      text: m.textStatusString ?? null,
      emoji: m.textStatusEmoji ?? null,
      duration: m.textStatusEphemeralDuration ?? null,
      expiresAt: m.textStatusExpiryTs ?? null,
    };
  }

  // same as WAWebTextStatusAction.setMyTextStatus without the toast
  async function setAbout(text, emoji, duration) {
    const res = await mod("WAWebContactTextStatusBridge").setTextStatus(text, emoji || null, duration);
    if (res?.result !== "SUCCESS") throw new Error("WhatsApp refused the About update: " + JSON.stringify(res));
    mod("WAWebUpdateTextStatusForContact").updateTextStatusForContact({
      contactId: me().id,
      textString: text,
      emoji: emoji || null,
      ephemeralDuration: duration,
      newUpdateTime: !text && !emoji ? 0 : mod("WATimeUtils").unixTime(),
      source: "set-self",
    });
    lastWrite = Date.now();
  }
  const clearAbout = () =>
    setAbout(null, null, mod("WAWebEphemeralAboutDurationsUtils")?.defaultTextStatusEphemeralDuration ?? 86400);

  let activity;
  let backoffKey;
  let lastWrite = 0;
  let pendingKey, pendingSince = 0;
  let busy = false, loggedWaiting = false;

  function desired() {
    if (!activity) return null;
    const s = getSettings();
    const options = [];
    if (s.game.enabled && activity.game)
      options.push({ kind: "game", text: render(s.game.template, { game: activity.game }), emoji: s.game.emoji });
    if (s.music.enabled && activity.music)
      options.push({ kind: "music", text: render(s.music.template, { song: songName(activity.music.song, s), artist: activity.music.artist }), emoji: s.music.emoji });
    if (s.priority === "music") options.reverse();
    return options[0] ?? null;
  }

  async function applyActivity(want) {
    const key = want.text + "|" + (want.emoji || "");
    if (key === backoffKey) return;
    const cur = currentAbout();
    let applied = load(K.applied); // what we set last

    if (applied) {
      const expired = Date.now() - applied.at >= LIFETIME * 1000;
      if (cur.text !== applied.text && (cur.text || cur.emoji || !expired)) {
        log("About was changed by hand; leaving it alone until the activity changes");
        store(K.saved, undefined);
        store(K.applied, undefined);
        backoffKey = key;
        return;
      }
    }

    if (load(K.saved) === undefined) {
      store(K.saved, cur);
      log("saved previous About", cur);
    }

    const changed = !applied || applied.text !== want.text || (applied.emoji || "") !== (want.emoji || "");
    if (changed) {
      // wait for it to settle, and rate limit writes
      if (pendingKey !== key) { pendingKey = key; pendingSince = Date.now(); }
      if (Date.now() - pendingSince < SETTLE_MS || Date.now() - lastWrite < MIN_GAP_MS) return;
    } else if (Date.now() - applied.at < RENEW_MS) {
      return;
    }

    await setAbout(want.text, want.emoji, LIFETIME);
    store(K.applied, { text: want.text, emoji: want.emoji || "", at: Date.now() });
    log(`About -> ${want.emoji ? want.emoji + " " : ""}${want.text}`);
  }

  async function goIdle() {
    const prev = load(K.saved);
    const applied = load(K.applied);
    if (prev === undefined && !applied) return;
    const idle = getSettings().idle;
    const cur = currentAbout();
    // older versions didn't store what they set
    const stillOurs = applied ? cur.text === applied.text : cur.text !== (prev?.text ?? null);

    if (stillOurs && idle !== "keep") {
      const prevAlive = prev && (prev.text || prev.emoji) &&
        (prev.duration === -1 || (prev.expiresAt && prev.expiresAt > unixNow() + 60));
      if (idle === "restore" && prevAlive) {
        await setAbout(prev.text, prev.emoji, prev.duration === -1 ? -1 : prev.expiresAt - unixNow());
        log("About restored to", prev.text);
      } else {
        await clearAbout();
        log("About cleared");
      }
    }
    store(K.saved, undefined);
    store(K.applied, undefined);
    pendingKey = undefined;
  }

  async function sync() {
    if (busy || activity === undefined) return;
    if (!ready()) {
      if (!loggedWaiting) log("waiting for WhatsApp to finish loading");
      loggedWaiting = true;
      return;
    }
    if (loggedWaiting) { loggedWaiting = false; log("WhatsApp loaded, About control ready"); }

    busy = true;
    try {
      const want = desired();
      if (want) await applyActivity(want);
      else { backoffKey = undefined; await goIdle(); }
    } catch (e) {
      log("error:", e);
    } finally {
      busy = false;
    }
  }

  document.addEventListener("whatstauts:game", (e) => {
    try {
      const msg = JSON.parse(e.detail);
      const next = { game: msg.game ?? null, music: msg.music ?? null };
      if (JSON.stringify(next) !== JSON.stringify(activity)) log("activity:", next);
      activity = next;
    } catch { return; }
    sync();
  });
  setInterval(sync, 1_000);

  window.__whatstauts = {
    MAX_LEN, PLACEHOLDERS, DEFAULTS,
    getSettings, setSettings, patchSettings, render, staticLength, TPL, effLang, songName,
    activity: () => activity,
    preview: () => desired(),
  };
  document.dispatchEvent(new CustomEvent("whatstauts:ready"));
  log("page script loaded");
})();
