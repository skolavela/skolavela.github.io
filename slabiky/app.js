function gcEvent(name, title) { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: title || name, event: true }); } catch (e) {} }
const $ = id => document.getElementById(id);
const KEY = 'slabiky-v1';
const DEF = { title: 'Ukázkový text', text: 'Mladotice jsou malá vesnice. Děti tam chodí do školy a jsou snášenlivé a dobře informované.\nVe čtvrtek jsme viděli vlka, který překřikoval vítr. Pak jsme jeli autem do Brna.', size: 24, lh: 1.8, mode: 'bold', upper: false, lvl: '1' };
let st = Object.assign({}, DEF);
try { Object.assign(st, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
function renderText(text) {
  return text.split(/\n{1,}/).map(par => {
    const html = Syllab.tokenize(par).map(t => t.syl
      ? '<span class="w">' + t.syl.map((s, i) => `<span class="s${i % 2 ? '' : ' b'}">${esc(s)}</span>`).join('') + '</span>'
      : esc(t.t)).join('');
    return '<p>' + (html || '&nbsp;') + '</p>';
  }).join('');
}
function render() {
  $('outTitle').textContent = st.title;
  $('outText').innerHTML = renderText(st.text);
  const out = $('out'); out.style.fontSize = st.size + 'px'; out.style.lineHeight = st.lh;
  document.body.className = `is-app print-portrait m-${st.mode}` + (st.upper ? ' up' : '');
  $('upper').setAttribute('aria-checked', String(!!st.upper));
  $('sizeVal').textContent = st.size + ' px'; $('lhVal').textContent = (+st.lh).toFixed(1).replace('.', ',');
  for (const g of ['mode', 'lvl']) for (const b of $(g).children) b.setAttribute('aria-pressed', String(b.dataset.v === st[g]));
  try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
}
$('title').value = st.title; $('src').value = st.text; $('size').value = st.size; $('lh').value = st.lh;
$('title').oninput = e => { st.title = e.target.value; render(); };
let gcConv = 0;
$('src').oninput = e => { st.text = e.target.value; render(); clearTimeout(gcConv); gcConv = setTimeout(() => gcEvent('slabiky-convert', 'Slabiky: převod textu'), 3000); };
$('size').oninput = e => { st.size = +e.target.value; render(); };
$('lh').oninput = e => { st.lh = +e.target.value; render(); };
$('upper').onclick = () => { st.upper = !st.upper; render(); };
$('clear').onclick = () => { st.text = ''; $('src').value = ''; render(); $('src').focus(); };
for (const g of ['mode', 'lvl']) $(g).onclick = e => { const b = e.target.closest('button'); if (b && b.dataset.v) { st[g] = b.dataset.v; render(); } };
let lastText = -1;
$('rand').onclick = () => {
  const pool = TEXTS.map((t, i) => i).filter(i => String(TEXTS[i].l) === st.lvl && i !== lastText);
  lastText = pool[Math.floor(Math.random() * pool.length)];
  gcEvent('slabiky-random-text', 'Slabiky: náhodný text');
  const t = TEXTS[lastText]; st.title = t.t; st.text = t.x; $('title').value = t.t; $('src').value = t.x; render();
  if (window.matchMedia && matchMedia('(max-width:899px)').matches) $('sheet').scrollIntoView({ behavior: 'smooth', block: 'start' });
};
$('print').onclick = () => { gcEvent('slabiky-print', 'Slabiky: tisk'); window.print(); };
render();
