# Velappky - design system

Funkční implementace všeho níže je v `reference/velappky.css`. Tento dokument vysvětluje **proč a kdy**. Při rozporu platí `velappky.css`.

## 1. Princip

Vzhled Apple (iPadOS, apple.com): šedé pozadí, bílé plochy, systémové písmo, jemné stíny, velké zaoblení, jedna akcentní barva. Velí charakter dodávají jen tři prvky: **vlnka**, **čmáranice** a **oblačný okraj** - vše v jednom světle modrém odstínu. Nic dalšího se nepřidává.

Zakázáno: gradienty, emoji, rámečky kolem karet, barevné levé okraje karet, více než jedna akcentní barva v rozhraní, jiné písmo než systémové, „válečková“ tlačítka (pill) pro akce.

## 2. Barvy

| Token | Hodnota | Použití |
|---|---|---|
| `--bg` | #F5F5F7 | pozadí stránky |
| `--surface` | #FFFFFF | lišta, záhlaví, karty, patička |
| `--stage` | #E8E8ED | podklad pod náhledem listu |
| `--text` | #1D1D1F | hlavní text |
| `--text-2` | #6E6E73 | popisky, podtituly, patička |
| `--text-3` | #8E8E93 | lupa, placeholdery |
| `--fill` | rgba(118,118,128,.12) | pozadí polí, hledání, segmentů |
| `--accent` | #0372B6 | Velí modrá: odkazy, primární tlačítko, zapnutý přepínač |
| `--accent-soft` | rgba(3,114,182,.10) | sekundární tlačítka |
| `--doodle` | #9CC6E6 | vlnky a čmáranice - **všechny stejně** |

### Tóny témat

Každá složka a appka má jeden tón: pastelovou plochu (`--tone-bg`) a sytou kresbu (`--tone-fg`). Třída `tone-<název>`.

| Tón | Plocha | Kresba | Téma |
|---|---|---|---|
| pink | #FCE4EA | #C8174A | Čeština |
| wine | #F6E3E7 | #8C1F3C | (Osmisměrka) |
| blue | #DCEBF8 | #0372B6 | Matematika |
| navy | #E3EAF6 | #15438A | Přijímačky |
| teal | #DDF3EE | #1A7A67 | Logika |
| purple | #EFE4F5 | #7A2982 | Zábava |
| green | #E2F2E5 | #1E7A32 | Přírodověda |
| orange | #FCEBDD | #B4530F | rezerva |
| yellow | #FBF1CC | #8A6A00 | rezerva |

Tóny vycházejí z barev menu na skolavela.cz, jen v pastelové verzi. Appka zpravidla dědí tón své složky.

## 3. Písmo

Systémové: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, …` Na Apple zařízeních SF Pro, jinde nativní ekvivalent. Žádné webové fonty.

| Prvek | Desktop | Tablet | Mobil |
|---|---|---|---|
| Nadpis úvodu (Velappky) | 64 / 700 | 52 | 40 |
| Nadpis složky (kompaktní) | 44 / 700 | 40 | 30 |
| Podtitul úvodu | 21 | 21 | 17 |
| Název pod ikonou | 16 / 600 | 16 | 14 |
| Podtitul pod ikonou | 13 | 13 | 12 |
| Tělo | 17 | 17 | 17 |
| Popisky ovládání | 13 / 600, šedé | | |

Velikost písma ve **všech inputech min. 16 px** - jinak iOS při psaní zoomuje stránku.

## 4. Rozměry a rohy

- Max. šířka: lišta a patička 1080 px (v appkách 1280 px, `body.is-app`), mřížka ikon 960 px.
- Boční okraj: 24 px (mobil 16 px).
- Rohy: ikona 22 px (mobil 16 px), karta 20 px, tlačítko 12 px, input 10 px, segment 9 px.
- Dotykové cíle min. 44 × 44 px.

## 5. Komponenty

### Horní lišta
Bílá s průhledností a rozmazáním (`backdrop-filter`), přilepená nahoře, výška 56 px.
- **Rozcestník:** vlevo logo Vely, vpravo hledání. Nic jiného.
- **Appka:** vlevo „‹ Název složky“ (zpět do složky), ikona appky 32 px, název appky, šedý podtitul; vpravo malé logo. Na mobilu zmizí text u šipky zpět, podtitul i logo.

### Hledání
Šedé zaoblené pole s lupou, v liště vpravo, 220 px; při kliknutí se roztáhne na 300 px. Na mobilu vyplní volné místo v liště. Prohledává název, podtitul, klíčová slova, stupeň („2. stupeň“) a názvy složek; diakritika nevadí. Výsledky se zobrazí jako plochý seznam ikon, pod každou cesta (např. „Čeština › Čtení“). Klávesa `/` skočí do hledání, `Esc` ho vymaže.

### Záhlaví (hero)
- **Úvod:** nadpis „Velappky“, vlnka, podtitul „Nástroje k objevování světa“, vlevo a vpravo čmáranice, dole oblačný okraj.
- **Kompaktní** (ve složce a ve výsledcích hledání): drobečková navigace nahoře uprostřed, název složky místo „Velappky“, menší vlnka, počet aplikací. Bez čmáranic. Výrazně nižší, aby obsah začínal hned.

### Ikony v mřížce
- Čtverec 96 px (mobil 72 px), pastelová plocha tónu, kresba v syté barvě tónu, jemný stín.
- **Složka** má nad ikonou „jazýček“ (průhledný pruh v barvě tónu) - tím se odliší od appky.
- Pod ikonou název (tučně) a jeden řádek šedě: u složky počet aplikací, u appky krátký podtitul.
- Mřížka: `repeat(auto-fill, minmax(140px, 1fr))`, na mobilu `minmax(96px, 1fr)` - tj. 3 sloupce na telefonu, 5 na iPadu na výšku, 6-7 na desktopu.

### Složky
- Hlavní stránka obsahuje **jen složky** témat.
- Uvnitř složky jsou appky a případně podsložky. **Max. 2 úrovně** (téma › podtéma).
- Adresa složky je v URL: `#/cestina`, `#/cestina/cteni` → funguje tlačítko Zpět v prohlížeči i sdílení odkazu.
- Prázdná složka: „Tady zatím nic není“ + odkaz na formulář připomínek.

