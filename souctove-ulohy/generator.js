/* Součtové úlohy – generátor a řešič (bez DOM, použitelné z Node). */
(function (root) {
  "use strict";

  function hashSeed(s) {
    s = String(s == null ? "" : s).trim();
    if (/^\d+$/.test(s)) return (parseInt(s.slice(-9), 10) >>> 0);
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rndInt(rnd, maxIncl) { return (rnd() * (maxIncl + 1)) | 0; }
  function shuffle(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = (rnd() * (i + 1)) | 0;
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = a % b; a = b; b = t; }
    return a || 1;
  }

  function Rat(n, d) {
    if (d == null) d = 1;
    if (d < 0) { n = -n; d = -d; }
    if (n === 0) { this.n = 0; this.d = 1; return; }
    var g = gcd(n, d);
    this.n = n / g; this.d = d / g;
  }
  Rat.z = function (n) { return new Rat(n, 1); };
  Rat.prototype.add = function (o) { return new Rat(this.n * o.d + o.n * this.d, this.d * o.d); };
  Rat.prototype.sub = function (o) { return new Rat(this.n * o.d - o.n * this.d, this.d * o.d); };
  Rat.prototype.mul = function (o) { return new Rat(this.n * o.n, this.d * o.d); };
  Rat.prototype.div = function (o) { return new Rat(this.n * o.d, this.d * o.n); };
  Rat.prototype.neg = function () { return new Rat(-this.n, this.d); };
  Rat.prototype.isZero = function () { return this.n === 0; };
  Rat.prototype.isInt = function () { return this.d === 1; };
  Rat.prototype.toInt = function () { return this.d === 1 ? this.n : null; };

  var BINOM = [];
  function binom(n, k) {
    if (k < 0 || k > n) return 0;
    if (!BINOM[n]) {
      BINOM[n] = [1];
      for (var i = 1; i <= n; i++) BINOM[n][i] = (BINOM[n][i - 1] * (n - i + 1) / i) | 0;
    }
    return BINOM[n][k];
  }

  function triCount(n) { return n * (n + 1) / 2; }
  function triIndex(n, r, i) {
    /* r = 0 dole, i zleva. Flat: dole celá řada, pak o 1 kratší, … */
    var idx = 0;
    for (var rr = 0; rr < r; rr++) idx += (n - rr);
    return idx + i;
  }
  function triPos(n, idx) {
    var r = 0, left = idx;
    while (left >= n - r) { left -= (n - r); r++; }
    return { r: r, i: left };
  }
  function triValue(x, r, i) {
    var s = 0;
    for (var j = 0; j <= r; j++) s += binom(r, j) * x[i + j];
    return s;
  }
  function triValues(x) {
    var n = x.length, out = [];
    for (var r = 0; r < n; r++)
      for (var i = 0; i < n - r; i++) out.push(triValue(x, r, i));
    return out;
  }
  function fibPair(i) {
    if (i === 0) return [1, 0];
    if (i === 1) return [0, 1];
    var a0 = 1, b0 = 0, a1 = 0, b1 = 1, k, a, b;
    for (k = 2; k <= i; k++) { a = a0 + a1; b = b0 + b1; a0 = a1; b0 = b1; a1 = a; b1 = b; }
    return [a1, b1];
  }
  function radaValues(a, b, k) {
    var v = [a, b], i;
    for (i = 2; i < k; i++) v.push(v[i - 2] + v[i - 1]);
    return v;
  }

  function checkRules(vals, limit) {
    var i, v, zeros = 0, not10 = 0;
    for (i = 0; i < vals.length; i++) {
      v = vals[i];
      if (v == null || v !== (v | 0) || v < 0 || v > limit) return false;
      if (v === 0) zeros++;
      if (v % 10 !== 0) not10++;
    }
    if (limit <= 100) { if (zeros > 1) return false; }
    else { if (zeros > 0) return false; if (not10 < Math.ceil(vals.length / 2)) return false; }
    return true;
  }

  function triples(typ, n) {
    var t = [], r, i, k;
    if (typ === "trojuhelnik") {
      for (r = 0; r < n - 1; r++)
        for (i = 0; i < n - r - 1; i++)
          t.push([triIndex(n, r, i), triIndex(n, r, i + 1), triIndex(n, r + 1, i)]);
    } else {
      for (k = 2; k < n; k++) t.push([k - 2, k - 1, k]);
    }
    return t;
  }

  function relationsHold(typ, n, vals) {
    var t = triples(typ, n), i, a, b, c;
    for (i = 0; i < t.length; i++) {
      a = vals[t[i][0]]; b = vals[t[i][1]]; c = vals[t[i][2]];
      if (a + b !== c) return false;
    }
    return true;
  }

  /* Krok za krokem: dítě zná dvě ze tří v a+b=c. */
  function classify(typ, n, givenIdx, total) {
    var known = new Array(total).fill(false);
    var i, changed, usedSub = false;
    for (i = 0; i < givenIdx.length; i++) known[givenIdx[i]] = true;
    var t = triples(typ, n);
    var guard = 0;
    do {
      changed = false;
      if (++guard > total + 2) break;
      for (i = 0; i < t.length; i++) {
        var a = t[i][0], b = t[i][1], c = t[i][2];
        var ka = known[a], kb = known[b], kc = known[c];
        var kn = (ka ? 1 : 0) + (kb ? 1 : 0) + (kc ? 1 : 0);
        if (kn !== 2) continue;
        if (!kc) { known[c] = true; }
        else { known[ka ? b : a] = true; usedSub = true; }
        changed = true;
      }
    } while (changed);
    for (i = 0; i < total; i++) if (!known[i]) return "narocna";
    return usedSub ? "stredni" : "lehka";
  }

  /* Gauss nad Q, volné parametry max. 2, hrubá síla 0..limit, max 50 řešení. */
  function solveSystem(rows, nVars, typ, n, limit) {
    var m = rows.length, A = [], r, c, i, j, k, p, tmp;
    for (i = 0; i < m; i++) {
      A[i] = [];
      for (j = 0; j <= nVars; j++) A[i][j] = new Rat(rows[i][j].n, rows[i][j].d);
    }
    r = 0;
    var pivotCol = [];
    var used = new Array(nVars).fill(false);
    for (c = 0; c < nVars && r < m; c++) {
      p = -1;
      for (i = r; i < m; i++) if (!A[i][c].isZero()) { p = i; break; }
      if (p < 0) continue;
      tmp = A[r]; A[r] = A[p]; A[p] = tmp;
      var pv = A[r][c];
      for (j = c; j <= nVars; j++) A[r][j] = A[r][j].div(pv);
      for (i = 0; i < m; i++) if (i !== r && !A[i][c].isZero()) {
        var f = A[i][c];
        for (j = c; j <= nVars; j++) A[i][j] = A[i][j].sub(A[r][j].mul(f));
      }
      used[c] = true; pivotCol[r] = c; r++;
    }
    for (i = r; i < m; i++) if (!A[i][nVars].isZero()) return { count: 0, solutions: [], hitCap: false };
    var free = [];
    for (c = 0; c < nVars; c++) if (!used[c]) free.push(c);
    if (free.length > 2) return { count: 0, solutions: [], hitCap: false };

    function boundVars(freeVals) {
      var x = new Array(nVars), ii, jj, col, v, out = [];
      for (ii = 0; ii < free.length; ii++) x[free[ii]] = Rat.z(freeVals[ii]);
      for (ii = 0; ii < r; ii++) {
        col = pivotCol[ii]; v = A[ii][nVars];
        for (jj = 0; jj < free.length; jj++) {
          if (!A[ii][free[jj]].isZero()) v = v.sub(A[ii][free[jj]].mul(x[free[jj]]));
        }
        if (!v.isInt()) return null;
        x[col] = v;
      }
      for (ii = 0; ii < nVars; ii++) {
        if (!x[ii] || !x[ii].isInt()) return null;
        out[ii] = x[ii].n;
      }
      return out;
    }

    function complete(vars) {
      var vals = typ === "trojuhelnik" ? triValues(vars) : radaValues(vars[0], vars[1], n);
      if (!checkRules(vals, limit)) return null;
      if (!relationsHold(typ, n, vals)) return null;
      return vals;
    }

    var solutions = [], hitCap = false, count = 0;
    function addSol(vars) {
      var vals = complete(vars);
      if (!vals) return;
      count++;
      if (solutions.length < 50) solutions.push(vals);
      if (count >= 50) hitCap = true;
    }

    if (free.length === 0) {
      var one = boundVars([]);
      if (one) addSol(one);
      return { count: count, solutions: solutions, hitCap: false };
    }
    if (free.length === 1) {
      for (k = 0; k <= limit && !hitCap; k++) {
        var v1 = boundVars([k]);
        if (v1) addSol(v1);
      }
    } else {
      /* max. 4000 dvojic, stejné pořadí při stejném seedu soustavy */
      var seedA = 1;
      for (i = 0; i < A.length; i++) seedA = (Math.imul(seedA, 31) + A[i][nVars].n) | 0;
      var prng = mulberry32(seedA >>> 0 || 1);
      var seen = {}, tries, kk, jj, key, span = (limit + 1) * (limit + 1);
      var budget = Math.min(4000, span);
      if (span <= 4000) {
        outer:
        for (k = 0; k <= limit; k++)
          for (j = 0; j <= limit; j++) {
            var v2 = boundVars([k, j]);
            if (v2) addSol(v2);
            if (hitCap) break outer;
          }
      } else {
        for (tries = 0; tries < budget && !hitCap; tries++) {
          kk = (prng() * (limit + 1)) | 0;
          jj = (prng() * (limit + 1)) | 0;
          key = kk + "," + jj;
          if (seen[key]) continue;
          seen[key] = 1;
          var v2s = boundVars([kk, jj]);
          if (v2s) addSol(v2s);
        }
      }
    }
    return { count: count, solutions: solutions, hitCap: hitCap };
  }

  function givenToRows(typ, n, given) {
    /* given: [{idx, val}] ; proměnné = spodní řada / r0,r1 */
    var nVars = typ === "trojuhelnik" ? n : 2;
    var rows = [], g, i, pos, coeff, row;
    for (g = 0; g < given.length; g++) {
      row = [];
      for (i = 0; i < nVars; i++) row[i] = Rat.z(0);
      if (typ === "trojuhelnik") {
        pos = triPos(n, given[g].idx);
        for (i = 0; i <= pos.r; i++) row[pos.i + i] = Rat.z(binom(pos.r, i));
      } else {
        coeff = fibPair(given[g].idx);
        row[0] = Rat.z(coeff[0]); row[1] = Rat.z(coeff[1]);
      }
      row[nVars] = Rat.z(given[g].val);
      rows.push(row);
    }
    return { rows: rows, nVars: nVars };
  }

  function solveFromGiven(typ, n, limit, given) {
    var pack = givenToRows(typ, n, given);
    return solveSystem(pack.rows, pack.nVars, typ, n, limit);
  }

  function sampleTri(n, L, rnd) {
    var t, i, order, x, usedTop, coeff, max, vals;
    for (t = 0; t < 400; t++) {
      x = new Array(n);
      for (i = 0; i < n; i++) x[i] = 0;
      order = shuffle(Array.from({ length: n }, function (_, k) { return k; }), rnd);
      var ok = true;
      for (i = 0; i < order.length; i++) {
        var j = order[i];
        coeff = binom(n - 1, j);
        usedTop = triValue(x, n - 1, 0);
        max = Math.floor((L - usedTop) / coeff);
        if (max < (L <= 100 ? 0 : 1)) { ok = false; break; }
        var lo = (L > 100) ? 1 : 0;
        if (L > 100 && rnd() < 0.7) {
          /* spíš ne násobek 10 */
          var tries = 0, v;
          do { v = lo + rndInt(rnd, max - lo); tries++; } while (v % 10 === 0 && tries < 8);
          x[j] = v;
        } else x[j] = lo + rndInt(rnd, max - lo);
      }
      if (!ok) continue;
      vals = triValues(x);
      if (checkRules(vals, L)) return { values: vals, base: x };
    }
    return null;
  }

  function sampleRada(k, L, rnd) {
    var t, a, b, vals, lo = (L > 100) ? 1 : 0;
    for (t = 0; t < 400; t++) {
      a = lo + rndInt(rnd, Math.min(L, Math.floor(L / 2)) - lo);
      b = lo + rndInt(rnd, Math.min(L, Math.floor(L / 2)) - lo);
      vals = radaValues(a, b, k);
      if (checkRules(vals, L)) return { values: vals, base: [a, b] };
    }
    var pool = radaPool(k, L);
    if (pool.length) return pool[rndInt(rnd, pool.length - 1)];
    return null;
  }

  var RADA_POOL = {};
  function radaPool(k, L) {
    var key = k + ":" + L;
    if (RADA_POOL[key]) return RADA_POOL[key];
    var lo = (L > 100) ? 1 : 0, a, b, vals, out = [];
    var maxA = L, maxB = L;
    /* horní mez z posledního členu (největší Fibonacci) */
    for (a = lo; a <= maxA; a++) {
      for (b = lo; b <= maxB; b++) {
        vals = radaValues(a, b, k);
        if (vals[vals.length - 1] > L) {
          if (b === lo) { maxA = a - 1; break; }
          break;
        }
        if (checkRules(vals, L)) out.push({ values: vals, base: [a, b] });
      }
    }
    RADA_POOL[key] = out;
    return out;
  }

  function sampleFilling(typ, n, L, rnd) {
    return typ === "trojuhelnik" ? sampleTri(n, L, rnd) : sampleRada(n, L, rnd);
  }

  function givenFromMask(values, idxs) {
    return idxs.map(function (i) { return { idx: i, val: values[i] }; });
  }

  function maskLehka(typ, n) {
    if (typ === "trojuhelnik") {
      var a = [], i; for (i = 0; i < n; i++) a.push(i); return a; /* celá spodní řada */
    }
    return [0, 1];
  }
  function maskStredni(typ, n, rnd) {
    if (typ === "trojuhelnik") {
      var hide = rndInt(rnd, n - 1);
      var a = [], i;
      for (i = 0; i < n; i++) if (i !== hide) a.push(i);
      var parentI = hide === 0 ? 0 : hide - 1;
      a.push(triIndex(n, 1, parentI));
      return a;
    }
    /* řada: zadané r1 a r2, r0 se dopočte odčítáním */
    return [1, 2];
  }
  function maskNarocnaUnique(typ, n, rnd) {
    if (typ === "trojuhelnik") {
      /* vrchol + oba spodní rohy; pro n>3 doplň buňky, které nespustí krok za krokem */
      var top = triIndex(n, n - 1, 0);
      var a = [top, triIndex(n, 0, 0), triIndex(n, 0, n - 1)];
      if (n === 3) return a;
      var extra = [], r, i;
      for (r = 0; r < n; r++)
        for (i = 0; i < n - r; i++) {
          var id = triIndex(n, r, i);
          if (a.indexOf(id) < 0) extra.push(id);
        }
      extra = shuffle(extra, rnd);
      var total = triCount(n);
      for (i = 0; i < extra.length && a.length < n; i++) {
        var cand = a.concat([extra[i]]);
        if (classify("trojuhelnik", n, cand, total) === "narocna") a.push(extra[i]);
      }
      return a;
    }
    /* první a poslední (nejsou v jedné trojici a+b=c) */
    return [0, n - 1];
  }
  function maskNarocnaMulti(typ, n, total, rnd) {
    var dof = typ === "trojuhelnik" ? n : 2;
    var need = Math.max(1, dof - 1);
    if (typ === "rada") {
      return [rndInt(rnd, n - 1)];
    }
    /* n-1 buněk: levý kraj bez jedné, nebo náhodný výběr */
    if (rnd() < 0.5) {
      var a = [], r, drop = rndInt(rnd, n - 1);
      for (r = 0; r < n; r++) if (r !== drop) a.push(triIndex(n, r, 0));
      if (a.length === need) return a;
    }
    var all = Array.from({ length: total }, function (_, i) { return i; });
    return shuffle(all, rnd).slice(0, need);
  }

  function impossibleCombo(difficulty, wantMulti) {
    return wantMulti && (difficulty === "lehka" || difficulty === "stredni");
  }

  function generateTask(rnd, opts) {
    var typ = opts.typ, n = opts.size, L = opts.limit;
    var wantMulti = !!opts.wantMulti;
    var diff = opts.difficulty;
    var total = typ === "trojuhelnik" ? triCount(n) : n;
    if (impossibleCombo(diff, wantMulti)) return null;
    var attempt, fill, mask, given, solved, cls;
    var maxAtt = opts.maxAttempts || 2000;
    for (attempt = 0; attempt < maxAtt; attempt++) {
      fill = sampleFilling(typ, n, L, rnd);
      if (!fill) continue;
      if (diff === "lehka") mask = maskLehka(typ, n);
      else if (diff === "stredni") mask = maskStredni(typ, n, rnd);
      else if (wantMulti) mask = maskNarocnaMulti(typ, n, total, rnd);
      else mask = maskNarocnaUnique(typ, n, rnd);
      /* unikátní indexy */
      mask = mask.filter(function (v, i, s) { return s.indexOf(v) === i; });
      cls = classify(typ, n, mask, total);
      if (cls !== diff) continue;
      given = givenFromMask(fill.values, mask);
      solved = solveFromGiven(typ, n, L, given);
      if (!solved || solved.count === 0) continue;
      if (wantMulti) { if (solved.count < 3) continue; }
      else { if (solved.count !== 1) continue; }
      return {
        typ: typ, size: n, limit: L,
        values: fill.values,
        given: mask.slice(),
        solutions: solved.solutions.slice(0, Math.max(3, 1)),
        solCount: solved.count,
        hitCap: solved.hitCap,
        difficulty: cls,
        multi: solved.count >= 3
      };
    }
    return null;
  }

  function taskSignature(task, mirror) {
    var n = task.size, typ = task.typ, parts = [typ, n], i, idx, val, pos, mi;
    var givenSet = {};
    for (i = 0; i < task.given.length; i++) {
      idx = task.given[i];
      val = task.values[idx];
      if (mirror && typ === "trojuhelnik") {
        pos = triPos(n, idx);
        mi = triIndex(n, pos.r, (n - pos.r - 1) - pos.i);
        parts.push(mi + ":" + val);
      } else if (mirror && typ === "rada") {
        parts.push((n - 1 - idx) + ":" + val);
      } else parts.push(idx + ":" + val);
    }
    return parts.sort().join("|");
  }

  /* Kolik úloh se vejde na A4 (box 14 mm). copies=1 nebo 3. */
  var PAGE = { w: 182, h: 249, box: 14, gap: 2.4, label: 5, hint: 4, tgx: 6, tgy: 5 };

  function triangleBlock(n, copies) {
    var tw = n * PAGE.box + (n - 1) * PAGE.gap;
    var th = n * PAGE.box + (n - 1) * PAGE.gap;
    if (copies === 1) return { w: tw, h: th + PAGE.label, cols: 1 };
    var rowW = copies * tw + (copies - 1) * 4;
    if (rowW <= PAGE.w) return { w: rowW, h: th + PAGE.label + PAGE.hint, cols: copies };
    if (2 * tw + 4 <= PAGE.w) return { w: 2 * tw + 4, h: 2 * (th + 2) + PAGE.label + PAGE.hint, cols: 2 };
    return { w: tw, h: copies * (th + 2) + PAGE.label + PAGE.hint, cols: 1 };
  }
  function radaBlock(k, copies) {
    var rw = k * PAGE.box + (k - 1) * PAGE.gap;
    var rh = PAGE.box;
    if (copies === 1) return { w: rw, h: rh + PAGE.label, cols: 1 };
    var rowW = copies * rw + (copies - 1) * 4;
    if (rowW <= PAGE.w) return { w: rowW, h: rh + PAGE.label + PAGE.hint, cols: copies };
    if (2 * rw + 4 <= PAGE.w) return { w: 2 * rw + 4, h: 2 * (rh + 2) + PAGE.label + PAGE.hint, cols: 2 };
    return { w: rw, h: copies * (rh + 2) + PAGE.label + PAGE.hint, cols: 1 };
  }
  function blockSize(typ, size, copies) {
    return typ === "trojuhelnik" ? triangleBlock(size, copies) : radaBlock(size, copies);
  }
  function gridCols(typ, size) {
    if (typ === "rada") return 1;
    return size >= 5 ? 1 : 2;
  }
  function colWidth(typ, size) {
    var cols = gridCols(typ, size);
    return cols === 2 ? (PAGE.w - PAGE.tgx) / 2 : PAGE.w;
  }
  function taskIsWide(typ, size, copies) {
    if (copies <= 1 || gridCols(typ, size) === 1) return false;
    return blockSize(typ, size, copies).w > colWidth(typ, size) + 0.1;
  }
  function tasksFit(typ, size, copiesList) {
    var cols = gridCols(typ, size);
    var x = 0, y = 0, rowH = 0, i, b, used = 0, wide;
    for (i = 0; i < copiesList.length; i++) {
      b = blockSize(typ, size, copiesList[i]);
      wide = taskIsWide(typ, size, copiesList[i]);
      if (wide || cols === 1 || x + b.w > PAGE.w + 0.1) {
        if (x > 0) { y += rowH + PAGE.tgy; x = 0; rowH = 0; }
      }
      if (y + b.h > PAGE.h + 0.1) break;
      if (wide) {
        y += b.h + PAGE.tgy;
        x = 0;
        rowH = 0;
      } else {
        x += b.w + PAGE.tgx;
        rowH = Math.max(rowH, b.h);
      }
      used++;
    }
    return used;
  }
  function maxFit(typ, size, allMulti) {
    var copies = allMulti ? 3 : 1;
    var arr = [], i;
    for (i = 0; i < 12; i++) arr.push(copies);
    return tasksFit(typ, size, arr);
  }
  function snapCount(want, max) {
    if (max >= want) return want;
    if (want > 9 && max >= 9) return 9;
    if (want > 6 && max >= 6) return 6;
    return max;
  }

  var MSG = {
    lehka_vice: "Lehké úlohy s více řešeními nejdou vytvořit, zkus Střední nebo Náročnou.",
    stredni_vice: "Střední úlohy s více řešeními nejdou vytvořit, zkus Náročnou.",
    lehka_mix: "Lehké úlohy s více řešeními nejdou vytvořit, list má jen úlohy s jedním řešením.",
    stredni_mix: "Střední úlohy s více řešeními nejdou vytvořit, list má jen úlohy s jedním řešením.",
    fit: function (n) { return "Na jednu stranu se vejde " + n + (n === 1 ? " úloha" : n < 5 ? " úlohy" : " úloh") + ", počet je upravený."; },
    few: "Pro toto nastavení se nepodařilo vyrobit dost úloh, zkus jiné nastavení."
  };

  function fallbackMessage(settings, have, want, wantedMulti) {
    if (have >= want) return "";
    if (settings.reseni === "vice" && settings.obtiznost === "lehka") return MSG.lehka_vice;
    if (settings.reseni === "vice" && settings.obtiznost === "stredni") return MSG.stredni_vice;
    if (settings.reseni === "mix" && settings.obtiznost === "lehka" && have > 0) return MSG.lehka_mix;
    if (settings.reseni === "mix" && settings.obtiznost === "stredni" && have > 0) return MSG.stredni_mix;
    if (have === 0 && wantedMulti) {
      if (settings.obtiznost === "lehka") return MSG.lehka_vice;
      if (settings.obtiznost === "stredni") return MSG.stredni_vice;
    }
    return MSG.few;
  }

  function generateSheet(settings, rnd) {
    if (!rnd) rnd = mulberry32(hashSeed(settings.cislo));
    var typ = settings.typ, size = settings.vel, L = settings.obor;
    var allMulti = settings.reseni === "vice";
    var messages = [];
    var want = settings.pocet;
    var cap = maxFit(typ, size, allMulti);
    if (settings.reseni === "mix") {
      /* nejistý počet kopií: horní odhad jako kdyby všechny byly trojité, ale zkusíme want a ořízneme až po vygenerování */
      cap = maxFit(typ, size, false);
    }
    var target = snapCount(want, settings.reseni === "mix" ? 12 : cap);
    var announcedFit = false;
    if (target < want && settings.reseni !== "mix") {
      messages.push(MSG.fit(target));
      announcedFit = true;
    }

    var tasks = [], keys = {}, attempts = 0, wantedMulti = false;
    var maxAttempts = Math.max(400, target * 80);
    while (tasks.length < target && attempts < maxAttempts) {
      attempts++;
      var wantMulti = settings.reseni === "vice" || (settings.reseni === "mix" && rnd() < 0.5);
      if (wantMulti) wantedMulti = true;
      var task = null;
      if (!impossibleCombo(settings.obtiznost, wantMulti)) {
        task = generateTask(rnd, {
          typ: typ, size: size, limit: L,
          difficulty: settings.obtiznost, wantMulti: wantMulti
        });
      }
      if (!task && settings.reseni === "mix" && wantMulti) {
        /* v mixu když více nejde, zkus jednoznačnou, ať je list plný */
        task = generateTask(rnd, {
          typ: typ, size: size, limit: L,
          difficulty: settings.obtiznost, wantMulti: false
        });
      }
      if (!task) continue;
      var sig = taskSignature(task, false), mir = taskSignature(task, true);
      if (keys[sig] || keys[mir]) continue;
      keys[sig] = 1; keys[mir] = 1;
      tasks.push(task);
    }
    if (tasks.length < target) {
      /* nepovedlo se naplnit ani upravený počet — jen zpráva o nedostatku, ne o místu */
      if (announcedFit) messages = [];
      var fb = fallbackMessage(settings, tasks.length, target, wantedMulti);
      if (fb && messages.indexOf(fb) < 0) messages.push(fb);
    }
    /* Mix / více: ořízni podle skutečného místa (trojité úlohy berou 3× místo) */
    var copies = tasks.map(function (t) { return t.multi ? 3 : 1; });
    var fitN = tasksFit(typ, size, copies);
    if (fitN < tasks.length) {
      tasks = tasks.slice(0, fitN);
      var mfit = MSG.fit(fitN);
      if (messages.indexOf(mfit) < 0) messages.push(mfit);
    }
    return {
      tasks: tasks,
      message: messages.join(" "),
      count: tasks.length,
      typ: typ,
      size: size,
      limit: L
    };
  }

  var DEFAULTS = {
    typ: "trojuhelnik",
    vel: 3,
    obor: 20,
    obtiznost: "lehka",
    reseni: "jedno",
    pocet: 6,
    cislo: 48213,
    ukazat: false
  };

  function normalizeSettings(s) {
    var d = Object.assign({}, DEFAULTS, s || {});
    d.typ = d.typ === "rada" ? "rada" : "trojuhelnik";
    var sizes = d.typ === "rada" ? [5, 6, 7, 8] : [3, 4, 5];
    d.vel = sizes.indexOf(+d.vel) >= 0 ? +d.vel : (d.typ === "rada" ? 6 : 3);
    d.obor = [20, 100, 1000].indexOf(+d.obor) >= 0 ? +d.obor : 20;
    d.obtiznost = ["lehka", "stredni", "narocna"].indexOf(d.obtiznost) >= 0 ? d.obtiznost : "lehka";
    d.reseni = ["jedno", "vice", "mix"].indexOf(d.reseni) >= 0 ? d.reseni : "jedno";
    d.pocet = [6, 9, 12].indexOf(+d.pocet) >= 0 ? +d.pocet : 6;
    var c = parseInt(d.cislo, 10);
    d.cislo = (c > 0 ? c : (hashSeed(d.cislo) || 1)) >>> 0;
    if (d.cislo === 0) d.cislo = 1;
    d.ukazat = !!d.ukazat;
    return d;
  }

  function formatHash(s) {
    s = normalizeSettings(s);
    return "#typ=" + s.typ + "&vel=" + s.vel + "&obor=" + s.obor +
      "&obtiznost=" + s.obtiznost + "&reseni=" + s.reseni + "&pocet=" + s.pocet +
      "&cislo=" + s.cislo + "&ukazat=" + (s.ukazat ? "1" : "0");
  }
  function parseHash(h) {
    var o = {}, raw = String(h || "").replace(/^#/, "");
    if (!raw) return normalizeSettings({});
    raw.split("&").forEach(function (p) {
      var i = p.indexOf("="); if (i < 0) return;
      o[decodeURIComponent(p.slice(0, i))] = decodeURIComponent(p.slice(i + 1));
    });
    if (o.ukazat != null) o.ukazat = o.ukazat === "1" || o.ukazat === "true";
    return normalizeSettings(o);
  }

  var API = {
    hashSeed: hashSeed, mulberry32: mulberry32,
    binom: binom, triValues: triValues, triIndex: triIndex, triPos: triPos, triCount: triCount,
    radaValues: radaValues, checkRules: checkRules, relationsHold: relationsHold,
    classify: classify, solveFromGiven: solveFromGiven, generateTask: generateTask,
    generateSheet: generateSheet, taskSignature: taskSignature,
    maxFit: maxFit, tasksFit: tasksFit, blockSize: blockSize, gridCols: gridCols, taskIsWide: taskIsWide,
    impossibleCombo: impossibleCombo, MSG: MSG,
    DEFAULTS: DEFAULTS, normalizeSettings: normalizeSettings,
    formatHash: formatHash, parseHash: parseHash,
    triples: triples
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.Souctove = API;
})(typeof window !== "undefined" ? window : globalThis);
