// Sudoku – generátor, logický řešitel (techniky jako člověk) a kontrola jednoznačnosti.
(function (root) {
  'use strict';
  var GEO = {};
  function geo(n) {
    if (GEO[n]) return GEO[n];
    var bw = n === 4 ? 2 : 3, bh = n === 9 ? 3 : 2; // šířka a výška bloku
    var units = [], type = [], unitOf = [];
    for (var i = 0; i < n * n; i++) unitOf.push([]);
    for (var r = 0; r < n; r++) { var u = []; for (var c = 0; c < n; c++) u.push(r * n + c); units.push(u); type.push('row'); }
    for (c = 0; c < n; c++) { u = []; for (r = 0; r < n; r++) u.push(r * n + c); units.push(u); type.push('col'); }
    for (var br = 0; br < n; br += bh) for (var bc = 0; bc < n; bc += bw) {
      u = []; for (r = br; r < br + bh; r++) for (c = bc; c < bc + bw; c++) u.push(r * n + c); units.push(u); type.push('box');
    }
    units.forEach(function (u, k) { u.forEach(function (i) { unitOf[i].push(k); }); });
    var peers = [];
    for (i = 0; i < n * n; i++) {
      var s = {}; unitOf[i].forEach(function (k) { units[k].forEach(function (j) { if (j !== i) s[j] = 1; }); });
      peers.push(Object.keys(s).map(Number));
    }
    return (GEO[n] = { n: n, bw: bw, bh: bh, units: units, type: type, unitOf: unitOf, peers: peers, all: ((1 << (n + 1)) - 2) });
  }
  function pc(m) { var c = 0; while (m) { m &= m - 1; c++; } return c; }
  function bits(m) { var a = []; for (var d = 1; m >> d; d++) if (m >> d & 1) a.push(d); return a; }
  function shuffle(a, rnd) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // Kandidáti z vyplněných čísel
  function candidates(G, b) {
    var cand = [];
    for (var i = 0; i < b.length; i++) {
      if (b[i]) { cand.push(0); continue; }
      var m = G.all; G.peers[i].forEach(function (j) { if (b[j]) m &= ~(1 << b[j]); }); cand.push(m);
    }
    return cand;
  }
  // Techniky: 1 poslední volné místo, 2 skryté jediné místo, 3 jediný kandidát, 4 zamčení v bloku, 5 dvojice
  var TECH = { 1: 'full', 2: 'hidden', 3: 'naked', 4: 'locked', 5: 'pair' };
  function nextStep(G, b, cand, maxTech) {
    var n = G.n, U = G.units, k, u, i, d;
    // 1) v jednotce chybí jen jedno číslo
    for (k = 0; k < U.length; k++) {
      u = U[k]; var emp = -1, cnt = 0, used = 0;
      for (i = 0; i < n; i++) { if (!b[u[i]]) { cnt++; emp = u[i]; } else used |= 1 << b[u[i]]; }
      if (cnt === 1) { d = bits(G.all & ~used)[0]; return { tech: 1, cell: emp, d: d, unit: k }; }
    }
    if (maxTech < 2) return null;
    // 2) skryté jediné místo – nejdřív bloky, pak řádky, sloupce
    var order = []; for (k = 2 * n; k < 3 * n; k++) order.push(k); for (k = 0; k < 2 * n; k++) order.push(k);
    for (var o = 0; o < order.length; o++) {
      k = order[o]; u = U[k];
      for (d = 1; d <= n; d++) {
        var pos = -1, pn = 0, have = false;
        for (i = 0; i < n; i++) { var c = u[i]; if (b[c] === d) { have = true; break; } if (!b[c] && cand[c] >> d & 1) { pn++; pos = c; } }
        if (!have && pn === 1) return { tech: 2, cell: pos, d: d, unit: k };
      }
    }
    if (maxTech < 3) return null;
    // 3) políčko má jediného kandidáta
    for (i = 0; i < b.length; i++) if (!b[i] && pc(cand[i]) === 1) return { tech: 3, cell: i, d: bits(cand[i])[0] };
    if (maxTech < 4) return null;
    // 4) zamčení: v bloku je číslo jen v jednom řádku/sloupci (a naopak)
    for (k = 0; k < 3 * n; k++) {
      u = U[k];
      for (d = 1; d <= n; d++) {
        var ps = u.filter(function (c) { return !b[c] && cand[c] >> d & 1; });
        if (ps.length < 2) continue;
        var common = G.unitOf[ps[0]].filter(function (q) { return q !== k && ps.every(function (c) { return G.unitOf[c].indexOf(q) >= 0; }); });
        for (var q = 0; q < common.length; q++) {
          var el = U[common[q]].filter(function (c) { return ps.indexOf(c) < 0 && !b[c] && cand[c] >> d & 1; });
          if (el.length) return { tech: 4, d: d, unit: k, unit2: common[q], cells: ps, elims: el.map(function (c) { return [c, 1 << d]; }) };
        }
      }
    }
    if (maxTech < 5) return null;
    // 5) nahá dvojice a skrytá dvojice
    for (k = 0; k < 3 * n; k++) {
      u = U[k]; var em = u.filter(function (c) { return !b[c]; });
      for (var x = 0; x < em.length; x++) {
        if (pc(cand[em[x]]) !== 2) continue;
        for (var y = x + 1; y < em.length; y++) if (cand[em[y]] === cand[em[x]]) {
          var m = cand[em[x]], el2 = em.filter(function (c) { return c !== em[x] && c !== em[y] && cand[c] & m; });
          if (el2.length) return { tech: 5, kind: 'naked', unit: k, cells: [em[x], em[y]], ds: bits(m), elims: el2.map(function (c) { return [c, m]; }) };
        }
      }
      for (var d1 = 1; d1 <= n; d1++) for (var d2 = d1 + 1; d2 <= n; d2++) {
        var p1 = em.filter(function (c) { return cand[c] >> d1 & 1; }), p2 = em.filter(function (c) { return cand[c] >> d2 & 1; });
        if (p1.length === 2 && p2.length === 2 && p1[0] === p2[0] && p1[1] === p2[1]) {
          var keep = (1 << d1) | (1 << d2), el3 = p1.filter(function (c) { return cand[c] & ~keep; });
          if (el3.length) return { tech: 5, kind: 'hidden', unit: k, cells: p1, ds: [d1, d2], elims: el3.map(function (c) { return [c, cand[c] & ~keep]; }) };
        }
      }
    }
    return null;
  }
  function apply(G, b, cand, st) {
    if (st.elims) { st.elims.forEach(function (e) { cand[e[0]] &= ~e[1]; }); return; }
    b[st.cell] = st.d; cand[st.cell] = 0;
    G.peers[st.cell].forEach(function (j) { cand[j] &= ~(1 << st.d); });
  }
  // Vyřeší jen logikou; vrátí nejtěžší použitou techniku (nebo solved:false)
  function solveLogic(n, puzzle, maxTech) {
    var G = geo(n), b = puzzle.slice(), cand = candidates(G, b), max = 0, steps = 0;
    for (;;) {
      if (b.indexOf(0) < 0) return { solved: true, max: max, board: b, steps: steps };
      var st = nextStep(G, b, cand, maxTech || 5);
      if (!st) return { solved: false, max: max, board: b, steps: steps };
      if (st.tech > max) max = st.tech; apply(G, b, cand, st); steps++;
    }
  }
  // Počet řešení (do limitu) – klasický backtracking, pro ověření jednoznačnosti
  function countSolutions(n, puzzle, limit) {
    var G = geo(n), b = puzzle.slice(), count = 0; limit = limit || 2;
    for (var i = 0; i < b.length; i++) if (b[i]) for (var p = 0; p < G.peers[i].length; p++) if (b[G.peers[i][p]] === b[i]) return 0;
    (function rec() {
      if (count >= limit) return;
      var best = -1, bm = 0, bc = 99;
      for (var i = 0; i < b.length; i++) if (!b[i]) {
        var m = G.all; for (var p = 0; p < G.peers[i].length; p++) { var v = b[G.peers[i][p]]; if (v) m &= ~(1 << v); }
        var c = pc(m); if (c < bc) { bc = c; best = i; bm = m; if (c === 0) return; }
      }
      if (best < 0) { count++; return; }
      bits(bm).forEach(function (d) { if (count < limit) { b[best] = d; rec(); b[best] = 0; } });
    })();
    return count;
  }
  function fullGrid(n, rnd) {
    var G = geo(n), b = new Array(n * n).fill(0);
    (function rec(i) {
      if (i === b.length) return true;
      var m = G.all; G.peers[i].forEach(function (j) { if (b[j]) m &= ~(1 << b[j]); });
      var ds = shuffle(bits(m), rnd);
      for (var k = 0; k < ds.length; k++) { b[i] = ds[k]; if (rec(i + 1)) return true; }
      b[i] = 0; return false;
    })(0);
    return b;
  }
  // Obtížnosti: max = nejtěžší povolená technika, min = technika, kterou zadání musí vyžadovat, clues = spodní mez zadaných čísel
  var LEVELS = {
    4: [{ name: 'Lehká', max: 1, min: 1, clues: 9 }, { name: 'Střední', max: 2, min: 2, clues: 6 }, { name: 'Těžká', max: 3, min: 2, clues: 4 }],
    6: [{ name: 'Lehká', max: 2, min: 1, clues: 20 }, { name: 'Střední', max: 2, min: 2, clues: 13 }, { name: 'Těžká', max: 5, min: 3, clues: 8 }],
    9: [{ name: 'Lehká', max: 2, min: 2, clues: 36 }, { name: 'Střední', max: 3, min: 3, clues: 28 }, { name: 'Těžká', max: 5, min: 4, clues: 22 }]
  };
  function carve(n, sol, L, rnd) {
    var N = n * n, p = sol.slice(), clues = N, order = shuffle(Array.from({ length: Math.ceil(N / 2) }, function (_, i) { return i; }), rnd);
    for (var k = 0; k < order.length; k++) {
      var i = order[k], j = N - 1 - i, rm = i === j ? 1 : 2;
      if (clues - rm < L.clues) continue;
      var a = p[i], bb = p[j]; p[i] = 0; p[j] = 0;
      if (solveLogic(n, p, L.max).solved) clues -= rm; else { p[i] = a; p[j] = bb; }
    }
    return p;
  }
  function generate(n, level, rnd) {
    rnd = rnd || Math.random; var L = LEVELS[n][level], best = null, bestMax = -1;
    for (var t = 0; t < 200; t++) {
      var sol = fullGrid(n, rnd), p = carve(n, sol, L, rnd), r = solveLogic(n, p, L.max);
      if (r.max >= L.min) return { n: n, level: level, puzzle: p, solution: sol, tech: r.max };
      if (r.max > bestMax) { bestMax = r.max; best = { n: n, level: level, puzzle: p, solution: sol, tech: r.max }; }
    }
    return best;
  }
  var api = { geo: geo, candidates: candidates, nextStep: nextStep, apply: apply, solveLogic: solveLogic, countSolutions: countSolutions, fullGrid: fullGrid, generate: generate, LEVELS: LEVELS, bits: bits, pc: pc, TECH: TECH };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SDK = api;
})(this);
