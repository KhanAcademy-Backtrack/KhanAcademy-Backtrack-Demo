'use client';

/* ==========================================================================
   The demo's screens.

   One switch over the state machine's `screen`. Each case is a composition of
   the parts in ./parts, so the screens stay readable and the rules stay in
   ../lib/demo-machine.ts where they can be checked.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MathText } from '@/components/math/Math';
import { AreaModel } from '@/components/math/AreaModel';
import { FactorPairs } from '@/components/math/FactorPairs';
import { KhanCheckpoint } from './KhanCheckpoint';
import {
  Actions,
  Aside,
  Choices,
  HonestLine,
  Moment,
  PaperPlate,
  RemovedList,
  SimBand,
  Task,
  Verdict,
  Why,
} from './parts';
import { Icon } from '@/components/ui/Icon';
import {
  BANK,
  BUDGETS,
  CONFIDENCE,
  DESTINATION,
  EXAMPLE,
  SKILLS,
  type ConfidenceId,
  type SkillId,
} from '@/lib/curriculum';
import type { Action, DemoState, Screen } from '@/lib/demo-machine';
import { currentGap, freshQuestionId, minutesSaved } from '@/lib/demo-machine';

type Send = (a: Action) => void;

export function Stage({ state, send }: { state: DemoState; send: Send }) {
  const go = (screen: Screen) => send({ type: 'goto', screen });
  const guided = state.mode === 'guided';

  switch (state.screen) {
    /* ----------------------------------------------------------------
       The front door.

       This used to be the second screen, behind a choice between "try it
       yourself" and "follow an example learner". Nobody can make that choice
       well before they know what either one contains, and it cost a click and
       a screen to ask it, so the live version is simply what happens and the
       worked example is an aside underneath.
       ---------------------------------------------------------------- */
    case 'session':
      return (
        <div className="mx-auto max-w-[1000px]">
          <p className="t-label text-chalk-faint">Step 1 of 2 to start</p>
          <h1 className="t-display mt-3 text-[2.2rem] leading-[1.02] sm:text-[3.1rem]">
            How much time do you have?
          </h1>
          <p className="mt-5 max-w-[58ch] text-[1.02rem] leading-relaxed text-chalk-muted">
            Your goal is at the top of the screen and it stays there.{' '}
            <strong className="font-semibold text-chalk">
              BACKTRACK works out what stands between you and that equation, then removes only that.
            </strong>{' '}
            Five minutes is a real answer: the route is built to finish rather than be abandoned.
          </p>

          <div className="mt-9 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
            {BUDGETS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => send({ type: 'budget', budget: b.id })}
                className="group bg-field p-6 text-left transition-colors hover:bg-field-high"
              >
                <p className="t-display text-[2rem] leading-none">{b.label}</p>
                <p className="t-label mt-2 text-chalk-faint">{b.sub}</p>
                <p className="mt-4 text-[0.9rem] leading-relaxed text-chalk-muted">{b.line}</p>
                <p className="t-label mt-5 flex items-center gap-1.5 text-chalk group-hover:text-now">
                  Start
                  <Icon name="chevron-right" size={12} strokeWidth={2.5} />
                </p>
                {guided && EXAMPLE.budget === b.id && (
                  <p className="t-label mt-3 text-recalc">Example learner picks this</p>
                )}
              </button>
            ))}
          </div>

          {!guided && (
            <p className="mt-7 text-[0.92rem] text-chalk-muted">
              Would rather watch than answer?{' '}
              <button
                type="button"
                className="btn-quiet text-route"
                onClick={() => send({ type: 'switchGuided' })}
              >
                Follow an example learner instead
              </button>
              . Their choices are flagged as you go.
            </p>
          )}

          <Aside summary="What this selector actually changes">
            It is not decorative. It changes how deep the route goes, which checks are worth
            spending your time on, and what BACKTRACK offers you next. The minute figures on the
            route are rough estimates for this example, not measurements.
          </Aside>
        </div>
      );

    /* ---------------------------------------------------------------- */
    case 'check': {
      const b = BUDGETS.find((x) => x.id === state.budget);
      return (
        <div className="mx-auto max-w-[1000px]">
          <Why label="Step 2 of 2 to start">
            Before routing you anywhere, BACKTRACK checks what you can already do.{' '}
            {b && <strong className="font-semibold text-chalk">{b.line}</strong>}
          </Why>
          <PaperPlate className="mt-8">
            <Task q={BANK.check} />
            <Choices
              q={BANK.check}
              onAnswer={(id) => send({ type: 'answer', qid: 'check', cid: id })}
              exampleId={guided ? EXAMPLE.check : null}
            />
          </PaperPlate>
          <p className="mt-7 text-[0.9rem] text-chalk-faint">
            Nothing here is graded. A wrong answer is the most useful thing you can give BACKTRACK:
            it is the only signal that says where to look.
          </p>
        </div>
      );
    }

    /* ---------------------------------------------------------------- */
    case 'check_result': {
      const q = BANK.check;
      const c = q.choices.find((x) => x.id === state.answer) ?? q.choices[0];
      const tone = c.correct ? 'good' : c.unsure ? 'info' : 'warn';
      const title = c.correct
        ? 'That works.'
        : c.unsure
          ? 'Useful answer.'
          : 'Not quite, and the reason is specific.';
      return (
        <div className="mx-auto max-w-[1000px]">
          <PaperPlate>
            <Task q={q} />
            <Choices q={q} answered={state.answer} onAnswer={() => {}} />
            <Verdict
              tone={tone}
              title={title}
              aside={
                c.id === 'pair' ? (
                  <PairBreakdown />
                ) : c.id === 'formula' ? (
                  'Factoring would have worked too, and it is faster here. Both are real routes through this equation.'
                ) : c.id === 'factor' ? (
                  'The quadratic formula would also have been correct. BACKTRACK does not have a preferred method. It has a destination.'
                ) : null
              }
            >
              {c.why}
            </Verdict>

            <div className="mt-10 border-t border-paper-line pt-8">
              <p className="t-label text-ink-muted">One more thing, then the route changes</p>
              <h3 className="mt-2 text-[1.4rem] font-medium text-ink">How did that feel?</h3>
              <p className="mt-2 max-w-[62ch] text-[0.95rem] leading-relaxed text-ink-muted">
                This never changes whether your answer was right. It changes what BACKTRACK checks
                next, so{' '}
                <strong className="font-semibold text-ink">honesty gives you a better route.</strong>
              </p>
              <div
                className="mt-5 grid gap-2 sm:grid-cols-2"
                role="group"
                aria-label="How confident were you"
              >
                {CONFIDENCE.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => send({ type: 'confidence', value: k.id as ConfidenceId })}
                    className="flex min-h-[56px] items-center justify-between gap-3 border border-paper-line px-5 text-left text-[1.02rem] text-ink transition-colors hover:border-ink hover:bg-ink/5"
                  >
                    {k.label}
                    {guided && EXAMPLE.confidence === k.id && (
                      <span className="t-label shrink-0 text-recalc-deep">Example learner</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </PaperPlate>
        </div>
      );
    }

    /* ---------------------------------------------------------------- */
    case 'shortcut': {
      const removedLabels = state.removed.map((id) => `Review: ${SKILLS[id].label.toLowerCase()}`);
      const n = state.removed.length;
      const saved = minutesSaved(state);
      return (
        <div className="mx-auto max-w-[1000px]">
          <Why>
            You answered the check correctly, so BACKTRACK has{' '}
            <strong className="font-semibold text-chalk">evidence</strong>, and it spends that
            evidence by taking work off your route, not by giving you a badge.
          </Why>
          <div className="mt-10">
            <Moment
              kind="shortcut"
              label="Shortcut found"
              line={
                n >= 3
                  ? 'You already know these steps.'
                  : n >= 1
                    ? 'Most of that review just left your route.'
                    : 'Your answer was right, but you told us you were guessing.'
              }
              sub={
                n >= 3
                  ? 'Gone because of your answer, not on a timer. The destination has not moved a millimetre.'
                  : n >= 1
                    ? 'One kept, because you said you only half-remembered it. BACKTRACK would rather verify once than assume.'
                    : 'Nothing removed yet. Every review stays until something confirms it. That is not a punishment for honesty. It is the route you actually asked for.'
              }
            >
              {n > 0 && (
                <>
                  <RemovedList items={removedLabels} />
                  {saved > 0 && (
                    <p className="mt-4 text-[0.9rem] text-chalk-faint">
                      Roughly {saved} minutes of work off this route. An estimate for this example, not
                      a measurement.
                    </p>
                  )}
                </>
              )}
            </Moment>
          </div>
          <Actions
            items={[
              { label: 'Try today’s equation', onClick: () => go('destination'), primary: true },
              !guided
                ? { label: 'See what happens when a step is missing', onClick: () => send({ type: 'switchGuided' }) }
                : null,
            ]}
          />
          <Aside summary="Was that review invented so it could be removed?">
            No. Those stops were on the route because BACKTRACK genuinely did not know yet whether
            you needed them, and your answer is what ruled them out.
          </Aside>
        </div>
      );
    }

    /* ---------------------------------------------------------------- */
    case 'contrast':
      return (
        <div className="mx-auto max-w-[1000px]">
          <Why tone="recalc">
            You were confident, and the answer was wrong. That usually means{' '}
            <strong className="font-semibold text-chalk">the rule in your head is different</strong>{' '}
            from the one on the page, which is worth separating from a careless slip before anything
            is added to your route.
          </Why>
          <PaperPlate className="mt-8">
            <Task q={BANK.contrast} />
            <Choices
              q={BANK.contrast}
              onAnswer={(id) => send({ type: 'answer', qid: 'contrast', cid: id })}
            />
          </PaperPlate>
        </div>
      );

    /* ---------------------------------------------------------------- */
    case 'probe':
      return (
        <div className="mx-auto max-w-[1000px]">
          <Why tone="recalc">
            One slip is not a diagnosis.{' '}
            <strong className="font-semibold text-chalk">
              BACKTRACK is checking the step underneath
            </strong>{' '}
            before it adds any review to your route.
          </Why>
          <PaperPlate className="mt-8">
            <Task q={BANK.probe} />
            <Choices
              q={BANK.probe}
              onAnswer={(id) => send({ type: 'answer', qid: 'probe', cid: id })}
              exampleId={guided ? EXAMPLE.probe : null}
            />
          </PaperPlate>
        </div>
      );

    /* ---------------------------------------------------------------- */
    case 'probe_ok':
      return (
        <div className="mx-auto max-w-[1000px]">
          <Why>The earlier step checked out, so nothing gets added to your route.</Why>
          <div className="mt-10">
            <Moment
              kind="shortcut"
              label="Route corrected"
              line="That was a slip, not a gap."
              sub={
                <>
                  You multiplied that out correctly, so the multiplication is not what is missing.{' '}
                  <strong className="font-semibold text-chalk">No review added.</strong> The stop stays
                  marked for another look later rather than being assumed either way.
                </>
              }
            />
          </div>
          <Actions
            items={[{ label: 'Try today’s equation', onClick: () => go('destination'), primary: true }]}
          />
        </div>
      );

    /* ---------------------------------------------------------------- */
    case 'gap': {
      const gap = currentGap(state);
      const deep = state.gaps.length > 1;
      const skill = gap ? SKILLS[gap] : SKILLS.factor;
      const never = state.confidence === 'never';
      return (
        <div className="mx-auto max-w-[1000px]">
          <Why tone="recalc">
            {never
              ? 'You said you had never been taught this one, so BACKTRACK is not going to spend ten questions proving it.'
              : deep
                ? 'The check underneath came back wrong too, so the route just went a level deeper, in front of you and not silently.'
                : 'Two answers now point at the same step, so BACKTRACK has stopped guessing and named it.'}
          </Why>
          <div className="mt-10">
            <Moment
              kind="gap"
              label={deep ? 'Recalculating' : 'Found the turn you missed'}
              line={skill.label}
              sub={
                <>
                  {deep
                    ? 'A stop inserted itself underneath the one you were already working on. Look at the route: it bends lower and comes back to the same destination.'
                    : 'That is what stands between you and today’s equation: one step, named precisely.'}{' '}
                  Not a verdict about you, and not a reason to restart the subject.
                </>
              }
            >
              <div className="flex flex-wrap items-center gap-4">
                <MathText size="md" className="text-chalk-muted">
                  {gap === 'distribute' ? '(x + 3)(x + 4)' : 'x² + 7x + 12'}
                </MathText>
                <span aria-hidden="true" className="text-chalk-faint">
                  →
                </span>
                <span className="sr-only">becomes</span>
                <MathText size="md" className="text-recalc">
                  {gap === 'distribute' ? 'x² + ?' : '(x + ?)(x + ?)'}
                </MathText>
              </div>
            </Moment>
          </div>
          <Actions
            items={[{ label: 'Repair this step', onClick: () => go('repair'), primary: true }]}
          />
        </div>
      );
    }

    /* ---------------------------------------------------------------- */
    case 'repair': {
      const gap = currentGap(state) ?? 'factor';
      return <RepairScreen gap={gap} state={state} send={send} />;
    }

    /* ---------------------------------------------------------------- */
    case 'fresh_check': {
      const gap = currentGap(state) ?? 'factor';
      const qid = freshQuestionId(gap);
      const q = BANK[qid];
      return (
        <div className="mx-auto max-w-[1000px]">
          <Why label="Prove it">
            Different numbers from the one you practised on. This is the only thing that marks the
            stop repaired, and{' '}
            <strong className="font-semibold text-chalk">getting it wrong costs you nothing</strong>:
            you get the reason and another go.
          </Why>
          <PaperPlate className="mt-8">
            <Task q={q} />
            {state.retry && (
              <Verdict tone="warn" title="Not yet." aside={state.retry.hint ? <><strong className="font-semibold text-ink">Hint.</strong> {state.retry.hint}</> : null}>
                {state.retry.why}
              </Verdict>
            )}
            <Choices q={q} onAnswer={(id) => send({ type: 'answer', qid, cid: id })} />
            <p className="mt-8 flex flex-wrap items-center justify-center gap-2 text-center text-[0.92rem] text-ink-muted">
              <Icon name="hint" size={16} className="text-ink-muted" />
              Stuck?{' '}
              <button type="button" className="btn-quiet" onClick={() => send({ type: 'assist' })}>
                Go back and work through it again
              </button>
            </p>
          </PaperPlate>
        </div>
      );
    }

    /* ---------------------------------------------------------------- */
    case 'capability': {
      const just = state.repaired[state.repaired.length - 1];
      const skill = SKILLS[just ?? 'factor'];
      const more = state.gaps.some((g) => !state.repaired.includes(g));
      return (
        <div className="mx-auto max-w-[1000px]">
          <Moment
            kind="capability"
            label="New capability"
            line={
              just === 'distribute'
                ? 'You can multiply out a pair of brackets.'
                : 'You can factor x² + bx + c.'
            }
            sub={
              state.assisted
                ? 'Recorded with the help you used, and you still answered a fresh question you could not answer a few minutes of route ago.'
                : 'You could not do that a few minutes of route ago. That is not a badge; it is a different set of things you can now attempt.'
            }
          >
            <div className="flex flex-wrap items-center gap-4">
              <MathText size="md" className="text-chalk-muted">
                {just === 'distribute' ? '(x + 2)(x + 5)' : 'x² + 10x + 21'}
              </MathText>
              <span aria-hidden="true" className="text-chalk-faint">
                →
              </span>
              <span className="sr-only">becomes</span>
              <MathText size="md" className="text-now">
                {just === 'distribute' ? 'x² + 7x + 10' : '(x + 3)(x + 7)'}
              </MathText>
            </div>
            <p className="mt-6 max-w-[54ch] text-[1rem] leading-relaxed text-chalk">
              {more ? (
                <>
                  <strong className="font-semibold">That was the deeper stop.</strong> The route now
                  comes back up to the one it was originally working on.
                </>
              ) : (
                <>
                  <strong className="font-semibold">That was the step blocking today’s equation.</strong>{' '}
                  Look at the top of the screen. The destination just came back to life.
                </>
              )}
            </p>
          </Moment>
          <Actions
            items={[
              {
                label: more ? 'Back up to the next stop' : 'Try today’s equation',
                onClick: () => send({ type: 'continue' }),
                primary: true,
              },
            ]}
          />
          <p className="mt-6 flex items-center gap-2 text-[0.9rem] text-chalk-faint">
            <Icon name="check" size={14} strokeWidth={2.5} className="text-route" />
            {skill.label} is marked repaired because of a fresh answer, not because a page was
            opened.
          </p>
        </div>
      );
    }

    /* ---------------------------------------------------------------- */
    case 'destination':
      return <DestinationScreen state={state} send={send} />;

    /* ---------------------------------------------------------------- */
    case 'solved':
      return (
        <div className="mx-auto max-w-[1000px]">
          <Moment
            kind="reached"
            label="Back on track"
            line="You solved a fresh version of the thing that stopped you."
            sub="Not the same numbers, and not the question you were practising on. The destination you started at is the destination you reached."
          >
            <div className="material-paper inline-block px-6 py-5">
              <MathText size="sm" className="text-ink">
                (−4)² + 9(−4) + 20 = 16 − 36 + 20 = 0
              </MathText>
              <br />
              <MathText size="sm" className="mt-2 inline-block text-ink">
                (−5)² + 9(−5) + 20 = 25 − 45 + 20 = 0
              </MathText>
              <p className="mt-3 text-[0.9rem] text-ink-muted">Both hold.</p>
            </div>
          </Moment>
          <Actions items={[{ label: 'Continue', onClick: () => go('next_turn'), primary: true }]} />
          <Aside summary="What this is not">
            One worked example inside a demonstration. It is not evidence that anything was
            retained, and BACKTRACK will not claim you have mastered quadratics on the strength of
            it. A real check would come back days later, with fresh questions, under supervision.
          </Aside>
        </div>
      );

    /* ---------------------------------------------------------------- */
    case 'next_turn':
      return (
        <div className="mx-auto max-w-[1000px]">
          <Why>Your route is already saved. This is optional, and nothing is lost by stopping here.</Why>
          <div className="mt-10">
            <Moment
              kind="shortcut"
              label="Next turn · 3 min"
              line="One quick check could remove the last review step."
              sub="No mystery box, no countdown, no streak to protect. The only reason to continue is that the next three minutes would visibly shorten your route."
            />
          </div>
          <Actions
            items={[
              { label: 'Take the next turn', onClick: () => go('next_turn_check'), primary: true },
              { label: 'Stop here, save my route', onClick: () => go('stopped') },
            ]}
          />
        </div>
      );

    case 'next_turn_check':
      return (
        <div className="mx-auto max-w-[1000px]">
          <Why>
            The last thing your route was holding in reserve:{' '}
            <strong className="font-semibold text-chalk">
              what a negative on the end does to the pair of numbers
            </strong>
            .
          </Why>
          <PaperPlate className="mt-8">
            <Task q={BANK.next_turn} />
            <Choices
              q={BANK.next_turn}
              onAnswer={(id) => send({ type: 'answer', qid: 'next_turn', cid: id })}
              exampleId={guided ? EXAMPLE.next_turn : null}
            />
          </PaperPlate>
        </div>
      );

    case 'next_turn_result':
      return (
        <div className="mx-auto max-w-[1000px]">
          {state.lastCorrect ? (
            <Moment
              kind="shortcut"
              label="Shortcut found"
              line="That was the last review step."
              sub="One small honest action, one visible change to the route. That is the entire mechanic, and there is not another offer queued behind it."
            >
              <RemovedList items={['Review: negative constants']} />
            </Moment>
          ) : (
            <Moment
              kind="gap"
              label="Route updated"
              line="The signs did not come out right."
              sub="Nothing is taken away for getting it wrong. The stop simply stays on your route until a fresh answer repairs it."
            />
          )}
          <Actions
            items={[
              { label: 'Preview coming back after a week', onClick: () => go('comeback_offer'), primary: true },
              { label: 'Stop here, save my route', onClick: () => go('stopped') },
            ]}
          />
          <p className="mt-7 text-[0.9rem] text-chalk-faint">
            One continuation was offered. No feed, no autoplay, and no second offer behind this one.
          </p>
        </div>
      );

    /* ---------------------------------------------------------------- */
    case 'comeback_offer':
      return (
        <div className="mx-auto max-w-[1000px]">
          <SimBand>
            <strong className="font-semibold">Simulated.</strong> No time is about to pass. This shows
            what BACKTRACK does when someone disappears for a week and comes back. The situation the
            product was built for.
          </SimBand>
          <Moment
            kind="shortcut"
            label="A week goes by"
            line="Something happened. It usually does."
            sub="On most systems this is the moment a streak breaks, a notification arrives with a sad flame on it, and the learner quietly stops coming back."
          />
          <Actions items={[{ label: 'Come back', onClick: () => go('comeback'), primary: true }]} />
        </div>
      );

    case 'comeback':
      return (
        <div className="mx-auto max-w-[1000px]">
          <SimBand>
            <strong className="font-semibold">Simulated: one week later.</strong> No real time has
            passed and nothing about you was stored anywhere.
          </SimBand>
          <h2 className="t-display text-[2.2rem] leading-tight sm:text-[3rem]">Welcome back.</h2>
          <div className="mt-6 border-l-2 border-route pl-5">
            <p className="t-label text-route">Still yours</p>
            <p className="mt-2 max-w-[58ch] text-[1rem] leading-relaxed text-chalk-muted">
              Everything you proved last time is intact. Nothing was reset, no streak was destroyed,
              and you are not starting from the beginning.
            </p>
          </div>
          <div className="mt-8">
            <Why>
              One short retrieval check decides whether to resume where you stopped or re-open a stop.
            </Why>
          </div>
          <PaperPlate className="mt-8">
            <Task q={BANK.comeback} />
            <Choices
              q={BANK.comeback}
              onAnswer={(id) => send({ type: 'answer', qid: 'comeback', cid: id })}
              exampleId={guided ? EXAMPLE.comeback : null}
            />
          </PaperPlate>
        </div>
      );

    case 'comeback_result':
      return (
        <div className="mx-auto max-w-[1000px]">
          {state.lastCorrect ? (
            <Moment
              kind="capability"
              label="Still there"
              line="It held over the gap."
              sub={
                <>
                  Resuming where you stopped.{' '}
                  <strong className="font-semibold text-chalk">
                    Streaks reward never falling off. BACKTRACK rewards getting back on.
                  </strong>
                </>
              }
            />
          ) : (
            <Moment
              kind="gap"
              label="Re-opening one stop"
              line="That one did not hold, which is completely normal."
              sub="The stop goes back on the route. No penalty, no lost progress, no message about your commitment. Forgetting is a routing problem, not a character flaw."
            />
          )}
          <Actions items={[{ label: 'Finish', onClick: () => go('end'), primary: true }]} />
        </div>
      );

    /* ---------------------------------------------------------------- */
    case 'stopped':
      return (
        <div className="mx-auto max-w-[1000px]">
          <Moment
            kind="shortcut"
            label="Route saved"
            line="You stopped where you wanted to."
            sub="Nothing is lost, nothing expires, and there is no penalty waiting for you next time."
          />
          <Actions
            items={[
              { label: 'Preview coming back after a week', onClick: () => go('comeback_offer'), primary: true },
              { label: 'Start again', onClick: () => send({ type: 'restart' }) },
            ]}
          />
        </div>
      );

    /* ---------------------------------------------------------------- */
    case 'end':
      return (
        <div className="mx-auto max-w-[1000px]">
          <p className="t-label text-chalk-faint">End of demo</p>
          <h2 className="t-display mt-4 text-[2.3rem] leading-tight sm:text-[3.2rem]">
            That is the whole loop.
          </h2>
          <ol className="mt-10 border-t border-hairline">
            {[
              'You arrived with something you needed now.',
              'You said how much time you had.',
              'BACKTRACK checked what you could already do.',
              'It kept what you proved and routed only the rest.',
              'Khan Academy carried the learning.',
              'You proved the change on a fresh question.',
              'The route got shorter and offered one useful next turn.',
              'A week away cost you nothing.',
            ].map((t, i) => (
              <li
                key={t}
                className="flex items-baseline gap-5 border-b border-hairline py-4 text-[1.02rem] text-chalk-muted"
              >
                <span className="t-label w-5 shrink-0 text-now">{String(i + 1).padStart(2, '0')}</span>
                {t}
              </li>
            ))}
          </ol>
          <Actions
            items={[
              { label: 'Start again', onClick: () => send({ type: 'restart' }), primary: true },
            ]}
          />
          <p className="mt-6 flex flex-wrap gap-5 text-[0.95rem]">
            <Link href="/evidence" className="btn-quiet text-route">
              See the evidence plan
            </Link>
            <Link href="/classrooms" className="btn-quiet text-route">
              How a school would use it
            </Link>
          </p>
          <HonestLine>
            <strong className="font-semibold text-chalk-muted">Status.</strong> An illustrative
            prototype built for KEIC 2026. No pilot results, no users, no partner schools. What you
            just used is the product logic, not evidence that it works. Mathematics is the proof
            domain, not the ceiling of the idea.
          </HonestLine>
        </div>
      );

    default:
      return null;
  }
}

