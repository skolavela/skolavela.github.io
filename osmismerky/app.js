var $ = function (id) { return document.getElementById(id); };
var KEY = 'osmismerky-v1';
var LV = { '1': { size: 10, count: 10, all8: false }, '2': { size: 15, count: 18, all8: true } };
var st = { lvl: '1', topic: 0, own: '', title: '', size: 10, count: 10, all8: false, dia: true, sol: false, seed: 1 };
try { var sv = JSON.parse(localStorage.getItem(KEY) || '{}'); for (var k in sv) st[k] = sv[k]; } catch (e) {}
if (!st.seed || st.seed === 1) st.seed = Math.floor(Math.random() * 1e6) + 1;
var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

TOPICS.forEach(function (t, i) { var o = document.createElement('option'); o.value = i; o.textContent = t.n; $('topic').appendChild(o); });

function words() {
  if (st.own.trim()) return st.own.split(/[\s,;]+/).filter(Boolean);
  var t = TOPICS[st.topic] || TOPICS[0];
  return st.lvl === '1' ? t.a : (t.b.length >= st.count ? t.b : t.b.concat(t.a));
}
function autoTitle() { return st.own.trim() ? 'Osmisměrka' : 'Osmisměrka – ' + (TOPICS[st.topic] || TOPICS[0]).n.toLowerCase(); }

function svg(res, withSol) {
  var n = res.size, c = 10, W = n * c, h = '';
  h += '<svg class="grid" viewBox="-0.6 -0.6 ' + (W + 1.2) + ' ' + (W + 1.2) + '" xmlns="http://www.w3.org/2000/svg">';
  h += '<rect x="0" y="0" width="' + W + '" height="' + W + '" fill="#fff" stroke="#000" stroke-width="0.9"/>';
  for (var i = 1; i < n; i++) h += '<line x1="' + i * c + '" y1="0" x2="' + i * c + '" y2="' + W + '" stroke="#000" stroke-width="0.3"/><line x1="0" y1="' + i * c + '" x2="' + W + '" y2="' + i * c + '" stroke="#000" stroke-width="0.3"/>';
  if (withSol) res.placed.forEach(function (p) {
    var len = Array.from(p.w).length - 1;
    var x1 = (p.x + .5) * c, y1 = (p.y + .5) * c, x2 = (p.x + p.dx * len + .5) * c, y2 = (p.y + p.dy * len + .5) * c;
    var L = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, hh = c * .78;
    h += '<rect x="' + ((x1 + x2) / 2 - L / 2 - hh / 2) + '" y="' + ((y1 + y2) / 2 - hh / 2) + '" width="' + (L + hh) + '" height="' + hh + '" rx="' + hh / 2 + '" fill="none" stroke="#000" stroke-width="0.9" transform="rotate(' + a + ' ' + (x1 + x2) / 2 + ' ' + (y1 + y2) / 2 + ')"/>';
  });
  var fs = c * .58;
  for (var y = 0; y < n; y++) for (var x = 0; x < n; x++)
    h += '<text x="' + (x * c + c / 2) + '" y="' + (y * c + c / 2) + '" font-size="' + fs + '" text-anchor="middle" dominant-baseline="central">' + esc(res.g[y][x]) + '</text>';
  return h + '</svg>';
}
function sheet(res, title, withSol) {
  return '<h2>' + esc(title) + (withSol ? ' – řešení' : '') + '</h2>' + svg(res, withSol) +
    '<div class="words">' + res.placed.map(function (p) { return '<span>' + esc(p.w) + '</span>'; }).join('') + '</div>' +
    '<div class="foot">skolavela.app</div>';
}
function render() {
  var res = Osm.generate({ words: words(), size: st.size, count: st.count, all8: st.all8, keepDia: st.dia, seed: st.seed });
  var title = st.title.trim() || autoTitle();
  $('sheet1').innerHTML = sheet(res, title, false);
  $('sheet2').innerHTML = sheet(res, title, true);
  document.body.classList.toggle('withsol', st.sol);
  $('title').placeholder = autoTitle();
  $('sizeVal').textContent = st.size + ' × ' + st.size; $('countVal').textContent = st.count;
  for (var b of $('lvl').children) b.classList.toggle('on', b.dataset.v === st.lvl);
  var info = 'Umístěno ' + res.placed.length + ' slov.';
  if (res.skipped.length) info += ' <b>Nevešlo se: ' + esc(res.skipped.join(', ')) + '.</b> Zvětšete mřížku nebo uberte slova.';
  $('info').innerHTML = info;
  try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
}
function sync() { $('topic').value = st.topic; $('own').value = st.own; $('title').value = st.title; $('size').value = st.size; $('count').value = st.count; $('all8').checked = st.all8; $('dia').checked = st.dia; $('sol').checked = st.sol; }
$('lvl').onclick = function (e) { var v = e.target.dataset.v; if (!v) return; st.lvl = v; st.size = LV[v].size; st.count = LV[v].count; st.all8 = LV[v].all8; sync(); render(); };
$('topic').onchange = function (e) { st.topic = +e.target.value; st.own = ''; $('own').value = ''; render(); };
$('own').oninput = function (e) { st.own = e.target.value; render(); };
$('clearOwn').onclick = function () { st.own = ''; $('own').value = ''; render(); };
$('title').oninput = function (e) { st.title = e.target.value; render(); };
$('size').oninput = function (e) { st.size = +e.target.value; render(); };
$('count').oninput = function (e) { st.count = +e.target.value; render(); };
['all8', 'dia', 'sol'].forEach(function (k) { $(k).onchange = function (e) { st[k] = e.target.checked; render(); }; });
$('regen').onclick = function () { st.seed = Math.floor(Math.random() * 1e9) + 1; render(); };
$('print').onclick = function () { window.print(); };
sync(); render();
