"""Embed editable TrueType fonts as EOT Font Parts in an Artifact Tool PPTX.
Format: W3C Embedded OpenType 0x00020001; PowerPoint Font Part per MS-OI29500.
No glyph subsetting or font-permission modification is performed here.
"""
from pathlib import Path
import sys,struct,zipfile,json,hashlib,io
from fontTools.ttLib import TTFont
from lxml import etree as ET
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]);dest=Path(sys.argv[2])
P='http://schemas.openxmlformats.org/presentationml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG='http://schemas.openxmlformats.org/package/2006/relationships'
CT='http://schemas.openxmlformats.org/package/2006/content-types'
def u32(n):return struct.pack('<I',n)
def u16(n):return struct.pack('<H',n)
def name(font,id):
    names=[n for n in font['name'].names if n.nameID==id]
    return next((n.toUnicode() for n in names if n.platformID==3 and n.langID==0x409),names[0].toUnicode())
def eot(file):
    data=file.read_bytes();font=TTFont(file);os=font['OS/2'];head=font['head']
    if os.fsType & 0x0002 or os.fsType & 0x0004:raise RuntimeError('Font does not permit editable embedding')
    fields=['bFamilyType','bSerifStyle','bWeight','bProportion','bContrast','bStrokeVariation','bArmStyle','bLetterForm','bMidline','bXHeight']
    b=bytearray(u32(0)+u32(len(data))+u32(0x00020001)+u32(0))
    b+=bytes(getattr(os.panose,k) for k in fields)+bytes([1,os.fsSelection & 1])
    b+=u32(os.usWeightClass)+u16(os.fsType)+u16(0x504c)
    for k in ['ulUnicodeRange1','ulUnicodeRange2','ulUnicodeRange3','ulUnicodeRange4','ulCodePageRange1','ulCodePageRange2']:b+=u32(getattr(os,k,0))
    b+=u32(head.checkSumAdjustment)+u32(0)*4
    for id in [1,2,5,4]:
        text=name(font,id).encode('utf-16le');b+=u16(0)+u16(len(text))+text
    b+=u16(0)+u16(0) # Version 2.1 Padding5 and unrestricted RootString (OFL).
    b+=data;struct.pack_into('<I',b,0,len(b))
    assert struct.unpack_from('<H',b,34)[0]==0x504c
    assert b[-len(data):]==data
    assert all(ord(c) in font.getBestCmap() for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
    return bytes(b),{'family':name(font,1),'style':name(font,2),'weight':os.usWeightClass,'fsType':os.fsType,'fontBytes':len(data),'eotBytes':len(b),'fontSha256':hashlib.sha256(data).hexdigest()}
with zipfile.ZipFile(source) as z:parts={n:z.read(n) for n in z.namelist()}
before_slides={n:b for n,b in parts.items() if n.startswith('ppt/slides/')}
presentation=ET.fromstring(parts['ppt/presentation.xml']);presentation.set('embedTrueTypeFonts','1');presentation.set('saveSubsetFonts','0')
old=presentation.find(f'{{{P}}}embeddedFontLst')
if old is not None:presentation.remove(old)
font_list=ET.Element(f'{{{P}}}embeddedFontLst')
font=ET.SubElement(font_list,f'{{{P}}}embeddedFont');ET.SubElement(font,f'{{{P}}}font',typeface='Plus Jakarta Sans',pitchFamily='34',charset='0')
rels=ET.fromstring(parts['ppt/_rels/presentation.xml.rels']);types=ET.fromstring(parts['[Content_Types].xml'])
if not any(x.get('Extension')=='fntdata' for x in types):ET.SubElement(types,f'{{{CT}}}Default',Extension='fntdata',ContentType='application/x-fontdata')
report=[]
for i,(role,style) in enumerate([('regular','Regular'),('bold','Bold')],1):
    data,info=eot(root/'.refs'/'fonts'/f'PlusJakartaSans-{style}.ttf');rid=f'rIdBacktrackFont{i}';part=f'ppt/fonts/font{i}.fntdata'
    parts[part]=data;ET.SubElement(rels,f'{{{PKG}}}Relationship',Id=rid,Type=R+'/font',Target=f'fonts/font{i}.fntdata');ET.SubElement(font,f'{{{P}}}{role}',{f'{{{R}}}id':rid});report.append({**info,'part':part})
after={'custShowLst','photoAlbum','custDataLst','kinsoku','defaultTextStyle','modifyVerifier','extLst'}
index=next((i for i,e in enumerate(presentation) if ET.QName(e).localname in after),len(presentation));presentation.insert(index,font_list)
for n,xml in [('ppt/presentation.xml',presentation),('ppt/_rels/presentation.xml.rels',rels),('[Content_Types].xml',types)]:parts[n]=ET.tostring(xml,encoding='UTF-8',xml_declaration=True,standalone=True)
with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as z:
    for n,b in parts.items():z.writestr(n,b)
with zipfile.ZipFile(dest) as z:
    assert len([n for n in z.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml')])==15
    for n,b in before_slides.items():assert z.read(n)==b, 'Slide content changed during font embedding'
    for e in report:
        data=z.read(e['part']);assert struct.unpack_from('<I',data,0)[0]==len(data)
        n=struct.unpack_from('<I',data,4)[0];f=TTFont(io.BytesIO(data[-n:]));assert name(f,1)==e['family'];assert hashlib.sha256(data[-n:]).hexdigest()==e['fontSha256']
(root/'.refs'/'deck-build'/'embedded-fonts.json').write_text(json.dumps({'editable':True,'saveSubsetFonts':False,'slideTextUnchanged':True,'fonts':report},indent=2),encoding='utf-8')
print(json.dumps({'embeddedFonts':report,'output':str(dest)},indent=2))
