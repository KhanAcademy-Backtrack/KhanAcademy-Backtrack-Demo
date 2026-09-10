import type {Problem,Skill,Topic,AnswerField} from './recovery.ts';

/* ==========================================================================
   Reviewed science constants and item families.

   ROUNDING AND SIGNIFICANT-FIGURES POLICY (one policy, applied everywhere):

   1. Relative atomic masses below are the IUPAC abridged standard atomic
      weights, rounded to three decimal places as published. They are the only
      atomic-mass source in this product.
   2. A formula mass is the sum of those values, rounded to 2 decimal places.
   3. Every quantity derived from a formula mass is computed from the ROUNDED
      formula mass, then rounded to the number of decimal places the problem
      declares. A learner who uses the same table therefore reproduces the
      printed answer exactly, with no hidden precision.
   4. When a problem declares `decimals`, the prompt says so in words, and the
      checker accepts anything within one unit of the last required decimal
      place (`tolerance = 10^-decimals`). Answers that are exact integers carry
      no tolerance and are compared exactly.

   Every value here is authored and reviewed by us. Nothing is fetched, and no
   generative model is involved at runtime.
   ========================================================================== */

/** IUPAC abridged standard atomic weights (2021), as published. */
export const ATOMIC_MASS:Record<string,number>={H:1.008,C:12.011,N:14.007,O:15.999,Na:22.990,Mg:24.305,S:32.06,Cl:35.45,K:39.098,Ca:40.078,Fe:55.845,Cu:63.546,Zn:65.38};
export const ELEMENT_NAMES:Record<string,string>={H:'hydrogen',C:'carbon',N:'nitrogen',O:'oxygen',Na:'sodium',Mg:'magnesium',S:'sulfur',Cl:'chlorine',K:'potassium',Ca:'calcium',Fe:'iron',Cu:'copper',Zn:'zinc'};

export type Composition=Record<string,number>;
/** `plain` is screen text, `latex` is typeset notation, `speak` is the authored spoken form. */
export type Species={plain:string;latex:string;speak:string;parts:Composition};

export const round=(value:number,decimals:number)=>Math.round(value*10**decimals)/10**decimals;
export const formulaMass=(parts:Composition)=>round(Object.entries(parts).reduce((sum,[el,n])=>sum+ATOMIC_MASS[el]*n,0),2);
/** Accept an answer within one unit of the last required decimal place. */
export const toleranceFor=(decimals:number)=>10**-decimals;

const s=(plain:string,latex:string,speak:string,parts:Composition):Species=>({plain,latex,speak,parts});

/** Twelve reviewed compounds. Order is fixed: it is part of the item sequence. */
export const COMPOUNDS:Species[]=[
 s('H₂O','\\mathrm{H_{2}O}','H 2 O',{H:2,O:1}),
 s('CO₂','\\mathrm{CO_{2}}','C O 2',{C:1,O:2}),
 s('NaCl','\\mathrm{NaCl}','Na Cl',{Na:1,Cl:1}),
 s('CH₄','\\mathrm{CH_{4}}','C H 4',{C:1,H:4}),
 s('NH₃','\\mathrm{NH_{3}}','N H 3',{N:1,H:3}),
 s('H₂SO₄','\\mathrm{H_{2}SO_{4}}','H 2 S O 4',{H:2,S:1,O:4}),
 s('CaCO₃','\\mathrm{CaCO_{3}}','Ca C O 3',{Ca:1,C:1,O:3}),
 s('C₆H₁₂O₆','\\mathrm{C_{6}H_{12}O_{6}}','C 6 H 12 O 6',{C:6,H:12,O:6}),
 s('MgCl₂','\\mathrm{MgCl_{2}}','Mg Cl 2',{Mg:1,Cl:2}),
 s('KNO₃','\\mathrm{KNO_{3}}','K N O 3',{K:1,N:1,O:3}),
 s('Na₂CO₃','\\mathrm{Na_{2}CO_{3}}','Na 2 C O 3',{Na:2,C:1,O:3}),
 s('HNO₃','\\mathrm{HNO_{3}}','H N O 3',{H:1,N:1,O:3}),
];

