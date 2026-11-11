"""Import the public frontend snapshot, verifying every file before publishing."""
from pathlib import Path
import concurrent.futures, hashlib, json, re, shutil, urllib.request, time
root=Path('site')
marker=root/'.snapshot-20261111'
if marker.exists():
    raise SystemExit(0)
manifest=json.loads(Path('migration/source-manifest.json').read_text())
staging=Path('migration-staging')
staging.mkdir(exist_ok=True)
def fetch(item):
    path=item['path']
    assert not path.startswith('/') and '..' not in Path(path).parts
    url='https://porukambar.ru/'+path
    for attempt in range(3):
        try:
            data=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=90).read()
            if hashlib.sha256(data).hexdigest()!=item['sha256']:
                raise ValueError('Snapshot mismatch: '+path)
            target=staging/path; target.parent.mkdir(parents=True,exist_ok=True); target.write_bytes(data)
            return
        except Exception:
            if attempt==2: raise
            time.sleep(2)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    list(pool.map(fetch,manifest))
for p in staging.glob('*.html'):
    def replace(m):
        url=m[1]
        if url.startswith('//'): return m[0]
        route,sep,frag=url[1:].partition('#')
        if route and not (staging/(route+'.html')).exists(): return m[0]
        return 'href="'+(route+'.html' if route else './')+(sep+frag if sep else '')+'"'
    p.write_text(re.sub(r'href="(/[^\"]*)"',replace,p.read_text()))
(staging/'.nojekyll').write_text('')
(staging/'.snapshot-20261111').write_text('Sites version 47; verified SHA256 manifest.\n')
if root.exists(): shutil.rmtree(root)
staging.rename(root)
print('Imported and verified',len(manifest),'public frontend files')
