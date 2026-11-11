/* Slepá mapa - Velappky
   Režimy: Najdi (ťukni na prvek), Co to je (vyber ze 4 možností), Prohlížení (popisky).
   Pracovní list: A4 na šířku, čísla v kroužcích, Uložit PDF (jsPDF, vektorově). */
(function () {
'use strict';
function gcEvent(name, title) { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: title || name, event: true }); } catch (e) {} }

const M = window.SLEPA_MAPA;
const SVGNS = 'http://www.w3.org/2000/svg';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SRC = 'Mapové podklady: ČÚZK, Data200, CC BY 4.0, zjednodušeno. Sousední státy: Natural Earth.';
const SRC_SHEET = 'Mapové podklady: ČÚZK, Data200, CC BY 4.0, zjednodušeno.'; // list je bez sousedních států

// ---------- vrstvy a prvky ----------
const LAYERS = [
  { key: 'kraje', label: 'Kraje', kind: 'Kraj', tap: 'Ťukni přímo na kraj.' },
  { key: 'mesta', label: 'Krajská města', kind: 'Krajské město', tap: 'Ťukni přímo na město.' },
  { key: 'reky', label: 'Řeky', kind: 'Řeka', tap: 'Ťukni přímo na řeku.' },
  { key: 'pohori', label: 'Pohoří', kind: 'Pohoří', tap: 'Ťukni přímo na pohoří.' }
];
const LBY = Object.fromEntries(LAYERS.map(l => [l.key, l]));
const ITEMS = [];
for (const l of LAYERS) for (const it of M.layers[l.key]) ITEMS.push(Object.assign({ layer: l.key, key: l.key + ':' + it.id }, it));
const BYKEY = Object.fromEntries(ITEMS.map(i => [i.key, i]));

// body cesty (pro těžiště řek a PDF)
function parseD(d) {
  const subs = []; let cur = null, x = 0, y = 0;
  const re = /([MlLz])|(-?\d*\.?\d+)/g; let m, cmd = null, nums = [];
  const flush = () => {
    if (cmd === 'M') { for (let i = 0; i + 1 < nums.length; i += 2) { x = nums[i]; y = nums[i + 1]; if (i === 0) { cur = { pts: [[x, y]], closed: false }; subs.push(cur); } else cur.pts.push([x, y]); } }
    else if (cmd === 'l') { for (let i = 0; i + 1 < nums.length; i += 2) { x += nums[i]; y += nums[i + 1]; cur.pts.push([x, y]); } }
    else if (cmd === 'L') { for (let i = 0; i + 1 < nums.length; i += 2) { x = nums[i]; y = nums[i + 1]; cur.pts.push([x, y]); } }
    nums = [];
  };
  while ((m = re.exec(d))) {
    if (m[1]) { flush(); cmd = m[1]; if (cmd === 'z' && cur) { cur.closed = true; x = cur.pts[0][0]; y = cur.pts[0][1]; } }
    else nums.push(parseFloat(m[2]));
  }
  flush();
  return subs;
}
for (const it of ITEMS) {
  if (it.layer === 'kraje') { it.cx = it.lx; it.cy = it.ly; }
  else if (it.layer === 'reky') {
    it.subs = parseD(it.d); let sx = 0, sy = 0, n = 0;
    for (const s of it.subs) for (const p of s.pts) { sx += p[0]; sy += p[1]; n++; }
    it.cx = sx / n; it.cy = sy / n;
  } else { it.cx = it.x; it.cy = it.y; }
}

const BB = (() => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const sb of parseD(M.obrys)) for (const [x, y] of sb.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { x0, y0, x1, y1 }; })();

