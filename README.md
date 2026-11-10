# Velappky – školní aplikace ZŠ Vela

Rozcestník školních webových aplikací na https://skolavela.app (GitHub Pages, čisté HTML/CSS/JS bez build kroku).

## Sdílený design (`/assets/`)
- `velappky.css` – design system pro rozcestník i všechny appky (jediný zdroj barev, rozměrů a komponent)
- `icons.js` – ikony složek a appek
- `data.js` – obsah rozcestníku (složky a appky); jediné místo, kde se přidává nová appka nebo složka
- `vela-logo.png`, `apple-touch-icon.png`

## Jak přidat aplikaci
1. Vytvořte složku, např. `nazev-aplikace/`, s `index.html` podle kostry existující appky
   (`<body class="is-app">`, lišta `‹ Složka`, patička jako na rozcestníku, načtení `/assets/velappky.css` a `/assets/icons.js`).
2. Do `assets/data.js` přidejte záznam appky do správné složky (návod je přímo v souboru).
3. Commit a push – GitHub Pages stránku za chvíli aktualizuje.

## Aplikace
- Bludiště `/bludiste/`, Tučné slabiky `/slabiky/`, Osmisměrka `/osmismerky/`,
  Sudoku `/sudoku/`, Poznáváme přírodu `/priroda/`, Přijímačky `/prijimacky/`