const SP:Record<string,Species>={
 CH4:COMPOUNDS[3],CO2:COMPOUNDS[1],H2O:COMPOUNDS[0],NaCl:COMPOUNDS[2],H2SO4:COMPOUNDS[5],
 O2:s('O₂','\\mathrm{O_{2}}','O 2',{O:2}),
 C3H8:s('C₃H₈','\\mathrm{C_{3}H_{8}}','C 3 H 8',{C:3,H:8}),
 C2H6:s('C₂H₆','\\mathrm{C_{2}H_{6}}','C 2 H 6',{C:2,H:6}),
 C2H4:s('C₂H₄','\\mathrm{C_{2}H_{4}}','C 2 H 4',{C:2,H:4}),
 Zn:s('Zn','\\mathrm{Zn}','Zn',{Zn:1}),
 HCl:s('HCl','\\mathrm{HCl}','H Cl',{H:1,Cl:1}),
 ZnCl2:s('ZnCl₂','\\mathrm{ZnCl_{2}}','Zn Cl 2',{Zn:1,Cl:2}),
 H2:s('H₂','\\mathrm{H_{2}}','H 2',{H:2}),
 Mg:s('Mg','\\mathrm{Mg}','Mg',{Mg:1}),
 MgCl2:COMPOUNDS[8],
 NaOH:s('NaOH','\\mathrm{NaOH}','Na O H',{Na:1,O:1,H:1}),
 Na2SO4:s('Na₂SO₄','\\mathrm{Na_{2}SO_{4}}','Na 2 S O 4',{Na:2,S:1,O:4}),
 CuO:s('CuO','\\mathrm{CuO}','Cu O',{Cu:1,O:1}),
 Cu:s('Cu','\\mathrm{Cu}','Cu',{Cu:1}),
 Fe2O3:s('Fe₂O₃','\\mathrm{Fe_{2}O_{3}}','Fe 2 O 3',{Fe:2,O:3}),
 CO:s('CO','\\mathrm{CO}','C O',{C:1,O:1}),
 Fe:s('Fe','\\mathrm{Fe}','Fe',{Fe:1}),
 H2S:s('H₂S','\\mathrm{H_{2}S}','H 2 S',{H:2,S:1}),
 SO2:s('SO₂','\\mathrm{SO_{2}}','S O 2',{S:1,O:2}),
 KOH:s('KOH','\\mathrm{KOH}','K O H',{K:1,O:1,H:1}),
 K2SO4:s('K₂SO₄','\\mathrm{K_{2}SO_{4}}','K 2 S O 4',{K:2,S:1,O:4}),
};

/** Reviewed balanced skeletons. `reactants` is how many leading species sit left of the arrow. */
export type Equation={species:Species[];coefficients:number[];reactants:number};
const eq=(reactants:number,pairs:[Species,number][]):Equation=>({species:pairs.map(p=>p[0]),coefficients:pairs.map(p=>p[1]),reactants});
export const EQUATIONS:Equation[]=[
 eq(2,[[SP.CH4,1],[SP.O2,2],[SP.CO2,1],[SP.H2O,2]]),
 eq(2,[[SP.C3H8,1],[SP.O2,5],[SP.CO2,3],[SP.H2O,4]]),
 eq(2,[[SP.C2H6,2],[SP.O2,7],[SP.CO2,4],[SP.H2O,6]]),
 eq(2,[[SP.C2H4,1],[SP.O2,3],[SP.CO2,2],[SP.H2O,2]]),
 eq(2,[[SP.Zn,1],[SP.HCl,2],[SP.ZnCl2,1],[SP.H2,1]]),
 eq(2,[[SP.Mg,1],[SP.HCl,2],[SP.MgCl2,1],[SP.H2,1]]),
 eq(2,[[SP.NaOH,2],[SP.H2SO4,1],[SP.Na2SO4,1],[SP.H2O,2]]),
 eq(2,[[SP.NaOH,1],[SP.HCl,1],[SP.NaCl,1],[SP.H2O,1]]),
 eq(2,[[SP.CuO,1],[SP.H2,1],[SP.Cu,1],[SP.H2O,1]]),
 eq(2,[[SP.Fe2O3,1],[SP.CO,3],[SP.Fe,2],[SP.CO2,3]]),
 eq(2,[[SP.H2S,2],[SP.O2,3],[SP.SO2,2],[SP.H2O,2]]),
 eq(2,[[SP.H2SO4,1],[SP.KOH,2],[SP.K2SO4,1],[SP.H2O,2]]),
];

