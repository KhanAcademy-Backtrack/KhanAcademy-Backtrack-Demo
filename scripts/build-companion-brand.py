from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
import cairosvg
r=Path(__file__).resolve().parents[1]
mark='<path d="M15 10Q15 5 20 5H41L51 15V55Q51 59 47 56L33 48 19 56Q15 59 15 54Z" fill="#14bf96"/><path d="M41 5V16H51" fill="#96e6d2"/><circle cx="26" cy="27" r="2.6" fill="#0a2a66"/><circle cx="40" cy="27" r="2.6" fill="#0a2a66"/><path d="M26 36C29 43 39 43 42 36" fill="none" stroke="#0a2a66" stroke-width="2.4" stroke-linecap="round"/>'
font=TTFont(r/'output/Fonts/DMSans-Bold.ttf');glyphs=font.getGlyphSet();cmap=font.getBestCmap();scale=45/font['head'].unitsPerEm;x=66;paths=[]
for char in 'dunlo':
 name=cmap[ord(char)];pen=SVGPathPen(glyphs);glyphs[name].draw(pen);paths.append(f'<path d="{pen.getCommands()}" transform="translate({x:.3f} 46) scale({scale:.6f} {-scale:.6f})"/>');x+=glyphs[name].width*scale-.4
logo=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {round(x+5)} 64"><title>Dunlo</title>{mark}<g fill="#0a2a66">'+''.join(paths)+'</g></svg>'
icon=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>Dunlo</title><rect width="64" height="64" rx="13" fill="#ffffff"/>{mark}</svg>'
for folder in [r/'public',r/'output/deck-assets']:
 (folder/'dunlo-logo.svg').write_text(logo,encoding='utf-8');(folder/'dunlo-mark.svg').write_text(icon,encoding='utf-8')
(r/'public/favicon.svg').write_text(icon,encoding='utf-8')
for n in [16,32,180]:cairosvg.svg2png(bytestring=icon.encode(),write_to=str(r/f'public/dunlo-icon-{n}.png'),output_width=n,output_height=n)
cairosvg.svg2png(bytestring=logo.encode(),write_to=str(r/'output/deck-assets/dunlo-logo.png'),output_width=round(x+5)*3,output_height=192)
print('Dunlo identity assets built; legacy BACKTRACK assets preserved.')
