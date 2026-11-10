function gcEvent(name, title) { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: title || name, event: true }); } catch (e) {} }
var $ = function (id) { return document.getElementById(id); };
var CATS = [
  { k: 'savci', n: 'Savci', c: '#d9822b', s: [['selmy', 'Šelmy'], ['kopytnici', 'Kopytníci'], ['hlodavci', 'Hlodavci a zajíci'], ['primati', 'Primáti'], ['morsti', 'Mořští savci'], ['ostatni', 'Ostatní']] },
  { k: 'ptaci', n: 'Ptáci', c: '#1f7ae0', s: [['dravci', 'Dravci a sovy'], ['pevci', 'Pěvci'], ['vodni', 'Vodní ptáci'], ['ostatni', 'Ostatní']] },
  { k: 'plazi', n: 'Plazi', c: '#5b8c1a', s: [] },
  { k: 'obojzivelnici', n: 'Obojživelníci', c: '#0f9d8a', s: [] },
  { k: 'ryby', n: 'Ryby', c: '#0a84c6', s: [['sladkovodni', 'Sladkovodní'], ['morske', 'Mořské']] },
  { k: 'hmyz', n: 'Hmyz', c: '#7a5af5', s: [['motyli', 'Motýli'], ['brouci', 'Brouci'], ['ostatni', 'Ostatní']] },
  { k: 'bezobratli', n: 'Ostatní bezobratlí', c: '#b0527a', s: [['pavoukovci', 'Pavoukovci'], ['mekkysi', 'Měkkýši'], ['korysi', 'Korýši'], ['ostatni', 'Ostatní']] },
  { k: 'rostliny', n: 'Rostliny', c: '#2e9e4f', s: [['listnate', 'Listnaté stromy'], ['jehlicnate', 'Jehličnany'], ['byliny', 'Byliny a květiny'], ['lecive', 'Léčivé'], ['jedovate', 'Jedovaté']] },
  { k: 'houby', n: 'Houby', c: '#c2571a', s: [['jedle', 'Jedlé'], ['jedovate', 'Jedovaté'], ['nejedle', 'Nejedlé']] }];
