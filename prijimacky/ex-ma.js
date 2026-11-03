// Matematika – úlohy podle struktury JPZ (4letý obor): 16 úloh, 50 bodů. Vše původní, čísla generovaná.
(function(G){
const PQ=G.PQ,S=PQ.S,ri=PQ.ri,pick=PQ.pick,fmt=PQ.fmt,F=PQ.fracHtml,FS=PQ.fracStr;
const par=n=>n<0?`(${fmt(n)})`:fmt(n);
const r2=x=>Math.round(x*1e6)/1e6;
const fr=(p,q)=>PQ.frac(p,q);
const add=(a,b)=>fr(a[0]*b[1]+b[0]*a[1],a[1]*b[1]),sub=(a,b)=>add(a,[-b[0],b[1]]),mul=(a,b)=>fr(a[0]*b[0],a[1]*b[1]),dv=(a,b)=>fr(a[0]*b[1],a[1]*b[0]);
const FF=a=>F(a[0],a[1]),FT=a=>FS(a[0],a[1]);
const frF=a=>({k:'frac',a,l:''});
const big=(n,d)=>`<span class="fr big"><i>${n}</i><i>${d}</i></span>`;
// mnohočlen [c2,c1,c0] → „9a² − 6a + 1“
function poly(c,v){const deg=c.length-1;let s='';c.forEach((k,i)=>{if(!k)return;const p=deg-i;const a=Math.abs(k);const coef=(a===1&&p>0)?'':fmt(a);const term=coef+(p>0?v:'')+(p>1?(p===2?'²':'³'):'');
  s+=s?(k<0?' − ':' + ')+term:(k<0?'−':'')+term;});return s||'0';}
const kul=n=>n===1?'kuličku':n<5?'kuličky':'kuliček';
const slot=(k,n,gen,i)=>PQ.slot('ma',k,n,gen,i);

/* 1 – zlomky */
slot('ma1','Zlomky: A, B a jejich průměr',()=>{
  let a,b,c,d,A,B,C;do{a=fr(ri(1,7),pick([2,3,4,5,6,8]));b=fr(ri(1,5),pick([3,4,6,9,10,12]));c=fr(ri(2,9),pick([3,4,5,7]));d=fr(ri(2,9),pick([2,3,6,8]));
    A=sub(a,b);B=dv(c,d);C=mul(add(A,B),[1,2]);}while(a[1]===1||b[1]===1||c[1]===1||d[1]===1||A[0]<=0||Math.abs(C[1])>72||A[1]>40||B[1]>40||A[1]===1&&B[1]===1);
  return PQ.T('Zlomky',[
    S.fields(`A = ${FF(a)} − ${FF(b)}`,[frF(A)],1,`Společný jmenovatel, odečíst a zkrátit: A = ${FF(A)}.`),
    S.fields(`B = ${FF(c)} : ${FF(d)}`,[frF(B)],1,`Dělit zlomkem = násobit převráceným zlomkem: ${FF(c)} · ${F(d[1],d[0])} = ${FF(B)}.`),
    S.fields(`C = aritmetický průměr čísel A a B`,[frF(C)],1,`C = (A + B) : 2 = (${FF(A)} + ${FF(B)}) : 2 = ${FF(C)}.`)],
   {intro:'Vypočtěte čísla A, B a C. Výsledky zapište <b>zlomkem v základním tvaru</b>.'});});

/* 2 – desetinná čísla, složený zlomek s postupem */
slot('ma2','Desetinná čísla a složený zlomek',()=>{
  const x=pick([0.2,0.4,0.5,1.5,2.5,0.6]),y=-pick([3,4,5,1.2,2.5,0.8]),d=pick([0.2,0.4,0.5,0.25]),k=ri(2,9),c=r2(d*k),res=r2(x*y+k);
  let p,q,r,A,Bd,R;do{p=fr(ri(1,5),pick([2,3,4]));q=fr(ri(1,5),pick([3,6,8,12]));r=fr(ri(1,4),pick([2,3,5]));A=sub(p,q);Bd=add(r,[1,1]);R=dv(A,Bd);}while(p[1]===1||q[1]===1||r[1]===1||A[0]===0||R[1]===1||R[1]>60);
  return PQ.T('Počítání s čísly',[
    S.fields(`${fmt(x)} · ${par(y)} + ${fmt(c)} : ${fmt(d)}`,[{k:'num',a:res}],1,`Nejdřív násobení a dělení: ${fmt(x)} · ${par(y)} = ${fmt(r2(x*y))}, ${fmt(c)} : ${fmt(d)} = ${k}. Součet: ${fmt(res)}.`),
    S.fields(`${big(`${FF(p)} − ${FF(q)}`,`${FF(r)} + 1`)} &nbsp;(zlomkem v základním tvaru)`,[frF(R)],2,`Čitatel: ${FF(p)} − ${FF(q)} = ${FF(A)}. Jmenovatel: ${FF(r)} + 1 = ${FF(Bd)}. Podíl: ${FF(A)} · ${F(Bd[1],Bd[0])} = ${FF(R)}.`,
      {work:[`čitatel: ${FT(p)} − ${FT(q)} = ${FT(A)}`,`jmenovatel: ${FT(r)} + 1 = ${FT(Bd)}`,`${FT(A)} : ${FT(Bd)} = ${FT(A)} · ${FS(Bd[1],Bd[0])} = ${FT(R)}`]})],
   {intro:'Vypočtěte. U úlohy 2.2 se u přijímaček hodnotí i <b>celý postup</b> – zapiš si ho na papír.'});});

/* 3 – výrazy */
slot('ma3','Výrazy: dosazení, rozklad, úprava',()=>{
  const v=pick(['a','x','y']);const k=ri(2,5),m=ri(1,6),val=ri(-3,8);const c=[k*k,-2*k*m,m*m];const vv=r2(Math.pow(k*val-m,2));
  // rozklad
  let fq,fa,fe;const t=ri(0,2),u=ri(2,6),w=ri(1,7);
  if(t===0){fq=poly([u*u,0,-w*w],v);fa=`(${u}${v}-${w})(${u}${v}+${w})`;fe=`a² − b² = (a − b)(a + b): ${fq} = (${u}${v} − ${w})(${u}${v} + ${w}).`;}
  else if(t===1){fq=poly([1,2*w,w*w],v);fa=`(${v}+${w})^2`;fe=`(a + b)² = a² + 2ab + b²: ${fq} = (${v} + ${w})².`;}
  else{fq=poly([u,-u*w,0],v);fa=`${u}${v}(${v}-${w})`;fe=`Vytkneme ${u}${v}: ${fq} = ${u}${v}(${v} − ${w}).`;}
  // úprava
  let sq,sa,se,work;const a=ri(1,6),b=ri(1,6);
  if(Math.random()<0.5){sq=`(${v} + ${a})² − (${v} − ${b})(${v} + ${b})`;const res=[0,2*a,a*a+b*b];sa=poly(res,v).replace(/−/g,'-').replace(/²/g,'^2');
    work=[`(${v} + ${a})² = ${poly([1,2*a,a*a],v)}`,`(${v} − ${b})(${v} + ${b}) = ${poly([1,0,-b*b],v)}`,`${poly([1,2*a,a*a],v)} − ${v}² + ${b*b} = ${poly(res,v)}`];se=`Výsledek: ${poly(res,v)}.`;}
  else{sq=`2${v}(${v} − ${a}) − (${v} − ${b})²`;const res=[1,2*b-2*a,-b*b];sa=poly(res,v).replace(/−/g,'-').replace(/²/g,'^2');
    work=[`2${v}(${v} − ${a}) = ${poly([2,-2*a,0],v)}`,`(${v} − ${b})² = ${poly([1,-2*b,b*b],v)}`,`${poly([2,-2*a,0],v)} − ${v}² + ${2*b}${v} − ${b*b} = ${poly(res,v)}`];se=`Výsledek: ${poly(res,v)}.`;}
  return PQ.T('Výrazy',[
    S.fields(`Vypočtěte hodnotu výrazu ${poly(c,v)} pro ${v} = ${fmt(val)}.`,[{k:'num',a:vv}],1,`Výraz je (${k}${v} − ${m})². Pro ${v} = ${fmt(val)}: (${fmt(k*val)} − ${m})² = ${par(k*val-m)}² = ${fmt(vv)}. (Dosazením do původního tvaru vyjde totéž.)`),
    S.fields(`Rozložte na součin: ${fq}`,[{k:'expr',a:fa,vars:v,form:'prod'}],1,fe),
    S.fields(`Zjednodušte (výsledek bez závorek): ${sq}`,[{k:'expr',a:sa,vars:v,form:'simp'}],2,se,{work})],
   {intro:`Výrazy zapisuj s proměnnou ${v}, mocninu jako ${v}^2 nebo ${v}², násobení můžeš vynechat (např. 3${v}(${v}+1)).`});});

/* 4 – rovnice a soustava */
slot('ma4','Rovnice a soustava rovnic',()=>{
  let a,b,x,p,q,cc;do{a=pick([0.5,1.5,2.5,0.4,1.2,3]);b=pick([0.5,2,1.5,0.8,2.5]);x=ri(-6,12);p=ri(1,6);q=ri(1,8);cc=r2(a*(x-p)-b*(x+q));}while(a===b||String(cc).length>6);
  let x2,y2,A1,B1,A2,B2;do{x2=ri(-4,8);y2=ri(-4,8);A1=ri(1,5);B1=pick([-4,-3,-2,-1,1,2,3]);A2=pick([-3,-2,-1,1,2,3,4]);B2=ri(1,5);}while(A1*B2-A2*B1===0||(x2===0&&y2===0));
  const eq=(A,B,C)=>`${A===1?'':A===-1?'−':fmt(A)}x ${B<0?'−':'+'} ${Math.abs(B)===1?'':Math.abs(B)}y = ${fmt(C)}`;const C1=A1*x2+B1*y2,C2=A2*x2+B2*y2;
  return PQ.T('Rovnice',[
    S.fields(`Řešte rovnici: ${fmt(a)}(x − ${p}) − ${fmt(b)}(x + ${q}) = ${fmt(cc)}`,[{k:'num',a:x,l:'x ='}],2,`Roznásobíme: ${fmt(a)}x − ${fmt(r2(a*p))} − ${fmt(b)}x − ${fmt(r2(b*q))} = ${fmt(cc)}, tedy ${fmt(r2(a-b))}x = ${fmt(r2(cc+a*p+b*q))}, x = ${fmt(x)}. Zkouška dosazením potvrdí výsledek.`,
      {work:[`${fmt(a)}x − ${fmt(r2(a*p))} − ${fmt(b)}x − ${fmt(r2(b*q))} = ${fmt(cc)}`,`${fmt(r2(a-b))}x = ${fmt(r2(cc+a*p+b*q))}`,`x = ${fmt(x)}`]}),
    S.fields(`Řešte soustavu rovnic:<br>${eq(A1,B1,C1)}<br>${eq(A2,B2,C2)}`,[{k:'num',a:x2,l:'x ='},{k:'num',a:y2,l:'y ='}],2,`Řešení: x = ${fmt(x2)}, y = ${fmt(y2)}. Dosazovací nebo sčítací metodou; zkouška: ${A1}·${par(x2)} ${B1<0?'−':'+'} ${Math.abs(B1)}·${par(y2)} = ${C1}.`,
      {minus:1,work:['Vyjádři jednu neznámou z jedné rovnice nebo rovnice vhodně vynásob a sečti.',`x = ${fmt(x2)}, y = ${fmt(y2)}`,'Zkouška dosazením do obou rovnic.']})],
   {intro:'Řešte. U přijímaček se u obou rovnic hodnotí <b>celý postup</b>.'});});

/* 5 – slovní úloha s pastí */
slot('ma5','Slovní úloha (pozor na past)',()=>{
  const t=ri(0,2);let q,a,e;
  if(t===0){const k=pick([3,4,5]),m=ri(20,90),N=(k+1)*m*(k===3?1:1);const nm={3:'třetinu',4:'čtvrtinu',5:'pětinu'}[k];
    q=`Velký sud pojme o ${nm} více vody než malý. Velký sud pojme ${N} litrů. Kolik litrů pojme malý sud?`;a=k*m;e=`Malý sud = ${k} díly, velký = ${k+1} dílů. Jeden díl: ${N} : ${k+1} = ${m} l, malý sud: ${k} · ${m} = ${a} l. (Pozor: nestačí odečíst ${nm} z ${N}!)`;}
  else{const up=t===1,p=pick([20,25,10,50,40]),s=pick([40,60,80,120,200])*10;const N=r2(s*(up?1+p/100:1-p/100));
    q=`Po ${up?'zdražení':'zlevnění'} o ${p} % stojí bunda ${fmt(N)} Kč. Kolik korun stála před ${up?'zdražením':'zlevněním'}?`;a=s;
    e=`${fmt(N)} Kč je ${up?100+p:100-p} % původní ceny. 1 % = ${fmt(r2(N/(up?100+p:100-p)))} Kč, 100 % = ${fmt(s)} Kč. (Pozor: ${up?'odečíst':'přičíst'} ${p} % z nové ceny nestačí.)`;}
  return PQ.T('Slovní úloha',[S.fields(q,[{k:'num',a,l:''}],1,e)]);});

/* 6 – slovní úloha s neznámou */
const SIX=[{w:'Kniha má x stran. První den přečetla Klára',u:'stran',x1:'kolik stran přečetla první den',x2:'kolik stran jí zbývalo přečíst po druhém dni',x3:'Po druhém dni zbývalo Kláře přečíst',d2:'Druhý den přečetla',q3:'Kolik stran má kniha?'},
 {w:'Cyklotrasa měří x km. První den ujel Tomáš',u:'km',x1:'kolik km ujel první den',x2:'kolik km mu zbývalo ujet po druhém dni',x3:'Po druhém dni zbývalo Tomášovi ujet',d2:'Druhý den ujel',q3:'Kolik km měří cyklotrasa?'},
 {w:'Na výlet si Ema našetřila x Kč. První den utratila',u:'Kč',x1:'kolik Kč utratila první den',x2:'kolik Kč jí zbylo po druhém dni',x3:'Po druhém dni jí zbylo',d2:'Druhý den utratila',q3:'Kolik korun si Ema našetřila?'}];
slot('ma6','Slovní úloha s neznámou x',()=>{
  const T=pick(SIX),a=pick([3,4,5,6]),[b,c]=pick([[1,2],[1,3],[2,3],[3,4],[2,5]]),m=ri(2,6),x=a*c*m*pick([1,2,5]),R=x*(a-1)/a*(c-b)/c;
  const nm={3:'třetinu',4:'čtvrtinu',5:'pětinu',6:'šestinu'}[a];const fb=`${b}/${c}`;
  const intro=`${T.w} ${nm} z celku. ${T.d2} ${b===1?{2:'polovinu',3:'třetinu'}[c]:fb} zbytku.`;
  return PQ.T('Slovní úloha s neznámou',[
    S.fields(`Zapište výrazem s neznámou x, ${T.x1}.`,[{k:'expr',a:`x/${a}`,vars:'x'}],1,`${nm[0].toUpperCase()+nm.slice(1)} z x je x/${a}.`),
    S.fields(`Zapište výrazem s neznámou x, ${T.x2}.`,[{k:'expr',a:`x*(${a-1}/${a})*(${c-b}/${c})`,vars:'x'}],1,`Po prvním dni zbývá ${a-1}/${a} · x, druhý den ubude ${fb} zbytku, zůstane ${c-b}/${c} z něj: ${a-1}/${a} · ${c-b}/${c} · x = ${FS((a-1)*(c-b),a*c)} · x.`),
    S.fields(`${T.x3} ${fmt(R)} ${T.u}. ${T.q3}`,[{k:'num',a:x}],2,`${FS((a-1)*(c-b),a*c)} · x = ${fmt(R)}, tedy x = ${fmt(x)} ${T.u}.`,{work:[`${FS((a-1)*(c-b),a*c)} · x = ${fmt(R)}`,`x = ${fmt(R)} : ${FS((a-1)*(c-b),a*c)} = ${fmt(x)}`]})],
   {intro,src:{h:`<p>${intro}</p>`}});});

/* 7 – pohyb */
slot('ma7','Pohyb a rychlost',()=>{
  if(Math.random()<0.5){let v1,d,t0,cm;do{v1=pick([6,8,9,10,12]);d=pick([2,3,4,6]);t0=pick([10,15,20,30]);cm=v1*t0/d;}while(!Number.isInteger(cm)||cm>120);const v2=v1+d,head=r2(v1*t0/60),dist=r2(v2*cm/60);
    const txt=`Eva vyběhla ze startu rychlostí ${v1} km/h. Za ${t0} minut po ní vyběhla stejnou trasou Jana rychlostí ${v2} km/h. Obě běží stálou rychlostí.`;
    return PQ.T('Pohyb',[S.fields('Kolik km uběhla Eva, než vyběhla Jana?',[{k:'num',a:head}],1,`${v1} km/h · ${t0}/60 h = ${fmt(head)} km.`),
      S.fields('Za kolik minut od svého startu Jana Evu dostihne?',[{k:'num',a:cm}],1,`Jana se přibližuje rychlostí ${v2} − ${v1} = ${d} km/h. Náskok ${fmt(head)} km stáhne za ${fmt(head)} : ${d} h = ${cm} min.`),
      S.fields('Kolik km od startu Jana Evu dostihne?',[{k:'num',a:dist,tol:0.01}],1,`Jana poběží ${cm} min rychlostí ${v2} km/h: ${v2} · ${cm}/60 = ${fmt(dist)} km.`)],{src:{h:`<p>${txt}</p>`}});}
  let v1,v2,D,tm;do{v1=pick([40,50,60,70,80]);v2=pick([30,45,60,90,50]);tm=pick([30,40,45,60,90]);D=r2((v1+v2)*tm/60);}while(!Number.isInteger(D)||v1===v2);const sA=r2(v1*tm/60),t3=pick([10,15,20]),left=r2(D-(v1+v2)*t3/60);
  const txt=`Města K a L jsou od sebe vzdálena ${D} km. Ve stejnou chvíli vyjelo z K do L auto rychlostí ${v1} km/h a z L do K dodávka rychlostí ${v2} km/h.`;
  return PQ.T('Pohyb',[S.fields('Za kolik minut se auto a dodávka potkají?',[{k:'num',a:tm}],1,`Vzdálenost se zmenšuje rychlostí ${v1} + ${v2} = ${v1+v2} km/h. ${D} : ${v1+v2} h = ${tm} min.`),
    S.fields('Kolik km od města K se potkají?',[{k:'num',a:sA,tol:0.01}],1,`Auto ujede ${v1} · ${tm}/60 = ${fmt(sA)} km.`),
    S.fields(`Jak daleko od sebe budou ${t3} minut po startu? (v km)`,[{k:'num',a:left,tol:0.01}],1,`Za ${t3} min ujedou spolu ${v1+v2} · ${t3}/60 = ${fmt(r2((v1+v2)*t3/60))} km, zbývá ${fmt(left)} km.`)],{src:{h:`<p>${txt}</p>`}});});

/* 8 – úhly s obrázkem */
function fit(pts,W,H,pad){const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);const minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys);
  const s=Math.min((W-2*pad)/(maxx-minx||1),(H-2*pad)/(maxy-miny||1));return p=>[pad+(p[0]-minx)*s+((W-2*pad)-(maxx-minx)*s)/2,H-pad-(p[1]-miny)*s];}