/** "minus 1 newton", not "minus 1 newtons". */
const spokenNewtons=(n:number)=>`${n<0?'minus ':''}${Math.abs(n)} newton${Math.abs(n)===1?'':'s'}`;
/** Render a signed quantity with a typographic minus, never a hyphen. */
export const signed=(n:number)=>n<0?`−${Math.abs(n)}`:`${n}`;
const num=(field:string,unit?:string):AnswerField=>({label:field,kind:'number',unit});

function atomCount(v:number,id:string):Problem{
 const c=COMPOUNDS[v%COMPOUNDS.length],k=1+Math.floor(v/COMPOUNDS.length)%20;
 const elements=Object.keys(c.parts),el=elements[v%elements.length],per=c.parts[el],name=ELEMENT_NAMES[el];
 return {id,expression:`${k}\\,${c.latex}`,speak:`${k} ${c.speak}`,
  prompt:`How many ${name} atoms are in ${k} formula units of ${c.plain}?`,
  labels:[`${name.charAt(0).toUpperCase()+name.slice(1)} atoms`],fields:[num(`${name.charAt(0).toUpperCase()+name.slice(1)} atoms`)],expected:[k*per],
  hint:`A subscript counts atoms inside one unit, and the number in front counts the units. One ${c.plain} unit holds ${per} ${name} atom${per===1?'':'s'}.`,
  explanation:`The subscript and the coefficient do different jobs. The subscript ${per} belongs to ${name} inside one ${c.plain} unit; the coefficient ${k} says how many of those units there are. Changing either one changes the substance or the amount, so they multiply: ${k} × ${per} = ${k*per} ${name} atoms.`};
}

function formulaMassItem(v:number,id:string):Problem{
 const c=COMPOUNDS[v%COMPOUNDS.length],n=1+Math.floor(v/COMPOUNDS.length)%20,M=formulaMass(c.parts);
 const table=Object.keys(c.parts).map(el=>`${el} = ${ATOMIC_MASS[el]}`).join(', ');
 return {id,expression:`${n}\\,\\mathrm{mol}\\,${c.latex}`,speak:`${n} moles of ${c.speak}`,
  prompt:`What is the mass of ${n} mol of ${c.plain}? Relative atomic masses: ${table}. Give your answer in grams to 2 decimal places.`,
  labels:['Mass'],fields:[num('Mass','g')],expected:[round(n*M,2)],decimals:2,tolerance:toleranceFor(2),
  hint:`A formula mass counts every atom in one unit. Add each element's mass times its subscript to get the mass of one mole, then scale by ${n}.`,
  explanation:`One mole of ${c.plain} is every atom in the formula counted once: ${Object.entries(c.parts).map(([el,q])=>`${q} × ${ATOMIC_MASS[el]}`).join(' + ')} = ${M} g/mol. Mass is proportional to amount, so ${n} mol has ${n} × ${M} = ${round(n*M,2)} g. Adding instead of multiplying would treat the amount as an extra substance.`};
}

