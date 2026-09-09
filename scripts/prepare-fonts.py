from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
root=Path(__file__).resolve().parents[1]
out=root/'.refs'/'fonts'; out.mkdir(parents=True,exist_ok=True)
for p in (root/'.next'/'static'/'media').glob('*.woff2'):
    font=TTFont(p)
    family=next((n.toUnicode() for n in font['name'].names if n.nameID==1),'')
    if 'Plus Jakarta Sans' not in family: continue
    cmap=font.getBestCmap()
    if not all(ord(c) in cmap for c in 'ABCabc012'): continue
    for weight,name in [(400,'Regular'),(600,'SemiBold'),(700,'Bold')]:
        f=TTFont(p)
        if 'fvar' in f: f=instantiateVariableFont(f,{'wght':weight},inplace=True)
        f.flavor=None
        f['OS/2'].usWeightClass=weight
        f['OS/2'].fsSelection=(f['OS/2'].fsSelection & ~0x60) | (0x20 if weight==700 else 0x40)
        f['head'].macStyle=(f['head'].macStyle & ~3) | (1 if weight==700 else 0)
        for n in f['name'].names:
            if n.nameID in [1,2,4,6]:
                text={1:'Plus Jakarta Sans',2:name,4:'Plus Jakarta Sans '+name,6:'PlusJakartaSans-'+name}[n.nameID]
                n.string=text.encode(n.getEncoding())
        f.save(out/('PlusJakartaSans-'+name+'.ttf'))
    print('Prepared Plus Jakarta Sans fonts from the website build.')
    break
else: raise RuntimeError('Website font not found')