// ---------- náhoda ----------
function hashSeed(s) { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return (h >>> 0) || 1; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(a, rnd) { rnd = rnd || Math.random; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- nastavení ----------
const KEY = 'slepa-mapa.v1';
const newSeed = () => String(Math.floor(Math.random() * 9000) + 1000);
const DEF = { mode: 'najdi', layers: { kraje: true, mesta: false, reky: false, pohori: false }, count: '10', sol: false, seed: newSeed(), sheet: 'kraje' };
let S = JSON.parse(JSON.stringify(DEF));
try {
  const o = JSON.parse(localStorage.getItem(KEY) || '{}');
  if (['najdi', 'coto', 'prohl'].includes(o.mode)) S.mode = o.mode;
  if (o.layers && typeof o.layers === 'object') for (const l of LAYERS) if (typeof o.layers[l.key] === 'boolean') S.layers[l.key] = o.layers[l.key];
  if (!LAYERS.some(l => S.layers[l.key])) S.layers.kraje = true;
  if (['10', '20', 'all'].includes(o.count)) S.count = o.count;
  if (typeof o.sol === 'boolean') S.sol = o.sol;
  if (['kraje', 'mesta', 'reky', 'pohori', 'mix'].includes(o.sheet)) S.sheet = o.sheet;
  if (o.seed && /^\d{1,9}$/.test(o.seed)) S.seed = o.seed;
} catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const activeLayers = () => LAYERS.filter(l => S.layers[l.key]).map(l => l.key);
const activeItems = () => ITEMS.filter(i => S.layers[i.layer]);

// ---------- mapa (SVG) ----------
const svg = $('map');
let U = 1; // uživatelské jednotky na 1 px obrazovky
const DOMORDER = ['kraje', 'reky', 'pohori', 'mesta'];
const sortedLayer = (key) => ITEMS.filter(i => i.layer === key).sort((a, b) => (a.cy - b.cy) || (a.cx - b.cx));
function buildMap() {
  let s = '<g class="nbs" aria-hidden="true">';
  if (M.podklad) s += `<path class="nb" d="${M.podklad}"/>`;
  for (const n of M.neighbors) s += `<path class="nb" d="${n.d}"/>`;
  s += `</g><path class="base" d="${M.obrys}" aria-hidden="true"/>`;
  s += '<g class="lay" data-layer="kraje">' + sortedLayer('kraje').map(k => `<path class="ft kraj" data-k="kraje:${k.id}" d="${k.d}" fill-rule="evenodd"/>`).join('') + '</g>';
  s += '<g class="ols" aria-hidden="true"></g>';
  s += `<path class="border" d="${M.obrys}" aria-hidden="true"/>`;
  s += '<g class="lay" data-layer="reky">' + sortedLayer('reky').map(r => `<g class="ft reka" data-k="reky:${r.id}"><path class="vis" d="${r.d}"/><path class="hit" d="${r.d}"/></g>`).join('') + '</g>';
  s += '<g class="lay" data-layer="pohori">' + sortedLayer('pohori').map(p => `<g class="ft pt hora" data-k="pohori:${p.id}" transform="translate(${p.x} ${p.y})"><g class="sc"><circle class="ring" r="13"/><path class="vis" d="M0-7L7 5.2H-7Z"/><circle class="hit" r="22"/></g></g>`).join('') + '</g>';
  s += '<g class="lay" data-layer="mesta">' + sortedLayer('mesta').map(c => `<g class="ft pt mesto" data-k="mesta:${c.id}" transform="translate(${c.x} ${c.y})"><g class="sc"><circle class="ring" r="12"/><circle class="halo" r="5.5"/><circle class="vis" r="4"/><circle class="hit" r="22"/></g></g>`).join('') + '</g>';
  s += '<g class="lbls" aria-hidden="true"></g>';
  svg.innerHTML = s;
  // body popisků řek: polovina délky
  for (const it of ITEMS) if (it.layer === 'reky') {
    const p = svg.querySelector(`[data-k="${it.key}"] .vis`); const L = p.getTotalLength();
    const q = p.getPointAtLength(L * 0.5); it.mx = q.x; it.my = q.y;
  }
}
const elOf = (key) => svg.querySelector(`.ft[data-k="${key}"]`);
function rescale() {
  const w = svg.getBoundingClientRect().width || 1000;
  U = 1000 / w;
  svg.style.setProperty('--u', U.toFixed(4));
  svg.querySelectorAll('.sc').forEach(g => g.setAttribute('transform', `scale(${U.toFixed(4)})`));
  // Praha: když se hledají i kraje, je zóna města menší (ťuk vedle bodu = kraj)
  const praha = svg.querySelector('[data-k="mesta:praha"] .hit');
  if (praha) praha.setAttribute('r', S.layers.kraje && S.layers.mesta ? 12 : 22);
  renderLabels();
}
function applyLayers() {
  svg.querySelectorAll('.lay').forEach(g => {
    const on = !!S.layers[g.dataset.layer];
    g.classList.toggle('on', on); g.classList.toggle('off', !on);
  });
  rescale(); a11yMap();
}
function a11yMap() {
  const act = view === 'quiz' || view === 'browse';
  const list = navList();
  svg.querySelectorAll('.ft').forEach(el => { el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label'); el.setAttribute('aria-hidden', 'true'); });
  if (!act) return;
  list.forEach((it, i) => {
    const el = elOf(it.key); el.removeAttribute('aria-hidden');
    el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
    el.setAttribute('aria-label', S.mode === 'prohl' ? `${it.name} (${LBY[it.layer].kind.toLowerCase()})` : `prvek ${i + 1} z ${list.length}`);
  });
}
// pořadí pro klávesnici: shora dolů, zleva doprava, horní vrstvy první
function navList() {
  // stejné pořadí jako v DOM (= pořadí klávesy Tab)
  return DOMORDER.filter(k => S.layers[k]).flatMap(sortedLayer);
}
function setState(key, s) {
  const el = elOf(key); if (!el) return;
  if (s) el.setAttribute('data-s', s); else el.removeAttribute('data-s');
  if (el.classList.contains('kraj')) {
    const ols = svg.querySelector('.ols');
    let ol = ols.querySelector(`[data-for="${key}"]:not([data-s="focus"])`);
    if (!s) { if (ol) ol.remove(); return; }
    if (!ol) { ol = document.createElementNS(SVGNS, 'path'); ol.setAttribute('class', 'ol'); ol.setAttribute('data-for', key); ol.setAttribute('d', el.getAttribute('d')); ols.appendChild(ol); }
    ol.setAttribute('data-s', s);
  }
}
function clearStates() {
  svg.querySelectorAll('.ft[data-s]').forEach(el => el.removeAttribute('data-s'));
  svg.querySelector('.ols').innerHTML = '';
}
function setFocusRing(key, on) {
  const el = elOf(key); if (!el) return;
  el.classList.toggle('focus', on);
  if (el.classList.contains('kraj')) {
    const ols = svg.querySelector('.ols');
    const old = ols.querySelector('[data-s="focus"]'); if (old) old.remove();
    if (on) { const ol = document.createElementNS(SVGNS, 'path'); ol.setAttribute('class', 'ol'); ol.setAttribute('data-s', 'focus'); ol.setAttribute('d', el.getAttribute('d')); ols.appendChild(ol); }
  }
}
// Popisky v Prohlížení: min. 13 px (na telefonu 11 px). Popisek, který by se překryl s jiným, se nezobrazí;
// ťuknutý prvek má popisek vždy (kreslí se první).
function renderLabels() {
  const g = svg.querySelector('.lbls'); if (!g) return;
  g.innerHTML = '';
  if (view !== 'browse') return;
  const narrow = svg.getBoundingClientRect().width < 560;
  const F = narrow ? 11 : 13, fs = (F * U).toFixed(2), pad = 2 * U;
  const cl = (x, w, anchor) => { const lo = anchor === 'middle' ? w / 2 + 4 * U : 4 * U, hi = anchor === 'middle' ? 1000 - w / 2 - 4 * U : 1000 - w - 4 * U; return Math.max(lo, Math.min(hi, x)); };
  const prio = { mesta: 0, pohori: 1, reky: 2, kraje: 3 };
  const list = activeItems().slice().sort((a, b) => (b.key === browseSel) - (a.key === browseSel) || prio[a.layer] - prio[b.layer]);
  const boxes = [];
  // značky bodů jsou taky překážky pro popisky jiných prvků
  const marks = activeItems().filter(i => i.layer === 'mesta' || i.layer === 'pohori').map(i => ({ key: i.key, x: i.x - 6 * U, y: i.y - 7 * U, w: 12 * U, h: 13 * U }));
  const hit = (b, ignore) => boxes.some(o => b.x < o.x + o.w + pad && b.x + b.w + pad > o.x && b.y < o.y + o.h + pad && b.y + b.h + pad > o.y) ||
    marks.some(o => o.key !== ignore && b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y);
  for (const it of list) {
    const t = document.createElementNS(SVGNS, 'text');
    let nm = it.name, x, y, anchor = 'middle', cls = 'lbl';
    if (it.layer === 'kraje') { cls += ' k'; if (narrow) nm = nm.replace(/ kraj$/, '').replace(/^Kraj /, '').replace('Hlavní město ', ''); x = it.lx; y = it.ly; }
    else if (it.layer === 'mesta') { cls += ' m'; x = it.x + 8 * U; y = it.y; anchor = 'start'; }
    else if (it.layer === 'pohori') { cls += ' h'; x = it.x; y = it.y + 15 * U; }
    else { cls += ' r'; x = it.mx; y = it.my - 10 * U; }
    t.setAttribute('class', cls); t.setAttribute('font-size', fs); t.setAttribute('text-anchor', anchor); t.setAttribute('dominant-baseline', 'central');
    t.setAttribute('style', `stroke-width:${(3 * U).toFixed(2)}`); t.textContent = nm;
    t.setAttribute('x', x); t.setAttribute('y', y);
    g.appendChild(t);
    let bb = t.getBBox();
    const nx = cl(x, bb.width, anchor); if (nx !== x) { t.setAttribute('x', nx.toFixed(1)); bb = t.getBBox(); }
    const box = { x: bb.x, y: bb.y, w: bb.width, h: bb.height };
    if (it.key !== browseSel && hit(box, it.key)) { t.remove(); continue; }
    boxes.push(box);
  }
}

// ---------- stav hry ----------
let view = 'setup';  // setup | quiz | end | browse
let Q = null;        // { queue, pos, first: Map(key->bool), answered, total }
const live = (t) => { const l = $('live'); l.textContent = ''; setTimeout(() => { l.textContent = t; }, 30); };

function startQuiz(items) {
  const pool = items || shuffle(activeItems().slice());
  const n = items ? pool.length : (S.count === 'all' ? pool.length : Math.min(+S.count, pool.length));
  const qs = pool.slice(0, n);
  Q = { queue: qs.map(i => i.key), pos: 0, first: new Map(), answered: false, total: qs.length, opts: null };
  view = 'quiz'; gcEvent('slepa-mapa-start', 'Slepá mapa: start ' + S.mode);
  renderAll();
}
function current() { return Q && BYKEY[Q.queue[Q.pos]]; }
function answer(ok, wrongKey) {
  const it = current(); if (!it || Q.answered) return;
  Q.answered = true;
  if (!Q.first.has(it.key)) Q.first.set(it.key, ok);
  if (!ok) { Q.queue.splice(Math.min(Q.pos + 4, Q.queue.length), 0, it.key); } // chyba se vrátí za 3 otázky
  setState(it.key, 'ok');
  if (wrongKey) setState(wrongKey, 'bad');
  renderTask();
  const nb = $('next'); if (nb) nb.focus({ preventScroll: true });
}
function next() {
  if (!Q || !Q.answered) return;
  Q.pos++; Q.answered = false; Q.opts = null;
  if (Q.pos >= Q.queue.length) { view = 'end'; }
  renderAll();
}
function onPick(key) {
  if (view === 'browse') {
    clearStates(); setState(key, 'hl'); browseSel = key; renderLabels(); renderTask(); live(BYKEY[key].name);
    return;
  }
  if (view !== 'quiz' || S.mode !== 'najdi' || Q.answered) return;
  const it = current();
  if (key === it.key) { answer(true); live('Správně, to je ' + it.name + '.'); }
  else { answer(false, key); live('To je ' + BYKEY[key].name + '.'); }
}
let browseSel = null;

// Výběr prvku ťuknutím: zóny v px obrazovky (body 22 px, řeky 12 px od čáry).
// Pořadí vrstev zdola: kraje, řeky, pohoří, města - horní vyhrává; v rámci zón vyhrává bližší viditelný prvek.
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
function pickAt(clientX, clientY) {
  const m = svg.getScreenCTM(); if (!m) return null;
  const p = svg.createSVGPoint(); p.x = clientX; p.y = clientY;
  const q = p.matrixTransform(m.inverse());
  let best = null, bestScore = Infinity;
  for (const it of ITEMS) {
    if (!S.layers[it.layer]) continue;
    let dpx, lim, bias;
    if (it.layer === 'mesta' || it.layer === 'pohori') {
      dpx = Math.hypot(q.x - it.x, q.y - it.y) / U;
      lim = (it.key === 'mesta:praha' && S.layers.kraje) ? 12 : 22;
      bias = it.layer === 'mesta' ? 7 : 6;
    } else if (it.layer === 'reky') {
      let d = Infinity;
      for (const sb of it.subs) for (let i = 1; i < sb.pts.length; i++) { const a = sb.pts[i - 1], b = sb.pts[i]; d = Math.min(d, segDist(q.x, q.y, a[0], a[1], b[0], b[1])); }
      dpx = d / U; lim = 12; bias = 0;
    } else continue;
    if (dpx <= lim && dpx - bias < bestScore) { bestScore = dpx - bias; best = it.key; }
  }
  if (best) return best;
  if (S.layers.kraje) {
    const els = document.elementsFromPoint ? document.elementsFromPoint(clientX, clientY) : [];
    const k = els.find(e => e.classList && e.classList.contains('kraj'));
    if (k) return k.dataset.k;
  }
  return null;
}
svg.addEventListener('click', (e) => {
  const key = pickAt(e.clientX, e.clientY);
  if (key) { onPick(key); return; }
  if (view === 'quiz' && S.mode === 'najdi' && !Q.answered) {
    const fb = $('fb'); if (fb) { fb.textContent = LBY[current().layer].tap; fb.removeAttribute('data-s'); }
    live(LBY[current().layer].tap);
  }
});
svg.addEventListener('keydown', (e) => {
  const ft = e.target.closest && e.target.closest('.ft'); if (!ft) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (view === 'quiz' && Q.answered) { next(); return; }
    onPick(ft.dataset.k); return;
  }
  const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (dir) {
    e.preventDefault();
    const list = navList(); const i = list.findIndex(x => x.key === ft.dataset.k);
    const n = list[(i + dir + list.length) % list.length]; if (n) elOf(n.key).focus();
  }
});
svg.addEventListener('focusin', (e) => { const ft = e.target.closest('.ft'); let kb = true; try { kb = ft && ft.matches(':focus-visible'); } catch (x) {} if (ft && kb) setFocusRing(ft.dataset.k, true); });
svg.addEventListener('focusout', (e) => { const ft = e.target.closest('.ft'); if (ft) setFocusRing(ft.dataset.k, false); });

document.addEventListener('keydown', (e) => {
  if (!$('sheetView').hidden || e.altKey || e.ctrlKey || e.metaKey) return;
  if (view !== 'quiz') return;
  const t = e.target;
  if (e.key === 'Enter' && Q.answered && !(t && (t.tagName === 'BUTTON' || (t.closest && t.closest('.ft'))))) { e.preventDefault(); next(); return; }
  if (S.mode === 'coto' && !Q.answered && /^[1-4]$/.test(e.key)) {
    const b = document.querySelectorAll('#task .a-choice')[+e.key - 1]; if (b) { e.preventDefault(); b.click(); }
  }
});

// možnosti pro Co to je: 3 nejbližší ze stejné vrstvy (náhodně z 5 nejbližších)
function optionsFor(it) {
  const same = ITEMS.filter(i => i.layer === it.layer && i.key !== it.key)
    .sort((a, b) => Math.hypot(a.cx - it.cx, a.cy - it.cy) - Math.hypot(b.cx - it.cx, b.cy - it.cy));
  return shuffle([it].concat(shuffle(same.slice(0, 5)).slice(0, 3)));
}

// ---------- vykreslení karty ----------
const task = $('task');
function switchesHTML(prefix) {
  return LAYERS.map(l => `<button class="c-switch" type="button" role="switch" data-l="${l.key}" aria-checked="${!!S.layers[l.key]}" id="${prefix}-${l.key}"><span>${l.label}</span><span class="c-track" aria-hidden="true"></span></button>`).join('');
}
function bindSwitches(root, after) {
  root.querySelectorAll('.c-switch[data-l]').forEach(b => b.onclick = () => {
    const k = b.dataset.l;
    if (S.layers[k] && activeLayers().length === 1) { const h = root.querySelector('.sm-hint') || document.querySelector('.sm-hint'); if (h) h.textContent = 'Aspoň jedna vrstva musí zůstat zapnutá.'; return; }
    S.layers[k] = !S.layers[k]; save(); after();
  });
}
const BTN_SHEET = '<button class="c-btn c-btn--secondary" type="button" id="toSheet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4M10 12h5M10 16h5"/></svg>Pracovní list</button>';

function renderTask() {
  const cnt = $('count');
  if (view === 'setup') {
    const n = activeItems().length;
    cnt.textContent = `${n} ${n >= 5 ? 'prvků' : 'prvky'}`;
    task.innerHTML = `
      <div class="c-field"><div class="sm-switches sm-switches--4" role="group" aria-label="Co procvičit">${switchesHTML('ly')}</div><p class="sm-hint" aria-live="polite"></p></div>
      <div class="sm-row sm-row--ctl">
        <div class="sm-cnt"><span class="c-label" id="lbl-cnt">Otázek</span>
          <div class="c-seg" role="group" aria-labelledby="lbl-cnt" id="cnt">
            ${[['10', '10'], ['20', '20'], ['all', 'Vše']].map(([v, t]) => `<button type="button" data-c="${v}" aria-pressed="${S.count === v}">${t}</button>`).join('')}
          </div></div>
        <div class="sm-btns"><button class="c-btn c-btn--primary" type="button" id="start">Začít</button>${BTN_SHEET}</div>
      </div>`;
    bindSwitches(task, () => { applyLayers(); renderTask(); });
    task.querySelectorAll('#cnt button').forEach(b => b.onclick = () => { S.count = b.dataset.c; save(); renderTask(); });
    $('start').onclick = () => startQuiz();
    $('toSheet').onclick = openSheet;
  } else if (view === 'browse') {
    cnt.textContent = '';
    const it = browseSel && BYKEY[browseSel];
    task.innerHTML = `
      <div class="sm-row"><div><p class="sm-kind">${it ? esc(LBY[it.layer].kind) : '&nbsp;'}</p><p class="sm-big${it ? '' : ' is-empty'}" aria-live="polite">${it ? esc(it.name) : 'Ťukni na mapu a uvidíš název.'}</p></div>${BTN_SHEET}</div>
      <div class="c-field"><div class="sm-switches sm-switches--4" role="group" aria-label="Vrstvy na mapě">${switchesHTML('ly')}</div><p class="sm-hint" aria-live="polite"></p></div>`;
    bindSwitches(task, () => { if (browseSel && !S.layers[BYKEY[browseSel].layer]) { browseSel = null; clearStates(); } applyLayers(); renderTask(); });
    $('toSheet').onclick = openSheet;
  } else if (view === 'quiz' && askMode) {
    task.innerHTML = `
      <p class="sm-q">Ukončit procvičování?</p>
      <div class="sm-row sm-row--fix"><p class="sm-fb">Rozpracované otázky se neuloží.</p>
      <div class="sm-btns sm-btns--ask"><button class="c-btn c-btn--primary" type="button" id="quitYes">Ukončit</button><button class="c-btn c-btn--secondary" type="button" id="quitNo">Pokračovat</button></div></div>`;
    $('quitYes').onclick = () => switchMode(askMode);
    $('quitNo').onclick = () => { askMode = null; renderTask(); };
  } else if (view === 'quiz') {
    const it = current();
    const done = Q.pos + 1;
    // počítadlo: původní počet otázek; vrácené otázky se do jmenovatele nepočítají
    cnt.textContent = `${new Set(Q.queue.slice(0, Q.pos + 1)).size} / ${Q.total}`;
    if (S.mode === 'najdi') {
      let fb = '', fs = '';
      if (Q.answered) {
        const bad = svg.querySelector('.ft[data-s="bad"]');
        if (bad) { fb = 'To je ' + BYKEY[bad.dataset.k].name + '.'; fs = 'bad'; } else { fb = 'Správně, to je ' + it.name + '.'; fs = 'ok'; }
      }
      task.innerHTML = `
        <p class="sm-q">Najdi <b>${esc(it.akuzativ || it.name)}</b>.</p>
        <div class="sm-row sm-row--fix"><p class="sm-fb" id="fb"${fs ? ` data-s="${fs}"` : ''}>${esc(fb)}</p>
        <button class="c-btn c-btn--primary sm-next" type="button" id="next"${Q.answered ? '' : ' hidden'}>Další</button></div>`;
    } else {
      if (!Q.opts) Q.opts = optionsFor(it);
      let fb = '', fs = '';
      if (Q.answered) {
        const pick = Q.pick;
        if (pick === it.key) { fb = 'Správně, to je ' + it.name + '.'; fs = 'ok'; } else { fb = 'Na mapě je ' + it.name + '.'; fs = 'bad'; }
      }
      task.innerHTML = `
        <div class="sm-row sm-row--fix"><p class="sm-q">Co je to? <span class="sm-kind" style="display:inline">${esc(LBY[it.layer].kind)}</span></p>
        <p class="sm-fb" id="fb"${fs ? ` data-s="${fs}"` : ''}>${esc(fb)}</p>
        <button class="c-btn c-btn--primary sm-next" type="button" id="next"${Q.answered ? '' : ' hidden'}>Další</button></div>
        <div class="a-choices sm-choices">${Q.opts.map((o, i) => {
          let st = ''; if (Q.answered) { if (o.key === it.key) st = 'correct'; else if (o.key === Q.pick) st = 'wrong'; }
          return `<button class="a-choice" type="button" data-k="${o.key}"${st ? ` data-state="${st}"` : ''}${Q.answered ? ' disabled' : ''}><span class="sm-key" aria-hidden="true">${i + 1}</span>${esc(o.name)}</button>`;
        }).join('')}</div>`;
      task.querySelectorAll('.a-choice').forEach(b => b.onclick = () => {
        if (Q.answered) return;
        Q.pick = b.dataset.k; const ok = Q.pick === it.key;
        answer(ok, ok ? null : Q.pick);
        live(ok ? 'Správně, to je ' + it.name + '.' : 'Na mapě je ' + it.name + '.');
      });
    }
    $('next').onclick = next;
  } else if (view === 'end') {
    const uniq = [...Q.first.keys()];
    const good = uniq.filter(k => Q.first.get(k)).length;
    const miss = uniq.filter(k => !Q.first.get(k));
    cnt.textContent = '';
    task.innerHTML = `
      <h2>Hotovo</h2>
      <p class="sm-q">${good} z ${uniq.length} napoprvé</p>
      ${miss.length ? `<div class="c-field"><span class="c-label">Chyby</span><ul class="sm-misses">${miss.map(k => `<li>${esc(BYKEY[k].name)}</li>`).join('')}</ul></div>` : '<p class="sm-fb" data-s="ok">Všechno správně napoprvé.</p>'}
      <div class="c-btns"><button class="c-btn c-btn--primary" type="button" id="again">Znovu</button>${miss.length ? '<button class="c-btn c-btn--secondary" type="button" id="onlyMiss">Procvičit jen chyby</button>' : ''}</div>`;
    $('again').onclick = () => startQuiz();
    if (miss.length) $('onlyMiss').onclick = () => startQuiz(shuffle(miss.map(k => BYKEY[k])));
    gcEvent('slepa-mapa-done', 'Slepá mapa: hotovo');
    live(`Hotovo. ${good} z ${uniq.length} napoprvé.`);
  }
  fitMap();
}
function renderAll() {
  document.querySelectorAll('#modes button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === S.mode)));
  clearStates();
  if (view === 'quiz') {
    const it = current();
    if (S.mode === 'coto' && it) setState(it.key, 'hl');
    live(S.mode === 'najdi' ? 'Najdi ' + (it.akuzativ || it.name) + '.' : 'Co je zvýrazněné na mapě?');
  }
  if (view === 'browse' && browseSel) setState(browseSel, 'hl');
  applyLayers();
  renderTask();
}
// přepnutí režimu ukončí kvíz a vyčistí mapu; když už dítě odpovídalo, nejdřív se zeptá
let askMode = null;
function switchMode(m) {
  askMode = null; S.mode = m; save(); Q = null; browseSel = null;
  view = S.mode === 'prohl' ? 'browse' : 'setup';
  clearStates(); renderAll();
}
document.querySelectorAll('#modes button').forEach(b => b.onclick = () => {
  if (view === 'quiz' && Q && Q.first.size > 0) {
    if (b.dataset.m === S.mode && !askMode) return;
    askMode = b.dataset.m; renderTask();
    const k = $('quitYes'); if (k) k.focus({ preventScroll: true });
    return;
  }
  switchMode(b.dataset.m);
});

// mapa max. 60 % výšky okna a na tabletu/počítači tak, aby se vešlo i zadání
function fitMap() {
  const card = $('mapcard');
  if (window.innerWidth < 600 || $('game').hidden) { card.style.maxWidth = ''; rescale(); return; }
  const top = card.getBoundingClientRect().top + window.scrollY;
  const taskH = 146; // pevná rezerva pro kartu zadání => mapa má ve všech stavech stejnou velikost
  const avail = window.innerHeight - top - 12 - taskH - 12;
  const h = Math.max(300, Math.min(window.innerHeight * 0.68, avail));
  const pad = 12, attrH = $('attr') ? $('attr').offsetHeight : 0;
  card.style.maxWidth = Math.min(1200, Math.round((h - pad - attrH) * 1000 / 580 + pad)) + 'px';
  rescale();
}
let rt = 0;
window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(fitMap); });

// ---------- pracovní list ----------
// A4 na šířku, mapa přes celou šířku tiskové plochy, pod ní řádky na odpovědi ve 4 sloupcích.
// List je černobílý na bílém: bez sousedních států; nečíslované vrstvy jen jako světle šedé čáry.
const PW = 297, PH = 210, MX = 12;
const SHEETS = [['kraje', 'Kraje'], ['mesta', 'Města'], ['reky', 'Řeky'], ['pohori', 'Pohoří'], ['mix', 'Mix']];
const MIX_N = 20, MIX_MIN = 3;
const R = 2.3;                                   // poloměr kroužku s číslem (mm)
const SYM = { mesta: 1.3, pohori: 2.1 };         // poloměr značky bodu (mm)
function inPoly(subs, x, y) { let c = false; for (const sb of subs) { const r = sb.pts; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } } return c; }
// bod na řece v poměru t délky (z geometrie dat, nezávisle na DOM)
function riverAt(it, t) {
  if (!it.segs) { it.segs = []; let L = 0; for (const sb of it.subs) for (let i = 1; i < sb.pts.length; i++) { const a = sb.pts[i - 1], b = sb.pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]); it.segs.push([a, b, L, l]); L += l; } it.len = L; }
  const want = Math.max(0, Math.min(it.len, it.len * t));
  for (const [a, b, L0, l] of it.segs) if (want <= L0 + l || it.segs[it.segs.length - 1][2] === L0) { const f = l ? (want - L0) / l : 0; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; }
  return it.segs[0][0];
}
const KSUBS = Object.fromEntries(M.layers.kraje.map(k => ['kraje:' + k.id, parseD(k.d)]));

