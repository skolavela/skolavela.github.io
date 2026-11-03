// Generátor osmisměrek – deterministický (seed), bez závislostí.
(function (root) {
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  var DIRS_EASY = [[0, 1], [1, 0]];
  var DIRS_ALL = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
  // přibližné četnosti písmen v češtině (v promilích)
  var FREQ = { A: 62, Á: 22, B: 15, C: 16, Č: 12, D: 36, E: 77, É: 13, Ě: 16, F: 3, G: 3, H: 13, I: 44, Í: 33, J: 21, K: 37, L: 38, M: 32, N: 66, O: 87, P: 34, R: 40, Ř: 12, S: 46, Š: 8, T: 54, U: 22, Ů: 7, V: 43, Y: 18, Ý: 10, Z: 21, Ž: 10 };
  function strip(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC'); }
  function norm(w, keepDia) { var s = w.toUpperCase().replace(/[^\p{L}]/gu, ''); return keepDia ? s : strip(s); }
  function filler(keepDia) {
    var bag = [], f = {}; for (var k in FREQ) { var l = keepDia ? k : strip(k); f[l] = (f[l] || 0) + FREQ[k]; }
    for (var l in f) bag.push([l, f[l]]); var tot = bag.reduce(function (a, b) { return a + b[1]; }, 0);
    return function (r) { var x = r() * tot; for (var i = 0; i < bag.length; i++) { x -= bag[i][1]; if (x < 0) return bag[i][0]; } return 'A'; };
  }
  function shuffle(a, r) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function attempt(words, size, dirs, r) {
    var g = []; for (var i = 0; i < size; i++) { g.push(new Array(size).fill('')); }
    var placed = [], skipped = [];
    words.forEach(function (w) {
      var L = Array.from(w), best = null, bestOv = -1;
      var cand = [];
      for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) for (var d = 0; d < dirs.length; d++) cand.push([y, x, d]);
      shuffle(cand, r);
      for (var c = 0; c < cand.length; c++) {
        var y0 = cand[c][0], x0 = cand[c][1], dy = dirs[cand[c][2]][0], dx = dirs[cand[c][2]][1];
        var ye = y0 + dy * (L.length - 1), xe = x0 + dx * (L.length - 1);
        if (ye < 0 || ye >= size || xe < 0 || xe >= size) continue;
        var ov = 0, ok = true;
        for (var k = 0; k < L.length; k++) { var ch = g[y0 + dy * k][x0 + dx * k]; if (ch && ch !== L[k]) { ok = false; break; } if (ch) ov++; }
        if (!ok || ov === L.length) continue;
        if (ov > bestOv) { best = [y0, x0, dy, dx]; bestOv = ov; if (ov >= 2 || c > 300) break; }
      }
      if (!best) { skipped.push(w); return; }
      for (var k = 0; k < L.length; k++) g[best[0] + best[2] * k][best[1] + best[3] * k] = L[k];
      placed.push({ w: w, y: best[0], x: best[1], dy: best[2], dx: best[3] });
    });
    return { g: g, placed: placed, skipped: skipped };
  }
  // opts: {words:[...], size, count, all8:bool, keepDia:bool, seed}
  function generate(opts) {
    var r = rng(opts.seed || 1), size = opts.size;
    var seen = {}, pool = [];
    opts.words.forEach(function (w) { var n = norm(w, opts.keepDia); if (n.length >= 2 && n.length <= size && !seen[n]) { seen[n] = 1; pool.push({ n: n, orig: w }); } });
    var tooLong = opts.words.filter(function (w) { return norm(w, opts.keepDia).length > size; });
    shuffle(pool, r);
    var chosen = pool.slice(0, opts.count).map(function (p) { return p.n; });
    chosen.sort(function (a, b) { return b.length - a.length; });
    var dirs = opts.all8 ? DIRS_ALL : DIRS_EASY, best = null;
    for (var t = 0; t < 25; t++) {
      var res = attempt(chosen, size, dirs, r);
      if (!best || res.placed.length > best.placed.length) best = res;
      if (!res.skipped.length) break;
    }
    var fill = filler(opts.keepDia);
    for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) if (!best.g[y][x]) best.g[y][x] = fill(r);
    best.skipped = best.skipped.concat(tooLong.map(function (w) { return norm(w, opts.keepDia); }));
    best.placed.sort(function (a, b) { return a.w.localeCompare(b.w, 'cs'); });
    best.size = size;
    return best;
  }
  function readWord(g, p) { var s = ''; for (var k = 0; k < Array.from(p.w).length; k++) s += g[p.y + p.dy * k][p.x + p.dx * k]; return s; }
  var api = { generate: generate, readWord: readWord, norm: norm, rng: rng };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.Osm = api;
})(this);
