// Čeština – nové typy úloh (slovní zásoba, tvary, výpisy, úpravy vět). rev:0 = čeká na kontrolu učitelem. Všechny texty jsou původní.
// Pořadí položek neměnit, nové přidávat jen na konec (id jsou stabilní).
(function(G){
const PQ=G.PQ,S=PQ.S,{M}=PQ.CJ;
const R0=0;const slot=(k,n,gen,i)=>PQ.slot('cj',k,n,gen,i);
const draw=k=>PQ.drawItems(PQ.BANKS[k]).d;
const one=(name,f)=>()=>{const x=f();return [PQ.T(name,[].concat(x))];};
/* ===== cjPrib – slova příbuzná (otevřená odpověď + sebehodnocení) ===== */
PQ.bank('cjPrib',[
 [['les','přídavné jméno',['lesní','lesnatý','lesnický','lesácký','zalesněný','odlesněný']],['psát','podstatné jméno',['písař','písmeno','písemka','písmo','pisatel','spisovatel','nápis','podpis','přepis','opis','zápis','písanka','spis','dopis','předpis']]],
 [['voda','přídavné jméno',['vodní','vodnatý','vodový','vodotěsný','podvodní','nadvodní','bezvodý']],['rychlý','příslovce',['rychle','zrychleně']]],
 [['zima','přídavné jméno',['zimní','zimomřivý','předzimní']],['učit','podstatné jméno',['učitel','učitelka','učebnice','učeň','učení','učivo','učebna','výuka','nauka','doučování']]],
 [['chléb','přídavné jméno',['chlebový','chlebný']],['hrát','podstatné jméno',['hra','hráč','hráčka','hračka','hřiště','herna','herec','herečka','hrátky','výhra','prohra','dohra','předehra','souhra']]],
 [['kámen','přídavné jméno',['kamenný','kamenitý','kamenický','zkamenělý']],['letět','podstatné jméno',['let','letadlo','letiště','letec','letka','letoun','odlet','přílet','výlet','letuška','přelet','vzlet']]],
 [['dobrý','podstatné jméno',['dobro','dobrota','dobrák','dobračka','dobrodinec','dobrodružství']],['skákat','podstatné jméno',['skok','skokan','skokanka','skákadlo','přeskok','výskok','seskok','odskok','skočec']]],
 [['moře','přídavné jméno',['mořský','zámořský','námořní','přímořský','zámořní']],['pomoc','sloveso',['pomoci','pomoct','pomáhat','napomáhat']]],
 [['zahrada','přídavné jméno',['zahradní','zahradnický','zahrádkářský']],['nést','podstatné jméno',['nosič','nosička','nosítka','donáška','nosnost','nošení','výnos','přínos','nůše','odnos','unášení']]],
 [['slunce','přídavné jméno',['sluneční','slunečný','slunný','slunečnicový','prosluněný','osluněný']],['kreslit','podstatné jméno',['kresba','kreslíř','kreslířka','kreslení','kreslička','nákres','překreslení']]],
 [['hora','přídavné jméno',['horský','hornatý','podhorský','horní','vysokohorský']],['stavět','podstatné jméno',['stavba','stavitel','stavitelka','stavař','stavebnice','staveniště','přístavba','nástavba','výstavba','přestavba','stavení']]],
 [['pes','přídavné jméno',['psí','psíkův']],['číst','podstatné jméno',['čtenář','čtenářka','čtení','čítanka','četba','přečtení','čtivo']]],
 [['zlato','přídavné jméno',['zlatý','zlatavý','zlatnický','pozlacený','zlacený','zlatočervený']],['vařit','podstatné jméno',['vařič','varna','var','vařečka','vaření','uvaření','návar','odvar','vývar','varnice']]],
 [['sníh','přídavné jméno',['sněhový','sněžný','zasněžený','sněhobílý','sněhulácký']],['smát se','podstatné jméno',['smích','úsměv','posměch','výsměch','smíšek','posměváček','usměvavost']]],
 [['kniha','přídavné jméno',['knižní','knihovní','knihařský','knihkupecký']],['ryba','sloveso',['rybařit','zarybnit','zarybňovat']]],
 [['tichý','podstatné jméno',['ticho','tichost','tišina','utišení','zticha']],['běžet','podstatné jméno',['běh','běžec','běžkyně','běžky','rozběh','doběh','výběh','oběh','předběh','běhoun']]]
],R0);
const PRIB_C=(w,d)=>[`Je to ${d}.`,`Je příbuzné se slovem <i>${w}</i> – má s ním společný kořen.`,`Není to jen jiný tvar slova <i>${w}</i>.`,'Je napsané spisovně a pravopisně správně.'];
slot('cjPrib','Slova příbuzná',one('Slova příbuzná',()=>draw('cjPrib').map(([w,d,a])=>S.fields(`Napište jedno <b>${d}</b>, které je příbuzné se slovem <i>${w}</i>.`,[{a,show:a.slice(0,3).join(', ')+'…'}],1,`Příbuzná slova mají společný kořen. Například: ${a.slice(0,4).join(', ')}.`,{cond:PRIB_C(w,d)}))),{});
/* ===== cjTvar – tvary sloves v textu ===== */
PQ.bank('cjTvar',[
 ['Děti (přijít, minulý čas) ***** domů pozdě. Maminka jim (říct, minulý čas) *****, ať se umyjí.',[['přišly'],['řekla']],'Děti – podmět v rodě ženském (ty děti) → přišly; maminka → řekla.'],
 ['Petře, (zavřít, rozkazovací způsob) ***** okno a (vzít, rozkazovací způsob) ***** si bundu.',[['zavři'],['vezmi']],'Rozkazovací způsob 2. osoby j. č.: zavři, vezmi (ne „vem“).'],
 ['Kluci (hrát, minulý čas) ***** fotbal, dokud se (setmít, minulý čas) *****.',[['hráli'],['setmělo']],'Kluci – rod mužský životný → hráli; „setmělo se“ je bezpodmětá věta, příčestí má tvar středního rodu.'],
 ['Zítra (jet, 1. osoba mn. č., budoucí čas) ***** k babičce a (pomoci, 1. osoba mn. č., budoucí čas) ***** jí na zahradě.',[['pojedeme'],['pomůžeme']],'Budoucí čas: pojedeme, pomůžeme.'],
 ['Sestry (umýt, minulý čas) ***** nádobí a (uklidit, minulý čas) ***** kuchyň.',[['umyly'],['uklidily']],'Sestry – rod ženský → umyly, uklidily.'],
 ['Děti, (číst, rozkazovací způsob) ***** pozorně a (psát, rozkazovací způsob) ***** čitelně.',[['čtěte'],['pište']],'Rozkazovací způsob 2. osoby mn. č.: čtěte, pište.'],
 ['Psi celou noc (štěkat, minulý čas) ***** a sousedé (moci, minulý čas, zápor) ***** spát.',[['štěkali'],['nemohli']],'Psi i sousedé – rod mužský životný → štěkali, nemohli.'],
 ['Ptáci (odletět, minulý čas) ***** na jih, když (začít, minulý čas) ***** podzim.',[['odletěli'],['začal']],'Ptáci – rod mužský životný → odletěli; podzim – rod mužský neživotný, j. č. → začal.'],
 ['Babička (péct, přítomný čas) ***** koláče a dědeček (mlít, přítomný čas) ***** kávu.',[['peče'],['mele']],'Přítomný čas 3. osoby j. č.: peče, mele.'],
 ['Holky z naší třídy (vyhrát, minulý čas) ***** soutěž a všichni jim (tleskat, minulý čas) *****.',[['vyhrály'],['tleskali']],'Holky – rod ženský → vyhrály; všichni – rod mužský životný → tleskali.'],
 ['Jano, (pomoci, rozkazovací způsob) ***** mi a (podat, rozkazovací způsob) ***** mi tu krabici.',[['pomoz'],['podej']],'Rozkazovací způsob 2. osoby j. č.: pomoz (ne „pomož“), podej.'],
 ['Vlaky dnes (jet, minulý čas) ***** se zpožděním, protože v noci (napadnout, minulý čas) ***** sníh.',[['jely'],['napadl']],'Vlaky – rod mužský neživotný → jely; sníh → napadl.'],
 ['Kuřata (pobíhat, minulý čas) ***** po dvoře a kohout (kokrhat, minulý čas) *****.',[['pobíhala'],['kokrhal']],'Kuřata – rod střední, mn. č. → pobíhala; kohout → kokrhal.'],
 ['Až (vyrůst, 1. osoba j. č., budoucí čas) *****, (být, 1. osoba j. č., budoucí čas) ***** lékařem.',[['vyrostu'],['budu']],'Budoucí čas: vyrostu, budu.'],
 ['Lidé (stát, minulý čas) ***** ve frontě a (čekat, minulý čas) ***** na vstupenky.',[['stáli'],['čekali']],'Lidé – rod mužský životný → stáli, čekali.']
],R0);
slot('cjTvar','Tvary sloves v textu',one('Tvary sloves',()=>{const [v,a,e]=draw('cjTvar');let i=0;const h=v.replace(/\*{5}/g,()=>`<b>(${++i})</b> ____`);
  return S.fields(`Napište spisovné tvary sloves v závorkách tak, aby odpovídaly zadání a věta byla gramaticky správná:<br><i>${h}</i>`,a.map((x,k)=>({l:`(${k+1})`,a:x})),2,e,{each:1});}),{});
/* ===== cjVyp – výpis slov z věty (základní tvar, diakritika se nehodnotí) ===== */
const PODJ='Vypište z věty podmět a napište ho v 1. pádě čísla jednotného.',PRINF='Vypište z věty přísudek a napište ho v infinitivu.',PRM='Vypište z věty přívlastek shodný a napište ho v 1. pádě čísla jednotného rodu mužského.';
PQ.bank('cjVyp',[
 ['Na starém mostě stáli dva rybáři s dlouhými pruty.',[PODJ,['rybář']],['Vypište z věty přídavné jméno, které rozvíjí slovo <i>pruty</i>, a napište ho v 1. pádě čísla jednotného rodu mužského.',['dlouhý']],'Kdo stál? – rybáři → rybář. Pruty (jakými?) dlouhými → dlouhý.'],
 ['Sestra mi včera přinesla z knihovny tři nové knihy.',[PRINF,['přinést','přinésti']],['Vypište z věty předmět ve 4. pádě a napište ho v 1. pádě čísla jednotného.',['kniha']],'Přísudek přinesla → přinést; přinesla (co?) knihy → kniha.'],
 ['V lese jsme potkali srnu s malými srnčaty.',['Vypište z věty podstatné jméno, které je příslovečným určením místa, a napište ho v 1. pádě čísla jednotného.',['les']],['Vypište z věty podstatné jméno rodu středního a napište ho v 1. pádě čísla jednotného.',['srnče']],'Kde jsme potkali? – v lese → les. Srnčata – rod střední → srnče.'],
 ['Děti nadšeně tleskaly šikovným akrobatům.',['Vypište z věty příslovce.',['nadšeně']],['Vypište z věty předmět a napište ho v 1. pádě čísla jednotného.',['akrobat']],'Tleskaly (jak?) nadšeně – příslovce. Tleskaly (komu?) akrobatům → akrobat.'],
 ['Babička upekla pro vnoučata voňavé perníčky.',[PRINF,['upéct','upéci']],[PRM,['voňavý']],'Upekla → upéct (upéci). Perníčky (jaké?) voňavé → voňavý.'],
 ['Za vesnicí se pásly krávy na zelených loukách.',[PODJ,['kráva']],[PRINF,['pást','pást se']],'Kdo se pásl? – krávy → kráva. Pásly se → pást (se).'],
 ['Pozdě večer přiletěli do hnízda dva čápi.',[PODJ,['čáp']],['Vypište z věty podstatné jméno, které je příslovečným určením místa, a napište ho v 1. pádě čísla jednotného.',['hnízdo']],'Kdo přiletěl? – čápi → čáp. Kam? – do hnízda → hnízdo.'],
 ['Kamarádi mi k narozeninám darovali krásné hodinky.',['Vypište z věty předmět ve 4. pádě.',['hodinky']],[PRINF,['darovat','darovati']],'Darovali (co?) hodinky – slovo má jen množné číslo. Darovali → darovat.'],
 ['Unavení turisté odpočívali pod rozložitým dubem.',['Vypište z věty přívlastek shodný, který rozvíjí podmět, a napište ho v 1. pádě čísla jednotného rodu mužského.',['unavený']],[PODJ,['turista']],'Turisté (jací?) unavení → unavený. Kdo odpočíval? – turisté → turista.'],
 ['Na jaře vyrostly v zahradě první sněženky.',[PODJ,['sněženka']],['Vypište z věty číslovku.',['první']],'Co vyrostlo? – sněženky → sněženka. První je číslovka řadová.'],
 ['Učitelka pochválila žáky za pěkné výkresy.',['Vypište z věty podmět.',['učitelka']],[PRM,['pěkný']],'Kdo pochválil? – učitelka. Výkresy (jaké?) pěkné → pěkný.'],
 ['Rybáři v noci chytili obrovského kapra.',[PRM,['obrovský']],[PRINF,['chytit','chytiti']],'Kapra (jakého?) obrovského → obrovský. Chytili → chytit.'],
 ['Můj bratr rád jezdí na kole po lesních cestách.',[PRINF,['jezdit','jezditi']],['Vypište z věty přídavné jméno a napište ho v 1. pádě čísla jednotného rodu ženského.',['lesní']],'Jezdí → jezdit. Cestách (jakých?) lesních → lesní (cesta).'],
 ['Ze střechy padaly velké kusy ledu.',[PODJ,['kus']],['Vypište z věty podstatné jméno, které rozvíjí slovo <i>kusy</i>, a napište ho v 1. pádě čísla jednotného.',['led']],'Co padalo? – kusy → kus. Kusy (čeho?) ledu → led.'],
 ['Malá Klára si s radostí prohlížela barevné obrázky.',[PRINF,['prohlížet','prohlížet si']],['Vypište z věty přívlastek shodný, který rozvíjí předmět, a napište ho v 1. pádě čísla jednotného rodu mužského.',['barevný']],'Prohlížela si → prohlížet (si). Obrázky (jaké?) barevné → barevný.']
],R0);
slot('cjVyp','Výpis slov z věty',one('Výpis slov',()=>{const [v,a,b,e]=draw('cjVyp');
  return [a,b].map(([q,ans],k)=>S.fields(`${q}<br><i>${v}</i>`,[{a:ans,diac:false}],1,e+' (U výpisu se nehodnotí diakritika, jen správné slovo v požadovaném tvaru.)',{}));}),{});
/* ===== cjSlova – vypiš všechna slova daného druhu (3 b, −1 za každé chybějící i navíc) ===== */
const ZJ='Vypište z textu všechna podstatná jména rodu ženského a napište je v 1. pádě čísla jednotného.',
 SJ='Vypište z textu všechna podstatná jména rodu středního a napište je v 1. pádě čísla jednotného.',
 INF='Vypište z textu všechna slovesa a napište je v infinitivu.',
 PJM='Vypište z textu všechna přídavná jména a napište je v 1. pádě čísla jednotného rodu mužského.',
 PRS='Vypište z textu všechna příslovce.',
 CIS='Vypište z textu všechny číslovky v tom tvaru, v jakém jsou v textu.';
PQ.bank('cjSlova',[
 ['Na louce rostly kopretiny a vlčí máky. U potoka seděl dědeček s udicí.',ZJ,['louka','kopretina','udice'],'louce → louka, kopretiny → kopretina, udicí → udice. Máky, potok a dědeček jsou rodu mužského.'],
 ['Ve středu jsme jeli vlakem k babičce. Z okna jsme pozorovali pole a jedli jablka.',SJ,['okno','pole','jablko'],'okna → okno, pole, jablka → jablko. Středa a babička jsou rodu ženského, vlak mužského.'],
 ['Tomáš ráno vstal, rychle se umyl a běžel do školy.',INF,['vstát','umýt','běžet'],'vstal → vstát, umyl → umýt, běžel → běžet.'],
 ['Starý pes ležel na měkkém polštáři a díval se na zasněženou zahradu.',PJM,['starý','měkký','zasněžený'],'starý, měkkém → měkký, zasněženou → zasněžený.'],
 ['Hasiči rychle přijeli k hořícímu domu. Soused jim ukázal cestu a policista řídil dopravu.','Vypište z textu všechna podstatná jména rodu mužského životného a napište je v 1. pádě čísla jednotného.',['hasič','soused','policista'],'hasiči → hasič, soused, policista. Dům je rodu mužského neživotného.'],
 ['Včera jsme dlouho čekali na autobus, který nakonec nepřijel.',PRS,['včera','dlouho','nakonec'],'Včera, dlouho, nakonec – příslovce (kdy? jak dlouho?).'],
 ['Ve třídě je dvacet žáků, ale dnes přišlo jen patnáct, protože tři jsou nemocní.',CIS,['dvacet','patnáct','tři'],'Dvacet, patnáct, tři – číslovky základní.'],
 ['Maminka koupila na trhu mrkev, cibuli a čerstvý chléb.',ZJ,['maminka','mrkev','cibule'],'maminka, mrkev, cibuli → cibule. Trh a chléb jsou rodu mužského.'],
 ['Děti zpívaly, tančily a tleskaly až do večera.',INF,['zpívat','tančit','tleskat'],'zpívaly → zpívat, tančily → tančit, tleskaly → tleskat.'],
 ['Na modrém nebi svítilo jasné slunce a foukal teplý vítr.',PJM,['modrý','jasný','teplý'],'modrém → modrý, jasné → jasný, teplý.'],
 ['Kuře, tele a hříbě spala ve stáji vedle sebe.',SJ,['kuře','tele','hříbě'],'Kuře, tele, hříbě – rod střední. Stáj je rodu ženského.'],
 ['Pes radostně štěkal a hned běžel ven.',PRS,['radostně','hned','ven'],'Radostně (jak?), hned (kdy?), ven (kam?) – příslovce.'],
 ['Na stole ležel sešit a pod židlí jsem našel míč.','Vypište z textu všechna podstatná jména rodu mužského neživotného a napište je v 1. pádě čísla jednotného.',['stůl','sešit','míč'],'stole → stůl, sešit, míč. Židle je rodu ženského.'],
 ['Babička má pět vnoučat a dvě z nich chodí do první třídy.',CIS,['pět','dvě','první'],'Pět, dvě – číslovky základní; první – číslovka řadová.'],
 ['Malá holčička nesla v košíku červená jablka a žluté hrušky.',PJM,['malý','červený','žlutý'],'malá → malý, červená → červený, žluté → žlutý.']
],R0);
slot('cjSlova','Vypiš všechna slova',one('Slovní druhy v textu',()=>{const [v,q,a,e]=draw('cjSlova');
  return S.words(`${q} Slova oddělte čárkou.<br><i>${v}</i>`,a,3,e+' Za každé chybějící nebo navíc napsané slovo se strhává 1 bod. Diakritika se nehodnotí.',{diac:false});}),{});
/* ===== cjFraz – ustálená spojení ===== */
PQ.bank('cjFraz',[
 ['mít máslo na *****','mít něco na svědomí',['hlavě']],
 ['chodit kolem horké *****','mluvit o něčem oklikou, vyhýbat se podstatě',['kaše']],
 ['mít oči na *****','dávat velký pozor',['stopkách']],
 ['házet hrách na *****','marně někoho přesvědčovat',['stěnu','zeď']],
 ['nosit dříví do *****','dělat zbytečnou práci',['lesa']],
 ['mít hlavu v *****','být zasněný, nesoustředěný',['oblacích','oblakách']],
 ['být jako ryba ve *****','cítit se velmi dobře, být ve svém živlu',['vodě']],
 ['chytat *****','zahálet, nedávat pozor',['lelky']],
 ['dělat z komára *****','zveličovat maličkost',['velblouda']],
 ['sedět na dvou *****','nechtít se rozhodnout pro jednu stranu',['židlích']],
 ['mlátit prázdnou *****','mluvit zbytečně, bez užitku',['slámu']],
 ['vzít nohy na *****','rychle utéct',['ramena']],
 ['tahat za kratší *****','být v nevýhodě',['konec']],
 ['mít v hlavě *****','být hloupý, nic nevědět',['seno']],
 ['koupit zajíce v *****','koupit něco neprohlédnutého, naslepo',['pytli']]
],R0);
slot('cjFraz','Ustálená spojení',one('Ustálená spojení',()=>{const [v,m,a]=draw('cjFraz');
  return S.fields(`Doplňte chybějící slovo tak, aby vzniklo ustálené spojení s významem <i>${m}</i>:<br><b>${v.replace('*****','_____')}</b>`,[{a}],1,`Ustálené spojení zní: ${v.replace('*****',a[0])} (= ${m}).`,{});}),{});
/* ===== cjUprava – úprava vět (otevřená odpověď + sebehodnocení) ===== */
const CF='Tvary slov jsou spisovné a pravopis je správný.';
const SP=(w,a,b,ans)=>['sp',`Spojte věty v jedno souvětí pomocí výrazu <i>${w}</i>. Napište celé souvětí.<br><i>${a} ${b}</i>`,ans,[`Souvětí obsahuje výraz <i>${w}</i>.`,'Význam obou původních vět zůstal zachován.','Čárka je na správném místě.',CF]];
const MN=(v,ans)=>['mn',`Přepište větu tak, aby podmět i přísudek byly v čísle množném. Ostatní slova neměňte.<br><i>${v}</i>`,ans,['Podmět i přísudek jsou v čísle množném.','Ostatní slova zůstala beze změny.',CF]];
const MC=(v,ans)=>['mc',`Přepište větu do minulého času.<br><i>${v}</i>`,ans,['Přísudek je v minulém čase.','Ostatní slova zůstala beze změny.',CF]];
const NR=(v,ans)=>['nr',`Převeďte přímou řeč na nepřímou. Napište celé souvětí.<br><i>${v}</i>`,ans,['Odpověď neobsahuje uvozovky ani dvojtečku.','Vedlejší věta začíná spojkou (že, jestli, zda).','Osoba slovesa odpovídá nepřímé řeči.','Význam zůstal stejný.',CF]];
PQ.bank('cjUprava',[
 [SP('protože','Zůstali jsme doma.','Pršelo.',['zůstali jsme doma, protože pršelo','protože pršelo, zůstali jsme doma']),MN('Pes štěká na pošťáka.',['psi štěkají na pošťáka'])],
 [SP('když','Vrátil jsem se domů.','Už byla tma.',['když jsem se vrátil domů, už byla tma','už byla tma, když jsem se vrátil domů']),MC('Kamarádka mi píše dopis.',['kamarádka mi psala dopis','kamarádka mi napsala dopis'])],
 [SP('ale','Chtěli jsme jet k moři.','Neměli jsme peníze.',['chtěli jsme jet k moři, ale neměli jsme peníze']),NR('Petr řekl: „Přijdu zítra.“',['petr řekl, že přijde zítra'])],
 [SP('aby','Otevřel okno.','Do místnosti proudil čerstvý vzduch.',['otevřel okno, aby do místnosti proudil čerstvý vzduch']),MN('Žák čte knihu.',['žáci čtou knihu'])],
 [SP('který','Na zahradě roste strom.','Ten strom zasadil děda.',['na zahradě roste strom, který zasadil děda']),MC('Děti si hrají na písku.',['děti si hrály na písku'])],
 [SP('a proto','Byla jsem unavená.','Šla jsem brzy spát.',['byla jsem unavená, a proto jsem šla brzy spát']),NR('Maminka řekla: „Vrátím se večer.“',['maminka řekla, že se vrátí večer'])],
 [SP('i když','Šli jsme ven.','Venku mrzlo.',['šli jsme ven, i když venku mrzlo','i když venku mrzlo, šli jsme ven']),MN('Kočka chytá myš.',['kočky chytají myš'])],
 [SP('až','Zavolám ti.','Přijedu domů.',['zavolám ti, až přijedu domů','až přijedu domů, zavolám ti']),MC('Vlak přijíždí na nádraží.',['vlak přijížděl na nádraží','vlak přijel na nádraží'])],
 [SP('jestli','Nevím.','Přijde Jana na oslavu?',['nevím, jestli jana přijde na oslavu','nevím, jestli přijde jana na oslavu']),NR('Učitel řekl: „Zítra píšeme test.“',['učitel řekl, že zítra píšeme test','učitel řekl, že zítra budeme psát test'])],
 [SP('protože','Rostliny uvadly.','Nikdo je nezaléval.',['rostliny uvadly, protože je nikdo nezaléval','protože je nikdo nezaléval, rostliny uvadly']),MN('Pták staví hnízdo.',['ptáci staví hnízdo'])],
 [SP('ale','Snažil se.','Nepodařilo se mu to.',['snažil se, ale nepodařilo se mu to']),MC('Sousedka zalévá květiny.',['sousedka zalévala květiny','sousedka zalila květiny'])],
 [SP('kde','Bydlíme v domě.','V tom domě je pekárna.',['bydlíme v domě, kde je pekárna']),NR('Jana řekla: „Mám ráda zmrzlinu.“',['jana řekla, že má ráda zmrzlinu'])],
 [SP('aby','Šetřil peníze.','Mohl si koupit kolo.',['šetřil peníze, aby si mohl koupit kolo']),MN('Dítě se směje.',['děti se smějí'])],
 [SP('když','Svítí slunce.','Chodíme na procházky.',['když svítí slunce, chodíme na procházky','chodíme na procházky, když svítí slunce']),MC('Bratr opravuje kolo.',['bratr opravoval kolo','bratr opravil kolo'])],
 [SP('protože','Autobus nejel.','Silnice byla zavátá.',['autobus nejel, protože silnice byla zavátá','autobus nejel, protože byla silnice zavátá','protože silnice byla zavátá, autobus nejel']),NR('Babička se zeptala: „Máte hlad?“',['babička se zeptala, jestli máme hlad','babička se zeptala, zda máme hlad','babička se zeptala, jestli máte hlad','babička se zeptala, zda máte hlad'])]
],R0);
const cap=x=>x.charAt(0).toUpperCase()+x.slice(1);
slot('cjUprava','Úprava vět',one('Úprava vět',()=>draw('cjUprava').map(([k,q,a,cond])=>S.fields(q,[{a,show:cap(a[0])+'.',ph:'celá věta'}],1,`Vzorová odpověď: ${cap(a[0])}.${a.length>1?` Uznává se i: ${a.slice(1).map(x=>cap(x)+'.').join(' ')}`:''} Jiná odpověď může být také správná – zkontroluj podmínky.`,{cond}))),{});
/* ===== zařazení do testu: na pozici se losuje jeden z typů se stejným bodovým rozsahem ===== */
PQ.BP.cj.full=['cj1','cjP',['cj5','cjVyp'],'cj6',['cj7','cjTvar','cjPrib'],'cjA',['cj14','cjUprava'],'cj15',['cj16','cjFraz'],'cj17','cj18','cjR','cj24',['cj25','cjSlova'],'cjS','cj30'];
PQ.BP.cj.short=['cj1','cjP',['cj5','cjVyp','cjUprava'],'cj6','cjA','cj15','cj18'];
PQ.HINTS=PQ.HINTS||{};
})(typeof window!=='undefined'?window:globalThis);
