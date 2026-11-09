// node test.js – ověří generátor: jediné řešení, řešitelné logikou, odpovídající obtížnost
const S = require('./engine.js');
let bad = 0;
for (const n of [4, 6, 9]) S.LEVELS[n].forEach((L, li) => {
  const N = n === 9 ? 15 : 40, t0 = Date.now(), techs = {}, clues = [];
  for (let k = 0; k < N; k++) {
    const g = S.generate(n, li);
    const uniq = S.countSolutions(n, g.puzzle, 2), r = S.solveLogic(n, g.puzzle, L.max);
    const ok = uniq === 1 && r.solved && r.board.join() === g.solution.join() && g.puzzle.every((v, i) => !v || v === g.solution[i]);
    if (!ok) { bad++; console.log('FAIL', n, L.name, uniq, r.solved); }
    techs[g.tech] = (techs[g.tech] || 0) + 1; clues.push(g.puzzle.filter(Boolean).length);
  }
  console.log(`${n}x${n} ${L.name}: ${((Date.now() - t0) / N).toFixed(0)} ms/zadání, techniky ${JSON.stringify(techs)}, zadaných ${Math.min(...clues)}–${Math.max(...clues)}`);
});
console.log(bad ? 'CHYBY: ' + bad : 'OK');
process.exit(bad ? 1 : 0);
