/* Zvuková mapa – čtení a zápis jen s heslem, mapa CARTO Voyager. */
(function () {
  "use strict";

  var SB_URL = "https://dtpncirocmozndsmysdh.supabase.co";
  var SB_KEY = "sb_publishable_VCBtsnWU53B7lOSpd205rw_UZbpUDD_";
  var READ_URL = SB_URL + "/functions/v1/zvukova-mapa-read";
  var WRITE_URL = SB_URL + "/functions/v1/zvukova-mapa-write";
  var CARTO_KEY = "cb1_56da_1_15ea8333763e6c094054ea40";
  var PW_KEY = "zvukovamapa:heslo";
  var SKOLA_KEY = "zvukovamapa:skola";
  var PHOTO_MAX = 2 * 1024 * 1024;
  var AUDIO_MAX = 5 * 1024 * 1024;
  var SCHOOL_ZOOM = 15;
  var REC_MAX_MS = 180000;

  /* Souřadnice z Nominatim (OpenStreetMap), 10. 11. 2026:
     Hloubětín = Poděbradská 489/116, 198 00 Praha 14
     Dědina = Žukovského 887/4, 161 00 Praha 6 */
  var SKOLY = {
    hloubetin: { name: "Hloubětín", lat: 50.1053762, lng: 14.5372651 },
    dedina: { name: "Dědina", lat: 50.0907173, lng: 14.3088879 }
  };

  var CATS = [
    { id: "mech", name: "Technické", color: "#15438A", tone: "navy" },
    { id: "priroda", name: "Přírodní", color: "#1E7A32", tone: "green" },
    { id: "lide", name: "Lidské", color: "#C8174A", tone: "pink" },
    { id: "jine", name: "Jiné", color: "#7A2982", tone: "purple" }
  ];
  var CAT = {};
  CATS.forEach(function (c) { CAT[c.id] = c; });

  var ICO = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 16.5V20h3.5L19 8.5 15.5 5 4 16.5z"/><path d="M13.2 7.3l3.5 3.5"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13.5" rx="2.5"/><circle cx="9" cy="11" r="1.8"/><path d="M7.5 17.5l3.8-4 2.4 2.5 1.6-1.7 3.2 3.2"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h3.2L12 18V6L7.2 10H4z"/><path d="M16 9.2a4 4 0 0 1 0 5.6M18.7 7a7 7 0 0 1 0 10"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>',
    mech: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.4M12 18.1V20.5M3.5 12h2.4M18.1 12H20.5M6.2 6.2l1.7 1.7M16.1 16.1l1.7 1.7M17.8 6.2l-1.7 1.7M7.9 16.1l-1.7 1.7"/></svg>',
    priroda: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5V12C8 12 5 8.7 5 5.5 9.5 5.5 12 9 12 12c0-3 2.5-6.5 7-6.5C19 8.7 16 12 12 12v8.5h-0z" opacity="0.95"/></svg>',
    lide: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="3.1"/><path d="M6.2 19.2c.4-3.2 2.7-5 5.8-5s5.4 1.8 5.8 5"/></svg>',
    jine: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4.5l1.6 4.6H18.5l-3.8 2.8 1.5 4.6L12 13.8 7.8 16.5l1.5-4.6L5.5 9.1h4.9z"/></svg>'
  };

  var st = {
    places: [],
    selectedId: null,
    eventId: null,
    mode: "view",
    role: "",
    showHidden: false,
    filters: { mech: true, priroda: true, lide: true, jine: true },
    school: "hloubetin",
    sheet: "hidden",
    addLatLng: null,
    draft: null,
    rec: null,
    recFor: null,
    busy: false,
    unlocked: false
  };
  var map, cluster, markers = {}, draftMarker = null, toastTimer = 0;

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
  function catOf(place) { return CAT[place.category] || CAT.jine; }
  function isTeacher() { return st.role === "teacher"; }
  function entriesOf(place) {
    var list = (place && place.timeline_entries) || [];
    return list.slice().sort(function (a, b) {
      return (a.sort - b.sort) || (a.year - b.year) || String(a.title).localeCompare(String(b.title), "cs");
    });
  }
  function visiblePlaces() {
    return st.places.filter(function (p) {
      if (!st.filters[p.category]) return false;
      if (p.hidden && !st.showHidden) return false;
      return true;
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
  function savedSchool() {
    try {
      var id = localStorage.getItem(SKOLA_KEY) || "hloubetin";
      if (id === "ruzyne") {
        id = "dedina";
        try { localStorage.setItem(SKOLA_KEY, id); } catch (e2) {}
      }
      return SKOLY[id] ? id : "hloubetin";
    } catch (e) { return "hloubetin"; }
  }
  function saveSchool(id) {
    try { localStorage.setItem(SKOLA_KEY, id); } catch (e) {}
  }

  function toast(msg, ms) {
    var el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, ms || 2800);
  }

  function recMaxMs() {
    var n = typeof window.__ZM_REC_MAX_MS === "number" ? window.__ZM_REC_MAX_MS : REC_MAX_MS;
    return n > 0 ? n : REC_MAX_MS;
  }
  function fmtMmSs(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function todayISO() {
    var d = new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }
  function formatDateCZ(iso) {
    if (!iso) return "";
    var p = String(iso).slice(0, 10).split("-");
    if (p.length !== 3) return "";
    return Number(p[2]) + ". " + Number(p[1]) + ". " + p[0];
  }
  function placePhotos(place) {
    if (place && Array.isArray(place.photos) && place.photos.length) return place.photos.filter(function (x) { return x && (x.url || (x.file && x.file.preview)); });
    if (place && place.photo_url) return [{ path: null, url: place.photo_url }];
    return [];
  }

  async function api(url, payload) {
    var res = await fetch(url, {
      method: "POST",
      headers: { apikey: SB_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    var data = {};
    try { data = await res.json(); } catch (e) { data = {}; }
    if (res.status === 401) {
      var err401 = new Error(data.error || "Heslo nesedí.");
      err401.code = 401;
      throw err401;
    }
    if (res.status === 409) {
      var err409 = new Error(data.error || "Mezitím to upravil někdo jiný. Načetla jsem novou verzi, zkus úpravu znovu.");
      err409.code = 409;
      err409.place = data.place;
      throw err409;
    }
    if (!res.ok || data.error) throw new Error(data.error || "Požadavek se nezdařil.");
    return data;
  }

  async function loadPlaces() {
    var data = await api(READ_URL, { password: getPassword() });
    st.role = data.role || "class";
    st.places = data.places || [];
    $("teacher-bar").hidden = !isTeacher();
  }
  async function pollRefresh() {
    if (!st.unlocked || document.hidden || st.busy) return;
    var formOpen = st.mode === "add" || st.mode === "edit";
    try {
      await loadPlaces();
      syncMarkers();
      if (formOpen) return;
      if (st.selectedId && !st.places.some(function (p) { return p.id === st.selectedId; })) {
        st.selectedId = null;
        showPanel("hidden");
      }
      if (st.mode === "view") renderPanel();
    } catch (err) {
      if (err.code === 401) lock();
    }
  }

  async function write(payload) {
    payload.password = getPassword();
    return api(WRITE_URL, payload);
  }

  /* ---------- media ---------- */
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
        var max = 1600, w = img.naturalWidth, h = img.naturalHeight;
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
  function audioDuration(file) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var a = document.createElement("audio");
      a.preload = "metadata";
      a.onloadedmetadata = function () { URL.revokeObjectURL(url); resolve(a.duration); };
      a.onerror = function () { URL.revokeObjectURL(url); resolve(NaN); };
      a.src = url;
    });
  }
  async function prepareAudio(file) {
    if (file.size > AUDIO_MAX) throw new Error("Nahrávka je větší než 5 MB.");
    var data = await fileToDataUrl(file);
    var warn = file.size > 3 * 1024 * 1024 ? "Nahrávka je poměrně velká (" + (file.size / 1048576).toFixed(1) + " MB)." : "";
    var dur = await audioDuration(file);
    if (dur > 180) warn = (warn ? warn + " " : "") + "Nahrávka je delší než 3 minuty. Zkus ji zkrátit.";
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
        var ext = (rec.mimeType || "").indexOf("mp4") >= 0 ? "m4a" : "webm";
        var media = await prepareAudio(new File([blob], "nahravka." + ext, { type: blob.type }));
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
    clearInterval(st.recClock);
    st.recClock = setInterval(function () {
      updateRecLabel();
      if (st.recStarted && Date.now() - st.recStarted >= recMaxMs()) stopRec(false);
    }, 200);
    renderPanel();
    updateRecLabel();
    gc("Zvuková mapa: nahrávka");
  }
  function updateRecLabel() {
    var el = $("rec-clock");
    if (!el || !st.recStarted) return;
    el.textContent = fmtMmSs(Date.now() - st.recStarted) + " / " + fmtMmSs(recMaxMs());
  }
  function stopRec(discard) {
    if (!st.rec) return;
    clearInterval(st.recClock);
    st.recClock = null;
    st.recStarted = 0;
    if (discard) {
      var rec = st.rec;
      rec.onstop = function () { st.rec = null; renderPanel(); };
    }
    if (st.rec.state !== "inactive") st.rec.stop();
  }
  function openLightbox(src) {
    var box = $("lightbox");
    if (!box || !src) return;
    $("lightbox-img").src = src;
    box.hidden = false;
  }
  function closeLightbox() {
    var box = $("lightbox");
    if (!box) return;
    box.hidden = true;
    $("lightbox-img").removeAttribute("src");
  }
  function applyMedia(target, kind, media) {
    if (target === "place") { st.draft[kind] = media; st.draft["clear_" + kind] = false; }
    else {
      var e = st.draft.entries[target];
      if (e) { e[kind] = media; e["clear_" + kind] = false; }
    }
    renderPanel();
  }

  /* ---------- map ---------- */
  function pinIcon(place, selectedMark) {
    var c = catOf(place);
    var cls = "zm-pin" + (selectedMark ? " is-selected" : "") + (place.hidden ? " is-hidden" : "");
    return L.divIcon({
      className: cls,
      html: "<div class=\"zm-mark\" style=\"--mark:" + c.color + "\"><span class=\"zm-mark__dot\"></span></div>",
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
  }
  function schoolLatLng() {
    var s = SKOLY[st.school] || SKOLY.hloubetin;
    return [s.lat, s.lng];
  }
  function initMap() {
    map = L.map("map", { center: schoolLatLng(), zoom: SCHOOL_ZOOM, zoomControl: true, attributionControl: true });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png?key=" + encodeURIComponent(CARTO_KEY), {
      maxZoom: 20,
      subdomains: "abcd",
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, &copy; <a href=\"https://carto.com/attributions\">CARTO</a>"
    }).addTo(map);
    cluster = L.markerClusterGroup({
      maxClusterRadius: 52,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: function (cl) {
        return L.divIcon({
          html: "<span>" + cl.getChildCount() + "</span>",
          className: "zm-cluster",
          iconSize: [20, 20]
        });
      }
    });
    map.addLayer(cluster);
    map.on("click", function (e) {
      if (st.mode !== "add") return;
      st.addLatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (st.draft) {
        st.draft.lat = e.latlng.lat;
        st.draft.lng = e.latlng.lng;
        placeDraftMarker();
      } else {
        openForm("add");
        showPanel("expanded");
      }
    });
    renderLegend();
    bindPanelToMap();
    setTimeout(function () { syncShell(); }, 80);
  }
  function placeDraftMarker() {
    if (!st.addLatLng && !st.draft) return;
    var lat = st.draft ? st.draft.lat : st.addLatLng.lat;
    var lng = st.draft ? st.draft.lng : st.addLatLng.lng;
    var fake = { category: (st.draft && st.draft.category) || "mech", hidden: false, title: "Nové místo" };
    if (draftMarker) {
      draftMarker.setLatLng([lat, lng]);
      draftMarker.setIcon(pinIcon(fake, true));
      return;
    }
    draftMarker = L.marker([lat, lng], { icon: pinIcon(fake, true), draggable: true, zIndexOffset: 1000, title: "Nové místo" });
    draftMarker.on("dragend", function (ev) {
      var p = ev.target.getLatLng();
      st.addLatLng = { lat: p.lat, lng: p.lng };
      if (st.draft) { st.draft.lat = p.lat; st.draft.lng = p.lng; }
    });
    draftMarker.addTo(map);
  }
  function clearDraftMarker() {
    if (draftMarker) { map.removeLayer(draftMarker); draftMarker = null; }
  }
  function syncMarkers() {
    if (!cluster) return;
    cluster.clearLayers();
    markers = {};
    visiblePlaces().forEach(function (p) {
      var m = L.marker([p.lat, p.lng], { icon: pinIcon(p, p.id === st.selectedId), title: p.title, riseOnHover: true });
      m.on("click", function (e) {
        if (st.mode === "add") return;
        L.DomEvent.stopPropagation(e);
        selectPlace(p.id);
        showPanel("expanded");
      });
      markers[p.id] = m;
      cluster.addLayer(m);
    });
  }
  function renderLegend() {
    $("legend").innerHTML = CATS.map(function (c) {
      var on = st.filters[c.id] !== false;
      return "<button type=\"button\" class=\"zm-chip\" data-filter=\"" + c.id + "\" aria-pressed=\"" + (on ? "true" : "false") + "\">" +
        "<span class=\"zm-dot\" style=\"background:" + c.color + "\"></span>" + esc(c.name) + "</button>";
    }).join("");
    $("legend").querySelectorAll("[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-filter");
        st.filters[id] = !st.filters[id];
        renderLegend();
        syncMarkers();
      });
    });
  }
  function setSchool(id, fly) {
    if (!SKOLY[id]) id = "hloubetin";
    st.school = id;
    saveSchool(id);
    $("skoly").querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-v") === id ? "true" : "false");
    });
    if (map && fly !== false) map.flyTo(schoolLatLng(), SCHOOL_ZOOM, { duration: 0.6 });
  }
  function setAddMode(on) {
    if (on) {
      st.mode = "add";
      st.addLatLng = null;
      st.draft = null;
      clearDraftMarker();
      if (map) map.getContainer().classList.add("leaflet-crosshair");
      $("btn-add").setAttribute("aria-pressed", "true");
      toast("Klepni do mapy, kde jsi zvuk slyšel.", 4000);
    } else {
      st.mode = "view";
      if (map) map.getContainer().classList.remove("leaflet-crosshair");
      $("btn-add").setAttribute("aria-pressed", "false");
      clearDraftMarker();
    }
  }
  function isNarrowSheet() {
    return window.matchMedia("(max-width: 899px), (orientation: portrait) and (max-width: 1366px)").matches;
  }
  function showPanel(state) {
    var panel = $("panel");
    if (state === "hidden" || !state) {
      st.sheet = "hidden";
      panel.classList.add("is-hidden");
      panel.classList.remove("is-collapsed");
    } else {
      st.sheet = isNarrowSheet() && state === "collapsed" ? "collapsed" : "expanded";
      panel.classList.remove("is-hidden");
      panel.classList.toggle("is-collapsed", st.sheet === "collapsed");
    }
    setTimeout(function () { if (map) map.invalidateSize(); }, 80);
  }
  function selectPlace(id, eventId) {
    st.selectedId = id;
    var p = selected();
    var evs = entriesOf(p).filter(function (e) { return !e.hidden || st.showHidden; });
    st.eventId = eventId || (evs.length ? evs[evs.length - 1].id : null);
    if (st.mode !== "add") st.mode = "view";
    syncMarkers();
    renderPanel();
  }

  /* ---------- render ---------- */
  function slotView(url, kind) {
    if (url) {
      if (kind === "photo") return "<div class=\"zm-slot has-media\"><img src=\"" + esc(url) + "\" alt=\"Fotografie místa\"></div>";
      return "<div class=\"zm-slot has-media\">" + ICO.sound + "<audio controls preload=\"none\" src=\"" + esc(url) + "\"></audio></div>";
    }
    if (kind === "photo") return "<div class=\"zm-slot\">" + ICO.photo + "<span>Zatím bez fotografie</span></div>";
    return "<div class=\"zm-slot\">" + ICO.sound + "<span>Zatím bez zvuku</span></div>";
  }
  function photosView(place) {
    var list = placePhotos(place);
    if (!list.length) return "<div class=\"zm-slot\">" + ICO.photo + "<span>Zatím bez fotografie</span></div>";
    return "<div class=\"zm-phgrid\">" + list.map(function (ph) {
      return "<button type=\"button\" class=\"zm-ph__open\" data-lightbox=\"" + esc(ph.url) + "\"><img src=\"" + esc(ph.url) + "\" alt=\"Fotografie místa\"></button>";
    }).join("") + "</div>";
  }
  function closeBtn() {
    return "<button class=\"zm-close\" type=\"button\" id=\"btn-close\" aria-label=\"Zavřít panel\">" + ICO.close + "</button>";
  }
  function renderView(place) {
    var c = catOf(place);
    var evs = entriesOf(place).filter(function (e) { return !e.hidden || st.showHidden; });
    var ev = evs.find(function (e) { return e.id === st.eventId; }) || evs[evs.length - 1];
    var badge = place.hidden ? "<span class=\"zm-badge\">Skryté</span>" : "";
    var who = place.author ? "<p class=\"zm-author\">Kdo: " + esc(place.author) + "</p>" : "";
    var recorded = place.recorded_at ? "<p class=\"zm-author\">Nahráno: " + esc(formatDateCZ(place.recorded_at)) + "</p>" : "";
    var axis = evs.length ? evs.map(function (e) {
      var cur = ev && e.id === ev.id;
      var when = e.when_exact ? e.when_exact : e.year;
      return "<button type=\"button\" class=\"zm-axis__item" + (e.hidden ? " is-hidden" : "") + "\" data-event=\"" + esc(e.id) + "\" aria-current=\"" + (cur ? "true" : "false") + "\">" +
        "<span class=\"zm-axis__dot\"></span>" +
        "<span class=\"zm-axis__year\">" + esc(when) + "</span>" +
        "<span class=\"zm-axis__title\">" + esc(e.title) + "</span></button>";
    }).join("") : "";
    var evHtml = "";
    if (ev) {
      var evWhen = ev.when_exact ? ev.when_exact : ev.year;
      evHtml = "<div class=\"zm-event\">" +
        "<div class=\"zm-event__year\">" + esc(evWhen) + (ev.hidden ? " · skryté" : "") + "</div>" +
        "<h4>" + esc(ev.title) + "</h4>" +
        (ev.text ? "<p>" + esc(ev.text) + "</p>" : "") +
        (ev.author ? "<p class=\"zm-author\">Kdo: " + esc(ev.author) + "</p>" : "") +
        (ev.source ? "<p class=\"zm-source\">Odkud: " + esc(ev.source) + "</p>" : "") +
        (ev.photo_url ? "<div class=\"zm-media\">" + slotView(ev.photo_url, "photo") + "</div>" : "") +
        (isTeacher() ? (ev.hidden
          ? "<button type=\"button\" class=\"zm-link\" id=\"btn-restore-entry\">Obnovit zastavení</button>"
          : "<button type=\"button\" class=\"zm-link zm-link--danger\" id=\"btn-hide-entry\">Skrýt zastavení</button>") : "") +
        "</div>";
    }
    var timeline = evs.length
      ? "<div class=\"zm-timeline\"><div class=\"zm-axis\">" + axis + "</div></div>" + evHtml
      : "<p class=\"zm-hint\">Jak to tu znělo dřív? Zeptej se babičky nebo dědy, najdi starou fotku nebo zápis v kronice.</p>" +
        "<button type=\"button\" class=\"c-btn c-btn--secondary\" id=\"btn-add-from-empty\">" + ICO.plus + " Přidat zastavení</button>";
    return "<div class=\"zm-handle\" aria-hidden=\"true\"></div>" +
      "<div class=\"zm-panel__top\">" + closeBtn() + "</div>" +
      "<div class=\"zm-panel__scroll\">" +
      "<div class=\"zm-sheet-peek\"><div class=\"zm-kicker\"><span class=\"zm-cat\"><span class=\"zm-dot\" style=\"background:" + c.color + "\"></span>" + esc(c.name) + "</span>" + badge + "</div>" +
      "<h2>" + esc(place.title) + "</h2>" + who + recorded + "</div>" +
      (place.description ? "<p class=\"zm-desc\">" + esc(place.description) + "</p>" : "") +
      "<div class=\"zm-block\"><h3>Zvuk a fotografie místa</h3>" +
      slotView(place.audio_url, "audio") + photosView(place) +
      "</div>" +
      "<div class=\"zm-block\"><h3>Historie zvuku <span>— časová osa příběhu</span></h3>" + timeline + "</div>" +
      "</div>" +
      "<div class=\"zm-panel__foot\">" +
      "<button class=\"c-btn c-btn--secondary\" type=\"button\" id=\"btn-edit\">" + ICO.edit + " Upravit</button>" +
      (isTeacher() ? (place.hidden
        ? "<button type=\"button\" class=\"zm-link\" id=\"btn-restore\">Obnovit místo</button>"
        : "<button type=\"button\" class=\"zm-link zm-link--danger\" id=\"btn-hide\">Skrýt místo</button>") : "") +
      "<nav class=\"zm-tally\" aria-label=\"Patička\"><a href=\"o-aplikaci.html\">O aplikaci</a><a href=\"otazky.html\">Časté otázky</a><a href=\"https://tally.so/r/Qo1aeY\">Napsat připomínku</a></nav>" +
      "</div>";
  }
  function mediaField(label, target, kind, currentUrl, draftMedia, cleared) {
    var preview = draftMedia && draftMedia.preview;
    var has = preview || (currentUrl && !cleared);
    var src = preview || (currentUrl && !cleared ? currentUrl : "");
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
      (recOn ? "<div class=\"zm-rec is-on\"><span class=\"zm-rec__dot\"></span><span id=\"rec-clock\">0:00 / " + fmtMmSs(recMaxMs()) + "</span></div>" : "") +
      "<div class=\"zm-upload__btns\">" +
      "<label class=\"c-btn c-btn--secondary\"><input class=\"sr-only\" type=\"file\" accept=\"" + (kind === "photo" ? "image/*" : "audio/*") + "\" data-upload=\"" + target + "\" data-kind=\"" + kind + "\">Vybrat soubor</label>" +
      recBtn +
      (has ? "<button type=\"button\" class=\"zm-link zm-link--danger\" data-clear=\"" + target + "\" data-kind=\"" + kind + "\">Odebrat</button>" : "") +
      "</div></div>";
  }
  function photosField(d) {
    var items = d.photos || [];
    var cells = items.map(function (ph, i) {
      var src = (ph.file && ph.file.preview) || ph.url;
      return "<div class=\"zm-ph\"><button type=\"button\" class=\"zm-ph__open\" data-lightbox=\"" + esc(src) + "\"><img src=\"" + esc(src) + "\" alt=\"\"></button>" +
        "<button type=\"button\" class=\"zm-link zm-link--danger\" data-del-photo=\"" + i + "\">Odebrat</button></div>";
    }).join("");
    var add = items.length < 6
      ? "<label class=\"c-btn c-btn--secondary\"><input class=\"sr-only\" type=\"file\" accept=\"image/*\" id=\"f-photos\" multiple>Přidat fotku</label>"
      : "";
    return "<div class=\"zm-upload\"><span class=\"c-label\">Fotografie (nejvýš 6)</span><div class=\"zm-phgrid\">" + cells + "</div>" + add + "</div>";
  }
  function emptyEntry() {
    return { id: null, year: "", when_exact: "", title: "", author: "", source: "", text: "", sort: 0, photo_url: null, photo: null, clear_photo: false, updated_at: null };
  }
  function openForm(mode, place) {
    st.mode = mode;
    if (mode === "add") {
      st.draft = {
        id: null, category: "mech", title: "", author: "", description: "",
        lat: st.addLatLng ? st.addLatLng.lat : schoolLatLng()[0],
        lng: st.addLatLng ? st.addLatLng.lng : schoolLatLng()[1],
        recorded_at: todayISO(), photos: [], audio_url: null, audio: null,
        clear_audio: false, entries: []
      };
      placeDraftMarker();
    } else {
      var evs = entriesOf(place);
      st.draft = {
        id: place.id, category: place.category, title: place.title, author: place.author || "",
        description: place.description || "", lat: place.lat, lng: place.lng,
        recorded_at: place.recorded_at || todayISO(), updated_at: place.updated_at,
        photos: placePhotos(place).map(function (ph) { return { path: ph.path || null, url: ph.url, file: null }; }),
        audio_url: place.audio_url, audio: null, clear_audio: false,
        entries: evs.map(function (e) {
          return {
            id: e.id, year: e.year, when_exact: e.when_exact || "", title: e.title,
            author: e.author || "", source: e.source || "", text: e.text || "",
            sort: e.sort, photo_url: e.photo_url, photo: null, clear_photo: false,
            hidden: e.hidden, updated_at: e.updated_at
          };
        })
      };
      st.addLatLng = { lat: place.lat, lng: place.lng };
      placeDraftMarker();
      if (draftMarker) draftMarker.dragging.enable();
    }
    renderPanel();
  }
  function readForm() {
    var d = st.draft;
    if (!d) return;
    var catBtn = document.querySelector("#form-cat [aria-pressed='true']");
    d.category = catBtn ? catBtn.getAttribute("data-v") : d.category;
    d.title = ($("f-title") || {}).value || "";
    d.author = ($("f-author") || {}).value || "";
    d.description = ($("f-desc") || {}).value || "";
    d.recorded_at = ($("f-recorded") || {}).value || d.recorded_at;
    d.entries.forEach(function (e, i) {
      var yearEl = document.querySelector("[data-eyear=\"" + i + "\"]");
      var whenEl = document.querySelector("[data-ewhen=\"" + i + "\"]");
      var titleEl = document.querySelector("[data-etitle=\"" + i + "\"]");
      var whoEl = document.querySelector("[data-eauthor=\"" + i + "\"]");
      var srcEl = document.querySelector("[data-esource=\"" + i + "\"]");
      var textEl = document.querySelector("[data-etext=\"" + i + "\"]");
      if (yearEl) e.year = yearEl.value;
      if (whenEl) e.when_exact = whenEl.value;
      if (titleEl) e.title = titleEl.value;
      if (whoEl) e.author = whoEl.value;
      if (srcEl) e.source = srcEl.value;
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
        "<div class=\"zm-entry__top\"><span class=\"c-label\">Zastavení " + (i + 1) + (e.hidden ? " (skryté)" : "") + "</span>" +
        (e.id ? "" : "<button type=\"button\" class=\"zm-link zm-link--danger\" data-del-entry=\"" + i + "\">Odebrat ze seznamu</button>") + "</div>" +
        "<div class=\"zm-form__row\">" +
        "<div class=\"c-field\"><label class=\"c-label\" for=\"ey-" + i + "\">Rok</label>" +
        "<input class=\"c-input\" id=\"ey-" + i + "\" data-eyear=\"" + i + "\" type=\"number\" min=\"1\" max=\"3000\" required value=\"" + esc(e.year) + "\">" +
        "<p class=\"zm-help\">Když nevíš přesně, napiš přibližně.</p></div>" +
        "<div class=\"c-field\"><label class=\"c-label\" for=\"ew-" + i + "\">Kdy přesně</label>" +
        "<input class=\"c-input\" id=\"ew-" + i + "\" data-ewhen=\"" + i + "\" type=\"text\" maxlength=\"80\" placeholder=\"jaro 1891, 90. léta…\" value=\"" + esc(e.when_exact || "") + "\"></div>" +
        "</div>" +
        "<div class=\"c-field\"><label class=\"c-label\" for=\"et-" + i + "\">Název</label>" +
        "<input class=\"c-input\" id=\"et-" + i + "\" data-etitle=\"" + i + "\" type=\"text\" maxlength=\"120\" value=\"" + esc(e.title) + "\"></div>" +
        "<div class=\"c-field\"><label class=\"c-label\" for=\"ex-" + i + "\">Co jsi zjistil(a)</label>" +
        "<textarea class=\"c-input\" id=\"ex-" + i + "\" data-etext=\"" + i + "\" rows=\"3\">" + esc(e.text) + "</textarea></div>" +
        "<div class=\"c-field\"><label class=\"c-label\" for=\"ea-" + i + "\">Kdo</label>" +
        "<input class=\"c-input\" id=\"ea-" + i + "\" data-eauthor=\"" + i + "\" type=\"text\" maxlength=\"80\" value=\"" + esc(e.author || "") + "\">" +
        "<p class=\"zm-help\">Třída nebo křestní jméno, bez příjmení</p></div>" +
        "<div class=\"c-field\"><label class=\"c-label\" for=\"es-" + i + "\">Odkud to víš</label>" +
        "<input class=\"c-input\" id=\"es-" + i + "\" data-esource=\"" + i + "\" type=\"text\" maxlength=\"200\" placeholder=\"od babičky, z kroniky…\" value=\"" + esc(e.source) + "\">" +
        "<p class=\"zm-help\">Nepovinné</p></div>" +
        mediaField("Fotka", i, "photo", e.photo_url, e.photo, e.clear_photo) +
        "</div>";
    }).join("");
    return "<div class=\"zm-handle\" aria-hidden=\"true\"></div>" +
      "<div class=\"zm-panel__top\"><span class=\"zm-badge\">" + (st.mode === "add" ? "Nové místo" : "Úprava příspěvku") + "</span>" + closeBtn() + "</div>" +
      "<form class=\"zm-panel__scroll zm-form\" id=\"place-form\">" +
      "<div class=\"c-field\"><span class=\"c-label\" id=\"lbl-cat\">Kategorie</span>" +
      "<div class=\"c-seg\" role=\"group\" aria-labelledby=\"lbl-cat\" id=\"form-cat\">" + segs + "</div></div>" +
      "<div class=\"c-field\"><label class=\"c-label\" for=\"f-title\">Název</label>" +
      "<input class=\"c-input\" id=\"f-title\" type=\"text\" maxlength=\"120\" required value=\"" + esc(d.title) + "\"></div>" +
      mediaField("Zvuk", "place", "audio", d.audio_url, d.audio, d.clear_audio) +
      "<div class=\"c-field\"><label class=\"c-label\" for=\"f-recorded\">Kdy jsi zvuk nahrál(a)</label>" +
      "<input class=\"c-input\" id=\"f-recorded\" type=\"date\" value=\"" + esc(d.recorded_at || todayISO()) + "\"></div>" +
      photosField(d) +
      "<div class=\"c-field\"><label class=\"c-label\" for=\"f-desc\">Popis</label>" +
      "<textarea class=\"c-input\" id=\"f-desc\" rows=\"3\">" + esc(d.description) + "</textarea></div>" +
      "<div class=\"c-field\"><label class=\"c-label\" for=\"f-author\">Kdo</label>" +
      "<input class=\"c-input\" id=\"f-author\" type=\"text\" maxlength=\"80\" value=\"" + esc(d.author) + "\">" +
      "<p class=\"zm-help\">Třída nebo křestní jméno, bez příjmení. Nemusíte vyplňovat.</p></div>" +
      "<div class=\"zm-block\"><h3>Historie zvuku</h3>" +
      (entries || "<p class=\"zm-hint\">Jak to tu znělo dřív? Zeptej se babičky nebo dědy, najdi starou fotku nebo zápis v kronice.</p>") +
      "<button type=\"button\" class=\"c-btn c-btn--secondary\" id=\"btn-add-entry\">" + ICO.plus + " Přidat zastavení</button>" +
      "</div></form>" +
      "<div class=\"zm-panel__foot\">" +
      "<button class=\"c-btn c-btn--primary\" type=\"button\" id=\"btn-save\">Uložit</button>" +
      "<button class=\"c-btn c-btn--secondary\" type=\"button\" id=\"btn-cancel\">Zrušit</button>" +
      "</div>";
  }
  function renderEmpty() {
    return "<div class=\"zm-handle\" aria-hidden=\"true\"></div>" +
      "<div class=\"zm-panel__top\">" + closeBtn() + "</div>" +
      "<div class=\"zm-panel__scroll zm-empty zm-sheet-peek\">" +
      "<h2>Zvuková mapa</h2>" +
      "<p>Klepni na značku na mapě, nebo přidej nové místo. Úpravy chrání heslo třídy.</p>" +
      "</div>" +
      "<div class=\"zm-panel__foot\"><nav class=\"zm-tally\" aria-label=\"Patička\"><a href=\"o-aplikaci.html\">O aplikaci</a><a href=\"otazky.html\">Časté otázky</a><a href=\"https://tally.so/r/Qo1aeY\">Napsat připomínku</a></nav></div>";
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
    var close = $("btn-close");
    if (close) close.addEventListener("click", function () {
      if (st.rec) stopRec(true);
      setAddMode(false);
      st.selectedId = null;
      showPanel("hidden");
      syncMarkers();
    });
    var handle = $("panel").querySelector(".zm-handle");
    var peek = $("panel").querySelector(".zm-sheet-peek");
    function toggleSheet() {
      if (!isNarrowSheet() || $("panel").classList.contains("is-hidden")) return;
      showPanel(st.sheet === "collapsed" ? "expanded" : "collapsed");
    }
    if (handle) handle.addEventListener("click", toggleSheet);
    if (peek) peek.addEventListener("click", function (e) {
      if (e.target.closest("button, a, input, label")) return;
      if (isNarrowSheet() && st.sheet === "collapsed") showPanel("expanded");
    });
    $("panel").querySelectorAll("[data-event]").forEach(function (btn) {
      btn.addEventListener("click", function () { selectPlace(st.selectedId, btn.getAttribute("data-event")); showPanel("expanded"); });
    });
    var edit = $("btn-edit");
    if (edit) edit.addEventListener("click", function () {
      var p = selected();
      if (p) { openForm("edit", p); showPanel("expanded"); }
    });
    var cancel = $("btn-cancel");
    if (cancel) cancel.addEventListener("click", function () {
      if (st.rec) stopRec(true);
      setAddMode(false);
      st.mode = "view";
      renderPanel();
      syncMarkers();
    });
    var save = $("btn-save");
    if (save) save.addEventListener("click", function () { savePlace(); });
    var hide = $("btn-hide");
    if (hide) hide.addEventListener("click", function () { hidePlace(true); });
    var restore = $("btn-restore");
    if (restore) restore.addEventListener("click", function () { hidePlace(false); });
    var hideE = $("btn-hide-entry");
    if (hideE) hideE.addEventListener("click", function () { hideEntry(true); });
    var restoreE = $("btn-restore-entry");
    if (restoreE) restoreE.addEventListener("click", function () { hideEntry(false); });
    var addE = $("btn-add-entry");
    var addEmpty = $("btn-add-from-empty");
    function addEntry() {
      if (st.mode === "view") {
        var p = selected();
        if (p) { openForm("edit", p); }
      }
      readForm();
      if (!st.draft) return;
      st.draft.entries.push(emptyEntry());
      renderPanel();
    }
    if (addE) addE.addEventListener("click", addEntry);
    if (addEmpty) addEmpty.addEventListener("click", addEntry);
    $("panel").querySelectorAll("[data-del-entry]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        readForm();
        var i = parseInt(btn.getAttribute("data-del-entry"), 10);
        if (!st.draft.entries[i]) return;
        st.draft.entries.splice(i, 1);
        renderPanel();
      });
    });
    var cat = $("form-cat");
    if (cat) cat.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        cat.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        if (st.draft) {
          st.draft.category = b.getAttribute("data-v");
          placeDraftMarker();
        }
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
          if (target === "place") { st.draft[kind] = media; st.draft["clear_" + kind] = false; }
          else {
            var e = st.draft.entries[parseInt(target, 10)];
            if (e) { e[kind] = media; e["clear_" + kind] = false; }
          }
          if (media.warn) toast(media.warn, 4000);
        } catch (err) { toast(err.message || "Soubor se nepodařilo načíst."); }
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
    $("panel").querySelectorAll("[data-lightbox]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(btn.getAttribute("data-lightbox"));
      });
    });
    $("panel").querySelectorAll("[data-del-photo]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        readForm();
        var i = parseInt(btn.getAttribute("data-del-photo"), 10);
        if (st.draft && st.draft.photos) st.draft.photos.splice(i, 1);
        renderPanel();
      });
    });
    var addPh = $("f-photos");
    if (addPh) addPh.addEventListener("change", async function () {
      var files = addPh.files ? Array.prototype.slice.call(addPh.files) : [];
      readForm();
      if (!st.draft.photos) st.draft.photos = [];
      for (var i = 0; i < files.length; i++) {
        if (st.draft.photos.length >= 6) { toast("K místu lze přidat nejvýš 6 fotek."); break; }
        try {
          var media = await compressPhoto(files[i]);
          st.draft.photos.push({ path: null, url: media.preview, file: media });
          if (media.warn) toast(media.warn, 4000);
        } catch (err) { toast(err.message || "Soubor se nepodařilo načíst."); }
      }
      renderPanel();
    });
    var cur = $("panel").querySelector(".zm-axis__item[aria-current='true']");
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ inline: "center", block: "nearest" });
  }

  async function savePlace() {
    if (st.busy || !st.draft) return;
    readForm();
    var d = st.draft;
    if (!d.title.trim()) { toast("Vyplňte název místa."); return; }
    if (!Number.isFinite(d.lat) || !Number.isFinite(d.lng)) { toast("Klepni do mapy, kde jsi zvuk slyšel."); return; }
    st.busy = true;
    renderPanel();
    try {
      var payload = {
        action: d.id ? "update_place" : "create_place",
        place: {
          id: d.id, category: d.category, title: d.title.trim(), author: d.author.trim(),
          description: d.description.trim(), lat: d.lat, lng: d.lng,
          recorded_at: d.recorded_at || todayISO(), updated_at: d.updated_at
        },
        keep_photos: (d.photos || []).filter(function (ph) { return ph.path && !ph.file; }).map(function (ph) { return ph.path; }),
        photos: (d.photos || []).filter(function (ph) { return ph.file; }).map(function (ph) { return { mime: ph.file.mime, data: ph.file.data }; }),
        clear_audio: !!d.clear_audio && !d.audio,
        entry_stamps: (d.entries || []).filter(function (e) { return e.id; }).map(function (e) { return { id: e.id, updated_at: e.updated_at }; })
      };
      if (d.audio) payload.audio = { mime: d.audio.mime, data: d.audio.data };
      var out = await write(payload);
      var placeId = out.place.id;
      for (var j = 0; j < d.entries.length; j++) {
        var e = d.entries[j];
        if (!String(e.title || "").trim() || !e.year) continue;
        var ep = {
          action: e.id ? "update_entry" : "add_entry",
          entry: {
            id: e.id, place_id: placeId, year: e.year, when_exact: String(e.when_exact || "").trim(),
            title: String(e.title).trim(), author: String(e.author || "").trim(),
            source: String(e.source || "").trim(), text: String(e.text || "").trim(),
            sort: j, updated_at: e.updated_at
          },
          clear_photo: !!e.clear_photo && !e.photo
        };
        if (e.photo) ep.photo = { mime: e.photo.mime, data: e.photo.data };
        await write(ep);
      }
      gc(d.id ? "Zvuková mapa: úprava" : "Zvuková mapa: přidání místa");
      setAddMode(false);
      await refresh(placeId);
      toast("Uloženo.");
    } catch (err) {
      if (err.code === 401) { lock(); return; }
      if (err.code === 409) {
        try { await loadPlaces(); } catch (e2) {}
        st.busy = false;
        var fresh = err.place || (d.id && st.places.find(function (p) { return p.id === d.id; }));
        if (fresh) {
          var idx = st.places.findIndex(function (p) { return p.id === fresh.id; });
          if (idx >= 0) st.places[idx] = fresh;
          else st.places.push(fresh);
          openForm("edit", fresh);
          showPanel("expanded");
        } else renderPanel();
        toast(err.message);
        return;
      }
      toast(err.message || "Uložení se nezdařilo.");
      st.busy = false;
      renderPanel();
    }
  }
  async function hidePlace(hide) {
    if (!isTeacher() || !selected()) return;
    try {
      await write({ action: hide ? "hide_place" : "restore_place", place: { id: selected().id } });
      gc(hide ? "Zvuková mapa: skrytí" : "Zvuková mapa: obnovení");
      await refresh(hide && !st.showHidden ? null : selected().id);
      toast(hide ? "Místo je skryté." : "Místo je znovu vidět.");
    } catch (err) {
      if (err.code === 401) { lock(); return; }
      toast(err.message || "Změna se nezdařila.");
    }
  }
  async function hideEntry(hide) {
    if (!isTeacher() || !st.eventId) return;
    try {
      await write({ action: hide ? "hide_entry" : "restore_entry", entry: { id: st.eventId } });
      await refresh(st.selectedId);
      toast(hide ? "Zastavení je skryté." : "Zastavení je znovu vidět.");
    } catch (err) {
      if (err.code === 401) { lock(); return; }
      toast(err.message || "Změna se nezdařila.");
    }
  }
  async function refresh(selectId) {
    st.busy = false;
    await loadPlaces();
    if (selectId) st.selectedId = selectId;
    if (st.selectedId && !st.places.some(function (p) { return p.id === st.selectedId; })) st.selectedId = null;
    var p = selected();
    var evs = p ? entriesOf(p).filter(function (e) { return !e.hidden || st.showHidden; }) : [];
    st.eventId = evs.length ? evs[evs.length - 1].id : null;
    st.mode = "view";
    syncMarkers();
    renderPanel();
    if (!st.selectedId) showPanel("hidden");
  }

  async function exportJson() {
    var bundle = {
      version: 1,
      exportedAt: new Date().toISOString(),
      places: st.places.map(function (p) {
        return {
          id: p.id, category: p.category, title: p.title, author: p.author, description: p.description,
          lat: p.lat, lng: p.lng, hidden: !!p.hidden, recorded_at: p.recorded_at || null,
          photo_url: p.photo_url || null, audio_url: p.audio_url || null,
          timeline: entriesOf(p).map(function (e) {
            return {
              id: e.id, year: e.year, when_exact: e.when_exact || "", title: e.title,
              author: e.author || "", source: e.source, text: e.text, sort: e.sort, hidden: !!e.hidden,
              photo_url: e.photo_url || null
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
    try {
      var n = 0;
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        var out = await write({
          action: "create_place",
          place: { category: p.category, title: p.title, author: p.author || "", description: p.description || "", lat: p.lat, lng: p.lng, recorded_at: p.recorded_at || null }
        });
        var evs = p.timeline || p.timeline_entries || [];
        for (var j = 0; j < evs.length; j++) {
          var e = evs[j];
          await write({
            action: "add_entry",
            entry: { place_id: out.place.id, year: e.year, when_exact: e.when_exact || "", title: e.title, author: e.author || "", source: e.source || "", text: e.text || "", sort: j }
          });
        }
        n++;
      }
      gc("Zvuková mapa: import");
      await refresh();
      toast("Importováno: " + n + " míst.");
    } catch (err) {
      if (err.code === 401) { lock(); return; }
      toast(err.message || "Import se nezdařil.");
    }
  }

  function showApp() {
    $("gate").hidden = true;
    $("app-main").hidden = false;
    st.unlocked = true;
  }
  function lock() {
    setPassword("");
    st.unlocked = false;
    st.role = "";
    st.places = [];
    $("gate").hidden = false;
    $("app-main").hidden = true;
    $("teacher-bar").hidden = true;
    $("gate-err").hidden = false;
    $("gate-err").textContent = "Heslo nesedí.";
    $("gate-input").value = "";
    $("gate-input").focus();
  }
  async function unlock(password) {
    setPassword(password);
    try {
      await loadPlaces();
      showApp();
      if (!map) initMap();
      else syncShell();
      setSchool(st.school, true);
      syncMarkers();
      showPanel("hidden");
      gc("Zvuková mapa: otevření");
    } catch (err) {
      setPassword("");
      $("gate-err").hidden = false;
      $("gate-err").textContent = "Heslo nesedí.";
      throw err;
    }
  }

  function syncShell() {
    var header = document.querySelector(".v-header");
    if (header) {
      document.documentElement.style.setProperty("--zm-header-h", header.offsetHeight + "px");
    }
    if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
    if (map) map.invalidateSize();
  }
  function bindPanelToMap() {
    var panel = $("panel");
    if (!panel || !window.L || !L.DomEvent || panel.getAttribute("data-zm-bound") === "1") return;
    L.DomEvent.disableScrollPropagation(panel);
    L.DomEvent.disableClickPropagation(panel);
    panel.setAttribute("data-zm-bound", "1");
  }
  function bindChrome() {
    $("gate-form").addEventListener("submit", async function (e) {
      e.preventDefault();
      var v = $("gate-input").value.trim();
      $("gate-err").hidden = true;
      if (!v) {
        $("gate-err").textContent = "Zadej heslo.";
        $("gate-err").hidden = false;
        return;
      }
      try { await unlock(v); }
      catch (err) { /* hláška už je v lock/unlock */ }
    });
    $("btn-add").addEventListener("click", function () {
      if (st.mode === "add" && !st.draft) { setAddMode(false); return; }
      setAddMode(true);
    });
    $("skoly").querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { setSchool(b.getAttribute("data-v"), true); });
    });
    $("btn-hidden").addEventListener("click", function () {
      st.showHidden = !st.showHidden;
      $("btn-hidden").setAttribute("aria-checked", st.showHidden ? "true" : "false");
      if (selected() && selected().hidden && !st.showHidden) {
        st.selectedId = null;
        showPanel("hidden");
      }
      syncMarkers();
      renderPanel();
    });
    $("btn-export").addEventListener("click", exportJson);
    $("import-file").addEventListener("change", function () {
      var f = this.files && this.files[0];
      this.value = "";
      if (f) importJson(f);
    });
    window.addEventListener("resize", function () {
      syncShell();
      if (st.sheet !== "hidden") showPanel(st.sheet === "collapsed" ? "collapsed" : "expanded");
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", syncShell);
      window.visualViewport.addEventListener("scroll", function () { window.scrollTo(0, 0); });
    }
    window.addEventListener("scroll", function () { window.scrollTo(0, 0); }, { passive: true });
    syncShell();
    bindPanelToMap();
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) pollRefresh();
    });
    setInterval(pollRefresh, 20000);
    var lb = $("lightbox");
    if (lb) {
      $("lightbox-close").addEventListener("click", closeLightbox);
      lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
    window.__ZM_test = {
      poll: pollRefresh,
      addAt: function (lat, lng) {
        st.addLatLng = { lat: lat, lng: lng };
        setAddMode(true);
        openForm("add");
        showPanel("expanded");
      },
      selectedId: function () { return st.selectedId; },
      recMaxMs: recMaxMs,
      places: function () {
        return st.places.map(function (p) { return { id: p.id, title: p.title, updated_at: p.updated_at }; });
      },
      open: function (id) {
        var p = st.places.filter(function (x) { return x.id === id; })[0];
        if (!p) return false;
        st.selectedId = id;
        st.mode = "view";
        renderPanel();
        showPanel("expanded");
        return true;
      },
      hidden: function () { return document.hidden; }
    };
  }

  async function init() {
    st.school = savedSchool();
    bindChrome();
    setSchool(st.school, false);
    var existing = getPassword();
    if (existing) {
      try { await unlock(existing); return; }
      catch (e) { /* ukaž bránu */ }
    }
    $("gate-input").focus();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
