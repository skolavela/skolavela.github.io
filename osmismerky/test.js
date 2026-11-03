// node osmismerky/test.js – každé umístěné slovo musí jít v mřížce přečíst ve svém směru
const E = require('./engine.js'), T = require('./topics.js');
let fail = 0, n = 0, skipped = 0, placed = 0;
for (const t of T) for (const lvl of [1, 2]) for (const keepDia of [true, false]) for (let seed = 1; seed <= 5; seed++) {
  const size = lvl === 1 ? 10 : 15, all8 = lvl === 2;
  const r = E.generate({ words: lvl === 1 ? t.a : t.b.concat(t.a), size, count: lvl === 1 ? 10 : 18, all8, keepDia, seed });
  n++;
  if (r.g.length !== size || r.g.some(row => row.length !== size || row.some(c => !c || c.length !== 1))) { fail++; console.log('FAIL mřížka', t.n); }
  for (const p of r.placed) {
    placed++;
    if (E.readWord(r.g, p) !== p.w) { fail++; console.log('FAIL', t.n, p.w); }
    if (!all8 && !((p.dy === 0 && p.dx === 1) || (p.dy === 1 && p.dx === 0))) { fail++; console.log('FAIL směr', p.w); }
    if (!keepDia && /[^A-Z]/.test(p.w)) { fail++; console.log('FAIL diakritika', p.w); }
  }
  skipped += r.skipped.length;
  const again = E.generate({ words: lvl === 1 ? t.a : t.b, size, count: 10, all8, keepDia, seed });
  const again2 = E.generate({ words: lvl === 1 ? t.a : t.b, size, count: 10, all8, keepDia, seed });
  if (again.g.join() !== again2.g.join()) { fail++; console.log('FAIL seed není deterministický'); }
}
console.log(`${n} osmisměrek, ${placed} slov umístěno, ${skipped} vynecháno`);
console.log(fail ? fail + ' chyb' : 'Vše OK'); process.exit(fail ? 1 : 0);
