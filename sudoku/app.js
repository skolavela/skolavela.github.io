'use strict';
// Sudoku – aplikace (Škola Vela). Bez časovače, bez žebříčků; vše se ukládá jen v tomto zařízení.
const gcEvent = n => { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: n, title: n, event: true }); } catch (e) {} };
const SDK = window.SDK, $ = s => document.querySelector(s), KEY = 'sv-sudoku-1';
const IC = {
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  erase: '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
  pencil: '<path d="M21.2 6.8a2.8 2.8 0 0 0-4-4L3.8 16.2a2 2 0 0 0-.5.8L2 21.4a.5.5 0 0 0 .6.6l4.4-1.3a2 2 0 0 0 .8-.5z"/><path d="m15 5 4 4"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>'
};
const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const LEVEL_NOTE = {
  4: ['V řádku, sloupci nebo čtverci vždy chybí jen jedno číslo.', 'Hledáš, kam které číslo patří.', 'Málo zadaných čísel.'],
  6: ['Hledáš, kam které číslo patří.', 'Méně zadaných čísel.', 'Občas pro políčko zbude jen jedno číslo. Hodí se poznámky.'],
  9: ['Hledáš, kam které číslo patří.', 'Občas pro políčko zbude jen jedno číslo. Hodí se poznámky.', 'Pokročilé úvahy (zamčená čísla, dvojice). Bez poznámek to nepůjde.']
};
const NAME = ['', 'jednička', 'dvojka', 'trojka', 'čtyřka', 'pětka', 'šestka', 'sedmička', 'osmička', 'devítka'];
const PL = ['', 'jedničky', 'dvojky', 'trojky', 'čtyřky', 'pětky', 'šestky', 'sedmičky', 'osmičky', 'devítky'];
const HELPERS = [['hints', 'Nápověda'], ['notes', 'Poznámky tužkou'], ['same', 'Zvýraznit stejná čísla'], ['peers', 'Zvýraznit řádek, sloupec a čtverec'], ['conflicts', 'Upozornit na kolize']];

let S = { set: { hints: true, notes: true, same: true, peers: true, conflicts: true }, size: 9, level: 0, per: 1, printSol: true, game: null };
try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) S = Object.assign(S, s, { set: Object.assign(S.set, s.set) }); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

let G, cells = [], sel = -1, notesMode = false, hint = null, undo = [];
const boxName = n => n === 6 ? 'obdélník' : 'čtverec';
const loc = (n, k) => { const t = SDK.geo(n).type[k]; return t === 'row' ? 'řádku' : t === 'col' ? 'sloupci' : (n === 6 ? 'obdélníku' : 'čtverci'); };

