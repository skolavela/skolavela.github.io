// Slepá mapa - sestavení mapových dat z ČÚZK Data200 + Natural Earth.
// Spuštění: npm install && node build.mjs   (zdroje viz README.md)
// Výstup: ../../slepa-mapa/slepa-mapa.data.js
// Souřadnice se NIKDY nekreslí ručně - vše se počítá ze zdrojových dat.
import mapshaper from 'mapshaper';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(DIR, 'source');
const TMP = path.join(DIR, '.tmp');
const OUT = path.join(DIR, '..', '..', 'slepa-mapa', 'slepa-mapa.data.js');
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

// S-JTSK / Křovák (EPSG:5514, East-North) - shodné s daty Data200
const KROVAK = '+proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +towgs84=589,76,480,0,0,0,0 +units=m +no_defs';
const SIMPLIFY = 'interval=220';           // metry; 1 px mapy je cca 470 m
const INIT = `-proj init='${KROVAK}'`;
const VBW = 1000, VBH = 580, PAD = 14;      // viewBox a okraj kolem ČR

// ---------- Obsah (jména dle zadání) ----------
const KRAJE = ['Hlavní město Praha', 'Středočeský kraj', 'Jihočeský kraj', 'Plzeňský kraj', 'Karlovarský kraj',
  'Ústecký kraj', 'Liberecký kraj', 'Královéhradecký kraj', 'Pardubický kraj', 'Kraj Vysočina',
  'Jihomoravský kraj', 'Olomoucký kraj', 'Zlínský kraj', 'Moravskoslezský kraj'];
const MESTA = ['Praha', 'České Budějovice', 'Plzeň', 'Karlovy Vary', 'Ústí nad Labem', 'Liberec',
  'Hradec Králové', 'Pardubice', 'Jihlava', 'Brno', 'Olomouc', 'Zlín', 'Ostrava'];
// řeka -> převažující prefix hydrologického pořadí (NHI) v Data200; vyloučí stejnojmenné potoky
const REKY = { 'Labe': '1000', 'Vltava': '1139', 'Morava': '4011', 'Odra': '2000', 'Dyje': '4112',
  'Ohře': '1396', 'Jizera': '1107', 'Sázava': '1247', 'Berounka': '1330', 'Otava': '1200',
  'Lužnice': '1169', 'Svratka': '4127' };
// pohoří -> vrstva geomorfologických jednotek Data200 (NAME/GName?A) a QID ve Wikidatech (kontrola)
const POHORI = {
  'Krkonoše': ['6A', 'Q214644'], 'Jizerské hory': ['6A', 'Q1345416'], 'Lužické hory': ['6A', 'Q695368'],
  'Krušné hory': ['6A', 'Q4198'], 'Český les': ['6A', 'Q685984'], 'Šumava': ['6A', 'Q157290'],
  'Novohradské hory': ['6A', 'Q1543660'], 'Brdy': ['7A', 'Q3489993'],
  'Českomoravská vrchovina': ['5A', 'Q871238'], 'Orlické hory': ['6A', 'Q358361'],
  'Hrubý Jeseník': ['6A', 'Q280987'], 'Moravskoslezské Beskydy': ['6A', 'Q1365195'], 'Bílé Karpaty': ['6A', 'Q1338173'] };
const SOUSEDE = { DEU: 'Německo', POL: 'Polsko', SVK: 'Slovensko', AUT: 'Rakousko' };