function sheetItems() {
  const kind = S.sheet;
  const rnd = mulberry32(hashSeed(S.seed + '|' + kind));
  if (kind !== 'mix') return shuffle(ITEMS.filter(i => i.layer === kind), rnd);
  // Mix: 20 prvků, z každé vrstvy aspoň 3; výběr i pořadí určuje číslo listu
  const pick = [];
  const rest = [];
  for (const l of LAYERS) { const a = shuffle(ITEMS.filter(i => i.layer === l.key), rnd); pick.push(...a.slice(0, MIX_MIN)); rest.push(...a.slice(MIX_MIN)); }
  pick.push(...shuffle(rest, rnd).slice(0, MIX_N - pick.length));
  return shuffle(pick, rnd);
}
function sheetScene() {
  const order = sheetItems();
  const n = order.length, cols = 4;
  const rows = Math.ceil(n / cols), RH = rows <= 4 ? 6.5 : 6;
  const footY = PH - 7, listBot = footY - 6.5, listTop = listBot - rows * RH;
  const mapTop = 6, mapBot = listTop - 1.5;
  const bx = BB.x0 - 3, by = BB.y0 - 3, bw = BB.x1 - BB.x0 + 6, bh = BB.y1 - BB.y0 + 6;
  const k = Math.min((PW - 2 * MX) / bw, (mapBot - mapTop) / bh);
  const mw = bw * k, mh = bh * k, mx = (PW - mw) / 2, my = mapTop;
  const T = (x, y) => [mx + (x - bx) * k, my + (y - by) * k];
  const kind = S.sheet;
  const what = { kraje: 'kraje', mesta: 'krajská města', reky: 'řeky', pohori: 'pohoří', mix: 'kraje, města, řeky a pohoří' }[kind];
  const title = 'Slepá mapa Česka';
  const sub = 'Napiš ke každému číslu název.';
  const sub2 = what.charAt(0).toUpperCase() + what.slice(1) + '.';
  const titleBox = [MX - 1, mapTop, MX + 60, mapTop + 18];
  const numbered = new Set(order.map(i => i.key));
  // značky bodů na listu: číslované body (u vrstvy Města/Pohoří všechny body vrstvy)
  const syms = ITEMS.filter(i => (i.layer === 'mesta' || i.layer === 'pohori') && numbered.has(i.key)).map(i => { const [x, y] = T(i.x, i.y); return { key: i.key, x, y, r: SYM[i.layer] }; });
  // rozmístění kroužků: nejdřív body, pak řeky, nakonec kraje
  const placed = [];
  const okAt = (x, y, selfKey) => {
    if (x - R < MX || x + R > PW - MX || y - R < mapTop || y + R > mapBot) return false;
    if (x + R > titleBox[0] && x - R < titleBox[2] && y + R > titleBox[1] && y - R < titleBox[3]) return false;
    for (const p of placed) if (Math.hypot(p.x - x, p.y - y) < 2 * R + 0.5) return false;
    for (const sy of syms) if (Math.hypot(sy.x - x, sy.y - y) < R + sy.r + 0.4) return false;
    return true;
  };
  const prio = { mesta: 0, pohori: 1, reky: 2, kraje: 3 };
  const marks = [];
  const conflicts = [];
  const dirs = [[1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]].map(([a, b]) => { const l = Math.hypot(a, b); return [a / l, b / l]; });
  for (const it of order.slice().sort((a, b) => prio[a.layer] - prio[b.layer])) {
    let pos = null, lead = null;
    if (it.layer === 'mesta' || it.layer === 'pohori') {
      const [ax, ay] = T(it.x, it.y), base = SYM[it.layer] + R + 0.5;
      for (const d of [base, base + 2, 7, 9.5, 12, 15]) {
        for (const [ux, uy] of dirs) { const x = ax + ux * d, y = ay + uy * d; if (okAt(x, y)) { pos = [x, y]; if (d > base + 2.1) lead = [ax + ux * SYM[it.layer], ay + uy * SYM[it.layer], x - ux * R, y - uy * R]; break; } }
        if (pos) break;
      }
      if (!pos) { pos = [ax + base, ay - base]; conflicts.push(it.name); }
    } else if (it.layer === 'reky') {
      const step = 2 / Math.max(1, (it.len || (riverAt(it, 0), it.len)));
      const ts = [0.5]; for (let i = 1; i <= 8; i++) ts.push(0.5 + i * 0.05, 0.5 - i * 0.05);
      outer: for (const off of [0, R + 0.9, -(R + 0.9), 2 * R + 1.5, -(2 * R + 1.5)]) for (const t of ts) {
        const p = riverAt(it, t), q = riverAt(it, Math.min(1, t + step));
        const [x0, y0] = T(p[0], p[1]), [x1, y1] = T(q[0], q[1]); const dl = Math.hypot(x1 - x0, y1 - y0) || 1;
        const nx = -(y1 - y0) / dl, ny = (x1 - x0) / dl, x = x0 + nx * off, y = y0 + ny * off;
        if (okAt(x, y)) { pos = [x, y]; if (Math.abs(off) > R + 1) lead = [x0, y0, x - nx * Math.sign(off) * R, y - ny * Math.sign(off) * R]; break outer; }
      }
      if (!pos) { const p = riverAt(it, .5); pos = T(p[0], p[1]); conflicts.push(it.name); }
    } else {
      const subs = KSUBS[it.key];
      const [cx, cy] = T(it.lx, it.ly);
      const inK = (x, y) => inPoly(subs, bx + (x - mx) / k, by + (y - my) / k) && [[R, 0], [-R, 0], [0, R], [0, -R]].every(([a, b]) => inPoly(subs, bx + (x + a - mx) / k, by + (y + b - my) / k));
      search: for (let rr = 0; rr <= 16; rr += 1.2) {
        const steps = rr ? Math.max(8, Math.round(rr * 4)) : 1;
        for (let i = 0; i < steps; i++) { const a = i / steps * Math.PI * 2, x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; if (inK(x, y) && okAt(x, y)) { pos = [x, y]; break search; } }
      }
      if (!pos) { pos = [cx, cy]; conflicts.push(it.name); }
    }
    placed.push({ x: pos[0], y: pos[1] });
    marks.push({ it, x: pos[0], y: pos[1], lead });
  }
  const num = new Map(order.map((it, i) => [it.key, i + 1]));
  marks.forEach(m => { m.n = num.get(m.it.key); });
  const colW = (PW - 2 * MX) / cols;
  const list = order.map((it, i) => ({ it, n: i + 1, x: MX + Math.floor(i / rows) * colW, y: listTop + (i % rows) * RH + RH / 2, w: colW - 6 }));
  return { k, mx, my, mw, mh, T, vb: [bx, by, bw, bh], marks, list, title, sub, sub2, titleBox, footY, n, numbered, syms, conflicts, mapBot, listTop };
}
// kontrola překryvů (pro testy): kroužky navzájem a kroužky se značkami
function sheetOverlaps(sc) {
  const out = [];
  for (let i = 0; i < sc.marks.length; i++) {
    const a = sc.marks[i];
    for (let j = i + 1; j < sc.marks.length; j++) { const b = sc.marks[j]; if (Math.hypot(a.x - b.x, a.y - b.y) < 2 * R) out.push(`${a.n}x${b.n}`); }
    for (const sy of sc.syms) if (Math.hypot(sy.x - a.x, sy.y - a.y) < R + sy.r) out.push(`${a.n}x${BYKEY[sy.key].name}`);
  }
  return out.concat(sc.conflicts.map(c => 'nelze umístit: ' + c));
}
const footerText = () => `Slepá mapa č. ${S.seed}`;
const C = { ink: '#000000', grey: '#A6A6A6', text2: '#333333', line: '#9A9A9A', rule: '#BBBBBB' };

