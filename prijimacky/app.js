// Nanečisto (dříve Přijímačky) – aplikace
(function(){
const gcEvent=(n,t)=>{try{if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:n,title:t||n,event:true});}catch(e){}};
const PQ=window.PQ,$=s=>document.querySelector(s),app=$('#app'),pill=$('#pill');
const SUBJ={cj:{name:'Čeština',color:'#007AFF',full:60,fullN:30},ma:{name:'Matematika',color:'#007AFF',full:70,fullN:24}};

const IC={
 pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
 type:'<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
 puzzle:'<path d="M4 4h6v3a2 2 0 1 0 4 0V4h6v6h-3a2 2 0 1 0 0 4h3v6H4z"/>',
 doc:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h5"/>',
 shuffle:'<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="M4 4l5 5"/>',
 feather:'<path d="M20 4c-6 0-12 4-12 12v4"/><path d="M8 16c6 0 10-4 12-12"/><path d="M4 20 8 16"/>',
 hash:'<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
 calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
 scale:'<path d="M12 3v18M5 21h14M3 7h18"/><path d="m6 7-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
 chat:'<path d="M21 12a8 8 0 0 1-12 7l-6 2 2-5A8 8 0 1 1 21 12z"/>',
 ruler:'<path d="M3 21 21 3"/><path d="M3 21V9l12 12z"/>',
 cube:'<path d="m12 2 9 5v10l-9 5-9-5V7z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
 chart:'<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/>',
 book:'<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
 sigma:'<path d="M18 4H6l6 8-6 8h12"/>',
 leaf:'<path d="M11 20A7 7 0 0 1 4 13c0-6 6-9 16-9 0 10-3 16-9 16z"/><path d="M4 20c4-6 8-9 12-11"/>',
 timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 bulb:'<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z"/>',
 check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
 x:'<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
 chev:'<path d="m9 6 6 6-6 6"/>',
 tick:'<path d="m5 12 5 5 9-10"/>',
 grip:'<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
 undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
};
const ic=(n,c)=>`<svg class="ic ${c||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]||''}</svg>`;
const tic=t=>ic(t.icon||'doc');
const KEY='prijimacky:v1';
let st=load();function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
st.p=st.p||{};if(!st.v2){st.p={};st.sel={};st.v2=1;}st.sel=st.sel||{};st.subj=st.subj||'cj';st.mode=st.mode||'prac';st.len=st.len||'short';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ORDER=PQ.topics.map(t=>t.id);
const topics=s=>PQ.topics.filter(t=>t.subj===s).sort((a,b)=>(ORDER.indexOf(a.id)+1||99)-(ORDER.indexOf(b.id)+1||99));
const tById=id=>PQ.topics.find(t=>t.id===id);
const L='ABCDEFGH';
const praise=['Správně'];
const kind=['Nesprávně'];
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
  if(q.t==='ord')q.pool=PQ.shuffle(it.parts.map((x,i)=>i).slice(1));
  return q;
}

