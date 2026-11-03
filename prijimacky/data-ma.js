// Matematika – generátory s náhodnými čísly + pevné úlohy
(function(G){
const {mc,yn,num,mcVals,topic,ri,pick,gcd,fmt,shuffle}=G.PQ;
const F=fmt;
const frac=(n,d)=>{const g=gcd(n,d)||1;n/=g;d/=g;if(d<0){n=-n;d=-d;}return d===1?F(n):(n<0?'−':'')+Math.abs(n)+'/'+d;};
const r2=x=>Math.round(x*100)/100;

// 1 Číselné obory a operace
const cisla=[
()=>{const a=ri(2,9),b=ri(2,9),c=ri(2,9),d=ri(10,40);return num(`Vypočítejte: ${d} − ${a} · ${b} + ${c}`,d-a*b+c,`Nejdřív násobení: ${a}·${b}=${a*b}; ${d}−${a*b}+${c}=${F(d-a*b+c)}.`);},
()=>{const a=ri(-12,-2),b=ri(2,9),c=ri(-9,9);return num(`Vypočítejte: (${F(a)}) · ${b} − (${F(c)})`,a*b-c,`${F(a)}·${b}=${F(a*b)}; ${F(a*b)}−(${F(c)})=${F(a*b-c)}.`);},
()=>{const a=ri(2,6)*ri(2,5),b=ri(2,6)*ri(2,5);const n=a*b/gcd(a,b);return num(`Určete nejmenší společný násobek čísel ${a} a ${b}.`,n,`n(${a}, ${b}) = ${n}.`);},
()=>{const g=ri(2,9),a=g*ri(2,7),b=g*ri(2,7);const d=gcd(a,b);return num(`Určete největšího společného dělitele čísel ${a} a ${b}.`,d,`D(${a}, ${b}) = ${d}.`);},
()=>{const x=ri(10000,99999)+ri(1,9)/10;const r=Math.round(x/100)*100;return num(`Zaokrouhlete číslo ${F(x)} na stovky.`,r,`Rozhoduje číslice na místě desítek → ${F(r)}.`);},
()=>{const a=ri(2,9),b=ri(2,9),c=ri(2,5);return num(`Vypočítejte: ${a} + ${b} · (${c} − ${c+a})`,a+b*(-a),`Závorka: ${c}−${c+a}=−${a}; ${b}·(−${a})=${F(-a*b)}; ${a}${F(-a*b)}=${F(a-a*b)}.`);},
()=>{const ps=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47];const p=pick(ps);const c=[p*1+0,].concat([pick([4,6,8,9,10,12,14,15,21,25,27,33,35,39,49,51])]);const o=shuffle([p,...shuffle([4,6,8,9,15,21,25,27,33,35,39,49,51]).slice(0,3)]);return mc('Které z čísel je prvočíslo?',o,o.indexOf(p),`${p} je dělitelné jen 1 a samo sebou.`);},
()=>{const n=ri(10,99)*6;return yn(`Rozhodněte o každém tvrzení o čísle ${n}.`,[[`Číslo ${n} je dělitelné třemi.`,n%3===0],[`Číslo ${n} je dělitelné čtyřmi.`,n%4===0],[`Číslo ${n} je dělitelné pěti.`,n%5===0],[`Číslo ${n} je dělitelné devíti.`,n%9===0]],`Ciferný součet ${String(n).split('').reduce((s,c)=>s+ +c,0)}; dělitelnost 4 podle posledního dvojčíslí, 5 podle poslední číslice.`);},
()=>{const a=ri(-20,20),b=ri(-20,20);return num(`Vypočítejte: |${F(a)}| − |${F(b)}|`,Math.abs(a)-Math.abs(b),`|${F(a)}|=${Math.abs(a)}, |${F(b)}|=${Math.abs(b)} → ${F(Math.abs(a)-Math.abs(b))}.`);},
];
const cislaF=[
num('Kolik je dvouciferných čísel dělitelných sedmi?',13,'14, 21, …, 98 → 98/7 − 1 = 13.'),
mc('Které číslo je největší?',['0,7','0,65','0,099','0,69'],0,'Porovnáme po řádech: 0,70 > 0,69 > 0,65 > 0,099.'),
num('Vypočítejte: 1 000 − 999 + 998 − 997',2,'(1000−999)+(998−997)=1+1=2.'),
num('Kolik minut je 2,4 hodiny?',144,'2,4·60 = 144 min.'),
];

// 2 Zlomky a desetinná čísla
const zlomky=[
()=>{const b=ri(2,9),d=ri(2,9),a=ri(1,b-1||1),c=ri(1,d-1||1);const n=a*d+c*b,dd=b*d;return num(`Vypočítejte (výsledek můžete zapsat jako zlomek, např. 5/6): ${a}/${b} + ${c}/${d}`,n/dd,`Společný jmenovatel ${dd}: ${a*d}/${dd} + ${c*b}/${dd} = ${frac(n,dd)}.`,{fr:frac(n,dd)});},
()=>{const b=ri(2,9),d=ri(2,9),a=ri(1,b-1),c=ri(1,d-1);return num(`Vypočítejte: ${a}/${b} · ${c}/${d} (výsledek jako zlomek nebo číslo)`,a*c/(b*d),`Násobíme čitatele i jmenovatele: ${a*c}/${b*d} = ${frac(a*c,b*d)}.`,{fr:frac(a*c,b*d)});},
()=>{const b=ri(2,9),d=ri(2,9),a=ri(1,b-1),c=ri(1,d-1);return num(`Vypočítejte: ${a}/${b} : ${c}/${d}`,a*d/(b*c),`Dělení = násobení převrácenou hodnotou: ${a}/${b}·${d}/${c} = ${frac(a*d,b*c)}.`,{fr:frac(a*d,b*c)});},
()=>{const a=ri(11,99)/10,b=ri(11,99)/100;return num(`Vypočítejte: ${F(a)} + ${F(b)}`,r2(a+b),`Sčítáme pod sebou desetinné čárky: ${F(r2(a+b))}.`);},
()=>{const a=ri(2,9)/10,b=ri(11,49)/10;return num(`Vypočítejte: ${F(a)} · ${F(b)}`,Math.round(a*b*100)/100,`${F(a)}·${F(b)} = ${F(Math.round(a*b*100)/100)}.`);},
()=>{const d=pick([2,4,5,8,20,25]);const n=ri(1,d-1);return num(`Zapište zlomek ${n}/${d} jako desetinné číslo.`,n/d,`${n} : ${d} = ${F(n/d)}.`);},
()=>{const a=ri(2,9)*ri(1,9)/10,b=pick([0.2,0.4,0.5,0.25]);const q=Math.round(a/b*1e6)/1e6;return num(`Vypočítejte: ${F(a)} : ${F(b)}`,q,`${F(a)} : ${F(b)} = ${F(q)}.`);},
()=>{const w=ri(1,4),b=pick([2,3,4,5]),a=ri(1,b-1);return num(`Převeďte smíšené číslo ${w} ${a}/${b} na zlomek a zapište jako zlomek (např. 7/3).`,(w*b+a)/b,`${w}·${b}+${a} = ${w*b+a} → ${w*b+a}/${b}.`,{fr:(w*b+a)+'/'+b});},
()=>{const b=pick([3,4,5,6,8]);const a=ri(1,b-1),c=b*ri(2,15);return num(`Kolik je ${a}/${b} z ${c}?`,a*c/b,`${c} : ${b} · ${a} = ${F(a*c/b)}.`);},
];
const zlomkyF=[
mc('Který zlomek je největší?',['3/4','2/3','5/8','7/12'],0,'Na společného jmenovatele 24: 18/24, 16/24, 15/24, 14/24.'),
mc('Které číslo leží mezi 1/3 a 1/2?',['2/5','1/4','3/5','1/5'],0,'2/5 = 0,4; 1/3 ≈ 0,33; 1/2 = 0,5.'),
num('Vypočítejte: 1/2 + 1/3 + 1/6',1,'3/6 + 2/6 + 1/6 = 6/6 = 1.'),
yn('Rozhodněte o každém tvrzení.',[['0,25 = 1/4',true],['0,3 = 1/3',false],['3/5 = 0,6',true],['1/8 = 0,125',true]],'1/3 = 0,333…, ne 0,3.'),
];

// 3 Procenta
const procenta=[
()=>{const p=pick([5,10,15,20,25,30,40,50,60,75]),n=ri(2,40)*20;return num(`Kolik je ${p} % z ${n}?`,p*n/100,`${n}·${p}/100 = ${F(p*n/100)}.`);},
()=>{const n=ri(2,20)*20,p=pick([5,10,20,25,40,50,75]);const c=n*p/100;return num(`Kolik procent je ${F(c)} z ${n}?`,p,`${F(c)}/${n}·100 = ${p} %.`);},
()=>{const p=pick([10,20,25,40,50]),z=ri(2,30)*20;const c=z*p/100;return num(`${p} % z neznámého čísla je ${F(c)}. Určete toto číslo.`,z,`1 % = ${F(c)}/${p} = ${F(c/p)}; 100 % = ${F(z)}.`);},
()=>{const p=pick([10,15,20,25,30]),c=ri(4,40)*100;const n=c*(100-p)/100;return num(`Kolo stálo ${c} Kč. Ve slevě bylo zlevněno o ${p} %. Kolik korun stojí po slevě?`,n,`${100-p} % z ${c} = ${F(n)} Kč.`);},
()=>{const p=pick([10,20,25,50]),c=ri(2,40)*40;const n=c*(100+p)/100;return num(`Cena ${c} Kč se zvýšila o ${p} %. Jaká je nová cena v Kč?`,n,`${100+p} % z ${c} = ${F(n)} Kč.`);},
()=>{const p=pick([10,20,25,50]);const n=(100+p)/100*(100-p)/100;const res=Math.round((n-1)*10000)/100;return mcVals(`Cena zboží se nejprve zvýšila o ${p} % a poté snížila o ${p} %. Jak se změnila oproti původní ceně?`,`klesla o ${F(-res)} %`,['nezměnila se',`vzrostla o ${F(-res)} %`,`klesla o ${2*p} %`],`Nová cena = ${F((100+p)/100)}·${F((100-p)/100)} = ${F(n)} původní → pokles o ${F(-res)} %.`);},
()=>{const t=ri(5,30)*4;const p=pick([25,50,75]);return num(`Školu navštěvuje ${t} žáků, ${p} % z nich jezdí do školy autobusem. Kolik žáků autobusem nejezdí?`,t*(100-p)/100,`${100-p} % z ${t} = ${t*(100-p)/100}.`);},
()=>{const a=ri(2,9)*100,b=a+pick([10,20,25,50])*a/100;const p=(b-a)/a*100;return num(`Počet návštěvníků vzrostl z ${a} na ${F(b)}. O kolik procent vzrostl?`,p,`(${F(b)}−${a})/${a}·100 = ${F(p)} %.`);},
];
const procentaF=[
mc('Kolik procent je 1/8?',['12,5 %','8 %','18 %','1,25 %'],0,'1/8 = 0,125 = 12,5 %.'),
num('Kolik promile je 3,5 %?',35,'1 % = 10 ‰ → 35 ‰.'),
yn('Rozhodněte o každém tvrzení.',[['20 % ze 150 je 30.',true],['Polovina je 50 %.',true],['Zdražení o 100 % znamená trojnásobnou cenu.',false],['150 % z 40 je 60.',true]],'Zdražení o 100 % = dvojnásobná cena.'),
];

// 4 Poměr a úměrnost
const pomer=[
()=>{const a=ri(1,5),b=ri(1,5),k=ri(2,30);const s=(a+b)*k;return num(`Rozdělte ${s} Kč v poměru ${a} : ${b}. Kolik korun připadne na menší díl? (Při shodě dílů uveďte jeden díl.)`,Math.min(a,b)*k,`1 díl = ${s}/${a+b} = ${k} → menší díl ${Math.min(a,b)*k} Kč.`);},
()=>{const m=pick([10000,20000,25000,50000,100000]),cm=ri(2,15);const km=cm*m/100000;return num(`Mapa má měřítko 1 : ${m.toLocaleString('cs-CZ')}. Kolik km ve skutečnosti odpovídá ${cm} cm na mapě?`,km,`${cm} cm · ${m} = ${cm*m} cm = ${F(km)} km.`);},
()=>{const n=ri(2,8),c=ri(10,60),m=ri(2,12);return num(`${n} stejných sešitů stojí ${n*c} Kč. Kolik Kč stojí ${m} takových sešitů?`,m*c,`1 sešit = ${c} Kč; ${m}·${c} = ${m*c} Kč.`);},
()=>{const w=pick([2,3,4,6]),d=ri(1,4)*12;const w2=pick([2,3,4,6,8,12].filter(x=>x!==w&&(w*d)%x===0));return num(`${w} dělníci by práci zvládli za ${d} dní. Za kolik dní by stejnou práci zvládlo ${w2} dělníků stejného výkonu?`,w*d/w2,`Nepřímá úměrnost: ${w}·${d} = ${w*d} „dělnických dní“; ${w*d}/${w2} = ${F(w*d/w2)}.`);},
()=>{const a=ri(2,9),b=ri(2,9),k=ri(2,6);return num(`Zjednodušte poměr ${a*k*2} : ${b*k*2} a zapište první člen v základním tvaru (např. u 6 : 4 je to 3).`,a*2*k/gcd(a*2*k,b*2*k),`Vydělíme D = ${gcd(a*2*k,b*2*k)}.`);},
()=>{const x=ri(2,9),y=ri(2,9),k=ri(2,9);return num(`Platí ${x} : ${y} = ${x*k} : z. Určete z.`,y*k,`Rozšíříme číslem ${k}: z = ${y}·${k} = ${y*k}.`);},
()=>{const k=ri(2,9);const kind=ri(0,1);const s=kind?[[1,k],[2,2*k],[3,3*k]]:[[1,12*k],[2,6*k],[3,4*k]];return mcVals(`Tabulka: x = ${s.map(p=>p[0]).join(', ')}; y = ${s.map(p=>p[1]).join(', ')}. Jaká je závislost y na x?`,kind?'přímá úměrnost':'nepřímá úměrnost',[kind?'nepřímá úměrnost':'přímá úměrnost','lineární funkce, která není úměrností','žádná závislost'],kind?`y/x = ${k} je stálé → přímá úměrnost.`:`x·y = ${12*k} je stálé → nepřímá úměrnost.`);},
];
const pomerF=[
num('Auto ujede na 100 km 6 litrů benzínu. Kolik litrů spotřebuje na 350 km?',21,'6·3,5 = 21 l.'),
mc('Ve kterém poměru jsou délky stran čtverce a jeho obvodu?',['1 : 4','1 : 2','4 : 1','1 : 1'],0,'o = 4a → a : o = 1 : 4.'),
num('Bratři si rozdělili 1 200 Kč v poměru 3 : 5. Kolik Kč dostal ten, kdo dostal více?',750,'1 díl = 150 Kč; 5·150 = 750.'),
];

// 5 Mocniny a odmocniny
const mocniny=[
()=>{const a=ri(11,25);return num(`Vypočítejte: ${a}²`,a*a,`${a}·${a} = ${a*a}.`);},
()=>{const a=ri(2,20);return num(`Vypočítejte: √${a*a}`,a,`${a}² = ${a*a} → √${a*a} = ${a}.`);},
()=>{const a=ri(2,9),b=ri(2,9);return num(`Vypočítejte: √${a*a} · √${b*b} + ${a}²`,a*b+a*a,`${a}·${b} + ${a*a} = ${a*b+a*a}.`);},
()=>{const a=ri(2,5),n=ri(2,4);return num(`Vypočítejte: ${a}^${n}`.replace('^'+n,['','','²','³','⁴'][n]),a**n,`${Array(n).fill(a).join('·')} = ${a**n}.`);},
()=>{const a=ri(1,9)/10;return num(`Vypočítejte: (${F(a)})²`,Math.round(a*a*1e4)/1e4,`${F(a)}·${F(a)} = ${F(Math.round(a*a*1e4)/1e4)}.`);},
()=>{const a=ri(1,9),k=ri(2,6);const v=a*10**k;return num(`Zapište číslo ${v.toLocaleString('cs-CZ')} ve tvaru a · 10ⁿ (1 ≤ a < 10). Uveďte exponent n.`,k,`${v.toLocaleString('cs-CZ')} = ${a} · 10^${k}.`);},
()=>{const a=ri(2,9),b=ri(2,9);return num(`Vypočítejte: ${a}² − ${b}²`,a*a-b*b,`${a*a} − ${b*b} = ${F(a*a-b*b)}.`);},
()=>{const a=ri(2,9);const s=a*a*4;return num(`Vypočítejte: √${s} − √${a*a}`,a,`√${s} = ${2*a}, √${a*a} = ${a} → ${a}.`);},
()=>{const a=ri(-6,-2);return num(`Vypočítejte: (${F(a)})² + (${F(a)})³`,a*a+a*a*a,`${a*a} + (${F(a*a*a)}) = ${F(a*a+a*a*a)}.`);},
];
const mocninyF=[
mc('Mezi kterými dvěma po sobě jdoucími celými čísly leží √50?',['7 a 8','6 a 7','8 a 9','24 a 26'],0,'7² = 49 < 50 < 64 = 8².'),
num('Vypočítejte: 10⁰ + 10¹ + 10²',111,'1 + 10 + 100 = 111.'),
yn('Rozhodněte o každém tvrzení.',[['(−3)² = 9',true],['−3² = 9',false],['√(16 + 9) = 5',true],['√16 + √9 = 5',false]],'−3² = −9 (umocňujeme jen 3); √16+√9 = 4+3 = 7.'),
];

// 6 Výrazy a rovnice
const rovnice=[
()=>{const x=ri(-9,9),a=ri(2,9),b=ri(-20,20);const c=a*x+b;return num(`Řešte rovnici: ${a}x ${b<0?'−':'+'} ${Math.abs(b)} = ${F(c)}`,x,`${a}x = ${F(c)} ${b<0?'+':'−'} ${Math.abs(b)} = ${F(a*x)} → x = ${F(x)}.`);},
()=>{const x=ri(-8,8),a=ri(2,7),b=ri(1,a-1||1),c=ri(-9,9);const d=a*x+c-b*x;return num(`Řešte rovnici: ${a}x ${c<0?'−':'+'} ${Math.abs(c)} = ${b}x ${d<0?'−':'+'} ${Math.abs(d)}`,x,`${a-b}x = ${F(d-c)} → x = ${F(x)}.`);},
()=>{const x=ri(-5,5),a=ri(2,6),b=ri(1,6),k=ri(2,4);const r=k*(a*x-b);return num(`Řešte rovnici: ${k}(${a}x − ${b}) = ${F(r)}`,x,`${a}x − ${b} = ${F(r/k)} → ${a}x = ${F(r/k+b)} → x = ${F(x)}.`);},
()=>{const a=ri(-5,5),b=ri(-5,5);return num(`Určete hodnotu výrazu 2a² − 3b pro a = ${F(a)}, b = ${F(b)}.`,2*a*a-3*b,`2·${a*a} − 3·(${F(b)}) = ${F(2*a*a-3*b)}.`);},
()=>{const a=ri(1,9);return mcVals(`Která úprava výrazu (x + ${a})² je správná?`,`x² + ${2*a}x + ${a*a}`,[`x² + ${a*a}`,`x² + ${a}x + ${a*a}`,`2x + ${2*a}`],`(a+b)² = a² + 2ab + b² → x² + ${2*a}x + ${a*a}.`);},
()=>{const a=ri(2,9);return mcVals(`Rozložte na součin: x² − ${a*a}`,`(x − ${a})(x + ${a})`,[`(x − ${a})²`,`(x + ${a})²`,`x(x − ${a})`],`a² − b² = (a − b)(a + b).`);},
()=>{const c=ri(1,4),a=c+ri(2,5),b=ri(2,6);return mcVals(`Zjednodušte: ${a}x + ${b}y − ${c}x + ${b}y`,`${a-c}x + ${2*b}y`,[`${a+c}x + ${2*b}y`,`${a-c}x`,`${a+2*b-c}xy`],`${a}x − ${c}x = ${a-c}x; ${b}y + ${b}y = ${2*b}y.`);},
()=>{const x=ri(1,9)*2,a=ri(2,5);return num(`Řešte rovnici: x/2 + ${a} = ${x/2+a}`,x,`x/2 = ${x/2} → x = ${x}.`);},
()=>{const x=ri(-6,6),y=ri(-6,6);return num(`Řešte soustavu: x + y = ${F(x+y)}, x − y = ${F(x-y)}. Uveďte x.`,x,`Sečtením: 2x = ${F(2*x)} → x = ${F(x)} (y = ${F(y)}).`);},
];
const rovniceF=[
mc('Pro které x platí 3x − 7 > 5?',['x > 4','x < 4','x > 12','x > −4'],0,'3x > 12 → x > 4.'),
yn('Rozhodněte o každém tvrzení.',[['2(x + 3) = 2x + 6',true],['(x − 1)² = x² − 1',false],['x · x = x²',true],['3x + 2x = 5x²',false]],'(x−1)² = x² − 2x + 1; 3x + 2x = 5x.'),
];

// 7 Slovní úlohy
const slovni=[
()=>{const v=pick([40,50,60,80,90]),t=pick([0.5,1.5,2,2.5,3]);return num(`Auto jede stálou rychlostí ${v} km/h. Kolik km ujede za ${F(t)} h?`,v*t,`s = v·t = ${v}·${F(t)} = ${F(v*t)} km.`);},
()=>{const v=pick([4,5,6]),s=v*ri(2,6);return num(`Turista jde rychlostí ${v} km/h. Za kolik hodin ujde ${s} km?`,s/v,`t = s/v = ${s}/${v} = ${s/v} h.`);},
()=>{const a=ri(8,15),d=ri(22,35);return num(`Otci je ${a+d} let a synovi ${a}. Za kolik let bude otec přesně dvakrát starší než syn?`,d-a,`${a+d}+x = 2(${a}+x) → x = ${d-a}.`,{chk:()=>d-a>0});},
()=>{const p=ri(3,9),c=ri(2,9)*5,k=ri(2,9)*5;const n=ri(5,15);return num(`Lístek pro dospělého stojí ${c+k} Kč, pro dítě ${k} Kč. Skupina ${p} dospělých a ${n} dětí zaplatí celkem kolik Kč?`,p*(c+k)+n*k,`${p}·${c+k} + ${n}·${k} = ${p*(c+k)+n*k} Kč.`);},
()=>{const a=ri(2,6),b=ri(2,6)+a;const t=a*b/(a+b);return mcVals(`Jeden kohoutek naplní nádrž za ${a} h, druhý za ${b} h. Za jak dlouho ji naplní oba současně?`,`${frac(a*b,a+b)} h`,[`${F((a+b)/2)} h`,`${a+b} h`,`${frac(a*b,a+b+1)} h`],`1/${a} + 1/${b} = ${frac(a+b,a*b)} nádrže za hodinu → ${frac(a*b,a+b)} h.`);},
()=>{const x=ri(5,20),d=ri(2,8);return num(`Dva sourozenci mají dohromady ${2*x+d} kuliček. Starší jich má o ${d} více. Kolik kuliček má mladší?`,x,`x + (x + ${d}) = ${2*x+d} → x = ${x}.`);},
()=>{const n=ri(3,8),k=ri(2,5);const z=n*k;return num(`V krabici jsou červené a modré pastelky v poměru ${k}:1. Modrých je ${n}. Kolik je pastelek celkem?`,z+n,`Červených ${k}·${n} = ${z}, celkem ${z+n}.`);},
()=>{const h=ri(1,3),m=pick([15,20,30,40,45]),st=ri(7,9);const em=(st*60+h*60+m);return mcVals(`Vlak vyjel v ${st}:10 a jel ${h} h ${m} min. V kolik hodin dorazil?`,`${Math.floor((em+10)/60)}:${String((em+10)%60).padStart(2,'0')}`,[`${Math.floor((em)/60)}:${String((em)%60).padStart(2,'0')}`,`${Math.floor((em+70)/60)}:${String((em+70)%60).padStart(2,'0')}`,`${st+h}:${m}`],`${st}:10 + ${h} h ${m} min.`);},
];
const slovniF=[
num('Petr přečetl první den třetinu knihy, druhý den polovinu zbytku a zbylo mu 60 stran. Kolik stran má kniha?',180,'Po 1. dni zbývají 2/3, po 2. dni 1/3 knihy = 60 → 180 stran.'),
num('Ve třídě je 28 žáků. Dívek je o 4 více než chlapců. Kolik je v ní chlapců?',12,'x + x + 4 = 28 → x = 12.'),
num('Na parkovišti jsou auta a motorky, dohromady 20 vozidel a 70 kol. Kolik je tam aut?',15,'4a + 2(20 − a) = 70 → a = 15.'),
num('Jana je o 3 roky starší než Eva. Za 5 let jim bude dohromady 37 let. Kolik let je teď Evě?',12,'(e+3+5)+(e+5) = 37 → 2e = 24 → e = 12.'),
num('Stůl a židle stojí dohromady 5 000 Kč. Stůl je čtyřikrát dražší než židle. Kolik Kč stojí židle?',1000,'5ž = 5000 → ž = 1000 Kč.'),
num('Šnek leze po zdi vysoké 10 m. Přes den vyleze 3 m, v noci sklouzne o 2 m. Kolikátý den se dostane nahoru?',8,'Po 7 dnech a nocích je ve 7 m, 8. den vyleze 3 m → 10 m.'),
num('Kolik podání ruky proběhne, když si podá ruku každý s každým v pětičlenné skupině?',10,'5·4/2 = 10.'),
num('Cyklista jel 2 hodiny rychlostí 18 km/h a 1 hodinu rychlostí 24 km/h. Jaká byla jeho průměrná rychlost v km/h?',20,'(36 + 24)/3 = 20 km/h.'),
];

// 8 Geometrie v rovině
const rovina=[
()=>{const a=ri(30,80),b=ri(30,80);return num(`V trojúhelníku ABC je α = ${a}°, β = ${b}°. Určete velikost úhlu γ ve stupních.`,180-a-b,`γ = 180° − ${a}° − ${b}° = ${180-a-b}°.`);},
()=>{const a=ri(3,20),b=ri(3,20);return num(`Obdélník má strany ${a} cm a ${b} cm. Vypočítejte jeho obvod v cm.`,2*(a+b),`o = 2(a + b) = ${2*(a+b)} cm.`);},
()=>{const a=ri(3,20),b=a+ri(1,8);return num(`Obdélník má strany ${a} cm a ${b} cm. Vypočítejte jeho obsah v cm².`,a*b,`S = a·b = ${a*b} cm².`);},
()=>{const t=pick([[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[7,24,25],[12,16,20]]);return num(`Pravoúhlý trojúhelník má odvěsny ${t[0]} cm a ${t[1]} cm. Jak dlouhá je přepona (v cm)?`,t[2],`c = √(${t[0]}² + ${t[1]}²) = √${t[2]*t[2]} = ${t[2]} cm.`);},
()=>{const t=pick([[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[12,16,20]]);return num(`Pravoúhlý trojúhelník má přeponu ${t[2]} cm a jednu odvěsnu ${t[0]} cm. Jak dlouhá je druhá odvěsna (v cm)?`,t[1],`b = √(${t[2]}² − ${t[0]}²) = √${t[1]*t[1]} = ${t[1]} cm.`);},
()=>{const r=ri(2,10);return num(`Vypočítejte obvod kruhu o poloměru ${r} cm (π ≈ 3,14). Výsledek v cm.`,r2(2*3.14*r),`o = 2πr = 2·3,14·${r} = ${F(r2(2*3.14*r))} cm.`,{tol:0.05});},
()=>{const r=ri(2,10);return num(`Vypočítejte obsah kruhu o poloměru ${r} cm (π ≈ 3,14). Výsledek v cm².`,r2(3.14*r*r),`S = πr² = 3,14·${r*r} = ${F(r2(3.14*r*r))} cm².`,{tol:0.05});},
()=>{const a=ri(6,14),c=ri(2,a-2),v=ri(2,10);return num(`Lichoběžník má základny ${a} cm a ${c} cm a výšku ${v} cm. Vypočítejte jeho obsah v cm².`,(a+c)*v/2,`S = (a + c)·v/2 = ${a+c}·${v}/2 = ${F((a+c)*v/2)} cm².`);},
()=>{const a=ri(4,16),v=ri(2,12);return num(`Trojúhelník má stranu ${a} cm a výšku k ní ${v} cm. Vypočítejte jeho obsah v cm².`,a*v/2,`S = a·v/2 = ${F(a*v/2)} cm².`);},
()=>{const a=ri(20,160);return num(`Úhel α má ${a}°. Určete velikost úhlu vedlejšího ve stupních.`,180-a,`Vedlejší úhly mají součet 180° → ${180-a}°.`);},
()=>{const a=ri(25,75);return num(`V rovnoramenném trojúhelníku má úhel při základně ${a}°. Jak velký je úhel při hlavním vrcholu (ve stupních)?`,180-2*a,`180° − 2·${a}° = ${180-2*a}°.`);},
()=>{const n=pick([5,6,8,10,12]);return num(`Jaký je součet vnitřních úhlů pravidelného ${n}-úhelníku (ve stupních)?`,(n-2)*180,`(n − 2)·180° = ${(n-2)*180}°.`);},
()=>{const a=ri(2,12);return num(`Čtverec má obsah ${a*a} cm². Jaký je jeho obvod v cm?`,4*a,`a = √${a*a} = ${a}; o = 4a = ${4*a} cm.`);},
];
const rovinaF=[
mc('Kolik os souměrnosti má čtverec?',['4','2','1','8'],0,'2 úhlopříčky + 2 spojnice středů stran = 4.'),
mc('Jak velký je úhel mezi ručičkami hodin ve 3:00?',['90°','45°','120°','180°'],0,'Ciferník 360°/12 = 30° na hodinu; 3·30° = 90°.'),
yn('Rozhodněte o každém tvrzení.',[['Každý čtverec je obdélník.',true],['Každý kosočtverec je čtverec.',false],['Úhlopříčky obdélníku jsou stejně dlouhé.',true],['Součet úhlů ve čtyřúhelníku je 360°.',true]],'Kosočtverec nemusí mít pravé úhly.'),
num('Jak velký je jeden vnitřní úhel pravidelného šestiúhelníku (ve stupních)?',120,'720°/6 = 120°.'),
];

// 9 Geometrie v prostoru
const prostor=[
()=>{const a=ri(2,12),b=ri(2,12),c=ri(2,12);return num(`Kvádr má rozměry ${a} cm, ${b} cm a ${c} cm. Vypočítejte jeho objem v cm³.`,a*b*c,`V = a·b·c = ${a*b*c} cm³.`);},
()=>{const a=ri(2,10),b=ri(2,10),c=ri(2,10);return num(`Kvádr má rozměry ${a} cm, ${b} cm a ${c} cm. Vypočítejte jeho povrch v cm².`,2*(a*b+a*c+b*c),`S = 2(ab + ac + bc) = 2(${a*b} + ${a*c} + ${b*c}) = ${2*(a*b+a*c+b*c)} cm².`);},
()=>{const a=ri(2,12);return num(`Krychle má hranu ${a} cm. Vypočítejte její objem v cm³.`,a**3,`V = a³ = ${a**3} cm³.`);},
()=>{const a=ri(2,12);return num(`Krychle má hranu ${a} cm. Vypočítejte její povrch v cm².`,6*a*a,`S = 6a² = ${6*a*a} cm².`);},
()=>{const r=ri(1,6),v=ri(2,12);return num(`Válec má poloměr podstavy ${r} cm a výšku ${v} cm. Vypočítejte jeho objem v cm³ (π ≈ 3,14).`,r2(3.14*r*r*v),`V = πr²v = 3,14·${r*r}·${v} = ${F(r2(3.14*r*r*v))} cm³.`,{tol:0.1});},
()=>{const a=ri(1,6)*10,b=ri(1,6)*10,c=ri(1,6)*10;return num(`Akvárium tvaru kvádru má vnitřní rozměry ${a} cm × ${b} cm × ${c} cm. Kolik litrů vody se do něj vejde?`,a*b*c/1000,`V = ${a*b*c} cm³ = ${F(a*b*c/1000)} dm³ = ${F(a*b*c/1000)} l.`);},
()=>{const v=ri(1,20)*500;return num(`Převeďte ${v.toLocaleString('cs-CZ')} cm³ na litry.`,v/1000,`1 l = 1 dm³ = 1 000 cm³ → ${F(v/1000)} l.`);},
()=>{const a=ri(2,8),v=ri(3,12);return num(`Pravidelný čtyřboký hranol má podstavnou hranu ${a} cm a výšku ${v} cm. Vypočítejte jeho objem v cm³.`,a*a*v,`V = a²·v = ${a*a}·${v} = ${a*a*v} cm³.`);},
()=>{const a=ri(3,6),k=ri(2,3);return num(`Kolik malých krychliček o hraně 1 cm je potřeba na sestavení krychle o hraně ${a} cm?`,a**3,`${a}³ = ${a**3}.`);},
];
const prostorF=[
mc('Kolik hran má kvádr?',['12','8','6','10'],0,'Kvádr má 12 hran, 8 vrcholů, 6 stěn.'),
mc('Kolik vrcholů má trojboký hranol?',['6','5','9','3'],0,'2 trojúhelníkové podstavy · 3 vrcholy = 6.'),
mc('Jak se změní objem krychle, když její hranu zdvojnásobíme?',['zvětší se 8krát','zvětší se 2krát','zvětší se 4krát','zvětší se 6krát'],0,'(2a)³ = 8a³.'),
num('Kolik litrů je 1 m³?',1000,'1 m³ = 1 000 dm³ = 1 000 l.'),
yn('Rozhodněte o každém tvrzení.',[['Krychle má 6 stěn.',true],['Válec má dvě podstavy.',true],['Jehlan má vždy čtvercovou podstavu.',false],['Koule nemá žádnou hranu.',true]],'Podstava jehlanu může být libovolný mnohoúhelník.'),
];

// 10 Konstrukční a grafické úvahy
const konstr=[
()=>{let a=ri(2,12),b=ri(2,12),c=ri(2,15);const ok=a+b>c&&a+c>b&&b+c>a;return mcVals(`Lze sestrojit trojúhelník se stranami ${a} cm, ${b} cm a ${c} cm?`,ok?'ano':'ne',[ok?'ne':'ano'],`Trojúhelníková nerovnost: součet každých dvou stran musí být větší než třetí strana${ok?' – platí.':' – neplatí.'}`,{keep:1});},
()=>{const x=ri(-6,6),y=ri(-6,6);const q=x===0||y===0?'na ose':x>0?(y>0?'I. kvadrant':'IV. kvadrant'):(y>0?'II. kvadrant':'III. kvadrant');return mcVals(`Ve kterém kvadrantu leží bod [${F(x)}; ${F(y)}]?`,q,['I. kvadrant','II. kvadrant','III. kvadrant','IV. kvadrant','na ose'].filter(z=>z!==q),'I. (+;+), II. (−;+), III. (−;−), IV. (+;−).');},
()=>{const x=pick([-6,-5,-4,-3,-2,-1,1,2,3,4,5,6]),y=pick([-5,-4,-3,-2,-1,1,2,3,4,5]);return mcVals(`Jaké souřadnice má obraz bodu A[${F(x)}; ${F(y)}] v osové souměrnosti podle osy x?`,`[${F(x)}; ${F(-y)}]`,[`[${F(-x)}; ${F(y)}]`,`[${F(-x)}; ${F(-y)}]`,`[${F(y)}; ${F(x)}]`],'Podle osy x se mění znaménko y.');},
()=>{const k=ri(-4,4)||1,q=ri(-5,5),x=ri(-3,3);return num(`Funkce je dána předpisem y = ${k===1?'':k===-1?'−':F(k)}x ${q<0?'−':'+'} ${Math.abs(q)}. Určete y pro x = ${F(x)}.`,k*x+q,`y = ${F(k)}·(${F(x)}) ${q<0?'−':'+'} ${Math.abs(q)} = ${F(k*x+q)}.`);},
()=>{const x1=ri(-5,5),y1=ri(-5,5),dx=pick([3,6,5,8]),dy=pick([4,8,12,6].filter(v=>[[3,4],[6,8],[5,12],[8,6]].some(p=>p[0]===dx&&p[1]===v)));const d=Math.sqrt(dx*dx+dy*dy);return num(`Jaká je vzdálenost bodů A[${F(x1)}; ${F(y1)}] a B[${F(x1+dx)}; ${F(y1+dy)}]?`,d,`√(${dx}² + ${dy}²) = ${d}.`);},
];
const konstrF=[
mc('Množina všech bodů roviny, které mají od daného bodu S vzdálenost 3 cm, je:',['kružnice se středem S a poloměrem 3 cm','kruh se středem S a poloměrem 3 cm','přímka','úsečka délky 3 cm'],0,'Kružnice = body se stejnou vzdáleností od středu.'),
mc('Množina všech bodů, které mají stejnou vzdálenost od bodů A a B, je:',['osa úsečky AB','úsečka AB','kružnice s průměrem AB','polopřímka AB'],0,'Osa úsečky.'),
mc('Kde leží vrchol C pravoúhlého trojúhelníku ABC s přeponou AB?',['na Thaletově kružnici nad průměrem AB','na ose úhlu A','na přímce AB','ve středu úsečky AB'],0,'Thaletova věta.'),
mc('Co je průsečík os stran trojúhelníku?',['střed kružnice opsané','střed kružnice vepsané','těžiště','ortocentrum'],0,'Osy stran se protínají ve středu kružnice opsané.'),
mc('Co je průsečík os vnitřních úhlů trojúhelníku?',['střed kružnice vepsané','střed kružnice opsané','těžiště','střed nejdelší strany'],0,'Osy úhlů → střed kružnice vepsané.'),
mc('Které písmeno má právě jednu osu souměrnosti (při běžném tvaru tiskacího písma)?',['A','H','O','N'],0,'A – svislá osa; H a O mají dvě (O i víc), N nemá žádnou.'),
mc('Ve kterém bodě protíná graf funkce y = 2x − 4 osu x?',['[2; 0]','[0; −4]','[−2; 0]','[4; 0]'],0,'y = 0 → 2x = 4 → x = 2.'),
mc('Jak se nazývá úhel, který je větší než 90° a menší než 180°?',['tupý','ostrý','přímý','pravý'],0,'Tupý úhel.'),
yn('Rozhodněte o každém tvrzení o středové souměrnosti.',[['Obrazem úsečky je úsečka stejné délky.',true],['Střed souměrnosti je samodružný bod.',true],['Obrazem přímky je vždy přímka k ní kolmá.',false],['Čtverec je středově souměrný.',true]],'Obrazem přímky ve středové souměrnosti je přímka s ní rovnoběžná (nebo totožná).'),
mc('Co je těžiště trojúhelníku?',['průsečík těžnic','průsečík výšek','průsečík os stran','střed nejdelší strany'],0,'Těžnice spojují vrchol se středem protější strany.'),
];
topic('ma','cisla','Číselné obory a operace','🔢',cislaF,cisla);
topic('ma','zlomky','Zlomky a desetinná čísla','🍕',zlomkyF,zlomky);
topic('ma','procenta','Procenta','💯',procentaF,procenta);
topic('ma','pomer','Poměr a úměrnost','⚖️',pomerF,pomer);
topic('ma','mocniny','Mocniny a odmocniny','√',mocninyF,mocniny);
topic('ma','rovnice','Výrazy a rovnice','🟰',rovniceF,rovnice);
topic('ma','slovni','Slovní úlohy','🚲',slovniF,slovni);
topic('ma','rovina','Geometrie v rovině','📐',rovinaF,rovina);
topic('ma','prostor','Geometrie v prostoru','🧊',prostorF,prostor);
topic('ma','konstr','Konstrukční a grafické úlohy','🧭',konstrF,konstr);
})(typeof window!=='undefined'?window:globalThis);