var CONTS = [['EU', 'Evropa'], ['AS', 'Asie'], ['AF', 'Afrika'], ['NA', 'Severní Amerika'], ['SA', 'Jižní Amerika'], ['AU', 'Austrálie a Oceánie'], ['AN', 'Antarktida'], ['OC', 'Oceány a moře']];
var KEY = 'priroda-v2';
var st = { cats: CATS.map(function (c) { return c.k; }), off: [], conts: CONTS.map(function (c) { return c[0]; }), lvl: '1', mode: 'quiz', len: '10' };
try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); for (var k in s) st[k] = s[k]; } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function contName(k) { return CONTS.filter(function (c) { return c[0] === k; })[0][1]; }
function subName(x) { var c = catOf(x.k); return x.s.length ? ' – ' + x.s.map(function (q) { var f = c.s.filter(function (z) { return z[0] === q; })[0]; return f ? f[1].toLowerCase() : q; }).join(', ') : ''; }
function catOf(k) { return CATS.filter(function (c) { return c.k === k; })[0]; }
// off = vypnuté podskupiny ve tvaru "kategorie:podskupina"
function subOn(k, sub) { return st.off.indexOf(k + ':' + sub) < 0; }
function match(x, ignoreLvl) {
  if (st.cats.indexOf(x.k) < 0) return false;
  if (!ignoreLvl && st.lvl === '1' && x.v !== 1) return false;
  if (x.s.length && !x.s.some(function (s) { return subOn(x.k, s); })) return false;
  return x.c.some(function (c) { return st.conts.indexOf(c) >= 0; });
}
function pool() { return SPECIES.filter(function (x) { return match(x); }); }
function cnt(f) { return SPECIES.filter(function (x) { return (st.lvl === '2' || x.v === 1) && f(x); }).length; }
var openSubs = {};
function druhu(n) { return n + (n === 1 ? ' druh' : n >= 2 && n <= 4 ? ' druhy' : ' druhů'); }
function tile(on, data, _, name, n) {
  return '<button type="button" class="tile' + (on ? ' on' : '') + '" aria-pressed="' + !!on + '" ' + data + (n ? '' : ' disabled') + '><span class="tx"><span class="nm">' + name + '</span><span class="ct">' + druhu(n) + '</span></span><span class="ck">' + (on ? '✓' : '') + '</span></button>';
}
function renderSetup() {
  $('cats').innerHTML = CATS.map(function (c) { return tile(st.cats.indexOf(c.k) >= 0, 'data-k="' + c.k + '"', '', c.n, cnt(function (x) { return x.k === c.k; })); }).join('');
  var groups = CATS.filter(function (c) { return c.s.length && st.cats.indexOf(c.k) >= 0; }).map(function (c) {
    var subs = c.s.map(function (s) { return { s: s, n: cnt(function (x) { return x.k === c.k && x.s.indexOf(s[0]) >= 0; }) }; }).filter(function (o) { return o.n > 0; });
    return { c: c, subs: subs };
  }).filter(function (g) { return g.subs.length > 1; });
  $('subsWrap').hidden = !groups.length;
  $('subs').innerHTML = groups.map(function (g) {
    var on = g.subs.filter(function (o) { return subOn(g.c.k, o.s[0]); }).length;
    return '<details data-g="' + g.c.k + '"' + (openSubs[g.c.k] ? ' open' : '') + '><summary><span class="nm">' + g.c.n + '</span><span class="st">' + (on === g.subs.length ? 'Vše' : on + ' z ' + g.subs.length) + '</span><span class="chev">›</span></summary><div class="sublist' + (g.subs.length % 3 !== 0 && g.subs.length % 2 === 0 ? ' c2' : '') + '">' +
      g.subs.map(function (o) { return '<button type="button" class="pill' + (subOn(g.c.k, o.s[0]) ? ' on' : '') + '" aria-pressed="' + subOn(g.c.k, o.s[0]) + '" data-sub="' + g.c.k + ':' + o.s[0] + '"><span>' + o.s[1] + '</span><span class="n">' + o.n + '</span></button>'; }).join('') + '</div></details>';
  }).join('');
  Array.prototype.forEach.call($('subs').querySelectorAll('details'), function (d) { d.ontoggle = function () { openSubs[d.dataset.g] = d.open; }; });
  $('conts').innerHTML = CONTS.map(function (c) { return tile(st.conts.indexOf(c[0]) >= 0, 'data-c="' + c[0] + '"', '', c[1], cnt(function (x) { return x.c.indexOf(c[0]) >= 0; })); }).join('');
  $('allCats').textContent = st.cats.length ? 'Zrušit výběr' : 'Vybrat vše';
  $('allConts').textContent = st.conts.length ? 'Zrušit výběr' : 'Vybrat vše';
  ['lvl', 'mode', 'len'].forEach(function (g) { Array.prototype.forEach.call($(g).children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === st[g])); }); });
  var n = pool().length;
  $('avail').innerHTML = n >= 4 ? '<b>' + druhu(n) + '</b> · ' + esc(summary()) : 'Vyberte aspoň 4 druhy';
  $('start').disabled = n < 4;
  save();
}
// Shrnutí výběru jedním řádkem, např. „všechny skupiny · celý svět · 10 otázek“
function listSum(sel, all, allTxt, many) {
  if (sel.length === all.length) return allTxt;
  if (!sel.length) return many(0);
  if (sel.length <= 2) return sel.join(', ').toLowerCase();
  return many(sel.length);
}
function summary() {
  var anyOff = CATS.some(function (c) { return st.cats.indexOf(c.k) >= 0 && c.s.some(function (s) { return !subOn(c.k, s[0]); }); });
  var cats = listSum(CATS.filter(function (c) { return st.cats.indexOf(c.k) >= 0; }).map(function (c) { return c.n; }), CATS, anyOff ? 'všechny skupiny (upřesněno)' : 'všechny skupiny',
    function (k) { return k + (k >= 2 && k <= 4 ? ' skupiny' : ' skupin'); });
  if (anyOff && st.cats.length !== CATS.length) cats += ' (upřesněno)';
  var conts = listSum(CONTS.filter(function (c) { return st.conts.indexOf(c[0]) >= 0; }).map(function (c) { return c[1]; }), CONTS, 'celý svět',
    function (k) { return k + (k >= 2 && k <= 4 ? ' světadíly' : ' světadílů'); });
  var len = st.len === '0' ? 'všechny otázky' : st.len + ' otázek';
  return cats + ' · ' + conts + (st.mode === 'quiz' ? ' · ' + len : st.len === '0' ? '' : ' · ' + st.len + ' kartiček');
}
$('more').onclick = function () {
  var open = $('choices').hidden;
  $('choices').hidden = !open;
  $('more').setAttribute('aria-expanded', String(open));
};
function toggle(arr, v) { var i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); }
$('setup').onclick = function (e) {
  var b = e.target.closest('button'); if (!b || b.id === 'start') return;
  if (b.dataset.k) toggle(st.cats, b.dataset.k);
  else if (b.dataset.sub) toggle(st.off, b.dataset.sub);
  else if (b.dataset.c) toggle(st.conts, b.dataset.c);
  else if (b.dataset.all === 'cats') st.cats = st.cats.length ? [] : CATS.map(function (c) { return c.k; });
  else if (b.dataset.all === 'conts') st.conts = st.conts.length ? [] : CONTS.map(function (c) { return c[0]; });
  else return;
  renderSetup();
};
['lvl', 'mode', 'len'].forEach(function (g) { $(g).onclick = function (e) { var b = e.target.closest('button'); if (b && b.dataset.v) { st[g] = b.dataset.v; renderSetup(); } }; });

