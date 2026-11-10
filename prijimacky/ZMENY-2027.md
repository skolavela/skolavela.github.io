# Změny podle specifikací CERMAT 2026/2027

Přijímačky 2027 (9. ročník, čtyřleté obory). CERMAT z požadavků vypustil některou látku. Prošel jsem všechny sloty v `ex-ma.js`, `ex-cj.js`, nápovědy `PQ.HINTS` v `topics.js` a texty v `app.js` a `index.html`.

## Matematika (`ex-ma.js`)

| Slot | Co tam bylo | Co je teď |
|---|---|---|
| **ma3** – rozklad (`form:'prod'`) | 3 varianty: `a² − b² = (a − b)(a + b)`, `(a + b)² = a² + 2ab + b²`, vytýkání | Jen vytýkání, 3 varianty: číslo (`6x + 9 = 3(2x + 3)`), mocnina proměnné (`4x³ + 3x² = x²(4x + 3)`), číslo i proměnná (`3x² − 12x = 3x(x − 4)`). Zadání: „Rozložte na součin vytknutím před závorku“. Kontrola `PQ.isProduct` zůstává. |
| **ma3** – dosazení | Vysvětlení radilo výraz poznat jako `(kx − m)²` (vzorec) | Vysvětlení počítá přímým dosazením (mocnina → násobení → sčítání). |
| **ma3** – úprava výrazu | `(x + a)² − (x − b)(x + b)` a `2x(x − a) − (x − b)²` | Beze změny. Je to umocňování dvojčlenu a roznásobení, ne rozklad. Zadání to dovoluje. |
| **ma4** – soustava rovnic | „Dosazovací nebo sčítací metodou“, postup „Vyjádři jednu neznámou… nebo… sečti“ | „Metodu si zvol sám – můžeš třeba… nebo…, případně jinak.“ Postup: „Zvol si libovolný postup (jednou z možností je dosazení, jinou sečtení rovnic)…“ |
| **ma8** – úhly | Varianta „AB je průměr kružnice, C na kružnici“, řešení stálo na Thaletově větě (pravý úhel u C) | **Odstraněna.** Nahrazena variantou s rovnoběžkami p ∥ q a dvěma příčkami (střídavé úhly, přímý úhel). Varianta s osou úhlu v trojúhelníku zůstává. |
| **ma9** – konstrukce | Varianta „pravoúhlý trojúhelník s přeponou AB a výškou“ (Thaletova kružnice); distraktor „Thaletově kružnici nad průměrem AB“; náčrt s Thaletovou kružnicí | **Odstraněna.** Nově 2 varianty: (1) body X stejně vzdálené od A i B a ve vzdálenosti r od A = **osa úsečky ∩ kružnice** (0/1/2 řešení), (2) pravoúhlý trojúhelník s pravým úhlem při A, dané \|AB\| a \|BC\| = **kolmice v bodě A ∩ kružnice se středem B** (0/1 řešení). Distraktor s Thaletovou kružnicí nahrazen kolmicí. Zbylé varianty (rovnoběžka ∩ kružnice, přímka ∩ kružnice) zůstávají. Teď jsou 4 typy místo 3. |
| ma14, ma15, maNet | Jen kvádr, krychle a trojboký hranol | Beze změny. Válec ani koule se tam nevyskytují. |
| ma1, ma2 | Zlomky a desetinná čísla | Beze změny. Odmocňování zlomku ani součinu se v úlohách nevyskytuje. NSN a NSD pro tři čísla tam taky nejsou. Společný jmenovatel se hledá vždy pro dva zlomky. |
| maPyth, ma13 | Odmocnina u Pythagorovy věty | Beze změny. Jde o odmocninu čísla, ne o pravidla pro odmocňování zlomku nebo součinu. |
| tečna, kružnice opsaná | Nikde | Beze změny. Ve vysvětleních zůstává obrat „kružnice se přímky dotkne – 1 řešení“, bez termínu tečna. |

## Nápovědy (`topics.js`, `PQ.HINTS`)

- **ma3**: odstraněny vzorce `(a ± b)² = a² ± 2ab + b²` a `a² − b² = (a − b)(a + b)`. Nově: „Rozklad: najdi, co mají všechny členy společné (číslo i proměnnou), a vytkni to před závorku. Zkouška: roznásob zpět. U úpravy nejdřív roznásob závorky, pak sečti podobné členy.“
- **ma4**: místo „vyjádři jednu neznámou nebo rovnice sečti“ teď stojí „U soustavy si postup zvol sám – můžeš třeba dosadit, nebo rovnice sečíst. Na konci udělej zkoušku.“
- **ma8**: místo „Hledej rovnoramenné trojúhelníky (poloměry, osy)“ (navazovalo na kružnici) teď stojí „Osa úhlu ho půlí. U rovnoběžek hledej střídavé a souhlasné úhly – mají stejnou velikost.“

## Čeština (`ex-cj.js`)

