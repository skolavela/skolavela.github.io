/* Abaku – rozhraní a vykreslení listu (logika je v abaku.js). */
(function () {
  "use strict";
  var A = window.Abaku;
  var $ = function (id) { return document.getElementById(id); };
  function gcEvent(path, title) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: path, title: title, event: true }); } catch (e) {}
  }
  function newSeed() { return String(100000 + Math.floor(Math.random() * 900000)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- stav v adrese (#o=pm&c=20&d=4&s=l&u=ad&n=12&r=1&l=123456) ---------- */
  var OPK = { plus: "p", minus: "m", krat: "k", deleno: "d" };
  var DEF = { ops: { plus: true, minus: true }, max: 9, len: 3, dir: "ltr", types: { ano: true, dopln: true }, count: 12, sol: true };
  function readHash() {
    var q = {}, h = location.hash.replace(/^#/, "");
    h.split("&").forEach(function (kv) { var p = kv.split("="); if (p[0]) q[p[0]] = decodeURIComponent(p[1] || ""); });
    var o = JSON.parse(JSON.stringify(DEF));
    if (q.o) { o.ops = {}; A.OP_ORDER.forEach(function (k) { if (q.o.indexOf(OPK[k]) >= 0) o.ops[k] = true; }); }
    if (q.c) o.max = +q.c;
    if (q.d) o.len = +q.d;
    if (q.s) o.dir = q.s === "b" ? "both" : "ltr";
    if (q.u) o.types = { ano: q.u.indexOf("a") >= 0, dopln: q.u.indexOf("d") >= 0 };
    if (q.n) o.count = +q.n;
    if (q.r) o.sol = q.r !== "0";
    o.seed = /^\d{1,9}$/.test(q.l || "") ? q.l : newSeed();
    var cfg = A.normalize(o);
    cfg.sol = o.sol;
    return cfg;
  }
  function writeHash() {
    var h = "#o=" + A.OP_ORDER.filter(function (k) { return S.ops[k]; }).map(function (k) { return OPK[k]; }).join("")
      + "&c=" + S.max + "&d=" + S.len + "&s=" + (S.dir === "both" ? "b" : "l")
      + "&u=" + (S.types.ano ? "a" : "") + (S.types.dopln ? "d" : "") + "&n=" + S.count
      + "&r=" + (S.sol ? 1 : 0) + "&l=" + S.seed;
    if (location.hash !== h) history.replaceState(null, "", h);
  }
  var S = readHash();

  /* ---------- ovládání ---------- */
  function paintSeg(id, val) {
    [].forEach.call($(id).querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === String(val))); });
  }
  function paintToggles(id, obj) {
    [].forEach.call($(id).querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", String(!!obj[b.dataset.v])); });
  }
  function paintLengths() {
    var info = A.lengthInfo(S), off = [];
    info.forEach(function (x) {
      var b = $("len").querySelector('[data-v="' + x.len + '"]');
      b.disabled = !x.ok;
      b.title = x.ok ? "" : (S.max === 9 ? "Potřebuje víceciferná čísla" : "S těmito volbami není dost různých úloh");
      if (!x.ok) off.push(x.len);
    });
    var note = $("lenNote");
    if (!off.length) { note.hidden = true; return; }
    note.hidden = false;
    note.textContent = S.max === 9
      ? "Z jednociferných čísel jsou řetězce jen ze 3 číslic. Pro delší zvol do 20 nebo do 100."
      : "Pro " + off.join(" a ") + " číslic s těmito volbami není dost různých úloh.";
  }
  function paint() {
    paintToggles("ops", S.ops);
    paintSeg("max", S.max);
    paintLengths();
    paintSeg("len", S.len);
    paintSeg("dir", S.dir);
    paintToggles("types", S.types);
    paintSeg("count", S.count);
    $("seed").value = S.seed;
    $("showSol").setAttribute("aria-checked", String(!!S.sol));
  }

  function update(patch, keepLen) {
    Object.keys(patch || {}).forEach(function (k) { S[k] = patch[k]; });
    var sol = S.sol;
    S = A.normalize(S); S.sol = sol;
    var fit = A.fitLength(S);
    if (fit != null) S.len = fit;
    writeHash();
    paint();
    render();
  }

  function bindSeg(id, key, num) {
    [].forEach.call($(id).querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { var p = {}; p[key] = num ? +b.dataset.v : b.dataset.v; update(p); });
    });
  }
  function bindToggles(id, key) {
    [].forEach.call($(id).querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        var o = {}; Object.keys(S[key]).forEach(function (k) { o[k] = S[key][k]; });
        o[b.dataset.v] = !o[b.dataset.v];
        if (!Object.keys(o).some(function (k) { return o[k]; })) return; /* aspoň jedna volba zůstane */
        var p = {}; p[key] = o; update(p);
      });
    });
  }
  bindToggles("ops", "ops");
  bindSeg("max", "max", true);
  bindSeg("len", "len", true);
  bindSeg("dir", "dir");
  bindToggles("types", "types");
  bindSeg("count", "count", true);
  $("seed").addEventListener("input", function () {
    var v = this.value.replace(/\D/g, "").slice(0, 9);
    if (v !== this.value) this.value = v;
    if (v) update({ seed: v });
  });
  $("seed").addEventListener("blur", function () { if (!this.value) this.value = S.seed; });
  $("newSheet").addEventListener("click", function () { update({ seed: newSeed() }); gcEvent("abaku-novy-list", "Abaku: nový list"); });
  $("showSol").addEventListener("click", function () { update({ sol: !S.sol }); });
  $("print").addEventListener("click", function () { gcEvent("abaku-tisk", "Abaku: tisk"); window.print(); });

  /* ---------- list ---------- */
  var PAGE_W = 210, PAGE_H = 297, MX = 14, MT = 13, MB = 10, HEAD = 13, FOOT = 9;
  var CONTENT_W = PAGE_W - 2 * MX, COL_GAP = 10, LABEL = 8, ANO = 22, GAP_R = 0.55, NOTE = 4.5;
  var INSTR = 11; /* výška pokynu nad oddílem */

  function rowWidth(len, b) { return len * b + (len - 1) * GAP_R * b; }
  /* rozměr okének: aby se řádek vešel do sloupce a všechny oddíly na stranu */
  function layout(sections, len, note) {
    var avail = PAGE_H - MT - MB - HEAD - FOOT;
    var out = sections.map(function (sec) {
      var extra = LABEL + (sec.kind === "ano" ? ANO : 0);
      var units = len + (len - 1) * GAP_R;
      var b2 = ((CONTENT_W - COL_GAP) / 2 - extra) / units;
      var cols = b2 >= 7 ? 2 : 1;
      var b = cols === 2 ? b2 : (CONTENT_W - extra) / units;
      return { kind: sec.kind, tasks: sec.tasks, cols: cols, b: Math.min(b, 11.5), rows: Math.ceil(sec.tasks.length / cols) };
    });
    var b = Math.min.apply(null, out.map(function (s) { return s.b; }));
    var rows = out.reduce(function (n, s) { return n + s.rows; }, 0);
    var minGap = 5;
    var noteH = note ? NOTE : 0;
    var maxB = (avail - out.length * INSTR - rows * (minGap + noteH)) / rows;
    b = Math.max(6, Math.min(b, maxB));
    var free = avail - out.length * INSTR - rows * (b + noteH);
    var gap = Math.max(minGap, Math.min(16, free / (rows + out.length)));
    out.forEach(function (s) { s.b = b; s.gap = gap; });
    return out;
  }

  function boxes(str, b, signs, cls) {
    var g = GAP_R * b, h = '<span class="ab-digits' + (cls ? " " + cls : "") + '" style="--b:' + b.toFixed(2) + 'mm;--g:' + g.toFixed(2) + 'mm">';
    for (var i = 0; i < str.length; i++) {
      if (i) h += '<span class="ab-gap">' + (signs && signs[i] ? esc(signs[i]) : "") + "</span>";
      h += '<span class="ab-box">' + str.charAt(i) + "</span>";
    }
    return h + "</span>";
  }
  /* znaménka do mezer řetězce pro danou rovnost (mezera i je mezi číslicí i-1 a i) */
  function signsFor(e, n) {
    var la = String(e.a).length, lb = String(e.b).length, s = {}, op = A.OPS[e.op].sign;
    if (e.dir === "ltr") { s[la] = op; s[la + lb] = "="; }
    else { s[n - la] = op; s[n - la - lb] = "="; }
    return s;
  }

  function opsLine() {
    return A.OP_ORDER.filter(function (k) { return S.ops[k]; }).map(function (k) { return A.OPS[k].sign; }).join("\u2002");
  }
  function instruction(kind) {
    var both = S.dir === "both" ? " Číst můžeš zleva i zprava." : "";
    return kind === "ano" ? "Je to abaku? Zakroužkuj ano, nebo ne." + both : "Doplň znaménka, aby platila rovnost." + both;
  }

  function sectionsOf(sheet) {
    var secs = [], ano = sheet.tasks.filter(function (t) { return t.type === "ano"; }), dop = sheet.tasks.filter(function (t) { return t.type === "dopln"; });
    if (ano.length) secs.push({ kind: "ano", tasks: ano });
    if (dop.length) secs.push({ kind: "dopln", tasks: dop });
    return secs;
  }

  function pageHtml(sheet, solution) {
    var secs = layout(sectionsOf(sheet), sheet.cfg.len, solution), num = 0;
    var body = secs.map(function (sec) {
      var items = sec.tasks.map(function (t) {
        num++;
        var h = '<div class="ab-item"><span class="ab-num">' + num + ".</span>";
        if (!solution) {
          h += boxes(t.str, sec.b);
          if (sec.kind === "ano") h += '<span class="ab-yn"><span>ano</span><span>ne</span></span>';
        } else if (!t.sol.length) {
          h += '<span class="ab-sol">' + boxes(t.str, sec.b) + '<span class="ab-note"><b>není</b></span></span>';
        } else {
          /* znaménka přímo v řadě (první řešení); pod řadou čtení zprava a další řešení */
          var e = t.sol[0], parts = [];
          if (sec.kind === "ano") parts.push("<b>ano</b>");
          if (e.dir === "rtl" || t.sol.length > 1)
            parts.push(esc(t.sol.slice(0, 2).map(function (x) { return (x.dir === "rtl" ? "zprava " : "") + A.eqText(x); }).join(", ")) + (t.sol.length > 2 ? " a další" : ""));
          h += '<span class="ab-sol">' + boxes(t.str, sec.b, signsFor(e, t.str.length), "is-sol")
            + '<span class="ab-note">' + parts.join(", ") + "</span></span>";
        }
        return h + "</div>";
      }).join("");
      return '<section class="ab-sec" style="--rg:' + sec.gap.toFixed(2) + 'mm">'
        + '<p class="ab-instr">' + instruction(sec.kind) + "</p>"
        + '<div class="ab-grid cols-' + sec.cols + '" style="grid-template-rows:repeat(' + sec.rows + ',auto)">' + items + "</div></section>";
    }).join("");
    var head = '<div class="ab-head"><span class="ab-title">Abaku' + (solution ? " \u2013 řešení" : "") + "</span>"
      + '<span class="ab-ops">Znaménka\u2002' + opsLine() + "</span></div>";
    var foot = '<div class="ab-foot"><span>Abaku č. ' + esc(sheet.cfg.seed) + (solution ? " \u00b7 řešení" : "") + "</span>"
      + '<span class="a-sheet__brand">' + ((window.VELA_ICONS && window.VELA_ICONS.ui_wave) || "") + "velappky.cz</span></div>";
    return '<div class="a-sheet a-sheet--portrait ab-sheet"><div class="ab-page">' + head + '<div class="ab-body">' + body + "</div>" + foot + "</div></div>";
  }

  var current = null;
  function render() {
    current = A.generate(S);
    var html = current.ok ? pageHtml(current, false) + (S.sol ? pageHtml(current, true) : "") : '<p class="c-meta">' + esc(current.message) + "</p>";
    $("pages").innerHTML = html;
    $("info").textContent = "A4 na výšku, " + (S.sol ? "2 strany: zadání a řešení." : "1 strana.") + " Stejné číslo listu dá stejný list.";
    scale();
  }
  function scale() {
    [].forEach.call(document.querySelectorAll(".ab-sheet"), function (host) {
      var page = host.firstChild, w = host.clientWidth;
      if (!w || !page) return;
      page.style.transform = "scale(" + (w / page.offsetWidth) + ")";
    });
  }
  window.addEventListener("resize", scale);
  if ("ResizeObserver" in window) new ResizeObserver(scale).observe($("pages"));
  window.addEventListener("hashchange", function () { S = readHash(); update({}); });

  update({});
  window.AbakuApp = { get S() { return S; }, get sheet() { return current; } };
})();
