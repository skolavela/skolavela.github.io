/* Vyjmenovaná slova – logika kola + rozhraní */
(function (root) {
  "use strict";

  var VS = (typeof root.VS !== "undefined" && root.VS)
    || (typeof require !== "undefined" ? require("./vyjmenovana-slova.data.js") : null);

  var KEY = "vyjmenovana:v1";
  var LETTERS = (VS && VS.letters) || ["B", "L", "M", "P", "S", "V", "Z"];

  function gcEvent(name, title) {
    try {
      if (typeof window !== "undefined" && window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: name, title: title || name, event: true });
      }
    } catch (e) {}
  }

  function loadStore() {
    try {
      var raw = (typeof localStorage !== "undefined") ? localStorage.getItem(KEY) : null;
      if (!raw) return { settings: null, stats: {} };
      var o = JSON.parse(raw);
      return { settings: o.settings || null, stats: o.stats || {} };
    } catch (e) {
      return { settings: null, stats: {} };
    }
  }

  function saveStore(store) {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(store));
    } catch (e) {}
  }

  function defaultSettings() {
    return { mode: "slova", letters: LETTERS.slice(), count: 10, pribuzne: true };
  }

  function normalizeSettings(s) {
    var d = defaultSettings();
    s = s || {};
    var letters = Array.isArray(s.letters)
      ? s.letters.filter(function (l) { return LETTERS.indexOf(l) >= 0; })
      : d.letters.slice();
    if (!letters.length) letters = d.letters.slice();
    return {
      mode: ["slova", "vety", "dvojice"].indexOf(s.mode) >= 0 ? s.mode : d.mode,
      letters: letters,
      count: [10, 20, 30].indexOf(s.count) >= 0 ? s.count : 10,
      pribuzne: s.pribuzne !== false
    };
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function nameOf(it) {
    return it.word || it.target || it.answer;
  }

  function applyRequeue(queue, index) {
    var item = queue[index];
    var head = queue.slice(0, index + 1);
    var rest = queue.slice(index + 1);
    var pos = Math.min(3, rest.length);
    rest.splice(pos, 0, item);
    return head.concat(rest);
  }

  function pickHalf(n, chyt, norm) {
    var nChyt = Math.round(n / 2);
    nChyt = Math.min(nChyt, chyt.length);
    var nNorm = n - nChyt;
    if (nNorm > norm.length) {
      nNorm = norm.length;
      nChyt = Math.min(n - nNorm, chyt.length);
    }
    if (nChyt > chyt.length) {
      nChyt = chyt.length;
      nNorm = Math.min(n - nChyt, norm.length);
    }
    return { nChyt: nChyt, nNorm: nNorm };
  }

  function maybeAddZivat(picked, pool, letters, n) {
    var hasNaz = picked.some(function (it) { return nameOf(it) === "nazývat se"; });
    var hasZiv = picked.some(function (it) { return nameOf(it) === "zívat"; });
    if (!hasNaz || hasZiv || letters.indexOf("Z") < 0) return picked;
    var ziv = null;
    for (var i = 0; i < pool.length; i++) {
      if (nameOf(pool[i]) === "zívat") { ziv = pool[i]; break; }
    }
    if (!ziv) return picked;
    var out = picked.concat([ziv]);
    if (out.length > n) {
      var drop = -1;
      for (var j = 0; j < out.length; j++) {
        if (out[j] !== ziv && out[j].type === "chytak" && nameOf(out[j]) !== "nazývat se") {
          drop = j; break;
        }
      }
      if (drop < 0) {
        for (var k = 0; k < out.length; k++) {
          if (nameOf(out[k]) !== "zívat" && nameOf(out[k]) !== "nazývat se") {
            drop = k; break;
          }
        }
      }
      if (drop >= 0) out.splice(drop, 1);
    }
    return out;
  }

  function buildRound(opts) {
    var letters = opts.letters;
    var count = opts.count;
    var pribuzne = opts.pribuzne !== false;
    if (opts.mode === "dvojice") {
      var pairs = VS.pairs.filter(function (p) { return letters.indexOf(p.letter) >= 0; });
      pairs = shuffle(pairs);
      var pn = Math.min(count, pairs.length);
      return pairs.slice(0, pn).map(function (p) {
        return Object.assign({}, p, { options: shuffle(p.options) });
      });
    }
    var src = opts.mode === "vety" ? VS.sentences : VS.words;
    var pool = src.filter(function (it) {
      return letters.indexOf(it.letter) >= 0 && (pribuzne || it.type !== "pribuzne");
    });
    var chyt = pool.filter(function (it) { return it.type === "chytak"; });
    var norm = pool.filter(function (it) { return it.type !== "chytak"; });
    var n = Math.min(count, pool.length);
    if (n === 0) return [];
    var half = pickHalf(n, chyt, norm);
    var picked = shuffle(chyt).slice(0, half.nChyt).concat(shuffle(norm).slice(0, half.nNorm));
    picked = maybeAddZivat(picked, pool, letters, n);
    return shuffle(picked);
  }

  var VSLogic = {
    KEY: KEY,
    LETTERS: LETTERS,
    defaultSettings: defaultSettings,
    normalizeSettings: normalizeSettings,
    shuffle: shuffle,
    nameOf: nameOf,
    applyRequeue: applyRequeue,
    pickHalf: pickHalf,
    buildRound: buildRound
  };

  if (typeof module !== "undefined" && module.exports) module.exports = VSLogic;
  else root.VSLogic = VSLogic;

  if (typeof document === "undefined") return;

  var store = loadStore();
  var settings = normalizeSettings(store.settings);
  var state = { screen: "start" };
  var $app = document.getElementById("app");

  function persist() {
    store.settings = settings;
    saveStore(store);
  }

  function bumpStat(key, ok) {
    if (!key) return;
    store.stats = store.stats || {};
    var o = store.stats[key] || (store.stats[key] = { ok: 0, bad: 0 });
    if (ok) o.ok++; else o.bad++;
    saveStore(store);
  }

  function clearStats() {
    store.stats = {};
    saveStore(store);
  }

  function isWeak(key) {
    var o = store.stats && store.stats[key];
    if (!o) return false;
    var n = (o.ok || 0) + (o.bad || 0);
    return n >= 2 && (o.bad || 0) > (o.ok || 0);
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function letterChoices(ans) {
    if (ans === "í" || ans === "ý") return ["í", "ý"];
    return ["i", "y"];
  }

  function renderGapWord(target, gap, revealed, answer) {
    var before = target.slice(0, gap);
    var after = target.slice(gap + 1);
    var mid = revealed
      ? '<span class="vs-fill">' + esc(answer) + "</span>"
      : '<span class="vs-gap" aria-hidden="true"></span>';
    return '<span class="vs-word">' + esc(before) + mid + esc(after) + "</span>";
  }

  function renderPrompt(item, revealed) {
    if (item.options) {
      var blank = revealed
        ? '<span class="vs-fill">' + esc(item.answer) + "</span>"
        : '<span class="vs-blank" aria-hidden="true"></span>';
      return '<p class="vs-prompt">' + esc(item.sentence).replace("___", blank) + "</p>";
    }
    var target = item.target || item.word;
    var filled = renderGapWord(target, item.gap, revealed, item.answer);
    if (item.sentence) {
      var i = item.sentence.indexOf(target);
      if (i < 0) i = item.sentence.toLowerCase().indexOf(target.toLowerCase());
      if (i >= 0) {
        return '<p class="vs-prompt">'
          + esc(item.sentence.slice(0, i))
          + filled
          + esc(item.sentence.slice(i + target.length))
          + "</p>";
      }
    }
    return '<p class="vs-prompt">' + filled + "</p>";
  }

  function show(html) {
    $app.innerHTML = html;
  }

  function bindSeg(root, current, onPick) {
    var btns = [].slice.call(root.querySelectorAll("button"));
    function paint() {
      btns.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === String(current)));
      });
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        current = b.getAttribute("data-v");
        paint();
        onPick(current);
      });
    });
    paint();
  }

  function startScreen() {
    state = { screen: "start" };
    if (location.hash && location.hash !== "#") {
      /* necháme hash, pokud vede na přehled; jinak smažeme */
      var h = parseHash();
      if (h && h.prehled) { prehledScreen(h.letter); return; }
    }
    var lettersHtml = LETTERS.map(function (L) {
      var on = settings.letters.indexOf(L) >= 0;
      return '<button class="c-switch" type="button" role="switch" aria-checked="' + on + '" data-letter="' + L + '">'
        + "<span>" + L + "</span><span class=\"c-track\" aria-hidden=\"true\"></span></button>";
    }).join("");
    show(
      '<section class="a-card vs-start">'
      + '<div class="c-field"><span class="c-label" id="lbl-mode">Režim</span>'
      + '<div class="c-seg" role="group" aria-labelledby="lbl-mode" id="mode">'
      + '<button type="button" data-v="slova">Slova</button>'
      + '<button type="button" data-v="vety">Věty</button>'
      + '<button type="button" data-v="dvojice">Dvojice</button>'
      + "</div></div>"
      + '<div class="c-field"><span class="c-label" id="lbl-letters">Písmena</span>'
      + '<div class="vs-letters" role="group" aria-labelledby="lbl-letters" id="letters">'
      + lettersHtml + "</div></div>"
      + '<div class="c-field"><span class="c-label" id="lbl-count">Počet otázek</span>'
      + '<div class="c-seg" role="group" aria-labelledby="lbl-count" id="count">'
      + '<button type="button" data-v="10">10</button>'
      + '<button type="button" data-v="20">20</button>'
      + '<button type="button" data-v="30">30</button>'
      + "</div></div>"
      + '<button class="c-switch" type="button" role="switch" id="pribuzne" aria-checked="' + settings.pribuzne + '">'
      + '<span>Příbuzná slova</span><span class="c-track" aria-hidden="true"></span></button>'
      + '<p class="c-meta" id="start-err" hidden></p>'
      + '<div class="vs-actions">'
      + '<button class="c-btn c-btn--primary" type="button" id="start">Začít</button>'
      + '<button class="c-btn c-btn--secondary" type="button" id="to-prehled">Přehled slov</button>'
      + "</div></section>"
    );
    bindSeg(document.getElementById("mode"), settings.mode, function (v) {
      settings.mode = v;
      persist();
      document.getElementById("pribuzne").hidden = (v === "dvojice");
    });
    document.getElementById("pribuzne").hidden = (settings.mode === "dvojice");
    bindSeg(document.getElementById("count"), String(settings.count), function (v) {
      settings.count = Number(v);
      persist();
    });
    document.getElementById("pribuzne").addEventListener("click", function () {
      settings.pribuzne = !settings.pribuzne;
      this.setAttribute("aria-checked", String(settings.pribuzne));
      persist();
    });
    [].slice.call(document.querySelectorAll("#letters .c-switch")).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var L = btn.getAttribute("data-letter");
        var on = settings.letters.indexOf(L) >= 0;
        if (on) {
          if (settings.letters.length === 1) return;
          settings.letters = settings.letters.filter(function (x) { return x !== L; });
        } else {
          settings.letters = settings.letters.concat([L]);
        }
        btn.setAttribute("aria-checked", String(!on));
        persist();
      });
    });
    document.getElementById("start").addEventListener("click", function () { beginRound(null); });
    document.getElementById("to-prehled").addEventListener("click", function () {
      location.hash = "#/prehled";
      prehledScreen();
    });
  }

  function beginRound(fixedItems) {
    var items = fixedItems || buildRound(settings);
    var err = document.getElementById("start-err");
    if (!items.length) {
      if (err) {
        err.hidden = false;
        err.textContent = settings.mode === "dvojice"
          ? "Pro zvolená písmena teď nejsou žádné dvojice. Zapni B, M, P nebo V."
          : "Pro zvolená písmena teď nejsou žádná slova.";
      }
      return;
    }
    state = {
      screen: "quiz",
      queue: items,
      i: 0,
      original: items.length,
      correct: 0,
      firstOk: 0,
      seen: {},
      missed: [],
      missedKeys: {},
      answered: false,
      chosen: null
    };
    gcEvent("Vyjmenovaná slova: start", "Vyjmenovaná slova: start (" + settings.mode + ")");
    quizScreen();
  }

  function currentItem() {
    return state.queue[state.i];
  }

  function progressPct() {
    return Math.round((state.correct / state.original) * 100);
  }

  function quizScreen() {
    var item = currentItem();
    var opts = item.options ? item.options.slice() : letterChoices(item.answer);
    var wide = !!item.options;
    var btns = opts.map(function (o, idx) {
      return '<button type="button" class="a-choice' + (wide ? " vs-wide" : "") + '" data-v="' + esc(o) + '" data-i="' + idx + '">' + esc(o) + "</button>";
    }).join("");
    show(
      '<section class="a-card vs-quiz">'
      + '<div class="a-toolbar">'
      + '<button type="button" class="vs-end" id="end">Ukončit</button>'
      + '<span class="vs-count" id="count-lbl">' + state.correct + " / " + state.original + "</span>"
      + "</div>"
      + '<div class="a-progress" id="prog" aria-hidden="true"><span style="width:' + progressPct() + '%"></span></div>'
      + '<div id="prompt">' + renderPrompt(item, false) + "</div>"
      + '<div class="a-choices vs-choices" id="choices">' + btns + "</div>"
      + '<p class="vs-why c-meta" id="why" hidden></p>'
      + '<div class="vs-live" aria-live="polite" id="live"></div>'
      + '<button class="c-btn c-btn--primary" type="button" id="next" hidden>Další</button>'
      + "</section>"
    );
    document.getElementById("end").addEventListener("click", function () {
      if (window.confirm("Opravdu ukončit procvičování?")) startScreen();
    });
    [].slice.call(document.querySelectorAll("#choices .a-choice")).forEach(function (b) {
      b.addEventListener("click", function () { answer(b.getAttribute("data-v")); });
    });
    document.getElementById("next").addEventListener("click", nextQuestion);
    state.answered = false;
    state.chosen = null;
  }

  function answer(value) {
    if (state.answered || state.screen !== "quiz") return;
    state.answered = true;
    state.chosen = value;
    var item = currentItem();
    var ok = value === item.answer;
    var key = nameOf(item);
    if (!state.seen[key]) {
      state.seen[key] = true;
      if (ok) state.firstOk++;
      else if (!state.missedKeys[key]) {
        state.missedKeys[key] = true;
        state.missed.push(item);
      }
    } else if (!ok && !state.missedKeys[key]) {
      state.missedKeys[key] = true;
      state.missed.push(item);
    }
    bumpStat(key, ok);
    document.getElementById("prompt").innerHTML = renderPrompt(item, true);
    var why = document.getElementById("why");
    why.hidden = false;
    why.textContent = item.why || "";
    why.className = "vs-why c-meta";
    var live = document.getElementById("live");
    var word = item.options ? item.answer : (item.word || item.target);
    live.textContent = ok ? "Správně" : ("Špatně, správně je " + word);
    [].slice.call(document.querySelectorAll("#choices .a-choice")).forEach(function (b) {
      b.disabled = true;
      var v = b.getAttribute("data-v");
      if (v === item.answer) b.setAttribute("data-state", "correct");
      else if (v === value) b.setAttribute("data-state", "wrong");
    });
    document.getElementById("next").hidden = false;
    document.getElementById("next").focus();
    if (ok) {
      state.pendingRequeue = false;
      state.correct++;
    } else {
      state.pendingRequeue = true;
    }
  }

  function nextQuestion() {
    if (!state.answered) return;
    if (state.pendingRequeue) {
      state.queue = applyRequeue(state.queue, state.i);
    }
    state.i++;
    if (state.i >= state.queue.length) resultScreen();
    else quizScreen();
  }

  function displayWord(item) {
    if (item.options) return item.answer;
    var t = item.word || item.target;
    return t.slice(0, item.gap) + item.answer + t.slice(item.gap + 1);
  }

  function resultScreen() {
    state.screen = "result";
    gcEvent("Vyjmenovaná slova: hotovo", "Vyjmenovaná slova: hotovo");
    var miss = "";
    if (state.missed.length) {
      miss = '<div class="vs-miss"><h3>Co procvičit</h3>'
        + state.missed.map(function (it) {
          return '<div class="vs-miss-item"><b>' + esc(displayWord(it)) + "</b><span>" + esc(it.why || "") + "</span></div>";
        }).join("")
        + "</div>";
    }
    var retry = state.missed.length
      ? '<button class="c-btn c-btn--secondary" type="button" id="retry-missed">Procvičit jen chyby</button>'
      : "";
    show(
      '<section class="a-card vs-result">'
      + "<h2>Hotovo</h2>"
      + '<p class="vs-score">' + state.firstOk + " z " + state.original + " napoprvé</p>"
      + miss
      + '<div class="row">'
      + '<button class="c-btn c-btn--primary" type="button" id="again">Znovu</button>'
      + retry
      + '<button class="c-btn c-btn--secondary" type="button" id="back-set">Zpět na nastavení</button>'
      + "</div></section>"
    );
    document.getElementById("again").addEventListener("click", function () { beginRound(null); });
    var r = document.getElementById("retry-missed");
    if (r) r.addEventListener("click", function () {
      gcEvent("Vyjmenovaná slova: procvičit chyby", "Vyjmenovaná slova: procvičit chyby");
      beginRound(state.missed.slice());
    });
    document.getElementById("back-set").addEventListener("click", function () {
      if (location.hash) history.replaceState(null, "", location.pathname);
      startScreen();
    });
  }

  function parseHash() {
    var raw = (location.hash || "").replace(/^#\/?/, "").toLowerCase();
    if (!raw) return null;
    if (raw === "prehled") return { prehled: true };
    if (LETTERS.map(function (l) { return l.toLowerCase(); }).indexOf(raw) >= 0) {
      return { prehled: true, letter: raw.toUpperCase() };
    }
    return null;
  }

  function highlightWord(w) {
    var cls = isWeak(w) ? ' class="vs-weak"' : "";
    return "<span" + cls + ">" + esc(w) + "</span>";
  }

  function prehledScreen(focusLetter) {
    state = { screen: "prehled" };
    gcEvent("Vyjmenovaná slova: přehled", "Vyjmenovaná slova: přehled");
    var segs = LETTERS.map(function (L) {
      return '<button type="button" data-v="' + L + '"'
        + (focusLetter === L ? ' aria-pressed="true"' : ' aria-pressed="false"')
        + ">" + L + "</button>";
    }).join("");
    var blocks = LETTERS.map(function (L) {
      var pack = VS.prehled[L];
      var vyj = pack.vyjmenovane.map(highlightWord).join(", ");
      var pri = pack.pribuzne.map(highlightWord).join(", ");
      return '<section class="vs-letter" id="pismeno-' + L.toLowerCase() + '">'
        + "<h3>" + L + "</h3>"
        + '<p class="vs-vyj">' + vyj + "</p>"
        + (pri ? '<p class="vs-pri">' + pri + "</p>" : "")
        + "</section>";
    }).join("");
    show(
      '<section class="a-card vs-prehled">'
      + "<h2>Přehled slov</h2>"
      + '<div class="c-seg" role="navigation" aria-label="Písmena" id="jump">' + segs + "</div>"
      + blocks
      + '<div class="vs-actions">'
      + '<button class="c-btn c-btn--primary" type="button" id="back-pre">Zpět</button>'
      + '<button class="c-btn c-btn--secondary" type="button" id="clear-stats">Vymazat statistiku</button>'
      + "</div></section>"
    );
    document.getElementById("jump").addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var L = b.getAttribute("data-v");
      location.hash = "#/" + L.toLowerCase();
      scrollToLetter(L);
      [].slice.call(document.querySelectorAll("#jump button")).forEach(function (x) {
        x.setAttribute("aria-pressed", String(x === b));
      });
    });
    document.getElementById("back-pre").addEventListener("click", function () {
      if (location.hash) history.replaceState(null, "", location.pathname);
      startScreen();
    });
    document.getElementById("clear-stats").addEventListener("click", function () {
      if (!window.confirm("Vymazat statistiku procvičování?")) return;
      clearStats();
      gcEvent("Vyjmenovaná slova: statistika smazána", "Vyjmenovaná slova: statistika smazána");
      prehledScreen(focusLetter);
    });
    if (focusLetter) {
      requestAnimationFrame(function () { scrollToLetter(focusLetter); });
    }
  }

  function scrollToLetter(L) {
    var el = document.getElementById("pismeno-" + L.toLowerCase());
    if (el) el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  document.addEventListener("keydown", function (e) {
    if (state.screen !== "quiz") return;
    if (e.key === "Enter") {
      if (state.answered) { e.preventDefault(); nextQuestion(); }
      return;
    }
    if (state.answered) return;
    var map = { i: 0, I: 0, "1": 0, y: 1, Y: 1, "2": 1 };
    if (e.key in map) {
      var btns = document.querySelectorAll("#choices .a-choice");
      var b = btns[map[e.key]];
      if (b) { e.preventDefault(); answer(b.getAttribute("data-v")); }
    }
  });

  window.addEventListener("hashchange", function () {
    if (state.screen === "quiz") return;
    var h = parseHash();
    if (h && h.prehled) prehledScreen(h.letter);
    else if (state.screen === "prehled") startScreen();
  });

  startScreen();
})(typeof window !== "undefined" ? window : globalThis);
