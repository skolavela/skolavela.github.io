// Seznam aplikací – novou aplikaci přidáte dalším řádkem.
// grade: stupeň (1, 2), subj: předměty (zobrazí se jako štítky a filtry)
window.APPS = [
  { name: 'Bludiště', url: 'bludiste/', icon: 'maze', color: '#0071e3', grade: [1, 2], subj: ['Logika a zábava'],
    desc: 'Generátor bludišť k tisku na A4. Volitelná obtížnost, export do PDF.' },
  { name: 'Tučné slabiky', url: 'slabiky/', icon: 'text', color: '#ff2d78', grade: [1], subj: ['Čeština'],
    desc: 'Libovolný text po slabikách střídavě tučně a normálně – pro dyslektiky. Tisk a PDF.' },
  { name: 'Osmisměrka', url: 'osmismerky/', icon: 'grid', color: '#5e5ce6', grade: [1, 2], subj: ['Čeština'],
    desc: 'Osmisměrky na zvolené téma nebo z vlastních slov, pro 1. i 2. stupeň. Tisk s řešením.' },
  { name: 'Poznáváme přírodu', url: 'priroda/', icon: 'leaf', color: '#34a853', grade: [1, 2], subj: ['Přírodověda'],
    desc: 'Kvíz a kartičky: poznej stromy, květiny, houby, ptáky, savce a další podle fotek.' },
  { name: 'Přijímačky', url: 'prijimacky/', icon: 'cap', color: '#ff375f', grade: [2], subj: ['Čeština', 'Matematika'],
    desc: 'Procvičování na jednotné přijímačky z češtiny a matematiky. Témata, cvičné testy na čas, vysvětlení.' },
];
