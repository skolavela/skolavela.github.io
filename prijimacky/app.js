// Přijímačky – aplikace
(function(){
const gcEvent=(n,t)=>{try{if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:n,title:t||n,event:true});}catch(e){}};
const PQ=window.PQ,$=s=>document.querySelector(s),app=$('#app'),pill=$('#pill');
const SUBJ={cj:{name:'Čeština',color:'#ff375f',full:60,fullN:30},ma:{name:'Matematika',color:'#5e5ce6',full:70,fullN:24}};
const KEY='prijimacky:v1';
let st=load();function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
st.p=st.p||{};st.sel=st.sel||{};st.subj=st.subj||'cj';st.mode=st.mode||'prac';st.len=st.len||'short';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const topics=s=>PQ.topics.filter(t=>t.subj===s);
const tById=id=>PQ.topics.find(t=>t.id===id);
const L='ABCDEFGH';
const praise=['Správně!','Výborně!','Přesně tak!','Paráda!','Super, sedí to!'];
const kind=['Tentokrát ne – a to je v pořádku.','Ještě ne. Mrkni na vysvětlení.','Skoro! Podívej se, kde to drhne.','Chyba je dobrá stopa – tady je proč:'];
function setColor(s){document.documentElement.style.setProperty('--sub',SUBJ[s].color);}
function rec(id,part){const p=st.p[id]||(st.p[id]={n:0,ok:0});p.n++;p.ok+=part;save();}

// výběr otázky z tématu: mix pevných a generovaných, bez opakování v rámci sezení
const used={};
function draw(t,exclude){
  const useGen=t.gens.length&&(!t.items.length||Math.random()<0.75);
  if(useGen)return prep(PQ.pick(t.gens)(),t);
  const u=used[t.id]||(used[t.id]=new Set());
  let pool=t.items.map((x,i)=>i).filter(i=>!u.has(i)&&!(exclude&&exclude.has(t.items[i])));
  if(!pool.length){u.clear();pool=t.items.map((x,i)=>i);}
  const i=PQ.pick(pool);u.add(i);return prep(t.items[i],t);
}
function prep(it,t){
  const q=Object.assign({},it,{topic:t.id,src:it});
  if(q.t==='mc'&&!q.keep){const idx=PQ.shuffle(q.o.map((x,i)=>i));q.o=idx.map(i=>it.o[i]);q.a=idx.indexOf(it.a);}
  return q;
}

