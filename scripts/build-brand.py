"""Build BACKTRACK's original route monogram and outlined DM Sans wordmark."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
import cairosvg

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'output/deck-assets'
MARK = '''<g fill="none" stroke="#087e70" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V41C14 50 48 51 48 36C48 23 31 23 24 30"/><path d="M24 21V30H33"/></g>'''
font = TTFont(ROOT/'output/Fonts/DMSans-Bold.ttf')
glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
scale, x, parts = 46/font['head'].unitsPerEm, 74, []
for char in 'backtrack':
    name = cmap[ord(char)]
    pen = SVGPathPen(glyphs)
    glyphs[name].draw(pen)
    parts.append(f'<path d="{pen.getCommands()}" transform="translate({x:.3f} 48) scale({scale:.6f} {-scale:.6f})"/>')
    x += glyphs[name].width * scale - .5
width = round(x + 3)
logo = f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="64" viewBox="0 0 {width} 64"><title>BACKTRACK</title>{MARK}<g fill="#087e70">'+''.join(parts)+'</g></svg>'
mark = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>BACKTRACK return route</title>{MARK}</svg>'
for path in [ASSETS/'backtrack-route-logo.svg', ROOT/'public/backtrack-logo.svg']:
    path.write_text(logo, encoding='utf-8')
(ASSETS/'backtrack-route-mark.svg').write_text(mark, encoding='utf-8')
icon = mark.replace('<title>', '<rect width="64" height="64" rx="13" fill="#e6f5ef"/><title>', 1)
(ROOT/'public/favicon.svg').write_text(icon, encoding='utf-8')
cairosvg.svg2png(bytestring=logo.encode(),write_to=str(ASSETS/'backtrack-route-logo.png'),output_width=width*3,output_height=192)
for size in [16,32,180]:
    cairosvg.svg2png(bytestring=icon.encode(),write_to=str(ROOT/f'public/backtrack-icon-{size}.png'),output_width=size,output_height=size)
print(f'Original route-b logo: {width} × 64; green #087e70. Small icons: 16, 32, 180 px.')
