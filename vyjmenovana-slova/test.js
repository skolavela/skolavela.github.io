#!/usr/bin/env node
/* Dev-only testy dat a logiky kola. Není součástí webu. */
"use strict";
const assert = require("assert");
const path = require("path");
const VS = require("./vyjmenovana-slova.data.js");
const L = require("./app.js");

const Y = new Set(["y", "ý"]);
const I = new Set(["i", "í"]);
let fails = 0;
function ok(cond, msg) {
  if (!cond) { fails++; console.error("FAIL:", msg); }
}

ok(Array.isArray(VS.letters) && VS.letters.join("") === "BLMPSVZ", "letters BLMPSVZ");
ok(VS.words.length === 204, "words 204, got " + VS.words.length);
ok(VS.sentences.length === 204, "sentences 204, got " + VS.sentences.length);
ok(VS.pairs.length === 12, "pairs 12");

const byType = { vyjmenovane: 0, pribuzne: 0, chytak: 0 };
for (const it of VS.words) byType[it.type] = (byType[it.type] || 0) + 1;
ok(byType.vyjmenovane === 80, "vyjmenovane 80, got " + byType.vyjmenovane);
ok(byType.pribuzne === 81, "pribuzne 81 (bez brzký), got " + byType.pribuzne);
ok(byType.chytak === 43, "chytak 43, got " + byType.chytak);

ok(VS.prehled.Z.pribuzne.includes("brzký"), "brzký je v přehledu Z");
ok(!VS.words.some(w => w.word === "brzký"), "brzký není v kvízu");
ok(!VS.words.some(w => (w.word || "") === "kabina"), "kabina vynechána");
ok(!VS.words.some(w => w.word === "zima" && w.letter === "M"), "zima není u M");
ok(!VS.words.some(w => /předpona/i.test(w.word || "")), "poznámka o předponě není položka");

function checkItem(it, kind) {
  const target = it.word || it.target;
  const label = kind + " " + target;
  ok(typeof it.gap === "number" && it.gap >= 0 && it.gap < target.length, label + " gap");
  const ch = target[it.gap].toLowerCase();
  ok(ch === it.answer, label + " word[gap]=" + ch + " answer=" + it.answer);
  if (it.type === "chytak") ok(I.has(it.answer), label + " chytak má i/í");
  else ok(Y.has(it.answer), label + " vyj/příbuz má y/ý");
  const before = target[it.gap - 1];
  ok(before && before.toLowerCase() === it.letter.toLowerCase(),
    label + " písmeno před mezerou je " + (before || "?") + ", očekáváno " + it.letter);
  if (it.sentence) {
    const hay = it.sentence;
    ok(hay.indexOf(it.target) >= 0, label + " cíl chybí ve větě: " + hay);
  }
}

VS.words.forEach(it => checkItem(it, "word"));
VS.sentences.forEach(it => checkItem(it, "sent"));

const briefPairs = [
  ["Chtěl bych ___ hasičem.", "být"],
  ["Nesmíš ___ psa.", "bít"],
  ["Včera ___ krásný den.", "byl"],
  ["Zvon na věži ___ poledne.", "bil"],
  ["Před jídlem si musíš ___ ruce.", "mýt"],
  ["Chci ___ psa.", "mít"],
  ["Včely sbírají ___.", "pyl"],
  ["Táta ráno ___ kávu.", "pil"],
  ["V lese houkal ___.", "výr"],
  ["Pod jezem se točil ___.", "vír"],
  ["Vlci začali ___.", "výt"],
  ["Babička nás učila ___ věnečky.", "vít"]
];
ok(VS.pairs.length === briefPairs.length, "přesně 12 dvojic ze zadání");
for (const [s, a] of briefPairs) {
  const p = VS.pairs.find(x => x.sentence === s);
  ok(p && p.answer === a, "dvojice " + s + " → " + a);
  ok(p && p.options.includes(a) && p.options.length === 2, "dvojice options " + s);
}

function countTypes(items) {
  const o = { chytak: 0, other: 0 };
  for (const it of items) {
    if (it.type === "chytak") o.chytak++; else o.other++;
  }
  return o;
}

/* půl chytáků – víc pokusů kvůli náhodě */
for (let n = 0; n < 30; n++) {
  const r = L.buildRound({ mode: "slova", letters: VS.letters, count: 10, pribuzne: true });
  ok(r.length === 10, "kolo 10 má 10 položek, " + r.length);
  const c = countTypes(r);
  ok(c.chytak === 5 && c.other === 5, "půl chytáků při 10: " + JSON.stringify(c));
}
for (let n = 0; n < 20; n++) {
  const r = L.buildRound({ mode: "vety", letters: ["B"], count: 10, pribuzne: true });
  ok(r.length === 10, "B věty 10");
  const c = countTypes(r);
  /* B má 6 chytáků, 30 normálních → 5/5 */
  ok(c.chytak === 5, "B věty ~půl chytáků, " + c.chytak);
  ok(r.every(it => it.letter === "B"), "filtrování písmene B");
}

