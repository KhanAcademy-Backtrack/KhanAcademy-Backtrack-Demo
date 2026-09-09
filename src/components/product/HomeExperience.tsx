'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MathText } from '@/components/math/Math';

export function HomeExperience(){
  const [answer,setAnswer]=useState<'right'|'gap'|null>(null);
  const [choice,setChoice]=useState<string|null>(null);
  const reduce=useReducedMotion();
  const d=answer==='right'?'M 45 265 C 200 265 340 105 505 105 C 555 105 605 105 660 105':answer==='gap'?'M 45 265 C 150 265 160 370 265 370 C 435 370 360 105 505 105 C 560 105 610 105 660 105':'M 45 265 C 190 265 230 225 335 225 C 440 225 400 105 505 105 C 560 105 610 105 660 105';
  return <section className="home-stage">
    <div className="home-copy"><p className="eyebrow">Your GPS for learning</p><h1><span>Your GPS recalculates.</span><em>Why doesn’t learning?</em></h1><p className="home-sub">Miss a step, not your destination. Find what’s blocking today’s lesson, learn with Khan Academy, and get a new route forward.</p><Link className="button-primary" href="/start">Start your route <span aria-hidden="true">↗</span></Link><p className="fine-print">Free to try. No account needed.</p></div>
    <div className="home-map">
      <div className="home-destination"><span className="eyebrow">Today’s destination</span><p>Quadratic equations</p><MathText size="lg">x² + 7x + 12 = 0</MathText></div>
      <svg className="hero-route" viewBox="0 0 710 440" role="img" aria-label={answer==='gap'?'The route bends toward a factoring check, then reconnects to today’s quadratic.':answer==='right'?'A shorter route leads to a fresh verification at today’s destination.':'A route connects your current step to today’s quadratic.'}>
        <path d="M45 265 C200 265 300 105 505 105 L660 105" className="route-ghost"/>
        <motion.path d={d} animate={{d}} transition={{duration:reduce?0:.8,ease:[.22,1,.36,1]}} className={`route-stroke ${answer==='gap'?'detour':''}`}/>
        <circle cx="45" cy="265" r="9" className="route-origin"/><text x="30" y="236" className="map-label">YOU ARE HERE</text>
        {answer==='gap'&&<g><circle cx="265" cy="370" r="13" className="node-warm"/><text x="265" y="411" textAnchor="middle" className="map-label">CHECK THE FACTORS</text></g>}
        <circle cx="505" cy="105" r="10" className="node-idle"/><path d="M650 95 L660 105 L650 115" className="route-arrow"/>
      </svg>
      <div className="hero-question"><p className="eyebrow">Try a turn</p><p>Which pair multiplies to <strong>12</strong><br/>and adds to <strong>7</strong>?</p><div className="hero-options"><button onClick={()=>{setAnswer('gap');setChoice('pair');}} aria-pressed={choice==='pair'}>2 & 6</button><button onClick={()=>{setAnswer('right');setChoice('right');}} aria-pressed={choice==='right'}>3 & 4</button><button onClick={()=>{setAnswer('gap');setChoice('unsure');}} aria-pressed={choice==='unsure'}>I’m unsure</button></div><div className="hero-response" role="status">{answer==='right'?<><strong>That works. A shorter route opens.</strong><span>A fresh check comes next.</span></>:answer==='gap'?<><strong className="warm">Recalculating…</strong><span>The pair needs both the right product and sum.</span></>:<span>Your answer changes the route.</span>}</div></div>
    </div>
    <div className="home-bottom"><span>BACKTRACK finds the next step.</span><a className="khan-attribution" href="https://www.khanacademy.org/" target="_blank" rel="noopener noreferrer"><span>Learning resources from</span><img src="/khan-academy.svg" alt="Khan Academy" width="176" height="28"/></a><Link href="/how-it-works">See the loop ↗</Link></div>
  </section>;
}
