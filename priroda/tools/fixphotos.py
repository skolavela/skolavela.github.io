# Nahradí kreslené ilustrace fotografiemi (Wikidata P18, jinak hledání na Commons).
import json, re, sys, time, html, urllib.request, urllib.parse
sys.path.insert(0, '.')
UA = {'User-Agent': 'skolavela.app-priroda/1.0 (https://skolavela.app)'}
def get(url, p):
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url + '?' + urllib.parse.urlencode(p), headers=UA), timeout=30))
        except Exception: time.sleep(3 + 3 * i)
BAD = re.compile(r'k(ö|oe)hler|illustr|thom[eé]|flora|tafel|plate|drawing|herbar|\.(png|svg|tif)', re.I)
src = open('../data.js', encoding='utf-8').read()
data = json.loads(src[src.index('['):src.rindex(']') + 1])
extra = set(sys.argv[1:])
def info(name):
    ii = get('https://commons.wikimedia.org/w/api.php', {'action': 'query', 'titles': 'File:' + name, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 640, 'format': 'json'})
    p = list(ii['query']['pages'].values())[0]
    if 'imageinfo' not in p: return None
    i = p['imageinfo'][0]; m = i.get('extmetadata', {}); lic = m.get('LicenseShortName', {}).get('value', '')
    if not re.search(r'CC|Public domain|PD', lic, re.I): return None
    a = re.sub('<[^>]+>', '', html.unescape(m.get('Artist', {}).get('value', ''))).strip() or 'neznámý autor'
    return {'img': i['thumburl'], 'page': i['descriptionurl'], 'a': a[:80], 'lic': lic}
for s in data:
    fname = urllib.parse.unquote(s['page'].split('File:')[1])
    if not (BAD.search(fname) or s['n'] in extra): continue
    cands = []
    r = get('https://en.wikipedia.org/w/api.php', {'action': 'query', 'titles': s['l'], 'redirects': 1, 'prop': 'pageprops', 'format': 'json'})
    qid = list(r['query']['pages'].values())[0].get('pageprops', {}).get('wikibase_item')
    if qid:
        w = get('https://www.wikidata.org/w/api.php', {'action': 'wbgetclaims', 'entity': qid, 'property': 'P18', 'format': 'json'})
        cands += [c['mainsnak']['datavalue']['value'] for c in w.get('claims', {}).get('P18', [])]
    sr = get('https://commons.wikimedia.org/w/api.php', {'action': 'query', 'list': 'search', 'srsearch': s['l'] + ' filemime:image/jpeg', 'srnamespace': 6, 'srlimit': 15, 'format': 'json'})
    cands += [x['title'][5:] for x in sr['query']['search']]
    for c in cands:
        if BAD.search(c) or c == fname: continue
        rec = info(c)
        if rec: s.update(rec); print('FIX', s['n'], '->', c); break
    else: print('KEEP', s['n'])
open('../data.js', 'w', encoding='utf-8').write('// Generováno tools/build.py + tools/fixphotos.py – fotografie z Wikimedia Commons (licence u každého snímku).\nwindow.SPECIES = ' + json.dumps(data, ensure_ascii=False, indent=0) + ';\n')
