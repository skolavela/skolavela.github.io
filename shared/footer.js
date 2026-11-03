// Společná patička všech aplikací. Odkaz na zpětnou vazbu se nastavuje jen tady.
window.FEEDBACK_URL = 'https://tally.so/r/Qo1aeY';
(function () {
  var me = document.currentScript, note = me && me.getAttribute('data-note');
  var css = '.sv-foot{flex:none;text-align:center;font:12px/1.5 -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#6e6e73;padding:8px 16px calc(8px + env(safe-area-inset-bottom));display:flex;flex-wrap:wrap;justify-content:center;gap:6px 14px;align-items:center}.sv-foot .sv-note{flex-basis:100%}' +
    '.sv-foot a{color:#007aff;text-decoration:none}.sv-foot a:hover{text-decoration:underline}' +
    '.sv-foot .sv-fb{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;background:rgba(118,118,128,.12);color:#1d1d1f;padding:5px 12px;border-radius:980px}' +
    '.sv-foot .sv-fb:hover{text-decoration:none;filter:brightness(.97)}' +
    '@media (prefers-color-scheme:dark){.sv-foot.sv-auto{color:#a1a1a6}.sv-foot.sv-auto .sv-fb{color:#f5f5f7;background:rgba(118,118,128,.24)}}' +
    '@media print{.sv-foot{display:none!important}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function add() {
    var f = document.createElement('footer'); f.className = 'sv-foot' + (me && me.hasAttribute('data-auto-dark') ? ' sv-auto' : '');
    f.innerHTML = (note ? '<div class="sv-note">' + note + '</div>' : '') +
      '<a class="sv-fb" href="' + window.FEEDBACK_URL + '" target="_blank" rel="noopener">💬 Co nefunguje? Co by se hodilo? Napiš nám</a>' +
      '<div><a href="/">Školní aplikace</a> · skolavela.app</div>';
    document.body.appendChild(f);
  }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