/* ---------- úvod ---------- */
function home(){
  stopTimer();pill.hidden=true;setColor(st.subj);
  const ts=topics(st.subj);const sel=st.sel[st.subj]||(st.sel[st.subj]=ts.map(t=>t.id));
  const tested=ts.filter(t=>st.p[t.id]&&st.p[t.id].n);
  app.innerHTML=`
  <div class="intro"><h2>Ahoj! Na co se dnes podíváš?</h2><p>Procvičuj ve svém tempu. Chyby tu nikdo nepočítá proti tobě – jsou to stopy, které ukazují, co si zopakovat.</p></div>
  <div class="seg" id="subj">${Object.entries(SUBJ).map(([k,v])=>`<button data-v="${k}" class="${k===st.subj?'on':''}">${k==='cj'?'📖':'📏'} ${v.name}</button>`).join('')}</div>
  <div class="sh"><span>Témata a tvoje mapa pokroku</span><button class="tb" id="all">${sel.length===ts.length?'Zrušit výběr':'Vybrat vše'}</button></div>
  <div class="topics">${ts.map(t=>{const p=st.p[t.id];const pc=p&&p.n?Math.round(100*p.ok/p.n):null;
    return `<button class="tile ${sel.includes(t.id)?'on':''}" data-id="${t.id}"><span class="em">${t.emoji}</span><span class="tx"><span class="nm">${t.name}</span>
    <span class="meter"><i style="width:${pc||0}%"></i></span><span class="meta">${p&&p.n?`${pc} % z ${p.n} ${p.n===1?'otázky':'otázek'}`:'zatím neprocvičeno'}</span></span></button>`}).join('')}</div>
  ${tested.length?`<p class="note">💡 ${nextStep(ts)}</p>`:''}
  <div class="sh"><span>Režim</span></div>
  <div class="modes">
   <button class="mode ${st.mode==='prac'?'on':''}" data-m="prac"><b>🌱 Procvičování</b><span>Vybraná témata, hned vidíš vysvětlení. Skončíš, kdy chceš.</span></button>
   <button class="mode ${st.mode==='test'?'on':''}" data-m="test"><b>⏱️ Cvičný test</b><span>Mix témat jako u přijímaček, vyhodnocení na konci.</span></button>
  </div>
  <div id="testopts" ${st.mode==='test'?'':'hidden'} class="seg">
   <button data-l="short" class="${st.len==='short'?'on':''}">Krátký · 20 min</button>
   <button data-l="full" class="${st.len==='full'?'on':''}">Celý · ${SUBJ[st.subj].full} min</button>
   <button data-l="free" class="${st.len==='free'?'on':''}">Bez limitu</button>
  </div>
  <button class="primary" id="go" ${st.mode==='prac'&&!sel.length?'disabled':''}>${st.mode==='prac'?'Začít procvičovat':'Spustit test'}</button>
  ${Object.keys(st.p).length?'<button class="link center" id="reset">Vymazat uložený pokrok</button>':''}`;
  app.querySelectorAll('#subj button').forEach(b=>b.onclick=()=>{st.subj=b.dataset.v;save();home();});
  app.querySelectorAll('.tile').forEach(b=>b.onclick=()=>{const i=sel.indexOf(b.dataset.id);i<0?sel.push(b.dataset.id):sel.splice(i,1);save();home();});
  $('#all').onclick=()=>{st.sel[st.subj]=sel.length===ts.length?[]:ts.map(t=>t.id);save();home();};
  app.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{st.mode=b.dataset.m;save();home();});
  app.querySelectorAll('#testopts button').forEach(b=>b.onclick=()=>{st.len=b.dataset.l;save();home();});
  $('#go').onclick=()=>{if(st.mode==='prac'){gcEvent('prijimacky-practice-'+st.subj,'Přijímačky: procvičování '+SUBJ[st.subj].name);sel.forEach(id=>gcEvent('prijimacky-practice-topic-'+id,'Přijímačky: téma '+tById(id).name));practice(sel.slice());}else{gcEvent('prijimacky-test-start-'+st.subj+'-'+st.len,'Přijímačky: start testu '+SUBJ[st.subj].name+' ('+st.len+')');test();}};
  const r=$('#reset');if(r)r.onclick=()=>{if(confirm('Opravdu smazat uložený pokrok na tomto zařízení?')){st.p={};st.hist=[];save();home();}};
  window.scrollTo(0,0);
}
function nextStep(ts){
  const c=ts.map(t=>({t,p:st.p[t.id]})).filter(x=>x.p&&x.p.n>=3).sort((a,b)=>a.p.ok/a.p.n-b.p.ok/b.p.n);
  const un=ts.filter(t=>!st.p[t.id]);
  if(c.length&&c[0].p.ok/c[0].p.n<0.7)return `Tvůj možný další krok: téma <b>${c[0].t.name}</b> – tam se ti vyplatí trochu přidat.`;
  if(un.length)return `Zkus objevit téma <b>${un[0].name}</b>, ještě jsi ho neprocvičoval(a).`;
  return 'Ve všech tématech ti to jde. Zkus si cvičný test na čas.';
}