// KE KONTROLE - 4. pád (koho, co) pro zadání "Najdi …", vyplněno ručně
const AKUZATIV = {
  'Hlavní město Praha': 'hlavní město Prahu', 'Středočeský kraj': 'Středočeský kraj', 'Jihočeský kraj': 'Jihočeský kraj',
  'Plzeňský kraj': 'Plzeňský kraj', 'Karlovarský kraj': 'Karlovarský kraj', 'Ústecký kraj': 'Ústecký kraj',
  'Liberecký kraj': 'Liberecký kraj', 'Královéhradecký kraj': 'Královéhradecký kraj', 'Pardubický kraj': 'Pardubický kraj',
  'Kraj Vysočina': 'Kraj Vysočina', 'Jihomoravský kraj': 'Jihomoravský kraj', 'Olomoucký kraj': 'Olomoucký kraj',
  'Zlínský kraj': 'Zlínský kraj', 'Moravskoslezský kraj': 'Moravskoslezský kraj',
  'Praha': 'Prahu', 'České Budějovice': 'České Budějovice', 'Plzeň': 'Plzeň', 'Karlovy Vary': 'Karlovy Vary',
  'Ústí nad Labem': 'Ústí nad Labem', 'Liberec': 'Liberec', 'Hradec Králové': 'Hradec Králové', 'Pardubice': 'Pardubice',
  'Jihlava': 'Jihlavu', 'Brno': 'Brno', 'Olomouc': 'Olomouc', 'Zlín': 'Zlín', 'Ostrava': 'Ostravu',
  'Labe': 'Labe', 'Vltava': 'Vltavu', 'Morava': 'Moravu', 'Odra': 'Odru', 'Dyje': 'Dyji', 'Ohře': 'Ohři',
  'Jizera': 'Jizeru', 'Sázava': 'Sázavu', 'Berounka': 'Berounku', 'Otava': 'Otavu', 'Lužnice': 'Lužnici', 'Svratka': 'Svratku',
  'Krkonoše': 'Krkonoše', 'Jizerské hory': 'Jizerské hory', 'Lužické hory': 'Lužické hory', 'Krušné hory': 'Krušné hory',
  'Český les': 'Český les', 'Šumava': 'Šumavu', 'Novohradské hory': 'Novohradské hory', 'Brdy': 'Brdy',
  'Českomoravská vrchovina': 'Českomoravskou vrchovinu', 'Orlické hory': 'Orlické hory', 'Hrubý Jeseník': 'Hrubý Jeseník',
  'Moravskoslezské Beskydy': 'Moravskoslezské Beskydy', 'Bílé Karpaty': 'Bílé Karpaty' };

