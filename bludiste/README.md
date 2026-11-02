# Bludiště

Generátor bludišť k tisku na A4 – čisté HTML/CSS/JS, bez build kroku, běží na GitHub Pages.

- Obtížnosti Lehké / Střední / Těžké / Expert (až 70 políček) + vlastní velikost
- Orientace na šířku / na výšku, tloušťka čáry, ručně kreslený styl
- Seed – stejný seed = stejné bludiště
- Šipky u vstupu a výstupu, ikonky vlajky a hvězdy
- Zobrazení řešení (volitelně i v PDF)
- Export do vektorového PDF (A4, jsPDF) s patičkou s názvem, tisk přes `@page A4`
- Nastavení se pamatuje v prohlížeči (localStorage)

Spuštění lokálně: `python3 -m http.server` a otevřít http://localhost:8000. Test: `node test.js`.
