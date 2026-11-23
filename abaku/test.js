/* node abaku/test.js */
const A = require('./abaku.js'); const assert = require('assert');
const ALL = { plus: 1, minus: 1, krat: 1, deleno: 1 };
const cfg = (o) => A.normalize(Object.assign({ ops: ALL, max: 20, dir: 'ltr', types: { ano: 1, dopln: 1 }, count: 12 }, o));
const eqs = (s, c) => A.solve(s, c).map(e => (e.dir === 'rtl' ? '<' : '') + A.eqText(e));

// známé příklady
assert.deepStrictEqual(eqs('123', cfg({ ops: { plus: 1 }, max: 9 })), ['1 + 2 = 3']);
assert.deepStrictEqual(eqs('1234', cfg({ ops: { deleno: 1 } })), ['12 : 3 = 4']);
assert.deepStrictEqual(eqs('12315', cfg({ ops: { plus: 1 } })), ['12 + 3 = 15']);
assert.deepStrictEqual(eqs('248', cfg({ ops: { krat: 1 }, max: 9 })), ['2 · 4 = 8']);
assert.deepStrictEqual(eqs('532', cfg({ ops: { minus: 1 }, max: 9 })), ['5 − 3 = 2']);
// 1234 jen se sčítáním ani násobením není abaku
assert.strictEqual(A.solve('1234', cfg({ ops: { plus: 1, krat: 1 } })).length, 0);
// dělení jen beze zbytku
assert.strictEqual(A.solve('732', cfg({ ops: { deleno: 1 }, max: 9 })).length, 0); // 7:3 není 2
// rozsah: 12315 s jednocifernými čísly neplatí
assert.strictEqual(A.solve('12315', cfg({ ops: { plus: 1 }, max: 9 })).length, 0);
// do 20: 50 + 50 = 100 jen do 100
assert.strictEqual(A.solve('5050100', cfg({ ops: { plus: 1 } })).length, 0);
assert.deepStrictEqual(eqs('5050100', cfg({ ops: { plus: 1 }, max: 100 })), ['50 + 50 = 100']);

// nula: nikdy sama, nikdy na začátku čísla
assert.strictEqual(A.parseNum('0', 20), -1);
assert.strictEqual(A.parseNum('01', 20), -1);
assert.strictEqual(A.parseNum('10', 20), 10);
assert.strictEqual(A.solve('505', cfg({ ops: ALL, max: 9 })).length, 0);      // 5 - 0 = 5 / 5 + 0 = 5 neplatí
assert.strictEqual(A.solve('5005', cfg({ ops: ALL, max: 100 })).length, 0);   // 5 + 0 = 05, 50 : 0 ... neplatí
assert.deepStrictEqual(eqs('10515', cfg({ ops: { plus: 1 } })), ['10 + 5 = 15']);
assert.strictEqual(A.solve('1055', cfg({ ops: { plus: 1 }, max: 100 })).length, 0); // 1 + 05 = 5 ne, 10 + 5 = 5 ne

// směry
const p9 = (dir) => cfg({ ops: { plus: 1 }, max: 9, dir });
assert.strictEqual(A.solve('321', p9('ltr')).length, 0);
assert.deepStrictEqual(eqs('321', p9('both')), ['<1 + 2 = 3']);
assert.deepStrictEqual(eqs('321', cfg({ ops: { minus: 1 }, max: 9 })), ['3 − 2 = 1']);
assert.deepStrictEqual(eqs('4321', cfg({ ops: { deleno: 1 }, dir: 'both' })), ['<12 : 3 = 4']);
// palindrom se nepočítá dvakrát
assert.strictEqual(A.solve('121', cfg({ ops: { minus: 1 }, max: 9, dir: 'both' })).length, 0);
assert.deepStrictEqual(eqs('111', cfg({ ops: { krat: 1, deleno: 1 }, max: 9, dir: 'both' })), ['1 · 1 = 1', '1 : 1 = 1']);