// ---------- hra ----------
function newGame(track) {
  const g = SDK.generate(S.size, S.level);
  S.game = { n: g.n, level: g.level, puzzle: g.puzzle, solution: g.solution, board: g.puzzle.slice(), notes: new Array(g.n * g.n).fill(0), hints: 0, solved: false };
  undo = []; sel = -1; hint = null; notesMode = false;
  save(); build();
  if (track) gcEvent(`sudoku-start-${g.n}-${g.level + 1}`);
}
function build() {
  const g = S.game, n = g.n; G = SDK.geo(n);
  const b = $('#board'); b.className = 'board n' + n;
  b.style.gridTemplateColumns = `repeat(${n / G.bw},minmax(0,1fr))`; b.style.gridTemplateRows = `repeat(${n / G.bh},minmax(0,1fr))`;
  cells = new Array(n * n); let html = '';
  for (let br = 0; br < n; br += G.bh) for (let bc = 0; bc < n; bc += G.bw) {
    html += `<div class="box" style="grid-template-columns:repeat(${G.bw},minmax(0,1fr));grid-template-rows:repeat(${G.bh},minmax(0,1fr))">`;
    for (let r = br; r < br + G.bh; r++) for (let c = bc; c < bc + G.bw; c++) html += `<div class="cell" role="gridcell" data-i="${r * n + c}"></div>`;
    html += '</div>';
  }
  b.innerHTML = html;
  b.querySelectorAll('.cell').forEach(el => { cells[+el.dataset.i] = el; el.onclick = () => { sel = +el.dataset.i; paint(); }; });
  const pad = $('#pad'); pad.className = 'pad n' + n; pad.style.gridTemplateColumns = `repeat(${n},1fr)`;
  pad.innerHTML = Array.from({ length: n }, (_, k) => `<button type="button" data-d="${k + 1}" aria-label="${k + 1}">${k + 1}</button>`).join('');
  pad.querySelectorAll('button').forEach(x => x.onclick = () => input(+x.dataset.d));
  paint();
}
function snapshot() { undo.push({ board: S.game.board.slice(), notes: S.game.notes.slice() }); if (undo.length > 300) undo.shift(); }
function input(d, asNote) {
  const g = S.game; if (!g || g.solved || sel < 0 || g.puzzle[sel]) return;
  if ((notesMode || asNote) && S.set.notes) {
    if (g.board[sel]) return;
    snapshot(); g.notes[sel] ^= 1 << d;
  } else {
    snapshot();
    if (g.board[sel] === d) g.board[sel] = 0;
    else { g.board[sel] = d; g.notes[sel] = 0; G.peers[sel].forEach(j => g.notes[j] &= ~(1 << d)); }
    hint = null;
    if (g.board.every((v, i) => v === g.solution[i])) { g.solved = true; gcEvent(`sudoku-solve-${g.n}-${g.level + 1}`); }
  }
  save(); paint();
}
function erase() {
  const g = S.game; if (g.solved || sel < 0 || g.puzzle[sel] || (!g.board[sel] && !g.notes[sel])) return;
  snapshot(); g.board[sel] = 0; g.notes[sel] = 0; hint = null; save(); paint();
}
function doUndo() { const u = undo.pop(); if (!u || S.game.solved) return; S.game.board = u.board; S.game.notes = u.notes; hint = null; save(); paint(); }

// ---------- nápověda, která učí postup ----------
function makeHint() {
  const g = S.game, n = g.n;
  const wrong = g.board.findIndex((v, i) => v && !g.puzzle[i] && v !== g.solution[i]);
  if (wrong >= 0) return { cell: wrong, wrong: true, area: [], src: [], pre: [], text: 'Číslo v orámovaném políčku sem nepatří. Smaž ho a zkus to znovu – tahle chyba by tě dál zaváděla.' };
  const b = g.board.slice(), cand = SDK.candidates(G, b), pres = [];
  for (let k = 0; k < 200; k++) {
    const st = SDK.nextStep(G, b, cand, 5); if (!st) break;
    if (st.elims) { pres.push(st); SDK.apply(G, b, cand, st); continue; }
    const h = { cell: st.cell, d: st.d, area: [], src: [], pre: [] }; let txt = '';
    if (st.tech === 1) { h.area = G.units[st.unit]; txt = `V tomhle ${loc(n, st.unit)} chybí jen jedno číslo. Které to je?`; }
    else if (st.tech === 2) {
      const u = G.units[st.unit]; h.area = u;
      const empt = u.filter(c => !b[c]);
      h.src = b.map((v, c) => v === st.d && empt.some(e => G.peers[e].includes(c)) ? c : -1).filter(c => c >= 0);
      txt = `Kam v tomhle ${loc(n, st.unit)} patří ${NAME[st.d]}?` + (h.src.length ? ` Zvýrazněné ${PL[st.d]} jí berou ostatní políčka – zbývá jen jedno.` : ' Zbývá pro ni jen jedno políčko.');
    } else { h.area = G.peers[st.cell]; txt = `Do orámovaného políčka se hodí jen jedno číslo. Projdi jeho řádek, sloupec i ${boxName(n)} – které číslo v nich ještě není?`; }
    if (pres.length) {
      const p = pres[0]; h.pre = p.cells;
      let pt = p.tech === 4
        ? `Nejdřív si všimni: v tomhle ${loc(n, p.unit)} může být ${NAME[p.d]} jen v tečkovaně orámovaných políčkách, takže jinde v jejich ${loc(n, p.unit2)} už být nemůže.`
        : p.kind === 'naked'
          ? `Nejdřív si všimni dvojice: v tečkovaně orámovaných políčkách můžou být jen čísla ${p.ds[0]} a ${p.ds[1]}, takže jinde v tomhle ${loc(n, p.unit)} nebudou.`
          : `Nejdřív si všimni dvojice: čísla ${p.ds[0]} a ${p.ds[1]} můžou být v tomhle ${loc(n, p.unit)} jen v tečkovaně orámovaných políčkách, takže tam nic jiného nepatří.`;
      if (pres.length > 1) pt += ' (A ještě jedna podobná úvaha.)';
      txt = pt + ' Pak: ' + txt.charAt(0).toLowerCase() + txt.slice(1);
    }
    h.text = txt; return h;
  }
  const c = g.board.findIndex(v => !v);
  return { cell: c, d: g.solution[c], area: [], src: [], pre: [], text: 'Tady by pomohla hodně pokročilá úvaha. Můžu ti číslo doplnit.' };
}
function showHint() {
  const g = S.game; if (!g || g.solved || !S.set.hints) return;
  hint = makeHint(); sel = hint.cell; g.hints++; save();
  gcEvent(`sudoku-hint-${g.n}`); paint();
}
function fillHint() {
  if (!hint) return; const h = hint; sel = h.cell;
  if (h.wrong) erase(); else input(h.d, false);
  hint = null; paint();
}