function molesGoal(v:number,id:string):Problem{
 const c=COMPOUNDS[v%COMPOUNDS.length],mass=10+5*(Math.floor(v/COMPOUNDS.length)%20),M=formulaMass(c.parts);
 return {id,expression:`${mass}\\,\\mathrm{g}\\,${c.latex}`,speak:`${mass} grams of ${c.speak}`,
  prompt:`How many moles are in ${mass} g of ${c.plain}? Its molar mass is ${M} g/mol. Give your answer to 2 decimal places.`,
  labels:['Amount'],fields:[num('Amount','mol')],expected:[round(mass/M,2)],decimals:2,tolerance:toleranceFor(2),
  hint:`Molar mass is the mass of one mole. Ask how many of those one-mole portions fit inside ${mass} g.`,
  explanation:`Molar mass links mass to amount: one mole of ${c.plain} weighs ${M} g. So the number of moles is how many times ${M} g fits into ${mass} g: ${mass} ÷ ${M} = ${round(mass/M,2)} mol. Multiplying instead would answer a different question — the mass of ${mass} moles.`};
}

function balancingGoal(v:number,id:string):Problem{
 const e=EQUATIONS[v%EQUATIONS.length],k=1+Math.floor(v/EQUATIONS.length)%20;
 const given=(v%EQUATIONS.length+Math.floor(v/EQUATIONS.length))%4;
 const coefficients=e.coefficients.map(c=>c*k);
 const part=(i:number)=>`${i===given?coefficients[i]:'?'}\\,${e.species[i].latex}`;
 const side=(from:number,to:number)=>e.species.slice(from,to).map((_,i)=>part(from+i)).join(' + ');
 const unknown=e.species.map((sp,i)=>({sp,i})).filter(x=>x.i!==given);
 return {id,expression:`${side(0,e.reactants)} → ${side(e.reactants,e.species.length)}`,
  speak:`${e.species.slice(0,e.reactants).map((sp,i)=>`${i===given?coefficients[i]:'what'} ${sp.speak}`).join(' plus ')} yields ${e.species.slice(e.reactants).map((sp,i)=>`${i+e.reactants===given?coefficients[i+e.reactants]:'what'} ${sp.speak}`).join(' plus ')}`,
  prompt:`Complete the balanced equation. The coefficient of ${e.species[given].plain} is ${coefficients[given]}.`,
  labels:unknown.map(x=>`Coefficient of ${x.sp.plain}`),fields:unknown.map(x=>num(`Coefficient of ${x.sp.plain}`)),expected:unknown.map(x=>coefficients[x.i]),
  hint:`Atoms are rearranged, never created or destroyed, so each element must appear the same number of times on both sides. Only the coefficients may change; changing a subscript would change the substance.`,
  explanation:`The invariant is the atom count: every element has the same total on both sides. With ${e.species[given].plain} fixed at ${coefficients[given]}, the only set that balances is ${e.species.map((sp,i)=>`${coefficients[i]} ${sp.plain}`).slice(0,e.reactants).join(' + ')} → ${e.species.map((sp,i)=>`${coefficients[i]} ${sp.plain}`).slice(e.reactants).join(' + ')}. Editing a subscript to make the numbers fit would silently swap the substance for a different one.`};
}

