import fs from 'node:fs';
import path from 'node:path';
import { slides } from './deck-content.mjs';
const root=path.resolve(import.meta.dirname,'..');
if(slides.length!==15)throw Error('Deck must be 15 slides including sources.');
fs.writeFileSync(path.join(root,'docs/PITCH_DECK_15_SLIDES.md'),'# BACKTRACK: 15-slide pitch deck\n\nExactly 15 slides including cover and sources. The final PDF must include the verified separate deployment link on slides 1, 4 and 14. Main style: predominantly white, one interface typeface, violet actions and teal routes, matching the final website.\n\n'+slides.map((s,i)=>`## Slide ${i+1}: ${s.title.replaceAll('\n',' ')}\n\n### Exact on-slide copy\n\n${[s.title.replaceAll('\n',' '),...s.copy].map(x=>'- '+x).join('\n')}\n\n### Key visual\n\n${s.visual}\n\n### Evidence or source\n\n${s.source}\n\n### Purpose\n\n${s.purpose}\n\n### Keep out\n\n${s.avoid}`).join('\n\n'));
