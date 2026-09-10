"""Remove Canva origin identifiers from distributable export metadata."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from io import BytesIO
import sys
from xml.etree import ElementTree as ET
from pypdf import PdfReader,PdfWriter

for argument in sys.argv[1:]:
    path=Path(argument)
    if path.suffix.lower()=='.pptx':
        with ZipFile(path) as archive:parts={n:archive.read(n) for n in archive.namelist()}
        core=ET.fromstring(parts['docProps/core.xml'])
        for element in list(core):
            if element.tag.endswith('}identifier'):core.remove(element)
        parts['docProps/core.xml']=ET.tostring(core,encoding='utf-8',xml_declaration=True)
        with ZipFile(path,'w',ZIP_DEFLATED) as archive:
            for name,data in parts.items():archive.writestr(name,data)
    elif path.suffix.lower()=='.pdf':
        reader=PdfReader(BytesIO(path.read_bytes()))
        before=[p.get_contents().get_data() for p in reader.pages]
        writer=PdfWriter();writer.clone_document_from_reader(reader)
        writer.add_metadata({'/Keywords':''})
        writer.write(path)
        after=PdfReader(path)
        assert before==[p.get_contents().get_data() for p in after.pages], 'Page content changed during metadata cleanup'
    else:raise ValueError('Expected a PDF or PPTX export')
    print('Export metadata cleaned:',path.name)