/* ---------- vykreslení otázky ---------- */
function renderQ(q,box,opts){ // opts: {instant, answer, onAnswer}
  const ans=opts.answer;
  let h='';if(q.p)h+=`<div class="passage">${q.p}</div>`;
  h+=`<p class="q">${q.q}</p>`;
  if(q.t==='mc')h+=`<div class="opts ${q.keep&&q.o.length===2&&q.o.every(o=>o.length<5)?'two':''}">${q.o.map((o,i)=>`<button class="opt" data-i="${i}"><span class="k">${L[i]}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
  if(q.t==='yn')h+=`<div class="yn">${q.s.map((s,i)=>`<div class="ynr" data-i="${i}"><p>${esc(s[0])}</p><div class="seg"><button data-v="1">ANO</button><button data-v="0">NE</button></div></div>`).join('')}</div>`;
  if(q.t==='num'||q.t==='txt')h+=`<div class="inp"><input id="inp" ${q.t==='num'?'inputmode="decimal"':''} autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${q.t==='num'?'Číslo, např. 3,5 nebo 3/4':'Napiš odpověď'}"></div>`;
  box.innerHTML=h;
  const cur={v:ans};
  if(q.t==='mc')box.querySelectorAll('.opt').forEach(b=>{if(cur.v===+b.dataset.i)b.classList.add('sel');b.onclick=()=>{cur.v=+b.dataset.i;box.querySelectorAll('.opt').forEach(x=>x.classList.toggle('sel',x===b));opts.onAnswer(cur.v,true);};});
  if(q.t==='yn'){cur.v=cur.v?cur.v.slice():q.s.map(()=>null);box.querySelectorAll('.ynr').forEach(r=>{const i=+r.dataset.i;r.querySelectorAll('button').forEach(b=>{if(cur.v[i]!==null&&cur.v[i]===!!+b.dataset.v)b.classList.add('on');b.onclick=()=>{cur.v[i]=!!+b.dataset.v;r.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));opts.onAnswer(cur.v.slice(),cur.v.every(x=>x!==null));};});});}
  if(q.t==='num'||q.t==='txt'){const i=box.querySelector('#inp');if(cur.v!=null)i.value=cur.v;i.oninput=()=>opts.onAnswer(i.value,i.value.trim()!=='');i.onkeydown=e=>{if(e.key==='Enter'&&opts.onEnter)opts.onEnter();};}
}
function correctText(q){
  if(q.t==='mc')return `${L[q.a]}) ${esc(q.o[q.a])}`;
  if(q.t==='num')return q.fr?esc(q.fr)+(Number.isInteger(q.a[0])?'':` (≈ ${PQ.fmt(Math.round(q.a[0]*1000)/1000)})`):PQ.fmt(q.a[0]);
  if(q.t==='txt')return esc(q.a.join(' / '));
  if(q.t==='yn')return q.s.map(s=>(s[1]?'ANO':'NE')).join(', ');
}
function markQ(q,box,ans){
  const r=PQ.check(q,ans);
  box.querySelectorAll('button,input').forEach(x=>x.disabled=true);
  if(q.t==='mc')box.querySelectorAll('.opt').forEach(b=>{const i=+b.dataset.i;b.classList.remove('sel');if(i===q.a)b.classList.add('right');else if(i===ans)b.classList.add('wrong');});
  if(q.t==='yn')box.querySelectorAll('.ynr').forEach(rw=>{const i=+rw.dataset.i;rw.classList.add(ans&&ans[i]===q.s[i][1]?'right':'wrong');});
  if(q.t==='num'||q.t==='txt')box.querySelector('#inp').classList.add(r.ok?'right':'wrong');
  return r;
}
function fbHtml(q,r,skipped){
  const head=r.ok?PQ.pick(praise):skipped?'Nevadí, tady je řešení.':(q.t==='yn'&&r.c?`${r.c} z ${q.s.length} tvrzení máš dobře.`:PQ.pick(kind));
  return `<div class="fb ${r.ok?'ok':'no'}"><b class="h">${r.ok?'✅':'💡'} ${head}</b>${r.ok?'':`Správně: <b>${correctText(q)}</b><br>`}${q.e}</div>`;
}

