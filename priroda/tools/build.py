# Sestaví ../data.js: pro každý druh najde fotografii z Wikimedia Commons (přes Wikipedii) a uloží autora + licenci.
import json, re, time, urllib.request, urllib.parse, html
UA = {'User-Agent': 'skolavela.app-priroda/1.0 (https://skolavela.app)'}
def get(url, params):
    u = url + '?' + urllib.parse.urlencode(params)
    for i in range(4):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30))
        except Exception as e:
            time.sleep(2 + i * 3)
    raise SystemExit('fail ' + u)
rows = [l.strip().split('|') for l in open('species.txt', encoding='utf-8') if l.strip() and not l.startswith('#')]
out = []
for cat, cz, la, lvl in rows:
    rec = None
    for wiki, title in (('cs', cz.split(' (')[0]), ('en', la)):
        r = get(f'https://{wiki}.wikipedia.org/w/api.php', {'action': 'query', 'titles': title if wiki == 'en' else la, 'redirects': 1, 'prop': 'pageimages', 'piprop': 'name', 'format': 'json'})
        pages = list(r['query']['pages'].values())
        name = pages[0].get('pageimage') if pages else None
        if not name: continue
        ii = get('https://commons.wikimedia.org/w/api.php', {'action': 'query', 'titles': 'File:' + name, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 640, 'format': 'json'})
        p = list(ii['query']['pages'].values())[0]
        if 'imageinfo' not in p: continue
        info = p['imageinfo'][0]; m = info.get('extmetadata', {})
        lic = m.get('LicenseShortName', {}).get('value', '')
        if not re.search(r'CC|Public domain|PD', lic, re.I): continue
        if name.lower().endswith(('.svg', '.png', '.gif', '.tif', '.tiff')): continue
        artist = re.sub('<[^>]+>', '', html.unescape(m.get('Artist', {}).get('value', ''))).strip() or 'neznámý autor'
        rec = {'k': cat, 'n': cz, 'l': la, 'v': int(lvl), 'img': info['thumburl'], 'page': info['descriptionurl'], 'a': artist[:80], 'lic': lic}
        break
    print(('OK ' if rec else 'MISSING ') + cz, rec and rec['img'][-60:])
    if rec: out.append(rec)
    time.sleep(0.3)
open('../data.js', 'w', encoding='utf-8').write('// Generováno tools/build.py – fotografie z Wikimedia Commons (licence u každého snímku).\nwindow.SPECIES = ' + json.dumps(out, ensure_ascii=False, indent=0) + ';\n')
print(len(out), 'of', len(rows))
