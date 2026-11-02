# Školní aplikace

Rozcestník školních webových aplikací (GitHub Pages: https://skolavela.github.io/).

## Jak přidat aplikaci
1. Vytvořte složku, např. `nazev-aplikace/`, a dejte do ní `index.html` (a další soubory).
2. Do souboru `apps.js` přidejte řádek:
   ```js
   { name: 'Název', url: 'nazev-aplikace/', icon: 'maze', color: '#34c759', desc: 'Krátký popis.' },
   ```
   Ikony jsou SVG v objektu `ICONS` v `index.html` (lze přidat vlastní).
3. Commit a push – GitHub Pages stránku za chvíli aktualizuje.

## Aplikace
- **Bludiště** (`/bludiste/`) – generátor bludišť k tisku na A4 s exportem do PDF.
