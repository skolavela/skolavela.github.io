/* Součtové úlohy – rozhraní a vykreslení listu. */
function gcEvent(name, title) {
  try {
    if (window.goatcounter && window.goatcounter.count)
      window.goatcounter.count({ path: name, title: title || name, event: true });
  } catch (e) {}
}

(function () {
  "use strict";
  if (typeof document === "undefined") return;
  var G = window.Souctove;
  var $ = function (id) { return document.getElementById(id); };
  var st = G.parseHash(location.hash);
  var sheet = null;
  var INFO_BASE = "Stejné číslo vygeneruje stejný list.";

  function bindSeg(id, value, onPick) {
    var root = $(id);
    var btns = [].slice.call(root.querySelectorAll("button"));
    function paint(v) {
      btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === String(v))); });
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () { onPick(b.getAttribute("data-v")); });
    });
    paint(value);
    return { paint: paint };
  }

  function sizeButtons() {
    var sizes = st.typ === "rada" ? [5, 6, 7, 8] : [3, 4, 5];
    $("vel").innerHTML = sizes.map(function (n) {
      return '<button type="button" data-v="' + n + '">' + n + "</button>";
    }).join("");
    bindSeg("vel", st.vel, function (v) { change({ vel: +v }); });
  }

  var segs = {};
  var bound = false;
  function sync() {
    if (!bound) {
      segs.typ = bindSeg("typ", st.typ, function (v) {
        var vel = v === "rada" ? (st.typ === "rada" ? st.vel : 6) : (st.typ === "trojuhelnik" ? st.vel : 3);
        change({ typ: v, vel: vel });
      });
      segs.obor = bindSeg("obor", st.obor, function (v) { change({ obor: +v }); });
      segs.obtiznost = bindSeg("obtiznost", st.obtiznost, function (v) { change({ obtiznost: v }); });
      segs.reseni = bindSeg("reseni", st.reseni, function (v) { change({ reseni: v }); });
      segs.pocet = bindSeg("pocet", st.pocet, function (v) { change({ pocet: +v }); });
      bound = true;
    } else {
      segs.typ.paint(st.typ);
      segs.obor.paint(st.obor);
      segs.obtiznost.paint(st.obtiznost);
      segs.reseni.paint(st.reseni);
      segs.pocet.paint(st.pocet);
    }
    sizeButtons();
    $("ukazat").setAttribute("aria-checked", String(!!st.ukazat));
    $("cislo").value = st.cislo;
  }

  function labels(i) { return String.fromCharCode(97 + i) + ")"; }

  function boxHtml(val, given, showSol) {
    var cls = "su-box";
    var txt = "";
    if (given) { cls += " is-given"; txt = val; }
    else if (showSol) { cls += " is-sol"; txt = val; }
    else cls += " is-empty";
    return '<span class="' + cls + '">' + (txt === "" || txt == null ? "" : txt) + "</span>";
  }

  function triangleHtml(values, givenSet, solVals, n, showSol) {
    var h = '<div class="su-tri">', r, i, idx, given, val;
    for (r = n - 1; r >= 0; r--) {
      h += '<div class="su-row">';
      for (i = 0; i < n - r; i++) {
        idx = G.triIndex(n, r, i);
        given = givenSet[idx];
        val = showSol && solVals ? solVals[idx] : values[idx];
        h += boxHtml(val, given, showSol && !given);
      }
      h += "</div>";
    }
    return h + "</div>";
  }
  function radaHtml(values, givenSet, solVals, k, showSol) {
    var h = '<div class="su-rada">', i, given, val;
    for (i = 0; i < k; i++) {
      given = givenSet[i];
      val = showSol && solVals ? solVals[i] : values[i];
      h += boxHtml(val, given, showSol && !given);
    }
    return h + "</div>";
  }

  function taskHtml(task, letter, showSol, showHint) {
    var givenSet = {};
    task.given.forEach(function (i) { givenSet[i] = true; });
    var copies = task.multi ? 3 : 1;
    var figs = "";
    var c;
    for (c = 0; c < copies; c++) {
      var sol = showSol && task.solutions[c] ? task.solutions[c] : task.values;
      figs += task.typ === "trojuhelnik"
        ? triangleHtml(task.values, givenSet, sol, task.size, showSol)
        : radaHtml(task.values, givenSet, sol, task.size, showSol);
    }
    var hint = (showHint && task.multi) ? '<p class="su-hint">Najdi aspoň tři řešení.</p>' : "";
    var more = (showSol && task.multi && (task.solCount > 3 || task.hitCap)) ? '<p class="su-more">a další</p>' : "";
    var wide = G.taskIsWide(task.typ, task.size, copies);
    return '<article class="su-task' + (wide ? ' su-task--wide' : '') + '"><div class="su-lab">' + letter + "</div>"
      + (copies > 1 ? '<div class="su-copies">' + figs + "</div>" : figs)
      + hint + more + "</article>";
  }

  function instruction(typ) {
    return typ === "rada"
      ? "Každé číslo je součtem dvou čísel před ním. Doplň chybějící čísla."
      : "Každé číslo je součtem dvou čísel pod ním. Doplň chybějící čísla.";
  }

  function wave() {
    return (window.VELA_ICONS && window.VELA_ICONS.ui_wave) || "";
  }

  function renderPage(showSol) {
    if (!sheet) return "";
    var cols = G.gridCols(sheet.typ, sheet.size);
    var grid = sheet.tasks.map(function (t, i) {
      var hint = (st.reseni === "vice") || (st.reseni === "mix" && t.multi);
      return taskHtml(t, labels(i), showSol, hint);
    }).join("");
    return '<div class="su-page">'
      + '<div class="su-head su-meta">'
      + '<div class="su-jmeno"><span class="su-jmeno-lab">Jméno</span><span class="su-jmeno-line" aria-hidden="true"></span></div>'
      + "</div>"
      + '<p class="su-instr">' + instruction(sheet.typ) + "</p>"
      + '<div class="su-grid cols-' + cols + '">' + grid + "</div>"
      + '<div class="su-foot su-meta">'
      + "<span>Číslo zadání " + st.cislo + "</span>"
      + '<span class="a-sheet__brand">' + wave() + "velappky.cz</span>"
      + "</div></div>";
  }

  function scalePage() {
    var host = $("sheet"), page = host && host.querySelector(".su-page");
    if (!page) return;
    var w = host.clientWidth;
    if (!w) return;
    page.style.transform = "scale(" + (w / (210 * 3.7795275591)) + ")";
    /* 1 mm ≈ 3.7795 px at 96dpi; a-sheet width in px / 210mm in px */
    var mm = w / 210; /* treat preview width as 210 units */
    /* overwrite with simpler mapping: 210 CSS-mm should fill the sheet */
    var actual = page.offsetWidth || 1;
    page.style.transform = "scale(" + (w / actual) + ")";
  }

  function infoText() {
    var parts = ["Číslo zadání " + st.cislo + " – " + INFO_BASE];
    if (sheet && sheet.message) parts.push(sheet.message);
    if (sheet && sheet.count !== st.pocet && sheet.count > 0)
      /* zpráva o počtu už může být v message */
      void 0;
    return parts.join(" ");
  }

  function render() {
    $("sheet").innerHTML = renderPage(!!st.ukazat);
    $("info").textContent = infoText();
    /* ikona vlnky v patičce listu, pokud se vložila až po icons.js */
    var brand = $("sheet").querySelector(".a-sheet__brand");
    if (brand && !brand.querySelector("svg") && window.VELA_ICONS)
      brand.insertAdjacentHTML("afterbegin", wave());
    requestAnimationFrame(scalePage);
  }

  function regenerate() {
    var rnd = G.mulberry32(G.hashSeed(st.cislo));
    sheet = G.generateSheet(st, rnd);
    var cap = sheet.count;
    if (cap < st.pocet && (cap === 6 || cap === 9 || cap === 12)) {
      st.pocet = cap;
      if (segs.pocet) segs.pocet.paint(st.pocet);
    }
    writeHash(false);
    render();
  }

  function writeHash(push) {
    var h = G.formatHash(st);
    if (location.hash === h) return;
    if (push) history.pushState(null, "", h);
    else history.replaceState(null, "", h);
  }

  function change(p, fromHash) {
    var onlySol = p.ukazat != null && Object.keys(p).length === 1;
    Object.assign(st, p);
    st = G.normalizeSettings(st);
    if (!fromHash) writeHash(false);
    if (onlySol) { render(); return; }
    if (p.typ) sizeButtons();
    regenerate();
  }

  function newSheet() {
    var n = Math.floor(Math.random() * 900000) + 100000;
    gcEvent("Součtové úlohy: nový list", "Součtové úlohy: nový list");
    change({ cislo: n });
    $("cislo").value = st.cislo;
  }

  $("ukazat").addEventListener("click", function () {
    change({ ukazat: !st.ukazat });
    this.setAttribute("aria-checked", String(!!st.ukazat));
  });
  $("novy").addEventListener("click", newSheet);
  $("tisk").addEventListener("click", function () {
    gcEvent("Součtové úlohy: tisk", "Součtové úlohy: tisk");
    window.print();
  });
  $("cislo").addEventListener("change", function () {
    var v = this.value.trim() || "1";
    change({ cislo: v });
  });
  $("cislo").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); this.blur(); }
  });

  var fontCache = null;
  function loadFonts() {
    if (fontCache) return Promise.resolve(fontCache);
    var get = function (u) {
      return fetch(u).then(function (r) { return r.arrayBuffer(); }).then(function (ab) {
        var b = new Uint8Array(ab), str = "", i;
        for (i = 0; i < b.length; i += 0x8000) str += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
        return btoa(str);
      });
    };
    return Promise.all([get("fonts/LiberationSans-Regular.ttf"), get("fonts/LiberationSans-Bold.ttf")])
      .then(function (f) { fontCache = { r: f[0], b: f[1] }; return fontCache; })
      .catch(function () { fontCache = false; return fontCache; });
  }
  function deaccent(s) { return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

  $("pdf").addEventListener("click", function () {
    gcEvent("Součtové úlohy: PDF", "Součtové úlohy: PDF");
    var btn = $("pdf"), lbl = btn.querySelector("span"), old = lbl.textContent;
    btn.disabled = true; lbl.textContent = "Připravuji…";
    var jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor) { alert("Knihovna pro PDF se nenačetla. Použij Tisk a „Uložit jako PDF“."); btn.disabled = false; lbl.textContent = old; return; }
    loadFonts().then(function (fonts) {
      var doc = new jsPDFCtor({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      var fam = "helvetica", txt = deaccent;
      if (fonts) {
        doc.addFileToVFS("LS-R.ttf", fonts.r); doc.addFont("LS-R.ttf", "LS", "normal");
        doc.addFileToVFS("LS-B.ttf", fonts.b); doc.addFont("LS-B.ttf", "LS", "bold");
        fam = "LS"; txt = function (s) { return s; };
      }
      drawPdf(doc, fam, txt);
      doc.save("souctove-ulohy-" + st.cislo + ".pdf");
    }).catch(function (e) { alert("Export PDF selhal: " + e.message); })
      .then(function () { btn.disabled = false; lbl.textContent = old; });
  });

  function drawPdf(doc, fam, txt) {
    var padX = 14, padY = 12, y = padY, box = 14, gap = 2.4;
    doc.setFont(fam, "bold"); doc.setFontSize(11); doc.setTextColor(29, 29, 31);
    doc.text(txt("Jméno"), padX, y + 3);
    doc.setDrawColor(142, 142, 147); doc.setLineWidth(0.3);
    doc.line(padX + 14, y + 3.2, padX + 90, y + 3.2);
    y += 10;
    doc.setFont(fam, "normal"); doc.setFontSize(10); doc.setTextColor(29, 29, 31);
    var instr = instruction(sheet.typ);
    doc.text(txt(instr), padX, y);
    y += 8;
    var cols = G.gridCols(sheet.typ, sheet.size);
    var colW = (210 - 2 * padX - (cols === 2 ? 6 : 0)) / cols;
    var i, col, row, t, tx, ty, startY = y, rowH = 0;
    function drawBox(x, yy, val, given, asSol) {
      doc.setDrawColor(given ? 29 : 142, given ? 29 : 142, given ? 31 : 147);
      doc.setLineWidth(0.35);
      doc.roundedRect(x, yy, box, box, 2.2, 2.2, "S");
      if (val != null && val !== "" && (given || asSol)) {
        if (asSol && !given) doc.setTextColor(3, 114, 182);
        else doc.setTextColor(29, 29, 31);
        doc.setFont(fam, given ? "bold" : "normal");
        doc.setFontSize(11);
        doc.text(String(val), x + box / 2, yy + box / 2 + 1.6, { align: "center" });
      }
    }
    function drawTri(x, yy, task, sol, showSol) {
      var n = task.size, givenSet = {};
      task.given.forEach(function (k) { givenSet[k] = true; });
      var r, i, idx, w, left, vals = sol || task.values;
      for (r = n - 1; r >= 0; r--) {
        w = (n - r) * box + (n - r - 1) * gap;
        left = x + ((n * box + (n - 1) * gap) - w) / 2;
        for (i = 0; i < n - r; i++) {
          idx = G.triIndex(n, r, i);
          drawBox(left + i * (box + gap), yy + (n - 1 - r) * (box + gap), vals[idx], !!givenSet[idx], showSol);
        }
      }
      return n * box + (n - 1) * gap;
    }
    function drawRada(x, yy, task, sol, showSol) {
      var givenSet = {};
      task.given.forEach(function (k) { givenSet[k] = true; });
      var vals = sol || task.values, i;
      for (i = 0; i < task.size; i++)
        drawBox(x + i * (box + gap), yy, vals[i], !!givenSet[i], showSol);
      return box;
    }
    col = 0; row = 0; tx = padX; ty = startY;
    for (i = 0; i < sheet.tasks.length; i++) {
      t = sheet.tasks[i];
      var copies = t.multi ? 3 : 1;
      var block = G.blockSize(t.typ, t.size, copies);
      if (cols === 2 && col === 1 && block.w > colW) { col = 0; tx = padX; ty += rowH + 5; rowH = 0; }
      if (col === 0) { tx = padX; }
      else tx = padX + colW + 6;
      doc.setFont(fam, "bold"); doc.setFontSize(9); doc.setTextColor(110, 110, 115);
      doc.text(labels(i), tx, ty + 3);
      var fy = ty + 5, c, figW = t.size * box + (t.size - 1) * gap;
      if (t.typ === "rada") figW = t.size * box + (t.size - 1) * gap;
      for (c = 0; c < copies; c++) {
        var sol = st.ukazat && t.solutions[c] ? t.solutions[c] : t.values;
        var fx = tx + (copies > 1 ? c * (figW + 4) : 0);
        /* pokud se 3 kopie nevejdou vedle sebe, zalam */
        if (copies > 1 && fx + figW > 210 - padX) {
          fx = tx + ((c % 2) * (figW + 4));
          if (c === 2 || (c > 0 && tx + figW * 2 + 4 > 210 - padX && c % 2 === 0)) fy += (t.typ === "rada" ? box : t.size * box + (t.size - 1) * gap) + 3;
          if (c === 2 && figW * 2 + 4 > 210 - padX - tx) { fx = tx; }
        }
        if (t.typ === "trojuhelnik") drawTri(fx, fy, t, sol, st.ukazat);
        else drawRada(fx, fy, t, sol, st.ukazat);
      }
      var h = block.h;
      rowH = Math.max(rowH, h + 2);
      if ((st.reseni === "vice" || (st.reseni === "mix" && t.multi))) {
        doc.setFont(fam, "normal"); doc.setFontSize(8); doc.setTextColor(110, 110, 115);
        doc.text(txt("Najdi aspoň tři řešení."), tx, ty + h + 2);
      }
      if (st.ukazat && t.multi && (t.solCount > 3 || t.hitCap)) {
        doc.text(txt("a další"), tx + 45, ty + h + 2);
      }
      col++;
      if (col >= cols) { col = 0; ty += rowH + 5; rowH = 0; }
    }
    doc.setFont(fam, "normal"); doc.setFontSize(8); doc.setTextColor(110, 110, 115);
    doc.text(txt("Číslo zadání " + st.cislo), padX, 297 - 8);
    doc.text("velappky.cz", 210 - padX, 297 - 8, { align: "right" });
  }

  window.addEventListener("resize", scalePage);
  window.addEventListener("hashchange", function () {
    st = G.parseHash(location.hash);
    sync();
    regenerate();
  });

  sync();
  if (!location.hash) writeHash(false);
  regenerate();
})();
