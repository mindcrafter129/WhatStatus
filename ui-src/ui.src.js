// Status page in WhatsApp's settings, built from WhatsApp's own markup. gen.py turns this into ext/ui.js
(() => {
  const W = window.__whatstatus;
  if (!W || window.__wtUi) return;

  const T = /*TEMPLATES*/null;

  const I18N = {
    en: { title: "Status", gap: "Time between updates", gapWarn: "Under {n} s raises the risk of a ban", parens: "Hide brackets in song names", parensDesc: "“Song (Remastered)” shows as “Song”", sub: "Game and music in your About", back: "Back", game: "Game status", gameDesc: "Show the game you are playing",
      music: "Spotify status", musicDesc: "Show what you are listening to", gameText: "Game text", musicText: "Spotify text", text: "Text", insert: "Insert",
      reset: "Reset", priority: "When both are active", pGame: "Game", pMusic: "Music", idle: "When nothing is playing", iRestore: "Restore my About",
      iClear: "Clear it", iKeep: "Leave it", language: "Language", auto: "Automatic", now: "Your About right now", none: "Nothing is playing",
      limit: "WhatsApp allows 50 characters. Names are shortened to fit, your own words never are." },
    es: { title: "Estado", gap: "Tiempo entre actualizaciones", gapWarn: "Menos de {n} s aumenta el riesgo de bloqueo", parens: "Ocultar paréntesis en canciones", parensDesc: "“Canción (Remasterizada)” se muestra como “Canción”", sub: "Juego y música en tu Info", back: "Atrás", game: "Estado de juego", gameDesc: "Muestra el juego al que juegas",
      music: "Estado de Spotify", musicDesc: "Muestra lo que estás escuchando", gameText: "Texto del juego", musicText: "Texto de Spotify", text: "Texto", insert: "Insertar",
      reset: "Restablecer", priority: "Si hay ambos activos", pGame: "Juego", pMusic: "Música", idle: "Cuando no hay nada", iRestore: "Restaurar mi Info",
      iClear: "Borrarla", iKeep: "Dejarla", language: "Idioma", auto: "Automático", now: "Tu Info ahora mismo", none: "No hay nada en marcha",
      limit: "WhatsApp permite 50 caracteres. Los nombres se acortan para que quepan, tus palabras nunca." },
    fr: { title: "Statut", gap: "Délai entre les mises à jour", gapWarn: "Moins de {n} s augmente le risque de bannissement", parens: "Masquer les parenthèses des titres", parensDesc: "« Titre (Remasterisé) » devient « Titre »", sub: "Jeu et musique dans ton Actu", back: "Retour", game: "Statut de jeu", gameDesc: "Affiche le jeu auquel tu joues",
      music: "Statut Spotify", musicDesc: "Affiche ce que tu écoutes", gameText: "Texte du jeu", musicText: "Texte Spotify", text: "Texte", insert: "Insérer",
      reset: "Réinitialiser", priority: "Si les deux sont actifs", pGame: "Jeu", pMusic: "Musique", idle: "Quand rien ne joue", iRestore: "Restaurer mon Actu",
      iClear: "L’effacer", iKeep: "La laisser", language: "Langue", auto: "Automatique", now: "Ton Actu en ce moment", none: "Rien en cours",
      limit: "WhatsApp autorise 50 caractères. Les noms sont raccourcis pour tenir, jamais tes mots." },
    ca: { title: "Estat", gap: "Temps entre actualitzacions", gapWarn: "Menys de {n} s augmenta el risc de bloqueig", parens: "Amaga els parèntesis de les cançons", parensDesc: "“Cançó (Remasteritzada)” es mostra com “Cançó”", sub: "Joc i música a la teva Info", back: "Enrere", game: "Estat del joc", gameDesc: "Mostra el joc al qual jugues",
      music: "Estat de Spotify", musicDesc: "Mostra el que estàs escoltant", gameText: "Text del joc", musicText: "Text de Spotify", text: "Text", insert: "Insereix",
      reset: "Restableix", priority: "Si tots dos són actius", pGame: "Joc", pMusic: "Música", idle: "Quan no hi ha res", iRestore: "Restaura la meva Info",
      iClear: "Esborra-la", iKeep: "Deixa-la", language: "Idioma", auto: "Automàtic", now: "La teva Info ara mateix", none: "No hi ha res en marxa",
      limit: "WhatsApp permet 50 caràcters. Els noms s’abreugen perquè càpiguen, les teves paraules mai." },
  };
  const tr = (k) => (I18N[W.effLang()] || I18N.en)[k] ?? I18N.en[k];
  const LANG_NAMES = { en: "English", es: "Español", fr: "Français", ca: "Català" };

  const parse = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  let uid = 0;
  const nextId = () => "wt-" + ++uid;

  // whatsapp's icon components return plain svg element trees
  function waIcon(title) {
    const NS = "http://www.w3.org/2000/svg";
    try {
      const mod = "WDSIcon" + title.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("") + ".react";
      const build = (n) => {
        if (n == null || n === false) return null;
        if (typeof n !== "object") return document.createTextNode(String(n));
        if (typeof n.type === "function") return build(n.props?.children);
        const e = document.createElementNS(NS, n.type);
        for (const [k, v] of Object.entries(n.props || {})) {
          if (k === "children") continue;
          if (k === "className") { if (v) e.setAttribute("class", v); continue; }
          e.setAttribute(k, v);
        }
        for (const c of [].concat(n.props?.children ?? [])) { const d = build(c); if (d) e.append(d); }
        return e;
      };
      return build(window.require(mod)({}));
    } catch { return document.createElementNS(NS, "svg"); }
  }
  const fillIcons = (root) => root.querySelectorAll("i[data-wt-icon]").forEach((i) => i.replaceWith(waIcon(i.dataset.wtIcon)));

  const titleSpan = (row) => [...row.querySelectorAll("span")].find((s) => /--x-fontSize: 16px/.test(s.getAttribute("style") || ""));
  const subSpan = (row) => [...row.querySelectorAll("span")].find((s) => /--x-fontSize: 14px/.test(s.getAttribute("style") || ""));
  const setFirstText = (el, text) => { const n = [...el.childNodes].find((c) => c.nodeType === 3); n ? (n.textContent = text) : el.prepend(text); };

  function header(title, onBack) {
    const h = parse(T.header);
    h.querySelector("[data-testid]")?.removeAttribute("data-testid");
    const spans = h.querySelectorAll("h2 span");
    spans[spans.length - 1].textContent = title;
    const back = h.querySelector("button");
    back.setAttribute("aria-label", tr("back"));
    back.addEventListener("click", (e) => { e.preventDefault(); onBack(); });
    fillIcons(h);
    return h;
  }

  function chevronRow(title, sub, onClick) {
    const row = parse(T.rowChevron);
    row.removeAttribute("data-testid");
    row.style.paddingTop = "3px";
    setFirstText(titleSpan(row), title);
    subSpan(row).textContent = sub;
    row.addEventListener("click", onClick);
    row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } });
    fillIcons(row);
    return row;
  }
  const infoRow = (title, sub) => {
    const row = chevronRow(title, sub, () => {});
    row.removeAttribute("role"); row.style.cursor = "default";
    row.querySelectorAll("svg").forEach((s) => s.closest("span")?.remove());
    return row;
  };

  // toggling swaps whatsapp's on/off classes so it animates like theirs
  function switchRow(title, desc, on, change) {
    const row = parse(T.switchOn);
    const offRow = parse(T.switchOff);
    const id = nextId();
    const label = row.querySelector("label");
    const input = row.querySelector("input");
    const box = row.querySelector("[data-testid^='options-']");
    const offBox = offRow.querySelector("[data-testid^='option']");
    box.removeAttribute("data-testid");
    const onCls = [...box.querySelectorAll("*")].map((e) => e.className);
    const offCls = [...offBox.querySelectorAll("*")].map((e) => e.className);
    setFirstText(label, title);
    const d = subSpan(label);
    desc ? (d.textContent = desc) : label.querySelector("div")?.remove();
    label.setAttribute("for", id); input.id = id; input.setAttribute("aria-label", title);
    let state = on;
    const apply = () => {
      [...box.querySelectorAll("*")].forEach((e, i) => { if (typeof e.className === "string") e.className = (state ? onCls : offCls)[i] ?? e.className; });
      input.checked = state; input.setAttribute("aria-checked", String(state));
    };
    apply();
    row.addEventListener("click", (e) => { e.preventDefault(); state = !state; apply(); change(state); });
    return row;
  }

  function radioGroup(options, current, pick) {
    const group = parse(T.groupOpen);
    const name = nextId();
    const labels = options.map(([value, text]) => {
      const mk = (on) => {
        const l = parse(on ? T.radioOn : T.radioOff);
        const id = nextId();
        l.querySelector("[data-testid=radio-label-text]").id = id;
        const input = l.querySelector("input");
        input.setAttribute("aria-labelledby", id); input.name = name; input.value = value;
        setFirstText(l.querySelector("[data-testid=radio-label-text]"), text);
        return l;
      };
      return { value, on: mk(true), off: mk(false) };
    });
    const paint = (cur) => labels.forEach((l) => { const target = l.value === cur ? l.on : l.off; if (l.node !== target) { l.node.replaceWith(target); l.node = target; } });
    labels.forEach((l) => { const first = l.value === current ? l.on : l.off; l.node = first; group.append(first); });
    group.addEventListener("click", (e) => {
      const hit = labels.find((l) => l.node.contains(e.target));
      if (!hit) return;
      e.preventDefault();
      current = hit.value; paint(current); pick(hit.value);
    });
    return group;
  }

  const STYLE = document.createElement("style");
  STYLE.textContent = `
    @keyframes wt-slide{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:none}}
    @keyframes wt-slide-back{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:none}}
    @keyframes wt-out{to{opacity:0;transform:translateX(28px)}}
    .wt-in{animation:wt-slide .22s cubic-bezier(.2,.8,.2,1)}
    .wt-back{animation:wt-slide-back .22s cubic-bezier(.2,.8,.2,1)}
    .wt-closing{animation:wt-out .16s cubic-bezier(.4,0,1,1) forwards;pointer-events:none}
    .wt-edit{padding:14px 33px 18px;color:var(--WDS-content-default,#fafafa)}
    .wt-lab{font-size:14px;color:var(--WDS-neutral-gray-400,#959393);margin-bottom:6px}
    .wt-field{display:flex;align-items:center;gap:10px;border-bottom:2px solid var(--WDS-neutral-gray-700,#424445);padding:6px 0 8px;transition:border-color .15s}
    .wt-field:focus-within{border-bottom-color:var(--input-border-active,#21c063)}
    .wt-field input{flex:1;min-width:0;background:transparent!important;border:0!important;outline:0!important;box-shadow:none!important;border-radius:0!important;padding:0!important;color:inherit;font:inherit;font-size:17px}
    .wt-field:focus-within,.wt-field input:focus,.wt-field input:focus-visible{outline:0!important;box-shadow:none!important}
    .wt-cnt{font-size:13px;color:var(--WDS-neutral-gray-400,#959393);font-variant-numeric:tabular-nums}.wt-cnt.bad{color:#f15c6d}
    .wt-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;align-items:center}
    .wt-chip{border:1px solid var(--WDS-neutral-gray-700,#424445);background:transparent;color:var(--input-border-active,#21c063);border-radius:16px;padding:5px 12px;font:inherit;font-size:14px;cursor:pointer;transition:background .15s}
    .wt-chip:hover{background:rgba(33,192,99,.12)}.wt-link{margin-left:auto;background:transparent;border:0;color:var(--WDS-neutral-gray-400,#959393);font:inherit;font-size:14px;cursor:pointer}
    .wt-link:hover{color:var(--WDS-content-default,#fafafa)}.wt-note{margin:4px 20px 0;font-size:13px;line-height:1.45;color:var(--WDS-neutral-gray-400,#959393)}
    .wt-slider{padding:0 20px 14px}
    .wt-range{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:2px;margin:6px 0 4px;cursor:pointer;outline:none;
      background:linear-gradient(to right,var(--input-border-active,#21c063) var(--p),var(--WDS-neutral-gray-700,#424445) var(--p))}
    .wt-range.bad{background:linear-gradient(to right,#f15c6d var(--p),var(--WDS-neutral-gray-700,#424445) var(--p))}
    .wt-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--input-border-active,#21c063);border:0;transition:transform .15s,background .15s}
    .wt-range.bad::-webkit-slider-thumb{background:#f15c6d}
    .wt-range:active::-webkit-slider-thumb{transform:scale(1.2)}
    .wt-warn{font-size:13px;color:#f15c6d;min-height:18px;margin-top:4px}
    .wt-bad{color:#f15c6d!important}
    .wt-pv{margin-top:4px;font-size:16px;color:var(--WDS-content-default,#fafafa)}`;
  document.head.append(STYLE);

  let pane = null, listPane = null;
  const stack = [];
  const nav = {
    push(page) { stack.push(page); draw("in"); },
    pop() { stack.pop(); stack.length ? draw("back") : close(true); },
  };
  const samples = () => {
    const a = W.activity() || {};
    return { game: a.game || "MOUSE: P.I. For Hire", song: W.songName(a.music?.song || "Good Mouse (From the MOUSE: P.I. FOR HIRE Soundtrack)"), artist: a.music?.artist || "Caravan Palace" };
  };
  const shell = (title, ...sections) => shellWith(T.bodyOpen1, T.bodyOpen2, title, sections);
  const radioShell = (title, ...sections) => shellWith(T.radioBody1, T.radioBody2, title, sections);
  const shellWith = (b1, b2, title, sections) => {
    const body = parse(b1), inner = parse(b2);
    body.append(inner); inner.append(...sections);
    return [header(title, nav.pop), body];
  };
  const section = (...rows) => { const s = parse(T.sectionOpen); s.append(...rows); return s; };
  const withSeps = (rows) => rows.flatMap((r, i) => (i < rows.length - 1 ? [r, parse(T.rowSep)] : [r]));
  const divider = () => parse(T.switchDivider);
  const gap = () => { const g = document.createElement("div"); g.style.height = "10px"; return g; };

  function gapSlider() {
    const W0 = W.getSettings().gap;
    const row = infoRow(tr("gap"), "");
    const range = document.createElement("input");
    range.type = "range"; range.className = "wt-range";
    range.min = W.GAP_MIN; range.max = W.GAP_MAX; range.step = 5; range.value = W0;
    range.setAttribute("aria-label", tr("gap"));
    const warn = document.createElement("div"); warn.className = "wt-warn";
    const paint = () => {
      const v = Number(range.value), bad = v < W.GAP_SAFE;
      subSpan(row).textContent = `${v} s`;
      subSpan(row).classList.toggle("wt-bad", bad);
      range.classList.toggle("bad", bad);
      range.style.setProperty("--p", ((v - W.GAP_MIN) / (W.GAP_MAX - W.GAP_MIN)) * 100 + "%");
      warn.textContent = bad ? tr("gapWarn").replace("{n}", W.GAP_SAFE) : "";
    };
    range.addEventListener("input", paint);
    range.addEventListener("change", () => W.patchSettings((r) => { r.gap = Number(range.value); }));
    paint();
    const box = document.createElement("div"); box.className = "wt-slider";
    box.append(range, warn);
    return [row, box];
  }

  function aboutNow() {
    const p = W.preview();
    return p ? `${p.emoji ? p.emoji + " " : ""}${p.text}` : tr("none");
  }

  function mainPage() {
    const s = W.getSettings();
    const set = (fn) => W.patchSettings(fn);
    const sw = parse(T.switchSectionOpen);
    sw.append(
      switchRow(tr("game"), tr("gameDesc"), s.game.enabled, (v) => set((r) => { r.game = { ...(r.game || {}), enabled: v }; })),
      switchRow(tr("music"), tr("musicDesc"), s.music.enabled, (v) => set((r) => { r.music = { ...(r.music || {}), enabled: v }; })),
      switchRow(tr("parens"), tr("parensDesc"), s.music.stripParens, (v) => { set((r) => { r.music = { ...(r.music || {}), stripParens: v }; }); setTimeout(() => draw(null), 0); }));
    const smp = samples();
    const prev = infoRow(tr("now"), aboutNow());
    prev.dataset.wtPreview = "1";
    const rows = [
      chevronRow(tr("gameText"), W.render(s.game.template, { game: smp.game }), () => nav.push(() => textPage("game"))),
      chevronRow(tr("musicText"), W.render(s.music.template, { song: smp.song, artist: smp.artist }), () => nav.push(() => textPage("music"))),
      chevronRow(tr("priority"), s.priority === "music" ? tr("pMusic") : tr("pGame"), () => nav.push(() => choicePage("priority"))),
      chevronRow(tr("idle"), { restore: tr("iRestore"), clear: tr("iClear"), keep: tr("iKeep") }[s.idle], () => nav.push(() => choicePage("idle"))),
      chevronRow(tr("language"), s.lang === "auto" ? tr("auto") : LANG_NAMES[s.lang], () => nav.push(() => choicePage("language"))),
    ];
    return shell(tr("title"), sw, section(divider(), gap(), ...withSeps(rows)), section(divider(), gap(), ...gapSlider()), section(divider(), gap(), prev));
  }

  function choicePage(kind) {
    const s = W.getSettings();
    const defs = {
      priority: { title: tr("priority"), opts: [["game", tr("pGame")], ["music", tr("pMusic")]], cur: s.priority, set: (v) => W.patchSettings((r) => { r.priority = v; }) },
      idle: { title: tr("idle"), opts: [["restore", tr("iRestore")], ["clear", tr("iClear")], ["keep", tr("iKeep")]], cur: s.idle, set: (v) => W.patchSettings((r) => { r.idle = v; }) },
      language: { title: tr("language"), opts: [["auto", tr("auto")], ...Object.entries(LANG_NAMES)], cur: s.lang,
        set: (v) => { W.patchSettings((r) => { v === "auto" ? delete r.lang : (r.lang = v); }); setTimeout(() => draw(null), 0); } },
    }[kind];
    const group = radioGroup(defs.opts, defs.cur, defs.set);
    return radioShell(defs.title, group);
  }

  function textPage(kind) {
    const s = W.getSettings()[kind];
    const smp = samples();
    const vars = kind === "game" ? { game: smp.game } : { song: smp.song, artist: smp.artist };
    const el = document.createElement("div");
    el.className = "wt-edit";
    const input = document.createElement("input");
    input.type = "text"; input.value = s.template; input.spellcheck = false; input.setAttribute("aria-label", tr("text"));
    const cnt = document.createElement("span"); cnt.className = "wt-cnt";
    const preview = infoRow(tr("now"), "");
    const update = () => {
      const out = W.render(input.value, vars), n = [...out].length;
      cnt.textContent = `${n}/50`;
      cnt.classList.toggle("bad", n >= 50 || W.staticLength(input.value, kind) >= 45);
      subSpan(preview).textContent = out;
    };
    input.addEventListener("input", () => {
      let v = input.value;
      while (W.staticLength(v, kind) > W.MAX_LEN - 1) v = [...v].slice(0, -1).join("");
      if (v !== input.value) input.value = v;
      W.patchSettings((r) => { r[kind] = { ...(r[kind] || {}), template: v.trim() ? v : undefined }; });
      update();
    });
    const lab = document.createElement("div"); lab.className = "wt-lab"; lab.textContent = tr("text");
    const field = document.createElement("label"); field.className = "wt-field"; field.append(input, cnt);
    const chips = document.createElement("div"); chips.className = "wt-chips";
    for (const k of W.PLACEHOLDERS[kind]) {
      const b = document.createElement("button"); b.type = "button"; b.className = "wt-chip"; b.textContent = `{${k}}`;
      b.addEventListener("click", () => { input.focus(); document.execCommand("insertText", false, `{${k}}`); input.dispatchEvent(new Event("input")); });
      chips.append(b);
    }
    const reset = document.createElement("button"); reset.type = "button"; reset.className = "wt-link"; reset.textContent = tr("reset");
    reset.addEventListener("click", () => { W.patchSettings((r) => { if (r[kind]) delete r[kind].template; }); input.value = W.getSettings()[kind].template; update(); });
    chips.append(reset);
    el.append(lab, field, chips);
    const note = document.createElement("p"); note.className = "wt-note"; note.textContent = tr("limit");
    update();
    setTimeout(() => { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }, 50);
    return shell(tr(kind === "game" ? "gameText" : "musicText"), el, section(divider(), gap(), preview, note));
  }

  function draw(anim = "in") {
    if (!pane) return;
    const [head, body] = stack[stack.length - 1]();
    pane.replaceChildren(head, body);
    if (anim) body.classList.add(anim === "back" ? "wt-back" : "wt-in");
  }

  const place = () => {
    if (!pane || !listPane) return;
    const r = listPane.getBoundingClientRect();
    Object.assign(pane.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
  };
  const onPointer = (e) => {
    if (!pane || pane.contains(e.target)) return;
    // clicking outside the page means the user left settings
    close();
  };
  const onKey = (e) => { if (e.key === "Escape" && pane && !e.defaultPrevented) { e.stopPropagation(); nav.pop(); } };

  function open() {
    if (pane) return;
    const row = document.querySelector("[data-wt-row]");
    // settings pane = outermost pane-sized ancestor
    let list = null;
    for (let e = row; e && e !== document.body; e = e.parentElement) {
      const r = e.getBoundingClientRect();
      if (r.width >= 760) break;
      if (r.width > 500 && r.height > 800) list = e;
    }
    if (!list) return;
    listPane = list;
    pane = parse(T.paneOpen);
    pane.classList.add("wt-pane");
    // first solid background behind the row, works for light and dark
    let bg = "";
    for (let e = row; e && !bg; e = e.parentElement) {
      const c = getComputedStyle(e).backgroundColor;
      if (c && c !== "transparent" && !/rgba\(.*,\s*0\)$/.test(c)) bg = c;
    }
    bg ||= getComputedStyle(document.body).backgroundColor;
    // fixed at the top level so nothing in whatsapp's layout covers it
    pane.style.cssText += `;position:fixed;z-index:2147483000;pointer-events:auto;background:${bg}`;
    document.body.append(pane);
    place();
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("resize", place);
    stack.length = 0; stack.push(mainPage);
    draw();
  }
  function close(animated = false) {
    const p = pane;
    if (p && animated) { p.classList.add("wt-closing"); setTimeout(() => p.remove(), 170); } else p?.remove();
    pane = listPane = null; stack.length = 0;
    document.removeEventListener("keydown", onKey, true);
    document.removeEventListener("pointerdown", onPointer, true);
    window.removeEventListener("resize", place);
  }

  setInterval(() => {
    const row = pane?.querySelector("[data-wt-preview]");
    if (row) subSpan(row).textContent = aboutNow();
    if (pane && (!document.body.contains(listPane) || !listPane.getClientRects().length)) close(); else place();
  }, 1500);
  window.__wtUi = { open, close };

  // sidebar row, above "Help and feedback"
  function mountRow() {
    const mark = [...document.querySelectorAll("svg > title")].find((t) => t.textContent === "ic-help");
    const help = mark?.closest('[role="listitem"]');
    if (!help || help.previousElementSibling?.dataset?.wtRow) return;
    const row = help.cloneNode(true);
    row.dataset.wtRow = "1";
    const svg = row.querySelector("svg");
    svg.replaceWith(waIcon("ic-headphones"));
    const texts = [...row.querySelectorAll("span")].filter((s) => !s.children.length && s.textContent.trim());
    if (texts[0]) texts[0].textContent = tr("title");
    if (texts[1]) texts[1].textContent = tr("sub");
    row.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); open(); }, true);
    help.parentElement.insertBefore(row, help);
  }
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; try { mountRow(); } catch (e) { console.warn("[whatstatus] row:", e); } });
  }).observe(document.body, { childList: true, subtree: true });
  mountRow();
})();