function slotList(subj){const bp=PQ.BP[subj];if(!bp)return [];const seen=[];bp.full.forEach(k=>{if(!seen.includes(k))seen.push(k);});let n=1;seen.forEach(k=>{const sl=PQ.SLOTS[k];if(!sl.pts){const o=[].concat(sl.gen());sl.pts=o.reduce((a,t)=>a+PQ.taskMax(t),0);sl.count=o.length;}const c=sl.count;sl.label=c>1?`${n}–${n+c-1}`:String(n);n+=c;});return seen;}
/* ---------- úvod ---------- */
function home(){
  stopTimer();pill.hidden=true;setColor(st.subj);
  const ts=topics(st.subj);const sel=st.sel[st.subj]=(st.sel[st.subj]||ts.map(t=>t.id)).filter(id=>tById(id));
  if(st.mode==='slot'){st.mode='prac';st.by='slot';}const byS=st.by==='slot';
  const pcOf=p=>p&&p.n?Math.round(100*p.ok/p.n):null;
  const prog=pc=>`<span class="meter"><i style="width:${pc||0}%"></i></span>`;
  const topicsHtml=()=>`<div class="gh"><span>Témata</span><button class="tb" id="all">${sel.length===ts.length?'Zrušit':'Vybrat vše'}</button></div>
  <div class="list">${ts.map(t=>{const pc=pcOf(st.p[t.id]);const on=sel.includes(t.id);
    return `<button class="row-i tile ${on?'on':''}" data-id="${t.id}"><span class="lic">${tic(t)}</span><span class="tx"><span class="nm">${t.name}</span>${prog(pc)}</span><span class="val">${pc!=null?pc+' %':'–'}</span><span class="chk">${on?ic('tick'):''}</span></button>`}).join('')}</div>`;
  const slotsHtml=()=>`<div class="gh"><span>Úlohy</span></div><div class="list">${slotList(st.subj).map(k=>{const sl=PQ.SLOTS[k];const pc=pcOf(st.p['slot:'+k]);const on=st.slot===k;
    return `<button class="row-i slotb ${on?'on':''}" data-k="${k}"><span class="sn">${sl.label||''}</span><span class="tx"><span class="nm">${esc(sl.name)}</span>${prog(pc)}</span><span class="val">${pc!=null?pc+' %':(sl.pts?PQ.fmt(sl.pts)+' b':'')}</span><span class="chk">${on?ic('tick'):''}</span></button>`;}).join('')}</div>`;
  app.innerHTML=`
  <div class="c-seg" id="subj">${Object.entries(SUBJ).map(([k,v])=>`<button data-v="${k}" class="${k===st.subj?'on':''}">${v.name}</button>`).join('')}</div>
  <div class="list">
   <button class="row-i mode ${st.mode==='prac'?'on':''}" data-m="prac"><span class="lic">${ic('leaf')}</span><span class="tx"><span class="nm">Procvičování</span><span class="meta">S nápovědou a vysvětlením</span></span><span class="chk">${st.mode==='prac'?ic('tick'):''}</span></button>
   <button class="row-i mode ${st.mode==='test'?'on':''}" data-m="test"><span class="lic">${ic('timer')}</span><span class="tx"><span class="nm">Cvičný test</span><span class="meta">Jako u přijímaček, 50 bodů</span></span><span class="chk">${st.mode==='test'?ic('tick'):''}</span></button>
  </div>
  ${st.mode==='prac'?`<div class="c-seg" id="by"><button data-b="topic" class="${byS?'':'on'}">Podle tématu</button><button data-b="slot" class="${byS?'on':''}">Podle čísla úlohy</button></div>`:''}
  ${st.mode==='prac'&&!byS?topicsHtml():''}
  ${st.mode==='prac'&&byS?slotsHtml():''}
  <div id="testopts" ${st.mode==='test'?'':'hidden'} class="c-seg">
   <button data-l="short" class="${st.len==='short'?'on':''}">${PQ.BP[st.subj]?PQ.BP[st.subj].mins.short:20} min</button>
   <button data-l="full" class="${st.len==='full'?'on':''}">${SUBJ[st.subj].full} min</button>
   <button data-l="free" class="${st.len==='free'?'on':''}">Bez limitu</button>
  </div>
  <button class="c-btn c-btn--primary" id="go" ${(st.mode==='prac'&&!byS&&!sel.length)||(st.mode==='prac'&&byS&&!(st.slot&&PQ.SLOTS[st.slot]&&PQ.SLOTS[st.slot].subj===st.subj))?'disabled':''}>${st.mode==='prac'?'Začít':'Spustit test'}</button>
  <p class="foot">Pokrok se ukládá jen v tomto zařízení.${Object.keys(st.p).length?' <button class="tb" id="reset">Vymazat</button>':''}</p>`;
  app.querySelectorAll('#subj button').forEach(b=>b.onclick=()=>{st.subj=b.dataset.v;save();home();});
  app.querySelectorAll('.tile').forEach(b=>b.onclick=()=>{const i=sel.indexOf(b.dataset.id);i<0?sel.push(b.dataset.id):sel.splice(i,1);save();home();});
  app.querySelectorAll('#by button').forEach(b=>b.onclick=()=>{st.by=b.dataset.b;save();home();});const al=$('#all');if(al)al.onclick=()=>{st.sel[st.subj]=sel.length===ts.length?[]:ts.map(t=>t.id);save();home();};
  app.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{st.mode=b.dataset.m;save();home();});
  app.querySelectorAll('#testopts button').forEach(b=>b.onclick=()=>{st.len=b.dataset.l;save();home();});
  app.querySelectorAll('.slotb').forEach(b=>b.onclick=()=>{st.slot=b.dataset.k;save();home();});
  $('#go').onclick=()=>{if(st.mode==='prac'&&byS){gcEvent('prijimacky-slot-'+st.slot,'Přijímačky: úloha '+PQ.SLOTS[st.slot].name);slotPractice(st.slot);return;}if(st.mode==='prac'){gcEvent('prijimacky-practice-'+st.subj,'Přijímačky: procvičování '+SUBJ[st.subj].name);sel.forEach(id=>gcEvent('prijimacky-practice-topic-'+id,'Přijímačky: téma '+tById(id).name));practice(sel.slice());}else{gcEvent('prijimacky-test-start-'+st.subj+'-'+st.len,'Přijímačky: start testu '+SUBJ[st.subj].name+' ('+st.len+')');PQ.BP[st.subj]?examTest():test();}};
  const r=$('#reset');if(r)r.onclick=()=>{if(confirm('Smazat uložený pokrok?')){st.p={};st.hist=[];save();home();}};
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
  if(q.t==='mc')h+=`<div class="opts ${q.keep&&q.o.length===2&&q.o.every(o=>o.length<5)?'two':''}">${q.o.map((o,i)=>`<button class="a-choice opt" data-i="${i}"><span class="k">${L[i]}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
  if(q.t==='yn')h+=`<div class="yn">${q.s.map((s,i)=>`<div class="ynr" data-i="${i}"><p>${esc(s[0])}</p><div class="c-seg"><button data-v="1">ANO</button><button data-v="0">NE</button></div></div>`).join('')}</div>`;
  if(q.t==='num'||q.t==='txt')h+=`<div class="inp"><input class="c-input" id="inp" ${q.t==='num'?'inputmode="decimal"':''} autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${q.t==='num'?'Číslo, např. 3,5 nebo 3/4':'Napiš odpověď'}"></div>`;
  if(q.t==='err')h+=`<div class="etext">${PQ.tokenize(q.w).map((t,i)=>`<button class="tok" data-i="${i}">${esc(t.w)}</button>`).join(' ')}</div>`;
  if(q.t==='ord')h+=`<div class="ord"><div class="part fixed"><span class="k">1</span><span>${esc(q.parts[0])}</span></div><div id="seq"></div><div class="sh"><span>Další část</span><span><button class="tb" id="undo">Zpět</button> &nbsp; <button class="tb" id="clr">Znovu</button></span></div><div id="pool"></div></div>`;
  box.innerHTML=h;
  const cur={v:ans};
  if(q.t==='err'){cur.v=new Set(ans||[]);box.querySelectorAll('.tok').forEach(b=>{const i=+b.dataset.i;b.classList.toggle('sel',cur.v.has(i));b.onclick=()=>{cur.v.has(i)?cur.v.delete(i):cur.v.add(i);b.classList.toggle('sel');opts.onAnswer([...cur.v].sort((a,b)=>a-b),cur.v.size>0);};});}
  if(q.t==='ord'){cur.v=(ans||[]).slice();const n=q.parts.length-1;
    const draw=()=>{const seq=box.querySelector('#seq'),pool=box.querySelector('#pool');
      seq.innerHTML=cur.v.map((pi,k)=>`<div class="part" draggable="true" data-k="${k}"><span class="k">${k+2}</span><span>${esc(q.parts[pi])}</span><span class="grip">${ic('grip')}</span></div>`).join('');
      pool.innerHTML=q.pool.filter(pi=>!cur.v.includes(pi)).map(pi=>`<button class="part pick" data-p="${pi}"><span class="k">+</span><span>${esc(q.parts[pi])}</span></button>`).join('')||'<p class="meta center">Hotovo. Pořadí změníš přetažením.</p>';
      pool.querySelectorAll('.pick').forEach(b=>b.onclick=()=>{cur.v.push(+b.dataset.p);draw();emit();});
      let drag=null;seq.querySelectorAll('.part').forEach(el=>{el.ondragstart=e=>{drag=+el.dataset.k;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain','x');}catch(_){}};
        el.ondragover=e=>{e.preventDefault();el.classList.add('over');};el.ondragleave=()=>el.classList.remove('over');
        el.ondrop=e=>{e.preventDefault();const to=+el.dataset.k;if(drag!==null&&drag!==to){const [m]=cur.v.splice(drag,1);cur.v.splice(to,0,m);draw();emit();}};});};
    const emit=()=>opts.onAnswer(cur.v.slice(),cur.v.length===n);
    box.querySelector('#undo').onclick=()=>{cur.v.pop();draw();emit();};box.querySelector('#clr').onclick=()=>{cur.v=[];draw();emit();};
    draw();}
  if(q.t==='mc')box.querySelectorAll('.opt').forEach(b=>{if(cur.v===+b.dataset.i)b.classList.add('sel');b.onclick=()=>{cur.v=+b.dataset.i;box.querySelectorAll('.opt').forEach(x=>x.classList.toggle('sel',x===b));opts.onAnswer(cur.v,true);};});
  if(q.t==='yn'){cur.v=cur.v?cur.v.slice():q.s.map(()=>null);box.querySelectorAll('.ynr').forEach(r=>{const i=+r.dataset.i;r.querySelectorAll('button').forEach(b=>{if(cur.v[i]!==null&&cur.v[i]===!!+b.dataset.v)b.classList.add('on');b.onclick=()=>{cur.v[i]=!!+b.dataset.v;r.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));opts.onAnswer(cur.v.slice(),cur.v.every(x=>x!==null));};});});}
  if(q.t==='num'||q.t==='txt'){const i=box.querySelector('#inp');if(cur.v!=null)i.value=cur.v;i.oninput=()=>opts.onAnswer(i.value,i.value.trim()!=='');i.onkeydown=e=>{if(e.key==='Enter'&&opts.onEnter)opts.onEnter();};}
}
function correctText(q){
  if(q.t==='mc')return `${L[q.a]}) ${esc(q.o[q.a])}`;
  if(q.t==='num')return q.fr?esc(q.fr)+(Number.isInteger(q.a[0])?'':` (≈ ${PQ.fmt(Math.round(q.a[0]*1000)/1000)})`):PQ.fmt(q.a[0]);
  if(q.t==='txt')return esc(q.a.join(' / '));
  if(q.t==='yn')return q.s.map(s=>(s[1]?'ANO':'NE')).join(', ');
  if(q.t==='err')return '<br>'+esc(PQ.tokenize(q.w).map(t=>t.r!==undefined?t.r:t.w).join(' '));
  if(q.t==='ord')return '<ol class="olist">'+q.parts.map(p=>`<li>${esc(p)}</li>`).join('')+'</ol>';
}
function markQ(q,box,ans){
  const r=PQ.check(q,ans);
  box.querySelectorAll('button,input').forEach(x=>x.disabled=true);
  if(q.t==='mc')box.querySelectorAll('.opt').forEach(b=>{const i=+b.dataset.i;b.classList.remove('sel');if(i===q.a)b.classList.add('right');else if(i===ans)b.classList.add('wrong');});
  if(q.t==='yn')box.querySelectorAll('.ynr').forEach(rw=>{const i=+rw.dataset.i;rw.classList.add(ans&&ans[i]===q.s[i][1]?'right':'wrong');});
  if(q.t==='num'||q.t==='txt')box.querySelector('#inp').classList.add(r.ok?'right':'wrong');
  if(q.t==='err'){const tk=PQ.tokenize(q.w);const A=new Set(ans||[]);box.querySelectorAll('.tok').forEach(b=>{const i=+b.dataset.i,t=tk[i];b.classList.remove('sel');
    if(t.r!==undefined){b.classList.add(A.has(i)?'right':'miss');b.innerHTML=`<s>${esc(t.w)}</s> ${esc(t.r)}`;}else if(A.has(i))b.classList.add('fp');});}
  if(q.t==='ord'){box.querySelectorAll('#seq .part').forEach((el,k)=>{el.draggable=false;el.classList.add(ans&&ans[k]===k+1?'right':'wrong');});const tb=box.querySelector('.ord .sh');if(tb)tb.remove();const pl=box.querySelector('#pool');if(pl)pl.innerHTML='';}
  return r;
}
function fbHtml(q,r,skipped){
  const head=r.ok?PQ.pick(praise):skipped?'Řešení':(q.t==='yn'&&r.c?`${r.c} z ${q.s.length} tvrzení máš dobře.`:q.t==='err'&&r.c?`Našel/našla jsi ${r.c} z ${PQ.tokenize(q.w).filter(t=>t.r!==undefined).length} chyb${r.fp?` (a ${r.fp}× jsi označil(a) správné slovo)`:''}.`:PQ.pick(kind));
  return `<div class="fb ${r.ok?'ok':'no'}"><b class="h">${ic(r.ok?'check':'x')} ${head}</b>${r.ok?'':`Správně: <b>${correctText(q)}</b>${q.t==='ord'?'':'<br>'}`}${q.e}</div>`;
}