// ---------- vykreslení ----------
function paint() {
  const g = S.game, n = g.n, set = S.set, vs = sel >= 0 ? g.board[sel] : 0;
  const peers = new Set(set.peers && sel >= 0 && !hint ? G.peers[sel] : []);
  const area = new Set(hint ? hint.area : []), src = new Set(hint ? hint.src : []), pre = new Set(hint ? hint.pre : []);
  const count = new Array(n + 1).fill(0);
  g.board.forEach(v => v && count[v]++);
  for (let i = 0; i < n * n; i++) {
    const el = cells[i], v = g.board[i], given = !!g.puzzle[i];
    const bad = set.conflicts && v && G.peers[i].some(j => g.board[j] === v);
    el.className = 'cell' + (given ? ' given' : '') + (area.has(i) ? ' area' : peers.has(i) ? ' peer' : '') +
      (set.same && vs && v === vs && i !== sel ? ' same' : '') + (src.has(i) ? ' src' : '') +
      (i === sel ? (hint ? ' target' : ' sel') : '') + (pre.has(i) ? ' pre' : '') + (bad ? (given ? ' badg' : ' bad') : '');
    if (hint && hint.wrong && i === hint.cell) el.className += ' badg';
    if (v) el.innerHTML = v;
    else if (g.notes[i] && set.notes) el.innerHTML = '<div class="notes">' + Array.from({ length: n }, (_, k) => `<span${set.same && vs === k + 1 ? ' class="hit"' : ''}>${g.notes[i] >> (k + 1) & 1 ? k + 1 : ''}</span>`).join('') + '</div>';
    else el.innerHTML = '';
    el.setAttribute('aria-label', `Řádek ${Math.floor(i / n) + 1}, sloupec ${i % n + 1}: ${v || 'prázdné'}`);
  }
  $('#pad').classList.toggle('notesmode', notesMode && set.notes);
  $('#pad').querySelectorAll('button').forEach(x => x.classList.toggle('full', count[+x.dataset.d] >= n));
  $('#meta').textContent = `${n}×${n} · ${SDK.LEVELS[n][g.level].name}`;
  const left = g.board.filter(v => !v).length;
  $('#status').textContent = g.solved ? 'Hotovo' : `Zbývá ${left}`;
  $('#tNotes').hidden = !set.notes; $('#tHint').hidden = !set.hints;
  $('#tNotes').classList.toggle('on', notesMode && set.notes);
  $('#tNotes').setAttribute('aria-pressed', notesMode && set.notes);
  $('#tUndo').disabled = !undo.length;
  $('#hintbox').hidden = !hint;
  if (hint) { $('#hinttext').textContent = hint.text; $('#hintFill').textContent = hint.wrong ? 'Smazat číslo' : 'Doplnit číslo'; }
  $('#done').hidden = !g.solved; $('#tools').hidden = $('#pad').hidden = g.solved;
  if (g.solved) $('#doneText').textContent = `${n}×${n} · ${SDK.LEVELS[n][g.level].name}. ` + (g.hints ? `Nápověda pomohla ${g.hints}×.` : 'Bez nápovědy.');
  paintSide();
}
function seg(id, val, cb) {
  document.querySelectorAll(id).forEach(el => el.querySelectorAll('button').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.v == val)); b.onclick = () => cb(b.dataset.v); }));
}
function paintSide() {
  seg('#segSize, #segSizeP', S.size, v => { S.size = +v; save(); paintSide(); printChanged(); });
  seg('#segLevel, #segLevelP', S.level, v => { S.level = +v; save(); paintSide(); printChanged(); });
  seg('#segPer', S.per, v => { S.per = +v; save(); paintSide(); printChanged(); });
  $('#levelNote').textContent = LEVEL_NOTE[S.size][S.level];
  $('#printSol').setAttribute('aria-checked', String(!!S.printSol));
}
function buildHelpers() {
  $('#helpers').innerHTML = HELPERS.map(([k, l]) => `<button class="c-switch" type="button" role="switch" aria-checked="${!!S.set[k]}" data-k="${k}"><span>${l}</span><span class="c-track" aria-hidden="true"></span></button>`).join('');
  $('#helpers').querySelectorAll('button').forEach(x => x.onclick = () => {
    S.set[x.dataset.k] = !S.set[x.dataset.k]; x.setAttribute('aria-checked', String(S.set[x.dataset.k])); if (!S.set.hints) hint = null; if (!S.set.notes) notesMode = false; save(); paint();
  });
}

