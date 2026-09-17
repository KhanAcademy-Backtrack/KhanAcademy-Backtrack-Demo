from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
r=Path(__file__).resolve().parents[1]
mark='<path d="M15 10Q15 5 20 5H41L51 15V55Q51 59 47 56L33 48 19 56Q15 59 15 54Z" fill="#14bf96"/><path d="M41 5V16H51" fill="#96e6d2"/><circle cx="26" cy="27" r="2.6" fill="#0a2a66"/><circle cx="40" cy="27" r="2.6" fill="#0a2a66"/><path d="M26 36C29 43 39 43 42 36" fill="none" stroke="#0a2a66" stroke-width="2.4" stroke-linecap="round"/>'
font=TTFont(r/'output/Fonts/DMSans-Bold.ttf');glyphs=font.getGlyphSet();cmap=font.getBestCmap();scale=45/font['head'].unitsPerEm;x=66;paths=[]
for char in 'Khanpanion':
 name=cmap[ord(char)];pen=SVGPathPen(glyphs);glyphs[name].draw(pen);paths.append(f'<path d="{pen.getCommands()}" transform="translate({x:.3f} 46) scale({scale:.6f} {-scale:.6f})"/>');x+=glyphs[name].width*scale-.4
logo=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {round(x+5)} 64"><title>Khanpanion</title>{mark}<g fill="#0a2a66">'+''.join(paths)+'</g></svg>'
icon=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>Khanpanion</title><rect width="64" height="64" rx="13" fill="#ffffff"/>{mark}</svg>'
# Site assets only. Deck assets in output/ are maintained separately with the slides.
(r/'public/khanpanion-logo.svg').write_text(logo,encoding='utf-8');(r/'public/khanpanion-mark.svg').write_text(icon,encoding='utf-8')
(r/'public/favicon.svg').write_text(icon,encoding='utf-8')
try:
 import cairosvg
 for n in [16,32,180]:cairosvg.svg2png(bytestring=icon.encode(),write_to=str(r/f'public/khanpanion-icon-{n}.png'),output_width=n,output_height=n)
except OSError:print('Cairo is unavailable; PNG icons were not rebuilt. The bookmark mark is unchanged, so the existing PNGs stay valid.')
print(f'Khanpanion identity assets built ({round(x+5)}x64); legacy Dunlo and BACKTRACK assets preserved.')
