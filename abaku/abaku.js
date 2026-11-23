/* Abaku – logika generátoru (bez DOM, testuje se v Node: node test.js).
   Řetězec = řada číslic bez znamének. Je „abaku“, když jde rozdělit na tři čísla a, b, c
   tak, že platí a op b = c (op z povolených operací), čte-li se zleva doprava,
   nebo (při volbě oběma směry) i zprava doleva. */
(function (root) {
  "use strict";

  var OPS = {
    plus:   { sign: "+", f: function (a, b) { return a + b; } },
    minus:  { sign: "\u2212", f: function (a, b) { return a - b; } },
    krat:   { sign: "\u00b7", f: function (a, b) { return a * b; } },
    deleno: { sign: ":", f: function (a, b) { return b !== 0 && a % b === 0 ? a / b : NaN; } }
  };
  var OP_ORDER = ["plus", "minus", "krat", "deleno"];
  var RANGES = [9, 20, 100];
  var LENGTHS = [3, 4, 5, 6];
  var COUNTS = [8, 12, 16, 20];

  function hashSeed(s) {
    s = String(s);
    var h = 1779033703 ^ s.length;
    for (var i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return (h >>> 0) || 1;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Číslo z kusu řetězce: bez úvodní nuly, samotná nula není číslo, 1..max. Jinak -1. */
  function parseNum(s, max) {
    if (!s.length || s.charAt(0) === "0") return -1;
    var n = +s;
    return n >= 1 && n <= max ? n : -1;
  }

  function reverse(s) { return s.split("").reverse().join(""); }

  /* Hrubá síla: všechna rozdělení na tři čísla, všechny povolené operace, povolené směry. */
  function solve(str, cfg) {
    var out = [], dirs = cfg.dir === "both" ? ["ltr", "rtl"] : ["ltr"];
    var ops = OP_ORDER.filter(function (o) { return cfg.ops[o]; });
    dirs.forEach(function (d) {
      var s = d === "rtl" ? reverse(str) : str, n = s.length, i, j, k, a, b, c;
      if (d === "rtl" && s === str && dirs.length > 1) return; /* palindrom: stejné čtení */
      for (i = 1; i < n - 1; i++) {
        a = parseNum(s.slice(0, i), cfg.max); if (a < 0) continue;
        for (j = i + 1; j < n; j++) {
          b = parseNum(s.slice(i, j), cfg.max); if (b < 0) continue;
          c = parseNum(s.slice(j), cfg.max); if (c < 0) continue;
          for (k = 0; k < ops.length; k++)
            if (OPS[ops[k]].f(a, b) === c) out.push({ dir: d, a: a, op: ops[k], b: b, c: c });
        }
      }
    });
    return out;
  }

  var solveCache = {};
  function solveCached(s, cfg) {
    var key = s + "|" + cfg.max + cfg.dir + OP_ORDER.map(function (o) { return cfg.ops[o] ? 1 : 0; }).join("");
    return solveCache[key] || (solveCache[key] = solve(s, cfg));
  }

  function eqText(e) { return e.a + " " + OPS[e.op].sign + " " + e.b + " = " + e.c; }

  /* Všechny platné řetězce dané délky (z rovností a op b = c). Řetězec nezačíná nulou,
     ani obrácený – nula na začátku by prozradila, že se čte zprava. */
  var poolCache = {};
  function validPool(cfg, len) {
    var key = [cfg.max, cfg.dir, OP_ORDER.filter(function (o) { return cfg.ops[o]; }).join(","), len].join("|");
    if (poolCache[key]) return poolCache[key];
    var seen = {}, list = [], a, b, k, c, s, ops = OP_ORDER.filter(function (o) { return cfg.ops[o]; });
    for (a = 1; a <= cfg.max; a++) for (b = 1; b <= cfg.max; b++) for (k = 0; k < ops.length; k++) {
      c = OPS[ops[k]].f(a, b);
      if (!(c >= 1 && c <= cfg.max && c === Math.floor(c))) continue;
      s = "" + a + b + c;
      if (s.length !== len) continue;
      if (!seen[s]) { seen[s] = 1; list.push(s); }
      if (cfg.dir === "both") { var r = reverse(s); if (r.charAt(0) !== "0" && !seen[r]) { seen[r] = 1; list.push(r); } }
    }
    list.sort();
    poolCache[key] = list;
    return list;
  }

  function normalize(o) {
    o = o || {};
    var cfg = {
      ops: {}, max: RANGES.indexOf(+o.max) >= 0 ? +o.max : 9,
      len: LENGTHS.indexOf(+o.len) >= 0 ? +o.len : 3,
      dir: o.dir === "both" ? "both" : "ltr",
      types: { ano: !!(o.types && o.types.ano), dopln: !!(o.types && o.types.dopln) },
      count: COUNTS.indexOf(+o.count) >= 0 ? +o.count : 12,
      seed: /^\d{1,9}$/.test(String(o.seed)) ? String(o.seed) : "1"
    };
    OP_ORDER.forEach(function (k) { cfg.ops[k] = !!(o.ops && o.ops[k]); });
    if (!OP_ORDER.some(function (k) { return cfg.ops[k]; })) cfg.ops.plus = true;
    if (!cfg.types.ano && !cfg.types.dopln) cfg.types.dopln = true;
    return cfg;
  }

  /* Kolik platných řetězců list potřebuje. */
  function split(cfg) {
    var n = cfg.count;
    if (cfg.types.ano && cfg.types.dopln) return { ano: Math.ceil(n / 2), dopln: Math.floor(n / 2) };
    return cfg.types.ano ? { ano: n, dopln: 0 } : { ano: 0, dopln: n };
  }
  function neededValid(cfg) {
    var s = split(cfg);
    return s.dopln + Math.ceil(s.ano / 2) + (s.ano ? 1 : 0);
  }
  /* Délky, které jdou s danými volbami vytvořit (dost různých platných řetězců). */
  function lengthInfo(cfg) {
    return LENGTHS.map(function (len) {
      var p = validPool(cfg, len).length;
      return { len: len, pool: p, ok: p >= neededValid(cfg) };
    });
  }
  function fitLength(cfg) {
    var info = lengthInfo(cfg), cur = info.filter(function (x) { return x.len === cfg.len; })[0];
    if (cur && cur.ok) return cfg.len;
    var ok = info.filter(function (x) { return x.ok; });
    if (!ok.length) return null;
    ok.sort(function (x, y) { return Math.abs(x.len - cfg.len) - Math.abs(y.len - cfg.len) || x.len - y.len; });
    return ok[0].len;
  }

  function shuffle(arr, rnd) {
    for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  }

  /* Neplatný řetězec: „skoro abaku“ – platný řetězec se změněnou číslicí; ověřeno hrubou silou. */
  function makeInvalid(cfg, pool, used, rnd) {
    var len = cfg.len, tries, s, p, d;
    for (tries = 0; tries < 4000; tries++) {
      if (tries < 3000 && pool.length) {
        s = pool[Math.floor(rnd() * pool.length)].split("");
        p = Math.floor(rnd() * len);
        d = Math.floor(rnd() * 10);
        if (p === 0 && d === 0) continue;
        if (+s[p] === d) continue;
        if (Math.abs(+s[p] - d) > 3 && rnd() < 0.7) continue; /* blízké číslice vypadají věrohodněji */
        s[p] = String(d); s = s.join("");
      } else {
        s = String(1 + Math.floor(rnd() * 9));
        while (s.length < len) s += Math.floor(rnd() * 10);
      }
      if (s.charAt(0) === "0" || (cfg.dir === "both" && s.charAt(len - 1) === "0" && rnd() < 0.8)) continue;
      if (used[s]) continue;
      if (solve(s, cfg).length === 0) return s;
    }
    return null;
  }

  function generate(input) {
    var cfg = normalize(input);
    var len = fitLength(cfg);
    var res = { cfg: cfg, tasks: [], ok: true, message: "" };
    if (len == null) { res.ok = false; res.message = "S těmito volbami nejde vytvořit dost různých úloh."; return res; }
    cfg.len = len;
    var rnd = mulberry32(hashSeed(cfg.seed + "|" + [cfg.max, cfg.dir, cfg.len, cfg.count,
      OP_ORDER.map(function (k) { return cfg.ops[k] ? 1 : 0; }).join(""), cfg.types.ano ? 1 : 0, cfg.types.dopln ? 1 : 0].join("|")));
    var pool = validPool(cfg, len).slice();
    var sp = split(cfg), used = {};
    /* Pořadí: nejdřív řetězce, které nejsou jen „krát 1“ / „děleno 1“; při obou směrech
       se střídají řetězce čtené zleva a zprava. Stejná rovnost (i obráceně) se na listu neopakuje. */
    shuffle(pool, rnd);
    var info = {}, groups = {}, gkeys = [], tgroups = {}, tkeys = [];
    pool.forEach(function (s) {
      var sol = solveCached(s, cfg);
      var trivial = sol.every(function (e) { return (e.op === "krat" && (e.a === 1 || e.b === 1)) || (e.op === "deleno" && (e.b === 1 || e.a === e.b)); });
      var e0 = sol[Math.floor(rnd() * sol.length)];
      var g = e0.op + (cfg.dir === "both" ? e0.dir : "");
      var G = trivial ? tgroups : groups, K = trivial ? tkeys : gkeys;
      info[s] = sol;
      if (!G[g]) { G[g] = []; K.push(g); }
      G[g].push(s);
    });
    /* operace a směry se střídají dokola, „krát 1“ a „děleno 1“ až nakonec */
    var bag = [];
    [[groups, gkeys], [tgroups, tkeys]].forEach(function (gk) {
      var G = gk[0], K = shuffle(gk[1].sort(), rnd), left = true;
      while (left) {
        left = false;
        K.forEach(function (k) { if (G[k].length) { bag.push(G[k].shift()); left = true; } });
      }
    });
    var usedEq = {};
    function eqKeys(s) { return info[s].map(function (e) { return e.a + e.op + e.b + "=" + e.c; }); }
    function takeValid() {
      for (var i = 0; i < bag.length; i++) {
        var keys = eqKeys(bag[i]);
        if (keys.some(function (k) { return usedEq[k]; })) continue;
        var s = bag.splice(i, 1)[0];
        keys.forEach(function (k) { usedEq[k] = 1; });
        used[s] = 1; used[reverse(s)] = 1;
        return s;
      }
      var t = bag.shift(); used[t] = 1; return t;
    }
    function task(type, s) { return { type: type, str: s, sol: solve(s, cfg) }; }

    var nValid = sp.ano ? Math.round(sp.ano / 2) : 0;
    if (sp.ano >= 4) nValid += Math.floor(rnd() * 3) - 1; /* ne vždy přesně půl */
    var ano = [], i;
    for (i = 0; i < nValid; i++) ano.push(task("ano", takeValid()));
    for (i = nValid; i < sp.ano; i++) {
      var bad = makeInvalid(cfg, pool, used, rnd);
      if (bad == null) break;
      used[bad] = 1; used[reverse(bad)] = 1; ano.push(task("ano", bad));
    }
    shuffle(ano, rnd);
    var dop = [];
    for (i = 0; i < sp.dopln; i++) dop.push(task("dopln", takeValid()));
    res.tasks = ano.concat(dop);
    return res;
  }

  var api = {
    OPS: OPS, OP_ORDER: OP_ORDER, RANGES: RANGES, LENGTHS: LENGTHS, COUNTS: COUNTS,
    hashSeed: hashSeed, mulberry32: mulberry32, parseNum: parseNum, solve: solve, eqText: eqText,
    validPool: validPool, normalize: normalize, lengthInfo: lengthInfo, fitLength: fitLength,
    split: split, generate: generate
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Abaku = api;
})(this);