/* ---------- procvičování ---------- */
function pickTask(sel){ // úloha z vybraných okruhů; u smíšené matematiky držíme podíl grafických úloh jako u CERMAT
  const pool=[];sel.forEach(id=>tById(id).slots.forEach(k=>pool.push([k,id])));
  const mixed=st.subj==='ma'&&sel.length>1;const wantFig=Math.random()<PQ.FIGSHARE;let out,pk;
  for(let i=0;i<40;i++){pk=PQ.pick(pool);out=[].concat(PQ.SLOTS[pk[0]].gen());if(!mixed||PQ.isFig(out[0])===wantFig)break;}
  const shared=out.length>1?`1–${out.length}`:'';out.forEach((t,i)=>{t.no=i+1;t.slot=pk[0];t.topic=pk[1];t.sname=t.sname||PQ.SLOTS[pk[0]].name;if(shared)t.shared=shared;t.subs.forEach((x,k)=>x.id=t.subs.length>1?`${t.no}.${k+1}`:`${t.no}`);});
  return out;}
function practice(sel){
  const s={sel,pts:0,max:0,n:0,queue:[],per:{}};setColor(st.subj);
  const next=()=>{if(!s.queue.length)s.queue=pickTask(sel);s.t=s.queue.shift();s.ans={};s.done=false;show();};
  const show=()=>{const t=s.t,tp=tById(t.topic);pill.hidden=false;pill.textContent=`${s.n} ${plural(s.n,'úloha','úlohy','úloh')} · ${PQ.fmt(s.pts)} / ${PQ.fmt(s.max)} b`;
    setTitle(tp.name);app.innerHTML=`<section class="a-card"><div class="ptop"><span class="tag"></span><button class="link" id="end">Hotovo</button></div><div id="tb"></div>
    <div id="hb"></div><div class="actions"><button class="c-btn c-btn--secondary" id="skip">Ukázat řešení</button><button class="c-btn c-btn--primary" id="chk" disabled>Zkontrolovat</button></div>
    ${PQ.HINTS[t.slot]?'<button class="link center" id="hint">'+ic('bulb')+' Nápověda</button>':''}</section>`;
    const tb=$('#tb'),chk=$('#chk');renderTask(t,tb,s.ans,a=>{chk.disabled=!taskDone(t,a);});
    const h=$('#hint');if(h)h.onclick=()=>{$('#hb').innerHTML=`<p class="tnote">${PQ.HINTS[t.slot]}</p>`;h.remove();};
    const finish=sk=>{if(s.done)return;s.done=true;const R=markTask(t,tb,s.ans,sk);s.pts+=R.pts;s.max+=R.max;s.n++;rec(t.topic,R.pts/R.max);
      const pt=s.per[t.topic]||(s.per[t.topic]={n:0,ok:0});pt.n++;pt.ok+=R.pts/R.max;
      $('#skip').hidden=true;const hh=$('#hint');if(hh)hh.remove();chk.disabled=false;chk.textContent=s.queue.length?'Další k textu':'Další úloha';chk.onclick=next;
      pill.textContent=`${s.n} ${plural(s.n,'úloha','úlohy','úloh')} · ${PQ.fmt(s.pts)} / ${PQ.fmt(s.max)} b`;const f=tb.querySelector('.sfb .fb');if(f)f.scrollIntoView({behavior:'smooth',block:'nearest'});};
    chk.onclick=()=>finish(false);$('#skip').onclick=()=>finish(true);$('#end').onclick=()=>summary(s);window.scrollTo(0,0);};
  next();
}
function summary(s){
  setTitle('Shrnutí');pill.hidden=true;const rows=Object.entries(s.per).map(([id,p])=>({t:tById(id),p}));
  app.innerHTML=`<section class="a-card">
  ${s.n?`<p class="big">${PQ.fmt(s.pts)} / ${PQ.fmt(s.max)} b</p><p class="mut center">${s.n} ${plural(s.n,'úloha','úlohy','úloh')}</p>
  <div class="bars">${rows.map(r=>bar(r.t.name,r.p)).join('')}</div>`:'<p class="mut center">Žádné úlohy.</p>'}
  ${reflect()}<div class="row"><button class="c-btn c-btn--secondary" id="home">Úvod</button><button class="c-btn c-btn--primary" id="again">Pokračovat</button></div></section>`;
  $('#home').onclick=home;$('#again').onclick=()=>practice(s.sel);bindReflect();window.scrollTo(0,0);
}
const bar=(name,p)=>{const pc=p.n?Math.round(100*p.ok/p.n):0;return `<div class="b"><span>${name}</span><span class="meta">${pc} %</span><span class="meter"><i style="width:${pc}%"></i></span></div>`;};
function reflect(){return `<div class="sh"><span>Jak to šlo</span></div><div class="c-seg" id="feel"><button data-f="ok">Šlo to</button><button data-f="mid">Částečně</button><button data-f="hard">Těžké</button></div>
  <textarea class="c-input" id="note" placeholder="Poznámka pro příště">${esc(st.note||'')}</textarea>`;}
