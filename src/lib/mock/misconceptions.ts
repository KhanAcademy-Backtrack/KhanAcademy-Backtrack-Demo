import type {Topic,Skill} from '../recovery.ts';
import type {KhanUnitId} from '../program/khan-units.ts';

/** Every wrong choice in the mock bank is built from one of these. Picking it shows
 *  why the choice tempts people and opens the fix: a recovery session on the
 *  engine's matching skill when one exists, the reviewer chapter, and a Khan unit.
 *  `recovery` is left out where no engine topic teaches the idea honestly. */
export type Misconception={label:string;why:string;fix:string;recovery?:{topic:Topic;skill:Skill;routeClue:string};chapter:string;khan?:KhanUnitId};

const m=(label:string,why:string,fix:string,chapter:string,khan?:KhanUnitId,recovery?:Misconception['recovery']):Misconception=>({label,why,fix,chapter,khan,recovery});

export const MISCONCEPTIONS={
 // Percent, fractions, ratio
 percent_part_only:m('Found only the change','Working out r% of the price feels like the answer because it is the number you calculated.','The question asks for the new total. Add the change back to the original: new = original × (1 + r/100).','m_fractions_percent','g7m_q1'),
 percent_as_number:m('Treated the percent as a plain number','Adding “r” directly is fast and looks reasonable when the numbers are small.','A percent is a fraction of something. r% of P is P × r/100, never just r.','m_fractions_percent','g7m_q1'),
 percent_wrong_direction:m('Went the wrong direction','Increase and decrease use the same numbers, so it is easy to subtract when you should add.','Read the verb. “Rises” or “increases” means multiply by (1 + r/100); “drops” means (1 − r/100).','m_fractions_percent','g7m_q1'),
 add_across:m('Added tops and bottoms','Adding straight across works for multiplying, so it feels like it should work for adding.','Fractions add only when the pieces are the same size. Rewrite both over a common denominator first.','m_fractions_percent','g7m_q1',{topic:'fractions',skill:'same_denominator',routeClue:'Start with adding fractions that already share a denominator.'}),
 keep_one_denominator:m('Kept one denominator without rescaling','It looks like the bottoms “match” if you just pick one.','Changing a denominator means multiplying the numerator by the same number. Otherwise the fraction changes size.','m_fractions_percent','g7m_q1',{topic:'fractions',skill:'equivalent',routeClue:'Start with making equivalent fractions.'}),
 multiply_denominators_only:m('Multiplied the denominators but not the numerators','The common denominator is right, so the answer feels close.','When you scale the bottom of a fraction, scale its top by the same factor.','m_fractions_percent','g7m_q1',{topic:'fractions',skill:'equivalent',routeClue:'Rescale each fraction before adding.'}),
 ratio_part_as_total:m('Treated a part-to-part ratio as part of the whole','a : b looks like a fraction a/b.','In a : b, the whole has a + b parts. The first share is a/(a + b) of the total.','m_ratio','g7m_q1',{topic:'ratios',skill:'unit_rate',routeClue:'Find the size of one part first.'}),
 ratio_one_share_only:m('Stopped at one part','Dividing the total by the number of parts is the right first step, so it feels finished.','That gives the size of one part. Multiply by how many parts the person gets.','m_ratio','g7m_q1',{topic:'ratios',skill:'unit_rate',routeClue:'One part, then the number of parts.'}),
 ratio_swapped:m('Swapped the two shares','Both shares are computed the same way, so it is easy to report the other one.','Match the order of the ratio to the order of the names in the question.','m_ratio','g7m_q1'),
 // Algebra
 sign_moving_term:m('Kept the sign when moving a term','Moving a number across the equals sign feels like a move, not an operation.','Undo the operation: to remove + b, subtract b from both sides.','m_linear','g8m_q3',{topic:'graphs',skill:'substitute',routeClue:'Check your answer by putting it back into the equation.'}),
 divide_before_subtract:m('Divided before removing the constant','Dividing by the coefficient is the “last” step, and doing it early feels efficient.','Undo in reverse order: remove the added constant first, then divide by the coefficient.','m_linear','g8m_q3'),
 multiply_instead_divide:m('Multiplied by the coefficient','ax means a times x, so multiplying feels natural.','To undo “times a”, divide by a.','m_linear','g8m_q3',{topic:'ratios',skill:'multiply',routeClue:'Review how multiplication and division undo each other.'}),
 exponents_multiplied:m('Multiplied the exponents','(xᵐ)ⁿ does multiply exponents, and the rules look alike.','Same base, multiplying: add the exponents. Power of a power: multiply them.','m_exponents','g7m_q4'),
 division_adds_exponent:m('Added the exponent when dividing','Adding exponents is the most familiar rule.','Dividing powers with the same base subtracts the exponents.','m_exponents','g7m_q4'),
 division_divides_exponent:m('Divided the exponents','Dividing powers feels like it should divide something.','xᵐ ÷ xⁿ = xᵐ⁻ⁿ. You subtract exponents, you do not divide them.','m_exponents','g7m_q4'),
 square_distributes:m('Squared each term separately','(ab)² = a²b² works, so (a + b)² = a² + b² looks consistent.','(x + a)² = (x + a)(x + a) = x² + 2ax + a². The middle term comes from the two cross products.','m_polynomials','g8m_q1',{topic:'brackets',skill:'expand',routeClue:'Expand two brackets term by term.'}),
 square_middle_term_once:m('Counted the middle term once','You see one “ax” cross product and stop.','There are two cross products, x·a and a·x, so the middle term is 2ax.','m_polynomials','g8m_q1',{topic:'brackets',skill:'expand',routeClue:'List all four products.'}),
 square_middle_as_square:m('Used a² for the middle coefficient','a² appears in the answer, so it gets reused.','The middle coefficient is 2a. The constant term is a².','m_polynomials','g8m_q1',{topic:'brackets',skill:'expand',routeClue:'Match each product to its place.'}),
 root_sign_flip:m('Used the number in the factor as the root','The factor shows “x − 3”, so 3 and −3 are both on the page.','A root makes its factor zero. x − 3 = 0 when x = 3; x + 3 = 0 when x = −3.','m_quadratics','g9m_q3',{topic:'quadratics',skill:'zero',routeClue:'Find the value that makes one factor zero.'}),
 constant_as_root:m('Used the constant term as a root','The constant is the most visible number in x² + bx + c.','The constant is the product of the roots, not a root. Factor, then set each factor to zero.','m_quadratics','g9m_q3',{topic:'quadratics',skill:'factor',routeClue:'Factor the trinomial first.'}),
 sum_as_root:m('Used the sum of the roots','Sum and product relationships look like answers.','−b is the sum of both roots. A single root makes one factor zero.','m_quadratics','g9m_q3',{topic:'quadratics',skill:'factor',routeClue:'Two numbers: product c, sum b.'}),
 slope_run_over_rise:m('Divided run by rise','Both differences are right, just stacked upside down.','Slope = change in y ÷ change in x. Rise over run.','m_lines','g9m_q1',{topic:'graphs',skill:'coordinates',routeClue:'Read the change in y, then the change in x.'}),
 slope_sum_not_difference:m('Added the coordinates','Adding feels like combining the two points.','Slope uses differences: (y₂ − y₁)/(x₂ − x₁).','m_lines','g9m_q1',{topic:'graphs',skill:'coordinates',routeClue:'Differences, not sums.'}),
 slope_sign_order:m('Mixed the order of subtraction','Subtracting in one order on top and the other order on the bottom flips the sign.','Subtract in the same order on top and bottom.','m_lines','g9m_q1'),
 negative_squared:m('Squared a negative and kept it negative','−k² and (−k)² look almost the same.','(−k)² = (−k)(−k) = k², which is positive. Use brackets when you substitute.','m_functions','genmath_functions',{topic:'graphs',skill:'substitute',routeClue:'Substitute with brackets.'}),
 sign_dropped_substitution:m('Dropped the negative when substituting','Writing the value without its sign is a quick slip.','Put the whole value, sign included, in brackets: f(−3) means every x becomes (−3).','m_functions','genmath_functions',{topic:'graphs',skill:'substitute',routeClue:'Substitute with brackets.'}),
 square_as_double:m('Doubled instead of squared','x² and 2x are both “two” operations.','x² means x times x. 2x means x plus x.','m_functions','genmath_functions',{topic:'graphs',skill:'substitute',routeClue:'Substitute, then square.'}),
 solved_other_variable:m('Solved for the other variable','Both values come out of the same work.','Reread which variable the question asks for.','m_linear','g8m_q3'),
 forgot_to_divide:m('Stopped before dividing','Adding the equations eliminates y, so it feels solved.','After adding, you have 2x = s + d. Divide by 2.','m_linear','g8m_q3'),
 subtracted_equations:m('Subtracted the equations','Subtracting also eliminates, just the wrong variable here.','Adding x + y and x − y cancels y. Subtracting cancels x.','m_linear','g8m_q3'),
 sequence_off_by_one:m('Added one step too many','The nth term feels like it needs n steps.','From term 1 to term n there are n − 1 steps: aₙ = a₁ + (n − 1)d.','m_sequences','g8m_q1'),
 sequence_forgot_first:m('Forgot the first term','n × d counts the steps, which feels like the position.','Start from the first term, then add the steps.','m_sequences','g8m_q1'),
 sequence_multiplied:m('Multiplied the first term by n','Arithmetic sequences grow steadily, so multiplying seems to fit.','Arithmetic sequences add the same difference each time.','m_sequences','g8m_q1'),
 // Geometry and measurement
 triangle_forgot_half:m('Forgot the one half','Base times height is the rectangle formula, and a triangle looks like half a rectangle only once you picture it.','A triangle is half of a rectangle with the same base and height: A = ½bh.','m_geometry','g8m_q2'),
 area_as_sum:m('Added the lengths','Adding is the reflex when two numbers are given.','Area multiplies two lengths. Perimeter adds lengths.','m_geometry','g8m_q2'),
 area_as_perimeter:m('Found the perimeter-like total','Perimeter and area are often taught together.','Area counts square units inside the shape.','m_geometry','g8m_q2'),
 hypotenuse_add_legs:m('Added the legs','The hypotenuse is the longest side, and adding makes something longer.','The legs combine through squares: c² = a² + b².','m_geometry','g8m_q2'),
 forgot_square_root:m('Forgot the square root','a² + b² is the last number you wrote.','That is c². Take the square root to get c.','m_geometry','g8m_q2'),
 area_for_length:m('Used the area formula','Both formulas use the two legs.','Side lengths use the Pythagorean theorem. Area uses ½ × leg × leg.','m_geometry','g8m_q2'),
 diameter_as_radius:m('Used the diameter as the radius','The diameter is the number given.','The radius is half the diameter. Halve first, then square.','m_geometry','g10m_q4'),
 circumference_for_area:m('Used the circumference formula','πd is the other circle formula you know.','Area is πr². Circumference is πd.','m_geometry','g10m_q4'),
 radius_not_squared:m('Did not square the radius','πr looks close to πr².','Area needs r × r, because area is in square units.','m_geometry','g10m_q4'),
 polygon_n_times_180:m('Used n × 180°','Each triangle has 180°, and there are n sides.','A polygon with n sides splits into n − 2 triangles: (n − 2) × 180°.','m_geometry','g7m_q1'),
 one_angle_not_sum:m('Found one angle, not the sum','Regular polygon questions often ask for one angle.','Reread: “sum of the interior angles” means all of them together.','m_geometry','g7m_q1'),
 exterior_for_interior:m('Used the exterior angle sum','360° is the sum you remember for every polygon.','360° is the sum of the exterior angles. Interior angles sum to (n − 2) × 180°.','m_geometry','g7m_q1'),
 // Statistics and probability
 mean_missing_as_mean:m('Answered with the mean itself','The mean is the number given in the question.','Total = mean × count. The missing value is the total minus the values you know.','m_statistics','g7m_q3'),
 mean_wrong_count:m('Used the wrong count','Only n − 1 values are listed, so it is easy to count those.','The mean includes the missing value, so multiply by all n values.','m_statistics','g7m_q3'),
 mean_of_given:m('Averaged only the given values','Averaging is the reflex for a mean question.','Work backwards from the total the mean requires.','m_statistics','g7m_q3'),
 with_replacement:m('Assumed the first marble went back','Squaring one probability is quick.','Without replacement, the second draw has one fewer marble of that colour and one fewer overall.','m_probability','g8m_q4'),
 one_draw_only:m('Found the chance for one draw','The first probability is the easy part.','“Both” means the first and the second: multiply the two probabilities.','m_probability','g8m_q4'),
 probabilities_added:m('Added the probabilities','Adding feels like combining two events.','For “this and then that”, multiply. Add only for “this or that” when they cannot both happen.','m_probability','g8m_q4'),
 // Word problems
 interest_one_year:m('Found one year of interest','P × r is the first thing you calculate.','Simple interest grows every year by the same amount: I = P × r × t.','m_word_problems','g10m_q4'),
 compound_for_simple:m('Used compound interest','Compound interest is the better-known formula.','Simple interest is calculated on the original principal only.','m_word_problems','g10m_q4'),
 average_of_speeds:m('Averaged the two speeds','The average of two numbers is the usual average.','Average speed is total distance ÷ total time. The slower leg takes longer, so it counts more.','m_word_problems','g7m_q1',{topic:'ratios',skill:'unit_rate',routeClue:'Find each leg’s time first.'}),
 speeds_added:m('Added the speeds','Two legs, two speeds, add them.','Speeds do not add across a trip. Use total distance ÷ total time.','m_word_problems','g7m_q1'),
 speeds_subtracted:m('Subtracted the speeds','The difference is a quick number to find.','Use total distance ÷ total time.','m_word_problems','g7m_q1'),
 rates_averaged:m('Averaged the times','Working together feels like the middle of the two times.','Add rates, not times: together they finish 1/a + 1/b of the job each hour.','m_word_problems','g7m_q1',{topic:'ratios',skill:'unit_rate',routeClue:'Find each worker’s rate per hour.'}),
 times_added:m('Added the times','Two workers, two times, add them.','Together is faster than either alone. Add the hourly rates, then flip.','m_word_problems','g7m_q1'),
 times_subtracted:m('Subtracted the times','The difference looks like a saving.','Add the hourly rates, then flip.','m_word_problems','g7m_q1'),
 // Science: shared quantity slips
 ratio_inverted:m('Divided the wrong way round','Both quantities are in the question, and division order is easy to swap.','Check the units. Speed is metres per second, so metres go on top.','s_units','phys1_q1',{topic:'motion',skill:'unit_convert',routeClue:'Use the units to decide what goes on top.'}),
 multiplied_quantities:m('Multiplied instead of dividing','Multiplying two given numbers is a quick reflex.','Write the formula with units first. The units tell you whether to multiply or divide.','s_units','phys1_q1',{topic:'motion',skill:'unit_convert',routeClue:'Let the units choose the operation.'}),
 subtracted_quantities:m('Subtracted two different quantities','Subtraction gives a small, tidy number.','You can only subtract quantities with the same unit.','s_units','phys1_q1'),
 added_quantities:m('Added two different quantities','Adding feels like combining.','You can only add quantities with the same unit. Work is force × distance.','s_units','phys1_q1'),
 divided_instead:m('Divided instead of multiplying','Many formulas are rates, so dividing feels right.','Check the formula: work = force × distance, wave speed = frequency × wavelength.','s_units','phys1_q1'),
 initial_velocity_ignored:m('Ignored the starting speed','Final speed ÷ time uses the most visible numbers.','Acceleration is the change in velocity per second: (v − u)/t.','s_motion','phys1_q1',{topic:'motion',skill:'unit_convert',routeClue:'Start from the change in velocity.'}),
 velocity_change_added:m('Added the speeds','Combining two speeds feels natural.','Change means final minus initial.','s_motion','phys1_q1'),
 multiplied_by_time:m('Multiplied by the time','Distance problems multiply by time.','Acceleration divides the change in velocity by time.','s_motion','phys1_q1'),
 friction_ignored:m('Ignored friction','The applied force is the biggest number shown.','Newton’s second law uses the net force: applied minus friction.','s_forces','phys1_q1',{topic:'forces',skill:'net_force',routeClue:'Find the net force first.'}),
 forces_added:m('Added opposing forces','Two forces, add them.','Forces in opposite directions subtract.','s_forces','phys1_q1',{topic:'forces',skill:'net_force',routeClue:'Opposite directions subtract.'}),
 mass_as_weight:m('Used mass as weight','In everyday speech, weight means kilograms.','Weight is a force: W = mg, in newtons.','s_forces','phys1_q1',{topic:'forces',skill:'net_force',routeClue:'Weight is a force.'}),
 divided_by_g:m('Divided by g','g is in the problem, so it has to go somewhere.','Weight = mass × g. Dividing by g goes from weight back to mass.','s_forces','phys1_q1'),
 added_g:m('Added g','g looks like one more number to combine.','Weight = mass × g.','s_forces','phys1_q1'),
 forgot_half:m('Forgot the one half','mv² is the memorable part.','Kinetic energy is ½mv².','s_energy','phys1_q1'),
 forgot_square:m('Did not square the speed','½mv looks complete.','Speed is squared: doubling speed quadruples kinetic energy.','s_energy','phys1_q1'),
 momentum_for_energy:m('Found momentum','mv is momentum, the other formula with m and v.','Kinetic energy is ½mv². Momentum is mv.','s_energy','phys1_q1'),
 forgot_g:m('Left out g','Mass × height uses the two given numbers.','Gravitational potential energy is mgh.','s_energy','phys1_q1'),
 half_from_ke:m('Borrowed the half from kinetic energy','½ appears in the other energy formula.','Potential energy has no ½: PE = mgh.','s_energy','phys1_q1'),
 forgot_height:m('Left out the height','mg is the weight, which feels like the answer.','Multiply the weight by the height: PE = mgh.','s_energy','phys1_q1'),
 final_temp_for_change:m('Used the final temperature','The final temperature is the number that stands out.','Use the change: ΔT = final − initial.','s_energy','chem2_q1'),
 forgot_temp_change:m('Left out the temperature change','m × c looks like a heat.','Q = mcΔT. Heat depends on how much the temperature changed.','s_energy','chem2_q1'),
 forgot_specific_heat:m('Left out the specific heat','Mass × ΔT uses the two changing numbers.','Q = mcΔT. For water, c = 4.18 J/g°C.','s_energy','chem2_q1'),
 direct_for_inverse:m('Treated pressure and volume as direct','Most relationships you know are direct.','At constant temperature, P × V stays the same, so one goes up as the other goes down.','s_gases','chem1_q1'),
 no_change_assumed:m('Assumed nothing changes','The volume is given, so reusing it is tempting.','Pressure changed, so volume must change: V₂ = P₁V₁/P₂.','s_gases','chem1_q1'),
 // Chemistry
 subscript_ignored:m('Ignored a subscript','The subscript is small and easy to skip.','A subscript counts atoms. H₂O has two hydrogens: 2 × 1 + 16 = 18 g/mol.','s_moles','chem1_q1',{topic:'moles',skill:'formula_mass',routeClue:'Count atoms, then add their masses.'}),
 ml_not_converted:m('Did not convert millilitres to litres','The volume is given in mL, and molarity uses L.','Molarity is moles per litre. Divide mL by 1000 first.','s_moles','chem2_q1',{topic:'motion',skill:'unit_convert',routeClue:'Convert the units first.'}),
 parentheses_subscript_ignored:m('Ignored the number outside the brackets','The outside subscript sits far from the atom.','A subscript after brackets multiplies everything inside them.','s_moles','chem1_q1',{topic:'balancing',skill:'atom_count',routeClue:'Count atoms inside and outside brackets.'}),
 subscripts_added:m('Added the subscripts','Two subscripts, add them.','Multiply: the inside count times the outside subscript.','s_moles','chem1_q1',{topic:'balancing',skill:'atom_count',routeClue:'Count atoms inside and outside brackets.'}),
 counted_all_atoms:m('Counted every atom','Totals are what counting usually means.','Count only the element the question names.','s_moles','chem1_q1',{topic:'balancing',skill:'atom_count',routeClue:'Count one element at a time.'}),
 counted_atoms_fraction:m('Used the share of atoms, not mass','Two of three atoms in water are hydrogen.','Percent composition is by mass: element mass ÷ formula mass × 100.','s_moles','chem1_q1',{topic:'moles',skill:'formula_mass',routeClue:'Find the formula mass first.'}),
 element_mass_as_percent:m('Reported the element’s mass as a percent','The mass of the element is a number you worked out.','Divide by the whole formula mass, then multiply by 100.','s_moles','chem1_q1'),
 halflife_linear:m('Treated decay as steady subtraction','Losing half, then half again, sounds like losing the same amount.','Each half-life halves what is left: N = N₀ × (½)ⁿ.','s_nuclear','phys2_q4'),
 one_half_life_only:m('Applied only one half-life','Halving once is the definition you remember.','Count how many half-lives fit in the time, then halve that many times.','s_nuclear','phys2_q4'),
 halflife_off_by_one:m('Halved one time too many','Counting steps is easy to miscount.','Number of half-lives = elapsed time ÷ half-life.','s_nuclear','phys2_q4'),
 ph_sign:m('Kept the minus sign','[H⁺] = 10⁻ⁿ shows −n.','pH = −log[H⁺], so the minus cancels: pH = n.','s_acids','chem2_q2'),
 ph_poh_swap:m('Found pOH instead of pH','14 − n is the other formula you know.','pH comes straight from [H⁺]. Use 14 − pH only to find pOH.','s_acids','chem2_q2'),
 concentration_for_ph:m('Gave the concentration','The concentration is the number in the question.','pH is the exponent’s size: [H⁺] = 10⁻ⁿ means pH = n.','s_acids','chem2_q2'),
 // Biology
 phenotype_swapped:m('Swapped dominant and recessive','The two fractions come from the same square.','Recessive shows only with two recessive alleles (aa): 1 of 4 boxes in Aa × Aa.','s_genetics','bio2_q3'),
 heterozygous_for_phenotype:m('Counted only the heterozygotes','Aa is the most common box.','Dominant phenotype includes AA and Aa. Recessive is only aa.','s_genetics','bio2_q3'),
 ratio_read_as_fraction:m('Read the 3 : 1 ratio as one third','3 : 1 looks like 1/3.','3 : 1 means 3 of every 4. As a fraction of all offspring: 3/4 and 1/4.','s_genetics','bio2_q3'),
 dominant_takes_all:m('Assumed all offspring show the dominant trait','Dominant sounds like it always wins.','Two Aa parents can each pass a, so 1 in 4 offspring is aa.','s_genetics','bio2_q3'),
 recessive_needs_one:m('Thought one recessive allele is enough','Carrying the allele feels like showing it.','A recessive trait shows only with two copies (aa).','s_genetics','bio2_q3')
} satisfies Record<string,Misconception>;
export type MisconceptionId=keyof typeof MISCONCEPTIONS;
export const misconception=(id:string):Misconception|undefined=>(MISCONCEPTIONS as Record<string,Misconception>)[id];
