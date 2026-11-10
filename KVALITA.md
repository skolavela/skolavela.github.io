# Velappky - pravidla kvality

Tento soubor patří do kořene repozitáře. Při každé změně appky ho čti spolu s `DESIGN.md`. Při rozporu s `DESIGN.md` platí `DESIGN.md` pro vzhled a tento soubor pro obsah a chování.

## 1. Filtr - appka musí projít všemi body

1. **Kdo a kdy:** je jmenovitý učitel nebo třída a konkrétní hodina, kde se appka použije.
2. **Nejde to líp jinde:** neexistuje lepší hotová věc zdarma. Pokud existuje, stačí odkaz.
3. **Obsah ověřil člověk:** u každého seznamu slov, textu, úlohy a fotky je jasné, kdo ho zkontroloval.
4. **10 vteřin:** po otevření je bez nastavování vidět použitelný výsledek nebo jde hned začít.
5. **Dítě objevuje nebo tvoří:** ne jen kliká naslepo.
6. **Rok bez údržby:** žádné účty, server, cizí API ani placené služby.
7. **Měří se a vyřazuje:** používání se počítá v GoatCounteru. Appka, kterou za pololetí skoro nikdo neotevřel, se z rozcestníku schová.

## 2. Obsah

- **Nevymýšlej fakta.** Žádné názvy druhů, data, čísla, slovní seznamy ani úlohy, které nemáš ze zadání nebo z ověřeného zdroje.
- Když appka potřebuje nový obsah, navrhni ho do samostatného souboru a každou položku označ `// NEOVĚŘENO`. Do appky ho zapoj až po kontrole člověkem.
- Ke každému obsahovému souboru existuje kontrolní export v `_kontrola/` (jedna položka na řádek, TSV), aby ho učitel mohl projít v tabulce.
- Ukázkové a výchozí texty jsou takové, jaké by opravdu četlo dítě. Testovací věty pro vývoj do rozhraní nepatří.

## 3. Rozhraní

- Výchozí stav je použitelný: appka po otevření něco užitečného ukazuje, nebo má na očích jedno tlačítko Začít.
- Na obrazovce je nejvýš **3 volby** nastavení. Další patří pod „Možnosti“ (sbalené, se shrnutím aktuální volby).
- Jedno primární tlačítko na obrazovce.
- Tisk má všude stejné jedno tlačítko „Vytisknout / uložit PDF“.
- Žádný programátorský žargon v rozhraní ani na tištěném listu (seed, ID, debug, null, NaN).
- Žádná angličtina (Submit, Reset, Loading, OK…).
- Žádné emoji, konfety, body, odznaky, série ani motivační hlášky („Skvělá práce!“). Zpětná vazba je věcná: správně nebo špatně a proč.
- Žádné rozpracované funkce a tlačítka, která nic nedělají.

## 4. Na konci každé změny vypiš

1. Seznam změněných souborů.
2. Co přesně se změnilo, bod po bodu.
3. Co jsi **nezměnil**, i když by to stálo za to (návrhy, ne zásahy).
4. Všechny položky obsahu, u kterých si nejsi jistý správností.
