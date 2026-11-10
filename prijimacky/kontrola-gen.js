// Vygeneruje KONTROLA-CJ.md – přehled nových položek (rev:0) k ruční kontrole. Spuštění: node kontrola-gen.js
const fs=require('fs'),vm=require('vm');const ctx={console,Math,Date,JSON};ctx.globalThis=ctx;vm.createContext(ctx);
const idx=fs.readFileSync(__dirname+'/index.html','utf8');
const files=['core.js','exam.js','ex-ma.js','ex-cj.js'].concat([...idx.matchAll(/src="(ex-cj-[^"?]+\.js)/g)].map(m=>m[1]),['topics.js']);
for(const f of files)vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const PQ=ctx.PQ,L='ABCDEFGH';
const tx=h=>String(h==null?'':h).replace(/<br\s*\/?>/g,' / ').replace(/<\/(p|h4|div)>/g,'\n').replace(/<[^>]+>/g,'').replace(/\n{2,}/g,'\n').trim();
function sub(s){const o=[];o.push(`- **${tx(s.q)}** (${s.pts} b)`);
  if(s.t==='mc')s.o.forEach((x,i)=>o.push(`  - ${L[i]}) ${tx(x)}${i===s.a?' **✔**':''}`));
  else if(s.t==='yn')s.s.forEach(([x,v])=>o.push(`  - ${tx(x)} → **${v?'A':'N'}**`));
  else if(s.t==='match'){o.push('  - možnosti: '+s.o.map((x,i)=>`${L[i]}) ${tx(x)}`).join('; '));s.items.forEach((x,i)=>o.push(`  - ${tx(x)} → **${L[s.a[i]]}**`));}
  else if(s.t==='ord')s.parts.forEach((x,i)=>o.push(`  ${i+1}. ${tx(x)}`));
  else if(s.t==='fields')s.f.forEach(f=>o.push(`  - ${tx(f.l||'')} **${[].concat(f.a).join(' / ')}**${f.k?` (${f.k})`:''}`));
  else if(s.t==='nums'){s.items.forEach((x,i)=>o.push(`  ${i+1}. ${tx(x)}${s.a.includes(i+1)?' **✔**':''}`));}
  else if(s.t==='words')o.push(`  - správně: **${s.a.join(', ')}**`);
  if(s.cond)s.cond.forEach(c=>o.push(`  - podmínka: ${tx(c)}`));
  if(s.e)o.push(`  - *Zdůvodnění:* ${tx(s.e)}`);return o.join('\n');}
function forced(it){const all=PQ.BANKS[it.slot];const S={};all.forEach(x=>S[x.id]=1e6);S[it.id]=0;PQ.SEEN=S;PQ.noMark=1;
  const r=PQ.SLOTS[it.slot].gen();PQ.noMark=0;return [].concat(r);}
const out=['# KONTROLA-CJ – nové položky čeština (rev:0)','',`Vygenerováno ${new Date().toISOString().slice(0,10)} skriptem \`kontrola-gen.js\` z \`PQ.BANKS\`. Každá položka má \`rev:0\` – po kontrole učitelem změňte na \`rev:1\`.`,''];
let n=0;
for(const k in PQ.BANKS){const its=PQ.BANKS[k].filter(x=>x.rev===0);if(!its.length)continue;const sl=PQ.SLOTS[k];out.push(`## ${k} – ${sl?sl.name:''} (${its.length} nových)`,'');
  for(const it of its){n++;out.push(`### ${it.id}`,'');
    if(it.h){out.push(tx(it.h).split('\n').map(l=>'> '+l).join('\n'),'');if(it.aut)out.push(`Autor: ${it.aut}`,'');}
    let subs=[];if(it.t)subs=it.t.map(f=>f());else{const ts=forced(it);ts.forEach(T=>{if(T.src&&T.src.h&&!it.h)out.push(tx(T.src.h).split('\n').map(l=>'> '+l).join('\n'),'');subs.push(...T.subs);});}
    subs.forEach(s=>out.push(sub(s)));out.push('');}}
out.splice(3,0,`Celkem položek rev:0: **${n}**`,'');
fs.writeFileSync(__dirname+'/KONTROLA-CJ.md',out.join('\n'));console.log('rev0',n);