const lbl=(p,t,dx,dy)=>`<text x="${(p[0]+dx).toFixed(1)}" y="${(p[1]+dy).toFixed(1)}">${t}</text>`;
const dot=p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3"/>`;
const ln=(a,b,c)=>`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"${c?` class="${c}"`:''}/>`;
const svg=(b,h)=>`<svg class="fig" viewBox="0 0 320 ${h||200}" role="img" aria-label="Obrázek k úloze">${b}</svg>`;
const rad=d=>d*Math.PI/180;
slot('ma8','Úhly v rovinném útvaru (obrázek)',()=>{
  if(Math.random()<0.5){let al,be,ga;do{al=ri(35,85);be=ri(35,85);ga=180-al-be;}while(ga%2||ga<30);
    const A=[0,0],B=[10,0],ac=10*Math.sin(rad(be))/Math.sin(rad(ga)),C=[ac*Math.cos(rad(al)),ac*Math.sin(rad(al))];
    const ad=10*Math.sin(rad(ga/2))/Math.sin(rad(180-al-ga/2)),D=[ad,0];const T=fit([A,B,C],320,200,24);const a=T(A),b=T(B),c=T(C),d=T(D);
    const fig=svg(`<polygon points="${[a,b,c].map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}"/>${ln(c,d,'acc')}${[a,b,c,d].map(dot).join('')}${lbl(a,'A',-14,14)}${lbl(b,'B',6,14)}${lbl(c,'C',-4,-8)}${lbl(d,'D',-4,16)}${lbl(a,al+'°',22,-6)}${lbl(b,be+'°',-42,-6)}`);
    const adc=180-al-ga/2;
    return PQ.T('Úhly',[S.fields('Jaká je velikost úhlu ACD (ve stupních)?',[{k:'num',a:ga/2}],1,`|∠ACB| = 180° − ${al}° − ${be}° = ${ga}°. Osa ho půlí: ${ga/2}°.`),
      S.fields('Jaká je velikost úhlu ADC (ve stupních)?',[{k:'num',a:adc}],2,`V trojúhelníku ADC: 180° − ${al}° − ${ga/2}° = ${adc}°.`,{work:[`|∠ACB| = 180° − ${al}° − ${be}° = ${ga}°`,`|∠ACD| = ${ga/2}°`,`|∠ADC| = 180° − ${al}° − ${ga/2}° = ${adc}°`]})],
      {src:{h:`<p>V trojúhelníku ABC je |∠BAC| = ${al}° a |∠ABC| = ${be}°. Úsečka CD leží na ose úhlu ACB, bod D leží na straně AB.</p>${fig}<p class="meta">Obrázek je jen ilustrační.</p>`}});}
  const al=ri(20,65);const S0=[0,0],A=[-5,0],B=[5,0],C=[5*Math.cos(rad(180-2*al)),5*Math.sin(rad(180-2*al))];
  const T=fit([A,B,C,[0,5],[0,-5]],320,210,20);const s=T(S0),a=T(A),b=T(B),c=T(C),R=(b[0]-a[0])/2;
  const fig=svg(`<circle cx="${s[0].toFixed(1)}" cy="${s[1].toFixed(1)}" r="${R.toFixed(1)}" class="thin"/><polygon points="${[a,b,c].map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}"/>${ln(s,c,'acc')}${[a,b,c,s].map(dot).join('')}${lbl(a,'A',-14,4)}${lbl(b,'B',6,4)}${lbl(c,'C',4,-8)}${lbl(s,'S',-4,16)}${lbl(a,al+'°',24,-4)}`,210);
  return PQ.T('Úhly',[S.fields('Jaká je velikost úhlu ABC (ve stupních)?',[{k:'num',a:90-al}],1,`Úhel ACB je pravý (Thaletova věta), proto |∠ABC| = 90° − ${al}° = ${90-al}°.`),
    S.fields('Jaká je velikost úhlu BSC (ve stupních)?',[{k:'num',a:2*al}],2,`Trojúhelník ASC je rovnoramenný (|SA| = |SC| = poloměr), proto |∠ACS| = ${al}° a |∠ASC| = ${180-2*al}°. Úhel BSC je k němu vedlejší: ${2*al}°.`,{work:[`|SA| = |SC| ⇒ |∠SCA| = |∠SAC| = ${al}°`,`|∠ASC| = 180° − 2 · ${al}° = ${180-2*al}°`,`|∠BSC| = 180° − ${180-2*al}° = ${2*al}°`]})],
    {src:{h:`<p>Úsečka AB je průměr kružnice se středem S. Bod C leží na kružnici, |∠CAB| = ${al}°.</p>${fig}<p class="meta">Obrázek je jen ilustrační.</p>`}});});