- Termín „přívlastek neshodný“ se nikde nevyskytoval, ani v úlohách, ani ve vysvětleních. Zůstává jen „vedlejší věta přívlastková“, ta ve specifikaci je.
- `cj25`: věta „Dědeček mi vyprávěl o válce.“ (tvar od *válka*) nahrazena větou „Dědeček mi vyprávěl o svém mládí.“. Kontrola zakázaných výrazů by ji jinak hlásila jako nález „válc“. Význam úlohy se nemění, věta je spisovná jako předtím.

## Rozhraní

- `index.html`: do patičky panelu `.c-meta` přidán text „Látka podle specifikací CERMAT pro rok 2026/2027.“

## Kontrola

Kontrolu dělá `test.html` (jen pro vývoj). Každý slot vygeneruje 300× a v textu hledá výrazy `Thalet`, `tečn`, `opsan`, `válc`, `válec`, `koul`, `přívlastek neshodný` a v ma3 obecné vzorce rozkladu.

## Část 2 – víc původních textů v češtině (`ex-cj-new.js`)

Banky mají stabilní id. Původní položky mají `rev:1`, nové `rev:0`, ty čekají na kontrolu učitelem. Přehled všech nových položek s otázkami, správnými odpověďmi a zdůvodněním je v `KONTROLA-CJ.md`. Soubor se generuje příkazem `node kontrola-gen.js`.

- Výchozí texty: cjP +7 vlastních básní (u každé je autor: „původní text pro Nanečisto“), cjA +7, cjR +7, cjS +7 (každá banka má teď 10 textů).
- Krátké úlohy: cj6 +6, cj7 +14, cj15 +7, cj18 +10, cj25 +7, cj30 +6.
- Úlohy ANO/NE mají různé poměry 2:2, 1:3 a 0:4.
- Aplikace přednostně vybírá položky, které žák ještě neviděl, potom ty nejstarší. Viděné položky se ukládají do `st.seen` v klíči `prijimacky:v1`.
- cj6/cj30: pořadí možností A–E/A–F se nově míchá.

## Část 3 – výsledky testu

- Ve výsledku testu přibyly tři věci: počet nevyplněných úloh a body za ně, body podle témat seřazené podle ztráty a jeden tip podle priority (nevyplněné, pak zlomky, pak tvar výrazu, pak ANO/NE).
- Statistiky po typech úloh: v `st.ss[slot]` a v historii testu `sl:{slot:[body,max,počet]}`.
- Nové tlačítko „Procvičit, co mi nejde“ (ve výsledku testu a nahoře v seznamu témat při procvičování). Vybere 2–3 typy úloh s nejnižší úspěšností za posledních 5 testů (aspoň 2 pokusy). Když takové typy nejsou, vezme typy, kde se v posledním testu ztratily body.

## Část 4 – nové typy úloh v češtině (`ex-cj-p4.js`, každý 15 variant, `rev:0`)

| Slot | Úloha | Body | Hodnocení |
|---|---|---|---|
| cjPrib | Slova příbuzná (2 podúlohy) | 2 × 1 | seznam uznávaných odpovědí + sebehodnocení podle podmínek |
| cjTvar | Tvary sloves v textu (2 mezery) | 2 × 1 | přesně, s diakritikou |
| cjVyp | Výpis slova z věty v základním tvaru (2 podúlohy) | 2 × 1 | `diac:false` |
| cjSlova | Vypiš všechna slova daného druhu (nový typ `words`) | 3 | −1 za každé chybějící i navíc, `diac:false` |
| cjFraz | Ustálená spojení | 1 | přesně |
| cjUprava | Úprava vět (spojení vět, číslo, čas, nepřímá řeč) | 2 × 1 | seznam + sebehodnocení |

- Sebehodnocení „Splňuje tvoje odpověď všechny podmínky?“: v procvičování se po zaškrtnutí všech podmínek body připočtou. V testu se sebehodnocení ukáže jen ve výsledcích a body nemění.
- V plánu testu jsou nové typy ve skupinách se stejným bodovým rozsahem, ze skupiny se losuje jeden typ. Celý test má dál 30 úloh / 50 b / 60 min, krátký 14 úloh / 24 b.
  - celý: `[cj5|cjVyp]`, `[cj7|cjTvar|cjPrib]`, `[cj14|cjUprava]`, `[cj16|cjFraz]`, `[cj25|cjSlova]`
  - krátký: `[cj5|cjVyp|cjUprava]`
- Témata: nové téma „Slovní zásoba a tvoření slov“ (cjPrib, cjFraz). cjTvar a cjSlova jsou v tématu Tvarosloví, cjVyp a cjUprava ve Skladbě.

## test.html

Otevři `/prijimacky/test.html`. Stránka každý slot vygeneruje 300× a zkontroluje tři věci: že správná odpověď dává plné body, že špatná je nedává, a u `diac:false` a `words` i strhávání bodů. Hledá zakázané výrazy a slova, která je obsahují jen náhodou (skutečný, zbytečný, statečný, popsaný…), vypíše jako falešné nálezy. Dál kontroluje id a rev v bankách a poměry ANO/NE. Testy sestaví 100×: ČJ 30/50 a 14/24, MA 16/50 a 8/27.
