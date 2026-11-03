// node test.js – kontrola všech dat
const vm=require('vm'),fs=require('fs');const ctx={console,Math};vm.createContext(ctx);
for(const f of ['core.js','data-cj.js','data-cj2.js','data-ma.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
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
console.log(`Pevných otázek: ${tot}; chyb: ${err}`);process.exit(err?1:0);
