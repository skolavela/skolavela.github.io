# Bludiště

Generátor bludišť k tisku na A4 – čisté HTML/CSS/JS, bez build kroku, běží na GitHub Pages.

- Obtížnosti Lehké / Střední / Těžké / Nejtěžší (až 70 políček) + vlastní velikost
- Orientace na šířku / na výšku, tloušťka čáry, ručně kreslený styl
- Číslo bludiště – stejné číslo = stejné bludiště (patička listu: „Bludiště č. …“)
- Start a cíl kdekoli po obvodu (podle čísla bludiště), šipka s popiskem Start / Cíl
- Zobrazení řešení (volitelně i v PDF)
- Export do vektorového PDF (A4, jsPDF) s patičkou s názvem
- Nastavení se pamatuje v prohlížeči (localStorage)

Spuštění lokálně: `python3 -m http.server` a otevřít http://localhost:8000. Test: `node test.js`.
