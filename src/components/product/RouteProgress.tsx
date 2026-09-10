import {recentSuccesses,type Recovery} from '@/lib/recovery';
export function RouteProgress({state:s}:{state:Recovery}){
 const total=new Set([...s.planned,...s.passed]).size;
 const passed=new Set(s.passed).size;
 const checkingReturn=s.returnCheck&&['check','feedback'].includes(s.phase);
 const amount=checkingReturn?Math.min(2,recentSuccesses(s,'goal')):s.goalPassed?total*2:Math.min(total*2,passed*2+(s.passed.includes(s.active)?0:Math.min(1,recentSuccesses(s,s.active))));
 const max=checkingReturn?2:total*2;
 const label=checkingReturn?'Checking what stayed':s.goalPassed?'Today’s goal checked':`${passed} of ${total} route steps checked`;
 return <div className="goal-progress"><span>{label}</span><progress value={amount} max={max} aria-label={label}/></div>;
}