function unitConvert(v:number,id:string):Problem{
 const type=v%4,i=Math.floor(v/4)%60;
 if(type===0){const speed=5+i,answer=round(speed/3.6,2);
  return {id,expression:`${speed}\\,\\mathrm{km/h}`,speak:`${speed} kilometres per hour`,
   prompt:`Convert ${speed} km/h to metres per second. Give your answer to 2 decimal places.`,
   labels:['Speed'],fields:[num('Speed','m/s')],expected:[answer],decimals:2,tolerance:toleranceFor(2),
   hint:`One kilometre is 1000 m and one hour is 3600 s, so the same speed in m/s is the km/h figure scaled by 1000/3600.`,
   explanation:`A conversion changes the units, never the speed itself. 1 km/h = 1000 m ÷ 3600 s = 1/3.6 m/s, so ${speed} ÷ 3.6 = ${answer} m/s. Multiplying by 3.6 would give the number a larger unit deserves, describing a faster motion than the one you were given.`};}
 if(type===1){const speed=1+i,answer=round(speed*3.6,1);
  return {id,expression:`${speed}\\,\\mathrm{m/s}`,speak:`${speed} metres per second`,
   prompt:`Convert ${speed} m/s to kilometres per hour. Give your answer to 1 decimal place.`,
   labels:['Speed'],fields:[num('Speed','km/h')],expected:[answer],decimals:1,tolerance:toleranceFor(1),
   hint:`In one hour there are 3600 s, and 1000 m make a kilometre. The same motion covers 3.6 times as many kilometres per hour as metres per second.`,
   explanation:`The motion is unchanged; only its description changes. 1 m/s = 3600 m per hour = 3.6 km/h, so ${speed} × 3.6 = ${answer} km/h. Dividing by 3.6 reverses the conversion and would describe a much slower motion.`};}
 if(type===2){const tenths=5+i,answer=tenths*100;
  return {id,expression:`${(tenths/10).toFixed(1)}\\,\\mathrm{km}`,speak:`${(tenths/10).toFixed(1)} kilometres`,
   prompt:`Convert ${(tenths/10).toFixed(1)} km to metres.`,
   labels:['Distance'],fields:[num('Distance','m')],expected:[answer],
   hint:`A metre is a smaller unit than a kilometre, so the same distance needs a larger number of them: 1000 for every kilometre.`,
   explanation:`The distance is fixed; the unit decides the size of the number. Smaller unit, bigger count: ${(tenths/10).toFixed(1)} × 1000 = ${answer} m. Dividing by 1000 would shrink the number and the distance with it.`};}
 const tenths=10+i,answer=tenths*6;
 return {id,expression:`${(tenths/10).toFixed(1)}\\,\\mathrm{min}`,speak:`${(tenths/10).toFixed(1)} minutes`,
  prompt:`Convert ${(tenths/10).toFixed(1)} minutes to seconds.`,
  labels:['Time'],fields:[num('Time','s')],expected:[answer],
  hint:`A second is smaller than a minute, so the same interval counts 60 of them for every minute.`,
  explanation:`The interval does not change; only the unit does. ${(tenths/10).toFixed(1)} × 60 = ${answer} s. Because a second is the smaller unit, the number must grow — dividing would describe a much shorter interval.`};
}

function netForce(v:number,id:string):Problem{
 const size=4+v%12,other=1+Math.floor(v/12)%10,flipped=Math.floor(v/120)%2===1;
 const first=flipped?-size:size,second=flipped?other:-other,net=first+second;
 return {id,expression:`F_{1} = ${signed(first)}\\,\\mathrm{N},\\,F_{2} = ${signed(second)}\\,\\mathrm{N}`,
  speak:`F 1 equals ${spokenNewtons(first)}, F 2 equals ${spokenNewtons(second)}`,
  prompt:`Two forces act on a block along one straight line. Taking right as positive and left as negative, what is the net force?`,
  labels:['Net force'],fields:[num('Net force','N')],expected:[net],
  hint:`Forces on one line combine by addition once each carries its own sign. The sign of the total tells you which way the block is pushed.`,
  explanation:`Forces are not separate effects to be judged one at a time; along a line they add as signed quantities. ${signed(first)} + ${signed(second)} = ${signed(net)} N. ${net===0?'The two cancel exactly, so the block has no net push at all — that is balance, not the absence of forces.':`The sign says the block is pushed to the ${net>0?'right':'left'}.`} Adding the sizes while ignoring the signs would describe two forces pulling the same way, which is a different situation.`};
}

