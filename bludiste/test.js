const B = require('./app.js'); const assert = require('assert');
const deg = (m, i) => { let n = 0; for (const b of [1, 2, 4, 8]) if (!(m.walls[i] & b)) n++; return n; };
let worst = 1;
for (const [c, r] of [[5,4],[12,7],[24,15],[42,26],[70,43]]) for (let s = 1; s <= 20; s++) {
  const m = B.generateMaze(c, r, s); assert(B.solveMaze(m), 'unsolvable');
  let open = 0; for (let i = 0; i < c*r; i++) { if (!(m.walls[i]&2) && i%c<c-1) open++; if (!(m.walls[i]&4) && i<c*(r-1)) open++; }
  assert.strictEqual(open, c*r-1, 'not perfect');
  if (c < 12) continue;
  let dead = 0; for (let i = 0; i < c*r; i++) if (deg(m, i) === 1) dead++;
  const ratio = dead / (c*r); worst = Math.min(worst, ratio);
  assert(ratio > 0.2, `dead-end ratio too low ${ratio}`); // backtracker ~0.10
  // every 6x6 block has at least one dead end and one branching cell
  for (let by = 0; by + 6 <= r; by += 6) for (let bx = 0; bx + 6 <= c; bx += 6) {
    let d = 0, br = 0;
    for (let y = by; y < by+6; y++) for (let x = bx; x < bx+6; x++) { const g = deg(m, y*c+x); if (g === 1) d++; if (g >= 3) br++; }
    assert(d > 0 && br > 0, `region ${bx},${by} lacks branching (seed ${s}, ${c}x${r})`);
  }
}
assert.deepStrictEqual(B.generateMaze(30,20,'abc').walls, B.generateMaze(30,20,'abc').walls, 'seed not reproducible');
console.log('OK: perfect, solvable, reproducible, branching; min dead-end ratio', worst.toFixed(3));
