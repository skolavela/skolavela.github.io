// Čeština – původní otázky ve stylu jednotné přijímací zkoušky
(function(G){
const {mc,yn,num,txt,topic}=G.PQ;
// doplňovačka i/y (nebo í/ý)
const gap=(w,l,e)=>{const long=/[íý]/.test(l);return mc('Doplňte správné písmeno: <b>'+w.replace('_','<u>&nbsp;_&nbsp;</u>')+'</b>',long?['í','ý']:['i','y'],(l==='i'||l==='í')?0:1,e,{keep:1});};
const V='Vyjmenované slovo ',P='Příbuzné k vyjmenovanému slovu ';
const pravopis=[
gap('b_dlit','y',V+'bydlit.'),gap('ob_vatel','y',P+'bydlit.'),gap('kob_la','y',V+'kobyla.'),gap('b_strý','y',V+'bystrý.'),
gap('m_dlo','ý',V+'mýdlo.'),gap('hm_z','y',V+'hmyz.'),gap('p_cha','ý',V+'pýcha.'),gap('p_tel','y',V+'pytel.'),
gap('netop_r','ý',V+'netopýr.'),gap('s_rový','ý',P+'sýr.'),gap('s_korka','ý',V+'sýkorka.'),gap('v_dra','y',V+'vydra.'),
gap('jaz_k','y',V+'jazyk.'),gap('sl_šet','y',V+'slyšet.'),gap('pl_nout','y',V+'plynout.'),gap('l_že','y',V+'lyže.'),
gap('v_soký','y',V+'vysoký.'),gap('z_vat','í','Zívat není vyjmenované slovo (po z jsou jen brzy, jazyk, nazývat se) → í.'),
gap('mal_na','i','Malina není vyjmenované ani příbuzné slovo → i.'),gap('l_pa','í','Lípa není vyjmenované ani příbuzné slovo → í.'),
gap('p_vo','i','Pivo není vyjmenované slovo → i.'),gap('s_lný','i','Silný není příbuzné se slovem syn ani sýr → i.'),
gap('v_dlička','i','Vidlička (vidle) není vyjmenované slovo → i.'),gap('b_tva','i','Bitva souvisí s bít (tlouct), ne s být → i.'),
gap('m_nuta','i','Minuta není vyjmenované slovo → i.'),gap('z_ma','i','Zima není vyjmenované slovo → i.'),
gap('l_stí','i','Listí není vyjmenované slovo → i.'),gap('p_sek','í','Písek není vyjmenované slovo → í.'),
gap('ch_trý','y','Po tvrdé souhlásce ch píšeme y.'),gap('k_selý','y','Po tvrdé souhlásce k píšeme y.'),
gap('r_ba','y','Po tvrdé souhlásce r píšeme y.'),gap('t_gr','y','Po tvrdé souhlásce t píšeme y (tygr).'),
gap('ž_vot','i','Po měkké souhlásce ž píšeme i.'),gap('č_stý','i','Po měkké souhlásce č píšeme i.'),
gap('c_bule','i','Po měkké souhlásce c píšeme i.'),gap('š_roký','i','Po měkké souhlásce š píšeme i.'),
gap('Kluci si hrál_ na hřišti.','i','Podmět kluci je rodu mužského životného → -i.'),
gap('Holky se smál_.','y','Podmět holky je rodu ženského → -y.'),
gap('Ptáci odlétl_ na jih.','i','Ptáci = rod mužský životný → -i.'),
gap('Stromy se ohýbal_ ve větru.','y','Stromy = rod mužský neživotný → -y.'),
gap('Děti běhal_ po zahradě.','y','Podmět děti (v množném čísle rod ženský) → -y.'),
gap('Rodiče přišl_ včas.','i','Rodiče = rod mužský životný → -i.'),
gap('Učitelé a žákyně odjel_ na výlet.','i','Je-li v podmětu aspoň jedno podstatné jméno rodu mužského životného, píšeme -i.'),
gap('Vlaky přijížděl_ se zpožděním.','y','Vlaky = rod mužský neživotný → -y.'),
gap('Šli jsme s kamarád_ do kina.','y','7. pád množného čísla vzoru pán: s kamarády → -y.'),
gap('Na koních jsme jel_ celý den. (mluví dívky)','y','Mluví-li dívky (rod ženský), píšeme jely.'),
// s/z
mc('Které slovo je napsáno správně?',['sbírat','zbírat'],0,'Sbírat = brát dohromady → předpona s-.'),
mc('Které slovo je napsáno správně?',['shodit','zhodit'],0,'Shodit = dát shora dolů → s-.'),
mc('Které slovo je napsáno správně?',['ztratit','stratit'],0,'Předpona z- (něco zmizí, ztratí se).'),
mc('Které slovo je napsáno správně?',['zrušit','srušit'],0,'Změna stavu → předpona z-.'),
mc('Které slovo je napsáno správně?',['shromáždit','zhromáždit'],0,'Shromáždit = dát dohromady → s-.'),
mc('Které slovo je napsáno správně?',['zmizet','smizet'],0,'Předpona z- (změna stavu).'),
mc('Které slovo je napsáno správně?',['spadnout','zpadnout'],0,'Spadnout = pohyb shora dolů → s-.'),
mc('Které slovo je napsáno správně?',['sjednotit','zjednotit'],0,'Sjednotit = spojit dohromady → s-.'),
mc('Které slovo je napsáno správně?',['zkazit','skazit'],0,'Zkazit = změnit k horšímu → z-.'),
mc('Které slovo je napsáno správně?',['zbavit se','sbavit se'],0,'Zbavit se píšeme se z-.'),
// mě/mně
mc('Doplňte: <b>_sto</b>',['mě','mně'],0,'Město – kořen měst-, píšeme mě.',{keep:1}),
mc('Doplňte: <b>z_na</b>',['mě','mně'],0,'Změna – z+měn-, píšeme mě.',{keep:1}),
mc('Doplňte: <b>pa_ť</b>',['mě','mně'],0,'Paměť – píšeme mě.',{keep:1}),
mc('Doplňte: <b>_kký</b>',['mě','mně'],0,'Měkký – píšeme mě.',{keep:1}),
mc('Doplňte: <b>_síc</b>',['mě','mně'],0,'Měsíc – píšeme mě.',{keep:1}),
mc('Doplňte: <b>ne_cký</b>',['mě','mně'],0,'Německý – píšeme mě.',{keep:1}),
mc('Doplňte: <b>do_nka</b>',['mě','mně'],1,'Domněnka souvisí se slovem domnívat se (kořen mn-) → mně.',{keep:1}),
mc('Doplňte: <b>pom_nka</b>',['mě','mně'],1,'Pomněnka (kořen mn-) → mně.',{keep:1}),
mc('Doplňte: <b>Podej to _, prosím.</b>',['mě','mně'],1,'Komu? – 3. pád → mně.',{keep:1}),
mc('Doplňte: <b>Vidíš _?</b>',['mě','mně'],0,'Koho? – 4. pád → mě.',{keep:1}),
mc('Doplňte: <b>Mluvili o _.</b>',['mě','mně'],1,'O kom? – 6. pád → mně.',{keep:1}),
// velká písmena
mc('Ve které možnosti jsou velká písmena správně?',['Bydlíme v Ústí nad Labem.','Bydlíme v Ústí Nad Labem.','Bydlíme v ústí nad Labem.','Bydlíme v Ústí nad labem.'],0,'Ve víceslovném názvu obce píšeme velké první slovo a slova, která jsou sama vlastním jménem (Labe); předložky malé.'),
mc('Ve které možnosti jsou velká písmena správně?',['Jeli jsme do Vysokých Tater.','Jeli jsme do vysokých Tater.','Jeli jsme do Vysokých tater.','Jeli jsme do vysokých tater.'],0,'Vysoké Tatry – zeměpisný název, obě slova velkým písmenem.'),
mc('Ve které možnosti jsou velká písmena správně?',['Navštívili jsme Pražský hrad.','Navštívili jsme pražský Hrad.','Navštívili jsme Pražský Hrad.','Navštívili jsme pražský hrad.'],0,'Název stavby Pražský hrad: velké je jen první slovo.'),
mc('Ve které možnosti jsou velká písmena správně?',['Plavili se přes Atlantský oceán.','Plavili se přes atlantský oceán.','Plavili se přes Atlantský Oceán.','Plavili se přes atlantský Oceán.'],0,'Atlantský oceán – velké je první slovo, obecné jméno oceán malé.'),
mc('Ve které možnosti jsou velká písmena správně?',['O Vánocích pojedeme za babičkou.','O vánocích pojedeme za babičkou.','O Vánocích pojedeme za Babičkou.','o Vánocích pojedeme za babičkou.'],0,'Názvy svátků (Vánoce) píšeme velkým písmenem.'),
mc('Ve které možnosti jsou velká písmena správně?',['Mám rád český jazyk a Českou republiku.','Mám rád Český jazyk a Českou republiku.','Mám rád český jazyk a českou republiku.','Mám rád Český Jazyk a Českou Republiku.'],0,'Přídavné jméno český malé; název státu Česká republika – velké jen první slovo.'),
mc('Ve které možnosti jsou velká písmena správně?',['Česko je členem Evropské unie.','Česko je členem evropské unie.','Česko je členem Evropské Unie.','česko je členem Evropské unie.'],0,'Evropská unie – velké je první slovo.'),
mc('Ve které možnosti jsou velká písmena správně?',['Na Štědrý den jsme zdobili stromeček.','Na štědrý den jsme zdobili stromeček.','Na Štědrý Den jsme zdobili stromeček.','Na štědrý Den jsme zdobili stromeček.'],0,'Štědrý den – název svátku, velké první slovo.'),
// interpunkce
mc('Ve které větě je čárka správně?',['Myslím, že zítra přijde.','Myslím že, zítra přijde.','Myslím že zítra, přijde.','Myslím že zítra přijde.'],0,'Vedlejší věta uvozená spojkou že se odděluje čárkou.'),
mc('Ve které větě jsou čárky správně?',['Petr, který bydlí vedle, je můj kamarád.','Petr který bydlí vedle, je můj kamarád.','Petr, který bydlí vedle je můj kamarád.','Petr který, bydlí vedle je můj kamarád.'],0,'Vložená vedlejší věta se odděluje čárkami z obou stran.'),
mc('Ve které větě je interpunkce správně?',['Přišel domů a sedl si ke stolu.','Přišel domů, a sedl si ke stolu.','Přišel, domů a sedl si ke stolu.','Přišel domů a, sedl si ke stolu.'],0,'Před slučovacím a mezi větami v poměru slučovacím čárku nepíšeme.'),
mc('Ve které větě je čárka správně?',['Byl unavený, ale šel dál.','Byl unavený ale, šel dál.','Byl, unavený ale šel dál.','Byl unavený ale šel dál.'],0,'Před odporovací spojkou ale píšeme čárku.'),
mc('Ve které větě je čárka správně?',['Jak se máš, Petře?','Jak se, máš Petře?','Jak, se máš Petře?','Jak se máš Petře?'],0,'Oslovení se odděluje čárkou.'),
mc('Ve které větě je čárka správně?',['Buď půjdeš se mnou, nebo zůstaneš doma.','Buď půjdeš se mnou nebo zůstaneš doma.','Buď, půjdeš se mnou nebo zůstaneš doma.','Buď půjdeš, se mnou nebo zůstaneš doma.'],0,'U dvojité spojky buď – nebo píšeme čárku před nebo.'),
mc('Ve které větě jsou čárky správně?',['Koupili jsme jablka, hrušky a švestky.','Koupili jsme jablka, hrušky, a švestky.','Koupili jsme, jablka, hrušky a švestky.','Koupili jsme jablka hrušky a švestky.'],0,'Členy výčtu oddělujeme čárkou, před slučovacím a čárku nepíšeme.'),
mc('Ve které větě je čárka správně?',['Čím víc se učí, tím víc ví.','Čím víc, se učí tím víc ví.','Čím víc se učí tím, víc ví.','Čím víc se učí tím víc ví.'],0,'Věty spojené výrazem čím – tím oddělujeme čárkou.'),
yn('Rozhodněte o každém slově, zda je napsáno pravopisně správně.',[['vysvědčení',true],['výskat',true],['zpívat',true],['bilina',false]],'Vysvědčení, výskat (příbuzné k vyskytnout se? ne – výskat je vyjmenované slovo), zpívat jsou správně; správně je bylina (od býlí).'),
yn('Rozhodněte o každé větě, zda je napsána pravopisně správně.',[['Psi štěkali na pošťáka.',true],['Kočky mňoukali u dveří.',false],['Na stromech zpívali ptáci.',true],['Auta stála na parkovišti.',true]],'Kočky (rod ženský) → mňoukaly. Psi, ptáci → -i; auta (rod střední) → -a.'),
];
// opravit vysvětlení u výskat
pravopis[pravopis.length-2].e='Vysvědčení, výskat (vyjmenované slovo) a zpívat jsou správně; správně je bylina (příbuzné k býlí).';

const SD=['podstatné jméno','přídavné jméno','zájmeno','číslovka','sloveso','příslovce','předložka','spojka','částice','citoslovce'];
const sd=(v,ans,e)=>{const w=SD.filter(x=>x!==ans);const o=[ans,...w.sort(()=>0).slice(0)];return mc('Určete slovní druh tučného slova: '+v,[ans,...pick3(w,ans)],0,e);};
function pick3(w,ans){const i=SD.indexOf(ans);return [w[(i)%w.length],w[(i+3)%w.length],w[(i+6)%w.length]];}
const pad=(v,a,e)=>mc('Určete pád tučného slova: '+v,['1. pád','2. pád','3. pád','4. pád','5. pád','6. pád','7. pád'].filter((x,i)=>i+1===a||[1,2,3,4,5,6,7].filter(n=>n!==a).slice(0,3).includes(i+1)).sort((x,y)=>(x[0]==a?-1:y[0]==a?1:0)),0,e);
const vz=(w,a,o,e)=>mc('Podle kterého vzoru se skloňuje slovo <b>'+w+'</b>?',[a,...o],0,e);
const tvaroslovi=[
sd('Běžel <b>rychle</b> domů.','příslovce','Rychle vyjadřuje způsob děje (jak?) → příslovce.'),
sd('<b>Ach</b>, to je ale krása!','citoslovce','Ach vyjadřuje citový postoj → citoslovce.'),
sd('Čekal jsem <b>před</b> domem.','předložka','Před stojí před podstatným jménem → předložka.'),
sd('Přišli <b>tři</b> kamarádi.','číslovka','Tři vyjadřuje počet → číslovka.'),
sd('To bylo <b>jeho</b> kolo.','zájmeno','Jeho je zájmeno přivlastňovací.'),
sd('Zůstal doma, <b>protože</b> pršelo.','spojka','Protože spojuje věty → spojka.'),
sd('<b>Kéž</b> by už bylo léto!','částice','Kéž uvozuje přací větu → částice.'),
sd('Ta kniha je <b>zajímavá</b>.','přídavné jméno','Zajímavá vyjadřuje vlastnost (jaká?) → přídavné jméno.'),
sd('<b>Běhání</b> mě baví.','podstatné jméno','Běhání je podstatné jméno (podstatné jméno slovesné).'),
sd('Děti si venku <b>hrají</b>.','sloveso','Hrají vyjadřuje děj → sloveso.'),
sd('<b>Dvakrát</b> zazvonil.','číslovka','Dvakrát je číslovka násobná.'),
sd('Seděla <b>u</b> okna.','předložka','U je předložka.'),
sd('Viděl jsem <b>ho</b> včera.','zájmeno','Ho je tvar osobního zájmena on.'),
sd('<b>Bum!</b> Něco spadlo.','citoslovce','Bum napodobuje zvuk → citoslovce.'),
sd('Byl to <b>nejlepší</b> den.','přídavné jméno','Nejlepší je 3. stupeň přídavného jména dobrý.'),
sd('Půjdeme ven, <b>nebo</b> zůstaneme doma?','spojka','Nebo spojuje věty → spojka.'),
sd('Vrátili se <b>pozdě</b>.','příslovce','Pozdě vyjadřuje čas (kdy?) → příslovce.'),
sd('<b>Prvního</b> září začíná škola.','číslovka','Prvního je číslovka řadová.'),
pad('bez <b>kamaráda</b>',2,'Bez koho? → 2. pád.'),
pad('šel s <b>kamarádem</b>',7,'S kým? → 7. pád.'),
pad('mluvili o <b>škole</b>',6,'O čem? → 6. pád.'),
pad('blížili se k <b>mostu</b>',3,'Ke komu, k čemu? → 3. pád.'),
pad('vidím <b>psa</b>',4,'Koho, co vidím? → 4. pád.'),
pad('<b>Petře</b>, pojď sem!',5,'Oslovujeme → 5. pád.'),
pad('<b>Maminka</b> peče koláč.',1,'Kdo, co? → 1. pád.'),
vz('lékař','muž',['pán','stroj','soudce'],'Rod mužský životný, končí na měkkou souhlásku → muž.'),
vz('soudce','soudce',['muž','předseda','pán'],'Rod mužský životný zakončený na -ce → soudce.'),
vz('stavení','stavení',['moře','kuře','město'],'Rod střední zakončený na -í → stavení.'),
vz('kuře','kuře',['moře','město','stavení'],'Rod střední, 2. pád kuřete → kuře.'),
vz('předseda','předseda',['pán','žena','soudce'],'Rod mužský životný zakončený na -a → předseda.'),
vz('věc','kost',['píseň','růže','žena'],'Rod ženský, 2. pád věci, 3. pád věci → kost.'),
vz('zahrada','žena',['růže','píseň','předseda'],'Rod ženský zakončený na -a → žena.'),
vz('strom','hrad',['stroj','pán','muž'],'Rod mužský neživotný, zakončení na tvrdou souhlásku → hrad.'),
mc('Ve kterém tvaru je sloveso <b>přijdeme</b>?',['1. osoba, množné číslo, čas budoucí','1. osoba, množné číslo, čas přítomný','3. osoba, množné číslo, čas budoucí','2. osoba, množné číslo, čas budoucí'],0,'My přijdeme – dokonavé sloveso v přítomném tvaru vyjadřuje budoucnost.'),
mc('Jaký způsob má tvar <b>pojďte</b>?',['rozkazovací','oznamovací','podmiňovací','neurčitý'],0,'Pojďte je výzva → způsob rozkazovací.'),
mc('Jaký způsob má tvar <b>udělal bys</b>?',['podmiňovací','oznamovací','rozkazovací','trpný'],0,'Tvar s bych, bys, by… → způsob podmiňovací.'),
mc('Ve které větě je sloveso v rodě trpném?',['Dům byl postaven loni.','Dělníci postavili dům.','Dům stojí na kopci.','Stavíme dům.'],0,'Byl postaven = trpné příčestí + být → rod trpný.'),
mc('Které sloveso je vidu dokonavého?',['napsat','psát','číst','běhat'],0,'Napsat vyjadřuje děj ukončený → vid dokonavý.'),
txt('Napište 2. stupeň přídavného jména <b>dobrý</b>.',['lepší'],'dobrý – lepší – nejlepší'),
txt('Napište 3. stupeň příslovce <b>špatně</b>.',['nejhůře','nejhůř'],'špatně – hůře – nejhůře (nejhůř).'),
mc('Jakého rodu je podstatné jméno <b>myš</b>?',['ženského','mužského neživotného','středního','mužského životného'],0,'Ta myš → rod ženský (vzor kost).'),
yn('Rozhodněte o každém tvrzení, zda je pravdivé.',[['Slovo „koupání“ je podstatné jméno.',true],['Slovo „sedm“ je číslovka.',true],['Slovo „vedle“ ve spojení „vedle domu“ je příslovce.',false],['Slovo „ó“ je citoslovce.',true]],'Vedle ve spojení vedle domu je předložka (pojí se s 2. pádem).'),
];

const VC=['podmět','přísudek','předmět','přívlastek','příslovečné určení'];
const vc=(v,a,e)=>mc('Určete větný člen tučného výrazu: '+v,[a,...VC.filter(x=>x!==a).slice(0,3)],0,e);
const VV=['podmětná','předmětná','přívlastková','příslovečná časová','příslovečná místní','příslovečná příčinná','příslovečná účelová','příslovečná podmínková','příslovečná přípustková','příslovečná způsobová'];
const vv=(v,a,e)=>{const w=VV.filter(x=>x!==a);const i=VV.indexOf(a);return mc('Určete druh tučné vedlejší věty: '+v,[a,w[i%w.length],w[(i+2)%w.length],w[(i+5)%w.length]],0,e);};
const PM=['slučovací','odporovací','vylučovací','důsledkový','příčinný'];
const pm=(v,a,e)=>mc('Jaký je významový poměr mezi větami hlavními? '+v,[a,...PM.filter(x=>x!==a).slice(0,3)],0,e);
const skladba=[
vc('<b>Petr</b> čte knihu.','podmět','Kdo čte? Petr → podmět.'),
vc('Petr <b>čte</b> knihu.','přísudek','Co Petr dělá? čte → přísudek.'),
vc('Petr čte <b>knihu</b>.','předmět','Co čte? knihu → předmět.'),
vc('Petr čte <b>zajímavou</b> knihu.','přívlastek','Jakou knihu? zajímavou → přívlastek shodný.'),
vc('Večeři jsme jedli <b>v kuchyni</b>.','příslovečné určení','Kde? → příslovečné určení místa.'),
vc('<b>Ráno</b> jsme vstali brzy.','příslovečné určení','Kdy? → příslovečné určení času.'),
vc('Běžel <b>rychle</b>.','příslovečné určení','Jak? → příslovečné určení způsobu.'),
vc('<b>Kvůli dešti</b> jsme nešli ven.','příslovečné určení','Proč? → příslovečné určení příčiny.'),
vc('Dům <b>mého dědečka</b> stojí u řeky.','přívlastek','Čí dům? → přívlastek neshodný.'),
vc('Na stole ležely <b>klíče</b>.','podmět','Co leželo? klíče → podmět (shoduje se s přísudkem ležely).'),
vc('Sestra pomohla <b>bratrovi</b>.','předmět','Komu pomohla? → předmět.'),
vc('Večer <b>zpívali</b> u ohně.','přísudek','Co dělali? zpívali → přísudek.'),
mc('Která věta je jednočlenná?',['Prší.','Prší a fouká vítr.','Vítr fouká.','Děti spí.'],0,'Věta „Prší.“ nemá podmět a přísudek, je jednočlenná (věta je tvořena jen jedním větným členem).'),
mc('Co je podmětem věty „Na zahradě kvetly první tulipány.“?',['tulipány','zahradě','kvetly','první'],0,'Co kvetlo? tulipány.'),
mc('Co je přísudkem věty „Můj bratr je výborný kuchař.“?',['je kuchař','bratr','výborný','je'],0,'Přísudek jmenný se sponou: je kuchař.'),
num('Kolik vět (určitých slovesných tvarů) obsahuje souvětí: „Když jsme přišli domů, maminka už vařila večeři, kterou jsme pak snědli.“?',3,'Přišli – vařila – snědli → 3 věty.'),
num('Kolik vět obsahuje souvětí: „Nevěděl, kam jít, a tak se zeptal kolemjdoucího.“?',2,'Nevěděl – (kam jít je neurčitek, ne určité sloveso) – zeptal se → 2 věty.'),
num('Kolik vět obsahuje souvětí: „Říkal, že přijde, ale nepřišel, protože onemocněl.“?',4,'Říkal – přijde – nepřišel – onemocněl → 4 věty.'),
num('Kolik vět obsahuje souvětí: „Kdo si hraje, nezlobí.“?',2,'hraje – nezlobí → 2 věty.'),
num('Kolik vět obsahuje souvětí: „Šli jsme do lesa, sbírali houby a večer jsme je usušili.“?',3,'Šli – sbírali – usušili → 3 věty.'),
vv('Nevím, <b>kdy přijde</b>.','předmětná','Nevím co? → vedlejší věta předmětná.'),
vv('<b>Kdo lže</b>, ten krade.','podmětná','Kdo krade? → vedlejší věta podmětná.'),
vv('Dům, <b>který stojí na kopci</b>, je starý.','přívlastková','Který dům? → vedlejší věta přívlastková.'),
vv('Přišel, <b>když se stmívalo</b>.','příslovečná časová','Kdy přišel? → časová.'),
vv('Nešel ven, <b>protože pršelo</b>.','příslovečná příčinná','Proč nešel? → příčinná.'),
vv('Učí se, <b>aby zvládl zkoušky</b>.','příslovečná účelová','Za jakým účelem? → účelová.'),
vv('Půjdu tam, <b>kam mě pošleš</b>.','příslovečná místní','Kam půjdu? → místní.'),
vv('<b>Jestliže bude pršet</b>, zůstaneme doma.','příslovečná podmínková','Za jaké podmínky? → podmínková.'),
vv('<b>Ačkoli byl unavený</b>, pracoval dál.','příslovečná přípustková','Navzdory čemu? → přípustková.'),
vv('Mluvil, <b>jako by nic nevěděl</b>.','příslovečná způsobová','Jak mluvil? → způsobová.'),
vv('Bojím se, <b>že nestihneme vlak</b>.','předmětná','Čeho se bojím? → předmětná.'),
vv('Kniha, <b>kterou jsi mi půjčil</b>, je skvělá.','přívlastková','Která kniha? → přívlastková.'),
pm('Prší, ale je teplo.','odporovací','Ale vyjadřuje protiklad → odporovací.'),
pm('Přišel a sedl si.','slučovací','Děje se prostě slučují → slučovací.'),
pm('Buď přijdeš včas, nebo pojedeme bez tebe.','vylučovací','Jedna možnost vylučuje druhou → vylučovací.'),
pm('Byl nemocný, proto nepřišel.','důsledkový','Druhá věta je důsledkem první → důsledkový.'),
pm('Nepřišel, neboť byl nemocný.','příčinný','Druhá věta uvádí příčinu (neboť) → příčinný.'),
pm('Venku svítilo slunce, kdežto u nás pršelo.','odporovací','Kdežto vyjadřuje protiklad → odporovací.'),
yn('Rozhodněte o každém tvrzení k souvětí „Když zazvonilo, děti vyběhly na dvůr, kde si hrály.“',[['Souvětí obsahuje tři věty.',true],['Věta „děti vyběhly na dvůr“ je hlavní.',true],['Věta „kde si hrály“ je příslovečná časová.',false],['Věta „Když zazvonilo“ je vedlejší.',true]],'Kde si hrály rozvíjí slovo dvůr (na jaký dvůr?) – je přívlastková (případně místní), ne časová.'),
];
// poslední tvrzení upřesníme jednoznačně
skladba[skladba.length-1]=yn('Rozhodněte o každém tvrzení k souvětí „Když zazvonilo, děti vyběhly na dvůr.“',[['Souvětí obsahuje dvě věty.',true],['Věta „děti vyběhly na dvůr“ je hlavní.',true],['Věta „Když zazvonilo“ je příslovečná časová.',true],['Souvětí je tvořeno dvěma větami hlavními.',false]],'Když zazvonilo = vedlejší věta časová, děti vyběhly na dvůr = věta hlavní.');

const syn=(w,a,o)=>mc('Které slovo má nejbližší význam slovu <b>'+w+'</b>?',[a,...o],0,'Synonymum: '+w+' = '+a+'.');
const ant=(w,a,o)=>mc('Které slovo má opačný význam než slovo <b>'+w+'</b>?',[a,...o],0,'Antonymum: '+w+' × '+a+'.');
const fr=(f,a,o)=>mc('Co znamená frazém <b>'+f+'</b>?',[a,...o],0,f.charAt(0).toUpperCase()+f.slice(1)+' = '+a+'.');
const cz=(w,a,o)=>mc('Co znamená slovo <b>'+w+'</b>?',[a,...o],0,w.charAt(0).toUpperCase()+w.slice(1)+' = '+a+'.');
const zasoba=[
syn('odvážný','statečný',['opatrný','zbabělý','pomalý']),syn('hovořit','mluvit',['mlčet','psát','poslouchat']),
syn('zahájit','začít',['ukončit','zrušit','odložit']),syn('obava','strach',['radost','jistota','naděje']),
syn('vyčerpaný','unavený',['odpočatý','veselý','hladový']),syn('hbitý','rychlý',['líný','těžkopádný','malý']),
syn('letitý','starý',['nový','mladistvý','moderní']),syn('sklíčený','smutný',['šťastný','rozzlobený','klidný']),
ant('štědrý','lakomý',['bohatý','laskavý','dobrý']),ant('pravda','lež',['skutečnost','fakt','jistota']),
ant('hojnost','nedostatek',['nadbytek','bohatství','spokojenost']),ant('zbabělý','odvážný',['bázlivý','ustrašený','opatrný']),
ant('výjimečný','obyčejný',['mimořádný','vzácný','zvláštní']),ant('připustit','popřít',['uznat','dovolit','souhlasit']),
fr('mít máslo na hlavě','mít něco na svědomí',['být nemocný','mít mastné vlasy','být bohatý']),
fr('chodit kolem horké kaše','vyhýbat se podstatě věci',['dlouho vařit','být hladový','spěchat']),
fr('házet hrách na zeď','marně někoho přesvědčovat',['plýtvat jídlem','hrát si','stavět dům']),
fr('být jako ryba ve vodě','cítit se dobře, ve svém živlu',['umět dobře plavat','být mlčenlivý','být nemocný']),
fr('dělat z komára velblouda','zveličovat',['zlehčovat','lhát','pracovat pomalu']),
fr('nosit dříví do lesa','dělat něco zbytečného',['těžce pracovat','pomáhat druhým','chodit na procházky']),
fr('mít za ušima','být mazaný, chytrý',['špatně slyšet','být špinavý','být hloupý']),
fr('vzít nohy na ramena','utéct',['zpomalit','cvičit','zakopnout']),
fr('chytit druhý dech','znovu nabrat síly',['zadýchat se','začít kouřit','nachladit se']),
fr('pověsit něco na hřebík','přestat se něčím zabývat',['uklidit věc','něco ukrást','začít něco nového']),
cz('tolerantní','snášenlivý',['netrpělivý','zlomyslný','nerozhodný']),cz('prioritní','přednostní',['vedlejší','zbytečný','pozdní']),
cz('ilegální','nezákonný',['povolený','veřejný','oficiální']),cz('akceptovat','přijmout',['odmítnout','zapomenout','přehlédnout']),
cz('ambiciózní','ctižádostivý',['líný','skromný','nesmělý']),cz('pesimista','člověk, který vidí věci černě',['člověk, který je vždy veselý','odborník na jazyky','vedoucí výpravy']),
cz('anonymní','bezejmenný, nepodepsaný',['slavný','podepsaný','oficiální']),cz('kompromis','dohoda s ústupky obou stran',['naprosté vítězství','spor','zákaz']),
mc('Které slovo vzniklo skládáním?',['vodopád','učitel','přepsat','vodník'],0,'Vodopád = voda + padat (dva slovní základy) → skládání.'),
mc('Které slovo NENÍ příbuzné se slovem <b>voda</b>?',['vodit','vodník','vodovod','zavodnit'],0,'Vodit souvisí s vést, ne s vodou.'),
mc('Které slovo je odvozeno předponou?',['přepsat','písař','pisatel','písmo'],0,'Pře- + psát → odvozování předponou.'),
mc('Které slovo je zkratkové slovo?',['Čedok','auto','kino','foto'],0,'Čedok vznikl ze zkratky Československá dopravní kancelář; auto, kino, foto jsou zkrácená (ne zkratková) slova.'),
mc('Které slovo je mnohoznačné?',['koruna','sýkorka','smrk','pondělí'],0,'Koruna: královská, stromu, zubní, peníze – více významů.'),
mc('Ve které dvojici jsou synonyma?',['zlobit se – hněvat se','den – noc','vysoký – nízký','začátek – konec'],0,'Zlobit se a hněvat se mají stejný význam.'),
mc('Které slovo je citově zabarvené (zdrobnělina)?',['domeček','dům','domov','domácnost'],0,'Domeček je zdrobnělina.'),
mc('Které slovo je spisovné?',['polévka','polívka','kafe','dobrej'],0,'Polévka je spisovný tvar; polívka, kafe a dobrej jsou nespisovné/hovorové.'),
yn('Rozhodněte o každém tvrzení, zda je pravdivé.',[['Slova „malý“ a „velký“ jsou antonyma.',true],['Slova „kolo“ a „bicykl“ jsou synonyma.',true],['Slovo „okno“ je přejaté z angličtiny.',false],['Slovo „hrad“ je zdrobnělina.',false]],'Malý × velký = antonyma; kolo = bicykl (synonyma). Okno je domácí slovo.'),
];

// porozumění textu – původní texty
const T1='<p><b>Text 1</b></p><p>Včely medonosné žijí ve společenstvích, kterým říkáme včelstva. V jednom včelstvu může v létě žít i padesát tisíc dělnic, ale jen jedna královna. Dělnice během svého krátkého života vystřídají několik prací: nejprve čistí buňky a krmí larvy, později staví plásty a hlídají česno a teprve na konci života vylétají sbírat nektar a pyl.</p><p>Když dělnice najde bohatý zdroj potravy, vrátí se do úlu a předvede ostatním takzvaný tanec. Podle jeho směru a délky dokážou ostatní včely určit, kterým směrem a jak daleko mají letět. Vědci tento způsob dorozumívání zkoumali desítky let a dodnes je považován za jeden z nejpozoruhodnějších v živočišné říši.</p>';
const T2='<p><b>Text 2</b></p><p>Milá Báro,</p><p>konečně ti píšu z tábora! První dva dny pršelo, takže jsme místo plánované výpravy na hrad hráli ve srubu deskové hry. Myslela jsem, že se budu nudit, ale nakonec to byla legrace – Tonda prohrál snad dvacetkrát a pořád chtěl odvetu.</p><p>Ve středu se konečně vyjasnilo a vyrazili jsme na hrad. Cesta vedla lesem a trvala skoro tři hodiny. Nahoře jsem byla tak unavená, že jsem si ani nevšimla nádherného výhledu, dokud mě vedoucí neupozornila. Zítra nás čeká noční hra, tak mi drž palce, ať se v lese neztratím.</p><p>Tvoje Klára</p>';
const T3='<p><b>Text 3</b></p><p><b>Oznámení pro žáky 9. tříd</b></p><p>Exkurze do technického muzea se uskuteční v pátek 14. března. Sraz je v 7:45 před hlavním vchodem školy, návrat plánujeme kolem 14:30. Vstupné 120 Kč vybírají třídní učitelé nejpozději do pondělí 10. března. Žáci, kteří mají průkaz ISIC, zaplatí pouze 80 Kč. S sebou si vezměte svačinu, pití a pohodlnou obuv. Exkurze je součástí výuky fyziky, proto je účast povinná.</p>';
const T4='<p><b>Text 4</b></p><p><i>Podzimní</i></p><p>Listí šustí pod nohama,<br>mlha leží nad lesem,<br>vítr zpívá písně sám a<br>já se domů neseném…</p>';
const T5='<p><b>Text 5</b></p><p>Ještě před sto lety se lidé dívali do noční oblohy a viděli tisíce hvězd. Dnes většina obyvatel měst spatří jen pár desítek nejjasnějších. Příčinou je světelné znečištění – umělé světlo z pouličních lamp, reklam a oken, které se rozptyluje v ovzduší a vytváří nad městy světelný opar.</p><p>Světelné znečištění neškodí jen astronomům. Ruší noční živočichy, například můry, které se k lampám slétají a vyčerpají se, a mate tažné ptáky. Ovlivňuje i lidi: příliš mnoho světla v noci může zhoršovat spánek. Přitom řešení bývá jednoduché – stačí svítit jen tam, kde je to potřeba, a lampy směrovat dolů, nikoli do nebe.</p>';
const T6='<p><b>Text 6</b></p><p>Dědeček seděl na lavičce před domem a díval se, jak Matěj už potřetí padá z kola. „Nech to být, dneska to nepůjde,“ zavolal na něj. Matěj se ale zvedl, oprášil si kolena a znovu nasedl. Tentokrát ujel pět metrů, pak deset. Když se konečně dostal až k vrátkům, otočil se s úsměvem od ucha k uchu.</p><p>„Vidíš, dědo, šlo to,“ řekl udýchaně. Dědeček se usmál a pomyslel si, že některé věci se člověk nenaučí od druhých, ale jen sám od sebe.</p>';
const tx=(p,q,o,a,e)=>mc(q,o,a,e,{p});
const txyn=(p,q,s,e)=>yn(q,s,e,{p});
const text=[
tx(T1,'Kolik královen žije podle textu v jednom včelstvu?',['jedna','dvě','několik desítek','padesát tisíc'],0,'V textu: „ale jen jedna královna“.'),
tx(T1,'Kterou práci vykonává dělnice podle textu až na konci života?',['sbírá nektar a pyl','krmí larvy','čistí buňky','staví plásty'],0,'„teprve na konci života vylétají sbírat nektar a pyl“.'),
tx(T1,'K čemu slouží včelí tanec?',['k předání informace o zdroji potravy','k zahřátí úlu','k výběru nové královny','k odehnání vetřelců'],0,'Tanec ukazuje směr a vzdálenost potravy.'),
tx(T1,'Které slovo má v textu nejbližší význam jako „pozoruhodný“?',['zajímavý','obyčejný','nebezpečný','složitý'],0,'Pozoruhodný = zajímavý, hodný pozornosti.'),
txyn(T1,'Rozhodněte o každém tvrzení, zda odpovídá textu 1.',[['V létě může ve včelstvu žít i 50 000 dělnic.',true],['Dělnice dělají celý život stejnou práci.',false],['Tanec určuje směr i vzdálenost zdroje potravy.',true],['Vědci zkoumali tanec jen jeden rok.',false]],'Dělnice práce střídají; vědci zkoumali tanec desítky let.'),
tx(T1,'Jakým slohovým postupem je text 1 převážně napsán?',['výkladovým (informačním)','vyprávěcím','úvahovým','dialogem'],0,'Text vysvětluje a podává informace – postup výkladový/informační.'),
tx(T2,'Jaký je text 2 slohový útvar?',['dopis','zpráva','inzerát','životopis'],0,'Oslovení, podpis, osobní sdělení → dopis.'),
tx(T2,'Proč děti první dva dny nešly na hrad?',['pršelo','byly unavené','Tonda onemocněl','hrad byl zavřený'],0,'„První dva dny pršelo“.'),
tx(T2,'Kdy podle textu děti vyrazily na hrad?',['ve středu','v pondělí','první den','zítra'],0,'„Ve středu se konečně vyjasnilo a vyrazili jsme na hrad.“'),
tx(T2,'Co znamená ve větě „drž palce“?',['přej mi úspěch','pevně se drž','pomoz mi','nehýbej se'],0,'Frazém držet palce = přát úspěch.'),
txyn(T2,'Rozhodněte o každém tvrzení, zda odpovídá textu 2.',[['Klára se při deskových hrách nudila.',false],['Cesta na hrad trvala skoro tři hodiny.',true],['Výhledu si Klára všimla hned sama.',false],['Děti čeká noční hra.',true]],'Klára si nakonec hry užila; výhledu si všimla až díky vedoucí.'),
tx(T2,'Kdo podle textu 2 mnohokrát prohrál?',['Tonda','Klára','Bára','vedoucí'],0,'„Tonda prohrál snad dvacetkrát“.'),
tx(T3,'Kolik zaplatí žák s průkazem ISIC?',['80 Kč','120 Kč','40 Kč','nic'],0,'„Žáci, kteří mají průkaz ISIC, zaplatí pouze 80 Kč.“'),
tx(T3,'Do kdy je třeba zaplatit vstupné?',['do pondělí 10. března','do pátku 14. března','v den exkurze','do 7:45'],0,'„nejpozději do pondělí 10. března“.'),
tx(T3,'Proč je účast na exkurzi povinná?',['je součástí výuky fyziky','je zdarma','je v pátek','ředitel to přikázal bez důvodu'],0,'„Exkurze je součástí výuky fyziky, proto je účast povinná.“'),
num('Jak dlouho podle plánu exkurze potrvá (od srazu do návratu)? Odpověď zapište v minutách.',405,'7:45 → 14:30 = 6 h 45 min = 405 min.',{p:T3}),
txyn(T3,'Rozhodněte o každém tvrzení, zda odpovídá textu 3.',[['Sraz je před hlavním vchodem školy.',true],['Vstupné vybírá ředitel školy.',false],['Svačinu si žáci musí koupit v muzeu.',false],['Exkurze je určena žákům 9. tříd.',true]],'Vstupné vybírají třídní učitelé; svačinu si žáci mají vzít s sebou.'),
tx(T3,'K jakému funkčnímu stylu patří text 3?',['administrativnímu','uměleckému','odbornému','řečnickému'],0,'Oznámení je útvar administrativního (věcného, úředního) stylu.'),
tx(T5,'Co je podle textu 5 hlavní příčinou toho, že ve městech vidíme méně hvězd?',['světelné znečištění','smog z aut','mraky','menší počet hvězd'],0,'„Příčinou je světelné znečištění“.'),
tx(T5,'Které řešení text 5 navrhuje?',['svítit jen tam, kde je třeba, a lampy směrovat dolů','zhasnout všechna světla ve městě','postavit více hvězdáren','přestěhovat se na venkov'],0,'Viz poslední věta textu.'),
txyn(T5,'Rozhodněte o každém tvrzení, zda odpovídá textu 5.',[['Světelné znečištění škodí i živočichům.',true],['Můry se lampám vyhýbají.',false],['Příliš mnoho světla v noci může zhoršovat spánek.',true],['Před sto lety lidé viděli méně hvězd než dnes.',false]],'Můry se k lampám slétají; dříve lidé viděli tisíce hvězd.'),
tx(T5,'Co v textu znamená slovo „opar“?',['slabá mlha, závoj','silný déšť','jasná obloha','oblak kouře z požáru'],0,'Opar = slabá mlha, závoj nad krajinou.'),
tx(T5,'Kterému tvrzení by autor textu 5 nejspíš souhlasil?',['Světlo v noci je třeba používat s rozmyslem.','Pouliční lampy by se měly úplně zakázat.','Hvězdy jsou důležité jen pro astronomy.','Světelné znečištění nelze nijak omezit.'],0,'Autor navrhuje rozumné svícení, ne zákaz.'),
tx(T5,'Kdo jsou podle textu „tažní ptáci“?',['ptáci, kteří na zimu odlétají','ptáci, kteří táhnou vozy','ptáci žijící jen ve městě','ptáci, kteří loví v noci'],0,'Tažní ptáci odlétají na zimu do teplých krajin.'),
tx(T6,'Jakou vlastnost Matěj v textu 6 nejvíce projevil?',['vytrvalost','lenost','pýchu','strach'],0,'Přes pády to zkoušel znovu – vytrvalost.'),
tx(T6,'Co znamená spojení „s úsměvem od ucha k uchu“?',['velmi šťastně, široce se usmívat','posměšně','nejistě','smutně'],0,'Frazém vyjadřuje velkou radost.'),
tx(T6,'Co si na konci textu 6 dědeček uvědomil?',['Některé věci se člověk naučí jen sám.','Matěj by měl s jízdou přestat.','Kolo je pro Matěje moc velké.','Měl Matějovi víc pomáhat.'],0,'Poslední věta textu.'),
txyn(T6,'Rozhodněte o každém tvrzení, zda odpovídá textu 6.',[['Matěj spadl z kola nejméně třikrát.',true],['Dědeček Matěje nejprve povzbuzoval, ať pokračuje.',false],['Matěj nakonec dojel až k vrátkům.',true],['Text je psán v ich-formě.',false]],'Dědeček Matějovi radil, ať toho nechá; text je ve er-formě (3. osoba).'),
tx(T6,'Jaký slohový útvar nejlépe odpovídá textu 6?',['vypravování','popis','úvaha','výklad'],0,'Text líčí děj v časové posloupnosti → vypravování.'),
tx(T6,'Ve kterém pádě je slovo „dědo“ ve větě „Vidíš, dědo, šlo to“?',['5. pád','1. pád','4. pád','2. pád'],0,'Oslovení → 5. pád.'),
tx(T4,'Jaký je rým v ukázce (text 4)?',['střídavý (ABAB)','sdružený (AABB)','obkročný (ABBA)','žádný'],0,'Nohama – sám a, lesem – nesem: 1. a 3., 2. a 4. verš → ABAB.'),
tx(T4,'Který básnický prostředek je ve verši „vítr zpívá písně“?',['personifikace','přirovnání','hyperbola','oxymóron'],0,'Vítr dostává lidskou vlastnost (zpívá) → personifikace.'),
tx(T4,'Do kterého literárního druhu patří ukázka (text 4)?',['lyrika','epika','drama','publicistika'],0,'Vyjadřuje pocity a nálady, nemá děj → lyrika.'),
];
// text 4: nahradíme nepřirozený verš jednoznačnou ukázkou
const T4b='<p><b>Text 4</b></p><p><i>Podzim</i></p><p>Listí šustí pod nohama,<br>mlha spí nad lesem,<br>vítr zpívá písně sám<br>a já jdu domů s podzimem.</p>';
text.splice(text.length-3,3,
 tx(T4b,'Který básnický prostředek je ve verši „vítr zpívá písně“?',['personifikace','přirovnání','hyperbola','zdrobnělina'],0,'Vítr dostává lidskou vlastnost (zpívá) → personifikace.'),
 tx(T4b,'Do kterého literárního druhu patří ukázka (text 4)?',['lyrika','epika','drama','publicistika'],0,'Vyjadřuje pocity a nálady, nemá děj → lyrika.'),
 tx(T4b,'Který další básnický prostředek najdeme ve verši „mlha spí nad lesem“?',['personifikace','přirovnání','nadsázka','rým obkročný'],0,'Mlha „spí“ – opět lidská vlastnost → personifikace.'),
 tx(T4b,'Kolik veršů má ukázka (text 4)?',['4','2','3','8'],0,'Báseň má jednu sloku o čtyřech verších.')
);

const lit=[
mc('Do kterého literárního druhu patří pohádka?',['epika','lyrika','drama','publicistika'],0,'Pohádka má děj a vypravěče → epika.'),
mc('Do kterého literárního druhu patří komedie?',['drama','epika','lyrika','věcná literatura'],0,'Komedie je divadelní hra → drama.'),
mc('Do kterého literárního druhu patří óda?',['lyrika','epika','drama','próza'],0,'Óda je oslavná báseň → lyrika.'),
mc('Jak se nazývá krátký epický útvar, v němž vystupují zvířata s lidskými vlastnostmi a který obsahuje ponaučení?',['bajka','pověst','balada','sonet'],0,'Bajka – zvířata, ponaučení.'),
mc('Jak se nazývá vyprávění o skutečném místě nebo osobě s prvky fantazie, šířené ústně?',['pověst','bajka','novela','fejeton'],0,'Pověst se váže ke skutečnému místu či osobě.'),
mc('Báseň o čtrnácti verších (dvě čtyřverší a dvě trojverší) se nazývá:',['sonet','óda','elegie','limerick'],0,'Sonet má 14 veršů: 4+4+3+3.'),
mc('Jak se nazývá epická báseň s pochmurným dějem a často tragickým koncem?',['balada','romance','píseň','epigram'],0,'Balada – ponurý děj, tragický konec.'),
mc('Divadelní hra s vážným dějem a tragickým koncem se nazývá:',['tragédie','komedie','fraška','muzikál'],0,'Tragédie končí tragicky.'),
mc('„Slunce se na nás usmívalo.“ – jaký básnický prostředek je použit?',['personifikace','přirovnání','metonymie','hyperbola'],0,'Neživá věc dostává lidskou vlastnost → personifikace.'),
mc('„Oči měla jako dvě hvězdy.“ – jaký básnický prostředek je použit?',['přirovnání','metafora','personifikace','epiteton'],0,'Spojka jako → přirovnání.'),
mc('„Čekám na tebe už sto let!“ – jaký básnický prostředek je použit?',['hyperbola (nadsázka)','přirovnání','personifikace','metonymie'],0,'Zveličení → hyperbola.'),
mc('„Večer jsem četl Čapka.“ – jaký básnický prostředek je použit?',['metonymie','metafora','personifikace','přirovnání'],0,'Přenesení pojmenování na základě souvislosti (autor místo jeho díla) → metonymie.'),
mc('Spojení „zlatý podzim“ je příkladem:',['básnického přívlastku (epiteta)','přirovnání','hyperboly','citoslovce'],0,'Ozdobný přívlastek → epiteton.'),
mc('Opakování stejného slova na začátku po sobě jdoucích veršů se nazývá:',['anafora','epifora','rým','refrén'],0,'Anafora = opakování na začátku veršů.'),
mc('Pravidelně se opakující verš nebo sloka v písni či básni se nazývá:',['refrén','rým','strofa','pointa'],0,'Refrén.'),
mc('Rýmové schéma AABB označujeme jako rým:',['sdružený','střídavý','obkročný','přerývaný'],0,'AABB = sdružený.'),
mc('Rýmové schéma ABAB označujeme jako rým:',['střídavý','sdružený','obkročný','postupný'],0,'ABAB = střídavý.'),
mc('Rýmové schéma ABBA označujeme jako rým:',['obkročný','střídavý','sdružený','volný'],0,'ABBA = obkročný.'),
mc('Kdo je autorem díla <i>Babička</i>?',['Božena Němcová','Karolína Světlá','Karel Jaromír Erben','Alois Jirásek'],0,'Babička – Božena Němcová (1855).'),
mc('Kdo je autorem básně <i>Máj</i>?',['Karel Hynek Mácha','Jan Neruda','Karel Havlíček Borovský','Vítězslav Hálek'],0,'Máj – Karel Hynek Mácha (1836).'),
mc('Kdo je autorem sbírky balad <i>Kytice</i>?',['Karel Jaromír Erben','Božena Němcová','Jaroslav Seifert','Josef Kajetán Tyl'],0,'Kytice z pověstí národních – K. J. Erben.'),
mc('Ve které divadelní hře se poprvé objevilo slovo „robot“?',['R.U.R. (Karel Čapek)','Bílá nemoc (Karel Čapek)','Lucerna (Alois Jirásek)','Strakonický dudák (J. K. Tyl)'],0,'R.U.R. Karla Čapka (1920); slovo vymyslel jeho bratr Josef.'),
mc('Kdo je autorem románu <i>Osudy dobrého vojáka Švejka za světové války</i>?',['Jaroslav Hašek','Karel Čapek','Bohumil Hrabal','Jan Werich'],0,'Jaroslav Hašek.'),
mc('Kdo napsal tragédii <i>Romeo a Julie</i>?',['William Shakespeare','Molière','Victor Hugo','Charles Dickens'],0,'William Shakespeare.'),
mc('Kdo je autorem knihy <i>Malý princ</i>?',['Antoine de Saint-Exupéry','Jules Verne','Hans Christian Andersen','Lewis Carroll'],0,'Antoine de Saint-Exupéry.'),
mc('Ke kterému funkčnímu stylu patří žádost, objednávka a úřední dopis?',['administrativnímu','uměleckému','publicistickému','prostěsdělovacímu'],0,'Úřední písemnosti → administrativní styl.'),
mc('Ke kterému funkčnímu stylu patří fejeton?',['publicistickému','odbornému','administrativnímu','řečnickému'],0,'Fejeton je publicistický útvar.'),
mc('Ke kterému funkčnímu stylu patří soukromý dopis kamarádce?',['prostěsdělovacímu','administrativnímu','odbornému','řečnickému'],0,'Běžná soukromá komunikace → prostěsdělovací styl.'),
mc('Slohový útvar, který zachycuje děj v časové posloupnosti, se nazývá:',['vypravování','popis','úvaha','výklad'],0,'Vypravování.'),
mc('Slohový útvar, který zachycuje vnější i vnitřní vlastnosti člověka, se nazývá:',['charakteristika','líčení','zpráva','výtah'],0,'Charakteristika.'),
mc('Popis, který vyjadřuje citový vztah a dojmy pisatele, se nazývá:',['líčení','popis pracovního postupu','zpráva','oznámení'],0,'Líčení = subjektivně zabarvený popis.'),
mc('Slohový útvar, v němž autor přemýšlí o problému a vyjadřuje vlastní názor, se nazývá:',['úvaha','zpráva','popis','inzerát'],0,'Úvaha.'),
mc('Stručný, věcný text o tom, co se stalo, kdy a kde, je:',['zpráva','líčení','báseň','charakteristika'],0,'Zpráva.'),
mc('Jak se nazývá vyprávění v první osobě?',['ich-forma','er-forma','dialog','monolog'],0,'Ich-forma = já.'),
mc('Rozhovor dvou nebo více postav se nazývá:',['dialog','monolog','prolog','epilog'],0,'Dialog.'),
mc('Hlavní myšlenka nebo hlavní sdělení díla se nazývá:',['téma (idea)','rým','kompozice','žánr'],0,'Téma, idea díla.'),
mc('Jak se nazývá nečekané vyvrcholení a zakončení krátkého příběhu nebo vtipu?',['pointa','prolog','expozice','refrén'],0,'Pointa.'),
mc('Kniha, v níž autor vypráví o svém vlastním životě, je:',['autobiografie','biografie','sci-fi','pověst'],0,'Auto- = sám o sobě.'),
yn('Rozhodněte o každém tvrzení, zda je pravdivé.',[['Báje vypráví o bozích a hrdinech.',true],['Drama je určeno především k předvádění na jevišti.',true],['Lyrika je založena hlavně na ději.',false],['Román je obvykle kratší než povídka.',false]],'Lyrika vyjadřuje pocity; román je rozsáhlejší než povídka.'),
yn('Rozhodněte o každé dvojici, zda autor napsal uvedené dílo.',[['Jan Neruda – Povídky malostranské',true],['Karel Čapek – Kytice',false],['Alois Jirásek – Staré pověsti české',true],['Božena Němcová – Máj',false]],'Kytice – Erben; Máj – Mácha.'),
];
const T7='<p><b>Text 7</b></p><p>Kompost je jednoduchý způsob, jak z odpadu vyrobit něco užitečného. Do kompostéru patří slupky od ovoce a zeleniny, posekaná tráva, listí nebo kávová sedlina. Naopak maso, kosti a zbytky vařených jídel tam nepatří, protože lákají potkany a nepříjemně zapáchají.</p><p>Aby kompost dobře zrál, potřebuje vzduch a vlhkost. Proto je dobré ho občas promíchat vidlemi a v suchém létě zalít. Po několika měsících se z odpadu stane tmavá, voňavá zemina, kterou můžeme použít na záhonech.</p>';
text.push(
 tx(T7,'Co podle textu 7 do kompostu NEpatří?',['kosti','listí','kávová sedlina','slupky od zeleniny'],0,'Maso, kosti a vařená jídla do kompostu nepatří.'),
 tx(T7,'Proč se kompost podle textu promíchává?',['aby k němu měl přístup vzduch','aby rychleji vychladl','aby odehnal potkany','aby méně vážil'],0,'Kompost potřebuje vzduch a vlhkost.'),
 tx(T7,'Jaký je hlavní účel textu 7?',['poradit, jak správně kompostovat','pobavit čtenáře příběhem','přesvědčit lidi, aby nejedli maso','popsat život potkanů'],0,'Text dává praktické rady.'),
 txyn(T7,'Rozhodněte o každém tvrzení, zda odpovídá textu 7.',[['Kompost se v suchém létě může zalít.',true],['Hotový kompost je světlý a bez vůně.',false],['Zbytky vařených jídel lákají potkany.',true],['Kompost je hotový za několik dní.',false]],'Hotová zemina je tmavá a voňavá; zraje několik měsíců.'),
 tx(T7,'Které slovo z textu 7 je přídavné jméno?',['voňavá','zemina','promíchat','proto'],0,'Voňavá (jaká?) → přídavné jméno.'),
 tx(T7,'Co znamená v textu slovo „zrál“?',['postupně se měnil v hotový kompost','stárl a kazil se','rostl do výšky','vysychal'],0,'Zrát = postupně dozrávat, měnit se v hotový produkt.')
);
skladba.push(
 vc('Celý den <b>pilně</b> pracoval.','příslovečné určení','Jak pracoval? → příslovečné určení způsobu.'),
 vv('Vrátil se tam, <b>odkud vyšel</b>.','příslovečná místní','Odkud? → místní.'),
 pm('Nejen že zpívala, ale i tančila.','slučovací','Nejen – ale i (stupňovací varianta slučovacího poměru) → slučovací.')
);
topic('cj','pravopis','Pravopis','✍️',pravopis);
topic('cj','tvaroslovi','Tvarosloví','🔤',tvaroslovi);
topic('cj','skladba','Skladba','🧩',skladba);
topic('cj','zasoba','Slovní zásoba a význam','📚',zasoba);
topic('cj','text','Porozumění textu','🔎',text);
topic('cj','lit','Literatura a sloh','🎭',lit);
})(typeof window!=='undefined'?window:globalThis);
