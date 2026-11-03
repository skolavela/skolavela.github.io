// node test.js – kontrola všech dat
const vm=require('vm'),fs=require('fs');const ctx={console,Math};vm.createContext(ctx);
for(const f of ['core.js','data-cj.js','data-cj2.js','data-ma.js','exam.js','ex-ma.js'].concat(fs.existsSync(__dirname+'/ex-cj.js')?['ex-cj.js']:[]))vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const PQ=ctx.PQ;let err=0;const bad=(m,it)=>{err++;console.error('CHYBA:',m,JSON.stringify(it).slice(0,200));};
function val(it,tp){
  if(!it||!it.q||typeof it.q!=='string')return bad(tp+': chybí zadání',it);
  if(!it.e||typeof it.e!=='string'||it.e.length<3)return bad(tp+': chybí vysvětlení',it);
  if(/undefined|NaN|null|\[object/.test(it.q+it.e+JSON.stringify(it.o||'')+JSON.stringify(it.s||'')))return bad(tp+': undefined/NaN v textu',it);
  if(it.t==='mc'){if(!Array.isArray(it.o)||it.o.length<2)return bad(tp+': málo možností',it);
    if(!(Number.isInteger(it.a)&&it.a>=0&&it.a<it.o.length))return bad(tp+': odpověď mimo možnosti',it);
    if(new Set(it.o.map(String)).size!==it.o.length)return bad(tp+': duplicitní možnosti',it);
    if(PQ.check(it,it.a).ok!==true)return bad(tp+': check',it);}
  else if(it.t==='yn'){if(!it.s||it.s.length<2||it.s.some(x=>typeof x[1]!=='boolean'||!x[0]))return bad(tp+': yn',it);
    if(!PQ.check(it,it.s.map(x=>x[1])).ok)return bad(tp+': yn check',it);}
  else if(it.t==='num'){if(!it.a.length||it.a.some(x=>typeof x!=='number'||!isFinite(x)))return bad(tp+': num odpověď',it);
    const sAns=String(Math.round(it.a[0]*1e6)/1e6).replace('.',',');if(!PQ.check(it,sAns).ok)return bad(tp+': num zpětná kontrola '+sAns,it);
    if(it.fr&&!PQ.check(it,it.fr.replace('−','-')).ok)return bad(tp+': zlomek '+it.fr,it);}
  else if(it.t==='err'){const tk=PQ.tokenize(it.w);const E=tk.map((t,i)=>t.r!==undefined?i:-1).filter(i=>i>=0);
    if(!E.length)return bad(tp+': text bez chyb',it);
    if(tk.some(t=>/[\[\]|]/.test(t.w+(t.r||''))))return bad(tp+': nezpracovaná značka',it);
    for(const i of E){const t=tk[i];if(!t.r||t.r===t.w||!t.rule||t.rule.length<5)return bad(tp+': chyba bez opravy/pravidla '+t.w,it);}
    const wrong=tk.map(t=>t.w),right=tk.map(t=>t.r!==undefined?t.r:t.w);
    const diff=wrong.map((w,i)=>w!==right[i]?i:-1).filter(i=>i>=0);if(diff.join()!==E.join())return bad(tp+': oprava se liší mimo označená slova',it);
    const sent=right.join(' ').split(/(?<=[.!?:])\s+/).length;if(sent<2||sent>6)return bad(tp+': text má '+sent+' vět',it);
    if(!PQ.check(it,E).ok||PQ.check(it,[]).ok||PQ.check(it,E.concat([E[0]===0?1:0])).ok)return bad(tp+': err check',it);}
  else if(it.t==='ord'){const n=it.parts.length;if(n<4||n>6)return bad(tp+': počet částí',it);
    if(new Set(it.parts).size!==n||it.parts.some(p=>!p||p.length<10))return bad(tp+': části',it);
    const want=[...Array(n-1)].map((_,i)=>i+1);if(!PQ.check(it,want).ok||PQ.check(it,want.slice().reverse()).ok)return bad(tp+': ord check',it);
    const pool=PQ.shuffle(it.parts.map((x,i)=>i).slice(1));if(pool.slice().sort().join()!==want.slice().sort().join())return bad(tp+': permutace',it);}
  else if(it.t==='txt'){if(!it.a.length||!PQ.check(it,it.a[0]).ok)return bad(tp+': txt',it);}
  else bad(tp+': neznámý typ',it);
}
const pc=x=>{const s=String(x);};
console.log('Téma'.padEnd(34),'pevné','generátory');
let tot=0;
for(const t of PQ.topics){t.items.forEach(it=>val(it,t.id));
  for(const g of t.gens){for(let i=0;i<500;i++){let it;try{it=g();}catch(e){bad(t.id+': generátor vyhodil '+e.message,{});break;}val(it,t.id+' gen'+t.gens.indexOf(g));}}
  const perTopic=t.items.length+(t.gens.length?` + ${t.gens.length} gen.`:'');tot+=t.items.length;
  console.log((t.subj+' / '+t.name).padEnd(34),String(t.items.length).padStart(4),t.gens.length);
  if(t.items.length+t.gens.length*10<({chyby:30,razeni:25}[t.id]||40))console.warn('  ⚠ málo otázek');}
// parsování
const tests=[['3,5',3.5],['3/4',0.75],['−2',-2],[' 12 cm',12],['1 000',1000]];
for(const [s,v] of tests)if(Math.abs(PQ.parseNum(s)-v)>1e-9){err++;console.error('parseNum',s);}
/* ---------- úlohy ve stylu CERMAT ---------- */
const right=s=>{switch(s.t){case 'mc':return s.a;case 'yn':return s.s.map(x=>x[1]);case 'match':return s.a.slice();case 'ord':return s.parts.map((_,i)=>i);
  case 'fields':return s.f.map(f=>f.k==='frac'?(f.a[1]===1?String(f.a[0]):`${f.a[0]}/${f.a[1]}`):f.k==='num'?String([].concat(f.a)[0]).replace('.',','):[].concat(f.a)[0]);case 'nums':return s.a.join(', ');}};
const wrongA=s=>{switch(s.t){case 'mc':return (s.a+1)%s.o.length;case 'yn':return s.s.map(x=>!x[1]);case 'match':return s.a.map(x=>(x+1)%s.o.length);case 'ord':return s.parts.map((_,i)=>s.parts.length-1-i);case 'fields':return s.f.map(()=>'zzz');case 'nums':return '99';}};
const TXT=x=>JSON.stringify(x);
function valTask(t,tag){
  if(!t||!Array.isArray(t.subs)||!t.subs.length)return bad(tag+': úloha bez podúloh',t);
  const all=TXT(t);if(/undefined|NaN|\[object|Infinity/.test(all))return bad(tag+': undefined/NaN',t);
  for(const s of t.subs){
    if(!(s.pts>0&&Number.isInteger(s.pts)))return bad(tag+': body',s);
    if(!s.q||!s.e||s.e.length<3)return bad(tag+': zadání/vysvětlení',s);
    if(s.t==='mc'){if(!(s.o.length>=2&&s.o.length<=6)||!(s.a>=0&&s.a<s.o.length)||new Set(s.o.map(String)).size!==s.o.length)return bad(tag+': mc možnosti',s);}
    if(s.t==='yn'){if(!s.s.every(x=>typeof x[1]==='boolean'&&x[0]))return bad(tag+': yn',s);if(s.sc&&Math.max(...Object.values(s.sc))!==s.pts)return bad(tag+': yn sc',s);}
    if(s.t==='match'){if(new Set(s.a).size!==s.a.length||s.o.length<=s.items.length||s.a.some(x=>x<0||x>=s.o.length)||new Set(s.o).size!==s.o.length)return bad(tag+': match',s);}
    if(s.t==='ord'){if(s.parts.length!==6&&t.slot&&t.slot.startsWith('cj'))return bad(tag+': ord 6 částí',s);if(new Set(s.parts).size!==s.parts.length)return bad(tag+': ord části',s);}
    if(s.t==='fields'){for(const f of s.f){if(f.k==='frac'&&(PQ.gcd(f.a[0],f.a[1])!==1||f.a[1]<1))return bad(tag+': zlomek není v základním tvaru',f);if(f.k==='expr'&&!PQ.parseExpr([].concat(f.a)[0]))return bad(tag+': výraz',f);}}
    const r=PQ.scoreSub(s,right(s));if(r.pts!==s.pts)return bad(tag+': správná odpověď nedává plné body ('+r.pts+'/'+s.pts+')',s);
    const w=PQ.scoreSub(s,wrongA(s));if(w.pts>=s.pts&&s.t!=='ord')return bad(tag+': špatná odpověď dává plné body',s);
    if(PQ.scoreSub(s,null).pts!==0)return bad(tag+': prázdná odpověď',s);
  }
}
for(const k in PQ.SLOTS){const sl=PQ.SLOTS[k];let pts=null;for(let i=0;i<500;i++){let out;try{out=[].concat(sl.gen());}catch(e){bad(k+': generátor vyhodil '+e.message,{});break;}
  out.forEach((t,j)=>{t.slot=k;valTask(t,k+'#'+j);});const p=out.reduce((a,t)=>a+PQ.taskMax(t),0);if(pts===null)pts=p;else if(p!==pts){bad(k+': kolísá počet bodů '+pts+'≠'+p,{});break;}}
  sl._pts=pts;}
for(const subj in PQ.BP){for(const len of ['full','short']){for(let i=0;i<50;i++){const ex=PQ.buildExam(subj,len);const sum=ex.reduce((a,t)=>a+PQ.taskMax(t),0);
  if(len==='full'&&sum!==50){bad(subj+' '+len+': součet bodů '+sum+' ≠ 50',{});break;}if(len==='short'&&(sum<20||sum>30)){bad(subj+' short: '+sum,{});break;}
  if(i===0)console.log(`Test ${subj} ${len}: ${ex.length} úloh, ${sum} bodů`);}}}
// výrazy a zlomky
[['(3a-1)^2','9a^2-6a+1',true],['2x(x+1)','2x^2+2x',true],['x/4','0,25x',true],['3x-2','3x+2',false]].forEach(([a,b,v])=>{if(PQ.sameExpr(a,b)!==v){err++;console.error('sameExpr',a,b);}});
if(PQ.checkField({k:'frac',a:[3,4]},'6/8').ok||!PQ.checkField({k:'frac',a:[3,4]},'3/4').ok||PQ.checkField({k:'frac',a:[3,4]},'0,75').ok){err++;console.error('frac');}
if(PQ.checkField({k:'expr',a:'(x-3)(x+3)',form:'prod'},'x^2-9').ok||!PQ.checkField({k:'expr',a:'(x-3)(x+3)',form:'prod'},'(x+3)(x−3)').ok){err++;console.error('prod');}
console.log(`Pevných otázek: ${tot}; slotů CERMAT: ${Object.keys(PQ.SLOTS).length}; chyb: ${err}`);process.exit(err?1:0);