/* 9 – konstrukční úloha (zjednodušení) */
slot('ma9','Konstrukce: počet řešení a postup',()=>{
  const t=ri(0,2);let txt,n,q2,o,e1,e2;
  if(t===0){const c=ri(6,9),v=ri(3,5),b=v+pick([-1,0,1,2]);n=b>v?2:b===v?1:0;
    txt=`Sestrojte trojúhelník ABC, je-li |AB| = ${c} cm, výška na stranu AB v<sub>c</sub> = ${v} cm a |AC| = ${b} cm. Hledejte řešení jen v jedné polorovině s hraniční přímkou AB.`;
    e1=`Bod C leží na přímce rovnoběžné s AB ve vzdálenosti ${v} cm a zároveň na kružnici se středem A a poloměrem ${b} cm. ${n===2?`Poloměr ${b} cm je větší než ${v} cm, kružnice přímku protne ve 2 bodech.`:n===1?`Poloměr se rovná vzdálenosti přímky, kružnice se jí jen dotkne – 1 řešení.`:`Poloměr ${b} cm je menší než ${v} cm, kružnice přímku nezasáhne – úloha nemá řešení.`}`;
    o=[`přímce rovnoběžné s AB ve vzdálenosti ${v} cm a na kružnici se středem A a poloměrem ${b} cm`,b===v?`přímce rovnoběžné s AB ve vzdálenosti ${v} cm a na kružnici se středem B a poloměrem ${b} cm`:`přímce rovnoběžné s AB ve vzdálenosti ${b} cm a na kružnici se středem A a poloměrem ${v} cm`,`ose úsečky AB a na kružnici se středem A a poloměrem ${b} cm`,`Thaletově kružnici nad průměrem AB`];q2='Bod C je nutné hledat jako průsečík množin bodů. Leží na…';e2='Výška určuje vzdálenost bodu C od přímky AB, délka |AC| poloměr kružnice kolem A.';}
  else if(t===1){const c=pick([6,8,10]),v=c/2+pick([-1,0,1]);n=v<c/2?2:v===c/2?1:0;
    txt=`Sestrojte pravoúhlý trojúhelník ABC s přeponou AB, |AB| = ${c} cm, a výškou v<sub>c</sub> = ${fmt(v)} cm. Hledejte řešení jen v jedné polorovině s hraniční přímkou AB.`;
    e1=`Vrchol C leží na Thaletově kružnici nad AB (poloměr ${fmt(c/2)} cm) a na přímce rovnoběžné s AB ve vzdálenosti ${fmt(v)} cm. ${n===2?'Přímka kružnici protne ve 2 bodech.':n===1?'Přímka se kružnice dotkne – 1 řešení.':'Přímka je od AB dál než poloměr – řešení neexistuje.'}`;
    o=[`Thaletově kružnici nad průměrem AB a na přímce rovnoběžné s AB ve vzdálenosti ${fmt(v)} cm`,`ose úsečky AB a na přímce rovnoběžné s AB ve vzdálenosti ${fmt(v)} cm`,`kružnici se středem A a poloměrem ${fmt(v)} cm`,`Thaletově kružnici nad průměrem AB a na kružnici se středem B a poloměrem ${fmt(v)} cm`];q2='Vrchol C leží na…';e2='Pravý úhel u C ⇒ Thaletova kružnice; výška ⇒ rovnoběžka s AB.';}
  else{const d=ri(2,5),r=d+pick([-1,0,1,2]);n=r>d?2:r===d?1:0;
    txt=`Bod A má od přímky p vzdálenost ${d} cm. Sestrojte všechny body X, které leží na přímce p a mají od bodu A vzdálenost ${r} cm.`;
    e1=`Body X jsou průsečíky přímky p s kružnicí se středem A a poloměrem ${r} cm. ${n===2?`${r} > ${d}: 2 průsečíky.`:n===1?`${r} = ${d}: kružnice se přímky dotkne, 1 bod.`:`${r} < ${d}: žádný průsečík.`}`;
    o=[`na kružnici se středem A a poloměrem ${r} cm`,`na přímce rovnoběžné s p ve vzdálenosti ${r} cm`,`na kolmici k přímce p vedené bodem A`,`na ose úhlu, který svírá p s kolmicí z A`];q2='Kromě přímky p musí bod X ležet…';e2='Vzdálenost od bodu A = kružnice se středem A.';}
  const sk=t===2?svg(`<line x1="20" y1="150" x2="300" y2="150"/><text x="290" y="168">p</text>${dot([160,70])}${lbl([160,70],'A',6,-6)}<line class="dash" x1="160" y1="70" x2="160" y2="150"/>${lbl([160,110],'?',6,4)}`,180):svg(`<line x1="40" y1="150" x2="280" y2="150"/>${dot([40,150])}${dot([280,150])}${lbl([40,150],'A',-14,14)}${lbl([280,150],'B',6,14)}<line class="dash" x1="10" y1="60" x2="310" y2="60"/>${t===1?'<circle class="thin" cx="160" cy="150" r="120"/>':''}<text class="sm" x="12" y="54">náčrt – ${t===1?'Thaletova kružnice a rovnoběžka':'rovnoběžka s AB'}</text>`,180);
  txt+=sk;const ix=PQ.shuffle([0,1,2,3]);
  return PQ.T('Konstrukce',[S.fields('Kolik řešení úloha má?',[{k:'num',a:n}],1,e1),S.mc(q2,ix.map(i=>o[i]),ix.indexOf(0),2,e2)],
    {src:{h:`<p>${txt}</p>`},note:'Zjednodušení: u přijímaček tuto úlohu skutečně rýsuješ (a musíš narýsovat všechna řešení). Tady si ověříš úvahu, která za konstrukcí stojí – rýsování si zkus na papír.'});});

