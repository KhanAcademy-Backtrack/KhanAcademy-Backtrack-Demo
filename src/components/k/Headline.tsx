import {Children,cloneElement,isValidElement,type ReactNode,type ReactElement} from 'react';

// Presentation only: keep authored labels, accessible names and catalog keys intact.
// English connecting words and their common Filipino equivalents stay lowercase
// inside a headline. First/last words, and the first word after a colon, still capitalize.
const connectors=new Set('a an the and but or nor for so yet as at by in of on per to up via vs with from into over than at ng sa ang'.split(' '));
const words=/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu;
const inline=new Set(['span','strong','em','b','i']);
/** Native options cannot contain spans, so their plain labels use the same rule. */
export function headlineText(text:string){
 const total=[...text.matchAll(words)].filter(m=>/\p{L}/u.test(m[0])).length;let index=0;
 return text.replace(words,(word:string,offset:number)=>{
  if(!/\p{L}/u.test(word))return word;
  const lower=index>0&&index<total-1&&connectors.has(word.toLowerCase())&&!/:\s*$/.test(text.slice(0,offset));index++;
  return lower?word.toLowerCase():word[0].toUpperCase()+word.slice(1);
 });
}
function canRead(node:ReactNode){
 return isValidElement<{children?:ReactNode;className?:string;'aria-hidden'?:boolean|string}>(node)&&typeof node.type==='string'&&inline.has(node.type)&&!node.props['aria-hidden']&&!/\b(?:math|math-inline|sr-only)\b/.test(node.props.className??'');
}
export function Headline({children}:{children:ReactNode}){
 const text=(nodes:ReactNode):string=>Children.toArray(nodes).map(n=>typeof n==='string'?n:canRead(n)?text((n as ReactElement<{children?:ReactNode}>).props.children):'').join('');
 const total=[...text(children).matchAll(words)].filter(m=>/\p{L}/u.test(m[0])).length;let index=0;
 const render=(nodes:ReactNode):ReactNode=>Children.map(nodes,node=>{
  if(typeof node==='string'){
   const parts:ReactNode[]=[];let cursor=0;
   for(const match of node.matchAll(words)){
    const start=match.index,word=match[0];parts.push(node.slice(cursor,start));
    const letter=/\p{L}/u.test(word),lower=letter&&index>0&&index<total-1&&connectors.has(word.toLowerCase())&&!/:\s*$/.test(node.slice(0,start));
    parts.push(lower?<span key={start} className="headline-connector">{word}</span>:word);if(letter)index++;cursor=start+word.length;
   }
   parts.push(node.slice(cursor));return parts;
  }
  if(canRead(node)){const element=node as ReactElement<{children?:ReactNode}>;return cloneElement(element,undefined,render(element.props.children));}
  return node;
 });
 return <span className="headline">{render(children)}</span>;
}