/* ---------- procvičování ---------- */
function practice(sel){
  const s={sel,n:0,ok:0,per:{},q:null};setColor(st.subj);
  const next=()=>{s.q=draw(tById(PQ.pick(sel)));s.ans=null;s.done=false;show();};
  const show=()=>{
    pill.hidden=false;pill.textContent=`Úloha ${s.n+1} · ${s.ok} správně`;
    const t=tById(s.q.topic);
    app.innerHTML=`<section class="card"><div class="ptop"><span class="tag">${t.emoji} ${t.name}</span><button class="link" id="end">Hotovo, ukázat shrnutí</button></div>
    <div id="qb"></div><div id="fb"></div>
    <div class="actions"><button class="ghost" id="skip">Nevím – ukaž řešení</button><button class="primary" id="chk" disabled>Zkontrolovat</button></div></section>`;
    const qb=$('#qb'),chk=$('#chk');
    const finish=(skipped)=>{if(s.done)return;s.done=true;const r=markQ(s.q,qb,skipped?null:s.ans);const part=skipped?0:r.part;
      s.n++;s.ok+=r.ok?1:0;const pt=s.per[t.id]||(s.per[t.id]={n:0,ok:0});pt.n++;pt.ok+=part;rec(t.id,part);
      $('#fb').innerHTML=fbHtml(s.q,r,skipped);$('#skip').hidden=true;chk.disabled=false;chk.textContent='Další otázka →';chk.onclick=next;
      pill.textContent=`Úloha ${s.n} · ${s.ok} správně`;chk.focus({preventScroll:true});$('#fb').scrollIntoView({behavior:'smooth',block:'nearest'});};
    renderQ(s.q,qb,{onAnswer:(v,ready)=>{s.ans=v;chk.disabled=!ready;if(s.q.t==='mc')finish(false);},onEnter:()=>{if(!chk.disabled)chk.click();}});
    chk.onclick=()=>finish(false);$('#skip').onclick=()=>finish(true);$('#end').onclick=()=>summary(s);
    window.scrollTo(0,0);
  };
  next();
}
function summary(s){
  pill.hidden=true;
  const rows=Object.entries(s.per).map(([id,p])=>({t:tById(id),p}));
  app.innerHTML=`<section class="card"><h2 class="center">Dobrá práce! 🌟</h2>
  ${s.n?`<p class="big" style="color:var(--sub)">${s.ok} / ${s.n}</p><p class="mut center">Dnes jsi zkusil(a) ${s.n} ${s.n<5?'otázky':'otázek'}. Každá z nich tě posunula dál.</p>
  <div class="bars">${rows.map(r=>bar(r.t.name,r.p)).join('')}</div>`:'<p class="mut center">Tentokrát bez otázek – nevadí, příště!</p>'}
  ${reflect()}
  <div class="row"><button class="ghost" id="home">Zpět na úvod</button><button class="primary" id="again">Pokračovat</button></div></section>`;
  $('#home').onclick=home;$('#again').onclick=()=>practice(s.sel);bindReflect();window.scrollTo(0,0);
}
const bar=(name,p)=>{const pc=p.n?Math.round(100*p.ok/p.n):0;return `<div class="b"><span>${name}</span><span class="meta">${pc} %</span><span class="meter"><i style="width:${pc}%"></i></span></div>`;};
function reflect(){return `<div class="sh"><span>Jak ti to šlo? (jen pro tebe)</span></div><div class="feel" id="feel"><button data-f="😊">😊 Šlo to</button><button data-f="🙂">🙂 Něco ano</button><button data-f="🤔">🤔 Zatím těžké</button></div>
  <textarea id="note" placeholder="Co si příště zopakuji? (nepovinné, uloží se jen v tomto zařízení)">${esc(st.note||'')}</textarea>`;}
function bindReflect(){app.querySelectorAll('#feel button').forEach(b=>b.onclick=()=>{app.querySelectorAll('#feel button').forEach(x=>x.classList.toggle('on',x===b));st.feel=b.dataset.f;save();});const n=$('#note');n.oninput=()=>{st.note=n.value;save();};}

