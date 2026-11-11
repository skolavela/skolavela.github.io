const puppeteer = require('puppeteer-core');
const B = process.env.B || 'http://127.0.0.1:8765';
const sleep = (t) => new Promise(r => setTimeout(r, t));
(async () => { const br = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const pg = await br.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.setRequestInterception(true); pg.on('request', r => /goatcounter|zgo\.at/.test(r.url()) ? r.abort() : r.continue());
let bad = 0; const chk = (n, c) => { console.log((c ? 'OK  ' : 'CHYBA ') + n); if (!c) bad++; };
for (const [w, h, tag] of [[390, 844, 'telefon'], [1180, 820, 'ipad']]) {
  await pg.setViewport({ width: w, height: h });
  await pg.goto(B + '/slepa-mapa/', { waitUntil: 'networkidle0' });
  await pg.evaluate(() => localStorage.setItem('slepa-mapa.v1', JSON.stringify({ mode: 'coto', layers: { kraje: true, mesta: true, reky: false, pohori: false }, count: '10' })));
  await pg.reload({ waitUntil: 'networkidle0' });
  chk(tag + ' Ukončit skryté na úvodu', await pg.$eval('#quit', e => e.hidden));
  await pg.click('#start'); await sleep(50);
  chk(tag + ' Ukončit vidět v kvízu', await pg.$eval('#quit', e => !e.hidden && e.getBoundingClientRect().width > 0));
  const tb = await pg.evaluate(() => { const t = document.querySelector('.a-toolbar'); return { h: t.getBoundingClientRect().height, sw: document.documentElement.scrollWidth, iw: innerWidth }; });
  chk(tag + ` lišta bez vodorovného posunu (${JSON.stringify(tb)})`, tb.sw <= tb.iw);
  await pg.screenshot({ path: `/workspace/shots/slepa5-ukoncit-${tag}.png` });
  await pg.click('#quit'); await sleep(50);
  chk(tag + ' bez odpovědi rovnou na úvod', await pg.evaluate(() => SlepaMapa.view === 'setup' && !!document.getElementById('start')));
  await pg.click('#start'); await sleep(50);
  await pg.click('#task .a-choice'); await sleep(50);
  await pg.click('#quit'); await sleep(50);
  chk(tag + ' po odpovědi se ptá', await pg.$eval('#task .sm-q', e => e.textContent) === 'Ukončit procvičování?');
  await pg.click('#quitNo'); await sleep(50);
  chk(tag + ' Pokračovat vrátí otázku', await pg.evaluate(() => SlepaMapa.view === 'quiz' && !!document.querySelector('#task .a-choice')));
  await pg.click('#quit'); await sleep(50); await pg.click('#quitYes'); await sleep(50);
  chk(tag + ' Ukončit -> úvod, mapa čistá', await pg.evaluate(() => SlepaMapa.view === 'setup' && !!document.getElementById('start') && !document.querySelector('#map [data-s]') && document.getElementById('quit').hidden));
}
// Prohlížení na telefonu: kraj Praha jde vybrat (druhé ťuknutí na stejné místo přepne na další prvek)
await pg.setViewport({ width: 390, height: 844 });
await pg.evaluate(() => localStorage.setItem('slepa-mapa.v1', JSON.stringify({ mode: 'prohl', layers: { kraje: true, mesta: true, reky: true, pohori: true } })));
await pg.reload({ waitUntil: 'networkidle0' });
const pp = await pg.evaluate(() => { const svg = document.getElementById('map'); svg.scrollIntoView({ block: 'center' }); const it = SlepaMapa.ITEMS.find(i => i.key === 'mesta:praha'); const p = svg.createSVGPoint(); p.x = it.x; p.y = it.y; const r = p.matrixTransform(svg.getScreenCTM()); return [Math.round(r.x), Math.round(r.y)]; });
const names = []; for (let i = 0; i < 4; i++) { await pg.mouse.click(...pp); await sleep(80); names.push(await pg.$eval('.sm-big', e => e.textContent)); }
console.log('  ťuknutí na Prahu 4x:', names.join(' -> '));
chk('Prohlížení telefon: kraj Praha jde vybrat', names.includes('Hlavní město Praha'));
chk('bez chyb v konzoli ' + JSON.stringify(errs), errs.length === 0);
console.log(bad ? `CHYBA: ${bad}` : 'vše OK'); await br.close(); process.exit(bad ? 1 : 0); })();