/* 10 – souřadnice v síti */
function grid(points,extra){let g='';for(let i=0;i<=10;i++){g+=`<line class="grid" x1="${20+i*28}" y1="10" x2="${20+i*28}" y2="290"/><line class="grid" x1="20" y1="${10+i*28}" x2="300" y2="${10+i*28}"/>`;}
  g+=`<line class="axis" x1="20" y1="290" x2="306" y2="290"/><line class="axis" x1="20" y1="290" x2="20" y2="4"/>`;for(let i=0;i<=10;i+=2)g+=`<text class="sm" x="${16+i*28}" y="304">${i}</text>`+(i?`<text class="sm" x="4" y="${294-i*28}">${i}</text>`:'');
  const P=p=>[20+p[0]*28,290-p[1]*28];return `<svg class="fig" viewBox="0 0 320 310" role="img" aria-label="Čtvercová síť">${g}${extra?extra(P):''}${points.map(([n,p])=>{const q=P(p);return dot(q)+lbl(q,n,5,-6);}).join('')}</svg>`;}
slot('ma10','Souřadnice: rovnoběžník, souměrnost',()=>{
  if(Math.random()<0.55){let A,B,C,D;do{A=[ri(0,4),ri(0,3)];B=[ri(4,9),ri(0,4)];C=[ri(4,10),ri(5,10)];D=[A[0]+C[0]-B[0],A[1]+C[1]-B[1]];}while(D[0]<0||D[0]>10||D[1]<0||D[1]>10||(B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0])===0);
    return PQ.T('Souřadnice',[S.fields('Určete souřadnice vrcholu D rovnoběžníku ABCD.',[{k:'num',a:D[0],l:'x ='},{k:'num',a:D[1],l:'y ='}],2,`Posun z B do A je (${A[0]-B[0]}; ${A[1]-B[1]}). Stejným posunem z C dostaneme D = [${D[0]}; ${D[1]}].`,{each:1})],
      {src:{h:`<p>Body A[${A}], B[${B}] a C[${C}] jsou vrcholy rovnoběžníku ABCD (vrcholy jdou v tomto pořadí za sebou).</p>${grid([['A',A],['B',B],['C',C]],P=>`<polyline class="acc" points="${[A,B,C].map(p=>P(p).join(',')).join(' ')}"/>`)}`.replace(/\[(\d+),(\d+)\]/g,'[$1; $2]')},note:'Zjednodušení: u přijímaček podobnou úlohu rýsuješ. Tady počítáš souřadnice.'});}
  let A,Sx;do{A=[ri(0,6),ri(0,10)];Sx=[ri(3,7),ri(2,8)];}while(2*Sx[0]-A[0]>10||2*Sx[1]-A[1]>10||2*Sx[1]-A[1]<0||(A[0]===Sx[0]&&A[1]===Sx[1]));const A2=[2*Sx[0]-A[0],2*Sx[1]-A[1]];
  return PQ.T('Souřadnice',[S.fields('Určete souřadnice bodu A′, který je obrazem bodu A ve středové souměrnosti se středem S.',[{k:'num',a:A2[0],l:'x ='},{k:'num',a:A2[1],l:'y ='}],2,`S je střed úsečky AA′. Posun z A do S je (${Sx[0]-A[0]}; ${Sx[1]-A[1]}), stejný posun z S dá A′ = [${A2[0]}; ${A2[1]}].`,{each:1})],
    {src:{h:`<p>V síti jsou body A[${A[0]}; ${A[1]}] a S[${Sx[0]}; ${Sx[1]}].</p>${grid([['A',A],['S',Sx]])}`},note:'Zjednodušení: u přijímaček podobnou úlohu rýsuješ. Tady počítáš souřadnice.'});});

