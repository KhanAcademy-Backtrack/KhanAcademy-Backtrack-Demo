import {TEAM,DRAFTED,type Chapter} from './types.ts';

/* Every equation, quantity symbol and chemical formula is LaTeX between dollar signs. */
export const SCIENCE_CHAPTERS:Chapter[]=[
 {id:'s_motion',subtest:'science',concept:'motion_forces',title:'Describing motion',author:TEAM,reviewer:'',status:'draft',createdAt:DRAFTED,
  summary:{intro:'Motion questions test whether you can tell apart distance and displacement, speed and velocity, and velocity and acceleration, then pick the right equation. Units are your best guide.',
   sections:[
    {heading:'Distance, displacement, speed, velocity',body:['Distance is how far you travelled along the path. Displacement is the straight-line change in position, with a direction.','$\\text{Speed} = \\text{distance} \\div \\text{time}$. $\\text{Velocity} = \\text{displacement} \\div \\text{time}$, with a direction.','Walk 3 m east then 3 m west: distance 6 m, displacement 0.'],formula:'$v = d \\div t$'},
    {heading:'Acceleration',body:['Acceleration is how fast velocity changes: $a = (v - u) \\div t$, in $\\mathrm{m/s^{2}}$.','Slowing down is acceleration too, just negative (opposite to the motion).','Constant velocity means zero acceleration, even at high speed.'],formula:'$a = (v - u) \\div t$'},
    {heading:'Uniformly accelerated motion',body:['When acceleration is constant, use $v = u + at$, $d = ut + \\frac{1}{2}at^2$, and $v^2 = u^2 + 2ad$.','Pick the equation that has the three things you know and the one you want.','Free fall near Earth: $a = 9.8\\,\\mathrm{m/s^{2}}$ downward, whatever the mass (ignoring air).']},
    {heading:'Reading motion graphs',body:['Position-time graph: the slope is the velocity. A flat line means the object is at rest.','Velocity-time graph: the slope is the acceleration, and the area under the line is the displacement.']}
   ]},
  examples:[
   {level:'Warm-up',q:'A jeepney travels 18 km in 30 minutes. What is its average speed in km/h?',steps:['$30\\text{ minutes} = 0.5\\,\\mathrm{h}$.','$18 \\div 0.5 = 36$.'],answer:'36 km/h'},
   {level:'Exam level',q:'A car accelerates uniformly from rest to 24 m/s in 6 s. How far does it go in that time?',steps:['$a = (24 - 0) \\div 6 = 4\\,\\mathrm{m/s^{2}}$.','$d = ut + \\frac{1}{2}at^2 = 0 + \\frac{1}{2} \\times 4 \\times 36 = 72\\,\\mathrm{m}$.'],answer:'72 m. Shortcut: average velocity $\\frac{0 + 24}{2} = 12\\,\\mathrm{m/s}$, times 6 s.'},
   {level:'Stretch',q:'A ball is dropped from a 44.1 m tower. How long does it take to reach the ground? ($g = 9.8\\,\\mathrm{m/s^{2}}$)',steps:['$d = \\frac{1}{2}gt^2$, so $44.1 = 4.9t^2$.','$t^2 = 9$, so $t = 3\\,\\mathrm{s}$.'],answer:'3 s'}
  ],
  traps:['ratio_inverted','initial_velocity_ignored','velocity_change_added','multiplied_by_time'],
  tip:'Write every quantity with its unit before you touch a formula. If the unit of your answer is not what the question asks for, you have picked the wrong operation.',
  practice:{families:['s_speed','s_acceleration','s_density']},
  recall:[{front:'Acceleration formula',back:'$a = (v - u) \\div t$'},{front:'Slope of a velocity-time graph',back:'Acceleration'},{front:'Area under a velocity-time graph',back:'Displacement'},{front:'Free-fall acceleration',back:'$9.8\\,\\mathrm{m/s^{2}}$ downward'},{front:'Distance vs displacement',back:'Path length vs straight-line change in position, with direction'}],
  hard:{text:'Converting units is usually the missing step in motion problems.',engine:{topic:'motion',skill:'unit_convert'},concepts:['matter_measurement','linear_equations']}},
 {id:'s_forces',subtest:'science',concept:'motion_forces',title:'Forces and Newton’s laws',author:TEAM,reviewer:'',status:'draft',createdAt:DRAFTED,
  summary:{intro:'Newton’s three laws explain why things start, stop and turn. Exam questions usually hinge on one idea: only the NET force changes motion.',
   sections:[
    {heading:'First law: inertia',body:['An object keeps doing what it is doing (resting or moving in a straight line at constant speed) unless a net force acts.','A passenger lurches forward when a bus brakes because their body keeps moving.']},
    {heading:'Second law: $F = ma$',body:['$\\text{Net force} = \\text{mass} \\times \\text{acceleration}$. Add forces in the same direction, subtract opposite ones.','Friction and air resistance oppose motion. Subtract them from the push before dividing by mass.'],formula:'$F_{\\text{net}} = ma$'},
    {heading:'Third law: pairs',body:['Forces come in equal and opposite pairs acting on DIFFERENT objects. You push the wall; the wall pushes you.','Because the pair acts on different objects, the forces do not cancel each other out.']},
    {heading:'Weight and mass',body:['Mass (kg) is the amount of matter and is the same everywhere. Weight is the force of gravity on it: $W = mg$, in newtons.','On the Moon your mass is unchanged but your weight is about one sixth.'],formula:'$W = mg, \\quad g = 9.8\\,\\mathrm{m/s^{2}}$'}
   ]},
  examples:[
   {level:'Warm-up',q:'What net force gives a 12 kg cart an acceleration of $3\\,\\mathrm{m/s^{2}}$?',steps:['$F = ma = 12 \\times 3$.'],answer:'36 N'},
   {level:'Exam level',q:'A 5 kg box is pulled with 40 N while friction is 15 N. What is its acceleration?',steps:['Net force: $40 - 15 = 25\\,\\mathrm{N}$.','$a = 25 \\div 5 = 5\\,\\mathrm{m/s^{2}}$.'],answer:'$5\\,\\mathrm{m/s^{2}}$'},
   {level:'Stretch',q:'A 60 kg student stands in an elevator accelerating upward at $2\\,\\mathrm{m/s^{2}}$. What force does the floor exert?',steps:['Net upward force: $ma = 60 \\times 2 = 120\\,\\mathrm{N}$.','The floor must also support the weight: $60 \\times 9.8 = 588\\,\\mathrm{N}$.','Floor force: $588 + 120 = 708\\,\\mathrm{N}$.'],answer:'708 N'}
  ],
  traps:['friction_ignored','forces_added','mass_as_weight','divided_by_g'],
  tip:'Sketch the object as a dot with arrows for each force. Ten seconds of drawing prevents most sign mistakes.',
  practice:{families:['s_newton2','s_weight','s_work']},
  recall:[{front:'Newton’s second law',back:'$F_{\\text{net}} = ma$'},{front:'Why don’t action-reaction pairs cancel?',back:'They act on different objects.'},{front:'Weight of a 50 kg person',back:'$50 \\times 9.8 = 490\\,\\mathrm{N}$'},{front:'Constant velocity means net force is',back:'zero'}],
  hard:{text:'Finding the net force is the usual gap.',engine:{topic:'forces',skill:'net_force'},concepts:['matter_measurement']}},
 {id:'s_moles',subtest:'science',concept:'moles_formulas',title:'Formulas, moles and composition',author:TEAM,reviewer:'',status:'draft',createdAt:DRAFTED,
  summary:{intro:'The mole lets chemists count particles by weighing them. Once you can read a formula and find its molar mass, grams, moles and particles convert into each other in one step.',
   sections:[
    {heading:'Reading a formula',body:['A subscript counts the atom right before it: $\\mathrm{H_{2}O}$ has 2 H and 1 O.','A subscript after brackets multiplies everything inside: $\\mathrm{Ca(OH)_{2}}$ has 1 Ca, 2 O and 2 H.','A coefficient in front multiplies the whole formula: $3\\,\\mathrm{H_{2}O}$ has 6 H and 3 O.']},
    {heading:'Molar mass',body:['Add the atomic masses of every atom in the formula. $\\mathrm{H_{2}O}$: $2(1) + 16 = 18\\,\\mathrm{g/mol}$.','Common values: H 1, C 12, N 14, O 16, Na 23, Mg 24, Al 27, S 32, Cl 35.5, Ca 40.'],formula:'$M = \\text{sum of atomic masses}$'},
    {heading:'Grams, moles, particles',body:['$\\text{moles} = \\text{grams} \\div \\text{molar mass}$. $\\text{grams} = \\text{moles} \\times \\text{molar mass}$.','One mole holds $6.02 \\times 10^{23}$ particles (Avogadro’s number).'],formula:'$n = m \\div M$'},
    {heading:'Percent composition',body:['$\\text{Percent of an element} = \\left(\\text{mass of that element in one formula} \\div \\text{formula mass}\\right) \\times 100$.','Use mass, not the number of atoms: hydrogen is 2 of 3 atoms in water but only about 11% of its mass.']}
   ]},
  examples:[
   {level:'Warm-up',q:'How many oxygen atoms are in $\\mathrm{Al_{2}(SO_{4})_{3}}$?',steps:['Inside the brackets: 4 O.','The bracket appears 3 times: $4 \\times 3 = 12$.'],answer:'12'},
   {level:'Exam level',q:'How many moles are in 22 g of $\\mathrm{CO_{2}}$?',steps:['$M(\\mathrm{CO_{2}}) = 12 + 2(16) = 44\\,\\mathrm{g/mol}$.','$n = 22 \\div 44 = 0.5\\,\\mathrm{mol}$.'],answer:'0.5 mol'},
   {level:'Stretch',q:'What mass of calcium is in 250 g of $\\mathrm{CaCO_{3}}$?',steps:['$M(\\mathrm{CaCO_{3}}) = 40 + 12 + 3(16) = 100\\,\\mathrm{g/mol}$, so calcium is 40% by mass.','$0.40 \\times 250 = 100\\,\\mathrm{g}$.'],answer:'100 g'}
  ],
  traps:['subscript_ignored','parentheses_subscript_ignored','subscripts_added','counted_atoms_fraction','multiplied_quantities'],
  tip:'Write the molar mass above the formula the moment you see it in a question. You will almost always need it.',
  practice:{families:['s_moles','s_atom_count','s_percent_comp','s_molarity']},
  recall:[{front:'Molar mass of $\\mathrm{H_{2}O}$',back:'18 g/mol'},{front:'Atoms of O in $2\\,\\mathrm{Ca(NO_{3})_{2}}$',back:'$2 \\times 3 \\times 2 = 12$'},{front:'Moles from grams',back:'$n = m \\div M$'},{front:'Avogadro’s number',back:'$6.02 \\times 10^{23}$'}],
  hard:{text:'Counting atoms comes before molar mass. Start there.',engine:{topic:'balancing',skill:'atom_count'},concepts:['ratio_rate']}}
];