function bindReflect(){app.querySelectorAll('#feel button').forEach(b=>b.onclick=()=>{app.querySelectorAll('#feel button').forEach(x=>x.classList.toggle('on',x===b));st.feel=b.dataset.f;save();});const n=$('#note');n.oninput=()=>{st.note=n.value;save();};}

/* ---------- cvičný test ---------- */
let timer=null;function stopTimer(){if(timer){clearInterval(timer);timer=null;}}
function buildTest(subj,n){
  const ts=topics(subj);const qs=[];let counts;
  const W={full:{pravopis:6,chyby:5,text:8,razeni:3,zasoba:4,tvaroslovi:2,skladba:2,lit:0},short:{pravopis:3,chyby:2,text:3,razeni:1,zasoba:1,tvaroslovi:1,skladba:1,lit:0}};
  if(subj==='cj'){const w=W[n>=30?'full':'short'];counts=ts.map(t=>w[t.id]||0);}
  else{const per=Math.floor(n/ts.length);let rest=n-per*ts.length;counts=ts.map(()=>per);while(rest-->0)counts[PQ.ri(0,ts.length-1)]++;}
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
    pill.textContent=done+' · '+(T.hideT?'čas skrytý':`${m}:${String(s).padStart(2,'0')}`);
    if(left<=0){stopTimer();results(T,true);}};
  pill.hidden=false;pill.onclick=()=>{T.hideT=!T.hideT;tick();};
  stopTimer();timer=setInterval(tick,1000);tick();
  const show=()=>{
    const q=T.qs[T.i],t=tById(q.topic);setTitle('Cvičný test');
    app.innerHTML=`<section class="a-card"><div class="prog"><i style="width:${100*(T.i+1)/T.qs.length}%"></i></div>
    <div class="ptop"><span>Úloha ${T.i+1} z ${T.qs.length}</span><span>${t.name}</span></div>
    <div id="qb"></div>
    <div class="actions"><button class="c-btn c-btn--secondary" id="prev" ${T.i?'':'disabled'}>Zpět</button><button class="c-btn c-btn--primary" id="nx">${T.i<T.qs.length-1?'Další':'Odevzdat'}</button></div>
    <div class="grid">${T.qs.map((x,i)=>`<button data-i="${i}" class="${T.ans[i]!=null?'done':''} ${i===T.i?'cur':''}">${i+1}</button>`).join('')}</div>
    <button class="link" id="sub">Odevzdat</button></section>
    <p class="note">${mins?'Klepnutím na čas nahoře ho skryješ. ':''}Vyhodnocení až na konci.</p>`;
    renderQ(q,$('#qb'),{answer:T.ans[T.i],onAnswer:(v,ready)=>{T.ans[T.i]=ready?v:null;const g=app.querySelector(`.grid button[data-i="${T.i}"]`);g.classList.toggle('done',ready);tick();},onEnter:()=>$('#nx').click()});
    $('#prev').onclick=()=>{T.i--;show();};
    $('#nx').onclick=()=>{if(T.i<T.qs.length-1){T.i++;show();}else submit();};
    app.querySelectorAll('.grid button').forEach(b=>b.onclick=()=>{T.i=+b.dataset.i;show();});
    $('#sub').onclick=submit;window.scrollTo(0,0);
  };
  const submit=()=>{const miss=T.qs.length-T.ans.filter(a=>a!=null).length;if(miss&&!confirm(`Bez odpovědi: ${miss}. Odevzdat?`))return;results(T,false);};
  show();
}
function results(T,timeUp){
  setTitle('Výsledek');stopTimer();pill.hidden=true;pill.onclick=null;gcEvent('prijimacky-test-finish-'+T.subj+(timeUp?'-timeup':''),'Přijímačky: dokončen test '+SUBJ[T.subj].name);
  let pts=0;const per={};const rs=T.qs.map((q,i)=>{const r=PQ.check(q,T.ans[i]);const t=q.topic;const p=per[t]||(per[t]={n:0,ok:0});p.n++;p.ok+=r.part;pts+=r.part;rec(t,r.part);return r;});
  const pc=Math.round(100*pts/T.qs.length);const mins=Math.round((Date.now()-T.start)/60000);
  st.hist=(st.hist||[]).concat([{d:Date.now(),s:T.subj,pc}]).slice(-30);save();
  const prev=st.hist.filter(h=>h.s===T.subj).slice(-2,-1)[0];
  const rows=Object.entries(per).map(([id,p])=>({t:tById(id),p})).sort((a,b)=>b.p.ok/b.p.n-a.p.ok/a.p.n);
  const good=rows.filter(r=>r.p.ok/r.p.n>=0.7).map(r=>r.t.name),work=rows.filter(r=>r.p.ok/r.p.n<0.7).map(r=>r.t.name);
  const wrong=T.qs.map((q,i)=>({q,i,r:rs[i]})).filter(x=>!x.r.ok);
  app.innerHTML=`<section class="a-card">${timeUp?'<p class="note">Čas vypršel.</p>':''}
    <p class="big">${PQ.fmt(Math.round(pts*10)/10)} / ${T.qs.length}</p>
  <p class="mut center">${pc} % · ${mins} min${prev?` · minule ${prev.pc} %${pc>prev.pc?'':''}`:''}</p>
  ${good.length?`<p class="fb ok"><b class="h">Co ti jde</b>${good.join(', ')}</p>`:''}
  ${work.length?`<p class="fb no"><b class="h">Procvičit</b>${work.join(', ')}</p>`:''}
  <div class="sh"><span>Podle témat</span></div><div class="bars">${rows.map(r=>bar(`${r.t.name}`,r.p)).join('')}</div>
  ${reflect()}
  <div class="row"><button class="c-btn c-btn--secondary" id="home">Úvod</button>${work.length?'<button class="c-btn c-btn--primary" id="pr">Procvičit slabší témata</button>':''}</div></section>
  ${wrong.length?`<section class="a-card"><h3>Chyby (${wrong.length})</h3><div class="rev">${wrong.map(x=>`<div class="rv"><div class="meta">Úloha ${x.i+1} · ${tById(x.q.topic).name}</div><p class="q">${x.q.q}</p>
   <div>Tvoje odpověď: <b>${answerText(x.q,T.ans[x.i])}</b></div>${fbHtml(x.q,x.r,T.ans[x.i]==null).replace(/<b class="h">.*?<\/b>/,'')}</div>`).join('')}</div></section>`:'<p class="note">Vše správně.</p>'}`;
  $('#home').onclick=home;const p=$('#pr');if(p)p.onclick=()=>practice(rows.filter(r=>r.p.ok/r.p.n<0.7).map(r=>r.t.id));bindReflect();window.scrollTo(0,0);
}
function answerText(q,a){if(a==null)return 'bez odpovědi';if(q.t==='mc')return `${L[a]}) ${esc(q.o[a])}`;if(q.t==='yn')return a.map(x=>x===null?'–':x?'ANO':'NE').join(', ');if(q.t==='err'){const tk=PQ.tokenize(q.w);return a.length?a.map(i=>esc(tk[i].w)).join(', '):'nic neoznačeno';}if(q.t==='ord')return a.map(i=>i+1).length+' částí seřazeno';return esc(a);}
/* ========== úlohy ve stylu CERMAT (body, podúlohy, výchozí texty) ========== */
const plural=(n,a,b,c)=>n===1?a:(n>=2&&n<=4)?b:c;
const bodu=n=>`${PQ.fmt(n)} ${n===1?'bod':(n>=2&&n<=4&&Number.isInteger(n))?'body':'bodů'}`;
const bodyKr=n=>`${PQ.fmt(n)} b`;
function subAnswered(s,v){if(v==null)return false;if(s.t==='yn'||s.t==='match')return v.every(x=>x!==null&&x!==undefined);if(s.t==='ord')return v.length===s.parts.length;if(s.t==='fields')return v.every(x=>x&&String(x).trim());if(s.t==='nums')return String(v).trim()!=='';return true;}
const taskDone=(t,a)=>!!a&&t.subs.every(s=>subAnswered(s,a[s.id]));
function renderTask(t,box,ans,onChange,opt){
  opt=opt||{};ans=ans||{};
  let h=`<div class="thead"><span class="tno">${t.no}</span><span class="tnm">${esc(t.sname||t.title)}</span><span class="tpts">max. ${bodu(PQ.taskMax(t))}</span></div>`;
  if(t.src)h+=`<details class="src" ${opt.closedSrc?'':'open'}><summary>${t.src.lab||'Výchozí text'}${t.shared?` <span class="meta">(k úlohám ${t.shared})</span>`:''}</summary><div class="passage">${t.src.h}</div></details>`;
  if(t.intro&&!(t.src&&t.src.h.includes(t.intro)))h+=`<p class="q">${t.intro}</p>`;
  if(t.note)h+=`<p class="tnote">${t.note}</p>`;
  h+=t.subs.map((s,k)=>`<div class="sub" data-k="${k}"><div class="shd"><b>${s.id}</b><span class="meta">${bodyKr(s.pts)}</span></div><div class="sq">${s.q}</div><div class="sc"></div><div class="sfb"></div></div>`).join('');
  box.innerHTML=h;
  t.subs.forEach((s,k)=>{const el=box.querySelector(`.sub[data-k="${k}"] .sc`);renderSub(s,el,ans[s.id],v=>{ans[s.id]=v;onChange&&onChange(ans);},opt);});
}
function renderSub(s,el,v,set,opt){
  const up=x=>{v=x;set(x);};
  if(s.t==='mc'){el.innerHTML=`<div class="opts">${s.o.map((o,i)=>`<button class="a-choice opt" data-i="${i}"><span class="k">${L[i]}</span><span>${o}</span></button>`).join('')}</div>`;
    el.querySelectorAll('.opt').forEach(b=>{if(v===+b.dataset.i)b.classList.add('sel');b.onclick=()=>{el.querySelectorAll('.opt').forEach(x=>x.classList.toggle('sel',x===b));up(+b.dataset.i);};});}
  if(s.t==='yn'){const cur=v?v.slice():s.s.map(()=>null);el.innerHTML=`<div class="yn">${s.s.map((x,i)=>`<div class="ynr" data-i="${i}"><p><b class="mut">${i+1}.</b> ${x[0]}</p><div class="c-seg"><button data-v="1">ANO</button><button data-v="0">NE</button></div></div>`).join('')}</div>`;
    el.querySelectorAll('.ynr').forEach(r=>{const i=+r.dataset.i;r.querySelectorAll('button').forEach(b=>{if(cur[i]!==null&&cur[i]===!!+b.dataset.v)b.classList.add('on');b.onclick=()=>{cur[i]=!!+b.dataset.v;r.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));up(cur.slice());};});});}
  if(s.t==='match'){const cur=v?v.slice():s.items.map(()=>null);
    el.innerHTML=`<div class="mopts">${s.o.map((o,i)=>`<div><span class="k">${L[i]}</span> ${o}</div>`).join('')}</div>`+s.items.map((it,i)=>`<div class="mrow" data-i="${i}"><p><b>${s.id}.${i+1}</b> ${it}</p><div class="c-seg letters">${s.o.map((_,j)=>`<button data-j="${j}">${L[j]}</button>`).join('')}</div></div>`).join('');
    el.querySelectorAll('.mrow').forEach(r=>{const i=+r.dataset.i;r.querySelectorAll('button').forEach(b=>{if(cur[i]===+b.dataset.j)b.classList.add('on');b.onclick=()=>{cur[i]=+b.dataset.j;r.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));up(cur.slice());};});});}
  if(s.t==='ord'){let cur=(v||[]).slice();const view=s.view||(s.view=PQ.shuffle(s.parts.map((_,i)=>i)));const let_=i=>L[view.indexOf(i)];
    const draw=()=>{el.innerHTML=`<div class="ordv">${view.map(i=>`<button class="part pick ${cur.includes(i)?'used':''}" data-p="${i}"><span class="k">${let_(i)}</span><span>${s.parts[i]}</span></button>`).join('')}</div>
      <div class="sh"><span>Tvoje pořadí: <b class="seqs">${cur.map(let_).join(' – ')||'klepni na části'}</b></span><span><button class="tb undo">Zpět</button></span></div>`;
      el.querySelectorAll('.pick').forEach(b=>b.onclick=()=>{const p=+b.dataset.p;if(cur.includes(p))return;cur.push(p);draw();up(cur.slice());});
      el.querySelector('.undo').onclick=()=>{cur.pop();draw();up(cur.slice());};};draw();}
  if(s.t==='fields'){const cur=v?v.slice():s.f.map(()=>'');
    el.innerHTML=`<div class="flds">${s.f.map((f,i)=>`<label class="fld">${f.l?`<span>${f.l}</span>`:''}<input class="c-input" data-i="${i}" ${f.k==='num'?'inputmode="decimal"':''} autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${f.ph||(f.k==='frac'?'zlomek, např. 5/12':f.k==='num'?'číslo':f.k==='expr'?'výraz, např. 2x(x+3)':'odpověď')}"></label>`).join('')}</div>`;
    el.querySelectorAll('input').forEach(inp=>{const i=+inp.dataset.i;inp.value=cur[i]||'';inp.oninput=()=>{cur[i]=inp.value;up(cur.slice());};});
    if(s.work&&opt.work!==false)el.insertAdjacentHTML('beforeend',`<details class="wk"><summary>Můj postup</summary><textarea class="c-input wtx" placeholder="Kroky výpočtu"></textarea></details>`);}
  if(s.t==='nums'){el.innerHTML=(s.items?`<ol class="nl">${s.items.map(x=>`<li>${x}</li>`).join('')}</ol>`:'')+`<div class="flds"><label class="fld"><span>Čísla vět:</span><input class="c-input" inputmode="numeric" autocomplete="off" placeholder="např. 2, 7, 11"></label></div>`;
    const inp=el.querySelector('input');inp.value=v||'';inp.oninput=()=>up(inp.value);}
}
function fieldRight(f){if(f.show)return f.show;const a=[].concat(f.a);if(f.k==='frac')return PQ.fracStr(f.a[0],f.a[1]);if(f.k==='num')return PQ.fmt(a[0]);if(f.k==='expr')return a[0].replace(/\*/g,'·').replace(/\^2/g,'²').replace(/-/g,'−');return a[0];}
function rightHtml(s){
  if(s.t==='mc')return `${L[s.a]}) ${s.o[s.a]}`;
  if(s.t==='yn')return s.s.map((x,i)=>`${i+1}. ${x[1]?'ANO':'NE'}`).join(' · ');
  if(s.t==='match')return s.a.map((x,i)=>`${s.id}.${i+1} → ${L[x]}`).join(' · ');
  if(s.t==='ord'){const view=s.view||s.parts.map((_,i)=>i);return s.parts.map((_,i)=>L[view.indexOf(i)]).join(' – ');}
  if(s.t==='fields')return s.f.map(f=>(f.l?f.l+' ':'')+esc(fieldRight(f))).join('; ');
  if(s.t==='nums')return s.a.join(', ');
}
function ansHtml(s,v){if(v==null)return 'bez odpovědi';if(s.t==='mc')return `${L[v]})`;if(s.t==='yn')return v.map(x=>x===null?'–':x?'ANO':'NE').join(', ');if(s.t==='match')return v.map(x=>x==null?'–':L[x]).join(', ');
  if(s.t==='ord'){const view=s.view||[];return v.map(i=>L[view.indexOf(i)]).join(' – ')||'–';}if(s.t==='fields')return v.map(x=>esc(x||'–')).join('; ');return esc(v);}