/* 11 – diagram, svazek ANO/NE (3 podúlohy, max. 4 b) */
const COL=['#5e5ce6','#ff375f','#30b0c7','#ffcc00','#34c759'];
slot('ma11','Kruhový diagram – ANO/NE',()=>{
  const ctx=pick([{t:'Žáci 9. ročníků města hlasovali o cíli výletu.',c:['hory','moře','město','zoo','vodní park'],u:'žáků'},{t:'Zahradnictví prodalo během jara sazenice.',c:['rajčata','papriky','okurky','dýně','bylinky'],u:'sazenic'},{t:'Knihovna sledovala, jaké knihy si čtenáři půjčovali.',c:['detektivky','fantasy','komiksy','naučné','poezie'],u:'výpůjček'}]);
  let p;do{p=[ri(2,9),ri(2,8),ri(1,6),ri(1,4)].map(x=>x*5);p.push(100-p.reduce((a,b)=>a+b,0));}while(p[4]<5||new Set(p).size<5);
  const N=pick([200,400,600,800,1200]);const cnt=p.map(x=>x*N/100);const nm=ctx.c;
  // diagram
  let ang=-90,sl='',leg='';p.forEach((x,i)=>{const a0=rad(ang),a1=rad(ang+x*3.6);const big=x>50?1:0;const P=a=>[90+70*Math.cos(a),100+70*Math.sin(a)];const s=P(a0),e=P(a1);
    sl+=`<path d="M90 100 L${s[0].toFixed(1)} ${s[1].toFixed(1)} A70 70 0 ${big} 1 ${e[0].toFixed(1)} ${e[1].toFixed(1)}Z" fill="${COL[i]}"/>`;leg+=`<rect x="186" y="${32+i*28}" width="14" height="14" rx="3" fill="${COL[i]}"/><text x="206" y="${44+i*28}">${nm[i]} ${x} %</text>`;ang+=x*3.6;});
  const fig=`<svg class="fig" viewBox="0 0 320 200" role="img" aria-label="Kruhový diagram">${sl}${leg}</svg>`;
  const S3=[];const i=ri(0,4),j=(i+1+ri(0,3))%5;
  const pairs=[()=>{const tr=p[i]>25;return [`Kategorie „${nm[i]}“ tvoří více než čtvrtinu celku.`,tr];},
    ()=>{const tr=Math.random()<0.5,v=tr?cnt[i]+cnt[j]:cnt[i]+cnt[j]+N/20;return [`Kategorie „${nm[i]}“ a „${nm[j]}“ mají dohromady ${fmt(v)} ${ctx.u}.`,tr];},
    ()=>{let k=ri(0,4),l=(k+2)%5;if(cnt[k]===cnt[l])l=(k+1)%5;const tr=Math.random()<0.5,dd=Math.abs(cnt[k]-cnt[l])+(tr?0:N/20);return [`Kategorie „${nm[k]}“ má o ${fmt(dd)} ${ctx.u} ${cnt[k]>cnt[l]?'více':'méně'} než kategorie „${nm[l]}“.`,tr];},
    ()=>{const k=ri(0,4),l=(k+3)%5;const r=p[k]/p[l];const tr=Number.isInteger(r)&&r>1;const m=tr?r:pick([2,3]);return [`Kategorie „${nm[k]}“ je ${m===2?'dvakrát':'třikrát'} větší než kategorie „${nm[l]}“.`,tr&&m===r];},
    ()=>{const s3=p[0]+p[1]+p[2];return [`Kategorie „${nm[0]}“, „${nm[1]}“ a „${nm[2]}“ tvoří dohromady víc než tři čtvrtiny celku.`,s3>75];}];
  const pk=PQ.shuffle(pairs).slice(0,3).map(f=>f());
  return PQ.T('Diagram',[S.yn('Rozhodněte o každém tvrzení, zda je pravdivé (A), či nikoli (N).',pk,4,{3:4,2:2},`Celkem ${N} ${ctx.u}, 1 % = ${N/100}. Počty: ${nm.map((n,k)=>`${n} ${fmt(cnt[k])}`).join(', ')}.`)],
    {src:{h:`<p>${ctx.t} Celkem bylo ${N} ${ctx.u}. Diagram ukazuje rozdělení v procentech.</p>${fig}`},note:'Hodnocení: 3 správně = 4 b, 2 správně = 2 b, jinak 0 b.'});});

/* 12–14 – uzavřené úlohy A–E s možností „jiné řešení“ */
slot('ma12','Procenta (A–E)',()=>{
  if(Math.random()<0.5){const K=pick([200,250,400,500]),p1=pick([40,50,60,70]),add_=pick([10,20,25,40,50]),o2=K*p1/100+add_;const pc=r2(100*o2/K);
    return PQ.T('Procenta',[PQ.mcE(`Divadlo má ${K} míst. Na první představení se prodalo ${p1} % míst, na druhé o ${add_} vstupenek více. Kolik procent míst bylo obsazeno na druhém představení?`,pc,[p1+add_,r2(pc+5),r2(pc-5),r2(100-pc)],2,`První: ${K*p1/100} míst, druhé: ${o2} míst, to je ${o2} : ${K} = ${fmt(pc)} %.`,{fmt:x=>fmt(x)+' %'})]);}
  const [a,b]=pick([[10,20],[20,10],[10,30],[20,25],[30,10],[50,20]]);const tot=r2(100-(100-a)*(100-b)/100);
  return PQ.T('Procenta',[PQ.mcE(`Cenu kola nejprve snížili o ${a} % a novou cenu pak ještě o ${b} %. O kolik procent je výsledná cena nižší než původní?`,tot,[a+b,r2(tot+2),r2(100-tot),r2(tot-3)],2,`Po slevách zůstane ${(100-a)/100} · ${(100-b)/100} = ${fmt(r2((100-a)*(100-b)/10000))} původní ceny, tedy pokles o ${fmt(tot)} %. (Procenta se tu nesčítají!)`,{fmt:x=>fmt(x)+' %'})]);});
