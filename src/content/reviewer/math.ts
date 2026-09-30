import {TEAM,DRAFTED,type Chapter} from './types.ts';

export const MATH_CHAPTERS:Chapter[]=[
 {id:'m_fractions_percent',subtest:'math',concept:'percent_fractions',title:'Fractions, decimals and percent',author:TEAM,reviewer:'',status:'draft',createdAt:DRAFTED,
  summary:{intro:'Fractions, decimals and percents are three ways of writing the same idea: a part of a whole. Almost every math subtest question touches one of them somewhere, often inside a word problem. If these are automatic, you save minutes on everything else.',
   sections:[
    {heading:'A fraction is a division',body:['3/4 means 3 ÷ 4 = 0.75. The bottom number (denominator) says how many equal pieces make one whole; the top (numerator) says how many pieces you have.','Two fractions are equal when they describe the same amount: 1/2 = 2/4 = 50/100. You get an equivalent fraction by multiplying or dividing the top and bottom by the same number.']},
    {heading:'Adding and subtracting',body:['You can only add pieces of the same size. Rewrite both fractions over a common denominator, then add the numerators and keep the denominator.','The least common denominator keeps numbers small, but any common denominator works. Simplify at the end.'],formula:'a/b + c/d = (ad + bc) / bd'},
    {heading:'Multiplying and dividing',body:['Multiply straight across: tops times tops, bottoms times bottoms.','To divide, multiply by the reciprocal (flip the second fraction). “Keep, change, flip.”'],formula:'a/b ÷ c/d = a/b × d/c'},
    {heading:'Percent means out of 100',body:['35% = 35/100 = 0.35. To find r% of a number, multiply by r/100.','A percent change compares the change with the ORIGINAL amount: change ÷ original × 100.','An increase of r% multiplies by (1 + r/100). A decrease multiplies by (1 − r/100). Two changes in a row multiply; they do not add.'],formula:'new = original × (1 ± r/100)'},
    {heading:'Fast conversions to know by heart',body:['1/2 = 0.5 = 50%, 1/4 = 25%, 3/4 = 75%, 1/5 = 20%, 1/8 = 12.5%, 1/3 ≈ 33.3%, 2/3 ≈ 66.7%.','Moving the decimal point two places turns a decimal into a percent: 0.07 = 7%.']}
   ]},
  examples:[
   {level:'Warm-up',q:'What is 2/3 + 1/4?',steps:['Common denominator 12.','2/3 = 8/12 and 1/4 = 3/12.','8/12 + 3/12 = 11/12.'],answer:'11/12'},
   {level:'Exam level',q:'A cellphone costs ₱8,000. It is marked up 15%, then sold at 10% off the marked price. What is the selling price?',steps:['Marked price: 8,000 × 1.15 = 9,200.','Selling price: 9,200 × 0.90 = 8,280.'],answer:'₱8,280 (not ₱8,400: the two percents do not simply add to 5%)'},
   {level:'Stretch',q:'After a 20% increase, a price is ₱1,440. What was the original price?',steps:['Original × 1.20 = 1,440.','Original = 1,440 ÷ 1.20 = 1,200.'],answer:'₱1,200. Taking 20% off ₱1,440 gives ₱1,152, which is wrong because 20% of the new price is not 20% of the old one.'}
  ],
  traps:['add_across','keep_one_denominator','percent_part_only','percent_as_number','percent_wrong_direction'],
  tip:'Before you calculate, estimate. If a ₱800 item rises by a bit, the answer is a bit more than ₱800. Crossing out choices that fail the estimate is often faster than doing the arithmetic.',
  practice:{families:['m_frac_add','m_pct_change','m_simple_interest']},
  recall:[{front:'How do you add 1/3 and 1/5?',back:'Common denominator 15: 5/15 + 3/15 = 8/15.'},{front:'r% increase as a multiplier',back:'× (1 + r/100). A 12% increase is × 1.12.'},{front:'Percent change formula',back:'(new − original) ÷ original × 100.'},{front:'1/8 as a percent',back:'12.5%'},{front:'Dividing fractions',back:'Multiply by the reciprocal of the second fraction.'}],
  hard:{text:'Start with equal-sized pieces. The engine checks whether equivalent fractions are the missing step.',engine:{topic:'fractions',skill:'equivalent'},concepts:[]}},
 {id:'m_linear',subtest:'math',concept:'linear_equations',title:'Linear equations and systems',author:TEAM,reviewer:'',status:'draft',createdAt:DRAFTED,
  summary:{intro:'A linear equation is a balance. Whatever you do to one side, you do to the other, and the goal is to leave the unknown alone. Systems of two equations appear in word problems about ages, coins, tickets and mixtures.',
   sections:[
    {heading:'Undo in reverse order',body:['In 3x − 4 = 11, x was first multiplied by 3, then 4 was subtracted. Undo in reverse: add 4, then divide by 3.','Move terms by doing the same operation to both sides, not by “moving” numbers. This is what keeps the signs right.'],formula:'ax + b = c  →  x = (c − b) ÷ a'},
    {heading:'Brackets and fractions',body:['Expand brackets first: 2(x + 3) = 2x + 6.','If fractions appear, multiply every term by the common denominator to clear them.','Collect x terms on one side and numbers on the other.']},
    {heading:'Two equations, two unknowns',body:['Elimination: add or subtract the equations so one variable cancels. You may first multiply an equation by a number to make the coefficients match.','Substitution: solve one equation for a variable and put that expression into the other.','Check both equations with your answer. It takes ten seconds and catches most slips.']},
    {heading:'Turning words into equations',body:['Name the unknown with a letter and write what it stands for.','“Is” means equals. “More than” adds. “Less than” subtracts in reverse order: “5 less than x” is x − 5.','Consecutive integers are n, n + 1, n + 2. Consecutive even or odd integers are n, n + 2, n + 4.']}
   ]},
  examples:[
   {level:'Warm-up',q:'Solve 5x + 7 = 42.',steps:['Subtract 7: 5x = 35.','Divide by 5: x = 7.'],answer:'x = 7'},
   {level:'Exam level',q:'Adult tickets cost ₱150 and student tickets ₱90. 40 tickets were sold for ₱4,200. How many were student tickets?',steps:['Let a be adult and s be student tickets: a + s = 40 and 150a + 90s = 4,200.','From the first, a = 40 − s. Substitute: 150(40 − s) + 90s = 4,200.','6,000 − 150s + 90s = 4,200, so −60s = −1,800 and s = 30.'],answer:'30 student tickets (and 10 adult). Check: 1,500 + 2,700 = 4,200.'},
   {level:'Stretch',q:'Solve (x + 2)/3 − (x − 1)/4 = 2.',steps:['Multiply every term by 12: 4(x + 2) − 3(x − 1) = 24.','4x + 8 − 3x + 3 = 24, so x + 11 = 24.'],answer:'x = 13'}
  ],
  traps:['sign_moving_term','divide_before_subtract','multiply_instead_divide','solved_other_variable','forgot_to_divide'],
  tip:'In a multiple-choice equation question, plugging the choices back in is a legitimate method, especially when the algebra looks long. Start with the middle value so one check can rule out two choices.',
  practice:{families:['m_linear_solve','m_system']},
  recall:[{front:'First step to solve 4x − 9 = 23?',back:'Add 9 to both sides.'},{front:'“7 less than a number” as algebra',back:'n − 7'},{front:'Elimination in one line',back:'Add or subtract the equations so one variable cancels.'},{front:'Consecutive odd integers',back:'n, n + 2, n + 4'}],
  hard:{text:'Checking an answer by substitution is the missing skill for many learners here.',engine:{topic:'graphs',skill:'substitute'},concepts:['percent_fractions']}},
 {id:'m_geometry',subtest:'math',concept:'geometry',title:'Geometry and measurement',author:TEAM,reviewer:'',status:'draft',createdAt:DRAFTED,
  summary:{intro:'Most geometry questions need a small set of formulas and one good sketch. Draw the figure, label what you know, mark what you want, and the formula usually picks itself.',
   sections:[
    {heading:'Area and perimeter',body:['Rectangle: A = lw, P = 2(l + w). Triangle: A = ½bh, where h is perpendicular to the base. Trapezoid: A = ½(a + b)h.','Area is in square units; perimeter is in plain units. Mixing them is the quickest way to pick a wrong choice.'],formula:'Triangle: A = ½ × base × height'},
    {heading:'Right triangles',body:['a² + b² = c², where c is the hypotenuse, opposite the right angle and always the longest side.','Learn the common triples and their multiples: 3-4-5, 5-12-13, 8-15-17, 7-24-25. Recognising 6-8-10 saves a square root.']},
    {heading:'Circles',body:['Area πr². Circumference 2πr = πd. If you are given the diameter, halve it before squaring.','Answers are often left “in terms of π”, like 49π.'],formula:'A = πr²,  C = 2πr'},
    {heading:'Angles',body:['Angles on a straight line add to 180°; around a point, 360°.','Triangle angles add to 180°. An n-sided polygon’s interior angles add to (n − 2) × 180°. Exterior angles of any polygon add to 360°.','Parallel lines cut by a transversal make equal corresponding and alternate angles.']},
    {heading:'Volume',body:['Prism or cylinder: base area × height. Cylinder: πr²h.','Pyramid or cone: one third of the matching prism or cylinder. Sphere: 4/3 πr³.']}
   ]},
  examples:[
   {level:'Warm-up',q:'A right triangle has legs 9 and 12. Find the hypotenuse.',steps:['9-12-15 is the 3-4-5 triple times 3.','Or: 81 + 144 = 225, and √225 = 15.'],answer:'15'},
   {level:'Exam level',q:'A regular hexagon has one interior angle of how many degrees?',steps:['Sum = (6 − 2) × 180° = 720°.','Six equal angles: 720° ÷ 6 = 120°.'],answer:'120°'},
   {level:'Stretch',q:'A circle is inscribed in a square of side 10 cm. What is the area inside the square but outside the circle?',steps:['Square: 10 × 10 = 100.','The circle’s diameter is 10, so r = 5 and its area is 25π.','Difference: 100 − 25π ≈ 21.5 cm².'],answer:'100 − 25π cm²'}
  ],
  traps:['triangle_forgot_half','hypotenuse_add_legs','forgot_square_root','diameter_as_radius','circumference_for_area','polygon_n_times_180'],
  tip:'Geometry figures in exams are often not drawn to scale, so do not measure with your eyes. Trust the numbers and the rules.',
  practice:{families:['m_triangle_area','m_pythagoras','m_circle_area','m_polygon_angles']},
  recall:[{front:'Area of a trapezoid',back:'½(a + b)h'},{front:'Sum of interior angles of an octagon',back:'(8 − 2) × 180° = 1,080°'},{front:'Circle with diameter 14: area',back:'49π'},{front:'Common right triangle triples',back:'3-4-5, 5-12-13, 8-15-17, 7-24-25'},{front:'Volume of a cone',back:'⅓πr²h'}],
  hard:{text:'If multiplying and squaring feel shaky, start there.',engine:{topic:'ratios',skill:'multiply'},concepts:['percent_fractions']}}
];
