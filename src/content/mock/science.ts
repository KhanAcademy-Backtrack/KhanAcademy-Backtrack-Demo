import type {MockItem} from '../../lib/mock/types.ts';
import type {KhanUnitId} from '../../lib/program/khan-units.ts';

/** Conceptual science items (biology, Earth and space) that numbers cannot
 *  generate. Original items, "draft" until a team science reviewer signs them off. */
type Row=[string,string];
function S(id:string,concept:string,chapter:string,khanRef:KhanUnitId,stem:string,rows:Row[],answerIndex:number,difficulty:1|2|3):MockItem{
 if(rows.length!==4)throw Error(id);
 return {id:`sci_${id}`,source:'authored',subtest:'science',lang:'en',stem,choices:rows.map(r=>r[0]),rationales:rows.map(r=>r[1]),answerIndex,solutionSteps:[rows[answerIndex][1]],misconceptions:rows.map(()=>null),skill:concept,concept,difficulty,khanRef,reviewerChapter:chapter,status:'draft',author:'Khanpanion team',reviewer:'',createdAt:'2026-09-30'};
}
const cell=(id:string,stem:string,rows:Row[],a:number,d:1|2|3=1)=>S(id,'cells_life','s_cells','bio1_q1',stem,rows,a,d);
const energy=(id:string,stem:string,rows:Row[],a:number,d:1|2|3=1)=>S(id,'cells_life','s_cells','bio1_q2',stem,rows,a,d);
const earth=(id:string,stem:string,rows:Row[],a:number,d:1|2|3=1,k:KhanUnitId='earth_q2')=>S(id,'earth_space','s_earth',k,stem,rows,a,d);

