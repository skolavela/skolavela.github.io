// node slabiky/test.js
const { syllabify } = require('./syllab.js');
const cases = {
  'snášenlivý': 'sná-šen-li-vý', 'informovanou': 'in-for-mo-va-nou', 'dobrodružný': 'do-bro-druž-ný',
  'úhlopříčkou': 'ú-hlo-příč-kou', 'překřikují': 'pře-kři-ku-jí', 'nedůtklivou': 'ne-důt-kli-vou',
  'Jetřichovice': 'Je-tři-cho-vi-ce', 'vlk': 'vlk', 'Brno': 'Br-no', 'čtvrtek': 'čtvr-tek', 'auto': 'au-to',
  'poušť': 'poušť', 'Mladotice': 'Mla-do-ti-ce', 'krk': 'krk', 'sestra': 'ses-tra', 'maminka': 'ma-min-ka',
  'ovoce': 'o-vo-ce', 'jablko': 'jabl-ko', 'Vltava': 'Vl-ta-va', 'chalupa': 'cha-lu-pa', 'CHATA': 'CHA-TA',
  'rádio': 'rá-di-o', 'neuvěřitelný': 'ne-u-vě-ři-tel-ný', 'zmrzlina': 'zmr-zli-na', 'kniha': 'kni-ha',
};
let fail = 0;
for (const [w, exp] of Object.entries(cases)) {
  const got = syllabify(w).join('-'); const ok = got === exp; if (!ok) fail++;
  console.log((ok ? 'OK  ' : 'FAIL') + ' ' + w.padEnd(14) + got + (ok ? '' : '   (čekáno ' + exp + ')'));
}
console.log(fail ? fail + ' chyb' : 'Vše OK'); process.exit(fail ? 1 : 0);
