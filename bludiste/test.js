const B = require('./app.js'); const assert = require('assert');
for (const [c, r] of [[5,4],[24,17],[70,47],[33,47]]) for (let s = 1; s <= 20; s++) {
  const m = B.generateMaze(c, r, s); const p = B.solveMaze(m); assert(p, 'unsolvable');
  // perfect maze: open passages == cells-1
  let open = 0; for (let i = 0; i < c*r; i++) { if (!(m.walls[i]&2) && i%c<c-1) open++; if (!(m.walls[i]&4) && i<c*(r-1)) open++; }
  assert.strictEqual(open, c*r-1, 'not perfect');
}
const a = B.generateMaze(30,20,'abc'), b = B.generateMaze(30,20,'abc');
assert.deepStrictEqual(a.walls, b.walls, 'seed not reproducible');
console.log('OK: generation, solvability, perfectness, reproducibility; expert grid', B.gridFor(70,'landscape'));