function sheetSVG(sc) {
  const FONT = "-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif";
  const kind = S.sheet, f2 = (v) => v.toFixed(2);
  let s = `<svg xmlns="${SVGNS}" viewBox="0 0 ${PW} ${PH}" font-family="${FONT}" role="img" aria-label="Náhled pracovního listu">`;
  s += `<rect width="${PW}" height="${PH}" fill="#fff"/>`;
  s += `<svg x="${f2(sc.mx)}" y="${f2(sc.my)}" width="${f2(sc.mw)}" height="${f2(sc.mh)}" viewBox="${sc.vb.map(v => v.toFixed(1)).join(' ')}">`;
  const sw = (mm) => (mm / sc.k).toFixed(2);
  const kOn = kind === 'kraje' || kind === 'mix';
  s += `<g fill="#fff" stroke="${kOn ? C.ink : C.grey}" stroke-width="${sw(kOn ? .25 : .22)}" stroke-linejoin="round">` + M.layers.kraje.map(k => `<path d="${k.d}" fill-rule="evenodd"/>`).join('') + '</g>';
  const dash = `stroke-dasharray="${sw(1.4)} ${sw(.8)}"`;
  const rBlack = M.layers.reky.filter(r => kind === 'reky' || sc.numbered.has('reky:' + r.id));
  const rGrey = M.layers.reky.filter(r => !rBlack.includes(r));
  if (rGrey.length) s += `<g fill="none" stroke="${C.grey}" stroke-width="${sw(.3)}" ${dash} stroke-linecap="round" stroke-linejoin="round">` + rGrey.map(r => `<path d="${r.d}"/>`).join('') + '</g>';
  if (rBlack.length) s += `<g fill="none" stroke="${C.ink}" stroke-width="${sw(.4)}" ${dash} stroke-linecap="round" stroke-linejoin="round">` + rBlack.map(r => `<path d="${r.d}"/>`).join('') + '</g>';
  s += `<path d="${M.obrys}" fill="none" stroke="${C.ink}" stroke-width="${sw(.6)}" stroke-linejoin="round"/>`;
  s += '</svg>';
  s += `<text x="${MX}" y="${f2(sc.titleBox[1] + 5.5)}" font-size="5.5" font-weight="700" fill="${C.ink}">${esc(sc.title)}</text>`;
  s += `<text x="${MX}" y="${f2(sc.titleBox[1] + 11)}" font-size="3.4" fill="${C.text2}">${esc(sc.sub)}</text>`;
  s += `<text x="${MX}" y="${f2(sc.titleBox[1] + 15.5)}" font-size="3.4" fill="${C.text2}">${esc(sc.sub2)}</text>`;
  for (const sy of sc.syms) {
    if (sy.key.startsWith('pohori:')) s += `<path d="M${f2(sy.x)} ${f2(sy.y - 1.9)}l2 3.3h-4z" fill="${C.ink}" stroke="#fff" stroke-width=".3" stroke-linejoin="round"/>`;
    else s += `<circle cx="${f2(sy.x)}" cy="${f2(sy.y)}" r="1.15" fill="${C.ink}" stroke="#fff" stroke-width=".35"/>`;
  }
  for (const m of sc.marks) {
    if (m.lead) s += `<line x1="${f2(m.lead[0])}" y1="${f2(m.lead[1])}" x2="${f2(m.lead[2])}" y2="${f2(m.lead[3])}" stroke="${C.ink}" stroke-width=".2"/>`;
    s += `<circle cx="${f2(m.x)}" cy="${f2(m.y)}" r="${R}" fill="#fff" stroke="${C.ink}" stroke-width=".25"/>`;
    s += `<text x="${f2(m.x)}" y="${f2(m.y + .05)}" font-size="${m.n > 9 ? 2.5 : 2.8}" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="${C.ink}">${m.n}</text>`;
  }
  for (const L of sc.list) {
    s += `<text x="${f2(L.x)}" y="${f2(L.y)}" font-size="3.4" font-weight="700" dominant-baseline="central" fill="${C.ink}">${L.n}.</text>`;
    if (S.sol) { const fit = L.it.name.length * 1.9 > L.w - 6 ? ` textLength="${(L.w - 6).toFixed(1)}" lengthAdjust="spacingAndGlyphs"` : ''; s += `<text x="${f2(L.x + 6)}" y="${f2(L.y)}" font-size="3.4" font-weight="600" dominant-baseline="central" fill="${C.ink}"${fit}>${esc(L.it.name)}</text>`; }
    else s += `<line x1="${f2(L.x + 6)}" y1="${f2(L.y + 1.6)}" x2="${f2(L.x + L.w)}" y2="${f2(L.y + 1.6)}" stroke="${C.line}" stroke-width=".3"/>`;
  }
  const fy = sc.footY;
  s += `<line x1="${MX}" y1="${fy - 3.5}" x2="${PW - MX}" y2="${fy - 3.5}" stroke="${C.rule}" stroke-width=".3"/>`;
  s += `<text x="${MX}" y="${f2(fy + .4)}" font-size="3.2" font-weight="600" dominant-baseline="central" fill="${C.ink}">${esc(footerText())}</text>`;
  s += `<text x="${PW / 2}" y="${f2(fy + .4)}" font-size="2.5" text-anchor="middle" dominant-baseline="central" fill="${C.text2}">${esc(SRC_SHEET)}</text>`;
  s += `<path d="${wavePath(PW - MX - 28, fy + .4).map((p, i) => (i ? 'L' : 'M') + f2(p[0]) + ' ' + f2(p[1])).join('')}" fill="none" stroke="${C.ink}" stroke-width=".5" stroke-linecap="round"/>`;
  s += `<text x="${PW - MX}" y="${f2(fy + .4)}" font-size="3.2" font-weight="700" text-anchor="end" dominant-baseline="central" fill="${C.ink}">velappky.cz</text>`;
  return s + '</svg>';
}
function wavePath(x0, yc) { const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40; pts.push([x0 + t * 7.5, yc - Math.sin(t * Math.PI * 6) * 0.75]); } return pts; }

