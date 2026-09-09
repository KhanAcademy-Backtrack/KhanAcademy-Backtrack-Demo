from pathlib import Path
import json,re,html,hashlib
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,KeepTogether
from reportlab.lib.pagesizes import A4
from pypdf import PdfReader

root=Path(__file__).resolve().parents[1]; out=root/'output'/'pdf';out.mkdir(parents=True,exist_ok=True)
fonts=root/'.refs'/'fonts'
for key,name in [('BT','Regular'),('BTBold','Bold'),('BTSemi','SemiBold')]:pdfmetrics.registerFont(TTFont(key,str(fonts/f'PlusJakartaSans-{name}.ttf')))
pdfmetrics.registerFontFamily('BT',normal='BT',bold='BTBold',italic='BT',boldItalic='BTBold')
ink=colors.HexColor('#151521');muted=colors.HexColor('#505A6B');blue=colors.HexColor('#5753FA');teal=colors.HexColor('#087E70')
styles={
 'title':ParagraphStyle('Title',fontName='BTBold',fontSize=25,leading=32,textColor=ink,spaceAfter=22),
 'h2':ParagraphStyle('H2',fontName='BTBold',fontSize=15,leading=21,textColor=teal,spaceBefore=17,spaceAfter=9,keepWithNext=True),
 'h3':ParagraphStyle('H3',fontName='BTBold',fontSize=12,leading=18,textColor=ink,spaceBefore=12,spaceAfter=6,keepWithNext=True),
 'body':ParagraphStyle('Body',fontName='BT',fontSize=10.5,leading=16.5,textColor=ink,spaceAfter=9,allowWidows=0,allowOrphans=0,splitLongWords=True),
 'field':ParagraphStyle('Field',fontName='BT',fontSize=11.3,leading=18.5,textColor=ink,spaceAfter=13,allowWidows=0,allowOrphans=0),
 'note':ParagraphStyle('Note',fontName='BT',fontSize=9,leading=14,textColor=muted,spaceAfter=12),
 'bullet':ParagraphStyle('Bullet',fontName='BT',fontSize=10.5,leading=16.5,textColor=ink,leftIndent=12,firstLineIndent=-10,spaceAfter=7,allowWidows=0,allowOrphans=0),
}
def clean(t):return t.replace('—',': ').replace('–','-').replace('‑','-').replace('−','-').replace('→',' to ').replace('↗','')
def inline(t):
    t=html.escape(clean(t))
    t=re.sub(r'\[([^\]]+)\]\((https?://[^\s)]+)\)',lambda m:f'<link href="{m[2]}" color="#5753FA">{m[1]}</link>',t)
    t=re.sub(r'(?<!["=])(https?://[^\s<]+)',lambda m:f'<link href="{m[1]}" color="#5753FA">{m[1]}</link>',t)
    t=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',t)
    t=re.sub(r'`([^`]+)`',r'\1',t)
    return t
def footer(c,doc):
    c.setStrokeColor(colors.HexColor('#DFE3EB'));c.line(48,42,A4[0]-48,42)
    c.setFillColor(muted);c.setFont('BT',8);c.drawString(48,28,'BACKTRACK · KEIC 2026');c.drawRightString(A4[0]-48,28,str(doc.page))
def write_doc(filename,title,flow):
    doc=SimpleDocTemplate(str(out/filename),pagesize=A4,rightMargin=48,leftMargin=48,topMargin=50,bottomMargin=58,title=title,author='BACKTRACK · University of the Philippines Manila')
    doc.build(flow,onFirstPage=footer,onLaterPages=footer)
def markdown_pdf(p):
    lines=p.read_text(encoding='utf-8-sig').splitlines();flow=[];buf=[];title=p.stem
    def flush():
        if buf:flow.append(Paragraph(inline(' '.join(buf)),styles['body']));buf.clear()
    for line in lines:
        line=line.strip()
        if not line:flush();continue
        if line.startswith('# '):flush();title=line[2:];flow.append(Paragraph(inline(title),styles['title']))
        elif line.startswith('## '):flush();flow.append(Paragraph(inline(line[3:]),styles['h2']))
        elif line.startswith('### '):flush();flow.append(Paragraph(inline(line[4:]),styles['h3']))
        elif line.startswith('- '):flush();flow.append(Paragraph('- '+inline(line[2:]),styles['bullet']))
        elif re.match(r'^\d+\. ',line):flush();flow.append(Paragraph(inline(line),styles['bullet']))
        else:buf.append(line)
    flush();write_doc(('DECK_BUILD_NOTES' if p.stem=='PITCH_DECK_15_SLIDES' else p.stem)+'.pdf',title,flow)