const TRI=[[5,12,13],[8,6,10],[6,8,10],[9,12,15],[12,5,13],[8,15,17],[12,9,15]];
slot('ma13','Obsah trojúhelníku/kosočtverce (A–E)',()=>{
  const k=pick([1,1,2]);if(Math.random()<0.6){const [h0,b0,l0]=pick(TRI);const h=h0*k,half=b0*k,l=l0*k,base=2*half,P=base+2*l,A=half*h;
    const T0=fit([[0,0],[base,0],[half,h]],320,170,24);const A_=T0([0,0]),B_=T0([base,0]),C_=T0([half,h]);const fig=svg(`${tri([A_,B_,C_])}${lbl([(A_[0]+B_[0])/2,A_[1]],base+' cm',-14,16)}${lbl(C_,'?',-4,-8)}`,190);
    return PQ.T('Geometrie',[PQ.mcE(`Rovnoramenný trojúhelník (viz obrázek) má obvod ${P} cm a základnu dlouhou ${base} cm. Jaký je jeho obsah?${fig}`,A,[base*h,base*l/2,l*h,A+half],2,`Rameno: (${P} − ${base}) : 2 = ${l} cm. Výška k základně (Pythagorova věta): √(${l}² − ${half}²) = ${h} cm. Obsah: ${base} · ${h} : 2 = ${A} cm².`,{fmt:x=>fmt(x)+' cm²'})]);}
  const [p,q,s]=pick([[3,4,5],[6,8,10],[5,12,13],[8,15,17]]).map(x=>x*k);const d1=2*q,d2=2*p,A=d1*d2/2;
  const Rt=fit([[0,0],[q,p],[2*q,0],[q,-p]],320,170,24);const R0=Rt([0,0]),R1=Rt([q,p]),R2=Rt([2*q,0]),R3=Rt([q,-p]);const rf=svg(`${tri([R0,R1,R2,R3])}${ln(R0,R2,'dash')}${lbl([(R0[0]+R2[0])/2,R0[1]],d1+' cm',-14,-6)}${lbl([(R0[0]+R1[0])/2,(R0[1]+R1[1])/2],'a',-14,-2)}`,180);
  return PQ.T('Geometrie',[PQ.mcE(`Kosočtverec (viz obrázek) má obvod ${4*s} cm a jednu úhlopříčku dlouhou ${d1} cm. Jaký je jeho obsah?${rf}`,A,[d1*d2,s*d1,A+d1,s*s],2,`Strana ${s} cm, polovina známé úhlopříčky ${q} cm, polovina druhé: √(${s}² − ${q}²) = ${p} cm, druhá úhlopříčka ${d2} cm. Obsah: ${d1} · ${d2} : 2 = ${A} cm².`,{fmt:x=>fmt(x)+' cm²'})]);});
slot('ma14','Povrch těles (A–E)',()=>{
  if(Math.random()<0.5){const a=ri(10,20),b=ri(3,9),c=ri(2,8);return PQ.T('Tělesa',[PQ.mcE(`${cuboid(a,b,c,a+' cm',b+' cm',c+' cm')}Kvádr s rozměry ${a} cm, ${b} cm a ${c} cm rozřízneme rovinou kolmou k nejdelší hraně na dva menší kvádry. O kolik cm² je součet povrchů obou menších kvádrů větší než povrch původního kvádru?`,2*b*c,[b*c,4*b*c,2*a*b,2*(a*b+b*c+a*c)],2,`Řezem vzniknou dvě nové stěny, každá ${b} cm × ${c} cm: 2 · ${b} · ${c} = ${2*b*c} cm².`,{fmt:x=>fmt(x)+' cm²'})]);}
  const a=ri(3,12),n=pick([2,3]);return PQ.T('Tělesa',[PQ.mcE(`${cuboid(n,1,1,'','','')}Ze ${n===2?'dvou':'tří'} stejných krychlí s hranou ${a} cm slepíme stěnami kvádr (krychle jsou v řadě za sebou). O kolik cm² je povrch kvádru menší než součet povrchů všech krychlí?`,2*(n-1)*a*a,[(n-1)*a*a,6*n*a*a-2*a*a,2*n*a*a,4*(n-1)*a*a],2,`Každým slepením zmizí 2 stěny po ${a*a} cm². Slepení jsou ${n-1}: ${2*(n-1)} · ${a*a} = ${2*(n-1)*a*a} cm².`,{fmt:x=>fmt(x)+' cm²'})]);});

/* 15 – přiřazovací svazek (3 podúlohy, 6 možností, 2 b za každou) */
slot('ma15','Přiřazování výsledků – objemy',()=>{
  let r,a,b,c,h,e,p,q,v;do{a=ri(3,8);b=ri(2,5);h=ri(2,6);e=ri(2,6);p=ri(3,8);q=ri(2,6);v=ri(3,9);r=[a*b*h,e*e*e,p*q*v/2];}while(new Set(r).size<3||(p*q)%2);
  const items=[`Akvárium tvaru kvádru má dno ${a} dm × ${b} dm a voda v něm sahá do výšky ${h} dm. Kolik litrů vody obsahuje?`,`Krychle má povrch ${6*e*e} cm². Kolik cm³ je její objem?`,`Hranol má podstavu tvaru pravoúhlého trojúhelníku s odvěsnami ${p} cm a ${q} cm a výšku ${v} cm. Kolik cm³ je jeho objem?`];
  items[0]=cuboid(a,b,h+1,a+' dm',b+' dm','')+items[0];
  const dis=new Set();[r[0]*2,e*e*6,p*q*v,r[2]+v,e*e*4,(a+b)*h].forEach(x=>{if(!r.includes(x))dis.add(x);});const o=PQ.shuffle(r.concat([...dis].slice(0,3)));
  return PQ.T('Přiřazování',[S.match('Přiřaďte ke každé úloze (15.1–15.3) správný výsledek (A–F).',items,o.map(String),r.map(x=>o.indexOf(x)),6,`15.1: ${a} · ${b} · ${h} = ${r[0]} dm³ = ${r[0]} l. 15.2: stěna má ${e*e} cm², hrana ${e} cm, objem ${e}³ = ${r[1]} cm³. 15.3: podstava ${p} · ${q} : 2 = ${p*q/2} cm², objem ${p*q/2} · ${v} = ${r[2]} cm³.`)],
    {note:'Každá možnost se dá použít nejvýše jednou; tři zbudou. Za každé správné přiřazení 2 body.'});});

