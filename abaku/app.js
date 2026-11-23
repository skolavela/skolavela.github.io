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
  var PAGE_W = 210, PAGE_H = 297, MX = 14, MT = 12, MB = 9, HEAD = 12, NAME = 11, SUB = 8, FOOT = 8;
  var CONTENT_W = PAGE_W - 2 * MX, COL_GAP = 10, LABEL = 9, INSTR = 11, MIN_GAP = 3.5;
  var B_MAX = 20; /* největší rámeček v mm */

  /* Písmo podle velikosti rámečku (mm). */
  function fSmall(b) { return Math.max(3.6, 0.3 * b); }  /* číslo úlohy, „← zprava“ */
  function fYn(b) { return Math.max(4.2, 0.36 * b); }    /* ano / ne */
  /* Odhad šířky textu v mm (systémové písmo, průměrná šířka znaku ~0,56 em). */
  function textW(chars, f) { return chars * 0.56 * f; }

  /* Šířka řádku úlohy při rámečku b (mm).
     Zadání: mezera mezi rámečky = rámeček (místo na ruční znaménko). Řešení: mezera 0,55 rámečku. */
  function itemWidth(kind, len, b, solution, rtl) {
    var g = solution ? 0.55 * b : b;
    var w = LABEL + len * b + (len - 1) * g;
    if (!solution && kind === "ano") w += 4 + textW(5, fYn(b)) + 5 + 2;
    if (solution && rtl) w += textW(9, fSmall(b)) + 3;
    if (solution && kind === "ano") w += 3 + textW(4, fSmall(b) * 1.1);
    return w;
  }

  /* Rozvržení: pro každý oddíl 1 nebo 2 sloupce, společná velikost rámečku co největší,
     aby se vše vešlo na šířku i výšku strany a strana byla co nejvíc vyplněná. */
  function layout(sections, len, solution, rtl) {
    var avail = PAGE_H - MT - MB - HEAD - FOOT - (solution ? SUB : NAME) - sections.length * INSTR;
    var best = null, combos = 1 << sections.length, c, i;
    for (c = 0; c < combos; c++) {
      var cols = sections.map(function (s, k) { return (c >> k) & 1 ? 2 : 1; });
      var rows = sections.reduce(function (n, s, k) { return n + Math.ceil(s.tasks.length / cols[k]); }, 0);
      var b;
      for (b = B_MAX; b > 4; b -= 0.1) {
        var okW = sections.every(function (s, k) {
          var colW = cols[k] === 2 ? (CONTENT_W - COL_GAP) / 2 : CONTENT_W;
          return itemWidth(s.kind, len, b, solution, rtl) <= colW;
        });
        if (okW && rows * (b + MIN_GAP) <= avail) break;
      }
      var fill = rows * b; /* čím víc plochy rámečky zaberou, tím líp */
      if (!best || b > best.b + 0.05 || (Math.abs(b - best.b) <= 0.05 && fill > best.fill))
        best = { b: b, cols: cols, rows: rows, fill: fill };
    }
    var gap = Math.min(Math.max(MIN_GAP, best.b * 1.1), (avail - best.rows * best.b) / best.rows);
    return sections.map(function (s, k) {
      return { kind: s.kind, tasks: s.tasks, cols: best.cols[k], rows: Math.ceil(s.tasks.length / best.cols[k]), b: best.b, gap: gap };
    });
  }

  function boxes(str, b, gapR, signs) {
    var h = '<span class="ab-digits" style="--b:' + b.toFixed(2) + 'mm;--g:' + (gapR * b).toFixed(2) + 'mm">';
    for (var i = 0; i < str.length; i++) {
      if (i) h += '<span class="ab-gap">' + (signs && signs[i] ? esc(signs[i]) : "") + "</span>";
      h += '<span class="ab-box">' + str.charAt(i) + "</span>";
    }
    return h + "</span>";
  }
  /* Znaménka do mezer řetězce čteného zleva (mezera i je mezi číslicí i-1 a i). */
  function signsLtr(e) {
    var la = String(e.a).length, lb = String(e.b).length, s = {};
    s[la] = A.OPS[e.op].sign; s[la + lb] = "=";
    return s;
  }
  /* Jedno řešení do listu řešení: přednostně zleva; jen když jde řešit jen zprava, tak zprava. */
  function pickSolution(t) {
    var l = t.sol.filter(function (e) { return e.dir === "ltr"; });
    return l.length ? l[0] : t.sol[0];
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
    var rtl = solution && sheet.tasks.some(function (t) { return t.sol.length && pickSolution(t).dir === "rtl"; });
    var secs = layout(sectionsOf(sheet), sheet.cfg.len, solution, rtl), num = 0;
    var body = secs.map(function (sec) {
      var b = sec.b, st = "--fs:" + fSmall(b).toFixed(2) + "mm;--fy:" + fYn(b).toFixed(2) + "mm";
      var items = sec.tasks.map(function (t) {
        num++;
        var h = '<div class="ab-item" style="' + st + '"><span class="ab-num">' + num + ".</span>";
        if (!solution) {
          h += boxes(t.str, b, 1);
          if (sec.kind === "ano") h += '<span class="ab-yn"><span>ano</span><span>ne</span></span>';
        } else if (!t.sol.length) {
          if (rtl) h += '<span class="ab-dir"></span>';
          h += boxes(t.str, b, 0.55) + '<span class="ab-mark">není</span>';
        } else {
          var e = pickSolution(t);
          if (rtl) h += '<span class="ab-dir">' + (e.dir === "rtl" ? "\u2190 zprava" : "") + "</span>";
          /* čtení zprava: obrácený řetězec, znaménka zleva (2 4 + 8 = 3 2) */
          h += boxes(e.dir === "rtl" ? t.str.split("").reverse().join("") : t.str, b, 0.55, signsLtr(e));
          if (sec.kind === "ano") h += '<span class="ab-mark">ano</span>';
        }
        return h + "</div>";
      }).join("");
      return '<section class="ab-sec" style="--rg:' + sec.gap.toFixed(2) + 'mm">'
        + '<p class="ab-instr">' + instruction(sec.kind) + "</p>"
        + '<div class="ab-grid cols-' + sec.cols + '" style="grid-template-rows:repeat(' + sec.rows + ',auto)">' + items + "</div></section>";
    }).join("");
    var head = '<div class="ab-head"><span class="ab-title">Abaku' + (solution ? " \u2013 řešení" : "") + "</span>"
      + '<span class="ab-ops">Znaménka\u2002' + opsLine() + "</span></div>"
      + (solution
        ? '<p class="ab-sub">Uvádíme jedno řešení. Platí každé, které dává pravdivou rovnost.</p>'
        : '<p class="ab-name">Jméno: <span class="ab-line ab-line--name"></span> Datum: <span class="ab-line ab-line--date"></span></p>');
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
