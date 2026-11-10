/* Zvuková mapa – čtení z Supabase, zápis přes Edge Function s heslem třídy. */
(function () {
  "use strict";

  var SB_URL = "https://dtpncirocmozndsmysdh.supabase.co";
  var SB_KEY = "sb_publishable_VCBtsnWU53B7lOSpd205rw_UZbpUDD_";
  var FN_URL = SB_URL + "/functions/v1/zvukova-mapa-write";
  var BUCKET = "zvukova-mapa";
  var PW_KEY = "zvukovamapa:heslo";
  var EXAMPLE_IDS = {
    "11111111-1111-4111-8111-111111111111": true,
    "22222222-2222-4222-8222-222222222222": true,
    "33333333-3333-4333-8333-333333333333": true
  };
  var DEFAULT_ID = "11111111-1111-4111-8111-111111111111";
  var PRAGUE = [50.087, 14.42];
  var PHOTO_MAX = 2 * 1024 * 1024;
  var AUDIO_MAX = 5 * 1024 * 1024;

  var CATS = [
    { id: "mech", name: "Mechanické", color: "#C45C4A" },
    { id: "priroda", name: "Přírodní", color: "#3E8F5A" },
    { id: "lide", name: "Lidské", color: "#C9A227" },
    { id: "jine", name: "Jiné", color: "#3B7CB8" }
  ];
  var CAT = {};
  CATS.forEach(function (c) { CAT[c.id] = c; });

  var ICO = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 16.5V20h3.5L19 8.5 15.5 5 4 16.5z"/><path d="M13.2 7.3l3.5 3.5"/></svg>',
    photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13.5" rx="2.5"/><circle cx="9" cy="11" r="1.8"/><path d="M7.5 17.5l3.8-4 2.4 2.5 1.6-1.7 3.2 3.2"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h3.2L12 18V6L7.2 10H4z"/><path d="M16 9.2a4 4 0 0 1 0 5.6M18.7 7a7 7 0 0 1 0 10"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>'
  };

  var st = {
    places: [],
    selectedId: null,
    eventId: null,
    mode: "view",
    addLatLng: null,
    color: false,
    panelHidden: false,
    draft: null,
    rec: null,
    recFor: null,
    busy: false
  };
  var map, markers = {};
  var pendingClick = null;
  var toastTimer = 0;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function gc(name) {
    try {
      if (window.goatcounter && window.goatcounter.count)
        window.goatcounter.count({ path: name, title: name, event: true });
    } catch (e) {}
  }
  function $(id) { return document.getElementById(id); }
  function mediaUrl(path) {
    if (!path) return "";
    return SB_URL + "/storage/v1/object/public/" + BUCKET + "/" + path.split("/").map(encodeURIComponent).join("/");
  }
  function catOf(place) { return CAT[place.category] || CAT.jine; }
  function entriesOf(place) {
    var list = (place && place.timeline_entries) || [];
    return list.slice().sort(function (a, b) {
      return (a.sort - b.sort) || (a.year - b.year) || String(a.title).localeCompare(String(b.title), "cs");
    });
  }
  function selected() {
    return st.places.find(function (p) { return p.id === st.selectedId; }) || null;
  }
  function getPassword() {
    try { return sessionStorage.getItem(PW_KEY) || ""; } catch (e) { return ""; }
  }
  function setPassword(v) {
    try {
      if (v) sessionStorage.setItem(PW_KEY, v);
      else sessionStorage.removeItem(PW_KEY);
    } catch (e) {}
  }

  function toast(msg, ms) {
    var el = $("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, ms || 2800);
  }

  function restHeaders() {
    return { apikey: SB_KEY, Accept: "application/json" };
  }

  async function loadPlaces() {
    var url = SB_URL + "/rest/v1/places?select=*,timeline_entries(*)&order=created_at.asc";
    var res = await fetch(url, { headers: restHeaders() });
    if (!res.ok) throw new Error("Data se nepodařilo načíst.");
    st.places = await res.json();
  }

  async function write(payload) {
    var res = await fetch(FN_URL, {
      method: "POST",
      headers: { apikey: SB_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    var data = {};
    try { data = await res.json(); } catch (e) { data = {}; }
    if (res.status === 401) {
      setPassword("");
      var err = new Error(data.error || "Neplatné heslo třídy.");
      err.code = 401;
      throw err;
    }
    if (!res.ok || data.error) throw new Error(data.error || "Uložení se nezdařilo.");
    return data;
  }

  function askPassword() {
    return new Promise(function (resolve) {
      var existing = getPassword();
      if (existing) { resolve(existing); return; }
      var modal = $("pw-modal");
      var form = $("pw-form");
      var input = $("pw-input");
      var err = $("pw-err");
      var cancel = $("pw-cancel");
      err.hidden = true;
      err.textContent = "";
      input.value = "";
      modal.hidden = false;
      setTimeout(function () { input.focus(); }, 30);
      function done(val) {
        form.removeEventListener("submit", onSubmit);
        cancel.removeEventListener("click", onCancel);
        modal.removeEventListener("click", onBg);
        document.removeEventListener("keydown", onKey);
        modal.hidden = true;
        resolve(val);
      }
      function onSubmit(e) {
        e.preventDefault();
        var v = input.value.trim();
        if (!v) {
          err.textContent = "Zadejte heslo třídy.";
          err.hidden = false;
          return;
        }
        setPassword(v);
        done(v);
      }
      function onCancel(e) { e.preventDefault(); done(""); }
      function onBg(e) { if (e.target === modal) done(""); }
      function onKey(e) { if (e.key === "Escape") done(""); }
      form.addEventListener("submit", onSubmit);
      cancel.addEventListener("click", onCancel);
      modal.addEventListener("click", onBg);
      document.addEventListener("keydown", onKey);
    });
  }

  async function withPassword(fn) {
    var pw = await askPassword();
    if (!pw) return null;
    try {
      return await fn(pw);
    } catch (e) {
      if (e && e.code === 401) {
        toast("Neplatné heslo třídy.");
        pw = await askPassword();
        if (!pw) return null;
        try { return await fn(pw); }
        catch (e2) {
          if (e2 && e2.code === 401) toast("Neplatné heslo třídy.");
          else toast(e2.message || "Uložení se nezdařilo.");
          return null;
        }
      }
      toast(e.message || "Uložení se nezdařilo.");
      return null;
    }
  }

  /* ---------- map ---------- */
  function pinIcon(color, selected) {
    var size = selected ? 22 : 16;
    return L.divIcon({
      className: "zm-pin" + (selected ? " is-selected" : ""),
      html: "<span style=\"background:" + color + "\"></span>",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  function syncMarkers() {
    var seen = {};
    st.places.forEach(function (p) {
      seen[p.id] = true;
      var color = catOf(p).color;
      var sel = p.id === st.selectedId;
      if (markers[p.id]) {
        markers[p.id].setLatLng([p.lat, p.lng]);
        markers[p.id].setIcon(pinIcon(color, sel));
      } else {
        var m = L.marker([p.lat, p.lng], { icon: pinIcon(color, sel), title: p.title, riseOnHover: true });
        m.addTo(map);
        m.on("click", function (e) {
          L.DomEvent.stopPropagation(e);
          if (st.mode === "add") return;
          selectPlace(p.id);
          showPanel(true);
        });
        markers[p.id] = m;
      }
    });
    Object.keys(markers).forEach(function (id) {
      if (!seen[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
      }
    });
  }

  function initMap() {
    map = L.map("map", {
      center: PRAGUE,
      zoom: 14,
      zoomControl: true,
      attributionControl: true
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
    }).addTo(map);
    map.on("click", function (e) {
      if (st.mode === "add") {
        st.addLatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
        openForm("add");
        showPanel(true);
      }
    });
    var legend = $("legend");
    legend.innerHTML = CATS.map(function (c) {
      return "<div class=\"zm-legend__row\"><span class=\"zm-dot\" style=\"background:" + c.color + "\"></span>" + esc(c.name) + "</div>";
    }).join("");
    setTimeout(function () { map.invalidateSize(); }, 80);
  }

  function setColor(on) {
    st.color = !!on;
    document.body.classList.toggle("is-color", st.color);
    $("btn-color").setAttribute("aria-pressed", st.color ? "true" : "false");
    $("btn-color").textContent = st.color ? "Šedá mapa" : "Barevná mapa";
  }

  function showPanel(on) {
    st.panelHidden = !on;
    $("panel").classList.toggle("is-hidden", !on);
    $("btn-panel").textContent = on ? "Skrýt panel" : "Zobrazit panel";
    $("btn-panel").setAttribute("aria-pressed", on ? "true" : "false");
    setTimeout(function () { if (map) map.invalidateSize(); }, 80);
  }

  function setAddMode(on) {
    if (on) {
      st.mode = "add";
      st.addLatLng = null;
      st.draft = null;
      map.getContainer().classList.add("leaflet-crosshair");
      $("btn-add").setAttribute("aria-pressed", "true");
      toast("Klikněte do mapy.");
    } else {
      if (st.mode === "add") st.mode = st.selectedId ? "view" : "view";
      map.getContainer().classList.remove("leaflet-crosshair");
      $("btn-add").setAttribute("aria-pressed", "false");
    }
  }

  function selectPlace(id, eventId) {
    st.selectedId = id;
    var p = selected();
    var evs = entriesOf(p);
    st.eventId = eventId || (evs.length ? evs[evs.length - 1].id : null);
    if (st.mode !== "add") st.mode = "view";
    syncMarkers();
    renderPanel();
  }

  /* ---------- media helpers ---------- */
  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function compressPhoto(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var max = 1200, w = img.naturalWidth, h = img.naturalHeight;
        if (w > max || h > max) {
          if (w > h) { h = Math.round(h * max / w); w = max; }
          else { w = Math.round(w * max / h); h = max; }
        }
        var canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        var q = 0.82, data = canvas.toDataURL("image/jpeg", q);
        var bytes = Math.round(data.length * 0.75);
        while (bytes > PHOTO_MAX && q > 0.5) {
          q -= 0.1;
          data = canvas.toDataURL("image/jpeg", q);
          bytes = Math.round(data.length * 0.75);
        }
        if (bytes > PHOTO_MAX) {
          reject(new Error("Fotografie je i po zmenšení větší než 2 MB."));
          return;
        }
        var warn = bytes > 1.2 * 1024 * 1024 ? "Fotografie je poměrně velká (" + (bytes / 1048576).toFixed(1) + " MB)." : "";
        resolve({ mime: "image/jpeg", data: data, preview: data, warn: warn, bytes: bytes });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("Obrázek se nepodařilo načíst."));
      };
      img.src = url;
    });
  }

  async function prepareAudio(file) {
    if (file.size > AUDIO_MAX) throw new Error("Nahrávka je větší než 5 MB.");
    var data = await fileToDataUrl(file);
    var warn = file.size > 3 * 1024 * 1024 ? "Nahrávka je poměrně velká (" + (file.size / 1048576).toFixed(1) + " MB)." : "";
    return { mime: file.type || "audio/webm", data: data, preview: data, warn: warn, bytes: file.size };
  }

  function pickMime() {
    if (!window.MediaRecorder) return "";
    var types = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/aac"];
    for (var i = 0; i < types.length; i++) {
      if (MediaRecorder.isTypeSupported(types[i])) return types[i];
    }
    return "";
  }

  async function startRec(target) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast("Mikrofon v tomto prohlížeči není dostupný.");
      return;
    }
    if (st.rec) stopRec(true);
    var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    var mime = pickMime();
    var rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    var chunks = [];
    rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = async function () {
      stream.getTracks().forEach(function (t) { t.stop(); });
      st.rec = null;
      var blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
      try {
        var media = await prepareAudio(new File([blob], "nahravka." + ((rec.mimeType || "").indexOf("mp4") >= 0 ? "m4a" : "webm"), { type: blob.type }));
        applyMedia(target, "audio", media);
      } catch (e) {
        toast(e.message || "Nahrávku se nepodařilo uložit.");
        renderPanel();
      }
    };
    rec.start();
    st.rec = rec;
    st.recFor = target;
    st.recStarted = Date.now();
    renderPanel();
    gc("Zvuková mapa: nahrávka");
  }

  function stopRec(discard) {
    if (!st.rec) return;
    if (discard) {
      st.rec.onstop = function () {
        st.rec.stream && st.rec.stream.getTracks().forEach(function (t) { t.stop(); });
        st.rec = null;
        renderPanel();
      };
    }
    if (st.rec.state !== "inactive") st.rec.stop();
  }

  function applyMedia(target, kind, media) {
    if (target === "place") st.draft[kind] = media;
    else {
      var e = st.draft.entries[target];
      if (e) e[kind] = media;
    }
    renderPanel();
  }

  /* ---------- rendering ---------- */
  function dataButtons() {
    return "<div class=\"zm-data\">" +
      "<button type=\"button\" id=\"btn-export\">Exportovat</button>" +
      "<label for=\"import-file\">Importovat</label>" +
      "<span class=\"zm-tally\"><a href=\"https://tally.so/r/Qo1aeY\">Napsat připomínku</a></span>" +
      "</div>";
  }

  function slotView(path, kind) {
    if (path) {
      if (kind === "photo") return "<div class=\"zm-slot has-media\"><img src=\"" + esc(mediaUrl(path)) + "\" alt=\"Fotografie místa\"></div>";
      return "<div class=\"zm-slot has-media\">" + ICO.sound + "<audio controls preload=\"none\" src=\"" + esc(mediaUrl(path)) + "\"></audio></div>";
    }
    if (kind === "photo") return "<div class=\"zm-slot\">" + ICO.photo + "<span>Zatím bez fotografie</span></div>";
    return "<div class=\"zm-slot\">" + ICO.sound + "<span>Zatím bez zvuku</span></div>";
  }

  function renderView(place) {
    var c = catOf(place);
    var evs = entriesOf(place);
    var ev = evs.find(function (e) { return e.id === st.eventId; }) || evs[evs.length - 1];
    var example = EXAMPLE_IDS[place.id] ? "<span class=\"zm-badge\">Ukázka</span>" : "<span class=\"zm-badge\">Náhled příspěvku</span>";
    var axis = evs.length ? evs.map(function (e) {
      var cur = ev && e.id === ev.id;
      return "<button type=\"button\" class=\"zm-axis__item\" data-event=\"" + esc(e.id) + "\" aria-current=\"" + (cur ? "true" : "false") + "\">" +
        "<span class=\"zm-axis__dot\"></span>" +
        "<span class=\"zm-axis__year\">" + esc(e.year) + "</span>" +
        "<span class=\"zm-axis__title\">" + esc(e.title) + "</span></button>";
    }).join("") : "";
    var evHtml = "";
    if (ev) {
      evHtml = "<div class=\"zm-event\">" +
        "<div class=\"zm-event__year\">" + esc(ev.year) + "</div>" +
        "<h4>" + esc(ev.title) + "</h4>" +
        "<p class=\"zm-author\">Vložil/a: " + esc(ev.author || "neuvedeno") + "</p>" +
        (ev.text ? "<p>" + esc(ev.text) + "</p>" : "") +
        (ev.photo_path || ev.audio_path ? "<div class=\"zm-media\">" + slotView(ev.photo_path, "photo") + slotView(ev.audio_path, "audio") + "</div>" : "") +
        "</div>";
    }
    return "<div class=\"zm-handle\" aria-hidden=\"true\"></div>" +
      "<div class=\"zm-panel__scroll\">" +
      "<div class=\"zm-kicker\"><span class=\"zm-cat\"><span class=\"zm-dot\" style=\"background:" + c.color + "\"></span>" + esc(c.name) + "</span>" + example + "</div>" +
      "<div><h2>" + esc(place.title) + "</h2>" +
      "<p class=\"zm-author\">Vložil/a: " + esc(place.author || "neuvedeno") + "</p></div>" +
      (place.description ? "<p class=\"zm-desc\">" + esc(place.description) + "</p>" : "") +
      "<div class=\"zm-block\"><h3>Zvuk a fotografie místa</h3><div class=\"zm-media\">" +
      slotView(place.photo_path, "photo") + slotView(place.audio_path, "audio") +
      "</div></div>" +
      "<div class=\"zm-block\"><h3>Historie zvuku <span>— časová osa příběhu</span></h3>" +
      (axis ? "<div class=\"zm-timeline\"><div class=\"zm-axis\">" + axis + "</div></div>" : "<p class=\"c-meta\">Zatím bez zastávek na ose.</p>") +
      evHtml +
      "</div></div>" +
      "<div class=\"zm-panel__foot\">" +
      "<button class=\"c-btn c-btn--primary\" type=\"button\" id=\"btn-edit\">" + ICO.edit + " Upravit</button>" +
      dataButtons() +
      "</div>";
  }

  function mediaField(label, target, kind, currentPath, draftMedia, cleared) {
    var preview = draftMedia && draftMedia.preview;
    var has = preview || (currentPath && !cleared);
    var src = preview || (currentPath && !cleared ? mediaUrl(currentPath) : "");
    var warn = draftMedia && draftMedia.warn ? "<p class=\"zm-warn\">" + esc(draftMedia.warn) + "</p>" : "";
    var recOn = st.rec && st.recFor === target && kind === "audio";
    var body;
    if (kind === "photo" && has) body = "<div class=\"zm-slot has-media\"><img src=\"" + esc(src) + "\" alt=\"\"></div>";
    else if (kind === "audio" && has) body = "<div class=\"zm-slot has-media\">" + ICO.sound + "<audio controls src=\"" + esc(src) + "\"></audio></div>";
    else body = "<div class=\"zm-slot\">" + (kind === "photo" ? ICO.photo : ICO.sound) + "<span>" + (kind === "photo" ? "Zatím bez fotografie" : "Zatím bez zvuku") + "</span></div>";
    var recBtn = "";
    if (kind === "audio") {
      recBtn = recOn
        ? "<button type=\"button\" class=\"c-btn c-btn--secondary\" data-stop=\"" + target + "\">" + ICO.stop + " Zastavit</button>"
        : "<button type=\"button\" class=\"c-btn c-btn--secondary\" data-rec=\"" + target + "\">" + ICO.mic + " Nahrát</button>";
    }
    return "<div class=\"zm-upload\"><span class=\"c-label\">" + esc(label) + "</span>" + body + warn +
      (recOn ? "<div class=\"zm-rec is-on\"><span class=\"zm-rec__dot\"></span>Nahrávám…</div>" : "") +
      "<div class=\"zm-upload__btns\">" +
      "<label class=\"c-btn c-btn--secondary\"><input class=\"sr-only\" type=\"file\" accept=\"" + (kind === "photo" ? "image/*" : "audio/*") + "\" data-upload=\"" + target + "\" data-kind=\"" + kind + "\">Vybrat</label>" +
      recBtn +
      (has ? "<button type=\"button\" class=\"zm-link zm-link--danger\" data-clear=\"" + target + "\" data-kind=\"" + kind + "\">Odebrat</button>" : "") +
      "</div></div>";
  }

  function emptyEntry() {
    return { id: null, year: "", title: "", author: "", text: "", sort: 0, photo_path: null, audio_path: null, photo: null, audio: null, clear_photo: false, clear_audio: false, _key: "n" + Math.random().toString(36).slice(2, 8) };
  }

  function openForm(mode, place) {
    st.mode = mode;
    if (mode === "add") {
      st.draft = {
        id: null,
        category: "mech",
        title: "",
        author: "",
        description: "",
        lat: st.addLatLng ? st.addLatLng.lat : PRAGUE[0],
        lng: st.addLatLng ? st.addLatLng.lng : PRAGUE[1],
        photo_path: null,
        audio_path: null,
        photo: null,
        audio: null,
        clear_photo: false,
        clear_audio: false,
        entries: []
      };
    } else {
      var evs = entriesOf(place);
      st.draft = {
        id: place.id,
        category: place.category,
        title: place.title,
        author: place.author || "",
        description: place.description || "",
        lat: place.lat,
        lng: place.lng,
        photo_path: place.photo_path,
        audio_path: place.audio_path,
        photo: null,
        audio: null,
        clear_photo: false,
        clear_audio: false,
        entries: evs.map(function (e) {
          return {
            id: e.id, year: e.year, title: e.title, author: e.author || "", text: e.text || "",
            sort: e.sort, photo_path: e.photo_path, audio_path: e.audio_path,
            photo: null, audio: null, clear_photo: false, clear_audio: false, _key: e.id
          };
        })
      };
    }
    renderPanel();
  }

  function readForm() {
    var d = st.draft;
    var catBtn = document.querySelector("#form-cat [aria-pressed='true']");
    d.category = catBtn ? catBtn.getAttribute("data-v") : d.category;
    d.title = ($("f-title") || {}).value || "";
    d.author = ($("f-author") || {}).value || "";
    d.description = ($("f-desc") || {}).value || "";
    var lat = parseFloat(($("f-lat") || {}).value);
    var lng = parseFloat(($("f-lng") || {}).value);
    if (Number.isFinite(lat)) d.lat = lat;
    if (Number.isFinite(lng)) d.lng = lng;
    d.entries.forEach(function (e, i) {
      var yearEl = document.querySelector("[data-eyear=\"" + i + "\"]");
      var titleEl = document.querySelector("[data-etitle=\"" + i + "\"]");
      var authorEl = document.querySelector("[data-eauthor=\"" + i + "\"]");
      var textEl = document.querySelector("[data-etext=\"" + i + "\"]");
      if (yearEl) e.year = yearEl.value;
      if (titleEl) e.title = titleEl.value;
      if (authorEl) e.author = authorEl.value;
      if (textEl) e.text = textEl.value;
      e.sort = i;
    });
  }

  function renderForm() {
    var d = st.draft;
    var segs = CATS.map(function (c) {
      return "<button type=\"button\" data-v=\"" + c.id + "\" aria-pressed=\"" + (d.category === c.id ? "true" : "false") + "\">" + esc(c.name) + "</button>";
    }).join("");
    var entries = d.entries.map(function (e, i) {
      return "<div class=\"zm-entry\" data-entry=\"" + i + "\">" +
        "<div class=\"zm-entry__top\"><span class=\"c-label\">Zastávka " + (i + 1) + "</span>" +
        "<button type=\"button\" class=\"zm-link zm-link--danger\" data-del-entry=\"" + i + "\">Odebrat</button></div>" +
        "<div class=\"zm-form__row\">" +
        "<div class=\"c-field\"><label class=\"c-label\" for=\"ey-" + i + "\">Rok</label>" +
        "<input class=\"c-input\" id=\"ey-" + i + "\" data-eyear=\"" + i + "\" type=\"number\" min=\"1\" max=\"3000\" value=\"" + esc(e.year) + "\"></div>" +
        "<div class=\"c-field\"><label class=\"c-label\" for=\"et-" + i + "\">Název</label>" +
        "<input class=\"c-input\" id=\"et-" + i + "\" data-etitle=\"" + i + "\" type=\"text\" maxlength=\"120\" value=\"" + esc(e.title) + "\"></div>" +
        "</div>" +
        "<div class=\"c-field\"><label class=\"c-label\" for=\"ea-" + i + "\">Vložil/a</label>" +
        "<input class=\"c-input\" id=\"ea-" + i + "\" data-eauthor=\"" + i + "\" type=\"text\" maxlength=\"80\" value=\"" + esc(e.author) + "\"></div>" +
        "<div class=\"c-field\"><label class=\"c-label\" for=\"ex-" + i + "\">Text</label>" +
        "<textarea class=\"c-input\" id=\"ex-" + i + "\" data-etext=\"" + i + "\" rows=\"3\">" + esc(e.text) + "</textarea></div>" +
        mediaField("Fotografie", i, "photo", e.photo_path, e.photo, e.clear_photo) +
        mediaField("Zvuk", i, "audio", e.audio_path, e.audio, e.clear_audio) +
        "</div>";
    }).join("");
    return "<div class=\"zm-handle\" aria-hidden=\"true\"></div>" +
      "<form class=\"zm-panel__scroll zm-form\" id=\"place-form\">" +
      "<div class=\"zm-kicker\"><span class=\"zm-badge\">" + (st.mode === "add" ? "Nové místo" : "Úprava příspěvku") + "</span></div>" +
      "<div class=\"c-field\"><span class=\"c-label\" id=\"lbl-cat\">Kategorie</span>" +
      "<div class=\"c-seg\" role=\"group\" aria-labelledby=\"lbl-cat\" id=\"form-cat\">" + segs + "</div></div>" +
      "<div class=\"c-field\"><label class=\"c-label\" for=\"f-title\">Název</label>" +
      "<input class=\"c-input\" id=\"f-title\" type=\"text\" maxlength=\"120\" required value=\"" + esc(d.title) + "\"></div>" +
      "<div class=\"c-field\"><label class=\"c-label\" for=\"f-author\">Vložil/a</label>" +
      "<input class=\"c-input\" id=\"f-author\" type=\"text\" maxlength=\"80\" value=\"" + esc(d.author) + "\"></div>" +
      "<div class=\"c-field\"><label class=\"c-label\" for=\"f-desc\">Popis</label>" +
      "<textarea class=\"c-input\" id=\"f-desc\" rows=\"4\">" + esc(d.description) + "</textarea></div>" +
      "<div class=\"zm-form__row\">" +
      "<div class=\"c-field\"><label class=\"c-label\" for=\"f-lat\">Zeměpisná šířka</label>" +
      "<input class=\"c-input\" id=\"f-lat\" type=\"number\" step=\"0.000001\" value=\"" + esc(d.lat) + "\"></div>" +
      "<div class=\"c-field\"><label class=\"c-label\" for=\"f-lng\">Zeměpisná délka</label>" +
      "<input class=\"c-input\" id=\"f-lng\" type=\"number\" step=\"0.000001\" value=\"" + esc(d.lng) + "\"></div>" +
      "</div>" +
      mediaField("Fotografie místa", "place", "photo", d.photo_path, d.photo, d.clear_photo) +
      mediaField("Zvuk místa", "place", "audio", d.audio_path, d.audio, d.clear_audio) +
      "<div class=\"zm-block\"><h3>Historie zvuku</h3>" + entries +
      "<button type=\"button\" class=\"c-btn c-btn--secondary\" id=\"btn-add-entry\">" + ICO.plus + " Přidat zastávku na ose</button>" +
      "</div></form>" +
      "<div class=\"zm-panel__foot\">" +
      "<button class=\"c-btn c-btn--primary\" type=\"button\" id=\"btn-save\">Uložit</button>" +
      "<button class=\"c-btn c-btn--secondary\" type=\"button\" id=\"btn-cancel\">Zrušit</button>" +
      (st.mode === "edit" ? "<button type=\"button\" class=\"zm-link zm-link--danger\" id=\"btn-delete\">Smazat místo</button>" : "") +
      "</div>";
  }

  function renderEmpty() {
    return "<div class=\"zm-handle\" aria-hidden=\"true\"></div>" +
      "<div class=\"zm-panel__scroll zm-empty\">" +
      "<h2>Zvuková mapa</h2>" +
      "<p>Vyberte místo na mapě, nebo přidejte nové. Místa jsou společná pro celou třídu. Úpravy chrání heslo třídy.</p>" +
      "<p>Data se ukládají na serveru. Na volném tarifu se projekt po týdnu nečinnosti uspí — jako zálohu použijte Exportovat.</p>" +
      "</div>" +
      "<div class=\"zm-panel__foot\">" + dataButtons() + "</div>";
  }

  function renderPanel() {
    var panel = $("panel");
    var html;
    if (st.mode === "add" || st.mode === "edit") html = renderForm();
    else {
      var p = selected();
      html = p ? renderView(p) : renderEmpty();
    }
    panel.innerHTML = html;
    panel.classList.toggle("zm-busy", st.busy);
    bindPanel();
  }

  function bindPanel() {
    $("panel").querySelectorAll("[data-event]").forEach(function (btn) {
      btn.addEventListener("click", function () { selectPlace(st.selectedId, btn.getAttribute("data-event")); });
    });
    var edit = $("btn-edit");
    if (edit) edit.addEventListener("click", function () {
      var p = selected();
      if (p) { setAddMode(false); openForm("edit", p); }
    });
    var cancel = $("btn-cancel");
    if (cancel) cancel.addEventListener("click", function () {
      if (st.rec) stopRec(true);
      setAddMode(false);
      st.mode = "view";
      if (!st.selectedId && st.places.length) st.selectedId = st.places[0].id;
      renderPanel();
      syncMarkers();
    });
    var save = $("btn-save");
    if (save) save.addEventListener("click", function () { savePlace(); });
    var del = $("btn-delete");
    if (del) del.addEventListener("click", function () { deletePlace(); });
    var addE = $("btn-add-entry");
    if (addE) addE.addEventListener("click", function () {
      readForm();
      st.draft.entries.push(emptyEntry());
      renderPanel();
    });
    $("panel").querySelectorAll("[data-del-entry]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        readForm();
        var i = parseInt(btn.getAttribute("data-del-entry"), 10);
        var e = st.draft.entries[i];
        if (!e) return;
        if (e.id) st.draft._deleted = (st.draft._deleted || []).concat([e]);
        st.draft.entries.splice(i, 1);
        renderPanel();
      });
    });
    var cat = $("form-cat");
    if (cat) cat.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        cat.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
      });
    });
    $("panel").querySelectorAll("[data-upload]").forEach(function (inp) {
      inp.addEventListener("change", async function () {
        var file = inp.files && inp.files[0];
        if (!file) return;
        var target = inp.getAttribute("data-upload");
        var kind = inp.getAttribute("data-kind");
        readForm();
        try {
          var media = kind === "photo" ? await compressPhoto(file) : await prepareAudio(file);
          if (target === "place") {
            st.draft[kind] = media;
            st.draft["clear_" + kind] = false;
          } else {
            var e = st.draft.entries[parseInt(target, 10)];
            if (e) { e[kind] = media; e["clear_" + kind] = false; }
          }
          if (media.warn) toast(media.warn, 4000);
        } catch (err) {
          toast(err.message || "Soubor se nepodařilo načíst.");
        }
        renderPanel();
      });
    });
    $("panel").querySelectorAll("[data-clear]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        readForm();
        var target = btn.getAttribute("data-clear");
        var kind = btn.getAttribute("data-kind");
        if (target === "place") { st.draft[kind] = null; st.draft["clear_" + kind] = true; }
        else {
          var e = st.draft.entries[parseInt(target, 10)];
          if (e) { e[kind] = null; e["clear_" + kind] = true; }
        }
        renderPanel();
      });
    });
    $("panel").querySelectorAll("[data-rec]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        readForm();
        var target = btn.getAttribute("data-rec");
        startRec(target === "place" ? "place" : parseInt(target, 10)).catch(function (err) {
          toast(err.message || "Mikrofon se nepodařilo spustit.");
        });
      });
    });
    $("panel").querySelectorAll("[data-stop]").forEach(function (btn) {
      btn.addEventListener("click", function () { stopRec(false); });
    });
    var exp = $("btn-export");
    if (exp) exp.addEventListener("click", exportJson);
  }

  async function savePlace() {
    if (st.busy) return;
    readForm();
    var d = st.draft;
    if (!d.title.trim()) { toast("Vyplňte název místa."); return; }
    if (!Number.isFinite(d.lat) || !Number.isFinite(d.lng)) { toast("Zadejte polohu."); return; }
    st.busy = true;
    renderPanel();
    var result = await withPassword(async function (pw) {
      var payload = {
        password: pw,
        action: d.id ? "update_place" : "create_place",
        place: { id: d.id, category: d.category, title: d.title.trim(), author: d.author.trim(), description: d.description.trim(), lat: d.lat, lng: d.lng },
        clear_photo: !!d.clear_photo && !d.photo,
        clear_audio: !!d.clear_audio && !d.audio
      };
      if (d.photo) payload.photo = { mime: d.photo.mime, data: d.photo.data };
      if (d.audio) payload.audio = { mime: d.audio.mime, data: d.audio.data };
      var out = await write(payload);
      var placeId = out.place.id;
      var deleted = d._deleted || [];
      for (var i = 0; i < deleted.length; i++) {
        if (deleted[i].id) await write({ password: pw, action: "delete_entry", entry: { id: deleted[i].id } });
      }
      for (var j = 0; j < d.entries.length; j++) {
        var e = d.entries[j];
        if (!String(e.title || "").trim() || !e.year) continue;
        var ep = {
          password: pw,
          action: e.id ? "update_entry" : "add_entry",
          entry: { id: e.id, place_id: placeId, year: e.year, title: String(e.title).trim(), author: String(e.author || "").trim(), text: String(e.text || "").trim(), sort: j },
          clear_photo: !!e.clear_photo && !e.photo,
          clear_audio: !!e.clear_audio && !e.audio
        };
        if (e.photo) ep.photo = { mime: e.photo.mime, data: e.photo.data };
        if (e.audio) ep.audio = { mime: e.audio.mime, data: e.audio.data };
        await write(ep);
      }
      return placeId;
    });
    st.busy = false;
    if (!result) { renderPanel(); return; }
    gc(d.id ? "Zvuková mapa: úprava" : "Zvuková mapa: přidání místa");
    setAddMode(false);
    await refresh(result);
    toast("Uloženo.");
  }

  async function deletePlace() {
    var p = st.draft;
    if (!p || !p.id) return;
    if (!window.confirm("Opravdu smazat toto místo?")) return;
    st.busy = true;
    renderPanel();
    var ok = await withPassword(async function (pw) {
      await write({ password: pw, action: "delete_place", place: { id: p.id } });
      return true;
    });
    st.busy = false;
    if (!ok) { renderPanel(); return; }
    gc("Zvuková mapa: smazání");
    setAddMode(false);
    st.selectedId = null;
    await refresh();
    toast("Místo bylo smazáno.");
  }

  async function refresh(selectId) {
    await loadPlaces();
    if (selectId) st.selectedId = selectId;
    if (st.selectedId && !st.places.some(function (p) { return p.id === st.selectedId; })) st.selectedId = null;
    if (!st.selectedId && st.places.some(function (p) { return p.id === DEFAULT_ID; })) st.selectedId = DEFAULT_ID;
    else if (!st.selectedId && st.places[0]) st.selectedId = st.places[0].id;
    var p = selected();
    var evs = entriesOf(p);
    st.eventId = evs.length ? evs[evs.length - 1].id : null;
    st.mode = "view";
    syncMarkers();
    renderPanel();
  }

  async function exportJson() {
    var bundle = {
      version: 1,
      exportedAt: new Date().toISOString(),
      places: st.places.map(function (p) {
        return {
          id: p.id, category: p.category, title: p.title, author: p.author, description: p.description,
          lat: p.lat, lng: p.lng,
          photo_url: p.photo_path ? mediaUrl(p.photo_path) : null,
          audio_url: p.audio_path ? mediaUrl(p.audio_path) : null,
          timeline: entriesOf(p).map(function (e) {
            return {
              id: e.id, year: e.year, title: e.title, author: e.author, text: e.text, sort: e.sort,
              photo_url: e.photo_path ? mediaUrl(e.photo_path) : null,
              audio_url: e.audio_path ? mediaUrl(e.audio_path) : null
            };
          })
        };
      })
    };
    var blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    var day = new Date();
    var stamp = day.getFullYear() + "-" + String(day.getMonth() + 1).padStart(2, "0") + "-" + String(day.getDate()).padStart(2, "0");
    a.href = URL.createObjectURL(blob);
    a.download = "zvukova-mapa-" + stamp + ".json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    gc("Zvuková mapa: export");
    toast("Soubor je stažený.");
  }

  async function importJson(file) {
    var text = await file.text();
    var data;
    try { data = JSON.parse(text); } catch (e) { toast("Soubor není platný JSON."); return; }
    var list = data.places || data;
    if (!Array.isArray(list) || !list.length) { toast("V souboru nejsou žádná místa."); return; }
    if (!window.confirm("Importovat " + list.length + " míst na sdílenou mapu? Přidají se jako nová.")) return;
    var ok = await withPassword(async function (pw) {
      var n = 0;
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        var out = await write({
          password: pw,
          action: "create_place",
          place: { category: p.category, title: p.title, author: p.author || "", description: p.description || "", lat: p.lat, lng: p.lng }
        });
        var evs = p.timeline || p.timeline_entries || [];
        for (var j = 0; j < evs.length; j++) {
          var e = evs[j];
          await write({
            password: pw,
            action: "add_entry",
            entry: { place_id: out.place.id, year: e.year, title: e.title, author: e.author || "", text: e.text || "", sort: j }
          });
        }
        n++;
      }
      return n;
    });
    if (ok) {
      gc("Zvuková mapa: import");
      await refresh();
      toast("Importováno: " + ok + " míst.");
    }
  }

  function bindChrome() {
    $("btn-color").addEventListener("click", function () {
      setColor(!st.color);
      gc("Zvuková mapa: barevná mapa");
    });
    $("btn-panel").addEventListener("click", function () { showPanel(st.panelHidden); });
    $("btn-add").addEventListener("click", function () {
      if (st.mode === "add" && !st.draft) { setAddMode(false); return; }
      setAddMode(true);
    });
    $("import-file").addEventListener("change", function () {
      var f = this.files && this.files[0];
      this.value = "";
      if (f) importJson(f);
    });
    window.addEventListener("resize", function () { if (map) map.invalidateSize(); });
  }

  async function init() {
    bindChrome();
    setColor(false);
    showPanel(true);
    initMap();
    try {
      await refresh(DEFAULT_ID);
    } catch (e) {
      renderPanel();
      toast(e.message || "Mapu se nepodařilo načíst.");
    }
    gc("Zvuková mapa: otevření");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