/* 16 – posloupnosti a vzory */
slot('ma16','Vzor a posloupnost',()=>{
  if(Math.random()<0.5){let n3;do{n3=ri(6,12);}while(n3*n3-4*n3-4<=0);const D=n3*n3-4*n3-4,k1=ri(4,7),k2=ri(8,15);
    let f='';[1,2,3].forEach((n,ix)=>{const x0=8+[0,58,140][ix],s=12;for(let i=0;i<n+2;i++)for(let j=0;j<n+2;j++){const edge=i===0||j===0||i===n+1||j===n+1;f+=`<rect x="${x0+i*s}" y="${30+j*s}" width="${s-1}" height="${s-1}" rx="2" fill="${edge?'#8e8e93':'#fff'}" stroke="#8e8e93" stroke-width=".6"/>`;}f+=`<text x="${x0}" y="${22}">${n}. obrazec</text>`;});
    return PQ.T('Vzor',[S.fields(`Kolik šedých dlaždic má ${k1}. obrazec?`,[{k:'num',a:4*k1+4}],1,`Šedý rám n-tého obrazce: 4n + 4 dlaždic (4 strany po n a 4 rohy). Pro n = ${k1}: ${4*k1+4}.`),
      S.fields(`Kolik dlaždic celkem má ${k2}. obrazec?`,[{k:'num',a:(k2+2)*(k2+2)}],1,`Celý obrazec je čtverec (n + 2) × (n + 2): ${k2+2}² = ${(k2+2)*(k2+2)}.`),
      S.fields(`Ve kterém obrazci je bílých dlaždic o ${D} více než šedých?`,[{k:'num',a:n3}],2,`Bílých je n², šedých 4n + 4. Hledáme n² − (4n + 4) = ${D}; zkoušením: n = ${n3} (${n3*n3} − ${4*n3+4} = ${D}).`)],
      {src:{h:`<p>Obrazce skládáme z dlaždic: n-tý obrazec tvoří bílý čtverec n × n obklopený rámem ze šedých dlaždic.</p><svg class="fig" viewBox="0 0 320 110" role="img" aria-label="První tři obrazce">${f}</svg>`}});}
  let s0,a,b,c;do{s0=ri(0,6);a=ri(1,3);b=ri(2,5);c=ri(5,9);}while(12*a+4*b-3*c<3);let st=s0,hist=[s0];for(let t=1;t<=200;t++){st+=a;if(t%3===0)st+=b;if(t%4===0)st-=c;hist.push(st);}
  const t1=ri(5,9),t2=pick([24,30,36]);let M,first;do{M=hist[ri(20,90)];first=hist.findIndex(x=>x>M);}while(first<10||first>150);
  return PQ.T('Posloupnost',[S.fields(`Kolik kuliček je v krabici po ${t1}. sekundě?`,[{k:'num',a:hist[t1]}],1,`Stačí poctivě projít sekundy: po ${t1}. sekundě ${hist[t1]} kuliček.`),
    S.fields(`Kolik kuliček je v krabici po ${t2}. sekundě?`,[{k:'num',a:hist[t2]}],1,`Za každých 12 sekund přibude 12 · ${a} + 4 · ${b} − 3 · ${c} = ${12*a+4*b-3*c} kuliček. Po ${t2}. sekundě: ${hist[t2]}.`),
    S.fields(`Po které sekundě bude v krabici poprvé více než ${M} kuliček?`,[{k:'num',a:first}],2,`Za 12 s přibude ${12*a+4*b-3*c}; počty po sekundách stoupají nerovnoměrně. Poprvé přes ${M}: po ${first}. sekundě (${hist[first]} kuliček).`)],
    {src:{h:`<p>Na začátku je v krabici ${s0} kuliček. Robot Alfa přidá každou sekundu ${a} ${kul(a)}. Robot Beta přidá každou třetí sekundu (po 3., 6., 9. … sekundě) ${b} ${kul(b)}. Robot Gama každou čtvrtou sekundu (po 4., 8., 12. … sekundě) ${c} ${kul(c)} odebere.</p>`}});});


/* ===== grafické úlohy navíc (procvičování) ===== */
const tri=(pts,cls)=>`<polygon${cls?` class="${cls}"`:''} points="${pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}"/>`;
const rightMark=(p,u,v)=>{const a=[p[0]+u[0]*10,p[1]+u[1]*10],b=[a[0]+v[0]*10,a[1]+v[1]*10],c=[p[0]+v[0]*10,p[1]+v[1]*10];return `<polyline class="thin" fill="none" points="${[a,b,c].map(q=>q.join(',')).join(' ')}"/>`;};
function cuboid(a,b,c,la,lb,lc){const s=Math.min(150/(a+b*0.5),120/(c+b*0.5));const A=a*s,B=b*s*0.5,C=c*s;const x0=40,y0=170;
  const f=[[x0,y0],[x0+A,y0],[x0+A,y0-C],[x0,y0-C]],o=[B,-B];const bk=f.map(p=>[p[0]+o[0],p[1]+o[1]]);
  return svg(`${tri(f)}<polygon class="top" points="${[f[3],f[2],bk[2],bk[3]].map(p=>p.join(',')).join(' ')}"/><polygon class="top" points="${[f[1],bk[1],bk[2],f[2]].map(p=>p.join(',')).join(' ')}"/>${ln(f[0],bk[0],'dash')}${ln(bk[0],bk[1],'dash')}${ln(bk[0],bk[3],'dash')}${lbl([x0+A/2,y0],la,-10,16)}${lbl([x0+A,y0],lb,B/2+2,-B/2+12)}${lbl([x0,y0-C/2],lc,-36,4)}`,200);}
slot('maPyth','Pythagorova věta v obrázku',()=>{let a,b,c;do{const [a0,b0,c0]=pick(TRI.concat([[3,4,5],[7,24,25]]));const k=pick([1,1,2,0.5]);a=a0*k;b=b0*k;c=c0*k;}while(c*c-(b+1)*(b+1)<=1);
  if(Math.random()<0.5){const T=fit([[0,0],[b,0],[0,a]],320,190,26);const P0=T([0,0]),P1=T([b,0]),P2=T([0,a]);
    const fig=svg(`${tri([P0,P1,P2])}${rightMark(P0,[1,0],[0,-1])}${lbl([(P0[0]+P1[0])/2,P0[1]],fmt(b)+' m',-14,16)}${lbl([P0[0],(P0[1]+P2[1])/2],'?',-16,4)}${lbl([(P1[0]+P2[0])/2,(P1[1]+P2[1])/2],fmt(c)+' m',8,-4)}`,200);
    return PQ.T('Pythagorova věta',[S.fields('Do jaké výšky (v m) žebřík dosáhne?',[{k:'num',a:a,tol:0.001}],1,`Žebřík je přepona: výška = √(${fmt(c)}² − ${fmt(b)}²) = √${fmt(r2(c*c-b*b))} = ${fmt(a)} m.`),
      S.fields('Žebřík posuneme tak, že jeho pata bude o 1 m dál od zdi. O kolik metrů níž (zaokrouhleno na desetiny) teď sahá? ',[{k:'num',a:r2(Math.round((a-Math.sqrt(c*c-(b+1)*(b+1)))*10)/10),tol:0.051}],2,`Nová výška: √(${fmt(c)}² − ${fmt(b+1)}²) ≈ ${fmt(Math.round(Math.sqrt(c*c-(b+1)*(b+1))*100)/100)} m. Rozdíl ≈ ${fmt(Math.round((a-Math.sqrt(c*c-(b+1)*(b+1)))*10)/10)} m.`,{work:[`původní výška: √(${fmt(c)}² − ${fmt(b)}²) = ${fmt(a)} m`,`nová výška: √(${fmt(c)}² − ${fmt(b+1)}²)`,'rozdíl obou výšek, zaokrouhlit na desetiny']})],
      {src:{h:`<p>Žebřík dlouhý ${fmt(c)} m je opřený o svislou zeď, jeho pata je ${fmt(b)} m od zdi (viz obrázek).</p>${fig}<p class="meta">Obrázek je jen ilustrační.</p>`}});}
  const T=fit([[0,0],[2*b,0],[b,a]],320,180,26);const A=T([0,0]),B=T([2*b,0]),C=T([b,a]),D=T([b,0]);
  const fig=svg(`${tri([A,B,C])}${ln(C,D,'dash')}${rightMark(D,[1,0],[0,-1])}${lbl(A,'A',-14,14)}${lbl(B,'B',6,14)}${lbl(C,'C',-4,-8)}${lbl(D,'D',-4,16)}${lbl([(A[0]+C[0])/2,(A[1]+C[1])/2],fmt(c)+' cm',-58,0)}${lbl([(A[0]+D[0])/2,A[1]],fmt(b)+' cm',-14,16)}`,200);
  return PQ.T('Pythagorova věta',[S.fields('Jak dlouhá je výška CD (v cm)?',[{k:'num',a:a,tol:0.001}],1,`Trojúhelník ADC je pravoúhlý: |CD| = √(${fmt(c)}² − ${fmt(b)}²) = ${fmt(a)} cm.`),
    S.fields('Jaký je obsah trojúhelníku ABC (v cm²)?',[{k:'num',a:r2(b*a),tol:0.001}],2,`Základna ${fmt(2*b)} cm, výška ${fmt(a)} cm: ${fmt(2*b)} · ${fmt(a)} : 2 = ${fmt(r2(a*b))} cm².`,{work:[`|AB| = 2 · ${fmt(b)} = ${fmt(2*b)} cm`,`|CD| = √(${fmt(c)}² − ${fmt(b)}²) = ${fmt(a)} cm`,`S = ${fmt(2*b)} · ${fmt(a)} : 2 = ${fmt(r2(a*b))} cm²`]})],
    {src:{h:`<p>Trojúhelník ABC je rovnoramenný se základnou AB, |AC| = |BC| = ${fmt(c)} cm, |AD| = ${fmt(b)} cm, D je pata výšky z vrcholu C.</p>${fig}<p class="meta">Obrázek je jen ilustrační.</p>`}});},{fig:1});
