# Pomocník pro ruční výběr fotek: pro zadané indexy vypíše kandidáty z Commons a udělá náhledový arch.
import sys, json, urllib.request, urllib.parse, time
sys.argv, idx = sys.argv[:1], [int(x) for x in sys.argv[1:]]
exec(open('build2.py').read().split('rows = [')[0])  # get(), photo(), BAD
s = open('../data.js', encoding='utf-8').read(); data = json.loads(s[s.index('['):s.rindex(']') + 1])
from PIL import Image, ImageDraw
out = {}
for i in idx:
    sp = data[i]; cur = sp['page']
    sr = get(CM, {'action': 'query', 'list': 'search', 'srsearch': sp['l'] + ' filemime:image/jpeg', 'srnamespace': 6, 'srlimit': 25})
    c = []
    for x in sr.get('query', {}).get('search', []):
        r = photo(x['title'][5:])
        if r and r['page'] != cur: c.append(r)
        if len(c) >= 6: break
    out[i] = c
json.dump(out, open('/tmp/cands.json', 'w'))
S = 150; im = Image.new('RGB', (7 * S, len(idx) * (S + 14)), 'white'); d = ImageDraw.Draw(im)
for r, i in enumerate(idx):
    d.text((2, r * (S + 14) + 60), f'{i} {data[i]["n"]}'[:22], fill='black')
    for j, c in enumerate(out[i]):
        u = c['img'].replace('/800px-', '/200px-')
        try:
            time.sleep(0.3); b = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read()
            open('/tmp/c.jpg', 'wb').write(b); t = Image.open('/tmp/c.jpg').convert('RGB'); t.thumbnail((S, S))
            im.paste(t, ((j + 1) * S, r * (S + 14))); d.text(((j + 1) * S + 2, r * (S + 14) + S), str(j), fill='black')
        except Exception as e: pass
im.save('/tmp/cands.png')