/* ======================================================================
   Screens with local interaction state
   ====================================================================== */

/**
 * The repair.
 *
 * This screen used to stack four instructions on top of each other: why you
 * are here, a hands-on widget, a full Khan Academy panel, and a gate that
 * only opened once the widget was finished. Three of those competed to be the
 * primary action, and the fourth was a genuine trap: a learner who chose to
 * go and learn it on Khan Academy came back and found no way forward, because
 * the only route onward ran through a widget they had decided not to use.
 *
 * So the two ways of learning the step are now two lanes of one choice, only
 * one is on screen at a time, and the thing that actually decides anything,
 * the fresh question, is always reachable. That is not a loosened standard.
 * The standard was never "did you do the widget"; it was always "can you
 * answer a question you could not answer before", and that has not moved.
 */
function RepairScreen({ gap, state, send }: { gap: SkillId; state: DemoState; send: Send }) {
  const [done, setDone] = useState(false);
  const [lane, setLane] = useState<'here' | 'khan'>('here');
  const [visited, setVisited] = useState(false);
  const skill = SKILLS[gap];

  useEffect(() => {
    setDone(false);
    setVisited(false);
    setLane('here');
  }, [gap]);

  const ready = done || visited;

  return (
    <div className="mx-auto max-w-[1100px]">
      {/* --- 1. what this stop is, and why it is here ------------------ */}
      <p className="t-label text-recalc">Your next stop</p>
      <h2 className="t-display mt-2 text-[2rem] leading-[1.04] sm:text-[2.6rem]">{skill.label}</h2>
      <p className="mt-4 max-w-[62ch] text-[1rem] leading-relaxed text-chalk-muted">
        <strong className="font-semibold text-chalk">Why this is here.</strong> {skill.why}
      </p>

      {/* --- 2. two ways to learn it. One at a time. ------------------- */}
      <div className="mt-9" role="group" aria-label="How would you like to learn this step">
        <div className="flex flex-wrap gap-px border border-hairline bg-hairline">
          <LaneTab
            active={lane === 'here'}
            onClick={() => setLane('here')}
            title="Try it here"
            sub="Two minutes, hands on"
            done={done}
          />
          <LaneTab
            active={lane === 'khan'}
            onClick={() => setLane('khan')}
            title="Learn with Khan Academy"
            sub="A full lesson and practice"
            done={visited}
          />
        </div>

        <div className="mt-6">
          {lane === 'here' ? (
            <>
              {gap === 'distribute' ? (
                <AreaModel onComplete={setDone} />
              ) : (
                <FactorPairs onComplete={setDone} />
              )}
              {!done && (
                <p className="mt-4 text-[0.95rem] text-chalk-faint">
                  {gap === 'distribute'
                    ? 'Claim all four regions above, then combine the middle terms.'
                    : 'Place a pair that satisfies both conditions above.'}
                </p>
              )}
            </>
          ) : (
            <KhanCheckpoint skill={skill} onReturn={() => setVisited(true)} />
          )}
        </div>
      </div>

      {/* --- 3. the thing that actually decides ------------------------ */}
      <div className="mt-10 border-t border-hairline pt-7">
        <p className="t-label text-chalk-faint">When you are ready</p>
        <p className="mt-2 max-w-[58ch] text-[1rem] leading-relaxed text-chalk">
          BACKTRACK gives you a{' '}
          <strong className="font-semibold">new question with different numbers</strong>. That
          answer is the only thing that moves this stop off your route.
        </p>
        <Actions
          items={[
            {
              label: 'Check my understanding',
              onClick: () => send({ type: 'goto', screen: 'fresh_check' }),
              primary: ready,
            },
          ]}
        />
        {!ready && (
          <p className="mt-3 text-[0.85rem] text-chalk-faint">
            You can go straight there if you already know this.
          </p>
        )}
      </div>

      <Aside summary="Why a link click is not enough">
        BACKTRACK cannot see anything that happens on khanacademy.org, so opening a resource can
        never mark a stop repaired. Learn it however you like, here, there, from a teacher or from
        your own notes; the fresh question is what the route responds to.{' '}
        {state.assisted && 'You asked to work through it again, and that is recorded next to your answer.'}
      </Aside>
    </div>
  );
}