function markTask(t,box,ans,skipped){
  const R=PQ.scoreTask(t,skipped?{}:ans);
  box.querySelectorAll('button,input,textarea').forEach(x=>{if(!x.closest('details.src')&&!x.closest('details.wk'))x.disabled=true;});
  t.subs.forEach((s,k)=>{const r=R.rs[k],el=box.querySelector(`.sub[data-k="${k}"]`),v=skipped?null:ans[s.id];
    if(s.t==='mc')el.querySelectorAll('.opt').forEach(b=>{const i=+b.dataset.i;b.classList.remove('sel');if(i===s.a)b.classList.add('right');else if(i===v)b.classList.add('wrong');});
    if(s.t==='yn')el.querySelectorAll('.ynr').forEach(rw=>{const i=+rw.dataset.i;rw.classList.add(v&&v[i]===s.s[i][1]?'right':'wrong');});
    if(s.t==='match')el.querySelectorAll('.mrow').forEach(rw=>{const i=+rw.dataset.i;rw.classList.add(v&&v[i]===s.a[i]?'right':'wrong');});
    if(s.t==='fields')el.querySelectorAll('.fld input').forEach((inp,i)=>{const ok=s.any?r.det&&r.det[i]&&r.det[i].ok:r.det&&r.det[i]&&r.det[i].ok;inp.classList.add(ok?'right':'wrong');});
    if(s.t==='nums')el.querySelector('input').classList.add(r.ok?'right':'wrong');
    const why=(r.det||[]).map(d=>d&&d.why).filter(Boolean)[0];
    const full=r.pts===s.pts;
    el.querySelector('.sfb').innerHTML=`<div class="fb ${full?'ok':'no'}"><b class="h">${ic(full?'check':'x')} ${bodu(r.pts)} z ${s.pts}</b>${full?'':`Správně: <b>${rightHtml(s)}</b><br>`}${why?`<i>${why}</i><br>`:''}${s.e||''}${s.work?`<div class="work"><b>Postup</b><ol>${s.work.map(w=>`<li>${w}</li>`).join('')}</ol></div>`:''}</div>`;});
  return R;
}
/* procvičování jedné úlohy (slotu) */
function slotPractice(key){
  const sl=PQ.SLOTS[key];const s={pts:0,max:0,n:0,queue:[],key};setColor(sl.subj);
  const fill=()=>{const out=[].concat(sl.gen());const shared=out.length>1?`${1}–${out.length}`:'';out.forEach((t,i)=>{t.no=i+1;t.sname=t.sname||sl.name;t.slot=key;t.subs.forEach((x,k)=>x.id=t.subs.length>1?`${t.no}.${k+1}`:`${t.no}`);if(shared)t.shared=shared;});s.queue=out;};
  const next=()=>{if(!s.queue.length)fill();s.t=s.queue.shift();s.ans={};s.done=false;show();};
  const show=()=>{pill.hidden=false;pill.textContent=`${s.n} ${plural(s.n,'úloha','úlohy','úloh')} · ${PQ.fmt(s.pts)} / ${PQ.fmt(s.max)} b`;
    setTitle(sl.name);app.innerHTML=`<section class="a-card"><div class="ptop"><span class="tag"></span><button class="link" id="end">Hotovo</button></div><div id="tb"></div>
    <div id="hb"></div><div class="actions"><button class="c-btn c-btn--secondary" id="skip">Ukázat řešení</button><button class="c-btn c-btn--primary" id="chk" disabled>Zkontrolovat</button></div>${PQ.HINTS[key]?'<button class="link center" id="hint">'+ic('bulb')+' Nápověda</button>':''}</section>`;
    const tb=$('#tb'),chk=$('#chk');
    renderTask(s.t,tb,s.ans,a=>{chk.disabled=!taskDone(s.t,a);});const h=$('#hint');if(h)h.onclick=()=>{$('#hb').innerHTML=`<p class="tnote">${PQ.HINTS[key]}</p>`;h.remove();};
    const finish=sk=>{if(s.done)return;s.done=true;const R=markTask(s.t,tb,s.ans,sk);s.pts+=R.pts;s.max+=R.max;s.n++;rec('slot:'+key,R.pts/R.max);
      $('#skip').hidden=true;chk.disabled=false;chk.textContent=s.queue.length?'Další k textu':'Další úloha';chk.onclick=next;
      pill.textContent=`${s.n} ${plural(s.n,'úloha','úlohy','úloh')} · ${PQ.fmt(s.pts)} / ${PQ.fmt(s.max)} b`;tb.querySelector('.sfb .fb').scrollIntoView({behavior:'smooth',block:'nearest'});};
    chk.onclick=()=>finish(false);$('#skip').onclick=()=>finish(true);
    $('#end').onclick=()=>{setTitle('Shrnutí');pill.hidden=true;app.innerHTML=`<section class="a-card">${s.n?`<p class="big">${PQ.fmt(s.pts)} / ${PQ.fmt(s.max)} b</p><p class="mut center">${s.n} ${plural(s.n,'úloha','úlohy','úloh')} typu „${esc(sl.name)}“.</p>`:''}${reflect()}<div class="row"><button class="c-btn c-btn--secondary" id="home">Úvod</button><button class="c-btn c-btn--primary" id="again">Pokračovat</button></div></section>`;$('#home').onclick=home;$('#again').onclick=()=>slotPractice(key);bindReflect();window.scrollTo(0,0);};
    window.scrollTo(0,0);};
  next();
}
/* test podle plánu CERMAT */
function examTest(){
  const subj=st.subj,len=st.len,bp=PQ.BP[subj];const tasks=PQ.buildExam(subj,len==='short'?'short':'full');
  // společné výchozí texty: označení „k úlohám X–Y“
  const groups={};tasks.forEach(t=>{if(t.src&&t.src.key)(groups[t.src.key]=groups[t.src.key]||[]).push(t.no);});tasks.forEach(t=>{if(t.src&&t.src.key&&groups[t.src.key].length>1){const g=groups[t.src.key];t.shared=`${g[0]}–${g[g.length-1]}`;}});
  const mins=len==='free'?0:bp.mins[len==='short'?'short':'full'];const max=tasks.reduce((a,t)=>a+PQ.taskMax(t),0);
  const T={subj,tasks,ans:tasks.map(()=>({})),i:0,end:mins?Date.now()+mins*60000:0,start:Date.now(),hideT:false,max,len};
  setColor(subj);
  const tick=()=>{const done=`${T.tasks.filter((t,i)=>taskDone(t,T.ans[i])).length} z ${T.tasks.length}`;if(!T.end){pill.textContent=done;return;}
    const left=Math.max(0,T.end-Date.now());const m=Math.floor(left/60000),s=Math.floor(left/1000)%60;pill.textContent=done+' · '+(T.hideT?'čas skrytý':`${m}:${String(s).padStart(2,'0')}`);if(left<=0){stopTimer();examResults(T,true);}};
  pill.hidden=false;pill.onclick=()=>{T.hideT=!T.hideT;tick();};stopTimer();timer=setInterval(tick,1000);tick();
  const show=()=>{const t=T.tasks[T.i];setTitle('Cvičný test');
    app.innerHTML=`<section class="a-card"><div class="prog"><i style="width:${100*(T.i+1)/T.tasks.length}%"></i></div><div id="tb"></div>
    <div class="actions"><button class="c-btn c-btn--secondary" id="prev" ${T.i?'':'disabled'}>Zpět</button><button class="c-btn c-btn--primary" id="nx">${T.i<T.tasks.length-1?'Další':'Odevzdat'}</button></div>
    <div class="grid">${T.tasks.map((x,i)=>`<button data-i="${i}" class="${taskDone(x,T.ans[i])?'done':''} ${i===T.i?'cur':''}">${i+1}</button>`).join('')}</div>
    <button class="link" id="sub">Odevzdat</button></section>
    <p class="note">Max. ${T.max} b. ${mins?'Klepnutím na čas nahoře ho skryješ. ':''}Vyhodnocení až na konci.</p>`;
    renderTask(t,$('#tb'),T.ans[T.i],a=>{const g=app.querySelector(`.grid button[data-i="${T.i}"]`);g.classList.toggle('done',taskDone(t,a));tick();},{closedSrc:false});
    $('#prev').onclick=()=>{T.i--;show();};$('#nx').onclick=()=>{if(T.i<T.tasks.length-1){T.i++;show();}else submit();};
    app.querySelectorAll('.grid button').forEach(b=>b.onclick=()=>{T.i=+b.dataset.i;show();});$('#sub').onclick=submit;window.scrollTo(0,0);};
  const submit=()=>{const miss=T.tasks.filter((t,i)=>!taskDone(t,T.ans[i])).length;if(miss&&!confirm(`Nedokončeno: ${miss}. Odevzdat?`))return;examResults(T,false);};
  T.show=show;show();
}
function examResults(T,timeUp){
  setTitle('Výsledek');stopTimer();pill.hidden=true;pill.onclick=null;gcEvent('prijimacky-test-finish-'+T.subj+(timeUp?'-timeup':''),'Přijímačky: dokončen test '+SUBJ[T.subj].name);
  const rs=T.tasks.map((t,i)=>PQ.scoreTask(t,T.ans[i]));const pts=rs.reduce((a,r)=>a+r.pts,0);T.tasks.forEach((t,i)=>rec('slot:'+t.slot,rs[i].pts/rs[i].max));
  const pc=Math.round(100*pts/T.max),mins=Math.round((Date.now()-T.start)/60000);
  st.hist=(st.hist||[]).concat([{d:Date.now(),s:T.subj,pc,pts,max:T.max}]).slice(-30);save();const prev=st.hist.filter(h=>h.s===T.subj).slice(-2,-1)[0];
  const lost=T.tasks.map((t,i)=>({t,i,r:rs[i]})).filter(x=>x.r.pts<x.r.max);
  const full=T.tasks.filter((t,i)=>rs[i].pts===rs[i].max).length;
  // nejvíc ztracených bodů podle typu úlohy
  const bySlot={};lost.forEach(x=>{const k=x.t.slot;bySlot[k]=(bySlot[k]||0)+x.r.max-x.r.pts;});const top=Object.entries(bySlot).sort((a,b)=>b[1]-a[1]).slice(0,3);
  app.innerHTML=`<section class="a-card">${timeUp?'<p class="note">Čas vypršel.</p>':''}
    <p class="big">${PQ.fmt(pts)} / ${T.max} b</p>
  <p class="mut center">${pc} %${T.max!==50?` · v celém testu by to odpovídalo zhruba ${Math.round(pts*50/T.max)} z 50 b`:''} · ${mins} min${prev?` · minule ${prev.pts!=null?prev.pts+' / '+prev.max+' b':prev.pc+' %'}`:''}</p>
  <p class="fb ok"><b class="h">Co ti jde</b>${full} z ${T.tasks.length} úloh za plný počet bodů.</p>
  ${top.length?`<p class="fb no"><b class="h">Kde ztrácíš body</b>${top.map(([k,v])=>`<button class="link inl" data-slot="${k}">${esc(PQ.SLOTS[k].name)}</button> (−${PQ.fmt(v)} b)`).join(', ')}</p>`:''}
  <div class="sh"><span>Body po úlohách</span></div><div class="ptab">${T.tasks.map((t,i)=>`<div class="${rs[i].pts===rs[i].max?'ok':rs[i].pts?'mid':'no'}"><b>${t.no}</b><span>${PQ.fmt(rs[i].pts)}/${rs[i].max}</span></div>`).join('')}</div>
  ${reflect()}<div class="row"><button class="c-btn c-btn--secondary" id="home">Úvod</button><button class="c-btn c-btn--primary" id="again">Nový test</button></div></section>
  ${lost.length?`<section class="a-card"><h3>Řešení (${lost.length})</h3><div class="rev" id="rev"></div></section>`:'<p class="note">Vše za plný počet bodů.</p>'}`;
  const rev=$('#rev');if(rev)lost.forEach(x=>{const d=document.createElement('div');d.className='rv';rev.appendChild(d);
    renderTask(x.t,d,T.ans[x.i],null,{closedSrc:true,work:false});markTask(x.t,d,T.ans[x.i],false);
    d.querySelectorAll('.sub').forEach((el,k)=>{const s=x.t.subs[k];if(x.r.rs[k].pts===s.pts){el.classList.add('fine');}else el.querySelector('.sfb').insertAdjacentHTML('afterbegin',`<div class="meta">Tvoje odpověď: ${ansHtml(s,T.ans[x.i][s.id])}</div>`);});
    d.insertAdjacentHTML('beforeend',`<button class="link" data-slot="${x.t.slot}">${ic('target')} Procvičit tento typ</button>`);});
  app.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>slotPractice(b.dataset.slot));
  $('#home').onclick=home;$('#again').onclick=examTest;bindReflect();window.scrollTo(0,0);
}