var game = null;
function show(id) { ['setup', 'play', 'done'].forEach(function (x) { $(x).hidden = x !== id; }); document.body.classList.toggle('playing', id === 'play'); $('score').hidden = id !== 'play' || st.mode !== 'quiz'; window.scrollTo(0, 0); }
function start() {
  gcEvent('priroda-start-' + (st.mode || 'quiz'), 'Příroda: start ' + (st.mode || 'quiz'));
  var deck = shuffle(pool().slice()); var len = +st.len; if (len) deck = deck.slice(0, len);
  game = { deck: deck, i: 0, ok: 0, missed: [] }; show('play'); question();
}
function preload(s) { if (s) { var im = new Image(); im.src = s.img; } }
function question() {
  var s = game.deck[game.i], n = game.deck.length;
  $('qnum').textContent = (st.mode === 'quiz' ? 'Otázka ' : 'Kartička ') + (game.i + 1) + ' / ' + n;
  $('bar').style.width = (game.i / n * 100) + '%';
  $('score').textContent = 'Správně ' + game.ok;
  var img = $('photo'), bg = $('photoBg'); img.classList.remove('ok'); bg.classList.remove('ok'); $('ph').textContent = 'Načítám fotku…'; $('ph').hidden = false;
  if (s.w) { img.width = s.w; img.height = s.h; }
  img.onload = function () { img.classList.add('ok'); bg.src = s.img; bg.classList.add('ok'); $('ph').hidden = true; };
  img.onerror = function () { $('ph').textContent = 'Fotku se nepodařilo načíst.'; };
  img.src = s.img;
  $('credit').innerHTML = 'Foto: <a href="' + esc(s.page) + '" target="_blank" rel="noopener">' + esc(s.a) + '</a>, ' + esc(s.lic) + ', Wikimedia Commons';
  $('play').classList.add('pending');
  preload(game.deck[game.i + 1]);
  if (st.mode === 'cards') {
    $('opts').innerHTML = '<button type="button" class="a-choice opt" id="flip" style="grid-column:1/-1">Ukázat název</button>';
    $('flip').onclick = function () { $('opts').innerHTML = ''; reveal(s, null); };
    return;
  }
  // 3 chybné možnosti: přednostně stejná podskupina, pak stejná skupina
  // Pravidlo: čtyři možnosti mají vždy různé české názvy a různé latinské názvy.
  var others = SPECIES.filter(function (x) { return x.k === s.k; });
  var sameSub = shuffle(others.filter(function (x) { return x.s.some(function (q) { return s.s.indexOf(q) >= 0; }) && (st.lvl === '2' || x.v === 1); }));
  var rest = shuffle(others.filter(function (x) { return sameSub.indexOf(x) < 0; }));
  var cand = sameSub.concat(rest, shuffle(SPECIES.filter(function (x) { return x.k !== s.k; })));
  var seenN = {}, seenL = {}, wrong = [];
  seenN[s.n] = 1; seenL[s.l] = 1;
  for (var ci = 0; ci < cand.length && wrong.length < 3; ci++) {
    var x = cand[ci];
    if (seenN[x.n] || seenL[x.l]) continue;
    seenN[x.n] = 1; seenL[x.l] = 1; wrong.push(x);
  }
  var opts = shuffle([s].concat(wrong));
  $('opts').innerHTML = opts.map(function (o, i) { return '<button type="button" class="a-choice opt" data-i="' + i + '">' + esc(o.n) + '</button>'; }).join('');
  Array.prototype.forEach.call($('opts').children, function (b) {
    b.onclick = function () {
      var pick = opts[+b.dataset.i], good = pick === s;
      Array.prototype.forEach.call($('opts').children, function (x) { x.disabled = true; if (opts[+x.dataset.i] === s) x.dataset.state = 'correct'; });
      if (good) game.ok++; else { b.dataset.state = 'wrong'; game.missed.push(s.n); }
      $('score').textContent = 'Správně ' + game.ok;
      reveal(s, good);
    };
  });
}
function reveal(s, good) {
  var c = catOf(s.k);
  $('reveal').innerHTML = '<div class="r1">' + (good === null ? '' : (good ? 'Správně! ' : 'Skoro! Je to: ')) + '<b>' + esc(s.n) + '</b>' +
    (st.lvl === '2' || good === null ? ' <i>' + esc(s.l) + '</i>' : '') + '</div>' +
    '<div class="ct">' + c.n + subName(s) + ' · ' + s.c.map(contName).join(', ') + '</div>';
  $('play').classList.remove('pending');
  $('next').textContent = game.i + 1 < game.deck.length ? 'Další' : 'Výsledek';
  $('next').focus({ preventScroll: true });
}
$('next').onclick = function () { game.i++; if (game.i < game.deck.length) question(); else finish(); };
function finish() {
  var n = game.deck.length;
  if (st.mode === 'cards') { $('doneTitle').textContent = 'Prošli jste všechny kartičky!'; $('doneText').textContent = n + ' kartiček. Zkuste teď kvíz.'; $('missed').innerHTML = ''; }
  else {
    var p = game.ok / n;
    $('doneTitle').textContent = p === 1 ? 'Bez jediné chyby!' : p >= .7 ? 'Výborně!' : p >= .4 ? 'Dobrá práce!' : 'Příště to bude lepší!';
    $('doneText').textContent = 'Správně ' + game.ok + ' z ' + n + '.';
    $('missed').innerHTML = game.missed.length ? '<span class="lbl">Procvičit:</span>' + game.missed.map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') : '';
  }
  $('bar').style.width = '100%'; show('done');
}
$('start').onclick = start; $('again').onclick = start;
$('home').onclick = function () { show('setup'); }; $('quit').onclick = function () { show('setup'); };
renderSetup();
