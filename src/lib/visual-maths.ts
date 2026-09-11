/** Original model calculations. Physical lengths/amounts never encode negatives. */
export type MathsKind='brackets'|'factors'|'roots'|'fractions'|'ratios'|'graphs';
export type LabSave={step:number;prediction:string;reflection:string;values:Record<string,number>;static:boolean};
export const freshLab=():LabSave=>({step:0,prediction:'',reflection:'',values:{},static:false});
/* Ranges for every value a guide may save. A key absent here is rejected, so an
 * older save simply restores fewer controls rather than becoming invalid. */
const RANGE:Record<string,[number,number]>={phase:[0,2],shown:[0,1],units:[1,4],elem:[0,5],c0:[1,12],c1:[1,12],c2:[1,12],c3:[1,12],grams:[1,720],amount:[1,4],u:[0,9],accel:[1,6],secs:[1,6],fright:[0,16],fleft:[0,16],kg:[1,8],p:[-12,12],q:[-12,12],x:[-12,12],y:[0,8],testx:[-5,5],signed:[0,1],over:[0,1],abstract:[0,1],repeat:[0,1],scale:[1,6],rate:[-4,4],start:[-6,10],time:[0,5],point:[-100,100]};
export function validLab(x:unknown):x is LabSave{if(!x||typeof x!=='object')return false;const s=x as LabSave;return Number.isInteger(s.step)&&s.step>=0&&s.step<=4&&typeof s.prediction==='string'&&s.prediction.length<=200&&typeof s.reflection==='string'&&s.reflection.length<=1500&&typeof s.static==='boolean'&&!!s.values&&typeof s.values==='object'&&!Array.isArray(s.values)&&Object.keys(s.values).length<=20&&Object.entries(s.values).every(([k,v])=>k==='denom'?[12,24].includes(v):Object.hasOwn(RANGE,k)&&Number.isFinite(v)&&(k==='time'||Number.isInteger(v))&&v>=RANGE[k][0]&&v<=RANGE[k][1])&&((s.values.abstract??0)===1||((s.values.rate??2)>=0&&(s.values.start??6)>=0));}

export function distribution(a:number,b:number,x:number){return {coefficient:a,constant:a*b,original:a*(x+b),incomplete:a*x+b};}
export function partition(n:number,d:number,into:number){if(d<=0||into<=0||!Number.isInteger(into)||into%d!==0)throw Error('Choose a positive common multiple.');return {numerator:n*into/d,denominator:into,amount:n/d};}
export function mixture(a:number,b:number){if(a<0||b<0||a+b===0)throw Error('A mixture needs a positive total and nonnegative parts.');return {total:a+b,share:a/(a+b)};}
export const lineValue=(initial:number,rate:number,time:number)=>initial+rate*time;
