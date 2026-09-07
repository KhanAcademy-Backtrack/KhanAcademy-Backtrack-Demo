/* ==========================================================================
   BACKTRACK — interactive demo
   An explicit state machine over a data-driven question bank. No sign-in, no
   learner records, no generative endpoint, no eval of visitor input.

   Two rules this file exists to enforce:
     1. Correctness is decided by mathematics alone.
     2. Self-reported confidence changes what BACKTRACK checks next — never
        whether an answer was right.

   Presentation rule: the mathematics is the interface. Every screen puts the
   expression first at full size, states in one line why the learner is here,
   and keeps the destination anchored above.
   ========================================================================== */
(function () {
  'use strict';

  var STORE = 'backtrack.demo.v1';
  var DEST_EQ = { text: '4(x − 3) = 20', spoken: '4 times, open bracket, x minus 3, close bracket, equals 20' };

  /* ======================================================================
     QUESTION BANK
     Both valid first steps for 3(x − 2) = 15 are correct: distributing and
     dividing through by 3. Requiring distribution would be false mathematics.
     ====================================================================== */

  var BANK = {
    first_step: {
      id: 'first_step',
      task: '3(x − 2) = 15',
      spoken: '3 times, open bracket, x minus 2, close bracket, equals 15',
      prompt: 'Which is a valid first step?',
      help: 'More than one of these is correct. There is usually more than one honest way through a problem.',
      choices: [
        { id: 'distribute', text: '3x − 6 = 15', spoken: '3 x minus 6 equals 15', correct: true,
          why: 'Correct — you multiplied both terms inside the bracket by 3.' },
        { id: 'divide', text: 'x − 2 = 5', spoken: 'x minus 2 equals 5', correct: true,
          why: 'Also correct — you divided both sides by 3 before touching the bracket. Fewer steps, same answer.' },
        { id: 'partial', text: '3x − 2 = 15', spoken: '3 x minus 2 equals 15', correct: false,
          why: 'The 3 reached the x but not the 2. Only the first term inside the bracket was multiplied.' },
        { id: 'unsure', text: 'I don’t know yet', kind: 'unsure',
          why: 'That is useful information, not a wrong answer.' }
      ]
    },

    probe: {
      id: 'probe',
      task: '2(y + 4)',
      spoken: '2 times, open bracket, y plus 4, close bracket',
      prompt: 'Expand this bracket.',
      help: 'One earlier step, to find out whether the bracket rule is what is in the way.',
      choices: [
        { id: 'p_ok', text: '2y + 8', spoken: '2 y plus 8', correct: true,
          why: 'Both terms were multiplied by 2.' },
        { id: 'p_half', text: '2y + 4', spoken: '2 y plus 4', correct: false,
          why: 'The 2 multiplied the y but not the 4. This is the same step that slipped a moment ago.' },
        { id: 'p_drop', text: 'y + 8', spoken: 'y plus 8', correct: false,
          why: 'The 4 was multiplied by 2, but the y was left alone.' },
        { id: 'unsure', text: 'I don’t know yet', kind: 'unsure',
          why: 'Then this is worth repairing rather than guessing at.' }
      ]
    },

    contrast: {
      id: 'contrast',
      task: '5(x + 1)',
      spoken: '5 times, open bracket, x plus 1, close bracket',
      prompt: 'Expand this bracket.',
      help: 'You were sure of the last answer, so this checks whether the rule is different in your head or whether that was a slip.',
      choices: [
        { id: 'c_ok', text: '5x + 5', spoken: '5 x plus 5', correct: true,
          why: 'Both terms multiplied by 5.' },
        { id: 'c_half', text: '5x + 1', spoken: '5 x plus 1', correct: false,
          why: 'The 5 reached the x but not the 1 — the same pattern as before, so it is the rule rather than a slip.' },
        { id: 'unsure', text: 'I don’t know yet', kind: 'unsure',
          why: 'Fair enough — we will repair the rule rather than test it again.' }
      ]
    },

    fresh: {
      id: 'fresh',
      task: '5(z − 2)',
      spoken: '5 times, open bracket, z minus 2, close bracket',
      prompt: 'Expand this bracket.',
      help: 'New letters, new numbers, and a subtraction this time.',
      choices: [
        { id: 'f_ok', text: '5z − 10', spoken: '5 z minus 10', correct: true,
          why: 'Both terms multiplied by 5, and the minus sign carried through.' },
        { id: 'f_half', text: '5z − 2', spoken: '5 z minus 2', correct: false,
          why: 'The 5 multiplied the z but not the 2.',
          hint: 'The 5 has to reach both terms inside the bracket. What is 5 × 2?' },
        { id: 'f_sign', text: '5z + 10', spoken: '5 z plus 10', correct: false,
          why: 'The multiplication is right, but the sign flipped.',
          hint: 'The bracket contains a subtraction, so the 10 is taken away.' },
        { id: 'f_drop', text: 'z − 10', spoken: 'z minus 10', correct: false,
          why: 'The 2 was multiplied by 5, but the z was left alone.',
          hint: 'Both terms get multiplied — including the one with the letter.' }
      ]
    },

    next_turn: {
      id: 'next_turn',
      task: '−2(x + 5)',
      spoken: 'negative 2 times, open bracket, x plus 5, close bracket',
      prompt: 'Expand this bracket.',
      help: 'A negative outside the bracket — the step your route still had marked as review.',
      choices: [
        { id: 'n_ok', text: '−2x − 10', spoken: 'negative 2 x minus 10', correct: true,
          why: 'The negative multiplied both terms, so both came out negative.' },
        { id: 'n_sign', text: '−2x + 10', spoken: 'negative 2 x plus 10', correct: false,
          why: 'The second term kept its plus sign. A negative times a positive is negative.' },
        { id: 'n_half', text: '−2x + 5', spoken: 'negative 2 x plus 5', correct: false,
          why: 'The −2 reached the x but not the 5.' }
      ]
    },

    comeback: {
      id: 'comeback',
      task: '3(a + 2)',
      spoken: '3 times, open bracket, a plus 2, close bracket',
      prompt: 'Expand this bracket.',
      help: 'Not a test. It tells BACKTRACK whether to resume where you stopped or re-open a step.',
      choices: [
        { id: 'b_ok', text: '3a + 6', spoken: '3 a plus 6', correct: true,
          why: 'Still there.' },
        { id: 'b_half', text: '3a + 2', spoken: '3 a plus 2', correct: false,
          why: 'The 3 reached the a but not the 2.' },
        { id: 'unsure', text: 'I don’t remember', kind: 'unsure',
          why: 'Then the route re-opens that step instead of assuming it stuck.' }
      ]
    }
  };

  var CONFIDENCE = [
    { id: 'confident',     label: 'I know this' },
    { id: 'remember',      label: 'I kind of remember' },
    { id: 'dont_know',     label: 'I genuinely don’t remember' },
    { id: 'never_learned', label: 'I’ve never learned this' }
  ];

  var BUDGETS = [
    { id: 5,  label: '5 min',  sub: 'I’m cooked',            line: 'One useful block. Nothing more.' },
    { id: 15, label: '15 min', sub: 'I can do something',    line: 'Enough to find the step and repair it.' },
    { id: 30, label: '30 min', sub: 'normal',                line: 'Room to repair the step and come back to today’s task.' },
    { id: 60, label: '60 min', sub: 'lock in',               line: 'Room to consolidate afterwards, so it holds next week.' }
  ];

  var EXAMPLE = {
    first_step: 'partial', confidence: 'remember', probe: 'p_half',
    fresh: 'f_ok', next_turn: 'n_ok', comeback: 'b_ok'
  };

  /* ======================================================================
     STATE
     ====================================================================== */

  function initialState() {
    return {
      mode: null, screen: 'mode', budget: null, evidence: [],
      removed: [], keepToVerify: false, gapSkill: null,
      unlocked: false, solvedDestination: false,
      nextTurnDone: false, comebackDone: false,
      assisted: false, attempts: 0,
      answer: null, retry: null, manipDone: false
    };
  }

  var state = initialState();
  var timeline = [];
  var pos = 0;
  var route = null;
  var stage, liveRegion, backBtn, anchorEq, anchorState, routeDetail, routeCount, routeRegion, routeToggle;
  var manip = { picked: [] };

  /* ======================================================================
     ROUTE MODEL — derived from state, never mutated ad hoc
     ====================================================================== */

  function routeFor(s) {
    var n = [];
    n.push({ id: 'here', label: 'You are here', status: 'checked' });

    var bracketStatus = 'unknown';
    if (hasEvidence(s, 'first_step')) {
      bracketStatus = evidenceFor(s, 'first_step').correct ? 'checked' : 'uncertain';
    }
    if (s.solvedDestination) bracketStatus = 'checked';
    n.push({ id: 'bracket', label: 'Bracket step', status: bracketStatus, active: s.screen === 'task1' });

    /* Provisional review steps: on the route because BACKTRACK does not yet
       know whether they are needed, and gone as soon as it does. */
    if (s.removed.indexOf('rev_expand') === -1) {
      n.push({
        id: 'rev_expand', label: 'Expanding brackets',
        note: s.gapSkill !== 'expand' ? 'provisional' : (s.unlocked ? 'repaired' : 'repair this'),
        branch: true,
        status: s.gapSkill === 'expand'
          ? (s.unlocked ? 'capability_unlocked' : 'practice_suggested')
          : 'unknown',
        active: ['learn', 'fresh_check', 'gap_found'].indexOf(s.screen) >= 0
      });
    }
    if (s.removed.indexOf('rev_negative') === -1) {
      n.push({
        id: 'rev_negative', label: 'Negative terms',
        note: s.keepToVerify ? 'kept to verify' : 'provisional',
        branch: true,
        status: s.nextTurnDone ? 'checked' : 'unknown',
        active: s.screen === 'next_turn_check'
      });
    }
    if (s.budget === 60 && !s.comebackDone) {
      n.push({ id: 'consolidate', label: 'Consolidate', note: 'time allows', branch: true, status: 'unknown' });
    }
    if (s.gapSkill) {
      n.push({
        id: 'freshcheck', label: 'Fresh check',
        status: s.unlocked ? 'checked' : 'unknown',
        active: s.screen === 'fresh_check'
      });
    }
    n.push({
      id: 'dest', kind: 'destination', label: 'Today’s equation',
      status: s.solvedDestination ? 'reached'
            : (s.unlocked || bracketStatus === 'checked') ? 'ready_to_try' : 'unknown',
      active: s.screen === 'destination_task'
    });
    return { nodes: n, annotation: s.annotation || null };
  }

  function hasEvidence(s, qid) { return s.evidence.some(function (e) { return e.questionId === qid; }); }
  function evidenceFor(s, qid) {
    var f = null; s.evidence.forEach(function (e) { if (e.questionId === qid) f = e; }); return f;
  }
  function destinationOpen(s) {
    return s.solvedDestination || s.unlocked ||
      (hasEvidence(s, 'first_step') && evidenceFor(s, 'first_step').correct);
  }

  /* ======================================================================
     HELPERS
     ====================================================================== */

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Semantic math: visible glyphs plus a spoken equivalent. Never parsed. */
  function eq(text, spoken, cls) {
    return '<span class="eq ' + (cls || 'eq-lg') + '" role="math" aria-label="' +
      esc(spoken || text) + '">' + esc(text) + '</span>';
  }

  /* One line, on every screen: why am I doing this? */
  function why(text, tone) {
    return '<p class="why' + (tone === 'caution' ? ' is-caution' : '') + '">' + text + '</p>';
  }

  function task(q) {
    return '<div class="task">' +
      '<div class="task-eq">' + eq(q.task, q.spoken, 'eq-hero') + '</div>' +
      '<h2 class="task-prompt">' + esc(q.prompt) + '</h2>' +
      (q.help ? '<p class="task-note">' + esc(q.help) + '</p>' : '') +
      '</div>';
  }

  function choices(q, answeredId) {
    var html = '<div class="choices" role="group" aria-label="' + esc(q.prompt) + '">';
    q.choices.forEach(function (c) {
      var wide = c.kind === 'unsure' ? ' choice-wide' : '';
      var st = '', mark = '';
      if (answeredId) {
        if (c.id === answeredId) {
          st = c.correct ? 'correct' : (c.kind === 'unsure' ? 'chosen' : 'wrong');
          mark = '<span class="choice-mark">' +
            (st === 'correct' ? '<span class="glyph" aria-hidden="true">✓</span>Correct'
             : st === 'wrong' ? '<span class="glyph" aria-hidden="true">✗</span>Not this one'
             : 'Your answer') + '</span>';
        } else { st = 'dim'; }
      }
      var isExample = !answeredId && state.mode === 'guided' && EXAMPLE[q.id] === c.id;
      html += '<button class="choice' + wide + '"' +
        (answeredId ? ' data-state="' + st + '" disabled' : '') +
        ' data-action="answer" data-q="' + q.id + '" data-c="' + c.id + '">' +
        (c.kind === 'unsure'
          ? '<span class="choice-plain">' + esc(c.text) + '</span>'
          : eq(c.text, c.spoken, 'eq-md')) +
        mark +
        (isExample ? '<span class="choice-flag">Example learner picked this</span>' : '') +
        '</button>';
    });
    return html + '</div>';
  }

  function verdict(tone, title, body, extra) {
    return '<div class="verdict tone-' + tone + '" role="status">' +
      '<p class="verdict-head"><span class="verdict-glyph" aria-hidden="true">' +
        (tone === 'good' ? '✓' : tone === 'warn' ? '!' : 'i') + '</span>' + esc(title) + '</p>' +
      '<p class="verdict-body">' + body + '</p>' + (extra || '') + '</div>';
  }

  function actions(list) {
    var h = '<div class="actions">';
    list.forEach(function (a) {
      if (!a) return;
      h += '<button class="btn ' + (a.primary ? 'btn-primary' : 'btn-ghost') + '" data-action="' +
        a.action + '"' + (a.value != null ? ' data-value="' + esc(a.value) + '"' : '') + '>' +
        esc(a.label) + '</button>';
    });
    return h + '</div>';
  }

  /* The body sits inside the moment so each beat of the reward sequence can be
     timed off one container. */
  function moment(kind, label, line, sub, body) {
    return '<div class="moment moment-' + kind + '">' +
      '<p class="moment-label">' + esc(label) + '</p>' +
      '<h2 class="moment-line">' + line + '</h2>' +
      (sub ? '<p class="moment-sub">' + sub + '</p>' : '') +
      (body || '') +
      '</div>';
  }

  function choiceById(q, id) {
    var f = null; q.choices.forEach(function (c) { if (c.id === id) f = c; }); return f || q.choices[0];
  }

  /* ======================================================================
     SCREENS
     ====================================================================== */

  var SCREENS = {};

  SCREENS.mode = function () {
    return '<div class="screen">' +
      '<p class="label">Interactive demo</p>' +
      '<h1 class="display t-section" style="margin:14px 0 18px">Two ways to see this work.</h1>' +
      '<p class="t-lead">No sign-in. Nothing is recorded about you. The route you see is built from the answers you actually give.</p>' +
      '<div class="modes">' +
        '<button class="mode-card" data-action="mode" data-value="live">' +
          '<span class="mode-name">Try it yourself</span>' +
          '<span class="mode-sub">BACKTRACK responds to your real answers. Right or wrong, the route follows the evidence.</span>' +
          '<span class="mode-go">Start<span aria-hidden="true"> →</span></span>' +
        '</button>' +
        '<button class="mode-card" data-action="mode" data-value="guided">' +
          '<span class="mode-name">Follow an example learner</span>' +
          '<span class="mode-sub">A fictional learner walks the recovery path. Clearly marked as an illustration throughout.</span>' +
          '<span class="mode-go">Watch<span aria-hidden="true"> →</span></span>' +
        '</button>' +
      '</div></div>';
  };

  SCREENS.intro = function () {
    var h = '<div class="screen">' +
      why('Today’s goal is above, and it stays there. <strong>BACKTRACK’s job is to work out what is standing between you and that equation</strong> — then remove only that.') +
      '<h2 class="task-prompt" style="text-align:left;font-size:26px">How much do you have in you today?</h2>' +
      '<p class="task-note" style="margin:0;max-width:56ch">Five minutes is a real answer, not a failure. BACKTRACK picks a block that finishes rather than one that gets abandoned.</p>' +
      '<div class="budgets">';
    BUDGETS.forEach(function (b) {
      h += '<button class="budget" data-action="budget" data-value="' + b.id + '">' +
        '<span class="budget-time">' + esc(b.label) + '</span>' +
        '<span class="budget-sub">' + esc(b.sub) + '</span></button>';
    });
    return h + '</div></div>';
  };

  SCREENS.task1 = function (s) {
    var b = BUDGETS.filter(function (x) { return x.id === s.budget; })[0];
    return '<div class="screen">' +
      why('Before routing you anywhere, BACKTRACK checks what you can already do. ' +
          (b ? '<strong>' + esc(b.line) + '</strong>' : '')) +
      task(BANK.first_step) +
      choices(BANK.first_step) +
      '</div>';
  };

  SCREENS.task1_result = function (s) {
    var q = BANK.first_step;
    var c = choiceById(q, s.answer);
    var tone = c.correct ? 'good' : (c.kind === 'unsure' ? 'info' : 'warn');
    var title = c.correct ? 'That works.' : (c.kind === 'unsure' ? 'Useful answer.' : 'Not quite — and the reason is specific.');

    var extra = '';
    if (c.id === 'divide') extra = '<p class="verdict-aside">You did not have to expand the bracket at all. BACKTRACK will not mark a valid method wrong because it expected a different one.</p>';
    if (c.id === 'distribute') extra = '<p class="verdict-aside">Dividing both sides by 3 first would also have been correct. Both are real routes through this equation.</p>';
    if (c.id === 'partial') extra = '<div class="breakdown">' +
        '<span class="bd-part is-ok">3 × x = 3x<span class="bd-mark" aria-hidden="true">✓</span><span class="sr-only">correct</span></span>' +
        '<span class="bd-part is-miss">3 × 2 = <span class="bd-gap">?</span><span class="bd-mark" aria-hidden="true">✗</span><span class="sr-only">missing</span></span>' +
      '</div>';

    return '<div class="screen">' +
      task(q) +
      choices(q, s.answer) +
      verdict(tone, title, esc(c.why), extra) +
      '<div class="confidence">' +
        '<p class="label">Before the route changes</p>' +
        '<h3>How did that feel?</h3>' +
        '<p class="conf-note">This never changes whether your answer was right. It changes what BACKTRACK checks next — the difference between a route built on evidence and one built on a guess.</p>' +
        '<div class="conf-pick" role="group" aria-label="How confident were you">' +
          CONFIDENCE.map(function (k) {
            var ex = s.mode === 'guided' && EXAMPLE.confidence === k.id;
            return '<button class="conf" data-action="confidence" data-value="' + k.id + '">' + esc(k.label) +
              (ex ? '<span class="choice-flag">Example learner</span>' : '') + '</button>';
          }).join('') +
        '</div></div></div>';
  };

  SCREENS.shortcut = function (s) {
    var count = s.removed.length;
    var line = count === 2 ? 'You already know this step.'
             : count === 1 ? 'Most of that review just left your route.'
             : 'Your answer was right — but you told us you were guessing.';
    var sub = count === 2 ? 'Those two steps are gone because of your answer, not on a timer. The destination did not move.'
            : count === 1 ? 'One review removed. One kept, because you said you only half-remembered it — BACKTRACK would rather verify once than assume.'
            : 'Nothing removed yet. Both reviews stay until something confirms them. Honesty gives you a better route.';

    var rows = '';
    if (count) {
      rows = '<div class="removed">' +
        (s.removed.indexOf('rev_expand') >= 0 ? '<p class="removed-row"><span class="glyph" aria-hidden="true">−</span>Review: expanding brackets</p>' : '') +
        (s.removed.indexOf('rev_negative') >= 0 ? '<p class="removed-row"><span class="glyph" aria-hidden="true">−</span>Review: negative terms</p>' : '') +
        '<p class="removed-count">' + count + (count === 1 ? ' review removed' : ' reviews removed') + '</p>' +
      '</div>';
    }

    return '<div class="screen">' +
      why('You answered the check correctly, so BACKTRACK has <strong>evidence</strong> — and it spends that evidence by taking work off your route.') +
      moment('shortcut', 'Shortcut found', esc(line), esc(sub), rows) +
      actions([
        { label: 'Try today’s equation', action: 'goto', value: 'destination_task', primary: true },
        { label: 'See what happens when a step is missing', action: 'switch_guided' }
      ]) + '</div>';
  };

  SCREENS.probe = function () {
    return '<div class="screen">' +
      why('One slip is not a diagnosis. <strong>BACKTRACK is checking the step underneath</strong> before it adds any review to your route.', 'caution') +
      task(BANK.probe) + choices(BANK.probe) + '</div>';
  };

  SCREENS.contrast = function () {
    return '<div class="screen">' +
      why('You were confident, and the answer was wrong. That usually means <strong>the rule in your head is slightly different</strong> from the one on the page — worth separating from a careless slip.', 'caution') +
      task(BANK.contrast) + choices(BANK.contrast) + '</div>';
  };

  SCREENS.probe_verified = function () {
    return '<div class="screen">' +
      why('The earlier step checked out, so nothing gets added to your route.') +
      moment('shortcut', 'Route corrected', 'That was a slip, not a gap.',
        'You expanded that bracket correctly, so the bracket rule is not what is missing. <strong>No review added.</strong> The step stays marked for another look later rather than being assumed either way.') +
      actions([{ label: 'Try today’s equation', action: 'goto', value: 'destination_task', primary: true }]) +
      '</div>';
  };

  SCREENS.gap_found = function (s) {
    var ev = evidenceFor(s, 'first_step');
    var never = ev && ev.confidence === 'never_learned';
    return '<div class="screen">' +
      why(never
        ? 'You said you had never been taught this one, so <strong>BACKTRACK is not going to spend ten questions proving it</strong>.'
        : 'Two answers now point at the same step, so BACKTRACK has stopped guessing and named it.', 'caution') +
      moment('gap', 'Found the step',
        'Expanding a bracket over both terms.',
        'That is what is standing between you and today’s equation — one step, named precisely. Not a verdict about you, and not a reason to restart the subject.',
        '<div class="transform">' +
          eq('2(y + 4)', '2 times, open bracket, y plus 4, close bracket') +
          '<span class="transform-arrow" aria-hidden="true"></span>' +
          '<span class="sr-only">becomes</span>' +
          '<span class="eq eq-lg" style="color:var(--caution-text)">2y + ?</span>' +
        '</div>') +
      actions([{ label: 'Repair this step', action: 'goto', value: 'learn', primary: true }]) +
      '</div>';
  };

  /* The learning screen: you do the distribution, you are not told about it. */
  SCREENS.learn = function () {
    return '<div class="screen">' +
      why('This is the step your route says is in the way. <strong>Do it once here</strong>, then a fresh question decides whether it is repaired.') +
      '<div id="manip"></div>' +
      '<div class="khan-panel">' +
        '<div>' +
          '<p class="khan-role">BACKTRACK finds the route. <strong>Khan Academy supports the learning.</strong></p>' +
          '<p class="khan-meta">Khan hosts the explanations, videos and practice for this step — BACKTRACK does not reproduce them. Opening it never counts as learning; only a fresh answer does.</p>' +
          '<p class="khan-tag"><span aria-hidden="true">●</span>Resource mapping preview</p>' +
        '</div>' +
        '<a class="btn btn-ghost" href="https://www.khanacademy.org/search?page_search_query=distributive%20property" target="_blank" rel="noopener noreferrer">Practise on Khan<span class="sr-only"> (opens in a new tab)</span></a>' +
      '</div>' +
      '<div id="learn-next"></div>' +
      '</div>';
  };

  SCREENS.fresh_check = function (s) {
    var r = s.retry;
    return '<div class="screen">' +
      why('A <strong>fresh</strong> question — different letters, different numbers, and a subtraction. Nothing is marked repaired until you answer one of these.') +
      task(BANK.fresh) +
      (r ? verdict('warn', 'Not yet.', esc(r.why), '<p class="verdict-aside"><strong>Hint.</strong> ' + esc(r.hint) + '</p>') : '') +
      choices(BANK.fresh) +
      '<p class="task-note" style="margin-top:20px">Stuck? <button class="btn-quiet" data-action="assist">Work through it again</button> — using help is fine, and it gets recorded honestly next to your answer.</p>' +
      '</div>';
  };

  SCREENS.capability = function (s) {
    return '<div class="screen">' +
      moment('capability', 'New capability',
        'You can expand a bracket over both terms.',
        s.assisted
          ? 'Recorded with the help you used — you still answered a fresh question you could not answer before.'
          : 'You could not do this a few minutes of route ago.',
        '<div class="transform">' +
          eq('2(y + 4)', '2 times, open bracket, y plus 4, close bracket') +
          '<span class="transform-arrow" aria-hidden="true"></span><span class="sr-only">becomes</span>' +
          eq('2y + 8', '2 y plus 8') +
        '</div>' +
        '<p class="moment-sub"><strong>That was the step blocking today’s problem.</strong> Your route just reopened — look at the equation above.</p>') +
      actions([{ label: 'Try today’s equation again', action: 'goto', value: 'destination_task', primary: true }]) +
      '</div>';
  };

  SCREENS.destination_task = function (s) {
    return '<div class="screen">' +
      why('This is the equation from the top of the screen — <strong>a fresh version of the thing that stopped you</strong>.') +
      '<div class="task">' +
        '<div class="task-eq">' + eq(DEST_EQ.text, DEST_EQ.spoken, 'eq-hero') + '</div>' +
        '<h2 class="task-prompt">Solve for x.</h2>' +
        '<p class="task-note">Type the value, or write it as x = something. Either method works — expand the bracket first, or divide both sides by 4 first.</p>' +
      '</div>' +
      '<form class="answer-form" data-action="solve">' +
        '<label class="sr-only" for="solve-input">Your answer for x</label>' +
        '<input id="solve-input" class="answer-input" type="text" inputmode="text" autocomplete="off" placeholder="x = ?" aria-describedby="solve-help">' +
        '<button class="btn btn-primary" type="submit">Check</button>' +
      '</form>' +
      '<p id="solve-help" class="task-note" style="text-align:center">' +
        (s.retry ? '<span class="wrong-inline">' + esc(s.retry) + '</span>' : '&nbsp;') + '</p>' +
      '<p class="task-note" style="text-align:center"><button class="btn-quiet" data-action="show_methods">Show both valid methods</button></p>' +
      (s.showMethods ? methodsPanel() : '') +
      '</div>';
  };

  function methodsPanel() {
    return '<div class="methods">' +
      '<div class="method"><p class="label">Method A · expand first</p>' +
        '<p>' + eq('4x − 12 = 20', '4 x minus 12 equals 20', 'eq-md') + '</p>' +
        '<p>' + eq('4x = 32', '4 x equals 32', 'eq-md') + '</p>' +
        '<p>' + eq('x = 8', 'x equals 8', 'eq-md') + '</p></div>' +
      '<div class="method"><p class="label">Method B · divide first</p>' +
        '<p>' + eq('x − 3 = 5', 'x minus 3 equals 5', 'eq-md') + '</p>' +
        '<p>' + eq('x = 8', 'x equals 8', 'eq-md') + '</p>' +
        '<p class="note">Fewer steps. Equally correct.</p></div>' +
      '</div>';
  }

  SCREENS.solved = function () {
    return '<div class="screen">' +
      moment('reached', 'Destination reached',
        'You solved a fresh version of the thing that stopped you.', null) +
      '<div class="verify">' +
        eq('4(8 − 3) = 4 × 5 = 20', '4 times, open bracket, 8 minus 3, close bracket, equals 4 times 5, equals 20', 'eq-lg') +
        '<p>It holds.</p>' +
      '</div>' +
      '<p class="honest-note"><strong>What this is not.</strong> One worked example inside a demonstration. It is not evidence that anything was retained, and BACKTRACK will not claim you have mastered algebra on the strength of it. A real check would come back days later, with fresh questions.</p>' +
      actions([{ label: 'Continue', action: 'goto', value: 'next_turn', primary: true }]) +
      '</div>';
  };

  SCREENS.next_turn = function (s) {
    return '<div class="screen">' +
      why('Your route is already saved. This is optional, and nothing is lost by stopping here.') +
      moment('shortcut', 'Next turn — 3 min',
        'One quick check could remove the last review step.',
        'No mystery box, no countdown, no streak to protect. The only reason to continue is that the next three minutes would visibly shorten your route.') +
      actions([
        { label: 'Take the next turn', action: 'goto', value: 'next_turn_check', primary: true },
        { label: 'Stop here — save my route', action: 'goto', value: 'stopped' }
      ]) + '</div>';
  };

  SCREENS.next_turn_check = function () {
    return '<div class="screen">' +
      why('The last thing your route was holding in reserve: <strong>what a negative outside the bracket does to both terms</strong>.') +
      task(BANK.next_turn) + choices(BANK.next_turn) + '</div>';
  };

  SCREENS.next_turn_result = function (s) {
    return '<div class="screen">' +
      (s.lastCorrect
        ? moment('shortcut', 'Shortcut found', 'That was the last review step.',
            'One small honest action, one visible change to the route. That is the whole mechanic.',
            '<div class="removed"><p class="removed-row"><span class="glyph" aria-hidden="true">−</span>Review: negative terms</p><p class="removed-count">1 review removed</p></div>')
        : moment('gap', 'Route updated', 'The negative did not reach both terms.',
            'Nothing is taken away for getting it wrong. The step simply stays on your route until it is repaired.')) +
      '<p class="honest-note">One continuation was offered. There is not another one queued behind it, and there is no feed here.</p>' +
      actions([
        { label: 'Preview coming back after a week', action: 'goto', value: 'comeback_offer', primary: true },
        { label: 'Stop here — save my route', action: 'goto', value: 'stopped' }
      ]) + '</div>';
  };

  SCREENS.comeback_offer = function () {
    return '<div class="screen">' +
      '<div class="sim-band"><p><strong>Simulated.</strong> No time is about to pass. This shows what BACKTRACK does when someone disappears for a week and comes back — the situation the product was built for.</p></div>' +
      moment('shortcut', 'A week goes by', 'Something happened. It usually does.',
        'On most systems this is where a streak breaks and the learner quietly stops coming back.') +
      actions([{ label: 'Come back', action: 'goto', value: 'comeback', primary: true }]) + '</div>';
  };

  SCREENS.comeback = function () {
    return '<div class="screen">' +
      '<div class="sim-band"><p><strong>Simulated — one week later.</strong> No real time has passed and nothing about you was stored.</p></div>' +
      '<h2 class="display t-section" style="margin-bottom:12px">Welcome back.</h2>' +
      '<div class="kept"><p class="label label-success">Still yours</p>' +
        '<p>Everything you proved last time is intact. Nothing was reset, no streak was destroyed, and you are not starting from the beginning.</p></div>' +
      why('One short retrieval check decides whether to resume where you stopped or re-open a step.') +
      task(BANK.comeback) + choices(BANK.comeback) + '</div>';
  };

  SCREENS.comeback_result = function (s) {
    return '<div class="screen">' +
      (s.lastCorrect
        ? moment('capability', 'Still there', 'The bracket step held over the gap.',
            'Resuming where you stopped. <strong>Streaks reward never falling off. BACKTRACK rewards getting back on.</strong>')
        : moment('gap', 'Re-opening one step', 'That one did not hold — which is completely normal.',
            'The step goes back on the route. No penalty, no lost progress. Forgetting is a routing problem, not a character flaw.')) +
      actions([{ label: 'Finish', action: 'goto', value: 'end', primary: true }]) + '</div>';
  };

  SCREENS.stopped = function () {
    return '<div class="screen">' +
      moment('shortcut', 'Route saved', 'You stopped where you wanted to.',
        'Nothing is lost, nothing expires, and there is no penalty waiting for you next time.') +
      actions([
        { label: 'Preview coming back after a week', action: 'goto', value: 'comeback_offer', primary: true },
        { label: 'Start again', action: 'restart' }
      ]) + '</div>';
  };

  SCREENS.end = function () {
    return '<div class="screen">' +
      '<p class="label">End of demo</p>' +
      '<h2 class="display t-section" style="margin:14px 0 24px">That is the whole loop.</h2>' +
      '<div class="recap">' +
        '<p class="recap-line"><span class="recap-n">1</span> You arrived with something you needed now.</p>' +
        '<p class="recap-line"><span class="recap-n">2</span> BACKTRACK checked what you could already do.</p>' +
        '<p class="recap-line"><span class="recap-n">3</span> It kept what you proved and routed only the rest.</p>' +
        '<p class="recap-line"><span class="recap-n">4</span> Khan Academy carried the learning.</p>' +
        '<p class="recap-line"><span class="recap-n">5</span> You proved the change on a fresh question.</p>' +
        '<p class="recap-line"><span class="recap-n">6</span> The route got shorter, and offered one useful next turn.</p>' +
      '</div>' +
      '<p class="honest-note"><strong>Status.</strong> An illustrative prototype built for KEIC 2026. No pilot results, no users and no partner schools. What you just used is the product logic, not evidence that it works.</p>' +
      actions([
        { label: 'Start again', action: 'restart', primary: true },
        { label: 'See the evidence plan', action: 'link', value: '/evidence' }
      ]) + '</div>';
  };

  /* ======================================================================
     TRANSITIONS — unchanged logic; correctness is mathematical only
     ====================================================================== */

  function record(qid, cid, correct, confidence) {
    state.evidence.push({
      questionId: qid, answerId: cid, correct: !!correct,
      confidence: confidence || null, assisted: state.assisted || false, mode: state.mode
    });
  }

  function applyConfidence(conf) {
    var ev = evidenceFor(state, 'first_step');
    if (ev) ev.confidence = conf;
    var correct = ev && ev.correct;
    var unsureAnswer = state.answer === 'unsure';

    if (correct) {
      if (conf === 'confident') { state.removed = ['rev_expand', 'rev_negative']; state.keepToVerify = false; }
      else if (conf === 'remember') { state.removed = ['rev_expand']; state.keepToVerify = true; }
      else { state.removed = []; state.keepToVerify = true; }
      state.annotation = { nodeId: 'bracket', text: 'Kept', tone: 'route' };
      go('shortcut');
      return;
    }
    if (unsureAnswer) {
      if (conf === 'never_learned') { state.gapSkill = 'expand'; go('gap_found'); }
      else go('probe');
      return;
    }
    if (conf === 'never_learned') {
      state.gapSkill = 'expand';
      state.annotation = { nodeId: 'bracket', text: 'Never taught', tone: 'caution' };
      go('gap_found');
    } else if (conf === 'confident') {
      state.annotation = { nodeId: 'bracket', text: 'Possible misconception', tone: 'caution' };
      go('contrast');
    } else {
      state.annotation = { nodeId: 'bracket', text: 'Checking one step earlier', tone: 'caution' };
      go('probe');
    }
  }

  function handleAnswer(qid, cid) {
    var q = BANK[qid], c = choiceById(q, cid), correct = !!c.correct;

    if (qid === 'first_step') { state.answer = cid; record(qid, cid, correct, null); go('task1_result'); return; }

    if (qid === 'probe' || qid === 'contrast') {
      record(qid, cid, correct, null);
      if (correct) {
        state.annotation = { nodeId: 'bracket', text: qid === 'contrast' ? 'A slip, not a gap' : 'Verified', tone: 'route' };
        go('probe_verified');
      } else {
        state.gapSkill = 'expand';
        state.annotation = { nodeId: 'rev_expand', text: 'Repair this step', tone: 'caution' };
        go('gap_found');
      }
      return;
    }

    if (qid === 'fresh') {
      if (correct) {
        record(qid, cid, true, null);
        state.retry = null; state.unlocked = true;
        state.annotation = { nodeId: 'rev_expand', text: 'Repaired', tone: 'success' };
        go('capability');
      } else {
        state.attempts++;
        state.retry = { why: c.why, hint: c.hint };
        render();
        announce('Not correct. ' + c.why);
      }
      return;
    }

    if (qid === 'next_turn') {
      record(qid, cid, correct, null);
      state.lastCorrect = correct;
      if (correct) {
        state.nextTurnDone = true;
        state.removed = state.removed.concat(['rev_negative']);
        state.annotation = null;
      }
      go('next_turn_result');
      return;
    }

    if (qid === 'comeback') {
      record(qid, cid, correct, null);
      state.lastCorrect = correct;
      state.comebackDone = true;
      if (!correct) {
        state.removed = state.removed.filter(function (r) { return r !== 'rev_expand'; });
        state.gapSkill = 'expand'; state.unlocked = false;
        state.annotation = { nodeId: 'rev_expand', text: 'Re-opened', tone: 'caution' };
      }
      go('comeback_result');
    }
  }

  /* ======================================================================
     NAVIGATION
     ====================================================================== */

  function snapshot() { return JSON.parse(JSON.stringify(state)); }

  function anchorTimeline() {
    timeline = [snapshot()]; pos = 0;
    try { history.replaceState({ bt: 0 }, ''); } catch (e) {}
  }

  function go(screen) {
    state.screen = screen;
    state.retry = null;
    if (screen !== 'destination_task') state.showMethods = false;
    if (screen === 'learn') manip = { picked: [] };
    timeline = timeline.slice(0, pos + 1);
    timeline.push(snapshot());
    pos = timeline.length - 1;
    try { history.pushState({ bt: pos }, ''); } catch (e) {}
    render();
    focusStage();
  }

  function restoreTo(i) {
    if (i < 0 || i >= timeline.length) return;
    pos = i;
    state = JSON.parse(JSON.stringify(timeline[i]));
    render();
    focusStage();
  }

  function back() {
    if (pos <= 0) return;
    try { history.back(); } catch (e) { restoreTo(pos - 1); }
  }

  function restart() {
    state = initialState();
    manip = { picked: [] };
    anchorTimeline();
    clearSaved();
    render();
    focusStage();
  }

  function focusStage() {
    var h = stage.querySelector('h1, h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    if (window.scrollY > 40) window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function announce(msg) {
    if (!liveRegion) return;
    liveRegion.textContent = '';
    setTimeout(function () { liveRegion.textContent = msg; }, 40);
  }

  /* ---- persistence: local only, easy to erase ---- */
  function save() { try { localStorage.setItem(STORE, JSON.stringify({ s: state })); } catch (e) {} }
  function load() {
    try {
      var raw = localStorage.getItem(STORE); if (!raw) return false;
      var d = JSON.parse(raw);
      if (!d || !d.s || !d.s.screen) return false;
      state = d.s; return true;
    } catch (e) { return false; }
  }
  function clearSaved() { try { localStorage.removeItem(STORE); } catch (e) {} }

  /* ======================================================================
     RENDER
     ====================================================================== */

  function render() {
    var fn = SCREENS[state.screen] || SCREENS.mode;
    stage.innerHTML = fn(state) + evidenceStrip(state);

    var banner = document.getElementById('guided-banner');
    if (banner) banner.hidden = state.mode !== 'guided';

    var bar = document.getElementById('dest-bar');
    if (bar) bar.hidden = state.screen === 'mode';

    if (backBtn) backBtn.disabled = pos === 0;

    if (route) route.setModel(routeFor(state), true);
    renderAnchor();
    renderRouteCount();
    if (routeDetail) routeDetail.hidden = true;

    if (state.screen === 'learn') buildManip();

    save();
  }

  /* The destination equation is dim while something is in the way and full
     strength once the route opens. That change is the reward. */
  function renderAnchor() {
    if (!anchorEq) return;
    var open = destinationOpen(state);
    var was = anchorEq.getAttribute('data-state');
    anchorEq.setAttribute('data-state', open ? 'open' : 'blocked');
    if (anchorState) {
      anchorState.textContent = state.solvedDestination ? 'Solved' : open ? 'In reach' : 'Blocked';
    }
    /* The moment the route opens, the destination equation comes back to life.
       That is the reward — not a badge. */
    if (was === 'blocked' && open) {
      var target = anchorEq.querySelector('.eq-anchor');
      if (target) {
        target.classList.remove('is-opening');
        void target.offsetWidth;               /* restart the animation */
        target.classList.add('is-opening');
      }
    }
  }

  function renderRouteCount() {
    if (!routeCount) return;
    var nodes = routeFor(state).nodes;
    var done = nodes.filter(function (n) {
      return ['checked', 'capability_unlocked', 'reached'].indexOf(n.status) >= 0;
    }).length;
    routeCount.textContent = done + ' of ' + nodes.length;
  }

  function evidenceStrip(s) {
    if (!s.evidence.length) return '';
    var items = s.evidence.map(function (e) {
      var q = BANK[e.questionId];
      return '<li><span class="ev-mark ' + (e.correct ? 'is-ok' : 'is-no') + '" aria-hidden="true">' +
        (e.correct ? '✓' : '✗') + '</span>' +
        '<span class="ev-q">' + esc(q ? q.task : e.questionId) + '</span>' +
        '<span class="ev-meta">' + (e.correct ? 'correct' : 'not correct') +
          (e.assisted ? ' · used help' : '') + '</span></li>';
    }).join('');
    return '<div class="screen evidence-strip">' +
      '<p class="label">What BACKTRACK has seen</p><ul class="evidence">' + items + '</ul></div>';
  }

  /* ======================================================================
     DIRECT MANIPULATION
     The learner selects which terms the multiplier reaches. Getting it wrong
     is the whole misconception, so the interface lets them find that out.
     ====================================================================== */

  function buildManip() {
    var host = document.getElementById('manip');
    if (!host) return;

    function draw() {
      var picked = manip.picked;
      var both = picked.length === 2;
      var say = both
        ? 'Both terms. That is all "expanding a bracket" means — the multiplier reaches everything inside.'
        : picked.length === 1
          ? 'That is one of them. The bracket still has something else inside it.'
          : 'The 2 sits outside the bracket. Choose everything inside that it has to multiply.';

      host.innerHTML =
        '<div class="manip">' +
          '<p class="manip-ask" id="manip-ask">Select what the 2 has to multiply.</p>' +
          '<div class="manip-expr">' +
            '<span class="manip-mult">2</span>' +
            '<span class="manip-brk">(</span>' +
            '<button class="manip-term" data-term="y" aria-pressed="' + (picked.indexOf('y') >= 0) + '"' +
              (both ? ' disabled' : '') + ' aria-describedby="manip-ask">y</button>' +
            '<span class="manip-fixed">+</span>' +
            '<button class="manip-term" data-term="4" aria-pressed="' + (picked.indexOf('4') >= 0) + '"' +
              (both ? ' disabled' : '') + ' aria-describedby="manip-ask">4</button>' +
            '<span class="manip-brk">)</span>' +
          '</div>' +
          '<div class="manip-arcs" aria-hidden="true"><svg preserveAspectRatio="none">' +
            '<path class="manip-arc' + (picked.indexOf('y') >= 0 ? ' is-on' : '') + '" data-arc="y"/>' +
            '<path class="manip-arc' + (picked.indexOf('4') >= 0 ? ' is-on' : '') + '" data-arc="4"/>' +
          '</svg></div>' +
          '<div class="manip-products">' +
            (picked.indexOf('y') >= 0 ? '<span class="manip-product">2 × y</span>' : '') +
            (picked.length === 2 ? '<span aria-hidden="true">+</span>' : '') +
            (picked.indexOf('4') >= 0 ? '<span class="manip-product">2 × 4</span>' : '') +
          '</div>' +
          (both ? '<div class="manip-result">' + eq('2y + 8', '2 y plus 8') + '</div>' : '') +
          '<p class="manip-say' + (picked.length === 1 ? ' is-nudge' : '') + '" role="status">' + esc(say) + '</p>' +
          (both ? '<p class="task-note" style="margin-top:16px"><button class="btn-quiet" data-manip="reset">Play it again</button></p>' : '') +
        '</div>';

      drawArcs(host);

      var next = document.getElementById('learn-next');
      if (next) {
        next.innerHTML = both
          ? actions([{ label: 'I’m ready for a fresh question', action: 'goto', value: 'fresh_check', primary: true }])
          : '<p class="task-note">Select both terms above to continue.</p>';
      }
      state.manipDone = both;
    }

    /* Arcs are measured from the live layout, so they land on the real terms
       at any font size or viewport width. */
    function drawArcs(root) {
      var box = root.querySelector('.manip-arcs');
      var svg = box && box.querySelector('svg');
      var mult = root.querySelector('.manip-mult');
      if (!svg || !mult) return;
      var b = box.getBoundingClientRect();
      if (!b.width) return;
      svg.setAttribute('viewBox', '0 0 ' + b.width + ' ' + b.height);
      var mx = mult.getBoundingClientRect();
      var sx = mx.left + mx.width / 2 - b.left;
      ['y', '4'].forEach(function (t) {
        var el = root.querySelector('[data-term="' + t + '"]');
        var p = svg.querySelector('[data-arc="' + t + '"]');
        if (!el || !p) return;
        var r = el.getBoundingClientRect();
        var tx = r.left + r.width / 2 - b.left;
        p.setAttribute('d', 'M' + sx + ',2 C' + sx + ',' + (b.height * .75) + ' ' +
                            tx + ',' + (b.height * .25) + ' ' + tx + ',' + (b.height - 2));
      });
    }

    host.addEventListener('click', function (e) {
      var t = e.target.closest('[data-term]');
      if (t && !t.disabled) {
        var id = t.getAttribute('data-term');
        var i = manip.picked.indexOf(id);
        if (i >= 0) manip.picked.splice(i, 1); else manip.picked.push(id);
        draw();
        var again = host.querySelector('[data-term="' + id + '"]');
        if (again && !again.disabled) again.focus();
        return;
      }
      if (e.target.closest('[data-manip="reset"]')) {
        manip.picked = [];
        draw();
        var first = host.querySelector('[data-term]');
        if (first) first.focus();
      }
    });

    window.addEventListener('resize', function () { drawArcs(host); });
    draw();
  }

  /* ======================================================================
     EVENTS
     ====================================================================== */

  function onClick(e) {
    var t = e.target.closest('[data-action]');
    if (!t) return;
    var action = t.getAttribute('data-action');
    var value = t.getAttribute('data-value');

    if (action === 'mode') { state.mode = value; go('intro'); }
    else if (action === 'budget') { state.budget = parseInt(value, 10); go('task1'); }
    else if (action === 'answer') { handleAnswer(t.getAttribute('data-q'), t.getAttribute('data-c')); }
    else if (action === 'confidence') { applyConfidence(value); }
    else if (action === 'goto') { go(value); }
    else if (action === 'switch_guided') {
      state.mode = 'guided'; state.gapSkill = null; state.unlocked = false;
      state.removed = []; state.answer = null; state.annotation = null;
      state.evidence = state.evidence.filter(function (x) { return x.questionId !== 'first_step'; });
      go('task1');
      announce('Switched to the example learner. This path is illustrative.');
    }
    else if (action === 'assist') { state.assisted = true; go('learn'); }
    else if (action === 'show_methods') { state.showMethods = !state.showMethods; render(); }
    else if (action === 'restart') { restart(); }
    else if (action === 'back') { back(); }
    else if (action === 'clear') { restart(); announce('Demo progress cleared.'); }
    else if (action === 'link') { window.location.href = value; }
  }

  function onSubmit(e) {
    var form = e.target.closest('[data-action="solve"]');
    if (!form) return;
    e.preventDefault();
    var input = form.querySelector('.answer-input');
    var raw = (input.value || '').trim();

    /* A normaliser, not an evaluator. Nothing typed is ever executed. */
    var norm = raw.toLowerCase().replace(/\s+/g, '').replace(/^x=/, '');
    if (norm === '8' || norm === '8.0' || norm === '+8') {
      record('destination', raw, true, null);
      state.solvedDestination = true;
      state.annotation = null;
      go('solved');
    } else {
      state.retry = raw
        ? 'Not ' + raw + '. Try expanding the bracket first, or dividing both sides by 4.'
        : 'Enter a value for x.';
      render();
      var again = document.querySelector('.answer-input');
      if (again) { again.focus(); again.select(); }
      announce('Not correct yet.');
    }
  }

  /* ======================================================================
     BOOT
     ====================================================================== */

  function init() {
    stage = document.getElementById('demo-stage');
    if (!stage) return;
    liveRegion = document.getElementById('demo-live');
    backBtn = document.querySelector('[data-action="back"]');
    anchorEq = document.getElementById('anchor-eq');
    anchorState = document.getElementById('anchor-state');
    routeDetail = document.getElementById('route-detail');
    routeCount = document.getElementById('route-count');
    routeRegion = document.getElementById('route-region');
    routeToggle = document.getElementById('route-toggle');

    var host = document.getElementById('demo-route');
    if (host && window.BacktrackRoute) {
      route = window.BacktrackRoute.create(host, {
        variant: 'ribbon', compactAt: 700, labelMax: 13, onSelect: showRouteDetail
      });
    }

    if (routeToggle && routeRegion) {
      routeToggle.addEventListener('click', function () {
        var open = routeRegion.classList.toggle('is-open');
        routeToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);
    window.addEventListener('popstate', function (e) {
      var idx = (e.state && typeof e.state.bt === 'number') ? e.state.bt : 0;
      if (idx >= timeline.length) idx = timeline.length - 1;
      restoreTo(idx);
    });

    if (!load()) state = initialState();
    anchorTimeline();
    render();
  }

  /* Selecting a route node explains why that step is on the route. */
  function showRouteDetail(node, meta) {
    if (!routeDetail) return;
    if (!node) { routeDetail.hidden = true; return; }
    routeDetail.hidden = false;
    routeDetail.innerHTML =
      '<span class="route-detail-name">' + esc(node.label) + '</span>' +
      '<span class="route-detail-state">' + esc(meta.word) + '</span>' +
      '<p class="route-detail-why">' + esc(meta.reason) + '</p>' +
      '<button class="btn-quiet route-detail-close" data-action="close_detail">Close</button>';
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-action="close_detail"]')) {
      if (route) route.select(null);
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