// ---------- pomocné ----------
const ms = (cmd) => mapshaper.runCommands(cmd);
const readGJ = (f) => {
  const j = JSON.parse(fs.readFileSync(path.join(TMP, f), 'utf8'));
  if (j.type === 'GeometryCollection') return { features: j.geometries.map(g => ({ properties: {}, geometry: g })) };
  if (j.type !== 'FeatureCollection') return { features: [{ properties: {}, geometry: j }] };
  return j;
};
const q = (s) => "'" + s.replace(/'/g, "\\'") + "'";
const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const upper = (s) => s.toLocaleUpperCase('cs');
const missing = [];

// ---------- 1. kraje (sdílená topologie, keep-shapes => bez mezer a překryvů) ----------
await ms(`-i ${SRC}/BND/PolbndRegDA.shp encoding=utf8 ${INIT} -simplify ${SIMPLIFY} keep-shapes ` +
  `-o ${TMP}/kraje.json format=geojson -dissolve + name=obrys -o ${TMP}/obrys.json format=geojson target=obrys ` +
  `-points inner target=PolbndRegDA + name=krajbody -o ${TMP}/krajbody.json format=geojson target=krajbody`);
await ms(`-i ${SRC}/BND/PolbndDA.shp ${INIT} -dissolve -o ${TMP}/stat.json format=geojson`);

// ---------- 2. řeky: výběr podle jména a NHI, sloučení, ořez na ČR, zjednodušení ----------
const rekyExpr = Object.entries(REKY).map(([n, p]) => `(NAMN1==${q(n)} && String(NHI).indexOf(${q(p)})==0)`).join(' || ');
await ms(`-i ${SRC}/HYDRO/WatrcrsL.shp encoding=utf8 ${INIT} -filter "${rekyExpr}" -dissolve NAMN1 -clip ${TMP}/stat.json ` +
  `-simplify ${SIMPLIFY} -o ${TMP}/reky.json format=geojson`);

// ---------- 3. krajská města: bod s největším počtem obyvatel pro dané jméno ----------
await ms(`-i ${SRC}/POP/BuiltupP.shp encoding=utf8 ${INIT} -filter "${MESTA.map(n => 'NAMN1==' + q(n)).join(' || ')}" -o ${TMP}/mesta.json format=geojson`);

// ---------- 4. pohoří: vnitřní bod (mapshaper -points inner) plochy geomorfologické jednotky Data200 ----------
for (const lvl of ['5A', '6A', '7A']) {
  const names = Object.entries(POHORI).filter(([, v]) => v[0] === lvl).map(([n]) => 'NAMN1==' + q(upper(n)));
  await ms(`-i ${SRC}/NAME/GName${lvl}.shp encoding=utf8 ${INIT} -filter "${names.join(' || ')}" -dissolve NAMN1 ` +
    `-o ${TMP}/pohoriPlochy${lvl}.json format=geojson -points inner -o ${TMP}/pohori${lvl}.json format=geojson`);
}

// ---------- 5. sousední státy (Natural Earth, WGS84 -> Křovák) ----------
await ms(`-i ${SRC}/ne/ne_10m_admin_0_countries.shp encoding=utf8 -filter "${[...Object.keys(SOUSEDE), 'CZE'].map(c => 'ADM0_A3==' + q(c)).join(' || ')}" ` +
  `-clip bbox=10.2,47.4,20.4,52.0 -proj ${q(KROVAK)} -simplify interval=600 keep-shapes -o ${TMP}/sousede.json format=geojson`);

// ---------- 6. otočení na sever: konvergence poledníků uprostřed ČR ----------
fs.writeFileSync(path.join(TMP, 'sever.json'), JSON.stringify({ type: 'FeatureCollection', features: [
  { type: 'Feature', properties: { n: 1 }, geometry: { type: 'Point', coordinates: [15.5, 49.75] } },
  { type: 'Feature', properties: { n: 2 }, geometry: { type: 'Point', coordinates: [15.5, 49.85] } }] }));
await ms(`-i ${TMP}/sever.json -proj ${q(KROVAK)} -o ${TMP}/sever-k.json format=geojson`);
const [s1, s2] = readGJ('sever-k.json').features.map(f => f.geometry.coordinates);
const theta = Math.atan2(s2[0] - s1[0], s2[1] - s1[1]); // úhel skutečného severu od osy N (po směru hodin)
const cos = Math.cos(theta), sin = Math.sin(theta);
const rot = ([x, y]) => [x * cos - y * sin, x * sin + y * cos]; // otočení proti směru hodin o theta

// měřítko podle obrysu ČR
const obrys = readGJ('obrys.json').features[0].geometry;
const allPts = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [[g.coordinates]]).flat(2);
let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
for (const p of allPts(obrys)) { const [x, y] = rot(p); minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
const S = Math.min((VBW - 2 * PAD) / (maxx - minx), (VBH - 2 * PAD) / (maxy - miny));
const ox = (VBW - (maxx - minx) * S) / 2, oy = (VBH - (maxy - miny) * S) / 2;
const T = (p) => { const [x, y] = rot(p); return [ox + (x - minx) * S, oy + (maxy - y) * S]; };
const r1 = (v) => Math.round(v * 10) / 10;
const num = (v) => { const s = (Math.round(v * 10) / 10).toFixed(1); return s.endsWith('.0') ? s.slice(0, -2) : s.replace(/^(-?)0\./, '$1.'); };
function ringD(ring, close) {
  let d = '', px = 0, py = 0, prev = null;
  ring.forEach((p, i) => {
    const [x, y] = T(p).map(r1);
    if (i === 0) { d += 'M' + num(x) + ' ' + num(y); }
    else { if (prev && prev[0] === x && prev[1] === y) return; const dx = x - px, dy = y - py; d += 'l' + num(dx) + (dy < 0 ? '' : ' ') + num(dy); }
    px = x; py = y; prev = [x, y];
  });
  return d.replace(/ -/g, '-') + (close ? 'z' : '');
}
function geomD(g) {
  if (g.type === 'Polygon') return g.coordinates.map(r => ringD(r.slice(0, -1), true)).join('');
  if (g.type === 'MultiPolygon') return g.coordinates.map(p => p.map(r => ringD(r.slice(0, -1), true)).join('')).join('');
  if (g.type === 'LineString') return ringD(g.coordinates, false);
  if (g.type === 'MultiLineString') return g.coordinates.map(l => ringD(l, false)).join('');
  throw new Error('geom ' + g.type);
}
const pt = (c) => { const [x, y] = T(c); return { x: r1(x), y: r1(y) }; };

// ---------- sestavení ----------
const krajF = readGJ('kraje.json').features, krajB = readGJ('krajbody.json').features;
const kraje = KRAJE.map(n => {
  const f = krajF.find(f => f.properties.NAMN === n); if (!f) { missing.push('kraj: ' + n); return null; }
  const b = krajB.find(b => b.properties.NAMN === n);
  return { id: slug(n), name: n, akuzativ: AKUZATIV[n], d: geomD(f.geometry), lx: pt(b.geometry.coordinates).x, ly: pt(b.geometry.coordinates).y, kod: f.properties.SHN1 };
}).filter(Boolean);

const mestaF = readGJ('mesta.json').features;
const mesta = MESTA.map(n => {
  const c = mestaF.filter(f => f.properties.NAMN1 === n).sort((a, b) => (b.properties.PPL || 0) - (a.properties.PPL || 0));
  if (!c.length) { missing.push('město: ' + n); return null; }
  return { id: slug(n), name: n, akuzativ: AKUZATIV[n], ...pt(c[0].geometry.coordinates) };
}).filter(Boolean);

const rekyF = readGJ('reky.json').features;
const reky = Object.keys(REKY).map(n => {
  const f = rekyF.find(f => f.properties.NAMN1 === n);
  if (!f || !f.geometry) { missing.push('řeka: ' + n); return null; }
  return { id: slug(n), name: n, akuzativ: AKUZATIV[n], d: geomD(f.geometry) };
}).filter(Boolean);

const pohF = ['5A', '6A', '7A'].flatMap(l => readGJ(`pohori${l}.json`).features);
// kontrola proti Wikidatům (CC0): QID a vzdálenost od bodu Data200
let wd = {};
const wdCache = path.join(SRC, 'wikidata.json');
try {
  const ids = Object.values(POHORI).map(v => v[1]).join('|');
  const r = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=claims|labels&languages=cs&format=json`,
    { headers: { 'User-Agent': 'Velappky-slepa-mapa-build/1.0 (https://velappky.cz)' } });
  const j = await r.json();
  for (const [id, e] of Object.entries(j.entities)) {
    const c = e.claims.P625 && e.claims.P625[0].mainsnak.datavalue.value;
    wd[id] = { label: e.labels.cs && e.labels.cs.value, lon: c && c.longitude, lat: c && c.latitude };
  }
  fs.writeFileSync(wdCache, JSON.stringify(wd, null, 1));
} catch (e) { if (fs.existsSync(wdCache)) wd = JSON.parse(fs.readFileSync(wdCache, 'utf8')); console.warn('Wikidata nedostupná, použita cache:', !!Object.keys(wd).length); }
const wdPts = Object.entries(wd).filter(([, v]) => v.lon != null).map(([id, v]) => ({ type: 'Feature', properties: { id }, geometry: { type: 'Point', coordinates: [v.lon, v.lat] } }));
let wdK = {};
if (wdPts.length) {
  fs.writeFileSync(path.join(TMP, 'wd.json'), JSON.stringify({ type: 'FeatureCollection', features: wdPts }));
  await ms(`-i ${TMP}/wd.json -proj ${q(KROVAK)} -o ${TMP}/wd-k.json format=geojson`);
  for (const f of readGJ('wd-k.json').features) wdK[f.properties.id] = f.geometry.coordinates;
}
// Bod pohoří nesmí zasahovat do zóny krajského města: na mapě široké 375 px musí být středy aspoň 44 px od sebe
// (dvě dotykové zóny 22 px). Když vnitřní bod podmínku nesplní, skript hledá na mřížce uvnitř plochy pohoří
// (aspoň 35 % největší možné vzdálenosti od okraje) nejbližší místo, které ji splní; když žádné není, vezme místo nejdál od měst.
const PHONE_W = 375, MIN_PX = 44, EDGE = 4;
const MIN_U = MIN_PX * VBW / PHONE_W;
const mestaPts = mesta.map(c => [c.x, c.y, c.name]);
const plochy = ['5A', '6A', '7A'].flatMap(l => readGJ(`pohoriPlochy${l}.json`).features);
const ringsOf = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).flat(1).map(r => r.map(p => T(p)));
function inside(rings, x, y) { let c = false; for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
function edgeDist(rings, x, y) { let d = Infinity; for (const r of rings) for (let i = 1; i < r.length; i++) { const [ax, ay] = r[i - 1], [bx, by] = r[i]; const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; let t = l ? ((x - ax) * dx + (y - ay) * dy) / l : 0; t = Math.max(0, Math.min(1, t)); d = Math.min(d, Math.hypot(x - ax - t * dx, y - ay - t * dy)); } return d; }
const cityMin = (x, y) => Math.min(...mestaPts.map(([cx, cy]) => Math.hypot(cx - x, cy - y)));
const posun = [];
const wdReport = [];
const pohori = Object.entries(POHORI).map(([n, [lvl, qid]]) => {
  const f = pohF.find(f => f.properties.NAMN1 === upper(n));
  let c = f && f.geometry && f.geometry.coordinates, zdroj = 'Data200 GName' + lvl;
  if (!c && wdK[qid]) { c = wdK[qid]; zdroj = 'Wikidata ' + qid; }
  if (!c) { missing.push('pohoří: ' + n); return null; }
  const w = wdK[qid];
  wdReport.push(`  ${n.padEnd(26)} ${zdroj.padEnd(16)} Wikidata ${qid.padEnd(9)} ${w ? (Math.hypot(w[0] - c[0], w[1] - c[1]) / 1000).toFixed(1) + ' km' : 'bez souřadnic'}`);
  let [x, y] = T(c);
  const pl = plochy.find(p => p.properties.NAMN1 === upper(n));
  if (pl && cityMin(x, y) < MIN_U) {
    const rings = ringsOf(pl.geometry);
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    for (const r of rings) for (const [px, py] of r) { bx0 = Math.min(bx0, px); by0 = Math.min(by0, py); bx1 = Math.max(bx1, px); by1 = Math.max(by1, py); }
    // kandidáti jistě uvnitř: aspoň 35 % největší možné vzdálenosti od okraje plochy (bod nespadne na hranici)
    const grid = [];
    for (let gx = bx0; gx <= bx1; gx += 1) for (let gy = by0; gy <= by1; gy += 1) if (inside(rings, gx, gy)) grid.push([gx, gy, edgeDist(rings, gx, gy)]);
    const maxE = Math.max(...grid.map(g => g[2]));
    const minE = Math.max(Math.min(EDGE, maxE), maxE * 0.35);
    let ok = null, okD = Infinity, far = null, farD = -1;
    for (const [gx, gy, e] of grid) {
      if (e < minE) continue;
      const cm = cityMin(gx, gy);
      if (cm >= MIN_U) { const d = Math.hypot(gx - x, gy - y); if (d < okD) { okD = d; ok = [gx, gy]; } }
      if (cm > farD) { farD = cm; far = [gx, gy]; }
    }
    const nw = ok || far;
    if (nw) { posun.push(`  ${n}: posunuto o ${(Math.hypot(nw[0] - x, nw[1] - y) * (1 / S) / 1000).toFixed(1)} km uvnitř plochy${ok ? '' : ' (podmínku nejde splnit, vybráno místo nejdál od měst)'}`); [x, y] = nw; }
  }
  return { id: slug(n), name: n, akuzativ: AKUZATIV[n], x: r1(x), y: r1(y) };
}).filter(Boolean);
// kontrola dvojic pohoří - krajské město
const pary = [];
for (const p of pohori) for (const c of mesta) { const px = Math.hypot(p.x - c.x, p.y - c.y) * PHONE_W / VBW; if (px < MIN_PX) pary.push(`  ${p.name} - ${c.name}: ${px.toFixed(1)} px`); }

const sousF = readGJ('sousede.json').features;
const neighbors = Object.entries(SOUSEDE).map(([a3, n]) => {
  const f = sousF.find(f => f.properties.ADM0_A3 === a3); if (!f) { missing.push('soused: ' + n); return null; }
  return { id: a3.toLowerCase(), name: n, d: geomD(f.geometry) };
}).filter(Boolean);
const cze = sousF.find(f => f.properties.ADM0_A3 === 'CZE');

const MAP = { viewBox: `0 0 ${VBW} ${VBH}`, rotace: +(theta * 180 / Math.PI).toFixed(3), meritko: +(1 / S).toFixed(1),
  neighbors, podklad: cze ? geomD(cze.geometry) : '', obrys: geomD(obrys),
  layers: { kraje, mesta, reky, pohori } };

const all = [...kraje, ...mesta, ...reky, ...pohori];
const header = `/* Slepá mapa - mapová data. GENEROVÁNO: tools/slepa-mapa/build.mjs (${new Date().toISOString().slice(0, 10)}).
   Mapové podklady: ČÚZK, Data200, CC BY 4.0, zjednodušeno. Sousední státy: Natural Earth (public domain).
   Kraje: hranice krajů ČÚZK Data200 (PolbndRegDA). Řeky: vodní toky ČÚZK Data200 (WatrcrsL), oříznuté na ČR.
   Krajská města: sídla ČÚZK Data200 (BuiltupP). Pohoří: středy ploch pohoří, ČÚZK Data200 (geomorfologické jednotky
   GName5A/6A/7A, vnitřní bod mapshaper -points inner; když je bod blízko krajského města, posunutý uvnitř plochy dál od něj).
   S-JTSK (Křovák) otočený o ${(theta * 180 / Math.PI).toFixed(2)}° tak, aby byl sever nahoře; 1 jednotka = ${(1 / S).toFixed(0)} m.
   Ručně neupravovat. */
// KE KONTROLE - 4. pád (akuzativ) pro zadání "Najdi …":
${all.map(i => `//   ${i.name} -> Najdi ${i.akuzativ}.`).join('\n')}
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, header + 'window.SLEPA_MAPA = ' + JSON.stringify(MAP) + ';\n');

const size = fs.statSync(OUT).size;
console.log('\nKONTROLA');
console.log(`  kraje   ${kraje.length}/14`);
console.log(`  města   ${mesta.length}/13`);
console.log(`  řeky    ${reky.length}/12`);
console.log(`  pohoří  ${pohori.length}/13`);
console.log(`  sousedé ${neighbors.length}/4`);
console.log('  chybí:  ' + (missing.length ? missing.join(', ') : 'nic'));
console.log(`  otočení ${(theta * 180 / Math.PI).toFixed(2)}°, 1 jednotka = ${(1 / S).toFixed(0)} m`);
console.log(`  soubor  ${path.relative(path.join(DIR, '..', '..'), OUT)} ${(size / 1024).toFixed(1)} kB` + (size > 300 * 1024 ? '  PŘEKROČENO 300 kB!' : ''));
console.log('POHOŘÍ - poloha bodu a kontrola proti Wikidatům (CC0):');
console.log(wdReport.join('\n'));
console.log('POHOŘÍ - posun od krajských měst:');
console.log(posun.length ? posun.join('\n') : '  žádný');
console.log(`KONTROLA DVOJIC pohoří - krajské město (min. ${MIN_PX} px při šířce mapy ${PHONE_W} px):`);
console.log(pary.length ? pary.join('\n') : '  všechny dvojice splňují');
if (missing.length || size > 300 * 1024) process.exitCode = 1;
