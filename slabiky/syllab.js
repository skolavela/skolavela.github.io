// Pravidlové dělení českých slov na slabiky (pro čtení, ne pro typografické dělení).
(function (root) {
  const V = 'aeiouyáéíóúůýě';
  const LIQ = 'rlř';
  function isV(c) { return V.includes(c); }
  // rozdělí slovo na jednotky (ch = 1 souhláska, ou = dvojhláska)
  function units(w) {
    const lw = w.toLowerCase(), out = [];
    for (let i = 0; i < lw.length;) {
      const two = lw.substr(i, 2);
      if (two === 'ch') { out.push({ s: w.substr(i, 2), c: 'h', v: false }); i += 2; continue; }
      if (two === 'ou' || ((two === 'au' || two === 'eu') && i === 0)) { out.push({ s: w.substr(i, 2), c: two, v: true }); i += 2; continue; }
      out.push({ s: w[i], c: lw[i], v: isV(lw[i]) }); i++;
    }
    // slabikotvorné r, l: mezi souhláskami nebo na konci po souhlásce
    for (let i = 1; i < out.length; i++) {
      const u = out[i];
      if ((u.c === 'r' || u.c === 'l') && !out[i - 1].v && !(out[i - 1].syl)) {
        const nxt = out[i + 1];
        const pp = out[i - 2];
        if (!nxt || (!nxt.v && !(pp && (pp.v || pp.syl)))) u.syl = true;
      }
    }
    return out;
  }
  // časté předpony: pokud hranice předpony leží uvnitř skupiny souhlásek, dělí se na ní (na-cvi-čo-vat, před-sta-va)
  const PREF = ['před', 'pod', 'nad', 'roz', 'bez', 'nej', 'při', 'pře', 'pro', 'od', 'vy', 'do', 'po', 'na', 'za', 'ná', 'ne'];
  function prefixLen(u) {
    const lw = u.map(x => x.c).join('');
    for (const p of PREF) if (lw.startsWith(p) && lw.length > p.length + 1) {
      let n = 0, len = 0; while (len < p.length) len += u[n++].c.length;
      if (len === p.length) return n;
    }
    return 0;
  }
  function syllabify(word) {
    const u = units(word);
    const pl = prefixLen(u);
    const nuc = [];
    u.forEach((x, i) => { if (x.v || x.syl) nuc.push(i); });
    if (nuc.length < 2) return [word];
    const cuts = [];
    for (let k = 0; k < nuc.length - 1; k++) {
      const a = nuc[k], b = nuc[k + 1];
      const n = b - a - 1; // počet souhlásek mezi jádry
      let cut;
      if (n <= 1) cut = a + 1;
      else {
        const last = u[b - 1].c, prev = u[b - 2].c;
        const onset2 = LIQ.includes(last) && !'rlřjmn'.includes(prev);
        cut = n === 2 ? (onset2 ? a + 1 : a + 2) : (onset2 ? b - 2 : b - 1);
      }
      if (pl && pl > a && pl < b && (n >= 2 || 'dz'.includes(u[pl - 1].c) && !u[pl - 1].v)) cut = pl;
      cuts.push(cut);
    }
    const res = []; let start = 0;
    for (const c of cuts) { res.push(u.slice(start, c).map(x => x.s).join('')); start = c; }
    res.push(u.slice(start).map(x => x.s).join(''));
    return res;
  }
  // text -> pole tokenů {t: text, syl: [slabiky] | null}
  function tokenize(text) {
    const re = /[\p{L}]+/gu; const out = []; let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push({ t: text.slice(last, m.index), syl: null });
      out.push({ t: m[0], syl: syllabify(m[0]) }); last = re.lastIndex;
    }
    if (last < text.length) out.push({ t: text.slice(last), syl: null });
    return out;
  }
  const api = { syllabify, tokenize };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.Syllab = api;
})(this);
