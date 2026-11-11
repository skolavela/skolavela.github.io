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

// ---------- náhoda ----------
function hashSeed(s) { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return (h >>> 0) || 1; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(a, rnd) { rnd = rnd || Math.random; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- nastavení ----------
const KEY = 'slepa-mapa.v1';
const newSeed = () => String(Math.floor(Math.random() * 9000) + 1000);
const DEF = { mode: 'najdi', layers: { kraje: true, mesta: false, reky: false, pohori: false }, count: '10', sol: false, seed: newSeed() };
let S = JSON.parse(JSON.stringify(DEF));
try {
  const o = JSON.parse(localStorage.getItem(KEY) || '{}');
  if (['najdi', 'coto', 'prohl'].includes(o.mode)) S.mode = o.mode;
  if (o.layers && typeof o.layers === 'object') for (const l of LAYERS) if (typeof o.layers[l.key] === 'boolean') S.layers[l.key] = o.layers[l.key];
  if (!LAYERS.some(l => S.layers[l.key])) S.layers.kraje = true;
  if (['10', '20', 'all'].includes(o.count)) S.count = o.count;
  if (typeof o.sol === 'boolean') S.sol = o.sol;
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
function renderLabels() {
  const g = svg.querySelector('.lbls'); if (!g) return;
  if (!(view === 'browse')) { g.innerHTML = ''; return; }
  const fs = (px) => (px * U).toFixed(2);
  const narrow = svg.getBoundingClientRect().width < 560;
  const F = narrow ? 10 : 13;
  let s = '';
  const cl = (x, txt, size, anchor) => { const w = txt.length * size * 0.56; const lo = anchor === 'middle' ? w / 2 + 4 * U : 4 * U, hi = anchor === 'middle' ? 1000 - w / 2 - 4 * U : 1000 - w - 4 * U; return Math.max(lo, Math.min(hi, x)).toFixed(1); };
  for (const it of activeItems()) {
    if (it.layer === 'kraje') {
      if (it.id === 'hlavni-mesto-praha' && S.layers.mesta) continue;
      const nm = narrow ? it.name.replace(/ kraj$/, '').replace(/^Kraj /, '').replace('Hlavní město ', '') : it.name;
      let ly = it.ly;
      if (S.layers.mesta && M.layers.mesta.some(c => Math.hypot(c.x - it.lx, c.y - it.ly) < 22 * U)) ly += 17 * U;
      s += `<text class="lbl k" x="${cl(it.lx, nm, (F - 1) * U, 'middle')}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="${fs(F - 1)}" style="stroke-width:${fs(3)}">${esc(nm)}</text>`;
    } else if (it.layer === 'mesta') {
      s += `<text class="lbl" x="${cl(it.x + 8 * U, it.name, F * U, 'start')}" y="${it.y}" dominant-baseline="central" font-size="${fs(F)}" style="stroke-width:${fs(3)}">${esc(it.name)}</text>`;
    } else if (it.layer === 'pohori') {
      s += `<text class="lbl h" x="${cl(it.x, it.name, (F - 1) * U, 'middle')}" y="${(it.y + 15 * U).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="${fs(F - 1)}" style="stroke-width:${fs(3)}">${esc(it.name)}</text>`;
    } else {
      s += `<text class="lbl r" x="${cl(it.mx, it.name, (F - 1) * U, 'middle')}" y="${(it.my - 9 * U).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="${fs(F - 1)}" style="stroke-width:${fs(3)}">${esc(it.name)}</text>`;
    }
  }
  g.innerHTML = s;
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
    clearStates(); setState(key, 'hl'); browseSel = key; renderTask(); live(BYKEY[key].name);
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
    cnt.textContent = '';
    task.innerHTML = `
      <div class="sm-setup">
        <div class="c-field"><span class="c-label">Co procvičit</span><div class="sm-switches">${switchesHTML('ly')}</div><p class="sm-hint" aria-live="polite"></p></div>
        <div class="c-field">
          <span class="c-label" id="lbl-cnt">Počet otázek</span>
          <div class="c-seg" role="group" aria-labelledby="lbl-cnt" id="cnt">
            ${[['10', '10'], ['20', '20'], ['all', 'Vše']].map(([v, t]) => `<button type="button" data-c="${v}" aria-pressed="${S.count === v}">${t}</button>`).join('')}
          </div>
          <div class="c-btns"><button class="c-btn c-btn--primary" type="button" id="start">Začít</button>${BTN_SHEET}</div>
        </div>
      </div>
      <p class="c-meta">Vybráno ${n} ${n >= 5 ? 'prvků' : 'prvky'}. ${SRC}</p>`;
    bindSwitches(task, () => { applyLayers(); renderTask(); });
    task.querySelectorAll('#cnt button').forEach(b => b.onclick = () => { S.count = b.dataset.c; save(); renderTask(); });
    $('start').onclick = () => startQuiz();
    $('toSheet').onclick = openSheet;
  } else if (view === 'browse') {
    cnt.textContent = '';
    const it = browseSel && BYKEY[browseSel];
    task.innerHTML = `
      <div class="sm-setup">
        <div><p class="sm-kind">${it ? esc(LBY[it.layer].kind) : '&nbsp;'}</p><p class="sm-big${it ? '' : ' is-empty'}" aria-live="polite">${it ? esc(it.name) : 'Ťukni na mapu a uvidíš název.'}</p></div>
        <div class="c-field"><span class="c-label">Na mapě</span><div class="sm-switches">${switchesHTML('ly')}</div><p class="sm-hint" aria-live="polite"></p></div>
      </div>
      <div class="sm-row"><p class="c-meta">${SRC}</p>${BTN_SHEET}</div>`;
    bindSwitches(task, () => { if (browseSel && !S.layers[BYKEY[browseSel].layer]) { browseSel = null; clearStates(); } applyLayers(); renderTask(); });
    $('toSheet').onclick = openSheet;
  } else if (view === 'quiz') {
    const it = current();
    const done = Q.pos + 1;
    cnt.textContent = `${Math.min(done, Q.queue.length)} / ${Q.queue.length}`;
    if (S.mode === 'najdi') {
      let fb = '', fs = '';
      if (Q.answered) {
        const bad = svg.querySelector('.ft[data-s="bad"]');
        if (bad) { fb = 'To je ' + BYKEY[bad.dataset.k].name + '.'; fs = 'bad'; } else { fb = 'Správně, to je ' + it.name + '.'; fs = 'ok'; }
      }
      task.innerHTML = `
        <p class="sm-q">Najdi <b>${esc(it.akuzativ || it.name)}</b>.</p>
        <div class="sm-row"><p class="sm-fb" id="fb"${fs ? ` data-s="${fs}"` : ''}>${esc(fb)}</p>
        <button class="c-btn c-btn--primary sm-next" type="button" id="next"${Q.answered ? '' : ' hidden'}>Další</button></div>`;
    } else {
      if (!Q.opts) Q.opts = optionsFor(it);
      let fb = '', fs = '';
      if (Q.answered) {
        const pick = Q.pick;
        if (pick === it.key) { fb = 'Správně, to je ' + it.name + '.'; fs = 'ok'; } else { fb = 'Na mapě je ' + it.name + '.'; fs = 'bad'; }
      }
      task.innerHTML = `
        <p class="sm-q">Co je to? <span class="sm-kind" style="display:inline">${esc(LBY[it.layer].kind)}</span></p>
        <div class="a-choices">${Q.opts.map((o, i) => {
          let st = ''; if (Q.answered) { if (o.key === it.key) st = 'correct'; else if (o.key === Q.pick) st = 'wrong'; }
          return `<button class="a-choice" type="button" data-k="${o.key}"${st ? ` data-state="${st}"` : ''}${Q.answered ? ' disabled' : ''}><span class="sm-key" aria-hidden="true">${i + 1}</span>${esc(o.name)}</button>`;
        }).join('')}</div>
        <div class="sm-row"><p class="sm-fb" id="fb"${fs ? ` data-s="${fs}"` : ''}>${esc(fb)}</p>
        <button class="c-btn c-btn--primary sm-next" type="button" id="next"${Q.answered ? '' : ' hidden'}>Další</button></div>`;
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
document.querySelectorAll('#modes button').forEach(b => b.onclick = () => {
  S.mode = b.dataset.m; save(); Q = null; browseSel = null;
  view = S.mode === 'prohl' ? 'browse' : 'setup';
  renderAll();
});

// mapa max. 60 % výšky okna a na tabletu/počítači tak, aby se vešlo i zadání
function fitMap() {
  const card = $('mapcard');
  if (window.innerWidth < 600 || $('game').hidden) { card.style.maxWidth = ''; rescale(); return; }
  const top = card.getBoundingClientRect().top + window.scrollY;
  const taskH = task.offsetHeight;
  const avail = window.innerHeight - top - 16 - taskH - 16;
  const h = Math.max(260, Math.min(window.innerHeight * 0.6, avail));
  const pad = 24;
  card.style.maxWidth = Math.min(1080, Math.round((h - pad) * 1000 / 580 + pad)) + 'px';
  rescale();
}
let rt = 0;
window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(fitMap); });

// ---------- pracovní list ----------
const PW = 297, PH = 210, MX = 12;
function sheetScene() {
  const layers = activeLayers();
  const items = ITEMS.filter(i => S.layers[i.layer]);
  const rnd = mulberry32(hashSeed(S.seed + '|' + layers.join(',')));
  const order = shuffle(items.slice(), rnd);
  const n = order.length;
  const cols = n <= 12 ? 3 : n <= 16 ? 4 : 5;
  const rows = Math.ceil(n / cols), RH = n > 40 ? 5.6 : n > 30 ? 6 : 7;
  const footY = PH - 9;
  const listTop = footY - 7 - rows * RH;
  const mapTop = 27, mapBot = listTop - 5;
  const k = Math.min((PW - 2 * MX) / 1000, (mapBot - mapTop) / 580);
  const mw = 1000 * k, mh = 580 * k, mx = (PW - mw) / 2, my = mapTop + (mapBot - mapTop - mh) / 2;
  const T = (x, y) => [mx + x * k, my + y * k];
  // čísla
  const marks = order.map((it, i) => {
    let x, y, ax, ay;
    if (it.layer === 'kraje') { [x, y] = T(it.lx, it.ly); ax = x; ay = y; }
    else if (it.layer === 'reky') { [ax, ay] = T(it.mx, it.my); x = ax; y = ay - 3.4; }
    else if (it.layer === 'mesta') { [ax, ay] = T(it.x, it.y); x = ax + 3.2; y = ay - 3.2; }
    else { [ax, ay] = T(it.x, it.y); x = ax + 4; y = ay + 1; }
    return { it, n: i + 1, x, y, ax, ay };
  });
  // rozestrčení překrývajících se kroužků (a od bodů měst/hor)
  const R = 2.3, anchors = marks.filter(m => m.it.layer === 'mesta' || m.it.layer === 'pohori').map(m => [m.ax, m.ay]);
  for (let iter = 0; iter < 60; iter++) {
    let moved = false;
    for (let i = 0; i < marks.length; i++) {
      for (let j = i + 1; j < marks.length; j++) {
        const a = marks[i], b = marks[j]; let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
        if (d < 2 * R + 0.6) { if (d < 1e-3) { dx = 1; dy = 0; d = 1; } const p = (2 * R + 0.6 - d) / 2; a.x -= dx / d * p; a.y -= dy / d * p; b.x += dx / d * p; b.y += dy / d * p; moved = true; }
      }
      for (const [px, py] of anchors) {
        const m = marks[i]; let dx = m.x - px, dy = m.y - py, d = Math.hypot(dx, dy);
        if (d < R + 1.6) { if (d < 1e-3) { dx = 1; dy = -1; d = 1.41; } const p = R + 1.6 - d; m.x += dx / d * p; m.y += dy / d * p; moved = true; }
      }
    }
    if (!moved) break;
  }
  const colW = (PW - 2 * MX) / cols;
  const list = order.map((it, i) => ({ it, n: i + 1, x: MX + Math.floor(i / rows) * colW, y: listTop + (i % rows) * RH + RH / 2, w: colW - 6 }));
  const title = 'Slepá mapa Česka';
  const what = LAYERS.filter(l => S.layers[l.key]).map(l => l.label.toLowerCase()).join(', ');
  const sub = `Napiš ke každému číslu správný název (${what}).`;
  return { k, mx, my, mw, mh, T, marks, list, title, sub, footY, layers, n };
}
const footerText = () => `Slepá mapa č. ${S.seed}`;
const C = { stage: '#E8E8ED', kraj: '#EFEFF0', border: '#8E8E93', river: '#0372B6', text: '#1D1D1F', text2: '#6E6E73', line: '#C7C7CC', mount: '#8A6A00', accent: '#0372B6' };

function sheetSVG(sc) {
  const FONT = "-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif";
  let s = `<svg xmlns="${SVGNS}" viewBox="0 0 ${PW} ${PH}" font-family="${FONT}" role="img" aria-label="Náhled pracovního listu">`;
  s += `<rect width="${PW}" height="${PH}" fill="#fff"/>`;
  s += `<text x="${MX}" y="16" font-size="6" font-weight="700" fill="${C.text}">${esc(sc.title)}</text>`;
  s += `<text x="${MX}" y="22.5" font-size="3.6" fill="${C.text2}">${esc(sc.sub)}</text>`;
  // mapa (vnořené svg ořízne sousedy)
  s += `<svg x="${sc.mx}" y="${sc.my}" width="${sc.mw}" height="${sc.mh}" viewBox="0 0 1000 580">`;
  const sw = (mm) => (mm / sc.k).toFixed(2);
  s += `<g fill="${C.stage}" stroke="#fff" stroke-width="${sw(.3)}">` + (M.podklad ? `<path d="${M.podklad}"/>` : '') + M.neighbors.map(n => `<path d="${n.d}"/>`).join('') + '</g>';
  s += `<path d="${M.obrys}" fill="#fff"/>`;
  if (S.layers.kraje) s += `<g fill="${C.kraj}" stroke="#fff" stroke-width="${sw(.45)}" stroke-linejoin="round">` + M.layers.kraje.map(k => `<path d="${k.d}" fill-rule="evenodd"/>`).join('') + '</g>';
  else s += `<path d="${M.obrys}" fill="${C.kraj}"/>`;
  s += `<path d="${M.obrys}" fill="none" stroke="${C.border}" stroke-width="${sw(.4)}" stroke-linejoin="round"/>`;
  if (S.layers.reky) s += `<g fill="none" stroke="${C.river}" stroke-width="${sw(.5)}" stroke-linecap="round" stroke-linejoin="round">` + M.layers.reky.map(r => `<path d="${r.d}"/>`).join('') + '</g>';
  s += '</svg>';
  if (S.layers.pohori) for (const p of M.layers.pohori) { const [x, y] = sc.T(p.x, p.y); s += `<path d="M${x.toFixed(2)} ${(y - 1.7).toFixed(2)}l1.7 2.9h-3.4z" fill="${C.mount}" stroke="#fff" stroke-width=".3" stroke-linejoin="round"/>`; }
  if (S.layers.mesta) for (const c of M.layers.mesta) { const [x, y] = sc.T(c.x, c.y); s += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.05" fill="${C.text}" stroke="#fff" stroke-width=".35"/>`; }
  for (const m of sc.marks) {
    s += `<circle cx="${m.x.toFixed(2)}" cy="${m.y.toFixed(2)}" r="2.3" fill="#fff" stroke="${C.text}" stroke-width=".25"/>`;
    s += `<text x="${m.x.toFixed(2)}" y="${(m.y + .05).toFixed(2)}" font-size="${m.n > 9 ? 2.5 : 2.8}" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="${C.text}">${m.n}</text>`;
  }
  for (const L of sc.list) {
    s += `<text x="${L.x.toFixed(2)}" y="${L.y.toFixed(2)}" font-size="3.4" font-weight="700" dominant-baseline="central" fill="${C.text}">${L.n}.</text>`;
    if (S.sol) { const fit = L.it.name.length * 1.9 > L.w - 6 ? ` textLength="${(L.w - 6).toFixed(1)}" lengthAdjust="spacingAndGlyphs"` : ''; s += `<text x="${(L.x + 6).toFixed(2)}" y="${L.y.toFixed(2)}" font-size="3.4" font-weight="600" dominant-baseline="central" fill="${C.accent}"${fit}>${esc(L.it.name)}</text>`; }
    else s += `<line x1="${(L.x + 6).toFixed(2)}" y1="${(L.y + 1.6).toFixed(2)}" x2="${(L.x + L.w).toFixed(2)}" y2="${(L.y + 1.6).toFixed(2)}" stroke="${C.line}" stroke-width=".3"/>`;
  }
  const fy = sc.footY;
  s += `<line x1="${MX}" y1="${fy - 4}" x2="${PW - MX}" y2="${fy - 4}" stroke="#d2d2d7" stroke-width=".3"/>`;
  s += `<text x="${MX}" y="${fy + .6}" font-size="3.4" font-weight="600" dominant-baseline="central" fill="${C.text}">${esc(footerText())}</text>`;
  s += `<text x="${PW / 2}" y="${fy + .6}" font-size="2.6" text-anchor="middle" dominant-baseline="central" fill="${C.text2}">${esc(SRC)}</text>`;
  s += `<path d="${wavePath(PW - MX - 29, fy + .6).map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('')}" fill="none" stroke="${C.accent}" stroke-width=".55" stroke-linecap="round"/>`;
  s += `<text x="${PW - MX}" y="${fy + .6}" font-size="3.4" font-weight="700" text-anchor="end" dominant-baseline="central" fill="${C.text}">velappky.cz</text>`;
  return s + '</svg>';
}
function wavePath(x0, yc) { const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40; pts.push([x0 + t * 7.5, yc - Math.sin(t * Math.PI * 6) * 0.75]); } return pts; }

// PDF (jsPDF, vektorově, 1 strana A4 na šířku)
let fontCache = null;
async function loadFonts() {
  if (fontCache !== null) return fontCache;
  const get = async (u) => {
    const r = await fetch(u); if (!r.ok) throw new Error('font');
    const b = new Uint8Array(await r.arrayBuffer());
    let str = ''; for (let i = 0; i < b.length; i += 0x8000) str += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(str);
  };
  try { fontCache = { r: await get('/bludiste/fonts/LiberationSans-Regular.ttf'), b: await get('/bludiste/fonts/LiberationSans-Bold.ttf') }; }
  catch (e) { fontCache = false; }
  return fontCache;
}
const deaccent = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
async function makePDF(sc, jsPDFCtor, fonts) {
  const doc = new jsPDFCtor({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  let fam = 'helvetica', txt = deaccent;
  if (fonts) {
    doc.addFileToVFS('LS-R.ttf', fonts.r); doc.addFont('LS-R.ttf', 'LS', 'normal');
    doc.addFileToVFS('LS-B.ttf', fonts.b); doc.addFont('LS-B.ttf', 'LS', 'bold');
    fam = 'LS'; txt = s => s;
  }
  doc.setProperties({ title: footerText(), creator: 'Slepá mapa - velappky.cz' });
  doc.setLineCap('round'); doc.setLineJoin('round');
  const fillC = (h) => doc.setFillColor(...rgb(h)), drawC = (h) => doc.setDrawColor(...rgb(h)), textC = (h) => doc.setTextColor(...rgb(h));
  const P = (subs) => { for (const s of subs) { s.pts.forEach((p, i) => { const [x, y] = sc.T(p[0], p[1]); i ? doc.lineTo(x, y) : doc.moveTo(x, y); }); if (s.closed) doc.close(); } };
  const cache = new Map(); const sub = (d) => { if (!cache.has(d)) cache.set(d, parseD(d)); return cache.get(d); };
  const pt = (mm) => mm * 72 / 25.4;
  // ořez na rámeček mapy
  doc.saveGraphicsState();
  doc.rect(sc.mx, sc.my, sc.mw, sc.mh, null); doc.clip(); doc.discardPath();
  fillC(C.stage); drawC('#FFFFFF'); doc.setLineWidth(.3);
  for (const d of [M.podklad].concat(M.neighbors.map(n => n.d))) if (d) { P(sub(d)); doc.fillEvenOdd(); P(sub(d)); doc.stroke(); }
  doc.restoreGraphicsState();
  fillC('#FFFFFF'); P(sub(M.obrys)); doc.fillEvenOdd();
  if (S.layers.kraje) {
    fillC(C.kraj); for (const k of M.layers.kraje) { P(sub(k.d)); doc.fillEvenOdd(); }
    drawC('#FFFFFF'); doc.setLineWidth(.45); for (const k of M.layers.kraje) { P(sub(k.d)); doc.stroke(); }
  } else { fillC(C.kraj); P(sub(M.obrys)); doc.fillEvenOdd(); }
  drawC(C.border); doc.setLineWidth(.4); P(sub(M.obrys)); doc.stroke();
  if (S.layers.reky) { drawC(C.river); doc.setLineWidth(.5); for (const r of M.layers.reky) { P(sub(r.d)); doc.stroke(); } }
  if (S.layers.pohori) { fillC(C.mount); drawC('#FFFFFF'); doc.setLineWidth(.3); for (const p of M.layers.pohori) { const [x, y] = sc.T(p.x, p.y); doc.triangle(x, y - 1.7, x + 1.7, y + 1.2, x - 1.7, y + 1.2, 'FD'); } }
  if (S.layers.mesta) { fillC(C.text); drawC('#FFFFFF'); doc.setLineWidth(.35); for (const c of M.layers.mesta) { const [x, y] = sc.T(c.x, c.y); doc.circle(x, y, 1.05, 'FD'); } }
  doc.setFont(fam, 'bold'); textC(C.text);
  for (const m of sc.marks) {
    fillC('#FFFFFF'); drawC(C.text); doc.setLineWidth(.25); doc.circle(m.x, m.y, 2.3, 'FD');
    doc.setFontSize(pt(m.n > 9 ? 2.5 : 2.8)); doc.text(String(m.n), m.x, m.y + .05, { align: 'center', baseline: 'middle' });
  }
  // záhlaví
  doc.setFont(fam, 'bold'); doc.setFontSize(pt(6)); textC(C.text); doc.text(txt(sc.title), MX, 16);
  doc.setFont(fam, 'normal'); doc.setFontSize(pt(3.6)); textC(C.text2); doc.text(txt(sc.sub), MX, 22.5);
  // seznam
  for (const L of sc.list) {
    doc.setFont(fam, 'bold'); doc.setFontSize(pt(3.4)); textC(C.text); doc.text(L.n + '.', L.x, L.y, { baseline: 'middle' });
    if (S.sol) {
      textC(C.accent); const nm = txt(L.it.name); let fsz = pt(3.4);
      doc.setFontSize(fsz); while (doc.getTextWidth(nm) > L.w - 6 && fsz > 6) { fsz -= 0.25; doc.setFontSize(fsz); }
      doc.text(nm, L.x + 6, L.y, { baseline: 'middle' });
    }
    else { drawC(C.line); doc.setLineWidth(.3); doc.line(L.x + 6, L.y + 1.6, L.x + L.w, L.y + 1.6); }
  }
  // patička
  const fy = sc.footY;
  drawC('#D2D2D7'); doc.setLineWidth(.3); doc.line(MX, fy - 4, PW - MX, fy - 4);
  doc.setFont(fam, 'bold'); doc.setFontSize(pt(3.4)); textC(C.text); doc.text(txt(footerText()), MX, fy + .6, { baseline: 'middle' });
  doc.text('velappky.cz', PW - MX, fy + .6, { align: 'right', baseline: 'middle' });
  doc.setFont(fam, 'normal'); doc.setFontSize(pt(2.6)); textC(C.text2); doc.text(txt(SRC), PW / 2, fy + .6, { align: 'center', baseline: 'middle' });
  drawC(C.accent); doc.setLineWidth(.55); const w = wavePath(PW - MX - 29, fy + .6);
  w.forEach((p, i) => i ? doc.lineTo(p[0], p[1]) : doc.moveTo(p[0], p[1])); doc.stroke();
  return doc;
}

let scene = null;
function renderSheet() {
  scene = sheetScene();
  $('sheet').innerHTML = sheetSVG(scene);
  $('seed').value = S.seed;
  $('showSol').setAttribute('aria-checked', String(!!S.sol));
  $('sheetLayers').innerHTML = switchesHTML('sl') + '<p class="sm-hint" aria-live="polite" style="grid-column:1/-1"></p>';
  bindSwitches($('sheetLayers'), () => { renderSheet(); });
  $('sheetInfo').textContent = `${scene.n} ${scene.n >= 5 ? 'prvků' : 'prvky'} · A4 na šířku · ${footerText()}`;
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
$('seed').oninput = (e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 9); S.seed = v || '1'; save(); scene = sheetScene(); $('sheet').innerHTML = sheetSVG(scene); $('sheetInfo').textContent = `${scene.n} prvků · A4 na šířku · ${footerText()}`; };
$('newSheet').onclick = () => { S.seed = newSeed(); save(); renderSheet(); };
$('showSol').onclick = () => { S.sol = !S.sol; save(); renderSheet(); };
$('pdf').onclick = async () => {
  gcEvent('slepa-mapa-pdf', 'Slepá mapa: export PDF');
  const btn = $('pdf'); btn.disabled = true; const lbl = btn.querySelector('span'), o = lbl.textContent; lbl.textContent = 'Připravuji…';
  try {
    if (!window.jspdf) throw new Error('jspdf');
    (await makePDF(scene || sheetScene(), window.jspdf.jsPDF, await loadFonts())).save(`slepa-mapa-${S.seed}${S.sol ? '-reseni' : ''}.pdf`);
  } catch (e) { alert('PDF se nepodařilo vytvořit. Zkuste to prosím znovu.'); }
  btn.disabled = false; lbl.textContent = o;
};

// ---------- start ----------
buildMap();
view = S.mode === 'prohl' ? 'browse' : 'setup';
if ('ResizeObserver' in window) new ResizeObserver(() => rescale()).observe(svg);
route();
window.SlepaMapa = { ITEMS, S, sheetScene, makePDF, pickAt, applyLayers, get view() { return view; }, get Q() { return Q; } };
})();