### Patička
Oblačný okraj, bílý pruh, vlevo „© Základní škola Vela s.r.o.“ (odkaz na skolavela.cz), vpravo „Napsat připomínku“ (https://tally.so/r/Qo1aeY). Na mobilu obojí vystředěné. Stejná v rozcestníku i ve všech appkách. Žádné jiné odkazy se nikde neopakují.

### Ovládací prvky v appkách
| Prvek | Třída | Pravidlo |
|---|---|---|
| Popisek | `.c-label` | 13 px, tučné, šedé, nad prvkem |
| Segmentový přepínač | `.c-seg` | volba z 2-5 možností (obtížnost, velikost) |
| Posuvník | `.c-range` | spojitá hodnota, hodnota vpravo od popisku |
| Textové pole | `.c-input` | šedé, bez rámečku |
| Přepínač | `.c-switch` | zapnout/vypnout (řešení, nápověda) |
| Primární tlačítko | `.c-btn--primary` | **jen jedno na obrazovce** - hlavní akce (Nové bludiště) |
| Sekundární tlačítka | `.c-btn--secondary` | PDF, Tisk, další akce |
| Oddělovač | `.c-sep` | mezi nastavením a výstupem |
| Poznámka | `.c-meta` | drobný šedý text dole v panelu |

## 6. Rozvržení appek

**Typ A - generátor k tisku** (Bludiště, Osmisměrka, Tučné slabiky, tisk Sudoku): panel nastavení vlevo (320 px) + šedá „scéna“ s bílým listem A4 vpravo. List má záhlaví (Start), obsah a patičku (číslo zadání, vlnka, velappky.cz). Vzor: `reference/bludiste.html`.

**Typ B - interaktivní** (Poznáváme přírodu, Přijímačky, hraní Sudoku): jeden sloupec max. 760 px: lišta nástrojů (`.a-toolbar`, např. segment s režimem), průběh (`.a-progress`), bílá karta s otázkou (`.a-card`), odpovědi jako velká tlačítka (`.a-choice`, 2 sloupce, na mobilu 1). Správně = zelený tón, špatně = růžový tón.

## 7. Responzivita

| | Mobil < 600 px | Tablet 600-1023 px | Desktop ≥ 1024 px |
|---|---|---|---|
| Okraj | 16 px | 24 px | 24 px |
| Hledání | vyplní lištu | 220 → 300 px | 220 → 300 px |
| Čmáranice | skryté | menší | plné |
| Ikony | 72 px, 3 sloupce | 96 px | 96 px |
| Appka typ A | list nahoře, panel pod ním | pod 900 px jako mobil | panel vlevo, list vpravo |
| Appka typ B | odpovědi pod sebou | 2 sloupce | 2 sloupce |

Testuje se na šířkách 375, 390, 768, 820, 1024, 1180, 1440 px. Na žádné šířce nesmí vzniknout vodorovné posouvání.

## 8. Tisk

- Tiskne se **jen list**. Lišta, panel, patička se skryjí (`@media print` ve `velappky.css`).
- Výchozí A4 na šířku. Appka na výšku přidá `<style>@page { size: A4 portrait; }</style>`, na `<body>` třídu `print-portrait` a na list `a-sheet--portrait`.
- Obsah listu musí být vektorový (SVG nebo HTML), aby byl tisk ostrý.
- Jeden list = jedna strana. Ověř náhledem tisku v Safari i Chrome.

## 9. Ikony

Sada je v `reference/icons.js`. Pravidla pro nové ikony:

1. `viewBox="0 0 48 48"`, motiv ~38 × 38 uprostřed.
2. **Plné tvary**, žádné tenké obrysy. Čáry nejméně 2,4 jednotky.
3. Barva vždy `currentColor` (převezme tón). Druhý tón = `currentColor` s `opacity="0.55"`. Detaily bíle. Max. tři úrovně.
4. **Složka = motiv tématu** (kniha, strom, kostky), **appka = motiv činnosti** (bludiště, stopky, mřížka sudoku).
5. Text v ikoně jen výjimečně (Aa, čísla) a systémovým písmem.
6. Nová položka bez ikony dostane náhradní `slozka` nebo `appka`.

## 10. Přístupnost

- Kontrast textu min. 4,5 : 1 (šedá #6E6E73 na bílé i na #F5F5F7 projde).
- Vše ovladatelné klávesnicí, viditelný focus (modrý obrys).
- Skutečné `<a>`, `<button>`, `<input>` + `<label>`, žádné klikací `div`.
- Ikony jsou dekorace (`aria-hidden`), význam nese text pod nimi.
- `prefers-reduced-motion` vypne animace.