const RELATIONS=['F = m × a','m = F ÷ a','a = F ÷ m'];
function forcesGoal(v:number,id:string):Problem{
 const mass=2+v%10,accel=1+Math.floor(v/10)%8,which=Math.floor(v/80)%3,force=mass*accel;
 const shown=which===0?`m = ${mass}\\,\\mathrm{kg},\\,a = ${accel}\\,\\mathrm{m/s^{2}}`:which===1?`F = ${force}\\,\\mathrm{N},\\,a = ${accel}\\,\\mathrm{m/s^{2}}`:`F = ${force}\\,\\mathrm{N},\\,m = ${mass}\\,\\mathrm{kg}`;
 const speak=which===0?`m equals ${mass} kilograms, a equals ${accel} metres per second squared`:which===1?`F equals ${force} newtons, a equals ${accel} metres per second squared`:`F equals ${force} newtons, m equals ${mass} kilograms`;
 const wanted=which===0?{label:'Force',unit:'N',value:force}:which===1?{label:'Mass',unit:'kg',value:mass}:{label:'Acceleration',unit:'m/s²',value:accel};
 return {id,expression:shown,speak,
  prompt:`A single net force acts on a block. Work out the missing quantity, then say which rearrangement of F = ma you used.`,
  labels:[wanted.label,'Rearrangement used'],
  fields:[num(wanted.label,wanted.unit),{label:'Rearrangement used',kind:'choice',options:RELATIONS}],
  expected:[wanted.value,which],
  hint:`F = ma ties the three quantities together, so any one of them can be found from the other two. Decide which one is missing before you calculate, and rearrange for that one.`,
  explanation:`The relationship F = ma is one statement, not three separate formulas: a net force of ${force} N on ${mass} kg produces ${accel} m/s². Here ${wanted.label.toLowerCase()} was missing, so the useful rearrangement is ${RELATIONS[which]}, giving ${wanted.value} ${wanted.unit}. Reaching for F = ma every time and multiplying whatever numbers appear would answer whichever question the numbers happened to fit, not the one that was asked.`};
}

/** Science item families. Returns undefined for every mathematics (topic, skill) pair. */
export function scienceProblem(topic:Topic,active:Skill,serial:number,id:string):Problem|undefined{
 if(active==='atom_count')return atomCount(serial,id);
 if(active==='formula_mass')return formulaMassItem(serial,id);
 if(active==='unit_convert')return unitConvert(serial,id);
 if(active==='net_force')return netForce(serial,id);
 if(active!=='goal')return;
 if(topic==='moles')return molesGoal(serial,id);
 if(topic==='balancing')return balancingGoal(serial,id);
 if(topic==='motion')return motionGoal(serial,id);
 if(topic==='forces')return forcesGoal(serial,id);
}

function motionGoal(v:number,id:string):Problem{
 const u=2+v%8,a=1+Math.floor(v/8)%6,t=2+Math.floor(v/48)%5;
 return {id,expression:`u = ${u}\\,\\mathrm{m/s},\\,a = ${a}\\,\\mathrm{m/s^{2}},\\,t = ${t}\\,\\mathrm{s}`,
  speak:`u equals ${u} metres per second, a equals ${a} metres per second squared, t equals ${t} seconds`,
  prompt:`A cart is already moving at ${u} m/s and speeds up steadily at ${a} m/s² for ${t} s. What is its final speed?`,
  labels:['Final speed'],fields:[num('Final speed','m/s')],expected:[u+a*t],
  hint:`Acceleration is how much speed is added each second, so ${t} seconds add ${a} × ${t}. The cart was already moving, so that gain is added to the speed it started with.`,
  explanation:`Steady acceleration means a fixed gain in speed every second: v = u + at. The ${a} m/s² adds ${a*t} m/s over ${t} s, on top of the ${u} m/s it already had, giving ${u+a*t} m/s. Using at alone would describe a cart starting from rest — a different journey with the same acceleration.`};
}