/* filtrování písmen */
const onlyZ = L.buildRound({ mode: "slova", letters: ["Z"], count: 30, pribuzne: true });
ok(onlyZ.length > 0 && onlyZ.every(it => it.letter === "Z"), "jen Z");
ok(!onlyZ.some(it => (it.word || it.target) === "brzký"), "Z kolo bez brzký");

/* bez příbuzných */
const noPri = L.buildRound({ mode: "slova", letters: ["L"], count: 20, pribuzne: false });
ok(noPri.every(it => it.type !== "pribuzne"), "příbuzná vypnutá");

/* dvojice: jen z filtru, max dostupných */
const dvojB = L.buildRound({ mode: "dvojice", letters: ["B"], count: 10, pribuzne: true });
ok(dvojB.length === 4, "B má 4 dvojice (být/bít, byl/bil), got " + dvojB.length);
ok(dvojB.every(it => it.letter === "B" && it.options.length === 2), "dvojice B ok");
const dvojS = L.buildRound({ mode: "dvojice", letters: ["S", "Z"], count: 10, pribuzne: true });
ok(dvojS.length === 0, "S+Z nemají dvojice");
const dvojAll = L.buildRound({ mode: "dvojice", letters: VS.letters, count: 30, pribuzne: true });
ok(dvojAll.length === 12, "všechny dvojice při 30");
/* pořadí voleb je zamíchané aspoň někdy */
let flipped = false;
for (let i = 0; i < 40; i++) {
  const r = L.buildRound({ mode: "dvojice", letters: ["B"], count: 4, pribuzne: true });
  if (r.some(it => it.options[0] !== (it.answer === it.options[0] ? it.options[0] : it.options[0]) && it.options[0] !== VS.pairs.find(p => p.sentence === it.sentence).options[0])) {
    flipped = true; break;
  }
  if (r.some(it => {
    const orig = VS.pairs.find(p => p.sentence === it.sentence);
    return it.options[0] !== orig.options[0];
  })) { flipped = true; break; }
}
ok(flipped, "options dvojic se míchají");

/* nazývat se + zívat */
let sawPair = 0, sawNaz = 0;
for (let i = 0; i < 200; i++) {
  const r = L.buildRound({ mode: "slova", letters: VS.letters, count: 30, pribuzne: true });
  const names = r.map(L.nameOf);
  if (names.includes("nazývat se")) {
    sawNaz++;
    if (names.includes("zívat")) sawPair++;
  }
}
ok(sawNaz > 0 && sawPair === sawNaz, "když je nazývat se, je i zívat (" + sawPair + "/" + sawNaz + ")");

/* requeue +3, konec až vše správně */
function runRequeueCase() {
  const q0 = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
  const q1 = L.applyRequeue(q0, 0);
  /* rest=[1,2,3,4], pos=min(3,4)=3 → [0,1,2,3,0,4] */
  ok(q1.map(x => x.id).join("") === "012304", "requeue +3: " + q1.map(x => x.id).join(""));
  const short = L.applyRequeue([{ id: "a" }, { id: "b" }], 0);
  /* rest=[b], pos=1 → [a,b,a] */
  ok(short.map(x => x.id).join("") === "aba", "requeue na konec, když zbývá méně než 3");
}
runRequeueCase();

function simulate(wrongFirst) {
  let queue = [{ k: "a" }, { k: "b" }, { k: "c" }];
  const original = 3;
  let i = 0, correct = 0, attempts = 0;
  const first = {};
  const seenWrong = {};
  while (i < queue.length) {
    attempts++;
    if (attempts > 50) { ok(false, "simulace se nezastavila"); break; }
    const item = queue[i];
    const isFirst = !first[item.k];
    first[item.k] = true;
    const okNow = !(isFirst && wrongFirst[item.k]);
    if (!okNow) {
      seenWrong[item.k] = true;
      queue = L.applyRequeue(queue, i);
    } else correct++;
    i++;
  }
  ok(i === queue.length, "index dojde na konec fronty");
  ok(correct === original, "končí, až jsou všechny správně (" + correct + ")");
  ok(queue.length === original + Object.keys(wrongFirst).length, "špatné se vracejí, délka " + queue.length);
  return { queue, correct, attempts };
}
const sim = simulate({ a: true, c: true });
ok(sim.correct === 3, "dvě chyby, pak vše správně");

/* ---- jednoznačnost v režimu Slova ---- */
function flipChar(ch) {
  return ({ i: "y", y: "i", í: "ý", ý: "í", I: "Y", Y: "I", "Í": "Ý", "Ý": "Í" })[ch] || null;
}
function altOf(it) {
  const w = it.word || it.target;
  const a = flipChar(w[it.gap]);
  return w.slice(0, it.gap) + a + w.slice(it.gap + 1);
}