docs=['SUBMISSION_CHECKLIST','SUBMISSION_COPY','KEIC_WINNING_STRATEGY','COMPETITOR_STRESS_TEST','PITCH_DECK_15_SLIDES','PILOT_IMPLEMENTATION_PLAN','MEASUREMENT_AND_EVALUATION','BUSINESS_AND_SUSTAINABILITY','VALIDATION_BEFORE_SUBMISSION','CLAIMS_AND_SOURCES_LEDGER','PITCH_AND_QA_PREP','THIRD_PARTY_MATERIALS','JUDGE_FINAL_REVIEW']
for name in docs:
    p=root/'docs'/f'{name}.md'
    if p.exists():markdown_pdf(p)

submission=json.loads((root/'docs'/'submission.json').read_text(encoding='utf-8-sig'))
for i,section in enumerate(submission['sections']):
    name=re.sub(r'[^A-Za-z0-9]+','_',section['name']).strip('_')
    wc=len(' '.join(section['paragraphs']).split())
    flow=[Paragraph(inline(section['name']),styles['title']),Paragraph(f'BACKTRACK: Your GPS for Learning<br/>University of the Philippines Manila<br/>{wc} words · Maximum 300 words',styles['note'])]
    flow += [Paragraph(inline(p),styles['field']) for p in section['paragraphs']]
    write_doc(f'ANSWER_{i+1:02}_{name}.pdf',section['name'],flow)

layout=json.loads((root/'.refs'/'deck-build'/'deck-layout.json').read_text(encoding='utf-8'))
deck=out/'BACKTRACK_KEIC_2026.pdf'; c=canvas.Canvas(str(deck),pagesize=(960,540));c.setTitle('BACKTRACK · KEIC 2026');c.setAuthor('University of the Philippines Manila BACKTRACK team')
for slide in layout:
    c.saveState();c.scale(.75,.75)
    for e in slide['elements']:
        typ=e['type']
        if typ=='text':
            c.setFillColor(colors.HexColor(e['color']));c.setFont('BTBold' if e['bold'] else 'BT',e['size'])
            for j,line in enumerate(e['text'].split('\n')):c.drawString(e['x'],720-e['y']-e['size']-j*e['size']*1.22,clean(line))
            if e.get('link'):c.linkURL(e['link'],(e['x'],720-e['y']-e['h'],e['x']+e['w'],720-e['y']),relative=1,thickness=0)
        elif typ=='rect':
            c.setFillColor(colors.HexColor(e['fill']));c.setStrokeColor(colors.HexColor(e['line']) if e['line']!='none' else colors.HexColor(e['fill']));c.rect(e['x'],720-e['y']-e['h'],e['w'],e['h'],fill=1,stroke=int(e['line']!='none'))
        elif typ=='circle':
            c.setFillColor(colors.HexColor(e['fill']));c.setStrokeColor(colors.HexColor(e['line']));c.setLineWidth(2);c.circle(e['x'],720-e['y'],e['r'],fill=1,stroke=1)
        elif typ=='poly':
            c.setStrokeColor(colors.HexColor(e['color']));c.setLineWidth(e['width']);p=c.beginPath();p.moveTo(e['points'][0][0],720-e['points'][0][1]);[p.lineTo(x,720-y) for x,y in e['points'][1:]];c.drawPath(p)
        elif typ=='image':c.drawImage(ImageReader(e['path']),e['x'],720-e['y']-e['h'],width=e['w'],height=e['h'],mask='auto')
    c.restoreState();c.showPage()
c.save()
report=[]
for f in sorted(out.glob('*.pdf')):
    r=PdfReader(str(f));texts=[p.extract_text() or '' for p in r.pages]
    if any(not t.strip() for t in texts):raise RuntimeError('Blank page: '+f.name)
    if f.name.startswith('ANSWER_') and len(r.pages)!=1:raise RuntimeError('Answer should fit one page: '+f.name)
    if f.name=='BACKTRACK_KEIC_2026.pdf' and len(r.pages)!=15:raise RuntimeError('Deck page count')
    report.append({'file':f.name,'pages':len(r.pages),'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
(root/'.refs'/'pdf-manifest.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
