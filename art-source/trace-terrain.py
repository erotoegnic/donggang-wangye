from pathlib import Path
from typing import Final
import re
from PIL import Image
import vtracer

ROOT: Final = Path(__file__).resolve().parents[1]
with Image.open(ROOT / 'art-source/donggang-original-map.jpg') as original:
    normalized = original.convert('RGBA').resize((1694, 1504), Image.Resampling.LANCZOS)
    terrain = normalized.crop((211, 212, 1482, 1293))
    pixels = list(terrain.get_flattened_data())
    svg = vtracer.convert_pixels_to_svg(pixels, terrain.size, colormode='color',
        hierarchical='stacked', mode='spline', filter_speckle=2, color_precision=6,
        layer_difference=12, corner_threshold=60, length_threshold=2.5,
        max_iterations=10, splice_threshold=45, path_precision=1)
svg = re.sub(r'<svg\b', '<svg viewBox="0 0 1271 1081"', svg, count=1)
(ROOT / 'art-source/original-terrain.svg').write_text(svg, encoding='utf-8')
print(f'Terrain vector: {len(svg)} bytes, {svg.count("<path")} paths')