/* protějšek je platné české slovo (i tvar); při nejistotě raději zařadit */
const AMBIG = {
  "být": "bít",
  "bít": "být",
  "byt": "bit",
  "Přibyslav": "Přibislav",
  "pobyt": "pobit",
  "lyže": "liže",
  "my": "mi",
  "mýt": "mít",
  "slepýš": "slepíš",
  "pyl": "pil",
  "pylový": "pilový",
  "opylovat": "opilovat",
  "sýrový": "sírový",
  "násyp": "násip",
  "výt": "vít",
  "výr": "vír",
  "výří": "víří",
  "víla": "výla"
};
const ambigNames = Object.keys(AMBIG).sort();
const flaggedW = VS.words.filter(it => it.ambig).map(it => it.word).sort();
const flaggedS = VS.sentences.filter(it => it.ambig).map(it => it.target).sort();
ok(flaggedW.join() === ambigNames.join(), "ambig slova: " + flaggedW.join(", "));
ok(flaggedS.join() === ambigNames.join(), "ambig věty: " + flaggedS.join(", "));
VS.words.filter(it => it.ambig).forEach(it => {
  ok(altOf(it) === AMBIG[it.word], it.word + " protějšek " + altOf(it));
});
const nasyp = VS.sentences.find(it => it.target === "násyp");
ok(nasyp && nasyp.sentence === "Do vozu sypou násyp obilí.", "násyp věta přepsaná (ne násip u trati)");
ok(!/trati|násep|kolej/.test(nasyp.sentence), "násyp věta nepopisuje násip");

for (let n = 0; n < 40; n++) {
  const r = L.buildRound({ mode: "slova", letters: VS.letters, count: 30, pribuzne: true });
  const bad = r.filter(it => it.ambig || AMBIG[it.word || it.target]);
  ok(bad.length === 0, "Slova nesmí obsahovat ambig: " + bad.map(L.nameOf).join(", "));
}
for (const letter of VS.letters) {
  const r = L.buildRound({ mode: "slova", letters: [letter], count: 30, pribuzne: true });
  ok(r.every(it => !it.ambig), "Slova " + letter + " bez ambig");
  const v = L.buildRound({ mode: "vety", letters: [letter], count: 30, pribuzne: true });
  const expected = VS.sentences.filter(it => it.letter === letter && it.ambig).map(it => it.target).sort();
  const got = v.filter(it => it.ambig).map(it => it.target).sort();
  /* při 30 otázkách a malém počtu ambig ve filtru písmene se všechny vejdou, pokud je pool >= počtu ambig */
  const pool = VS.sentences.filter(it => it.letter === letter).length;
  if (pool <= 30) {
    ok(got.join() === expected.join(), "Věty " + letter + " si ambig nechávají: " + got.join(", "));
  }
}
const vetyHas = [];
for (let i = 0; i < 15; i++) {
  const r = L.buildRound({ mode: "vety", letters: VS.letters, count: 30, pribuzne: true });
  r.filter(it => it.ambig).forEach(it => vetyHas.push(it.target));
}
ok(vetyHas.length > 0, "Věty režim ambig slova stále zařazuje");
const dAll = L.buildRound({ mode: "dvojice", letters: VS.letters, count: 30, pribuzne: true });
ok(dAll.length === 12, "Dvojice beze změny, 12 položek");

/* půl chytáků ve Slovech po vyřazení ambig */
for (let n = 0; n < 20; n++) {
  const r = L.buildRound({ mode: "slova", letters: VS.letters, count: 10, pribuzne: true });
  const c = countTypes(r);
  ok(c.chytak === 5 && c.other === 5, "Slova po ambig stále půl chytáků: " + JSON.stringify(c));
}
for (const letter of VS.letters) {
  const r = L.buildRound({ mode: "slova", letters: [letter], count: 10, pribuzne: true });
  ok(r.length === 10, "Slova " + letter + " kolo 10 má " + r.length);
  const c = countTypes(r);
  const chytPool = VS.words.filter(it => it.letter === letter && it.type === "chytak" && !it.ambig).length;
  const expectChyt = Math.min(5, chytPool);
  ok(c.chytak === expectChyt, "Slova " + letter + " chytáky " + c.chytak + " (pool " + chytPool + ")");
}

if (fails) {
  console.error("\n" + fails + " chyb");
  process.exit(1);
}
console.log("OK  vyjmenovaná", byType.vyjmenovane,
  "příbuzná", byType.pribuzne,
  "chytáky", byType.chytak,
  "věty", VS.sentences.length,
  "dvojice", VS.pairs.length);
console.log("AMBIG (" + ambigNames.length + "):");
ambigNames.forEach(w => console.log("  " + w + " / " + AMBIG[w]));
console.log("Slova bez ambig:", VS.words.filter(it => !it.ambig).length);
