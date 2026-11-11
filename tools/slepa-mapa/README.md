# Slepá mapa - sestavení mapových dat

Skript `build.mjs` vyrobí `slepa-mapa/slepa-mapa.data.js` ze zdrojových dat. Souřadnice se nikdy nekreslí
ani neupravují ručně. Ručně je jen seznam jmen (podle zadání) a tvary 4. pádu (`AKUZATIV`, označeno KE KONTROLE).

## Zdroje (stáhnout do `source/`, složka je v .gitignore)

1. **ČÚZK Data200** (CC BY 4.0), verze 2022-01-31. Přehled: ATOM `https://atom.cuzk.gov.cz/Data200/Data200.xml`.
   Potřebné balíčky: `BND.zip` (kraje, stát), `HYDRO.zip` (řeky), `POP.zip` (sídla), `NAME.zip` (geomorfologické jednotky).
   Server bez prohlížečové hlavičky přesměrovává v kruhu na podmínky užití, proto User-Agent a Referer:

   ```sh
   cd source
   UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
   for f in BND HYDRO POP NAME; do
     curl -sL -A "$UA" -e https://geoportal.cuzk.gov.cz/ -o $f.zip https://geoportal.cuzk.gov.cz/opendata/Data200/$f.zip
     unzip -oq $f.zip -d $f
   done
   ```

   Po rozbalení musí existovat `BND/PolbndRegDA.shp`, `BND/PolbndDA.shp`, `HYDRO/WatrcrsL.shp`, `POP/BuiltupP.shp`,
   `NAME/GName5A.shp`, `NAME/GName6A.shp`, `NAME/GName7A.shp` (pokud ZIP obsahuje podsložku, přesuň soubory o úroveň výš).

2. **Natural Earth** 1:10m Admin 0 Countries (public domain) - jen sousední státy jako podklad:

   ```sh
   curl -sL -o ne_10m_admin_0_countries.zip https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_0_countries.zip
   unzip -oq ne_10m_admin_0_countries.zip -d ne
   ```

3. **Wikidata** (CC0) - jen kontrola poloh pohoří (QID v `build.mjs`); stahuje se automaticky při sestavení
   a ukládá do `source/wikidata.json`. Pokud by pohoří v Data200 chybělo, použije se bod z Wikidat.

## Sestavení

```sh
cd tools/slepa-mapa
npm install
node build.mjs
```

Na konci se vypíše KONTROLA: počty 14/13/12/13, co chybí (chybějící prvky se nikdy nedoplňují odhadem),
velikost výstupu (limit 300 kB) a u každého pohoří vzdálenost bodu Data200 od bodu ve Wikidatech.

## Jak se data zpracují

- Souřadnice zůstávají v S-JTSK (EPSG:5514); mapa se jen otočí o konvergenci poledníků (sever nahoru),
  zmenší do viewBoxu 1000 × 580 a překlopí osa y.
- Kraje: `PolbndRegDA`, zjednodušení `interval=220` m se sdílenou topologií a `keep-shapes`
  (bez mezer a překryvů); obrys státu = sloučené kraje.
- Řeky: `WatrcrsL` podle jména a prefixu hydrologického pořadí `NHI` (vyloučí stejnojmenné potoky), sloučené,
  oříznuté na území ČR.
- Krajská města: bod `BuiltupP` s největším počtem obyvatel (`PPL`) pro dané jméno.
- Pohoří: středy ploch pohoří, ČÚZK Data200. Bod je vnitřní bod (`mapshaper -points inner`, leží jistě uvnitř
  plochy) geomorfologické jednotky (`GName6A`, Brdy `GName7A`, Českomoravská vrchovina `GName5A`).
  Když je bod blíž krajskému městu než 44 px na mapě široké 375 px (dvě dotykové zóny po 22 px), skript ho posune
  na mřížce uvnitř plochy (aspoň 4 jednotky od okraje) na nejbližší místo, kde podmínku splní; když takové místo
  není, vezme místo nejdál od měst. Na konci vypíše posuny a KONTROLU DVOJIC pohoří - krajské město, které
  podmínku nesplňují. Žádné ručně psané souřadnice.
- Sousední státy: Natural Earth převedený do Křováku (proj4 řetězec v `build.mjs`).
