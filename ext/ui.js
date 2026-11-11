// Status page in WhatsApp's settings, built from WhatsApp's own markup. gen.py turns this into ext/ui.js
(() => {
  const W = window.__whatstauts;
  if (!W || window.__wtUi) return;

  const T = {"paneOpen": "<div class=\"x10l6tqk x13vifvy xtijo5x x1ey2m1c x1o0tod\" tabindex=\"-1\" style=\"display: flex; flex-direction: column;\"></div>", "header": "<header class=\"xyi3aci x570efc x9f619 x78zum5 x1okw0bk x6s0dn4 x1peatla x14ug900 x1280gxy x889kno x2vl965 x1a8lsjc xe2zdcy\"><div class=\"x78zum5 x1okw0bk x6s0dn4 xh8yej3 x14wi4xw xo1l8bm x14ug900 xexx8yu xyri2b x18d9i69 x1c1uobl\"><div class=\"x1okw0bk\"><div><span class=\"html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs x4k7w5x x1h91t0o x1h9r5lt x1jfb8zj xv2umb2 x1beo9mf xaigb6o x12ejxvf x3igimt xarpa2k xedcshv x1lytzrv x1t2pt76 x7ja8zs x1qrby5j\"><div class=\"x1n2onr6\"><button data-tab=\"2\" aria-label=\"Back\" aria-disabled=\"false\" tabindex=\"0\" type=\"button\" class=\"html-button xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x178xt8z x1lun4ml xso031l xpilrb4 xjb2p0i x1ejq31n x18oe1m7 x1sy0etr xstzfhl x1so62im x1syfmzz x1ja2u2z x1ypdohk x1s928wv x1j6awrg x1m1drc7 x1iygr5g x4eaejv x1wsn0xg x1r0yslu x2q1x1w xapdjt xr6f91l x5rv0tg x1akc3lz xikp0eg x1xl5mkn x1mfml39 x1l5mzlr xgmdoj8 x1f1wgk5 x1x3ic1u xjbqb8w xuwfzo9 x1wb366y xtnn1bt x9v5kkp xmw7ebm xrdum7p x2lah0s x1lliihq xk8lq53 x9f619 xt8t1vi x1xc408v x129tdwq x15urzxu x1vqgdyp x100vrsf x1n2onr6 x1cpjm7i x1hmns74 x1y3wzot xtyp5od xhq5o37 x1682cnc\"><div class=\"html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x78zum5 xdt5ytf\"><div class=\"html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x6s0dn4 x78zum5 x1q0g3np xh8yej3 xl56j7k\"><div class=\"html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x6s0dn4 x78zum5 x1vjfegm\"><span aria-hidden=\"true\" class=\"xxk0z11 xvy4d1p\"><i data-wt-icon=\"ic-arrow-back\"></i></span></div><div class=\"html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl xdt5ytf x6s0dn4 x78zum5 x1vjfegm x1c4vz4f\"></div></div></div></button></div></span></div></div><div data-testid=\"drawer-title-notifications\" class=\"x1iyjqo2 x6ikm8r x10wlt62 x1mzt3pk x6prxxf x1o2sk6j\"><h2 class=\"html-h2 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1vvkbs x1heor9g x1qlqyl8 x1pd3egz x1a2a7pz x193iq5w xeuugli\"><span class=\"x140p0ai x1gufx9m x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x193iq5w xeuugli x13faqbe x1vvkbs x1lliihq x1fj9vlw x14ug900 x13fj5qh x1hx0egp x1jchvi3 xjb2p0i xo1l8bm x17mssa0 x1ic7a3i xaopwdm\" style=\"--x-fontSize: 16px; --x-lineHeight: 11.375px; --x-8dd7yt: -0.0137em; --x-hxtmnb: 0.0137em;\"><span class=\"html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs x1lliihq x1plvlek xryxfnj x1n2onr6\"><span class=\"html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs x1lliihq x193iq5w x6ikm8r x10wlt62 xlyipyv xuxw1ft\">Notifications</span></span></span></h2></div></div></header>", "bodyOpen1": "<div class=\"x1n2onr6 xupqr0c x78zum5 x1r8uery x1iyjqo2 xdt5ytf x6ikm8r x1odjw0f x1hc1fzr x1anedsm\"></div>", "bodyOpen2": "<div></div>", "sectionOpen": "<div class=\"x1n2onr6 x1c4vz4f x2lah0s xdl72j9 xyorhqc x1280gxy xexx8yu x1pic42t x18d9i69 x1onr9mi\"></div>", "rowChevron": "<div aria-disabled=\"false\" role=\"button\" tabindex=\"0\" class=\"x1n2onr6 x78zum5 x2lah0s x6s0dn4 x1280gxy x1ubxc9n xbmkbis xlr9sxt xvvg52n xwd4zgb xq8v1ta x17gydlx x1jsj9aw xyri2b x1phvje8 x1tiyuxx x1nbhmlj x1wxaq2x xt7dq6l\" data-ignore-capture=\"any\" data-testid=\"li-show-notification-banner\"><div class=\"x9f619 x78zum5 x1iyjqo2 xs83m0k xdl72j9 x6s0dn4 x5yr21d x5zjp28 x1plvlek xryxfnj\"><div class=\"x1rdy4ex x6ikm8r x10wlt62 xlyipyv xuxw1ft\"><span class=\"\"><span class=\"x140p0ai x1gufx9m x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x193iq5w xeuugli x13faqbe x1vvkbs x1lliihq x1fj9vlw x14ug900 x1hx0egp x1jchvi3 xjb2p0i xo1l8bm x17mssa0 x1ic7a3i xaopwdm\" style=\"--x-fontSize: 16px; --x-lineHeight: 11.375px; --x-8dd7yt: -0.0137em; --x-hxtmnb: 0.0137em;\">Show notification banner<div class=\"\"><span class=\"x193iq5w xeuugli x13faqbe x1vvkbs xt0psk2 x1fj9vlw xhslqc4 x1hx0egp x1f6kntn xjb2p0i x8r4c90 xo1l8bm x1ic7a3i xaopwdm x12xpedu\" style=\"--x-fontSize: 14px; --x-lineHeight: 9.9531px;\">Always</span></div></span></span></div><div class=\"x10l6tqk x67dgr1\"><span aria-hidden=\"true\"><i data-wt-icon=\"ic-chevron-right\"></i></span></div></div></div>", "rowSep": "<div class=\"xdx6fka xvtqlqk x1tiyuxx x1nbhmlj\"><div class=\"x178xt8z x13fuv20 xx42vgk\"></div></div>", "switchSectionOpen": "<div class=\"x1n2onr6 x1c4vz4f x2lah0s xdl72j9 xyorhqc x1280gxy xexx8yu x5zjp28 x18d9i69 x162tt16\"></div>", "switchDivider": "<div class=\"x178xt8z x13fuv20 xx42vgk\"></div>", "switchOn": "<div role=\"button\" tabindex=\"0\" data-tab=\"3\" class=\"x78zum5 x6s0dn4 x1p57kb1 xvpt6g3 x6prxxf x1fc57z9\"><label class=\"x78zum5 xdt5ytf xl56j7k x1iyjqo2 xs83m0k x1r8uery x19991ni x1d8287x xwji4o3\" for=\"msg-previews\">Show previews<div class=\"\"><span class=\"x140p0ai x1gufx9m x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x193iq5w xeuugli x13faqbe x1vvkbs x1lliihq x1fj9vlw xhslqc4 x1hx0egp x1f6kntn xjb2p0i x8r4c90 xo1l8bm x1ic7a3i xaopwdm x12xpedu\" style=\"--x-fontSize: 14px; --x-lineHeight: 9.9531px; --x-8dd7yt: -0.0137em; --x-hxtmnb: 0.0137em;\">Preview message text inside message notifications.</span></div></label><div data-testid=\"options-msg-previews\" class=\"x78zum5 x1c4vz4f x2lah0s xdl72j9 x6s0dn4 x6pxu1d x19991ni x1d8287x xwji4o3\"><div class=\"x1a2a7pz x6nvzda x4i4b9w xhl9efl xj65ea0 x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1rg5ohu xjwf9q1 x1fns5xo x6ikm8r x10wlt62 xexx8yu xyri2b x18d9i69 x1c1uobl x1n2onr6 xzkaem6 x1nkjj8i xnnj0qo x1fpiwec x1xp25i xfn3atn\"><div class=\"x1ja2u2z xgcd1z6 x1ey2m1c x9f619 xtijo5x x1o0tod x10l6tqk x13vifvy x1pyc6se x1mlb2bo x16pkwpw xqe4bef xamhcws x1alpsbp xlxy82 xyumdvf x6nvzda x4i4b9w xhl9efl xj65ea0 x1ejq31n x18oe1m7 x1sy0etr xstzfhl\"></div><div class=\"x9f619 x1ja2u2z x6nvzda x4i4b9w xhl9efl xj65ea0 x10l6tqk xx9udhw xd00j3c xndqk7f xlup9mm x1kky2od xep993w x1igoeyj x1i4sgur x15481yp\"></div><input class=\"x1i10hfl x9f619 xggy1nq xtpw4lu x1tutvks x1s3xk63 x1s07b3s x1ypdohk x5yr21d x1o0tod xdj266r x14z9mp xat24cr x1lziwak x1w3u9th x1a2a7pz xexx8yu xyri2b x18d9i69 x1c1uobl x10l6tqk x13vifvy xh8yej3\" dir=\"ltr\" aria-label=\"Show previews\" tabindex=\"-1\" id=\"msg-previews\" aria-checked=\"true\" role=\"switch\" type=\"checkbox\" checked=\"\"></div></div></div>", "switchOff": "<div role=\"button\" tabindex=\"0\" data-tab=\"3\" class=\"x78zum5 x6s0dn4 x1p57kb1 xvpt6g3 x6prxxf x1fc57z9\"><label class=\"x78zum5 xdt5ytf xl56j7k x1iyjqo2 xs83m0k x1r8uery x19991ni x1d8287x xwji4o3\" for=\"outgoing-message-sound\">Play sound for outgoing messages</label><div data-testid=\"option-outgoing-message-sound\" class=\"x78zum5 x1c4vz4f x2lah0s xdl72j9 x6s0dn4 x6pxu1d x19991ni x1d8287x xwji4o3\"><div class=\"x1a2a7pz x1h3rtpe x6nvzda x4i4b9w xhl9efl xj65ea0 x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1rg5ohu xjwf9q1 x1fns5xo x6ikm8r x10wlt62 xexx8yu xyri2b x18d9i69 x1c1uobl x1n2onr6 xzkaem6 x1nkjj8i xnnj0qo x1fpiwec x1xp25i\"><div class=\"x1ja2u2z xgcd1z6 x1ey2m1c x9f619 xtijo5x x1o0tod x10l6tqk x13vifvy x1pyc6se x1mlb2bo x16pkwpw xqe4bef xamhcws x1alpsbp xlxy82 xyumdvf x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x6nvzda x4i4b9w xhl9efl xj65ea0\"></div><div class=\"x9f619 x1ja2u2z xs7vtfe x6nvzda x4i4b9w xhl9efl xj65ea0 x1kpxq89 xsmyaan xrr41r3 xnro73h x1atx4j1 x10l6tqk xx9udhw xd00j3c\"></div><input class=\"x1i10hfl x9f619 xggy1nq xtpw4lu x1tutvks x1s3xk63 x1s07b3s x1ypdohk x5yr21d x1o0tod xdj266r x14z9mp xat24cr x1lziwak x1w3u9th x1a2a7pz xexx8yu xyri2b x18d9i69 x1c1uobl x10l6tqk x13vifvy xh8yej3\" dir=\"ltr\" aria-label=\"Outgoing sounds. Play sounds for outgoing messages\" tabindex=\"-1\" id=\"outgoing-message-sound\" aria-checked=\"false\" role=\"switch\" type=\"checkbox\"></div></div></div>", "groupOpen": "<div class=\"x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 xdt5ytf x1cy8zhl\" role=\"radiogroup\"></div>", "radioOn": "<label class=\"x78zum5 x6s0dn4 x1ypdohk x1ubxc9n xyi3aci xwf5gio x1p453bz x1suzm8a x9f619 x1jchvi3 xbktkl8 x12w63v0 x1nzty39 xh8yej3 x889kno x1a8lsjc\" data-testid=\"radio-label\"><div class=\"x1nkjj8i xnnj0qo x1fpiwec x1xp25i x5u8xuz x1fvlugl x3k5jh2 xlybztc\"><div class=\"x9f619 x1ja2u2z x1n2onr6 x1a2a7pz xxk0z11 xvy4d1p x78zum5 x6s0dn4 xl56j7k\"><div class=\"x1n2onr6 x1ja2u2z x9f619 xisnujt xt4ypqs xt8t1vi x1xc408v x129tdwq x15urzxu xamhcws x1alpsbp xlxy82 xyumdvf x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x78zum5 x6s0dn4 xl56j7k xlze6vy x47fsot x1rrvw3c x18djku1\"><div class=\"x9f619 x1n2onr6 x1ja2u2z x1c87fqo x1q6aqyx xfn3atn xt8t1vi x1xc408v x129tdwq x15urzxu\"></div></div><input class=\"x1i10hfl x9f619 xggy1nq xtpw4lu x1tutvks x1s3xk63 x1s07b3s x1ypdohk x5yr21d x1o0tod xdj266r x14z9mp xat24cr x1lziwak x1w3u9th x1a2a7pz xexx8yu xyri2b x18d9i69 x1c1uobl x10l6tqk x13vifvy xh8yej3\" dir=\"ltr\" aria-labelledby=\"_r_2m_\" aria-checked=\"true\" tabindex=\"0\" type=\"radio\" value=\"Always\" checked=\"\" name=\"radio-show-notification-banner\"></div></div><span class=\"x132q4wb x1rg5ohu x1phvje8\" id=\"_r_2m_\" data-testid=\"radio-label-text\">Always<div class=\"\"><span class=\"x140p0ai x1gufx9m x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x193iq5w xeuugli x13faqbe x1vvkbs x1lliihq x1fj9vlw xhslqc4 x1hx0egp x1f6kntn xjb2p0i x8r4c90 xo1l8bm x1ic7a3i xaopwdm x12xpedu\" style=\"--x-fontSize: 14px; --x-lineHeight: 9.9531px; --x-8dd7yt: -0.0137em; --x-hxtmnb: 0.0137em;\"></span></div></span></label>", "radioOff": "<label class=\"x78zum5 x6s0dn4 x1ypdohk x1ubxc9n xyi3aci xwf5gio x1p453bz x1suzm8a x9f619 x1jchvi3 xbktkl8 x12w63v0 x1nzty39 xh8yej3 x889kno x1a8lsjc\" data-testid=\"radio-label\"><div class=\"x1nkjj8i xnnj0qo x1fpiwec x1xp25i x5u8xuz x1fvlugl x3k5jh2 xlybztc\"><div class=\"x9f619 x1ja2u2z x1n2onr6 x1a2a7pz xxk0z11 xvy4d1p x78zum5 x6s0dn4 xl56j7k\"><div class=\"x1n2onr6 x1ja2u2z x9f619 xisnujt xt4ypqs xt8t1vi x1xc408v x129tdwq x15urzxu xamhcws x1alpsbp xlxy82 xyumdvf x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x78zum5 x6s0dn4 xl56j7k x1pyc6se x1mlb2bo x16pkwpw xqe4bef\"></div><input class=\"x1i10hfl x9f619 xggy1nq xtpw4lu x1tutvks x1s3xk63 x1s07b3s x1ypdohk x5yr21d x1o0tod xdj266r x14z9mp xat24cr x1lziwak x1w3u9th x1a2a7pz xexx8yu xyri2b x18d9i69 x1c1uobl x10l6tqk x13vifvy xh8yej3\" dir=\"ltr\" aria-labelledby=\"_r_2n_\" aria-checked=\"false\" tabindex=\"-1\" type=\"radio\" value=\"Never\" name=\"radio-show-notification-banner\"></div></div><span class=\"x132q4wb x1rg5ohu x1phvje8\" id=\"_r_2n_\" data-testid=\"radio-label-text\">Never<div class=\"\"><span class=\"x140p0ai x1gufx9m x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x193iq5w xeuugli x13faqbe x1vvkbs x1lliihq x1fj9vlw xhslqc4 x1hx0egp x1f6kntn xjb2p0i x8r4c90 xo1l8bm x1ic7a3i xaopwdm x12xpedu\" style=\"--x-fontSize: 14px; --x-lineHeight: 9.9531px; --x-8dd7yt: -0.0137em; --x-hxtmnb: 0.0137em;\"></span></div></span></label>", "radioBody1": "<div class=\"x1n2onr6 xupqr0c x78zum5 x1r8uery x1iyjqo2 xdt5ytf x6ikm8r x1odjw0f x1hc1fzr x1anedsm\"></div>", "radioBody2": "<div class=\"x1n2onr6 x1c4vz4f x2lah0s xdl72j9 xyorhqc x1280gxy xexx8yu x5zjp28 x18d9i69 x162tt16\"></div>"};

  const I18N = {
    en: { title: "Status", parens: "Hide brackets in song names", parensDesc: "“Song (Remastered)” shows as “Song”", sub: "Game and music in your About", back: "Back", game: "Game status", gameDesc: "Show the game you are playing",
      music: "Spotify status", musicDesc: "Show what you are listening to", gameText: "Game text", musicText: "Spotify text", text: "Text", insert: "Insert",
      reset: "Reset", priority: "When both are active", pGame: "Game", pMusic: "Music", idle: "When nothing is playing", iRestore: "Restore my About",
      iClear: "Clear it", iKeep: "Leave it", language: "Language", auto: "Automatic", now: "Your About right now", none: "Nothing is playing",
      limit: "WhatsApp allows 50 characters. Names are shortened to fit, your own words never are." },
    es: { title: "Estado", parens: "Ocultar paréntesis en canciones", parensDesc: "“Canción (Remasterizada)” se muestra como “Canción”", sub: "Juego y música en tu Info", back: "Atrás", game: "Estado de juego", gameDesc: "Muestra el juego al que juegas",
      music: "Estado de Spotify", musicDesc: "Muestra lo que estás escuchando", gameText: "Texto del juego", musicText: "Texto de Spotify", text: "Texto", insert: "Insertar",
      reset: "Restablecer", priority: "Si hay ambos activos", pGame: "Juego", pMusic: "Música", idle: "Cuando no hay nada", iRestore: "Restaurar mi Info",
      iClear: "Borrarla", iKeep: "Dejarla", language: "Idioma", auto: "Automático", now: "Tu Info ahora mismo", none: "No hay nada en marcha",
      limit: "WhatsApp permite 50 caracteres. Los nombres se acortan para que quepan, tus palabras nunca." },
    fr: { title: "Statut", parens: "Masquer les parenthèses des titres", parensDesc: "« Titre (Remasterisé) » devient « Titre »", sub: "Jeu et musique dans ton Actu", back: "Retour", game: "Statut de jeu", gameDesc: "Affiche le jeu auquel tu joues",
      music: "Statut Spotify", musicDesc: "Affiche ce que tu écoutes", gameText: "Texte du jeu", musicText: "Texte Spotify", text: "Texte", insert: "Insérer",
      reset: "Réinitialiser", priority: "Si les deux sont actifs", pGame: "Jeu", pMusic: "Musique", idle: "Quand rien ne joue", iRestore: "Restaurer mon Actu",
      iClear: "L’effacer", iKeep: "La laisser", language: "Langue", auto: "Automatique", now: "Ton Actu en ce moment", none: "Rien en cours",
      limit: "WhatsApp autorise 50 caractères. Les noms sont raccourcis pour tenir, jamais tes mots." },
    ca: { title: "Estat", parens: "Amaga els parèntesis de les cançons", parensDesc: "“Cançó (Remasteritzada)” es mostra com “Cançó”", sub: "Joc i música a la teva Info", back: "Enrere", game: "Estat del joc", gameDesc: "Mostra el joc al qual jugues",
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
    return shell(tr("title"), sw, section(divider(), gap(), ...withSeps(rows)), section(divider(), gap(), prev));
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
    requestAnimationFrame(() => { queued = false; try { mountRow(); } catch (e) { console.warn("[whatstauts] row:", e); } });
  }).observe(document.body, { childList: true, subtree: true });
  mountRow();
})();
