// Okruhy pro procvičování – každý okruh čerpá z úloh ve stylu CERMAT (stejné formáty i bodování jako v testu)
(function(G){
const PQ=G.PQ;PQ.topics=[];
const T=(subj,id,name,icon,slots)=>PQ.topics.push({subj,id,name,icon,slots,items:[],gens:[]});
T('cj','pravopis','Pravopis','pen',['cj1','cj18','cj24']);
T('cj','tvaroslovi','Tvarosloví a spisovnost','type',['cj7','cj16','cj25','cjTvar','cjSlova']);
T('cj','skladba','Skladba a interpunkce','puzzle',['cj5','cj14','cj6','cjVyp','cjUprava']);
T('cj','zasoba','Slovní zásoba a tvoření slov','book',['cjPrib','cjFraz']);
T('cj','text','Práce s textem','doc',['cjA','cjR','cjS','cj17']);
T('cj','razeni','Řazení textu','shuffle',['cj15']);
T('cj','lit','Literatura a poezie','feather',['cjP','cj30']);
T('ma','cisla','Čísla, zlomky, číselná osa','hash',['ma1','ma2','maLine']);
T('ma','vyrazy','Výrazy a mnohočleny','calc',['ma3']);
T('ma','rovnice','Rovnice a soustavy','scale',['ma4']);
T('ma','slovni','Slovní úlohy a procenta','chat',['ma5','ma6','ma7','ma12']);
T('ma','rovina','Geometrie v rovině','ruler',['ma8','ma9','ma10','ma13','maPyth']);
T('ma','prostor','Tělesa','cube',['ma14','ma15','maNet']);
T('ma','data','Grafy, tabulky a vzory','chart',['ma11','maBar','ma16']);
// podíl úloh s obrázkem/grafem/diagramem v reálných testech MA (2025 A, 2025 B, 2026 A): 22 ze 48 úloh ≈ 46 %
PQ.FIGSHARE=0.46;
PQ.isFig=t=>/<svg/.test((t.src&&t.src.h||'')+t.subs.map(s=>s.q+(s.o||[]).join('')).join(''));
PQ.HINTS={
 cj1:'Projdi každou větu zvlášť: shoda podmětu s přísudkem, vyjmenovaná slova, velká písmena.',
 cj18:'Čti pomalu slovo po slově. Hledej typické chyby: shoda přísudku, i/y po obojetných, s-/z-, mě/mně, velká písmena.',
 cj24:'U přejatých slov si vybav jejich obvyklý zápis (fyzika, systém…). Hledej tu jednu chybu v každé trojici.',
 cj7:'Zeptej se pádovou otázkou (o kom? s kým? před čím?) a podle ní urči tvar.',
 cj16:'Dosaď každou možnost do věty a zeptej se pádovou otázkou. Pozor na hovorové tvary.',
 cj25:'Přečti každou větu nahlas. Nespisovné bývají koncovky -ej, -im, -aj, zkrácené samohlásky.',
 cjTvar:'Urči, kdo děj koná (rod a číslo podmětu), a podle toho vyber koncovku. U rozkazovacího způsobu si větu řekni nahlas.',
 cjSlova:'Projdi text slovo po slově a u každého se zeptej, jaký je to slovní druh. Vypiš všechna, ne víc – za chybějící i navíc se strhává bod.',
 cjVyp:'Najdi ve větě požadované slovo a převeď ho do základního tvaru, na který se zadání ptá.',
 cjUprava:'Po přepsání si větu přečti celou. Zkontroluj spojku, čárku a jestli se nezměnil význam.',
 cjPrib:'Najdi kořen slova a přidej k němu předponu nebo příponu tak, aby vznikl požadovaný slovní druh.',
 cjFraz:'Ustálená spojení mají pevnou podobu. Vybav si celé spojení, jak ho znáš z běžné řeči.',
 cj5:'Nejdřív najdi sloveso v určitém tvaru (přísudek), pak se zeptej „kdo/co“ dělá – to je podmět.',
 cj14:'Spočítej slovesa = počet vět. Vedlejší věty oddělujeme čárkou, vložené z obou stran.',
 cj6:'U každé věty se zeptej, na co vedlejší věta odpovídá, nebo jak se slovo chová ve větě.',
 cjA:'Odpovídej jen podle textu, ne podle toho, co víš. Hledej slova jako „odhad, možná, zatím“.',
 cjR:'Vracej se do textu. U „neodpovídá“ hledej tvrzení, které textu odporuje.',
 cjS:'U pádu se zeptej pádovou otázkou ve větě, odkud slovo pochází.',
 cj17:'Všimni si, k čemu text slouží: informuje, nabízí, žádá, nebo přemýšlí?',
 cj15:'Najdi první část (uvádí téma) a pak sleduj odkazy: zájmena, „pak, teprve, nakonec“.',
 cjP:'Čti báseň dvakrát. U rýmu si napiš konce veršů a označ je písmeny A, B…',
 cj30:'Nejdřív přiřaď jisté dvojice, zbytek vyluč. Dvě možnosti zbudou.',
 ma1:'Sčítání/odčítání: společný jmenovatel. Dělení: násob převráceným zlomkem. Na konci zkrať.',
 ma2:'Přednost: násobení a dělení před sčítáním. U složeného zlomku zvlášť čitatel a jmenovatel.',
 ma3:'Rozklad: najdi, co mají všechny členy společné (číslo i proměnnou), a vytkni to před závorku. Zkouška: roznásob zpět. U úpravy nejdřív roznásob závorky, pak sečti podobné členy.',
 ma4:'Roznásob závorky, převeď neznámé na jednu stranu. U soustavy si postup zvol sám – můžeš třeba dosadit, nebo rovnice sečíst. Na konci udělej zkoušku.',
 ma5:'Vyjádři, kolik dílů nebo procent odpovídá známé hodnotě. Pozor: základ se změnil!',
 ma6:'Zbytek je vždy část z toho, co zbylo – ne z celku. Rozkresli si to jako úsečku.',
 ma7:'Dráha = rychlost · čas. Minuty převeď na hodiny (: 60).',
 ma12:'Procenta se nesčítají přes různé základy. Spočítej kusy nebo koruny, pak procenta.',
 ma8:'Součet úhlů v trojúhelníku je 180°. Osa úhlu ho půlí. U rovnoběžek hledej střídavé a souhlasné úhly – mají stejnou velikost.',
 ma9:'Každá podmínka = jedna množina bodů (přímka, kružnice). Řešení jsou jejich průsečíky.',
 ma10:'Posun mezi dvěma vrcholy je stejný jako posun mezi protějšími vrcholy.',
 ma13:'Výška rozdělí rovnoramenný trojúhelník na dva pravoúhlé – použij Pythagorovu větu.',
 maPyth:'Přepona je nejdelší strana naproti pravému úhlu: c² = a² + b².',
 ma14:'Nakresli si, které stěny přibudou nebo zmizí. Povrch = součet obsahů všech stěn.',
 ma15:'Převody: 1 dm³ = 1 l. Objem hranolu = obsah podstavy · výška.',
 maNet:'Síť se skládá ze tří dvojic shodných stěn. Uvnitř tělesa jsou krychličky bez barvy.',
 ma11:'Převeď procenta na počty: 1 % = celek : 100.',
 maBar:'Průměr = součet : počet. Procentní změnu počítej vždy z výchozí hodnoty.',
 ma16:'Vypiš první obrazce/sekundy do tabulky a hledej pravidlo.',
 maLine:'Spočítej, na kolik dílů je rozdělena jednotka – jeden dílek je 1/n.'};
})(typeof window!=='undefined'?window:globalThis);