let scene = null;
function renderSheet() {
  scene = sheetScene();
  $('sheet').innerHTML = sheetSVG(scene);
  $('seed').value = S.seed;
  $('showSol').setAttribute('aria-checked', String(!!S.sol));
  document.querySelectorAll('#sheetKind button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.s === S.sheet)));
  $('sheetInfo').textContent = `${scene.n} prvků · A4 na šířku · ${footerText()}`;
}
function openSheet() { location.hash = 'list'; }
function route() {
  const sheet = location.hash === '#list';
  $('sheetView').hidden = !sheet; $('game').hidden = sheet;
  if (sheet) { renderSheet(); window.scrollTo(0, 0); gcEvent('slepa-mapa-list', 'Slepá mapa: pracovní list'); }
  else renderAll();
}
window.addEventListener('hashchange', route);
$('toMap').onclick = (e) => { e.preventDefault(); if (history.length > 1 && location.hash === '#list') history.back(); else { location.hash = ''; } };
$('sheetKind').innerHTML = SHEETS.map(([v, t]) => `<button type="button" data-s="${v}" aria-pressed="false">${t}</button>`).join('');
document.querySelectorAll('#sheetKind button').forEach(b => b.onclick = () => { S.sheet = b.dataset.s; save(); renderSheet(); });
$('seed').oninput = (e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 9); S.seed = v || '1'; save(); scene = sheetScene(); $('sheet').innerHTML = sheetSVG(scene); $('sheetInfo').textContent = `${scene.n} prvků · A4 na šířku · ${footerText()}`; };
$('newSheet').onclick = () => { S.seed = newSeed(); save(); renderSheet(); };
$('showSol').onclick = () => { S.sol = !S.sol; save(); renderSheet(); };
$('print').onclick = () => { gcEvent('slepa-mapa-tisk', 'Slepá mapa: tisk listu'); window.print(); };

// ---------- start ----------
buildMap();
view = S.mode === 'prohl' ? 'browse' : 'setup';
if ('ResizeObserver' in window) new ResizeObserver(() => rescale()).observe(svg);
route();
window.SlepaMapa = { ITEMS, S, sheetScene, sheetOverlaps, renderSheet, pickAt, applyLayers, get view() { return view; }, get Q() { return Q; } };
})();
