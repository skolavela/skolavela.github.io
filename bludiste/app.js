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
  const start = 0, end = cols - 1;
  walls[start] &= ~N; walls[end] &= ~N; // vstup vlevo nahoře, výstup vpravo nahoře
  return { cols, rows, walls, start, end };
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
const PRESET_NAMES = { easy: 'Lehké', medium: 'Střední', hard: 'Těžké', expert: 'Expert' };
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
  const top = 22, bottom = 22, side = 12;
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
  // arrows & icons
  const deco = [];
  const ax1 = ox + cell / 2, ax2 = ox + (cols - .5) * cell;
  const ah = Math.min(3, Math.max(1.6, cell * .5));
  deco.push([[ax1, oy - 12], [ax1, oy - 2]], [[ax1 - ah, oy - 2 - ah], [ax1, oy - 2], [ax1 + ah, oy - 2 - ah]]);
  deco.push([[ax2, oy - 2], [ax2, oy - 12]], [[ax2 - ah, oy - 12 + ah], [ax2, oy - 12], [ax2 + ah, oy - 12 + ah]]);
  if (false) {
    const fx = ax1 + 4.5, fy = oy - 13; // flag
    deco.push([[fx, fy + 9], [fx, fy]], [[fx, fy], [fx + 6, fy + 1.6], [fx, fy + 3.6]]);
    const sx = ax2 - 8, sy = oy - 8, R = 4, r = 1.7, star = []; // star
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; star.push([sx + Math.cos(a) * rr, sy + Math.sin(a) * rr]); }
    deco.push(star);
  }
  let solution = null;
  const path = solveMaze(maze);
  if (path) {
    solution = [[ax1, oy - 2]].concat(path.map(c => [ox + (c % cols + .5) * cell, oy + (((c / cols) | 0) + .5) * cell]), [[ax2, oy - 2]]);
  }
  return { PW, PH, cols, rows, cell, maze, lines, deco, solution, footerY: PH - 12, path };
}

const THICK = 0.4; // mm, pevná tloušťka čáry
function fmtDate(ts) { const d = new Date(ts || Date.now()), p = n => String(n).padStart(2, '0'); return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`; }
function footerText(st) { return `Bludiště · seed ${st.seed} · ${fmtDate(st.created)}`; }

// ---------- SVG ----------
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function toD(pts) { return 'M' + pts.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L'); }
function renderSVG(st, sc, withSol, preview) {
  const t = THICK;
  let vb = `0 0 ${sc.PW} ${sc.PH}`, ink = '#1d1d1f';
  if (preview) { // náhled: jen bludiště, oříznuté na obsah, barva čar dle motivu
    let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
    for (const l of sc.lines.concat(sc.deco)) for (const [x, y] of l) { x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y); }
    const m = 1; vb = `${x1 - m} ${y1 - m} ${x2 - x1 + 2 * m} ${y2 - y1 + 2 * m}`; ink = 'currentColor';
  }
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" font-family="-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif">`;
  if (!preview) s += `<rect width="${sc.PW}" height="${sc.PH}" fill="#fff"/>`;
  if (withSol && sc.solution) s += `<path d="${toD(sc.solution)}" fill="none" stroke="#ff3b30" stroke-opacity=".75" stroke-width="${Math.max(.5, sc.cell * .28)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${sc.lines.map(toD).join('')}" fill="none" stroke="${ink}" stroke-width="${t}" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${sc.deco.map(toD).join('')}" fill="none" stroke="${ink}" stroke-width="${Math.max(.4, t * .8)}" stroke-linecap="round" stroke-linejoin="round"/>`;
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
  const fy = sc.footerY;
  doc.setDrawColor(210, 210, 215); doc.setLineWidth(.3); doc.line(12, fy - 4, sc.PW - 12, fy - 4);
  doc.setFont(fam, 'bold'); doc.setFontSize(10); doc.setTextColor(29, 29, 31);
  doc.text(txt(footerText(st)), 12, fy + 1.5);
  return doc;
}

const API = { footerText, hashSeed, mulberry32, generateMaze, solveMaze, buildScene, renderSVG, makePDF, gridFor, PRESETS };
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
  document.querySelectorAll('#presets button').forEach(b => b.classList.toggle('on', b.dataset.p === st.preset));
  $('size').value = st.size; $('seed').value = st.seed; $('showSol').checked = !!st.showSol;
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
$('showSol').onchange = e => update({ showSol: e.target.checked });
$('newMaze').onclick = () => update({ seed: newSeed(), created: Date.now() });
$('print').onclick = () => { $('svgWrap').innerHTML = renderSVG(st, scene, false); document.body.classList.add('printing'); window.print(); document.body.classList.remove('printing'); render(); };
$('pdf').onclick = async () => {
  const btn = $('pdf'); btn.disabled = true; const o = btn.textContent; btn.textContent = 'Připravuji…';
  try { (await makePDF(st, scene, window.jspdf.jsPDF, await loadFonts())).save(`bludiste-${st.seed}.pdf`); }
  catch (e) { alert('Export PDF selhal: ' + e.message); }
  btn.disabled = false; btn.textContent = o;
};
sync(); render();
})(typeof window !== 'undefined' ? window : globalThis);
