#!/usr/bin/env node
/* Dev-only testy generátoru a řešiče. Není součástí webu. */
"use strict";
const G = require("./generator.js");

const TYPES = ["trojuhelnik", "rada"];
const SIZES = { trojuhelnik: [3, 4, 5], rada: [5, 6, 7, 8] };
const LIMITS = [20, 100, 1000];
const DIFFS = ["lehka", "stredni", "narocna"];
const SOLS = ["jedno", "vice", "mix"];
const PER = 200; /* 200 místo 1000 kvůli času; u nevyrobitelných max. 40 pokusů × 120 pokusů generátoru */
const EARLY_FAIL = 40;
const ATT = 120;

let fails = 0;
function ok(cond, msg) {
  if (!cond) { fails++; console.error("FAIL:", msg); }
}

/* determinismus */
(function () {
  const s = G.normalizeSettings({ typ: "trojuhelnik", vel: 3, obor: 20, obtiznost: "lehka", reseni: "jedno", pocet: 6, cislo: 48213 });
  const A = G.generateSheet(s, G.mulberry32(G.hashSeed(s.cislo)));
  const B = G.generateSheet(s, G.mulberry32(G.hashSeed(s.cislo)));
  ok(A.tasks.length === 6, "výchozí list má 6 úloh, " + A.tasks.length);
  ok(JSON.stringify(A.tasks.map(t => t.values)) === JSON.stringify(B.tasks.map(t => t.values)), "stejný seed = stejný list");
  ok(A.tasks.every(t => t.solCount === 1), "výchozí list: jedno řešení");
  const C = G.generateSheet(Object.assign({}, s, { cislo: 48214 }), G.mulberry32(G.hashSeed(48214)));
  ok(JSON.stringify(A.tasks.map(t => t.values)) !== JSON.stringify(C.tasks.map(t => t.values)), "jiný seed = jiný list");
})();

/* čtyři kontroly jedné úlohy */
function verifyTask(task, settings) {
  const typ = task.typ, n = task.size, L = task.limit;
  if (!G.checkRules(task.values, L)) return "pravidla 5.1 na uloženém řešení";
  if (!G.relationsHold(typ, n, task.values)) return "vztahy na uloženém řešení";
  const given = task.given.map(idx => ({ idx: idx, val: task.values[idx] }));
  const solved = G.solveFromGiven(typ, n, L, given);
  if (settings.reseni === "jedno" && solved.count !== 1) return "počítáno " + solved.count + " řešení, čeká se 1";
  if (settings.reseni === "vice" && solved.count < 3) return "počítáno " + solved.count + " řešení, čeká se 3–50";
  if (settings.reseni === "mix" && !(solved.count === 1 || solved.count >= 3)) return "mix má " + solved.count + " řešení";
  const cls = G.classify(typ, n, task.given, typ === "trojuhelnik" ? G.triCount(n) : n);
  if (cls !== settings.obtiznost) return "obtížnost " + cls + " ≠ " + settings.obtiznost;
  if (cls !== task.difficulty) return "uložená obtížnost nesedí";
  for (let i = 0; i < solved.solutions.length; i++) {
    if (!G.checkRules(solved.solutions[i], L)) return "řešení " + i + " porušuje 5.1";
    if (!G.relationsHold(typ, n, solved.solutions[i])) return "řešení " + i + " porušuje vztahy";
    for (const g of given) if (solved.solutions[i][g.idx] !== g.val) return "řešení " + i + " nerespektuje zadané";
  }
  return null;
}

function comboName(s) {
  const typ = s.typ === "rada" ? "řada" : "trojúhelník";
  const d = { lehka: "lehká", stredni: "střední", narocna: "náročná" }[s.obtiznost];
  const r = { jedno: "jedno", vice: "více", mix: "mix" }[s.reseni];
  return typ + " " + s.vel + "  do " + s.obor + "  " + d + "  " + r;
}

const rows = [];
const t0 = Date.now();
let tested = 0, produced = 0, unprod = 0;

TYPES.forEach(typ => {
  SIZES[typ].forEach(vel => {
    LIMITS.forEach(obor => {
      DIFFS.forEach(obtiznost => {
        SOLS.forEach(reseni => {
          const settings = { typ, vel, obor, obtiznost, reseni };
          const wantMultiAlways = reseni === "vice";
          const knownBad = G.impossibleCombo(obtiznost, wantMultiAlways);
          let okN = 0, failN = 0, reason = "";
          const rnd = G.mulberry32(G.hashSeed("test-" + typ + "-" + vel + "-" + obor + "-" + obtiznost + "-" + reseni));
          const target = knownBad ? 5 : PER;
          const start = Date.now();
          for (let i = 0; i < target; i++) {
            const opts = { typ, size: vel, limit: obor, difficulty: obtiznost, maxAttempts: ATT };
            const task = G.generateTask(rnd, Object.assign({ wantMulti: reseni === "vice" ? true : reseni === "jedno" ? false : rnd() < 0.5 }, opts));
            let t = task;
            if (!t && reseni === "mix") {
              t = G.generateTask(rnd, Object.assign({ wantMulti: false }, opts));
            }
            if (!t) {
              failN++;
              if (!knownBad && failN >= EARLY_FAIL && okN === 0) { reason = "nevyrobitelné (časné zastavení po " + EARLY_FAIL + " neúspěších)"; break; }
              continue;
            }
            const err = verifyTask(t, { typ, vel, obor, obtiznost, reseni: t.multi ? "vice" : (reseni === "mix" ? "mix" : "jedno") });
            if (err) { failN++; if (!reason) reason = err; fails++; }
            else okN++;
          }
          const ms = Date.now() - start;
          const unproducible = okN === 0;
          if (unproducible) unprod++; else produced += okN;
          tested++;
          if (tested % 15 === 1) process.stderr.write(".");
          rows.push({
            typ, vel, obor, obtiznost, reseni,
            ok: okN, fail: failN, unproducible, reason, ms
          });
        });
      });
    });
  });
});

/* tabulka */
function pad(s, n) { s = String(s); return s.length >= n ? s : s + " ".repeat(n - s.length); }
console.log("\n" + pad("kombinace", 42) + pad("úspěch", 10) + pad("selhání", 10) + "poznámka");
console.log("-".repeat(90));
rows.forEach(r => {
  const name = comboName(r);
  const score = r.unproducible ? "0" : String(r.ok);
  const note = r.unproducible ? (r.reason || "nevyrobitelné") : "";
  console.log(pad(name, 42) + pad(score, 10) + pad(String(r.fail), 10) + note);
});
console.log("-".repeat(90));
const unList = rows.filter(r => r.unproducible);
console.log("Kombinací:", rows.length, "  vyrobitelných:", rows.length - unList.length, "  nevyrobitelných:", unList.length);
console.log("Čas:", ((Date.now() - t0) / 1000).toFixed(1), "s  (cíl", PER, "úloh na vyrobitelnou kombinaci)");
console.log("\nNevyrobitelné kombinace:");
unList.forEach(r => console.log("  • " + comboName(r) + (r.reason ? " — " + r.reason : "")));

if (fails) { console.error("\n" + fails + " chyb ověření"); process.exit(1); }
console.log("\nOK");
