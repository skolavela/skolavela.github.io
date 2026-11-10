# Poznáváme přírodu v2: species2.txt -> ../data.js
# Český název: z české Wikipedie (sitelink na Wikidatech podle P225 = vědecké jméno), jinak vlastní.
# Foto: Wikidata P18 / obrázek článku / hledání na Commons; jen fotky (ne kresby) s licencí CC/PD.
import json, re, time, html, sys, urllib.request, urllib.parse
UA = {'User-Agent': 'velappky-priroda/2.0 (https://velappky.cz; skola vela)'}
def get(url, p):
    p = dict(p, format='json', maxlag=5)
    for i in range(6):
        try:
            time.sleep(0.25)
            return json.load(urllib.request.urlopen(urllib.request.Request(url + '?' + urllib.parse.urlencode(p), headers=UA), timeout=40))
        except Exception as e:
            time.sleep(5 * (i + 1))
    return {}
WD = 'https://www.wikidata.org/w/api.php'; CM = 'https://commons.wikimedia.org/w/api.php'
BAD = re.compile(r'k(ö|oe)hler|illustr|thom[eé]|flora|tafel|plate|drawing|herbar|naturalis|specimen|skeleton|skull|map|distribution|range|\.(png|svg|tif|tiff|gif|webm|ogv)$', re.I)
def photo(name):
    if not name or BAD.search(name): return None
    ii = get(CM, {'action': 'query', 'titles': 'File:' + name, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size', 'iiurlwidth': 800})
    try: p = list(ii['query']['pages'].values())[0]; i = p['imageinfo'][0]
    except Exception: return None
    m = i.get('extmetadata', {}); lic = m.get('LicenseShortName', {}).get('value', '')
    if not re.search(r'CC|Public domain|PD', lic, re.I) or 'NC' in lic or 'ND' in lic: return None
    if i.get('width', 0) < 500: return None
    a = re.sub('<[^>]+>', '', html.unescape(m.get('Artist', {}).get('value', ''))).strip() or 'neznámý autor'
    return {'img': i['thumburl'].split('?')[0], 'w': i.get('thumbwidth'), 'h': i.get('thumbheight'), 'page': i['descriptionurl'], 'a': re.sub(r'\s+', ' ', a)[:80], 'lic': lic}
rows = [l.rstrip('\n').split('|') for l in open('species2.txt', encoding='utf-8') if l.strip() and not l.startswith('#')]
out, log = [], open('build2.log', 'w', encoding='utf-8')
for n, (cat, subs, conts, la, lv, cz) in enumerate(rows):
    r = get(WD, {'action': 'query', 'list': 'search', 'srsearch': 'haswbstatement:"P225=' + la + '"', 'srlimit': 3})
    hits = [h['title'] for h in r.get('query', {}).get('search', [])]
    ent = None; csname = None; imgs = []
    if hits:
        e = get(WD, {'action': 'wbgetentities', 'ids': '|'.join(hits), 'props': 'sitelinks|claims|labels', 'languages': 'cs', 'sitefilter': 'cswiki|enwiki'})
        ents = list(e.get('entities', {}).values())
        ents.sort(key=lambda x: -len(x.get('sitelinks', {})))
        if ents:
            ent = ents[0]
            t = ent.get('sitelinks', {}).get('cswiki', {}).get('title') or ent.get('labels', {}).get('cs', {}).get('value')
            if t:
                t = re.sub(r'\s*\(.*\)$', '', t); csname = t[0].lower() + t[1:]
            imgs = [c['mainsnak']['datavalue']['value'] for c in ent.get('claims', {}).get('P18', []) if 'datavalue' in c['mainsnak']]
    name = cz or csname
    if cz and csname and cz.split(' (')[0] != csname: log.write(f'NAME {la}: mine={cz} cswiki={csname}\n')
    if not name: log.write(f'NONAME {la}\n'); print('NONAME', la); continue
    if not cz and csname and not re.search(r'[a-záčďéěíňóřšťúůýž]', csname[1:]): pass
    if csname and csname.lower() == la.lower(): log.write(f'LATINONLY {la}\n')
    rec = None
    for c in imgs:
        rec = photo(c)
        if rec: break
    if not rec:
        sr = get(CM, {'action': 'query', 'list': 'search', 'srsearch': la + ' filemime:image/jpeg', 'srnamespace': 6, 'srlimit': 12})
        for x in sr.get('query', {}).get('search', []):
            rec = photo(x['title'][5:])
            if rec: break
    if not rec: log.write(f'NOPHOTO {la}\n'); print('NOPHOTO', la); continue
    d = {'k': cat, 's': [s for s in subs.split(',') if s], 'c': conts.split(','), 'n': name, 'l': la, 'v': int(lv)}
    d.update(rec); out.append(d)
    if n % 25 == 0: print(n, la, name, flush=True)
log.close()
open('../data.js', 'w', encoding='utf-8').write('// Generováno tools/build2.py – fotografie z Wikimedia Commons (autor a licence u každého snímku).\nwindow.SPECIES = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')).replace('},{', '},\n{') + ';\n')
print('hotovo', len(out), 'z', len(rows))
