"""Refresh the slide script from the authoritative Canva PDF export."""
from pathlib import Path
import json
from pypdf import PdfReader

root=Path(__file__).resolve().parents[1]
reader=PdfReader(root/'output/pdf/BACKTRACK_KEIC_2026.pdf')
assert len(reader.pages)==15, 'The pitch must contain exactly 15 slides.'
purposes=[
    'Explain the learner problem and the complete BACKTRACK response on the opening slide.',
    'Show how a broad search can miss a specific earlier obstacle.',
    'Make the full learning sequence easy to follow in four steps.',
    'Show how two wrong answers can point to different starting checks.',
    'Show how a focused Khan segment connects to local practice and the return task.',
    'Make the return concrete with a fresh problem at the original level.',
    'Invite the audience to compare the two wrong turns in the demo.',
    'Explain lasting recovery in plain language.',
    'Show the proposed five-month school sequence.',
    'Compare two practice routines using the same assessments.',
    'Explain how demonstrated knowledge removes unnecessary review.',
    'Show how another destination and educator can reuse the routine.',
    'Make the budget and its priorities readable.',
    'Resolve the opening problem and identify the team.',
    'Provide clickable research sources.',
]
body=['# BACKTRACK: 15-slide pitch deck',
      'The opening states the problem and shows the response: check today’s task, practice a missing skill with Khan Academy, and return with a fresh check. The GPS route connects those actions. The first three slides explain the proposal without depending on a live demo.',
      'The native Canva design is authoritative. This script follows its current PDF export. The 15-slide PDF and editable PowerPoint backup use DM Sans regular and bold. Smooth vector routes, separate editable labels and stops, native comparison cards, and clear separators establish the visual order. Slide 7 is entirely a clickable demo invitation.']
record=[]
for i,(page,purpose) in enumerate(zip(reader.pages,purposes),1):
    text=(page.extract_text() or '').replace('\ufeff','').replace('\u200b','')
    lines=[x.strip() for x in text.splitlines() if x.strip() and x.strip()!=f'{i:02}']
    links=[a.get_object().get('/A',{}).get('/URI') for a in page.get('/Annots',[]) if a.get_object().get('/Subtype')=='/Link']
    links=list(dict.fromkeys(x for x in links if x))
    title='Find the missing skill. Get back to today’s lesson.' if i==1 else 'A route back to today’s lesson.' if i==14 else lines[0]
    body.extend([f'## Slide {i}: {title}',purpose,'### On-slide copy','\n'.join('- '+x for x in lines)])
    if links:body.extend(['### Clickable links','\n'.join('- '+x for x in links)])
    record.append({'page':i,'title':title,'text':text,'links':links})
(root/'docs/PITCH_DECK_15_SLIDES.md').write_text('\n\n'.join(body).rstrip()+'\n',encoding='utf-8')
(root/'.refs').mkdir(exist_ok=True)
(root/'.refs/canva-export-checks.json').write_text(json.dumps({'pages':record},indent=2),encoding='utf-8')
print('Slide script synchronized from the 15-page Canva export.')