// ---------- tisk ----------
function gridSvg(n, p, sol, mm) {
  const Gx = SDK.geo(n), u = 10, W = n * u; let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${mm}mm" height="${mm}mm" viewBox="-0.6 -0.6 ${W + 1.2} ${W + 1.2}">`;
  for (let k = 1; k < n; k++) {
    s += `<line x1="${k * u}" y1="0" x2="${k * u}" y2="${W}" stroke="#000" stroke-width="${k % Gx.bw ? .25 : .9}"/>`;
    s += `<line x1="0" y1="${k * u}" x2="${W}" y2="${k * u}" stroke="#000" stroke-width="${k % Gx.bh ? .25 : .9}"/>`;
  }
  s += `<rect x="0" y="0" width="${W}" height="${W}" fill="none" stroke="#000" stroke-width="1.2"/>`;
  for (let i = 0; i < n * n; i++) {
    const v = p[i] || (sol && sol[i]); if (!v) continue;
    s += `<text x="${(i % n) * u + u / 2}" y="${Math.floor(i / n) * u + u / 2 + 2.3}" text-anchor="middle" font-size="6.4" font-family="-apple-system,Helvetica Neue,Arial,sans-serif" ${p[i] ? 'font-weight="600" fill="#000"' : 'fill="#777"'}>${v}</text>`;
  }
  return s + '</svg>';
}
function buildPrint() {
  const n = S.size, lv = S.level, per = S.per, name = `Sudoku ${n}×${n} · ${SDK.LEVELS[n][lv].name}`;
  const games = Array.from({ length: per }, () => SDK.generate(n, lv));
  // rozměry mřížky v mm – s rezervou: A4 minus okraje 15 mm = 180 × 267 mm, nejvyšší varianta vyjde zhruba na 240 mm
  const mm = { 1: 140, 2: 95, 4: 78, 6: 60 }[per], cls = per > 2 ? 'c2' : 'c1';
  const page = (title, right, sols) => `<section class="pp"><div class="ph"><h1>${title}</h1>${right ? `<span>${right}</span>` : ''}</div><div class="pg ${cls}">` +
    games.map((g, k) => `<figure>${per > 1 ? `<figcaption>${k + 1}.</figcaption>` : ''}${gridSvg(n, g.puzzle, sols ? g.solution : null, mm)}</figure>`).join('') +
    `</div><div class="pf"><span class="a-sheet__brand">${(window.VELA_ICONS && window.VELA_ICONS.ui_wave) || ''}skolavela.app/sudoku</span></div></section>`;
  $('#printout').innerHTML = page(name, '', false) + (S.printSol ? page('Řešení', name, true) : '');
  // náhled = přesně to, co se vytiskne (každá stránka na vlastním listu A4)
  $('#preview').innerHTML = Array.from($('#printout').children, pp => `<div class="a-sheet a-sheet--portrait sd-sheet"><div class="sd-page sd-print">${pp.outerHTML}</div></div>`).join('');
  fitPreview();
}
function fitPreview() {
  document.querySelectorAll('.sd-sheet').forEach(sh => { const pg = sh.firstChild; if (pg.offsetWidth) pg.style.transform = `scale(${sh.clientWidth / pg.offsetWidth})`; });
}
let mode = 'play';
function setMode(m) {
  mode = m; $('#playView').hidden = m !== 'play'; $('#printView').hidden = m !== 'print';
  document.querySelectorAll('.sd-mode button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  if (m === 'print') buildPrint();
  window.scrollTo(0, 0);
}
function printChanged() { if (mode === 'print') buildPrint(); }
function doPrint() {
  const btn = $('#printBtn span'), old = btn.textContent; btn.textContent = 'Připravuji…';
  // vytiskne zadání z náhledu; po tisku připraví nová zadání (každý tisk = nová zadání jako dřív)
  setTimeout(() => { btn.textContent = old; gcEvent(`sudoku-print-${S.size}-${S.per}`); window.print(); buildPrint(); }, 30);
}

// ---------- ovládání ----------
document.querySelectorAll('.tools button').forEach(b => { b.innerHTML = svg(IC[b.dataset.ic]) + `<b>${b.textContent}</b>`; });
$('#tUndo').onclick = doUndo; $('#tErase').onclick = erase;
$('#tNotes').onclick = () => { notesMode = !notesMode; paint(); };
$('#tHint').onclick = showHint; $('#hintFill').onclick = fillHint; $('#hintClose').onclick = () => { hint = null; paint(); };
$('#again').onclick = () => { S.size = S.game.n; S.level = S.game.level; newGame(true); };
$('#newGame').onclick = () => {
  const g = S.game; if (g && !g.solved && g.board.some((v, i) => v && !g.puzzle[i]) && !confirm('Rozehrané sudoku se ztratí. Začít nové?')) return;
  newGame(true); window.scrollTo({ top: 0, behavior: 'smooth' });
};
$('#printSol').onclick = () => { S.printSol = !S.printSol; save(); paintSide(); printChanged(); };
document.querySelectorAll('.sd-mode button').forEach(b => b.onclick = () => setMode(b.dataset.mode));
if (window.ResizeObserver) new ResizeObserver(fitPreview).observe($('#preview')); else window.addEventListener('resize', fitPreview);
$('#printBtn').onclick = doPrint;
document.addEventListener('keydown', e => {
  if (!S.game || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || e.altKey) return;
  const n = S.game.n, k = e.key;
  if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'z') { e.preventDefault(); doUndo(); return; }
  if (e.ctrlKey || e.metaKey) return;
  const dm = /^Digit(\d)$|^Numpad(\d)$/.exec(e.code), d = dm ? +(dm[1] || dm[2]) : (/^\d$/.test(k) ? +k : 0);
  if (d >= 1 && d <= n) { e.preventDefault(); if (sel < 0) sel = 0; input(d, e.shiftKey); return; }
  if (k === 'Backspace' || k === 'Delete' || k === '0') { e.preventDefault(); erase(); return; }
  const mv = { ArrowUp: -n, ArrowDown: n, ArrowLeft: -1, ArrowRight: 1 }[k];
  if (mv) {
    e.preventDefault(); if (sel < 0) sel = 0;
    else { const r = Math.floor(sel / n), c = sel % n; sel = k === 'ArrowLeft' ? r * n + (c + n - 1) % n : k === 'ArrowRight' ? r * n + (c + 1) % n : ((r + (mv > 0 ? 1 : n - 1)) % n) * n + c; }
    paint(); return;
  }
  if (k === 'n' || k === 'p') { if (S.set.notes) { notesMode = !notesMode; paint(); } return; }
  if (k === 'h' || k === '?') { showHint(); return; }
  if (k === 'Escape') { hint = null; sel = -1; paint(); }
});

buildHelpers();
setMode('play');
if (S.game && S.game.puzzle && S.game.solution) build(); else newGame(true);