export const SCIENCE_ITEMS:MockItem[]=[
 cell('cell_01','Which organelle releases most of the usable energy in a cell through respiration?',[
  ['Mitochondrion','Correct. Cellular respiration in the mitochondria produces most of the cell’s ATP.'],
  ['Chloroplast','Chloroplasts capture light energy for photosynthesis; they do not carry out respiration.'],
  ['Ribosome','Ribosomes build proteins.'],
  ['Nucleus','The nucleus stores DNA and controls the cell, but does not release energy.']],0),
 cell('cell_02','Which structure is found in plant cells but NOT in animal cells?',[
  ['Cell membrane','Both plant and animal cells have one.'],
  ['Cell wall','Correct. Plant cells have a rigid cellulose wall; animal cells do not.'],
  ['Mitochondrion','Both have mitochondria. Plants respire too.'],
  ['Ribosome','Both have ribosomes.']],1),
 cell('cell_03','A slice of potato is placed in very salty water. What happens to the water inside its cells?',[
  ['It moves out of the cells.','Correct. Water moves by osmosis from the less salty inside to the saltier outside.'],
  ['It moves into the cells.','That happens in pure water, which is less salty than the cell.'],
  ['It does not move at all.','Water moves whenever the concentrations differ.'],
  ['It turns into salt.','Water does not change into salt.']],0,2),
 cell('cell_04','Mitosis produces',[
  ['four cells with half the chromosomes','That describes meiosis.'],
  ['two cells identical to the parent cell','Correct. Mitosis is for growth and repair and copies the cell exactly.'],
  ['one larger cell','Division produces more cells, not a larger one.'],
  ['two cells with different DNA','Mitosis copies the DNA exactly.']],1),
 cell('cell_05','What do enzymes do in living things?',[
  ['Speed up chemical reactions without being used up','Correct. Enzymes are biological catalysts.'],
  ['Store genetic information','That is the job of DNA.'],
  ['Carry oxygen in the blood','That is hemoglobin.'],
  ['Provide energy directly','Enzymes help reactions happen; they are not fuel.']],0),
 energy('cell_06','Which substances does a plant use to make glucose in photosynthesis?',[
  ['Oxygen and glucose','These are products of photosynthesis and raw materials of respiration.'],
  ['Carbon dioxide and water, using light energy','Correct. $\\mathrm{CO_{2}} + \\mathrm{H_{2}O} + \\text{light} \\to \\text{glucose} + \\mathrm{O_{2}}$.'],
  ['Nitrogen and water','Plants use nitrogen for proteins, not to make glucose.'],
  ['Carbon dioxide and oxygen','Oxygen is released, not used.']],1),
 energy('cell_07','A student says “plants do photosynthesis instead of respiration.” What is wrong with this?',[
  ['Nothing; plants do not respire.','Plants respire all the time to release energy.'],
  ['Plants carry out both; respiration goes on day and night.','Correct. Photosynthesis needs light; respiration never stops.'],
  ['Plants only respire at night.','Respiration also happens during the day.'],
  ['Only animals photosynthesize.','Animals do not photosynthesize.']],1,2),
 energy('cell_08','ATP is best described as',[
  ['the cell’s ready-to-use energy carrier','Correct. Cells spend ATP to power their work.'],
  ['a type of sugar stored in plants','That describes starch.'],
  ['a waste product of respiration','Carbon dioxide and water are the waste products.'],
  ['a protein that builds cell walls','Cell walls are made of cellulose.']],0),
 S('gen_01','genetics','s_genetics','bio2_q3','Which describes a phenotype?',[
  ['The letters Aa','That is a genotype.'],
  ['Purple flower color','Correct. A phenotype is the visible or measurable trait.'],
  ['A gene on a chromosome','That is where the information is stored, not the trait itself.'],
  ['A Punnett square','A Punnett square predicts outcomes.']],1,1),
 S('gen_02','genetics','s_genetics','bio2_q3','DNA carries information that is used to build',[
  ['proteins','Correct. DNA is copied into RNA, which is read to build proteins.'],
  ['fats directly','Fats are not coded directly by genes.'],
  ['minerals','Minerals come from the environment.'],
  ['sunlight','DNA does not produce energy sources.']],0,1),
 earth('earth_01','Why does the Philippines have many earthquakes and volcanoes?',[
  ['It is close to the equator.','Latitude does not cause earthquakes.'],
  ['It lies along boundaries where tectonic plates meet.','Correct. Plate movement at boundaries causes earthquakes and volcanism.'],
  ['It has many typhoons.','Typhoons are weather, not plate activity.'],
  ['It is made of many islands.','Being an archipelago is a result of geology, not its cause.']],1),
 earth('earth_02','Which type of rock forms when magma or lava cools and hardens?',[
  ['Sedimentary','Sedimentary rock forms from layers of sediment pressed together.'],
  ['Metamorphic','Metamorphic rock forms when existing rock is changed by heat and pressure.'],
  ['Igneous','Correct. Igneous rock forms from cooled magma or lava.'],
  ['Fossil','Fossils are remains in rock, not a rock type.']],2),
 earth('earth_03','What causes the seasons on Earth?',[
  ['Earth’s changing distance from the Sun','Tempting, but the distance change is small; the tilt matters far more.'],
  ['The tilt of Earth’s axis as it orbits the Sun','Correct. The tilt changes how directly sunlight strikes each hemisphere.'],
  ['The Moon blocking sunlight','That is an eclipse, which is brief.'],
  ['Changes in the Sun’s brightness','The Sun’s output is nearly constant.']],1,2,'earth_q1'),
 earth('earth_04','Typhoons usually form over',[
  ['cold land areas','They need warm, moist air.'],
  ['warm ocean water','Correct. Warm water supplies the heat and moisture that power them.'],
  ['deserts','Deserts are too dry.'],
  ['frozen seas','Too cold.']],1,1,'earth_q1'),
 earth('earth_05','Which layer of the Earth is liquid?',[
  ['Crust','The crust is solid rock.'],
  ['Mantle','The mantle is mostly solid, though it flows very slowly.'],
  ['Outer core','Correct. The outer core is liquid iron and nickel.'],
  ['Inner core','The inner core is solid because of immense pressure.']],2,2),
 earth('earth_06','Which planet is closest to the Sun?',[
  ['Venus','Venus is second.'],
  ['Mercury','Correct.'],
  ['Mars','Mars is fourth.'],
  ['Earth','Earth is third.']],1,1,'earth_q1'),
 earth('earth_07','Weathering and erosion differ because',[
  ['erosion breaks rock and weathering moves it','This reverses the two.'],
  ['weathering breaks rock down; erosion carries the pieces away','Correct.'],
  ['they are the same process','They are related but different.'],
  ['only erosion is caused by water','Water causes both.']],1,1),
 earth('earth_08','A tsunami is most often caused by',[
  ['strong winds over the sea','Wind makes ordinary waves.'],
  ['a sudden movement of the sea floor, such as an undersea earthquake','Correct. The sea floor pushes a huge volume of water.'],
  ['the Moon’s gravity','That causes tides.'],
  ['heavy rainfall','Rain causes floods, not tsunamis.']],1,2)
];
