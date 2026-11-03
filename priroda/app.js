var $ = function (id) { return document.getElementById(id); };
var CATS = [
  { k: 'stromy', n: 'Stromy', e: '🌳', c: '#2e9e4f' }, { k: 'kvetiny', n: 'Květiny', e: '🌼', c: '#e0559b' },
  { k: 'houby', n: 'Houby', e: '🍄', c: '#c2571a' }, { k: 'ptaci', n: 'Ptáci', e: '🐦', c: '#1f7ae0' },
  { k: 'savci', n: 'Savci', e: '🦊', c: '#d9822b' }, { k: 'hmyz', n: 'Hmyz', e: '🐞', c: '#7a5af5' },
  { k: 'plazi', n: 'Obojživelníci a plazi', e: '🐸', c: '#0f9d8a' }];
var KEY = 'priroda-v1';
var st = { cats: CATS.map(function (c) { return c.k; }), lvl: '1', mode: 'quiz', len: '10' };
try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); for (var k in s) st[k] = s[k]; } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function catOf(k) { return CATS.filter(function (c) { return c.k === k; })[0]; }
// 1. stupeň = jen snadné druhy, 2. stupeň = všechny
function pool() { return SPECIES.filter(function (s) { return st.cats.indexOf(s.k) >= 0 && (st.lvl === '2' || s.v === 1); }); }

function renderSetup() {
  $('cats').innerHTML = CATS.map(function (c) {
    var on = st.cats.indexOf(c.k) >= 0;
    return '<button class="chip' + (on ? ' on' : '') + '" data-k="' + c.k + '" style="' + (on ? 'background:' + c.c : '') + '">' + c.e + ' ' + c.n + '</button>';
  }).join('');
  ['lvl', 'mode', 'len'].forEach(function (g) { Array.prototype.forEach.call($(g).children, function (b) { b.classList.toggle('on', b.dataset.v === st[g]); }); });
  var n = pool().length;
  $('avail').textContent = n ? 'Vybráno ' + n + ' druhů.' : 'Vyberte alespoň jednu skupinu.';
  $('start').disabled = n < 4;
  save();
}
$('cats').onclick = function (e) {
  var b = e.target.closest('.chip'); if (!b) return;
  var i = st.cats.indexOf(b.dataset.k); if (i >= 0) st.cats.splice(i, 1); else st.cats.push(b.dataset.k); renderSetup();
};
['lvl', 'mode', 'len'].forEach(function (g) { $(g).onclick = function (e) { if (e.target.dataset.v) { st[g] = e.target.dataset.v; renderSetup(); } }; });

var game = null;
function show(id) { ['setup', 'play', 'done'].forEach(function (x) { $(x).hidden = x !== id; }); $('score').hidden = id !== 'play' || st.mode !== 'quiz'; window.scrollTo(0, 0); }
function start() {
  var deck = shuffle(pool().slice()); var len = +st.len; if (len) deck = deck.slice(0, len);
  game = { deck: deck, i: 0, ok: 0, missed: [] }; show('play'); question();
}
function preload(s) { if (s) { var im = new Image(); im.src = s.img; } }
function question() {
  var s = game.deck[game.i], n = game.deck.length;
  $('qnum').textContent = (st.mode === 'quiz' ? 'Otázka ' : 'Kartička ') + (game.i + 1) + ' / ' + n;
  $('bar').style.width = (game.i / n * 100) + '%';
  $('score').textContent = '⭐ ' + game.ok;
  var img = $('photo'); img.classList.remove('ok'); $('ph').textContent = 'Načítám fotku…'; $('ph').hidden = false;
  img.onload = function () { img.classList.add('ok'); $('ph').hidden = true; };
  img.onerror = function () { $('ph').textContent = 'Fotku se nepodařilo načíst.'; };
  img.src = s.img;
  $('credit').innerHTML = 'Foto: <a href="' + esc(s.page) + '" target="_blank" rel="noopener">' + esc(s.a) + '</a>, ' + esc(s.lic) + ', Wikimedia Commons';
  $('reveal').hidden = true; $('next').hidden = true;
  preload(game.deck[game.i + 1]);
  if (st.mode === 'cards') {
    $('opts').innerHTML = '<button class="opt" id="flip" style="grid-column:1/-1">Ukázat název 👀</button>';
    $('flip').onclick = function () { $('opts').innerHTML = ''; reveal(s, null); };
    return;
  }
  // 3 chybné možnosti: přednostně ze stejné skupiny
  var same = SPECIES.filter(function (x) { return x.k === s.k && x.n !== s.n && (st.lvl === '2' || x.v === 1); });
  if (same.length < 3) same = same.concat(SPECIES.filter(function (x) { return x.k === s.k && x.n !== s.n && x.v === 2; }));
  var wrong = shuffle(same).slice(0, 3);
  var opts = shuffle([s].concat(wrong));
  $('opts').innerHTML = opts.map(function (o, i) { return '<button class="opt" data-i="' + i + '">' + esc(o.n) + '</button>'; }).join('');
  Array.prototype.forEach.call($('opts').children, function (b) {
    b.onclick = function () {
      var pick = opts[+b.dataset.i], good = pick === s;
      Array.prototype.forEach.call($('opts').children, function (x) { x.disabled = true; if (opts[+x.dataset.i] === s) x.classList.add('right'); });
      if (good) game.ok++; else { b.classList.add('wrong'); game.missed.push(s.n); }
      $('score').textContent = '⭐ ' + game.ok;
      reveal(s, good);
    };
  });
}
function reveal(s, good) {
  var c = catOf(s.k);
  $('reveal').innerHTML = (good === null ? '' : '<div style="font-size:22px">' + (good ? '🎉 Správně!' : '🙂 Skoro! Je to:') + '</div>') +
    '<div class="nm">' + esc(s.n) + '</div>' + (st.lvl === '2' || good === null ? '<div class="la">' + esc(s.l) + '</div>' : '') +
    '<div class="ct">' + c.e + ' ' + c.n + '</div>';
  $('reveal').hidden = false; $('next').hidden = false;
  $('next').textContent = game.i + 1 < game.deck.length ? 'Další →' : 'Výsledek 🏁';
  $('next').focus({ preventScroll: true });
}
$('next').onclick = function () { game.i++; if (game.i < game.deck.length) question(); else finish(); };
function finish() {
  var n = game.deck.length;
  if (st.mode === 'cards') { $('trophy').textContent = '🌟'; $('doneTitle').textContent = 'Prošli jste všechny kartičky!'; $('doneText').textContent = n + ' kartiček. Zkuste teď kvíz.'; $('missed').innerHTML = ''; }
  else {
    var p = game.ok / n;
    $('trophy').textContent = p === 1 ? '🏆' : p >= .7 ? '🥇' : p >= .4 ? '👍' : '🌱';
    $('doneTitle').textContent = p === 1 ? 'Bez jediné chyby!' : p >= .7 ? 'Výborně!' : p >= .4 ? 'Dobrá práce!' : 'Příště to bude lepší!';
    $('doneText').textContent = 'Správně ' + game.ok + ' z ' + n + '.';
    $('missed').innerHTML = game.missed.length ? '<div style="width:100%;text-align:center;font-size:13px;color:#6e6e73">Procvičit:</div>' + game.missed.map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') : '';
  }
  $('bar').style.width = '100%'; show('done');
}
$('start').onclick = start; $('again').onclick = start;
$('home').onclick = function () { show('setup'); }; $('quit').onclick = function () { show('setup'); };
renderSetup();
