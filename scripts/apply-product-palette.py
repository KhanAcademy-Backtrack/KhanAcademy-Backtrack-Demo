"""Apply the user's September 10 Khan palette to owned UI assets only."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
navy = '#0a2a66'
green = '#14bf96'
colors = {
    '#087e70': navy, '#087c67': navy, '#075e4d': navy,
    '#5753fa': navy, '#403cd9': '#061f4d', '#1865f2': navy,
    '#1555d1': '#061f4d', '#1553c8': navy, '#1a73e8': navy,
    '#151521': navy, '#172a45': navy, '#142644': navy,
    '#173458': navy, '#173724': navy, '#14261a': navy,
    '#213629': navy, '#1c2921': navy, '#25314a': navy,
    '#152e54': navy, '#122b50': navy, '#1a2f51': navy,
    '#7969ef': navy, '#7562dc': navy, '#4e3baa': navy,
    '#f4f0ff': '#e7f9f3', '#f0efff': '#e7f9f3',
    '#f1f0ff': '#e7f9f3', '#eeefff': '#e7f9f3',
    '#edf3ff': '#e7f9f3', '#edf4ff': '#e7f9f3',
    '#edf7f2': '#e7f9f3', '#edf7f1': '#e7f9f3',
    '#f3f8f5': '#e7f9f3', '#f2f8f4': '#e7f9f3',
    '#f5faf7': '#f3fbf8', '#f6faf7': '#f3fbf8',
    '#63aa89': green, '#d5935d': navy,
}
for name in ['src/app/globals.css', 'src/app/study.css']:
    p = root / name
    text = p.read_text(encoding='utf-8')
    text = re.sub(r'#[0-9a-fA-F]{6}\b', lambda m: colors.get(m[0].lower(), m[0]), text)
    p.write_text(text, encoding='utf-8')

art_colors = {
    '#efecff':'#e7f9f3', '#fff2e3':'#0a2a66', '#eaf3fb':'#eef3fa',
    '#443888':navy, '#087e70':navy, '#615090':navy,
    '#94512e':'#ffffff', '#db9861':green, '#4b9e80':green,
    '#d4caee':'#a3d8c9', '#e1d9f2':'#c5e9de', '#d9eee3':green,
    '#ccbee9':'#a3d8c9', '#c1b5e7':green, '#ddb88d':'#92b6bc',
    '#a5cdb6':'#92b6bc', '#e2cbb0':'#506b96',
    '#65829c':navy, '#2678b7':navy, '#567089':navy,
}
p = root / 'src/components/study/PackArtwork.tsx'
text = re.sub(r'#[0-9a-fA-F]{6}\b', lambda m: art_colors.get(m[0].lower(),m[0]),p.read_text(encoding='utf-8'))
# White labels on the navy fraction cover.
text = text.replace('x="186" y="38" fontSize="21" fill="#0a2a66"','x="186" y="38" fontSize="21" fill="#ffffff"')
p.write_text(text,encoding='utf-8')
print('Owned UI colors updated. Official Khan and UP Manila logos unchanged.')
