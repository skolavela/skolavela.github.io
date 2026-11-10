/* ==========================================================================
   Velappky - obsah rozcestníku
   JEDINÉ místo, kde se přidávají složky a appky. Stránka se z toho postaví sama.

   Složka:  { type: "folder", id, name, icon, tone, items: [ ... ] }
   Appka:   { type: "app", id, name, short, url, icon, tone, grades, keywords }

   id        - malými písmeny bez diakritiky, unikátní; u složek tvoří adresu (#/cestina/cteni)
   name      - název pod ikonou (max. ~18 znaků)
   short     - podtitul appky, jedna krátká věta (max. ~24 znaků)
   url       - adresa appky (beze změny oproti dnešku)
   icon      - klíč z icons.js; když chybí, použije se "slozka" nebo "appka"
   tone      - pink | wine | blue | navy | teal | purple | green | orange | yellow
   grades    - ["1", "2"] = pro který stupeň; hledání "2. stupeň" podle toho filtruje
   keywords  - další slova pro hledání (bez diakritiky stačí)

   Pravidlo: max. 2 úrovně složek (téma › podtéma).
   ========================================================================== */
window.VELAPPKY = [
  {
    type: "folder", id: "cestina", name: "Čeština", icon: "cestina", tone: "pink",
    items: [
      { type: "app", id: "slabiky", name: "Tučné slabiky", short: "Čtení pro dyslektiky",
        url: "/slabiky/", icon: "slabiky", tone: "pink", grades: ["1"],
        keywords: "cteni dyslexie tisk pdf" },
      { type: "app", id: "osmismerka", name: "Osmisměrka", short: "Z vlastních slov",
        url: "/osmismerky/", icon: "osmismerka", tone: "wine", grades: ["1", "2"],
        keywords: "slova tisk reseni pdf" },
      { type: "app", id: "vyjmenovana", name: "Vyjmenovaná slova", short: "Doplň i nebo y",
        url: "/vyjmenovana-slova/", icon: "vyjmenovana", tone: "pink", grades: ["1"],
        keywords: "vyjmenovaná slova pravopis i y tvrdé měkké obojetné souhlásky 1. stupeň 3. třída" }

      /* Příklad podsložky - takhle se vnoří další úroveň:
      ,{ type: "folder", id: "cteni", name: "Čtení", icon: "cteni", tone: "pink",
        items: [ ...appky... ] }
      */
    ]
  },
  {
    type: "folder", id: "matematika", name: "Matematika", icon: "matematika", tone: "blue",
    items: []
  },
  {
    type: "folder", id: "logika", name: "Logika", icon: "logika", tone: "teal",
    items: [
      { type: "app", id: "sudoku", name: "Sudoku", short: "Tři obtížnosti",
        url: "/sudoku/", icon: "sudoku", tone: "teal", grades: ["1", "2"],
        keywords: "cisla hra napoveda tisk pdf" }
    ]
  },
  {
    type: "folder", id: "zabava", name: "Zábava", icon: "zabava", tone: "purple",
    items: [
      { type: "app", id: "bludiste", name: "Bludiště", short: "Bludiště k tisku",
        url: "/bludiste/", icon: "bludiste", tone: "purple", grades: ["1", "2"],
        keywords: "logika tisk pdf hra" }
    ]
  },
  {
    type: "folder", id: "prirodoveda", name: "Přírodověda", icon: "prirodoveda", tone: "green",
    items: [
      { type: "app", id: "priroda", name: "Poznáváme přírodu", short: "Kvíz podle fotek",
        url: "/priroda/", icon: "priroda", tone: "green", grades: ["1", "2"],
        keywords: "kviz kartičky stromy kvetiny houby ptaci savci" }
    ]
  },
  {
    type: "folder", id: "prijimacky", name: "Přijímačky", icon: "prijimacky", tone: "navy",
    items: [
      { type: "app", id: "prijimacky", name: "Nanečisto", short: "Čeština a matematika",
        url: "/prijimacky/", icon: "stopky", tone: "navy", grades: ["2"],
        keywords: "cermat test jednotne prijimaci zkousky na cas" }
    ]
  }
];