/* tlačítko zpět: na úvodu → rozcestník, jinde → úvod appky Nanečisto */
const back=document.querySelector('.v-header .a-back');
const CHEV='<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>';
let title='';const setTitle=t=>{title=t;};const h1=document.querySelector('.a-name h1');
const syncBack=()=>{const atHome=!!app.querySelector('#subj');h1.textContent=atHome?'Nanečisto':(title||'Nanečisto');back.innerHTML=((window.VELA_ICONS&&window.VELA_ICONS.ui_back)||'')+'<span class="a-back__label">'+(atHome?'Přijímačky':'Nanečisto')+'</span>';back.setAttribute('href',atHome?'/#/prijimacky':'#');back.dataset.inner=atHome?'':'1';};
new MutationObserver(syncBack).observe(app,{childList:true});
/* segmentové přepínače: stav .on se zrcadlí do aria-pressed (vzhled z velappky.css) */
const segSync=()=>app.querySelectorAll('.c-seg button').forEach(b=>{const v=String(b.classList.contains('on'));if(b.getAttribute('aria-pressed')!==v)b.setAttribute('aria-pressed',v);});
new MutationObserver(segSync).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
back.addEventListener('click',e=>{if(!back.dataset.inner)return;e.preventDefault();if(timer&&!confirm('Opravdu ukončit test? Odpovědi se neuloží.'))return;home();});
home();
})();
