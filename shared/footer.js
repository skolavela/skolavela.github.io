// Společná patička všech aplikací. Odkaz na zpětnou vazbu se nastavuje jen tady.
window.FEEDBACK_URL = 'https://tally.so/r/Qo1aeY';
(function () {
  var me = document.currentScript, note = me && me.getAttribute('data-note');
  var css = '.sv-foot{flex:none;text-align:center;font:13px/1.45 -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,"Helvetica Neue",Arial,sans-serif;color:#8E8E93;padding:20px 32px calc(24px + env(safe-area-inset-bottom));display:flex;flex-direction:column;align-items:center;gap:10px;max-width:520px;margin:0 auto}' +
    '.sv-foot a{color:#007AFF;text-decoration:none}.sv-foot a:hover{text-decoration:underline}' +
    '.sv-foot .sv-fb{display:inline-flex;align-items:center;gap:5px;font-size:15px}.sv-foot svg{width:16px;height:16px;flex:none}' +
    '.sv-foot .sv-note a{color:inherit;text-decoration:underline;text-decoration-color:rgba(142,142,147,.5)}' +
    '@media (prefers-color-scheme:dark){.sv-foot.sv-auto{color:#8E8E93}.sv-foot.sv-auto a{color:#0A84FF}}' +
    '@media print{.sv-foot{display:none!important}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function add() {
    var f = document.createElement('footer'); f.className = 'sv-foot' + (me && me.hasAttribute('data-auto-dark') ? ' sv-auto' : '');
    f.innerHTML = (note ? '<div class="sv-note">' + note + '</div>' : '') +
      '<a class="sv-fb" href="' + window.FEEDBACK_URL + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-12 7l-6 2 2-5A8 8 0 1 1 21 12z"/></svg>Napsat připomínku</a>' +
      '<div><a href="/">Všechny aplikace</a> · skolavela.app</div>';
    document.body.appendChild(f);
  }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
