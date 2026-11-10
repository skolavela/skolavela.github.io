# Stáhne fotky z Commons, zmenší na 800 px (delší strana), uloží jako WebP do img/ a přepíše data.js na lokální cesty.
import json, re, sys, time, io, urllib.request, unicodedata
from PIL import Image
UA = {'User-Agent': 'velappky-priroda/1.0 (https://velappky.cz; ahoj@skolavela.cz)'}
src = open('data.js', encoding='utf-8').read(); head = src[:src.index('window.SPECIES')]
data = json.loads(src[src.index('['):src.rindex(']') + 1])
def slug(t): return re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode().lower()).strip('-')
only = set(int(x) for x in sys.argv[1:])
for i, s in enumerate(data):
    if only and i not in only: continue
    url = s.get('orig') or s['img']
    if url.startswith('img/'): continue
    fn = f'img/{slug(s["l"])}.webp'
    for k in range(5):
        try:
            b = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read(); break
        except Exception as e:
            print('retry', i, e, file=sys.stderr); time.sleep(5 + 10 * k)
    else: print('FAIL', i, s['n'], url); continue
    im = Image.open(io.BytesIO(b)); im = im.convert('RGB'); im.thumbnail((800, 800), Image.LANCZOS)
    im.save(fn, 'WEBP', quality=78, method=6)
    s['orig'] = url; s['img'] = fn; s['w'], s['h'] = im.size
    print('OK', i, s['n'], fn, flush=True); time.sleep(0.4)
open('data.js', 'w', encoding='utf-8').write(head + 'window.SPECIES = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('},{', '},\n{') + ';\n')
