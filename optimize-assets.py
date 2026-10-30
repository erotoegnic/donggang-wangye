from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import hashlib
import json
import re
from fontTools.ttLib import TTFont
from fontTools import subset

root = Path(__file__).resolve().parent
dist = root / 'dist'
assets = dist / 'assets'
source = root / 'font-source' / 'Huninn-Regular.ttf'

class VisibleText(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.parts: list[str] = []
    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in ('script', 'style', 'svg'):
            self.skip += 1
    def handle_endtag(self, tag: str) -> None:
        if tag in ('script', 'style', 'svg'):
            self.skip -= 1
    def handle_data(self, data: str) -> None:
        if not self.skip:
            self.parts.append(data)

pages = {}
for path in sorted(dist.rglob('*.html')):
    html = path.read_text(encoding='utf-8')
    if 'http-equiv="refresh"' in html:
        continue
    parser = VisibleText()
    parser.feed(html)
    dynamic = '距離迎王還有本屆迎王日期已到' if path.name == 'index.html' else ''
    pages[path] = (html, {ord(c) for c in ''.join(parser.parts) + dynamic if not c.isspace()})

with TTFont(source) as original:
    available = set(original.getBestCmap())
frequency = Counter(c for _, chars in pages.values() for c in chars)
common = {c for c, count in frequency.items() if count == len(pages)} | set(range(32, 127))
common &= available
used = set()

def font(chars: set[int]) -> tuple[str, str]:
    codes = sorted(chars & available)
    digest = hashlib.sha256(source.read_bytes() + ','.join(map(str, codes)).encode()).hexdigest()[:16]
    name = 'huninn-' + digest + '.woff2'
    target = assets / name
    if not target.exists():
        with TTFont(source) as f:
            options = subset.Options()
            options.flavor = 'woff2'
            worker = subset.Subsetter(options=options)
            worker.populate(unicodes=codes)
            worker.subset(f)
            f.flavor = 'woff2'
            f.save(target)
    used.add(name)
    ranges = ','.join('U+' + format(c, 'X') for c in codes)
    return name, "@font-face{font-family:Huninn;font-style:normal;font-weight:400;font-display:swap;src:url('/assets/" + name + "') format('woff2');unicode-range:" + ranges + '}'

common_name, common_css = font(common)
shared = {}
for source_name, extension in [('site.css', 'css'), ('site.js', 'js')]:
    data = (root / source_name).read_bytes()
    if source_name == 'site.css':
        data += b'\n' + (root / 'illustrated-art.css').read_bytes()
    name = 'site-' + hashlib.sha256(data).hexdigest()[:16] + '.' + extension
    (assets / name).write_bytes(data)
    used.add(name)
    shared[extension] = '/assets/' + name

metrics = []
for path, (html, chars) in pages.items():
    page_name, page_css = font(chars - common)
    html = re.sub(r'<style>.*?</style>', '<style>' + common_css + page_css + '</style>', html, count=1, flags=re.S)
    html = html.replace('href="/style.css"', 'href="' + shared['css'] + '"')
    html = html.replace('src="/app.js"', 'src="' + shared['js'] + '"')
    html = html.replace('</title>', '</title><link rel="preload" href="/assets/' + common_name + '" as="font" type="font/woff2" crossorigin>', 1)
    path.write_text(html, encoding='utf-8')
    metrics.append({'page':path.relative_to(dist).as_posix(), 'fontBytes':sum((assets / n).stat().st_size for n in (common_name,page_name)), 'fontFiles':[common_name,page_name]})

for pattern in ('huninn-*.woff2', 'site-*.css', 'site-*.js'):
    for path in assets.glob(pattern):
        if path.name not in used:
            path.unlink()
for name in ('style.css','app.js'):
    (dist / name).unlink(missing_ok=True)
(assets / 'fonts.css').unlink(missing_ok=True)
print(json.dumps({'pages':len(pages),'commonFontBytes':(assets/common_name).stat().st_size,'minFontBytes':min(m['fontBytes'] for m in metrics),'maxFontBytes':max(m['fontBytes'] for m in metrics),'unsupportedCharacters':''.join(chr(c) for c in sorted(set(frequency)-available))}))
(root / 'font-manifest.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2),encoding='utf-8')
