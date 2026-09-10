'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';
import { MathText } from '@/components/math/Math';
import { heroRoutePath } from '@/lib/route-geometry';

const INITIAL_PATH=heroRoutePath(null);

export function HomeExperience(){
  const [answer,setAnswer]=useState<'right'|'gap'|null>(null);
  const [choice,setChoice]=useState<string|null>(null);
  const reduce=useReducedMotion();
  const controls=useAnimationControls();
  const d=heroRoutePath(answer);
  useEffect(()=>{
    if(!choice||reduce){controls.set({d,pathLength:1,opacity:1});return;}
    void controls.start({d,pathLength:[.55,1],opacity:[.45,1]}, {duration:.8,ease:[.22,1,.36,1]});
    return ()=>controls.stop();
  },[choice,d,reduce,controls]);
  return <section className="home-stage">
    <div className="home-copy"><p className="eyebrow">Your GPS for learning</p><h1><span>Stuck on a problem?</span><em>Find what’s missing.</em></h1><p className="home-sub">You can study a whole lesson and still miss what is stopping you. Check the step, see why it breaks, then practise with Khan and try again.</p><Link className="button-primary" href="/demo">Try the demo <span aria-hidden="true">↗</span></Link><Link className="home-topic-link" href="/start">Choose your own topic ↗</Link><p className="fine-print">Free to try. No account needed.</p></div>
    <div className="home-map">
      <div className="home-destination"><span className="eyebrow">Today’s goal</span><p>Quadratic equations</p><MathText size="lg">x² + 7x + 12 = 0</MathText></div>
      <div className="hero-question"><p className="eyebrow">Start with one small check</p><p>Which pair multiplies to <strong>12</strong> and adds to <strong>7</strong>?</p><div className="hero-options"><button onClick={()=>{setAnswer('gap');setChoice('pair');}} aria-pressed={choice==='pair'}>2 & 6</button><button onClick={()=>{setAnswer('right');setChoice('right');}} aria-pressed={choice==='right'}>3 & 4</button><button onClick={()=>{setAnswer('gap');setChoice('unsure');}} aria-pressed={choice==='unsure'}>I’m unsure</button></div></div>
      <figure className="hero-journey" data-direct={answer==='right'}>
        <figcaption className="eyebrow">Route preview</figcaption>
        <div className="hero-directions">
          <svg viewBox="0 0 640 230" preserveAspectRatio="none" aria-hidden="true">
            <path d={d} className="hero-road-case"/>
            <motion.path initial={{d:INITIAL_PATH,pathLength:1,opacity:1}} animate={controls} data-testid="hero-animated-route" className="route-stroke"/>
          </svg>
          <ol className="hero-stops">
            <li><span className="hero-stop-number">1</span><strong>Check factors</strong><small>This question</small></li>
            <li>{answer==='right'?<><span className="hero-skip">✓</span><strong>Possible shortcut</strong><small>Confirm with a fresh check</small></>:<><span className="hero-stop-number">2</span><strong>Review factors</strong><small>{answer==='gap'?'A focused Khan stop':'Only if needed'}</small></>}</li>
            <li><span className="hero-stop-number">{answer==='right'?'2':'3'}</span><strong>Try the equation</strong><small>The next task</small></li>
          </ol>
        </div>
      </figure>
      <div className="hero-response" role="status">{answer==='right'?<><strong>3 × 4 = 12. 3 + 4 = 7.</strong><span>One fresh check can help confirm whether you need this review.</span></>:answer==='gap'?<><strong>{choice==='unsure'?'Start with a short factor review.':'2 × 6 = 12, but 2 + 6 = 8.'}</strong><span>Check this possible gap, then get the explanation you need.</span></>:<span>Choose an answer above to see the route change.</span>}</div>{answer&&<Link className="hero-next-link" href={answer==='right'?'/try/factors':'/demo?turn=factors'}>{answer==='right'?'Try a fresh check ↗':'Show me the next step ↗'}</Link>}
    </div>
    <div className="home-bottom"><span>BACKTRACK finds the next step.</span><a className="khan-attribution" href="https://www.khanacademy.org/" target="_blank" rel="noopener noreferrer"><span>Learning resources from</span><img src="/khan-academy.svg" alt="Khan Academy" width="176" height="28"/></a><Link href="/how-it-works">See the loop ↗</Link></div>
  </section>;
}
