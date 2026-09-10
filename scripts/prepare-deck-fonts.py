from pathlib import Path
from urllib.request import urlopen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
root=Path(__file__).resolve().parents[1]
folder=root/'.refs/fonts'
folder.mkdir(parents=True,exist_ok=True)
url='https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/'
variable=folder/'DMSans-variable.ttf'
variable.write_bytes(urlopen(url+'DMSans%5Bopsz%2Cwght%5D.ttf').read())
(folder/'DMSans-OFL.txt').write_bytes(urlopen(url+'OFL.txt').read())
for style,weight in [('Regular',400),('Bold',700)]:
    f=instantiateVariableFont(TTFont(variable),{'wght':weight,'opsz':14},inplace=False)
    for nid,value in [(1,'DM Sans'),(2,style),(4,'DM Sans '+style),(6,'DMSans-'+style),(16,'DM Sans'),(17,style)]:
        f['name'].setName(value,nid,3,1,0x409)
    f['OS/2'].usWeightClass=weight
    f['OS/2'].fsSelection=(f['OS/2'].fsSelection & ~96) | (32 if weight==700 else 64)
    f['head'].macStyle=1 if weight==700 else 0
    f.save(folder/f'DMSans-{style}.ttf')
    print(style,'editable embedding permissions:',f['OS/2'].fsType)