/* ---------- cvičný test ---------- */
let timer=null;function stopTimer(){if(timer){clearInterval(timer);timer=null;}}
function buildTest(subj,n){
  const ts=topics(subj);const qs=[];const per=Math.floor(n/ts.length);let rest=n-per*ts.length;
  const counts=ts.map(()=>per);while(rest-->0)counts[PQ.ri(0,ts.length-1)]++;
  ts.forEach((t,i)=>{
    if(t.id==='text'&&counts[i]){ // otázky k jednomu (nebo dvěma) textům pohromadě
      const byP={};t.items.forEach(it=>{if(it.p)(byP[it.p]=byP[it.p]||[]).push(it);});
      const ps=PQ.shuffle(Object.keys(byP));let k=counts[i];
      for(const p of ps){if(k<=0)break;const take=PQ.shuffle(byP[p]).slice(0,Math.min(k,5));take.forEach(it=>qs.push(prep(it,t)));k-=take.length;}
    }else{const ex=new Set();for(let j=0;j<counts[i];j++){const q=draw(t,ex);ex.add(q.src);qs.push(q);}}
  });
  return qs;
}
function test(){
  const subj=st.subj,len=st.len,S=SUBJ[subj];
  const n=len==='full'?S.fullN:12,mins=len==='full'?S.full:len==='short'?20:0;
  const T={subj,qs:buildTest(subj,n),ans:[],i:0,end:mins?Date.now()+mins*60000:0,start:Date.now(),hideT:false};
  setColor(subj);
  const tick=()=>{const done=`${T.ans.filter(a=>a!=null).length} z ${T.qs.length}`;if(!T.end){pill.textContent=done;return;}
    const left=Math.max(0,T.end-Date.now());const m=Math.floor(left/60000),s=Math.floor(left/1000)%60;
    pill.textContent=done+' · '+(T.hideT?'⏱️ skrytý':`⏱️ ${m}:${String(s).padStart(2,'0')}`);
    if(left<=0){stopTimer();results(T,true);}};
  pill.hidden=false;pill.onclick=()=>{T.hideT=!T.hideT;tick();};
  stopTimer();timer=setInterval(tick,1000);tick();
  const show=()=>{
    const q=T.qs[T.i],t=tById(q.topic);
    app.innerHTML=`<section class="card"><div class="prog"><i style="width:${100*(T.i+1)/T.qs.length}%"></i></div>
    <div class="ptop"><span>Úloha ${T.i+1} z ${T.qs.length}</span><span class="tag">${t.emoji} ${t.name}</span></div>
    <div id="qb"></div>
    <div class="actions"><button class="ghost" id="prev" ${T.i?'':'disabled'}>‹ Zpět</button><button class="primary" id="nx">${T.i<T.qs.length-1?'Další ›':'Odevzdat test'}</button></div>
    <div class="grid">${T.qs.map((x,i)=>`<button data-i="${i}" class="${T.ans[i]!=null?'done':''} ${i===T.i?'cur':''}">${i+1}</button>`).join('')}</div>
    <button class="link" id="sub">Odevzdat test a vyhodnotit</button></section>
    <p class="note">${mins?'Čas můžeš skrýt klepnutím na stopky nahoře. ':''}K úlohám se můžeš libovolně vracet. Vyhodnocení uvidíš až na konci.</p>`;
    renderQ(q,$('#qb'),{answer:T.ans[T.i],onAnswer:(v,ready)=>{T.ans[T.i]=ready?v:null;const g=app.querySelector(`.grid button[data-i="${T.i}"]`);g.classList.toggle('done',ready);tick();},onEnter:()=>$('#nx').click()});
    $('#prev').onclick=()=>{T.i--;show();};
    $('#nx').onclick=()=>{if(T.i<T.qs.length-1){T.i++;show();}else submit();};
    app.querySelectorAll('.grid button').forEach(b=>b.onclick=()=>{T.i=+b.dataset.i;show();});
    $('#sub').onclick=submit;window.scrollTo(0,0);
  };
  const submit=()=>{const miss=T.qs.length-T.ans.filter(a=>a!=null).length;if(miss&&!confirm(`Bez odpovědi ${miss===1?'zůstala 1 úloha':`zůstává ${miss} úloh`}. Chceš test přesto odevzdat?`))return;results(T,false);};
  show();
}
function results(T,timeUp){
  stopTimer();pill.hidden=true;pill.onclick=null;gcEvent('prijimacky-test-finish-'+T.subj+(timeUp?'-timeup':''),'Přijímačky: dokončen test '+SUBJ[T.subj].name);
  let pts=0;const per={};const rs=T.qs.map((q,i)=>{const r=PQ.check(q,T.ans[i]);const t=q.topic;const p=per[t]||(per[t]={n:0,ok:0});p.n++;p.ok+=r.part;pts+=r.part;rec(t,r.part);return r;});
  const pc=Math.round(100*pts/T.qs.length);const mins=Math.round((Date.now()-T.start)/60000);
  st.hist=(st.hist||[]).concat([{d:Date.now(),s:T.subj,pc}]).slice(-30);save();
  const prev=st.hist.filter(h=>h.s===T.subj).slice(-2,-1)[0];
  const rows=Object.entries(per).map(([id,p])=>({t:tById(id),p})).sort((a,b)=>b.p.ok/b.p.n-a.p.ok/a.p.n);
  const good=rows.filter(r=>r.p.ok/r.p.n>=0.7).map(r=>r.t.name),work=rows.filter(r=>r.p.ok/r.p.n<0.7).map(r=>r.t.name);
  const wrong=T.qs.map((q,i)=>({q,i,r:rs[i]})).filter(x=>!x.r.ok);
  app.innerHTML=`<section class="card">${timeUp?'<p class="note center">⏱️ Čas vypršel – tvoje odpovědi jsme uložili a vyhodnotili.</p>':''}
  <h2 class="center">Hotovo! Tady je tvoje zpětná vazba</h2>
  <p class="big" style="color:var(--sub)">${PQ.fmt(Math.round(pts*10)/10)} / ${T.qs.length}</p>
  <p class="mut center">${pc} % · ${mins} min${prev?` · minule ${prev.pc} %${pc>prev.pc?' – posun vpřed! 🚀':''}`:''}</p>
  ${good.length?`<p class="fb ok"><b class="h">💪 Co ti jde</b>${good.join(', ')}</p>`:''}
  ${work.length?`<p class="fb no"><b class="h">🧭 Tvůj další krok</b>Procvič si: ${work.join(', ')}. Klidně v režimu Procvičování, ve svém tempu.</p>`:''}
  <div class="sh"><span>Podle témat</span></div><div class="bars">${rows.map(r=>bar(`${r.t.emoji} ${r.t.name}`,r.p)).join('')}</div>
  ${reflect()}
  <div class="row"><button class="ghost" id="home">Zpět na úvod</button>${work.length?'<button class="primary" id="pr">Procvičit slabší témata</button>':''}</div></section>
  ${wrong.length?`<section class="card"><h3>Projdi si úlohy, které zatím nesedly (${wrong.length})</h3><div class="rev">${wrong.map(x=>`<div class="rv"><div class="meta">Úloha ${x.i+1} · ${tById(x.q.topic).name}</div><p class="q">${x.q.q}</p>
   <div>Tvoje odpověď: <b>${answerText(x.q,T.ans[x.i])}</b></div>${fbHtml(x.q,x.r,T.ans[x.i]==null).replace(/<b class="h">.*?<\/b>/,'')}</div>`).join('')}</div></section>`:'<p class="note center">Všechny úlohy máš správně. Skvělé! 🎉</p>'}`;
  $('#home').onclick=home;const p=$('#pr');if(p)p.onclick=()=>practice(rows.filter(r=>r.p.ok/r.p.n<0.7).map(r=>r.t.id));bindReflect();window.scrollTo(0,0);
}
function answerText(q,a){if(a==null)return 'bez odpovědi';if(q.t==='mc')return `${L[a]}) ${esc(q.o[a])}`;if(q.t==='yn')return a.map(x=>x===null?'–':x?'ANO':'NE').join(', ');return esc(a);}
home();
})();
