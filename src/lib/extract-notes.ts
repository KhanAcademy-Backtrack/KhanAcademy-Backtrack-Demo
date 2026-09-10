import {noteSections,type NoteSection} from './study-cards';

export async function extractNotes(file:File):Promise<NoteSection[]>{
  if(file.size>10_000_000)throw Error('Choose notes smaller than 10 MB.');
  if(/\.(txt|md)$/i.test(file.name))return noteSections(await file.text());
  if(!/\.pdf$/i.test(file.name))throw Error('Choose a PDF, text file, or Markdown notes.');
  const pdfjs=await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc='/pdf.worker.min.mjs';
  const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())});
  try{
    const pdf=await task.promise;
    if(pdf.numPages>80)throw Error('Choose a section of up to 80 pages so the pack stays focused.');
    const sections:NoteSection[]=[];
    for(let page=1;page<=pdf.numPages;page++){
      const content=await (await pdf.getPage(page)).getTextContent();
      const text=content.items.map(item=>'str' in item?item.str+('hasEOL' in item&&item.hasEOL?'\n':' '):'').join('');
      for(const part of text.split(/\n\s*\n|(?<=\.)\s+(?=[A-Z])/).filter(x=>x.trim().length>20))sections.push({text:part.trim().slice(0,1200),locator:`Page ${page}`});
      if(sections.length>=100)break;
    }
    if(!sections.length)throw Error('This PDF has no readable text. Paste your notes below instead.');
    return sections.slice(0,100);
  }catch(error){if(error instanceof Error&&error.name==='PasswordException')throw Error('Use an unlocked copy of your notes, or paste the text below.');throw error;}
  finally{await task.destroy();}
}
