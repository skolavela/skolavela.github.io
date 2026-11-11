function gcEvent(name, title) { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: title || name, event: true }); } catch (e) {} }
/* Bludiště – generátor bludišť k tisku na A4. Čisté JS, bez build kroku. */
(function (root) {
'use strict';

// ---------- RNG ----------
function hashSeed(s) {
  s = String(s).trim();
  if (/^\d+$/.test(s)) return (parseInt(s.slice(-9), 10) >>> 0);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Maze (growing tree, mix nejnovější/náhodná buňka) ----------
const N = 1, E = 2, S = 4, W = 8;
const DIRS = [[N, 0, -1, S], [E, 1, 0, W], [S, 0, 1, N], [W, -1, 0, E]];
function generateMaze(cols, rows, seed) {
  const rnd = mulberry32(hashSeed(seed));
  const walls = new Uint8Array(cols * rows).fill(15);
  const seen = new Uint8Array(cols * rows);
  const stack = [0]; seen[0] = 1;
  while (stack.length) {
    const idx = rnd() < 0.5 ? stack.length - 1 : (rnd() * stack.length) | 0; // growing tree: 50 % nejnovější, 50 % náhodná
    const c = stack[idx], x = c % cols, y = (c / cols) | 0;
    const opts = [];
    for (const d of DIRS) {
      const nx = x + d[1], ny = y + d[2];
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && !seen[ny * cols + nx]) opts.push(d);
    }
    if (!opts.length) { stack[idx] = stack[stack.length - 1]; stack.pop(); continue; }
    const d = opts[(rnd() * opts.length) | 0];
    const n = (y + d[2]) * cols + x + d[1];
    walls[c] &= ~d[0]; walls[n] &= ~d[3]; seen[n] = 1; stack.push(n);
  }
  // vstup a výstup kdekoli po obvodu, odvozené z čísla bludiště (vlastní RNG, chodby se tím nemění)
  const [a, b] = openings(cols, rows, seed);
  walls[a.c] &= ~a.d; walls[b.c] &= ~b.d;
  return { cols, rows, walls, start: a.c, end: b.c, startSide: a.d, endSide: b.d };
}
// obvod po směru hodinových ručiček: nahoře → vpravo → dole → vlevo; k = 0 … 2·(cols+rows)-1
function perimeterCell(cols, rows, k) {
  if (k < cols) return { c: k, d: N };
  k -= cols; if (k < rows) return { c: k * cols + cols - 1, d: E };
  k -= rows; if (k < cols) return { c: (rows - 1) * cols + (cols - 1 - k), d: S };
  k -= cols; return { c: (rows - 1 - k) * cols, d: W };
}
// start a cíl jsou od sebe po obvodu aspoň 3/8 obvodu (zpravidla na jiné straně)
function openings(cols, rows, seed) {
  const P = 2 * (cols + rows), r = mulberry32(hashSeed(seed) ^ 0x51ed270b);
  const i = (r() * P) | 0;
  const off = Math.round((r() - .5) * P / 4);
  const j = ((i + Math.floor(P / 2) + off) % P + P) % P;
  return [perimeterCell(cols, rows, i), perimeterCell(cols, rows, j)];
}
function solveMaze(m) {
  const { cols, rows, walls } = m, prev = new Int32Array(cols * rows).fill(-1);
  const q = [m.start]; prev[m.start] = m.start;
  for (let i = 0; i < q.length; i++) {
    const c = q[i]; if (c === m.end) break;
    const x = c % cols, y = (c / cols) | 0;
    for (const d of DIRS) {
      if (walls[c] & d[0]) continue;
      const nx = x + d[1], ny = y + d[2];
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const n = ny * cols + nx; if (prev[n] !== -1) continue;
      prev[n] = c; q.push(n);
    }
  }
  if (prev[m.end] === -1) return null;
  const path = [m.end];
  while (path[path.length - 1] !== m.start) path.push(prev[path[path.length - 1]]);
  return path.reverse();
}

// ---------- Layout / geometry in mm ----------
const PRESETS = { easy: 12, medium: 24, hard: 42, expert: 70 };
const PRESET_NAMES = { easy: 'Lehké', medium: 'Střední', hard: 'Těžké', expert: 'Nejtěžší' };
function pageSize(o) { return o === 'portrait' ? [210, 297] : [297, 210]; }
function gridFor(size, orient) {
  const [W_, H_] = pageSize(orient);
  const aw = W_ - 24, ah = H_ - 22 - 22;
  const long = Math.max(aw, ah), short = Math.min(aw, ah);
  const a = size, b = Math.max(4, Math.round(size * short / long));
  return aw >= ah ? [a, b] : [b, a];
}
function buildScene(st) {
  const [PW, PH] = pageSize('landscape');
  const [cols, rows] = gridFor(st.size, 'landscape');
  const maze = generateMaze(cols, rows, st.seed);
  const top = 16, bottom = 30, side = 16; // místo pro šipky startu a cíle na všech stranách + patička
  const cell = Math.min((PW - 2 * side) / cols, (PH - top - bottom) / rows);
  const ox = (PW - cell * cols) / 2, oy = top + ((PH - top - bottom) - cell * rows) / 2;
  const rnd = mulberry32(hashSeed(st.seed) ^ 0x9e3779b9);
  const amp = 0;
  const jp = (gx, gy) => { // deterministic jitter per grid point so joints meet
    if (!amp) return [ox + gx * cell, oy + gy * cell];
    const r = mulberry32((gx * 73856093) ^ (gy * 19349663) ^ hashSeed(st.seed));
    return [ox + gx * cell + (r() - .5) * 2 * amp, oy + gy * cell + (r() - .5) * 2 * amp];
  };
  const seg = (gx1, gy1, gx2, gy2) => {
    const pts = [];
    const len = Math.abs(gx2 - gx1) + Math.abs(gy2 - gy1);
    for (let i = 0; i <= len; i++) {
      const gx = gx1 + Math.sign(gx2 - gx1) * i, gy = gy1 + Math.sign(gy2 - gy1) * i;
      const p = jp(gx, gy); pts.push(p);
      if (amp && i < len) { // wobbly midpoint like a pen
        const q = jp(gx + Math.sign(gx2 - gx1), gy + Math.sign(gy2 - gy1));
        const w = (rnd() - .5) * amp * 1.2;
        const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
        pts.push([(p[0] + q[0]) / 2 - dy / L * w, (p[1] + q[1]) / 2 + dx / L * w]);
      }
    }
    return pts;
  };
  const lines = [];
  const { walls } = maze;
  for (let y = 0; y <= rows; y++) { // horizontal runs
    let run = -1;
    for (let x = 0; x <= cols; x++) {
      const has = x < cols && (y < rows ? walls[y * cols + x] & N : walls[(rows - 1) * cols + x] & S);
      if (has && run < 0) run = x;
      if (!has && run >= 0) { lines.push(seg(run, y, x, y)); run = -1; }
    }
  }
  for (let x = 0; x <= cols; x++) { // vertical runs
    let run = -1;
    for (let y = 0; y <= rows; y++) {
      const has = y < rows && (x < cols ? walls[y * cols + x] & W : walls[y * cols + cols - 1] & E);
      if (has && run < 0) run = y;
      if (!has && run >= 0) { lines.push(seg(x, run, x, y)); run = -1; }
    }
  }
  // šipky: start míří do bludiště, cíl ven; u každé jeden malý popisek
  const deco = [], labels = [];
  const ah = Math.min(2.6, Math.max(1.6, cell * .5)), GAP = 1.5, LEN = 8;
  const UV = { [N]: [0, -1], [S]: [0, 1], [E]: [1, 0], [W]: [-1, 0] };
  const edgeOf = (c, d) => { const u = UV[d], x = ox + (c % cols + .5) * cell, y = oy + (((c / cols) | 0) + .5) * cell; return [x + u[0] * cell / 2, y + u[1] * cell / 2, u]; };
  const arrow = (c, d, inward, text) => {
    const [ex, ey, u] = edgeOf(c, d);
    const near = [ex + u[0] * GAP, ey + u[1] * GAP], far = [ex + u[0] * (GAP + LEN), ey + u[1] * (GAP + LEN)];
    const tip = inward ? near : far, tail = inward ? far : near;
    const bx = (tail[0] - tip[0]) / LEN, by = (tail[1] - tip[1]) / LEN, px = -by, py = bx;
    deco.push([tail, tip], [[tip[0] + bx * ah + px * ah, tip[1] + by * ah + py * ah], tip, [tip[0] + bx * ah - px * ah, tip[1] + by * ah - py * ah]]);
    const mx = (near[0] + far[0]) / 2, my = (near[1] + far[1]) / 2;
    if (u[0] === 0) labels.push({ x: mx + ah + 1.5, y: my, text, anchor: 'start' });
    else labels.push({ x: mx, y: my - ah - 1.5, text, anchor: 'middle' });
    return near;
  };
  const pin = arrow(maze.start, maze.startSide, true, 'Start');
  const pout = arrow(maze.end, maze.endSide, false, 'Cíl');
  let solution = null;
  const path = solveMaze(maze);
  if (path) {
    solution = [pin].concat(path.map(c => [ox + (c % cols + .5) * cell, oy + (((c / cols) | 0) + .5) * cell]), [pout]);
  }
  return { PW, PH, cols, rows, cell, maze, lines, deco, labels, solution, footerY: PH - 12, path };
}

const THICK = 0.4; // mm, pevná tloušťka čáry
function footerText(st) { return `Bludiště č. ${st.seed}`; } // patička listu i PDF: jen číslo bludiště, bez data

// ---------- SVG ----------
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function toD(pts) { return 'M' + pts.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L'); }
function renderSVG(st, sc, withSol, preview) {
  const t = THICK;
  let vb = `0 0 ${sc.PW} ${sc.PH}`, ink = '#1d1d1f';
  if (preview) { // náhled: jen bludiště, oříznuté na obsah, barva čar dle motivu
    let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
    for (const l of sc.lines.concat(sc.deco)) for (const [x, y] of l) { x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y); }
    for (const L of sc.labels) { const w = L.text.length * 2.1, l0 = L.anchor === 'middle' ? L.x - w / 2 : L.x; x1 = Math.min(x1, l0); x2 = Math.max(x2, l0 + w); y1 = Math.min(y1, L.y - 2.5); y2 = Math.max(y2, L.y + 2.5); }
    const m = 1; vb = `${x1 - m} ${y1 - m} ${x2 - x1 + 2 * m} ${y2 - y1 + 2 * m}`; ink = 'currentColor';
  }
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" font-family="-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif">`;
  if (!preview) s += `<rect width="${sc.PW}" height="${sc.PH}" fill="#fff"/>`;
  if (withSol && sc.solution) s += `<path d="${toD(sc.solution)}" fill="none" ${preview ? 'style="stroke:var(--doodle)"' : 'stroke="#ff3b30" stroke-opacity=".75"'} stroke-width="${Math.max(.5, sc.cell * .28)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${sc.lines.map(toD).join('')}" fill="none" stroke="${ink}" stroke-width="${t}" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${sc.deco.map(toD).join('')}" fill="none" stroke="${ink}" stroke-width="${Math.max(.4, t * .8)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  for (const L of sc.labels) s += `<text x="${L.x.toFixed(2)}" y="${L.y.toFixed(2)}" font-size="3.6" font-weight="600" text-anchor="${L.anchor}" dominant-baseline="central" fill="${ink}">${esc(L.text)}</text>`;
  if (!preview) {
    const fy = sc.footerY;
    s += `<line x1="12" y1="${fy - 4}" x2="${sc.PW - 12}" y2="${fy - 4}" stroke="#d2d2d7" stroke-width=".3"/>`;
    s += `<text x="12" y="${fy + 1.5}" font-size="3.6" font-weight="600" fill="#1d1d1f">${esc(footerText(st))}</text>`;
  }
  return s + '</svg>';
}

// ---------- PDF ----------
let fontCache = null;
async function loadFonts() {
  if (fontCache) return fontCache;
  const get = async (u) => {
    const b = new Uint8Array(await (await fetch(u)).arrayBuffer());
    let str = ''; for (let i = 0; i < b.length; i += 0x8000) str += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(str);
  };
  try { fontCache = { r: await get('fonts/LiberationSans-Regular.ttf'), b: await get('fonts/LiberationSans-Bold.ttf') }; }
  catch (e) { fontCache = false; }
  return fontCache;
}
function deaccent(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
async function makePDF(st, sc, jsPDFCtor, fonts) {
  const doc = new jsPDFCtor({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  let fam = 'helvetica', txt = deaccent;
  if (fonts) {
    doc.addFileToVFS('LS-R.ttf', fonts.r); doc.addFont('LS-R.ttf', 'LS', 'normal');
    doc.addFileToVFS('LS-B.ttf', fonts.b); doc.addFont('LS-B.ttf', 'LS', 'bold');
    fam = 'LS'; txt = s => s;
  }
  doc.setProperties({ title: footerText(st), creator: 'Bludiště' });
  doc.setLineCap('round'); doc.setLineJoin('round');
  const poly = (pts) => {
    const d = []; for (let i = 1; i < pts.length; i++) d.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
    doc.lines(d, pts[0][0], pts[0][1], [1, 1], 'S', false);
  };
  doc.setDrawColor(29, 29, 31); doc.setLineWidth(THICK); sc.lines.forEach(poly);
  doc.setLineWidth(Math.max(.4, THICK * .8)); sc.deco.forEach(poly);
  doc.setFont(fam, 'bold'); doc.setFontSize(10); doc.setTextColor(29, 29, 31);
  sc.labels.forEach(L => doc.text(txt(L.text), L.x, L.y, { align: L.anchor === 'middle' ? 'center' : 'left', baseline: 'middle' }));
  const fy = sc.footerY;
  doc.setDrawColor(210, 210, 215); doc.setLineWidth(.3); doc.line(12, fy - 4, sc.PW - 12, fy - 4);
  doc.setFont(fam, 'bold'); doc.setFontSize(10); doc.setTextColor(29, 29, 31);
  doc.text(txt(footerText(st)), 12, fy + 1.5);
  return doc;
}

const API = { openings, footerText, hashSeed, mulberry32, generateMaze, solveMaze, buildScene, renderSVG, makePDF, gridFor, PRESETS };
if (typeof module !== 'undefined' && module.exports) { module.exports = API; return; }
root.Bludiste = API;

// ---------- UI ----------
const $ = id => document.getElementById(id);
const KEY = 'bludiste.settings.v1';
const newSeed = () => String(Math.floor(Math.random() * 900000) + 100000);
const DEF = { preset: 'medium', size: 24, seed: newSeed(), created: Date.now(), showSol: false };
let st = Object.assign({}, DEF);
try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); for (const k in DEF) if (k in o) st[k] = o[k]; } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }; // ukládá jen aktuální klíče => staré volby zmizí
let scene;
function sync() {
  document.querySelectorAll('#presets button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.p === st.preset)));
  $('size').value = st.size; $('seed').value = st.seed; $('showSol').setAttribute('aria-checked', String(!!st.showSol));
}
function render() {
  scene = buildScene(st);
  $('sizeVal').textContent = scene.cols + ' × ' + scene.rows;
  $('svgWrap').innerHTML = renderSVG(st, scene, st.showSol, true);
  $('mfoot').textContent = footerText(st);
  $('info').textContent = `${scene.cols * scene.rows} políček · řešení ${scene.path ? scene.path.length : '–'} kroků · A4 na šířku`;
  save();
}
function update(p) { Object.assign(st, p); sync(); render(); }
document.querySelectorAll('#presets button').forEach(b => b.onclick = () => update({ preset: b.dataset.p, size: PRESETS[b.dataset.p] }));
$('size').oninput = e => { const v = +e.target.value; const p = Object.keys(PRESETS).find(k => PRESETS[k] === v); update({ size: v, preset: p || 'custom' }); };
$('seed').oninput = e => update({ seed: e.target.value || '1', created: Date.now() });
$('showSol').onclick = () => update({ showSol: !st.showSol });
$('newMaze').onclick = () => (gcEvent('bludiste-generate', 'Bludiště: nové bludiště'), update)({ seed: newSeed(), created: Date.now() });
$('pdf').onclick = async () => {
  gcEvent('bludiste-pdf', 'Bludiště: export PDF'); const btn = $('pdf'); btn.disabled = true; const lbl = btn.querySelector('span'), o = lbl.textContent; lbl.textContent = 'Připravuji…';
  try { (await makePDF(st, scene, window.jspdf.jsPDF, await loadFonts())).save(`bludiste-${st.seed}.pdf`); }
  catch (e) { alert('PDF se nepodařilo vytvořit. Zkuste to prosím znovu.'); }
  btn.disabled = false; lbl.textContent = o;
};
sync(); render();
})(typeof window !== 'undefined' ? window : globalThis);