// vlastní nezávislá hrubá síla (rovnosti -> množina), porovnání se solve pro všechny řetězce délky 3–4 a vzorek délky 5
function brute(s, c) {
  const dirs = c.dir === 'both' ? [s, s.split('').reverse().join('')] : [s];
  const ok = (t) => t.length > 0 && t[0] !== '0' && +t >= 1 && +t <= c.max;
  for (const t of dirs) for (let i = 1; i < t.length - 1; i++) for (let j = i + 1; j < t.length; j++) {
    const x = t.slice(0, i), y = t.slice(i, j), z = t.slice(j);
    if (!ok(x) || !ok(y) || !ok(z)) continue;
    const a = +x, b = +y, r = +z;
    if (c.ops.plus && a + b === r) return true;
    if (c.ops.minus && a - b === r) return true;
    if (c.ops.krat && a * b === r) return true;
    if (c.ops.deleno && a === b * r) return true;
  }
  return false;
}
for (const max of [9, 20, 100]) for (const dir of ['ltr', 'both']) for (const ops of [ALL, { plus: 1 }, { minus: 1, deleno: 1 }]) {
  const c = cfg({ max, dir, ops });
  for (let n = 100; n < 100000; n++) {
    if (n >= 10000 && n % 7) continue;
    const s = String(n);
    assert.strictEqual(A.solve(s, c).length > 0, brute(s, c), `solve vs brute ${s} ${max} ${dir}`);
  }
}

// generátor: deterministický, bez duplicit, platné jsou platné, neplatné neplatné
let checked = 0;
for (const max of [9, 20, 100]) for (const dir of ['ltr', 'both']) for (const ops of [ALL, { plus: 1 }, { krat: 1 }, { plus: 1, minus: 1 }])
  for (const types of [{ ano: 1 }, { dopln: 1 }, { ano: 1, dopln: 1 }]) for (const count of A.COUNTS) for (const len of A.LENGTHS) for (const seed of ['1', '4242', '987654']) {
    const o = { max, dir, ops, types, count, len, seed };
    const g = A.generate(o);
    if (!g.ok) { assert.strictEqual(A.fitLength(A.normalize(o)), null); continue; }
    assert.deepStrictEqual(A.generate(o).tasks, g.tasks, 'seed reprodukovatelný');
    assert.strictEqual(g.tasks.length, count, `počet ${JSON.stringify(o)}`);
    const strs = g.tasks.map(t => t.str);
    assert.strictEqual(new Set(strs).size, strs.length, 'duplicita');
    for (const t of g.tasks) {
      assert.strictEqual(t.str.length, g.cfg.len);
      assert.notStrictEqual(t.str[0], '0');
      const valid = brute(t.str, g.cfg);
      assert.strictEqual(t.sol.length > 0, valid);
      if (t.type === 'dopln') assert(valid, 'doplň jen platné');
      checked++;
    }
    const ano = g.tasks.filter(t => t.type === 'ano');
    if (ano.length >= 4) {
      const v = ano.filter(t => t.sol.length).length;
      assert(v >= 1 && v < ano.length, 'mix ano/ne');
    }
  }
// jednociferná čísla: jen délka 3
const one = A.lengthInfo(A.normalize({ ops: ALL, max: 9, types: { dopln: 1 }, count: 8 }));
assert.deepStrictEqual(one.map(x => x.ok), [true, false, false, false]);
assert.strictEqual(A.generate({ ops: ALL, max: 9, len: 5, types: { dopln: 1 }, count: 8 }).cfg.len, 3);
// jiný seed = jiný list
assert.notDeepStrictEqual(A.generate({ ops: ALL, max: 20, len: 5, seed: '1' }).tasks, A.generate({ ops: ALL, max: 20, len: 5, seed: '2' }).tasks);
console.log('OK – ' + checked + ' úloh ověřeno hrubou silou');
