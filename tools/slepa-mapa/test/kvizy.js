// Hraje celé kvízy až na obrazovku Hotovo: Najdi + Co to je, 10/20/Vše, náhodné chyby, ťuknutí mimo, Enter.
const puppeteer = require('puppeteer-core');
const B = process.env.B || 'http://127.0.0.1:8765';
const sleep = (t) => new Promise(r => setTimeout(r, t));
(async () => { const br = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const pg = await br.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.setRequestInterception(true); pg.on('request', r => /goatcounter|zgo\.at/.test(r.url()) ? r.abort() : r.continue());
let rnd = 12345; const rand = () => (rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648;
// bod na obrazovce, který pickAt vyhodnotí jako daný prvek (hledá se kolem prvku)
const spot = (k) => pg.evaluate((k) => {
  const it = SlepaMapa.ITEMS.find(i => i.key === k), svg = document.getElementById('map'), m = svg.getScreenCTM();
  const P = (x, y) => { const p = svg.createSVGPoint(); p.x = x; p.y = y; const r = p.matrixTransform(m); return [r.x, r.y]; };
  const good = (x, y) => [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2]].every(([a, b]) => SlepaMapa.pickAll(x + a, y + b).includes(k));
  const c = P(it.cx ?? it.x, it.cy ?? it.y).map(Math.round);
  if (good(...c)) return c;
  const r = svg.getBoundingClientRect();
  for (let x = Math.ceil(r.left); x < r.right; x += 3) for (let y = Math.ceil(Math.max(0, r.top)); y < Math.min(innerHeight, r.bottom); y += 3) if (good(x, y)) return [x, y];
  return null;
}, k);
const LS = ['kraje', 'mesta', 'reky', 'pohori']; let fails = 0;
const runs = [];
const ONLY = process.env.ONLY;
for (const vp of [[1180, 820], [390, 844]]) for (const mode of ['najdi', 'coto']) for (const count of ['10', '20', 'all'])
  runs.push({ vp, mode, count, layers: Object.fromEntries(LS.map(l => [l, rand() < .6])) });
runs.push({ vp: [390, 844], mode: 'najdi', count: 'all', layers: { kraje: true, mesta: true, reky: true, pohori: true } });
runs.push({ vp: [390, 844], mode: 'najdi', count: 'all', layers: { kraje: true, mesta: false, reky: true, pohori: false } });
runs.push({ vp: [1180, 820], mode: 'najdi', count: '10', layers: { kraje: true, mesta: true, reky: true, pohori: true }, wrong: 1 });
runs.push({ vp: [390, 844], mode: 'coto', count: '10', layers: { kraje: true, mesta: true, reky: true, pohori: true }, wrong: 1 });
for (const run of runs) {
  if (ONLY && `${run.vp[0]} ${run.mode} ${run.count}` !== ONLY) continue;
  if (!LS.some(l => run.layers[l])) run.layers.kraje = true;
  await pg.setViewport({ width: run.vp[0], height: run.vp[1], hasTouch: false });
  await pg.goto(B + '/slepa-mapa/', { waitUntil: 'networkidle0' });
  await pg.evaluate((o) => localStorage.setItem('slepa-mapa.v1', JSON.stringify(o)), { mode: run.mode, layers: run.layers, count: run.count });
  await pg.reload({ waitUntil: 'networkidle0' });
  await pg.click('#start'); await sleep(50);
  0 && await pg.evaluate(() => { window.__log = []; document.getElementById('map').addEventListener('click', e => window.__log.push(['click', e.clientX, e.clientY, SlepaMapa.pickAt(e.clientX, e.clientY), SlepaMapa.Q.answered]), true); });
  const total = await pg.evaluate(() => SlepaMapa.Q.total);
  let steps = 0, wrong = 0, outside = 0, ok = false, maxRepeat = 0; const seen = {}; const counters = [];
  while (steps < total * 6) {
    const st = await pg.evaluate(() => ({ view: SlepaMapa.view, cur: SlepaMapa.Q && SlepaMapa.Q.queue[SlepaMapa.Q.pos], cnt: document.getElementById('count').textContent }));
    if (st.view === 'end') { ok = true; break; }
    steps++; counters.push(st.cnt); seen[st.cur] = (seen[st.cur] || 0) + 1; maxRepeat = Math.max(maxRepeat, seen[st.cur]);
    const beWrong = rand() < (run.wrong ?? .3);
    if (run.mode === 'najdi') {
      if (rand() < .15) { const r = await pg.$eval('#map', e => { const b = e.getBoundingClientRect(); return [b.left + 3, b.top + 3]; }); await pg.mouse.click(...r); outside++; await sleep(20); }
      let key = st.cur;
      if (beWrong) { const others = await pg.evaluate((c) => SlepaMapa.ITEMS.filter(i => SlepaMapa.S.layers[i.layer] && i.key !== c).map(i => i.key), st.cur); key = others[Math.floor(rand() * others.length)]; }
      const p = await spot(key);
      if (!p) { console.log('  NEDOSAŽITELNÉ', key); key = null; }
      if (p) { await pg.evaluate(() => document.getElementById('map').scrollIntoView({ block: 'center' })); const p2 = await spot(key); const pre = await pg.evaluate((p) => [SlepaMapa.Q.pos, SlepaMapa.pickAt(...p), document.elementFromPoint(...p).getAttribute('class')], p2); await pg.mouse.click(...p2); const post = await pg.evaluate(() => [SlepaMapa.Q.pos, SlepaMapa.Q.answered]); if (!post[1]) console.log('   click', key, JSON.stringify(p2), JSON.stringify(pre), JSON.stringify(post)); }
    } else {
      const btns = await pg.$$eval('#task .a-choice', (bs, c) => bs.map((b, i) => [i, b.dataset.k === c]), st.cur);
      const pick = beWrong ? btns.filter(b => !b[1]) : btns.filter(b => b[1]);
      await pg.keyboard.press(String(pick[Math.floor(rand() * pick.length)][0] + 1));
    }
    await sleep(20);
    const answered = await pg.evaluate(() => SlepaMapa.Q && SlepaMapa.Q.answered);
    if (!answered) { console.log('  neodpovězeno', st.cur, JSON.stringify(await pg.evaluate(() => ({ ae: document.activeElement && (document.activeElement.tagName + '.' + document.activeElement.getAttribute('class')), view: SlepaMapa.view, ask: !!document.getElementById('quitYes'), sy: scrollY })))); if (process.env.ONE) process.exit(); continue; }
    if (await pg.evaluate(() => SlepaMapa.Q.first.get(SlepaMapa.Q.queue[SlepaMapa.Q.pos])) === false) wrong++;
    if (rand() < .5) await pg.keyboard.press('Enter'); else await pg.click('#next');
    await sleep(20);
  }
  const endTxt = ok ? await pg.$eval('#task .sm-q', e => e.textContent) : '';
  if (!ok) fails++;
  console.log(`${run.vp[0]} ${run.mode} ${run.count} ${LS.filter(l => run.layers[l]).join('+')}: ${ok ? 'HOTOVO' : 'NEDOKONČENO'} otázek ${total}, kroků ${steps}, chyb ${wrong}, mimo ${outside}, max opakování ${maxRepeat}, ${endTxt} | ${counters.filter((c, i) => c !== counters[i - 1]).join(' ')}`);
}
console.log(fails ? `CHYBA: ${fails} kvízů nedokončeno` : 'všechny kvízy dokončené', 'errs', JSON.stringify(errs));
await br.close(); process.exit(fails ? 1 : 0); })();
