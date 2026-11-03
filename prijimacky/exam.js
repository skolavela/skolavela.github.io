// Přijímačky – model úloh ve stylu CERMAT (úloha → podúlohy, body, pravidla hodnocení)
(function(G){
const PQ=G.PQ;
PQ.BP=PQ.BP||{};PQ.SLOTS=PQ.SLOTS||{};
/* ---------- výrazy: parser a vyhodnocení ---------- */
PQ.parseExpr=function(src){
  let s=String(src).trim().replace(/\s+/g,'').replace(/[−–]/g,'-').replace(/[·×⋅]/g,'*').replace(/:/g,'/').replace(/²/g,'^2').replace(/³/g,'^3').replace(/,/g,'.').toLowerCase();
  if(!s||/[^0-9a-z.+\-*/^()]/.test(s))return null;
  let i=0;const peek=()=>s[i];
  function prim(){
    const c=peek();
    if(c==='('){i++;const e=add();if(peek()!==')')throw 0;i++;return e;}
    if(/[0-9.]/.test(c)){let j=i;while(i<s.length&&/[0-9.]/.test(s[i]))i++;const v=parseFloat(s.slice(j,i));if(isNaN(v))throw 0;return {k:'n',v};}
    if(/[a-z]/.test(c)){i++;return {k:'v',v:c};}
    throw 0;
  }
  function pow(){let b=prim();while(peek()==='^'){i++;let neg=false;if(peek()==='-'){neg=true;i++;}let e=prim();if(neg)e={k:'neg',a:e};b={k:'^',a:b,b:e};}return b;}
  function unary(){if(peek()==='-'){i++;return {k:'neg',a:unary()};}if(peek()==='+'){i++;return unary();}return pow();}
  function mul(){let a=unary();for(;;){const c=peek();if(c==='*'||c==='/'){i++;const b=unary();a={k:c,a,b};}
    else if(c&&(/[0-9a-z.(]/.test(c))){const b=pow();a={k:'*',a,b,imp:1};}else return a;}}
  function add(){let a=mul();for(;;){const c=peek();if(c==='+'||c==='-'){i++;const b=mul();a={k:c,a,b};}else return a;}}
  try{const e=add();if(i!==s.length)return null;return e;}catch(e){return null;}
};
PQ.evalExpr=function(e,env){switch(e.k){case 'n':return e.v;case 'v':return env[e.v]===undefined?NaN:env[e.v];case 'neg':return -PQ.evalExpr(e.a,env);
  case '+':return PQ.evalExpr(e.a,env)+PQ.evalExpr(e.b,env);case '-':return PQ.evalExpr(e.a,env)-PQ.evalExpr(e.b,env);case '*':return PQ.evalExpr(e.a,env)*PQ.evalExpr(e.b,env);
  case '/':return PQ.evalExpr(e.a,env)/PQ.evalExpr(e.b,env);case '^':return Math.pow(PQ.evalExpr(e.a,env),PQ.evalExpr(e.b,env));}return NaN;};
const VALS=[[2,3,5],[-1.5,0.5,2.25],[3.7,-2,1.3],[0.4,7,-3.1],[-2.6,1.9,4]];
PQ.sameExpr=function(a,b,vars){const A=typeof a==='string'?PQ.parseExpr(a):a,B=typeof b==='string'?PQ.parseExpr(b):b;if(!A||!B)return false;
  vars=vars||'xyzabn';for(const row of VALS){const env={};[...vars].forEach((v,k)=>env[v]=row[k%3]+k*0.17);const x=PQ.evalExpr(A,env),y=PQ.evalExpr(B,env);
    if(!isFinite(x)||!isFinite(y))return false;if(Math.abs(x-y)>1e-7*Math.max(1,Math.abs(x),Math.abs(y)))return false;}return true;};
// je výraz zapsán jako součin (rozklad)?
PQ.isProduct=e=>!!e&&(e.k==='*'&&!(e.a.k==='n'&&e.b.k==='n')||e.k==='^'||(e.k==='neg'&&PQ.isProduct(e.a)));
PQ.hasParen=s=>/\(/.test(s)||/\^|²/.test(s);
/* ---------- zlomky ---------- */
PQ.frac=(p,q)=>{if(q<0){p=-p;q=-q;}const g=PQ.gcd(p,q)||1;return [p/g,q/g];};
PQ.fracStr=(p,q)=>{[p,q]=PQ.frac(p,q);return q===1?String(p).replace('-','−'):`${p<0?'−':''}${Math.abs(p)}/${q}`;};
PQ.fracHtml=(p,q)=>{[p,q]=PQ.frac(p,q);return q===1?PQ.fmt(p):`${p<0?'−':''}<span class="fr"><i>${Math.abs(p)}</i><i>${q}</i></span>`;};
function checkFrac(ans,val){ // val = [p,q] v základním tvaru
  const s=String(ans).trim().replace(/\s+/g,'').replace(/[−–]/g,'-');let m=s.match(/^(-?)(\d+)\/(\d+)$/);
  if(m){const p=(m[1]?-1:1)*+m[2],q=+m[3];if(!q)return {ok:false};const ok=p*val[1]===q*val[0];return {ok:ok&&PQ.gcd(p,q)===1&&q!==1,near:ok,why:ok&&PQ.gcd(p,q)!==1?'Zlomek jde ještě zkrátit.':''};}
  m=s.match(/^-?\d+$/);if(m){const ok=val[1]===1&&+s===val[0];return {ok,near:ok};}
  const v=PQ.parseNum(s);if(!isNaN(v)&&Math.abs(v-val[0]/val[1])<1e-9)return {ok:false,near:true,why:'Výsledek je potřeba zapsat zlomkem.'};
  return {ok:false};
}
/* ---------- kontrola jednoho pole ---------- */
PQ.checkField=function(f,ans){
  if(ans==null||String(ans).trim()==='')return {ok:false};
  const k=f.k||'txt';
  if(k==='num'){const v=PQ.parseNum(ans);const tol=f.tol||0;return {ok:!isNaN(v)&&[].concat(f.a).some(a=>Math.abs(a-v)<=tol+1e-6*Math.max(1,Math.abs(a)))};}
  if(k==='frac')return checkFrac(ans,f.a);
  if(k==='expr'){const e=PQ.parseExpr(ans);if(!e)return {ok:false,why:'Výraz se nepodařilo přečíst – zkontroluj závorky a znaménka.'};
    const ok=[].concat(f.a).some(a=>PQ.sameExpr(e,a,f.vars));if(ok&&f.form==='prod'&&!PQ.isProduct(e))return {ok:false,near:true,why:'Hodnota sedí, ale výraz má být zapsán jako součin (rozložený).'};
    if(ok&&f.form==='simp'&&/\(/.test(ans))return {ok:false,near:true,why:'Hodnota sedí, ale výraz ještě není zjednodušený.'};return {ok};}
  const v=PQ.norm(ans).replace(/[,;]$/,'');return {ok:[].concat(f.a).some(a=>PQ.norm(a)===v)};
};
/* ---------- bodování podúlohy (pravidla CERMAT) ---------- */
// sc: mapa „počet správných dílčích odpovědí → body“; bez sc: plný počet bodů jen za vše správně (mc), u polí max(0, body − chyby)
PQ.scoreSub=function(s,ans){
  const R=(c,n,extra)=>{let pts;if(s.sc)pts=s.sc[c]||0;else if(s.each)pts=c*s.each;else if(s.minus)pts=Math.max(0,s.pts-(n-c)-(extra||0));else pts=(c===n&&!extra)?s.pts:0;return {pts:Math.min(pts,s.pts),c,n,ok:c===n&&!extra};};
  if(ans==null)return Object.assign(R(0,1),{pts:0,ok:false,c:0});
  switch(s.t){
    case 'mc':return R(ans===s.a?1:0,1);
    case 'yn':{let c=0;s.s.forEach((x,i)=>{if(ans[i]===x[1])c++;});return R(c,s.s.length);}
    case 'match':{let c=0;s.a.forEach((x,i)=>{if(ans[i]===x)c++;});return R(c,s.a.length);}
    case 'ord':{let c=0;s.parts.forEach((x,i)=>{if(ans[i]===i)c++;});return R(c,s.parts.length);}
    case 'fields':{let c=0;const det=[];
      if(s.any){const pool=s.f.map(f=>f);const used=new Set();s.f.forEach((_,i)=>{const a=ans[i];let hit=-1;pool.forEach((f,j)=>{if(hit<0&&!used.has(j)&&PQ.checkField(f,a).ok)hit=j;});if(hit>=0){used.add(hit);c++;det.push({ok:true});}else det.push({ok:false});});}
      else s.f.forEach((f,i)=>{const r=PQ.checkField(f,ans[i]);if(r.ok)c++;det.push(r);});
      return Object.assign(R(c,s.f.length),{det});}
    case 'nums':{const want=new Set(s.a);const got=[...new Set(String(ans).split(/[^0-9]+/).filter(Boolean).map(Number))];const c=got.filter(x=>want.has(x)).length;const extra=got.length-c;
      const pts=Math.max(0,s.pts-(s.a.length-c)-extra);return {pts,c,n:s.a.length,ok:c===s.a.length&&!extra,extra};}
  }
  return {pts:0,ok:false};
};
PQ.taskMax=t=>t.subs.reduce((a,s)=>a+s.pts,0);
PQ.scoreTask=(t,ans)=>{ans=ans||{};let pts=0;const rs=t.subs.map(s=>{const r=PQ.scoreSub(s,ans[s.id]);pts+=r.pts;return r;});return {pts,max:PQ.taskMax(t),rs};};
// sestavení testu podle plánu (blueprint); bloky (společný výchozí text) vrací víc úloh
PQ.buildExam=function(subj,len){const bp=PQ.BP[subj];if(!bp)return null;const plan=bp[len]||bp.full;const tasks=[];
  plan.forEach(key=>{const sl=PQ.SLOTS[key];const out=[].concat(sl.gen());out.forEach(t=>{t.slot=key;t.sname=t.sname||sl.name;tasks.push(t);});});
  tasks.forEach((t,i)=>{t.no=i+1;t.subs.forEach((s,k)=>{s.id=t.subs.length>1?`${t.no}.${k+1}`:`${t.no}`;});});
  return tasks;};
PQ.slot=(subj,key,name,gen,info)=>{PQ.SLOTS[key]=Object.assign({subj,key,name,gen},info||{});};
// pomocníci pro data
PQ.T=(title,subs,x)=>Object.assign({title,subs},x||{});
PQ.S={
  mc:(q,o,a,pts,e,x)=>Object.assign({t:'mc',q,o,a,pts,e},x||{}),
  yn:(q,s,pts,sc,e,x)=>Object.assign({t:'yn',q,s,pts,sc,e},x||{}),
  match:(q,items,o,a,pts,e,x)=>Object.assign({t:'match',q,items,o,a,pts,each:pts/items.length,e},x||{}),
  ord:(q,parts,pts,sc,e,x)=>Object.assign({t:'ord',q,parts,pts,sc,e},x||{}),
  fields:(q,f,pts,e,x)=>Object.assign({t:'fields',q,f,pts,e},x||{}),
  nums:(q,items,a,pts,e,x)=>Object.assign({t:'nums',q,items,a,pts,e},x||{}),
};
// MC s možnostmi A–E, kde E = „jiné řešení“ (správná může být i E)
PQ.mcE=function(q,right,wrongs,pts,e,x){const fmt=(x&&x.fmt)||PQ.fmt;const useE=Math.random()<0.2;const opts=[];const seen=new Set([fmt(right)]);
  const ws=wrongs.concat([right*2,right+1,right-1,right*1.5,right+2,right+10].map(v=>Math.round(v*100)/100));for(const w of ws){if(opts.length>=4)break;if(!(w>0))continue;const k=fmt(w);if(!seen.has(k)){seen.add(k);opts.push(k);}}
  let pool=opts.slice(0,useE?4:3);if(!useE)pool.push(fmt(right));pool=pool.sort((a,b)=>PQ.parseNum(a.replace(/[^\d,−-]/g,''))-PQ.parseNum(b.replace(/[^\d,−-]/g,''))||0);
  const o=pool.concat(['jiné řešení']);const a=useE?4:o.indexOf(fmt(right));return Object.assign(PQ.S.mc(q,o,a,pts,e,{keep:1}),x||{});};
})(typeof window!=='undefined'?window:globalThis);
