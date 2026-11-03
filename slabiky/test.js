// node slabiky/test.js
const { syllabify } = require('./syllab.js');
const cases = {
  'snášenlivý': 'sná-šen-li-vý', 'informovanou': 'in-for-mo-va-nou', 'dobrodružný': 'do-bro-druž-ný',
  'úhlopříčkou': 'ú-hlo-příč-kou', 'překřikují': 'pře-kři-ku-jí', 'nedůtklivou': 'ne-důt-kli-vou',
  'Jetřichovice': 'Je-tři-cho-vi-ce', 'vlk': 'vlk', 'Brno': 'Br-no', 'čtvrtek': 'čtvr-tek', 'auto': 'au-to',
  'poušť': 'poušť', 'Mladotice': 'Mla-do-ti-ce', 'krk': 'krk', 'sestra': 'ses-tra', 'maminka': 'ma-min-ka',
  'ovoce': 'o-vo-ce', 'jablko': 'jabl-ko', 'Vltava': 'Vl-ta-va', 'chalupa': 'cha-lu-pa', 'CHATA': 'CHA-TA',
  'rádio': 'rá-di-o', 'neuvěřitelný': 'ne-u-vě-ři-tel-ný', 'zmrzlina': 'zmr-zli-na', 'kniha': 'kni-ha',
  'nacvičovali': 'na-cvi-čo-va-li', 'představení': 'před-sta-ve-ní', 'návštěva': 'ná-vště-va', 'odletí': 'od-le-tí',
  'podle': 'pod-le', 'povzbudila': 'po-vzbu-di-la', 'nejdřív': 'nej-dřív', 'domů': 'do-mů', 'nebe': 'ne-be',
};
let fail = 0;
for (const [w, exp] of Object.entries(cases)) {
  const got = syllabify(w).join('-'); const ok = got === exp; if (!ok) fail++;
  console.log((ok ? 'OK  ' : 'FAIL') + ' ' + w.padEnd(14) + got + (ok ? '' : '   (čekáno ' + exp + ')'));
}
// všechny texty v texts.js musí jít rozdělit (každá slabika obsahuje samohlásku nebo r/l)
global.window = {}; require('./texts.js');
const { tokenize } = require('./syllab.js');
for (const t of window.TEXTS) for (const k of tokenize(t.t + ' ' + t.x)) if (k.syl && k.t.length > 1)
  for (const s of k.syl) if (!/[aeiouyáéíóúůýěrl]/i.test(s)) { fail++; console.log('FAIL text „' + t.t + '“: ' + k.syl.join('-')); }
console.log(window.TEXTS.length + ' textů zkontrolováno');
console.log(fail ? fail + ' chyb' : 'Vše OK'); process.exit(fail ? 1 : 0);
