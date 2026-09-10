import type {GraphData} from '@/lib/recovery';
export function GraphBoard({graph,guide=false}:{graph:GraphData;guide?:boolean}){
  const maxX=Math.max(6,graph.x+2),m=graph.slope??1,b=graph.intercept??0;
  const maxY=Math.ceil((graph.kind==='point'?(graph.y??0)+2:m*maxX+b+1)/5)*5;
  const x=(n:number)=>42+n/maxX*292,y=(n:number)=>232-n/maxY*204;
  const alt=graph.kind==='point'?`A coordinate grid. Point P is ${graph.x} units right and ${graph.y} units above the origin.`:`A coordinate grid with a straight line through (0, ${b}) and (${maxX}, ${m*maxX+b}). Read its height when x is ${graph.x}.`;
  const yStep=maxY<=20?1:Math.ceil(maxY/20);
  return <figure className="graph-board"><svg viewBox="0 0 380 296" role="img" aria-label={alt}>
    {Array.from({length:maxX+1},(_,i)=><g key={`x${i}`}><line x1={x(i)} x2={x(i)} y1={28} y2={232} stroke="#dce4ef"/><text x={x(i)} y={251} textAnchor="middle">{i}</text></g>)}
    {Array.from({length:Math.floor(maxY/yStep)+1},(_,j)=>j*yStep).map(i=><g key={`y${i}`}><line x1={42} x2={334} y1={y(i)} y2={y(i)} stroke={i%5===0?'#c7d3e1':'#e7edf5'}/>{i%Math.max(yStep,Math.ceil(maxY/10/yStep)*yStep)===0&&<text x={31} y={y(i)+4} textAnchor="end">{i}</text>}</g>)}
    {graph.kind==='line'&&<><rect x={x(graph.x)-14} y={238} width={28} height={23} rx={5} fill="#b8eee0"/><text x={x(graph.x)} y={253} textAnchor="middle" fill="#0a2a66" fontWeight="700">{graph.x}</text><path d={`M${x(graph.x)} 225 v-20 m-5 6 5-6 5 6`} stroke="#0a2a66" fill="none" strokeWidth={2}/></>}
    <path d="M42 22 V232 H343 M37 28 l5-6 5 6 M337 227 l6 5-6 5" fill="none" stroke="#0a2a66" strokeWidth="1.5"/><text x={185} y={283} textAnchor="middle">x · across</text><text x={12} y={16}>y · up</text>
    {graph.kind==='point'?<><circle cx={x(graph.x)} cy={y(graph.y??0)} r={11} fill="#b8eee0"/><circle cx={x(graph.x)} cy={y(graph.y??0)} r={6} fill="#0a2a66"/><text x={x(graph.x)+13} y={y(graph.y??0)-11} fill="#0a2a66">P</text></>:<line x1={x(0)} y1={y(b)} x2={x(maxX)} y2={y(m*maxX+b)} stroke="#0a2a66" strokeWidth={3}/>}
    {guide&&<><path d={`M${x(graph.x)} 232 V${y(graph.kind==='point'?graph.y??0:m*graph.x+b)} H42`} fill="none" stroke="#0a2a66" strokeWidth={2} strokeDasharray="5 4"/><circle cx={x(graph.x)} cy={y(graph.kind==='point'?graph.y??0:m*graph.x+b)} r={5} fill="#0a2a66"/></>}
  </svg><figcaption>{graph.kind==='point'?'Read across for x, then up for y.':`Start at the highlighted x = ${graph.x}. Read up to the line.`}<span>Each horizontal grid step is 1. Each vertical step is {yStep}.</span></figcaption></figure>;
}