slot('maNet','Síť a povrch tělesa',()=>{let a,b,c;do{a=ri(2,7);b=ri(2,6);c=ri(1,5);}while(a===b&&b===c);const S0=2*(a*b+b*c+a*c),V=a*b*c;
  const u=Math.min(26,280/(2*a+2*c),200/(2*c+b)),x0=10,y0=10;const R=(x,y,w,h,f)=>`<rect x="${x0+x*u}" y="${y0+y*u}" width="${w*u}" height="${h*u}" class="${f||'face'}"/>`;
  // síť kvádru: pás c,a,c,a vodorovně (výška b), nad a pod druhým dílem stěny a×c
  const net=R(0,c,c,b)+R(c,c,a,b,'face on')+R(c+a,c,c,b)+R(2*c+a,c,a,b)+R(c,0,a,c)+R(c,c+b,a,c);
  const fig=`<svg class="fig" viewBox="0 0 ${x0*2+(2*a+2*c)*u} ${y0*2+(2*c+b)*u+14}" role="img" aria-label="Síť kvádru">${net}<text class="sm" x="${x0+(c+a/2)*u-8}" y="${y0+(c+b)*u+14}">${a} cm</text><text class="sm" x="${x0+(c+a)*u+4}" y="${y0+(c+b/2)*u+4}">${b} cm</text><text class="sm" x="${x0+(c+a/2)*u-8}" y="${y0+(2*c+b)*u+14}">${c} cm</text></svg>`;
  return PQ.T('Tělesa',[S.fields('Jaký je povrch kvádru (v cm²)?',[{k:'num',a:S0}],1,`Stěny: 2 · (${a}·${b} + ${b}·${c} + ${a}·${c}) = ${S0} cm².`),
    S.fields('Jaký je objem kvádru (v cm³)?',[{k:'num',a:V}],1,`${a} · ${b} · ${c} = ${V} cm³.`),
    S.fields(`Kvádr obarvíme a rozřežeme na krychličky s hranou 1 cm. Kolik krychliček nebude mít obarvenou žádnou stěnu?`,[{k:'num',a:Math.max(0,a-2)*Math.max(0,b-2)*Math.max(0,c-2)}],2,`Neobarvené jsou jen vnitřní krychličky: (${a} − 2) · (${b} − 2) · (${c} − 2) = ${Math.max(0,a-2)*Math.max(0,b-2)*Math.max(0,c-2)} (záporný či nulový činitel znamená 0).`)],
    {src:{h:`<p>Na obrázku je síť kvádru s rozměry ${a} cm, ${b} cm a ${c} cm (zvýrazněná je jedna stěna ${a} cm × ${b} cm).</p>${fig}`}});},{fig:1});
slot('maBar','Sloupcový graf',()=>{const m=['leden','únor','březen','duben','květen'];let v;do{v=m.map(()=>ri(4,24)*5);}while(v.reduce((a,b)=>a+b,0)%5||new Set(v).size<5);
  const mx=Math.max(...v),avg=r2(v.reduce((a,b)=>a+b,0)/5);const i=ri(0,3),j=i+1;const pc=r2(100*(v[j]-v[i])/v[i]);
  let g='';for(let k=0;k<=mx;k+=20){const y=170-k*140/mx;g+=`<line class="grid" x1="34" x2="310" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/><text class="sm" x="4" y="${(y+4).toFixed(1)}">${k}</text>`;}
  v.forEach((x,k)=>{const h=x*140/mx;g+=`<rect x="${48+k*52}" y="${(170-h).toFixed(1)}" width="34" height="${h.toFixed(1)}" rx="4" fill="#5e5ce6"/><text class="sm" x="${48+k*52}" y="186">${m[k]}</text>`;});
  const fig=`<svg class="fig" viewBox="0 0 320 196" role="img" aria-label="Sloupcový graf">${g}</svg>`;
  const good=Number.isInteger(pc*10);
  return PQ.T('Graf',[S.fields('Kolik kol se v průměru prodalo za jeden měsíc?',[{k:'num',a:avg,tol:0.001}],1,`(${v.join(' + ')}) : 5 = ${fmt(avg)}.`),
    S.fields(`O kolik procent se v měsíci ${m[j]} prodalo ${v[j]>=v[i]?'více':'méně'} kol než v měsíci ${m[i]}? (zaokrouhlete na celá procenta)`,[{k:'num',a:Math.round(Math.abs(pc)),tol:0.5}],2,`Rozdíl ${Math.abs(v[j]-v[i])} kol vztáhneme k měsíci ${m[i]} (${v[i]} kol): ${Math.abs(v[j]-v[i])} : ${v[i]} · 100 ≈ ${Math.round(Math.abs(pc))} %.`,{work:[`rozdíl: ${Math.abs(v[j]-v[i])}`,`základ = ${m[i]}: ${v[i]}`,`${Math.abs(v[j]-v[i])} : ${v[i]} · 100 ≈ ${Math.round(Math.abs(pc))} %`]})],
    {src:{h:`<p>Graf ukazuje, kolik kol prodal obchod v jednotlivých měsících (odečítej s přesností na 5 kusů – každá hodnota je násobkem 5).</p>${fig}<p class="meta">Hodnoty: ${v.map((x,k)=>m[k]+' '+x).join(', ')}.</p>`}});},{fig:1});
slot('maLine','Číselná osa a zlomky',()=>{let n,x,y;do{n=pick([3,4,5,6,8]);x=ri(1,2*n-1);y=ri(1,2*n-1);}while(x>=y||y-x<2);
  const P=t=>30+t*260/(2*n);let g=`<line class="axis" x1="20" x2="300" y1="60" y2="60"/>`;for(let k=0;k<=2*n;k++){const big=k%n===0;g+=`<line x1="${P(k)}" x2="${P(k)}" y1="${big?50:54}" y2="${big?70:66}"/>`+(big?`<text x="${P(k)-4}" y="88">${k/n}</text>`:'');}
  g+=`<circle cx="${P(x)}" cy="60" r="5" fill="#ff375f"/><text x="${P(x)-4}" y="40">X</text><circle cx="${P(y)}" cy="60" r="5" fill="#5e5ce6"/><text x="${P(y)-4}" y="40">Y</text>`;
  const fig=`<svg class="fig" viewBox="0 0 320 100" role="img" aria-label="Číselná osa">${g}</svg>`;const X=fr(x,n),Y=fr(y,n),Dd=fr(y-x,n),M=fr(x+y,2*n);
  return PQ.T('Číselná osa',[S.fields('Které číslo odpovídá bodu X?',[frF(X)],1,`Jednotka je rozdělena na ${n} dílů, X je na ${x}. dílku: ${FF(fr(x,n))}.`),
    S.fields('Jaká je vzdálenost bodů X a Y?',[frF(Dd)],1,`${y} − ${x} = ${y-x} dílků po ${F(1,n)}: ${FF(Dd)}.`),
    S.fields('Které číslo leží přesně uprostřed mezi X a Y?',[frF(M)],1,`(${FF(X)} + ${FF(Y)}) : 2 = ${FF(M)}.`)],
    {src:{h:`<p>Na číselné ose jsou vyznačeny body X a Y. Výsledky zapište zlomkem v základním tvaru (nebo celým číslem).</p>${fig}`}});},{fig:1});

PQ.BP.ma={full:['ma1','ma2','ma3','ma4','ma5','ma6','ma7','ma8','ma9','ma10','ma11','ma12','ma13','ma14','ma15','ma16'],short:['ma1','ma2','ma4','ma6','ma8','ma11','ma12','ma16'],mins:{full:70,short:35}};
})(typeof window!=='undefined'?window:globalThis);