function LaneTab({
  active,
  onClick,
  title,
  sub,
  done,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
  done: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex min-w-[200px] flex-1 items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${
        active ? 'bg-field-high' : 'bg-field hover:bg-field-high/60'
      }`}
    >
      {active && (
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-route" />
      )}
      <span className="min-w-0">
        <span
          className={`block text-[1.05rem] font-medium ${active ? 'text-chalk' : 'text-chalk-muted'}`}
        >
          {title}
        </span>
        <span className={`t-label mt-1 block ${active ? 'text-route' : 'text-chalk-faint'}`}>
          {sub}
        </span>
      </span>
      {done && <Icon name="check" size={16} strokeWidth={2.5} className="text-route" />}
    </button>
  );
}

function DestinationScreen({ state, send }: { state: DemoState; send: Send }) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (state.solveError) inputRef.current?.select();
  }, [state.solveError]);

  return (
    <div className="mx-auto max-w-[1000px]">
      <Why label="The destination">
        The same equation that has been at the top of the screen all session,{' '}
        <strong className="font-semibold text-chalk">with different numbers</strong>. Nothing about
        where you were going has moved.
      </Why>

      <PaperPlate className="mt-8">
        <div className="text-center">
          <p className="t-label text-ink-muted">One turn away from today’s lesson</p>
          <MathText size="hero" as="div" className="mt-4 block text-ink">
            {DESTINATION.fresh}
          </MathText>
          <h2 className="mt-6 text-[1.35rem] font-medium text-ink sm:text-[1.6rem]">
            Solve for x.
          </h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-[0.95rem] leading-relaxed text-ink-muted">
            There are two answers. Type them however you like, “−4, −5” or “x = −4 and x = −5” both
            work.
          </p>
        </div>

        <form
          className="mx-auto mt-8 flex max-w-[520px] flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            send({ type: 'solve', raw: value });
          }}
        >
          <label className="sr-only" htmlFor="solve-input">
            Your answers for x
          </label>
          <input
            id="solve-input"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="math min-h-[56px] flex-1 border border-paper-line bg-transparent px-4 text-2xl text-ink outline-none placeholder:font-sans placeholder:text-[1rem] placeholder:text-ink-muted/70 focus:border-ink"
            placeholder="x = ?"
            autoComplete="off"
            inputMode="text"
            aria-describedby="solve-help"
          />
          <button type="submit" className="btn btn-on-paper">
            Check
          </button>
        </form>

        <p id="solve-help" className="mt-4 min-h-[24px] text-center text-[0.95rem]">
          <AnimatePresence mode="wait">
            {state.solveError && (
              <motion.span
                key={state.solveError}
                initial={reduced ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-recalc-deep"
              >
                {state.solveError}
              </motion.span>
            )}
          </AnimatePresence>
        </p>

        <p className="mt-2 text-center text-[0.92rem] text-ink-muted">
          <button type="button" className="btn-quiet" onClick={() => send({ type: 'toggleMethods' })}>
            {state.showMethods ? 'Hide the two methods' : 'Show two valid methods'}
          </button>
        </p>

        <AnimatePresence>
          {state.showMethods && (
            <motion.div
              initial={reduced ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 grid gap-px border border-paper-line bg-paper-line sm:grid-cols-2">
                <div className="bg-paper p-5">
                  <p className="t-label text-ink-muted">Method A · factor</p>
                  <div className="mt-4 space-y-3">
                    <MathText size="sm" className="block text-ink">
                      (x + 4)(x + 5) = 0
                    </MathText>
                    <MathText size="sm" className="block text-ink">
                      x + 4 = 0 or x + 5 = 0
                    </MathText>
                    <MathText size="sm" className="block text-ink">
                      x = −4 or x = −5
                    </MathText>
                  </div>
                </div>
                <div className="bg-paper p-5">
                  <p className="t-label text-ink-muted">Method B · quadratic formula</p>
                  <div className="mt-4 space-y-3">
                    <MathText size="sm" className="block text-ink">
                      {'x = \\frac{−9 ± \\sqrt{81 − 80}}{2}'}
                    </MathText>
                    <MathText size="sm" className="block text-ink">
                      {'x = \\frac{−9 ± 1}{2}'}
                    </MathText>
                    <MathText size="sm" className="block text-ink">
                      x = −4 or x = −5
                    </MathText>
                  </div>
                  <p className="mt-3 text-[0.85rem] text-ink-muted">
                    More steps here. Equally correct.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PaperPlate>
    </div>
  );
}

function PairBreakdown() {
  return (
    <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
      <span className="flex items-center gap-2 text-route-deep">
        <MathText size="xs">6 × 2 = 12</MathText>
        <span aria-hidden="true">✓</span>
        <span className="sr-only">correct</span>
      </span>
      <span className="flex items-center gap-2 text-recalc-deep">
        <MathText size="xs">6 + 2 = 8</MathText>
        <span aria-hidden="true">✗</span>
        <span className="sr-only">but the middle term needs 7</span>
      </span>
    </div>
  );
}
