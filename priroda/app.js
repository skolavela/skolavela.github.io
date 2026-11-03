var $ = function (id) { return document.getElementById(id); };
var CATS = [
  { k: 'savci', n: 'Savci', e: '🦁', c: '#d9822b', s: [['selmy', 'Šelmy'], ['kopytnici', 'Kopytníci'], ['hlodavci', 'Hlodavci a zajíci'], ['primati', 'Primáti'], ['morsti', 'Mořští savci'], ['ostatni', 'Ostatní']] },
  { k: 'ptaci', n: 'Ptáci', e: '🐦', c: '#1f7ae0', s: [['dravci', 'Dravci a sovy'], ['pevci', 'Pěvci'], ['vodni', 'Vodní ptáci'], ['ostatni', 'Ostatní']] },
  { k: 'plazi', n: 'Plazi', e: '🦎', c: '#5b8c1a', s: [] },
  { k: 'obojzivelnici', n: 'Obojživelníci', e: '🐸', c: '#0f9d8a', s: [] },
  { k: 'ryby', n: 'Ryby', e: '🐟', c: '#0a84c6', s: [['sladkovodni', 'Sladkovodní'], ['morske', 'Mořské']] },
  { k: 'hmyz', n: 'Hmyz', e: '🦋', c: '#7a5af5', s: [['motyli', 'Motýli'], ['brouci', 'Brouci'], ['ostatni', 'Ostatní']] },
  { k: 'bezobratli', n: 'Bezobratlí', e: '🐌', c: '#b0527a', s: [['pavoukovci', 'Pavoukovci'], ['mekkysi', 'Měkkýši'], ['korysi', 'Korýši'], ['ostatni', 'Ostatní']] },
  { k: 'rostliny', n: 'Rostliny', e: '🌳', c: '#2e9e4f', s: [['listnate', 'Listnaté stromy'], ['jehlicnate', 'Jehličnany'], ['byliny', 'Byliny a květiny'], ['lecive', 'Léčivé'], ['jedovate', 'Jedovaté']] },
  { k: 'houby', n: 'Houby', e: '🍄', c: '#c2571a', s: [['jedle', 'Jedlé'], ['jedovate', 'Jedovaté'], ['nejedle', 'Nejedlé']] }];
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
var CONT_EM = { EU: '🏰', AS: '🏯', AF: '🦒', NA: '🦅', SA: '🦜', AU: '🦘', AN: '🐧', OC: '🌊' };
var openSubs = {};
function druhu(n) { return n + (n === 1 ? ' druh' : n >= 2 && n <= 4 ? ' druhy' : ' druhů'); }
function tile(on, data, em, name, n) {
  return '<button class="tile' + (on ? ' on' : '') + '" ' + data + (n ? '' : ' disabled') + '><span class="em">' + em + '</span><span class="tx"><span class="nm">' + name + '</span><span class="ct">' + druhu(n) + '</span></span><span class="ck">' + (on ? '✓' : '') + '</span></button>';
}
function renderSetup() {
  $('cats').innerHTML = CATS.map(function (c) { return tile(st.cats.indexOf(c.k) >= 0, 'data-k="' + c.k + '"', c.e, c.n, cnt(function (x) { return x.k === c.k; })); }).join('');
  var groups = CATS.filter(function (c) { return c.s.length && st.cats.indexOf(c.k) >= 0; }).map(function (c) {
    var subs = c.s.map(function (s) { return { s: s, n: cnt(function (x) { return x.k === c.k && x.s.indexOf(s[0]) >= 0; }) }; }).filter(function (o) { return o.n > 0; });
    return { c: c, subs: subs };
  }).filter(function (g) { return g.subs.length > 1; });
  $('subsWrap').hidden = !groups.length;
  $('subs').innerHTML = groups.map(function (g) {
    var on = g.subs.filter(function (o) { return subOn(g.c.k, o.s[0]); }).length;
    return '<details data-g="' + g.c.k + '"' + (openSubs[g.c.k] ? ' open' : '') + '><summary><span class="em">' + g.c.e + '</span><span class="nm">' + g.c.n + '</span><span class="st">' + (on === g.subs.length ? 'Vše' : on + ' z ' + g.subs.length) + '</span><span class="chev">›</span></summary><div class="sublist' + (g.subs.length % 3 !== 0 && g.subs.length % 2 === 0 ? ' c2' : '') + '">' +
      g.subs.map(function (o) { return '<button class="pill' + (subOn(g.c.k, o.s[0]) ? ' on' : '') + '" data-sub="' + g.c.k + ':' + o.s[0] + '"><span>' + o.s[1] + '</span><span class="n">' + o.n + '</span></button>'; }).join('') + '</div></details>';
  }).join('');
  Array.prototype.forEach.call($('subs').querySelectorAll('details'), function (d) { d.ontoggle = function () { openSubs[d.dataset.g] = d.open; }; });
  $('conts').innerHTML = CONTS.map(function (c) { return tile(st.conts.indexOf(c[0]) >= 0, 'data-c="' + c[0] + '"', CONT_EM[c[0]], c[1], cnt(function (x) { return x.c.indexOf(c[0]) >= 0; })); }).join('');
  $('allCats').textContent = st.cats.length ? 'Zrušit výběr' : 'Vybrat vše';
  $('allConts').textContent = st.conts.length ? 'Zrušit výběr' : 'Vybrat vše';
  ['lvl', 'mode', 'len'].forEach(function (g) { Array.prototype.forEach.call($(g).children, function (b) { b.classList.toggle('on', b.dataset.v === st[g]); }); });
  var n = pool().length;
  $('avail').innerHTML = n >= 4 ? 'Vybráno <b>' + druhu(n) + '</b>' : 'Vyberte aspoň 4 druhy';
  $('start').disabled = n < 4;
  save();
}
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
  var img = $('photo'), bg = $('photoBg'); img.classList.remove('ok'); bg.classList.remove('ok'); $('ph').textContent = 'Načítám fotku…'; $('ph').hidden = false;
  if (s.w) { img.width = s.w; img.height = s.h; }
  img.onload = function () { img.classList.add('ok'); bg.src = s.img; bg.classList.add('ok'); $('ph').hidden = true; };
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
  // 3 chybné možnosti: přednostně stejná podskupina, pak stejná skupina
  var others = SPECIES.filter(function (x) { return x.n !== s.n && x.k === s.k; });
  var sameSub = shuffle(others.filter(function (x) { return x.s.some(function (q) { return s.s.indexOf(q) >= 0; }) && (st.lvl === '2' || x.v === 1); }));
  var rest = shuffle(others.filter(function (x) { return sameSub.indexOf(x) < 0; }));
  var wrong = sameSub.concat(rest).slice(0, 3);
  if (wrong.length < 3) wrong = wrong.concat(shuffle(SPECIES.filter(function (x) { return x.k !== s.k; })).slice(0, 3 - wrong.length));
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
    '<div class="ct">' + c.e + ' ' + c.n + subName(s) + ' · ' + s.c.map(contName).join(', ') + '</div>';
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
