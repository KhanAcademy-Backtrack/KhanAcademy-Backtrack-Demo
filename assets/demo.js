/* ==========================================================================
   BACKTRACK — interactive demo
   An explicit state machine over a data-driven question bank. No sign-in, no
   learner records, no generative endpoint, no eval of visitor input.

   Two rules this file exists to enforce:
     1. Correctness is decided by mathematics alone.
     2. Self-reported confidence changes what BACKTRACK checks next — never
        whether an answer was right.
   ========================================================================== */
(function () {
  'use strict';

  var STORE = 'backtrack.demo.v1';

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

    /* Used when an answer was wrong but reported as confident: a contrasting
       case separates a slip from a misconception. */
    contrast: {
      id: 'contrast',
      task: '5(x + 1)',
      spoken: '5 times, open bracket, x plus 1, close bracket',
      prompt: 'One contrasting case. Expand this bracket.',
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
      prompt: 'Fresh check — expand this bracket.',
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
      help: 'This one has a negative outside the bracket — the step your route still had marked as review.',
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
      prompt: 'One quick retrieval check.',
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
    { id: 5,  label: '5 min',  sub: 'I’m cooked',        line: 'One useful block. Nothing more.' },
    { id: 15, label: '15 min', sub: 'I can do something',     line: 'Enough to find the step and repair it.' },
    { id: 30, label: '30 min', sub: 'normal',                 line: 'Room to repair the step and come back to today’s task.' },
    { id: 60, label: '60 min', sub: 'lock in',                line: 'Room to consolidate afterwards, so it holds next week.' }
  ];

  /* The example learner used by guided mode. Visibly fictional. */
  var EXAMPLE = {
    name: 'an example learner',
    first_step: 'partial',
    confidence: 'remember',
    probe: 'p_half',
    fresh: 'f_ok',
    next_turn: 'n_ok',
    comeback: 'b_ok'
  };

  /* ======================================================================
     STATE
     ====================================================================== */

  function initialState() {
    return {
      mode: null,          /* 'live' | 'guided' */
      screen: 'mode',
      budget: null,
      evidence: [],
      /* route bookkeeping */
      removed: [],         /* review steps taken off the route */
      keepToVerify: false, /* a review kept because confidence was low */
      gapSkill: null,
      unlocked: false,
      solvedDestination: false,
      nextTurnDone: false,
      comebackDone: false,
      assisted: false,
      attempts: 0,
      /* transient per-screen */
      answer: null,
      retry: null
    };
  }

  var state = initialState();
  var stack = [];
  var route = null;
  var stage, sidePanel, liveRegion, backBtn;
  var suppressPush = false;

  /* ======================================================================
     ROUTE MODEL
     The route is derived from state, never mutated ad hoc. Every node is a
     real consequence of something the visitor did.
     ====================================================================== */

  function routeFor(s) {
    var n = [];

    n.push({ id: 'here', label: 'You are here', status: 'checked' });

    var bracketStatus = 'unknown';
    if (s.screen === 'task1') bracketStatus = 'unknown';
    if (s.answer && s.screen === 'task1') bracketStatus = 'unknown';
    if (hasEvidence(s, 'first_step')) {
      bracketStatus = evidenceFor(s, 'first_step').correct ? 'checked' : 'uncertain';
    }
    /* Solving a fresh version of the destination task settles the step that
       was in doubt — that is the whole point of the return. */
    if (s.solvedDestination) bracketStatus = 'checked';
    n.push({
      id: 'bracket',
      label: 'Bracket step',
      status: bracketStatus,
      active: s.screen === 'task1'
    });

    /* Provisional review steps. They are on the route because BACKTRACK does
       not yet know whether they are needed — and they leave as soon as it
       does. Nothing here is invented in order to be deleted. */
    if (s.removed.indexOf('rev_expand') === -1) {
      n.push({
        id: 'rev_expand',
        label: 'Expanding brackets',
        note: s.gapSkill !== 'expand' ? 'provisional'
            : s.unlocked ? 'repaired' : 'repair this',
        branch: true,
        status: s.gapSkill === 'expand'
          ? (s.unlocked ? 'capability_unlocked' : 'practice_suggested')
          : 'unknown',
        active: ['learn', 'fresh_check', 'gap_found'].indexOf(s.screen) >= 0
      });
    }
    if (s.removed.indexOf('rev_negative') === -1) {
      n.push({
        id: 'rev_negative',
        label: 'Negative terms',
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
        id: 'freshcheck',
        label: 'Fresh check',
        status: s.unlocked ? 'checked' : 'unknown',
        active: s.screen === 'fresh_check'
      });
    }

    n.push({
      id: 'dest',
      kind: 'destination',
      label: 'Today’s equation',
      status: s.solvedDestination ? 'reached'
            : (s.unlocked || bracketStatus === 'checked') ? 'ready_to_try' : 'unknown',
      active: s.screen === 'destination_task'
    });

    return { nodes: n, annotation: s.annotation || null };
  }

  function hasEvidence(s, qid) {
    return s.evidence.some(function (e) { return e.questionId === qid; });
  }
  function evidenceFor(s, qid) {
    var found = null;
    s.evidence.forEach(function (e) { if (e.questionId === qid) found = e; });
    return found;
  }

  /* ======================================================================
     HELPERS
     ====================================================================== */

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Semantic math: visible glyphs plus a spoken equivalent. Never a code
     block, never parsed or evaluated. */
  function eq(text, spoken, cls) {
    return '<span class="eq ' + (cls || 'eq-lg') + '" role="math" aria-label="' +
      esc(spoken || text) + '">' + esc(text) + '</span>';
  }

  function choiceList(q, opts) {
    opts = opts || {};
    var html = '<div class="choices" role="group" aria-label="' + esc(q.prompt) + '">';
    q.choices.forEach(function (c) {
      if (opts.exclude && opts.exclude.indexOf(c.id) >= 0) return;
      var isExample = state.mode === 'guided' && EXAMPLE[q.id] === c.id;
      html += '<button class="choice" data-action="answer" data-q="' + q.id + '" data-c="' + c.id + '"' +
        (c.kind === 'unsure' ? ' data-unsure="1"' : '') + '>' +
        '<span class="choice-body">' +
          (c.kind === 'unsure'
            ? '<span class="choice-text">' + esc(c.text) + '</span>'
            : eq(c.text, c.spoken, 'eq-md')) +
        '</span>' +
        (isExample ? '<span class="choice-flag">Example learner picked this</span>' : '') +
        '</button>';
    });
    html += '</div>';
    return html;
  }

  function taskBlock(q) {
    return '' +
      '<p class="label">Task</p>' +
      '<div class="task-eq">' + eq(q.task, q.spoken, 'eq-xl') + '</div>' +
      '<h2 class="t-sub prompt">' + esc(q.prompt) + '</h2>' +
      (q.help ? '<p class="small task-help">' + esc(q.help) + '</p>' : '');
  }

  function feedback(tone, title, body, extra) {
    return '<div class="feedback tone-' + tone + '" role="status">' +
      '<p class="feedback-head"><span class="feedback-glyph" aria-hidden="true">' +
        (tone === 'good' ? '✓' : tone === 'warn' ? '!' : 'i') +
      '</span>' + esc(title) + '</p>' +
      '<p class="feedback-body">' + body + '</p>' +
      (extra || '') + '</div>';
  }

  function actions(list) {
    var html = '<div class="stage-actions">';
    list.forEach(function (a) {
      if (!a) return;
      html += '<button class="btn ' + (a.primary ? 'btn-primary' : 'btn-ghost') + '" ' +
        'data-action="' + a.action + '"' + (a.value != null ? ' data-value="' + esc(a.value) + '"' : '') +
        '>' + esc(a.label) + '</button>';
    });
    return html + '</div>';
  }

  function eventBanner(kind, title, lines, foot) {
    return '<div class="event event-' + kind + '">' +
      '<p class="event-label">' + esc(title) + '</p>' +
      lines.map(function (l) { return '<p class="event-line">' + l + '</p>'; }).join('') +
      (foot ? '<p class="event-foot">' + foot + '</p>' : '') +
      '</div>';
  }

  /* ======================================================================
     SCREENS
     ====================================================================== */

  var SCREENS = {};

  SCREENS.mode = function () {
    return '' +
      '<div class="screen screen-open">' +
        '<p class="label">Interactive demo</p>' +
        '<h1 class="display t-section">Two ways to see this work.</h1>' +
        '<p class="t-lead">No sign-in. Nothing is recorded about you. The route you see is built from the answers you actually give.</p>' +
        '<div class="mode-pick">' +
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
        '</div>' +
      '</div>';
  };

  SCREENS.intro = function (s) {
    var html = '<div class="screen">' +
      '<p class="label">Destination</p>' +
      '<h1 class="display t-section dest-title">Solve equations with brackets</h1>' +
      '<p class="t-lead">This is where you are trying to get. It stays on screen the whole way, and it does not move while BACKTRACK works out how to reach it.</p>' +
      '<div class="provisional">' +
        '<p class="label label-caution">Provisional route</p>' +
        '<p class="small">BACKTRACK has not checked anything yet, so it starts with the review steps this destination <em>might</em> need. Steps leave the route as soon as you show they are not needed.</p>' +
      '</div>' +
      '<h2 class="t-sub budget-q">How much do you have in you today?</h2>' +
      '<div class="budget-pick" role="group" aria-label="Session length">';
    BUDGETS.forEach(function (b) {
      html += '<button class="budget" data-action="budget" data-value="' + b.id + '">' +
        '<span class="budget-time">' + esc(b.label) + '</span>' +
        '<span class="budget-sub">' + esc(b.sub) + '</span>' +
        '</button>';
    });
    html += '</div>' +
      '<p class="note budget-note">Five minutes is a real answer, not a failure. BACKTRACK picks a block that finishes rather than one that gets abandoned.</p>' +
      '</div>';
    return html;
  };

  SCREENS.task1 = function (s) {
    var q = BANK.first_step;
    var b = BUDGETS.filter(function (x) { return x.id === s.budget; })[0];
    return '<div class="screen">' +
      (b ? '<p class="budget-echo"><span class="tag tag-plain">' + esc(b.label) + '</span> ' + esc(b.line) + '</p>' : '') +
      taskBlock(q) +
      choiceList(q) +
      '</div>';
  };

  SCREENS.task1_result = function (s) {
    var q = BANK.first_step;
    var c = choiceById(q, s.answer);
    var tone = c.correct ? 'good' : (c.kind === 'unsure' ? 'info' : 'warn');
    var title = c.correct ? 'That works.' : (c.kind === 'unsure' ? 'Useful answer.' : 'Not quite — and the reason is specific.');

    var extra = '';
    if (c.id === 'divide') {
      extra = '<p class="feedback-aside">You did not have to expand the bracket at all. BACKTRACK will not mark a valid method wrong because it expected a different one.</p>';
    }
    if (c.id === 'distribute') {
      extra = '<p class="feedback-aside">Dividing both sides by 3 first would also have been correct. Both are real routes through this equation.</p>';
    }
    if (c.id === 'partial') {
      extra = '<div class="split-eq">' +
        '<span class="split-part is-ok">3 × x = 3x <span class="split-mark" aria-hidden="true">✓</span><span class="sr-only">correct</span></span>' +
        '<span class="split-part is-miss">3 × 2 = <span class="split-gap">?</span> <span class="split-mark" aria-hidden="true">✗</span><span class="sr-only">missing</span></span>' +
        '</div>';
    }

    return '<div class="screen">' +
      taskBlock(q) +
      '<div class="answered">' + eq(c.text || 'I don’t know yet', c.spoken || 'I do not know yet', 'eq-md') +
        '<span class="answered-tag">your answer</span></div>' +
      feedback(tone, title, esc(c.why), extra) +
      '<div class="confidence">' +
        '<p class="label">Before the route changes</p>' +
        '<h3 class="t-sub">How did that feel?</h3>' +
        '<p class="small conf-note">This never changes whether your answer was right. It changes what BACKTRACK checks next — and it is the difference between a route built on evidence and one built on a guess.</p>' +
        '<div class="conf-pick" role="group" aria-label="How confident were you">' +
          CONFIDENCE.map(function (k) {
            var isExample = s.mode === 'guided' && EXAMPLE.confidence === k.id;
            return '<button class="conf" data-action="confidence" data-value="' + k.id + '">' +
              esc(k.label) +
              (isExample ? '<span class="choice-flag">Example learner</span>' : '') +
              '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '</div>';
  };

  SCREENS.shortcut = function (s) {
    var count = s.removed.length;
    var ev = evidenceFor(s, 'first_step');
    var conf = ev && ev.confidence;

    var lines = [];
    if (count === 2) {
      lines.push('You already know this step, and you knew you knew it.');
      lines.push('<strong>2 reviews removed.</strong>');
    } else if (count === 1) {
      lines.push('You got it right, but you said you only half-remembered it.');
      lines.push('<strong>1 review removed. 1 kept to verify later.</strong>');
    } else {
      lines.push('Your answer was correct — but you told us you were not sure why.');
      lines.push('<strong>Nothing removed yet. Both reviews kept to verify.</strong>');
    }

    var foot = count === 2
      ? 'Those steps are gone because of your answer, not on a timer.'
      : 'Honesty gives you a better route: BACKTRACK would rather verify once than assume something you were guessing at.';

    return '<div class="screen">' +
      eventBanner('shortcut', count > 0 ? 'Shortcut found' : 'Route held', lines, foot) +
      '<div class="event-aside">' +
        '<p class="small">This is the half of BACKTRACK that saves you work. The other half is what happens when a step really is missing.</p>' +
      '</div>' +
      actions([
        { label: 'Go to today’s equation', action: 'goto', value: 'destination_task', primary: true },
        { label: 'See what BACKTRACK does when a gap appears', action: 'switch_guided' }
      ]) +
      '</div>';
  };

  SCREENS.probe = function (s) {
    var q = BANK.probe;
    return '<div class="screen">' +
      '<div class="step-back-note">' +
        '<p class="label label-route">Checking one step earlier</p>' +
        '<p class="small">Nothing has been decided about you yet. One slip is not a diagnosis, so BACKTRACK looks at the step underneath before it adds any review.</p>' +
      '</div>' +
      taskBlock(q) +
      choiceList(q) +
      '</div>';
  };

  SCREENS.contrast = function (s) {
    var q = BANK.contrast;
    return '<div class="screen">' +
      '<div class="step-back-note">' +
        '<p class="label label-route">One contrasting case</p>' +
        '<p class="small">You were confident, and the answer was wrong. That usually means the rule in your head is slightly different from the one on the page — which is worth separating from a careless slip.</p>' +
      '</div>' +
      taskBlock(q) +
      choiceList(q) +
      '</div>';
  };

  SCREENS.probe_verified = function (s) {
    return '<div class="screen">' +
      feedback('good', 'That looks familiar.',
        'You expanded that bracket correctly, so the earlier step is not missing. The slip on the first task was a slip, not a gap.',
        '<p class="feedback-aside">BACKTRACK will not add review on the strength of one wrong answer. It verified first.</p>') +
      eventBanner('shortcut', 'Route corrected', [
        'The suspected gap was checked and cleared.',
        '<strong>No review added.</strong>'
      ], 'The bracket step stays marked uncertain, so it will be checked again later rather than assumed.') +
      actions([{ label: 'Go to today’s equation', action: 'goto', value: 'destination_task', primary: true }]) +
      '</div>';
  };

  SCREENS.gap_found = function (s) {
    var ev = evidenceFor(s, 'first_step');
    var never = ev && ev.confidence === 'never_learned';
    return '<div class="screen">' +
      eventBanner('gap', 'Found the step', [
        never
          ? 'You said you had never been taught this one, so BACKTRACK is not going to spend ten questions proving it.'
          : 'Expanding a bracket over both terms is what is blocking today’s equation.',
        '<strong>This is the step to repair.</strong>'
      ], 'Not a verdict about you. One step, named precisely, with the destination still in view.') +
      '<div class="gap-detail">' +
        '<p class="label">What the route says now</p>' +
        '<div class="gap-rows">' +
          '<p><span class="tag tag-caution"><span class="glyph" aria-hidden="true">●</span>Practice suggested</span> Expanding brackets</p>' +
          '<p><span class="tag tag-plain">Unchanged</span> Everything you already showed you can do</p>' +
        '</div>' +
      '</div>' +
      actions([{ label: 'Repair this step', action: 'goto', value: 'learn', primary: true }]) +
      '</div>';
  };

  SCREENS.learn = function (s) {
    return '<div class="screen screen-learn">' +
      '<div class="khan-band">' +
        '<p class="khan-line">BACKTRACK finds the route. <strong>Khan Academy supports the learning.</strong></p>' +
      '</div>' +
      '<div class="learn-grid">' +
        '<div class="learn-main">' +
          '<p class="label">Worked example</p>' +
          '<h2 class="t-sub">The 2 has to reach both terms.</h2>' +
          '<div id="distribute-widget" class="dist"></div>' +
        '</div>' +
        '<aside class="learn-side">' +
          '<p class="label">Practice on Khan Academy</p>' +
          '<div class="resource">' +
            '<p class="resource-title">Distributive property · expanding brackets</p>' +
            '<p class="resource-note">Khan Academy hosts the explanations, videos and practice for this step. BACKTRACK does not reproduce them.</p>' +
            '<p class="tag tag-caution resource-tag"><span class="glyph" aria-hidden="true">●</span>Resource mapping preview</p>' +
            '<p class="resource-small">This prototype could not verify a specific Khan lesson URL from its build environment, so it links to Khan Academy’s own search rather than asserting a deep link that might be wrong.</p>' +
            '<a class="btn btn-ghost btn-sm" href="https://www.khanacademy.org/search?page_search_query=distributive%20property" target="_blank" rel="noopener noreferrer">Open Khan Academy<span class="sr-only"> (opens in a new tab)</span></a>' +
          '</div>' +
          '<p class="resource-caveat"><strong>Opening this does not count as learning.</strong> Nothing is marked repaired until you answer a fresh question below.</p>' +
        '</aside>' +
      '</div>' +
      '<div class="learn-foot">' +
        '<p class="small">Learn however you want — Khan Academy, a teacher, your notes, an AI tutor. BACKTRACK decides from what you can do next, not from how convincing the explanation sounded.</p>' +
        actions([{ label: 'I’m ready for a fresh question', action: 'goto', value: 'fresh_check', primary: true }]) +
      '</div>' +
      '</div>';
  };

  SCREENS.fresh_check = function (s) {
    var q = BANK.fresh;
    var retry = s.retry;
    return '<div class="screen">' +
      '<p class="label label-route">Fresh question — not the one you just saw</p>' +
      taskBlock(q) +
      (retry ? feedback('warn', 'Not yet.', esc(retry.why),
          '<p class="feedback-aside"><strong>Hint.</strong> ' + esc(retry.hint) + '</p>') : '') +
      choiceList(q) +
      '<p class="note assist-note">Stuck? <button class="btn-quiet" data-action="assist">Show the worked example again</button> — using help is fine, and it gets recorded honestly next to your answer.</p>' +
      '</div>';
  };

  SCREENS.capability = function (s) {
    return '<div class="screen">' +
      eventBanner('capability', 'New capability', [
        'You can now expand a bracket over both terms.',
        '<strong>Today’s equation is unlocked.</strong>'
      ], s.assisted
          ? 'Recorded with the help you used. You still answered a fresh question that you could not answer before.'
          : 'You could not do this fifteen seconds of route ago. Now you can.') +
      '<div class="event-aside">' +
        '<p class="small">This is the reward for having a real gap: not points, but something you can do that you could not do before. The route has reconnected to the destination.</p>' +
      '</div>' +
      actions([{ label: 'Back to today’s equation', action: 'goto', value: 'destination_task', primary: true }]) +
      '</div>';
  };

  SCREENS.destination_task = function (s) {
    return '<div class="screen">' +
      '<p class="label label-route">Back at the destination</p>' +
      '<div class="task-eq">' + eq('4(x − 3) = 20', '4 times, open bracket, x minus 3, close bracket, equals 20', 'eq-xl') + '</div>' +
      '<h2 class="t-sub prompt">Solve for x.</h2>' +
      '<p class="small task-help">A fresh version of the thing that stopped you. Type just the value, or write it as x = something.</p>' +
      '<form class="answer-form" data-action="solve">' +
        '<label class="sr-only" for="solve-input">Your answer for x</label>' +
        '<input id="solve-input" class="answer-input" type="text" inputmode="text" autocomplete="off" ' +
          'placeholder="x = ?" aria-describedby="solve-help">' +
        '<button class="btn btn-primary" type="submit">Check</button>' +
      '</form>' +
      '<p id="solve-help" class="note">' + (s.retry ? '<span class="wrong-inline">' + esc(s.retry) + '</span>' : 'Either method works — expand the bracket first, or divide both sides by 4 first.') + '</p>' +
      '<p class="note"><button class="btn-quiet" data-action="show_methods">Show both valid methods</button></p>' +
      (s.showMethods ? methodsPanel() : '') +
      '</div>';
  };

  function methodsPanel() {
    return '<div class="methods">' +
      '<div class="method">' +
        '<p class="label">Method A · expand first</p>' +
        '<p>' + eq('4x − 12 = 20', '4 x minus 12 equals 20', 'eq-md') + '</p>' +
        '<p>' + eq('4x = 32', '4 x equals 32', 'eq-md') + '</p>' +
        '<p>' + eq('x = 8', 'x equals 8', 'eq-md') + '</p>' +
      '</div>' +
      '<div class="method">' +
        '<p class="label">Method B · divide first</p>' +
        '<p>' + eq('x − 3 = 5', 'x minus 3 equals 5', 'eq-md') + '</p>' +
        '<p>' + eq('x = 8', 'x equals 8', 'eq-md') + '</p>' +
        '<p class="note">Fewer steps. Equally correct.</p>' +
      '</div>' +
      '</div>';
  }

  SCREENS.solved = function (s) {
    return '<div class="screen">' +
      eventBanner('solved', 'Destination reached', [
        'You solved a fresh version of the thing that stopped you.'
      ], null) +
      '<div class="verify">' +
        '<p class="label">Check it</p>' +
        '<p class="verify-line">' + eq('4(8 − 3) = 4 × 5 = 20', '4 times, open bracket, 8 minus 3, close bracket, equals 4 times 5, equals 20', 'eq-lg') + '</p>' +
        '<p class="small">It holds.</p>' +
      '</div>' +
      '<p class="honest-note"><strong>What this is not.</strong> This is one worked example inside a demonstration. It is not evidence that anything was retained, and BACKTRACK will not claim you have mastered algebra on the strength of it. A real check would come back days later, with fresh questions.</p>' +
      actions([{ label: 'Continue', action: 'goto', value: 'next_turn', primary: true }]) +
      '</div>';
  };

  SCREENS.next_turn = function (s) {
    return '<div class="screen">' +
      '<div class="event event-turn">' +
        '<p class="event-label">Next turn — 3 min</p>' +
        '<p class="event-line turn-line">One quick check could remove <strong>' +
          (s.removed.indexOf('rev_negative') === -1 ? '1 more review step' : 'the last review step') +
        '</strong> from your route.</p>' +
        '<p class="event-foot">Optional. The route is already saved either way, and nothing is lost by stopping.</p>' +
      '</div>' +
      actions([
        { label: 'Take the next turn', action: 'goto', value: 'next_turn_check', primary: true },
        { label: 'Stop here — save my route', action: 'goto', value: 'stopped' }
      ]) +
      '</div>';
  };

  SCREENS.next_turn_check = function (s) {
    var q = BANK.next_turn;
    return '<div class="screen">' +
      '<p class="label label-route">Next turn · 1 question</p>' +
      taskBlock(q) +
      choiceList(q) +
      '</div>';
  };

  SCREENS.next_turn_result = function (s) {
    var correct = s.lastCorrect;
    return '<div class="screen">' +
      (correct
        ? eventBanner('shortcut', 'Shortcut found', [
            'Negative terms were the last thing your route was still holding in reserve.',
            '<strong>1 review removed.</strong>'
          ], 'That is the whole mechanic: one small honest action, one visible change to the route.')
        : eventBanner('gap', 'Route updated', [
            'The negative sign did not carry through to both terms.',
            '<strong>That step stays on your route.</strong>'
          ], 'Nothing is taken away for getting it wrong. The step simply stays until it is repaired.')) +
      '<div class="stop-point">' +
        '<p class="label">Clean stopping point</p>' +
        '<p class="small">One continuation was offered. There is not another one queued behind it, and there is no feed here.</p>' +
      '</div>' +
      actions([
        { label: 'Preview coming back after a week', action: 'goto', value: 'comeback_offer', primary: true },
        { label: 'Stop here — save my route', action: 'goto', value: 'stopped' }
      ]) +
      '</div>';
  };

  SCREENS.comeback_offer = function (s) {
    return '<div class="screen">' +
      '<div class="sim-band">' +
        '<p class="label label-caution">Simulated</p>' +
        '<p class="small">No time is about to pass. This shows what BACKTRACK does when someone disappears for a week and comes back — the situation the product was built for.</p>' +
      '</div>' +
      '<h2 class="display t-section">A week goes by.</h2>' +
      '<p class="t-lead">Something happened. It usually does. On most systems this is where a streak breaks and the learner quietly stops coming back.</p>' +
      actions([{ label: 'Come back', action: 'goto', value: 'comeback', primary: true }]) +
      '</div>';
  };

  SCREENS.comeback = function (s) {
    var q = BANK.comeback;
    return '<div class="screen">' +
      '<div class="welcome">' +
        '<p class="tag tag-plain sim-tag">Simulated — one week later</p>' +
        '<h2 class="display t-section">Welcome back.</h2>' +
        '<p class="t-lead">Let’s check where to resume.</p>' +
      '</div>' +
      '<div class="kept">' +
        '<p class="label label-success">Still yours</p>' +
        '<p class="small">Everything you proved last time is intact. Nothing was reset, no streak was destroyed, and you are not starting from the beginning.</p>' +
      '</div>' +
      taskBlock(q) +
      choiceList(q) +
      '</div>';
  };

  SCREENS.comeback_result = function (s) {
    var correct = s.lastCorrect;
    return '<div class="screen">' +
      (correct
        ? eventBanner('capability', 'Still there', [
            'The bracket step held over the gap.',
            '<strong>Resuming where you stopped.</strong>'
          ], 'Streaks reward never falling off. BACKTRACK rewards getting back on.')
        : eventBanner('gap', 'Re-opening one step', [
            'That one did not hold over the week — which is completely normal.',
            '<strong>The step goes back on the route.</strong>'
          ], 'No penalty, no lost progress. Forgetting is a routing problem, not a character flaw.')) +
      actions([{ label: 'Finish', action: 'goto', value: 'end', primary: true }]) +
      '</div>';
  };

  SCREENS.stopped = function (s) {
    return '<div class="screen">' +
      '<h2 class="display t-section">Route saved.</h2>' +
      '<p class="t-lead">You stopped where you wanted to. Nothing is lost, nothing expires, and there is no penalty waiting for you next time.</p>' +
      actions([
        { label: 'Preview coming back after a week', action: 'goto', value: 'comeback_offer', primary: true },
        { label: 'Start again', action: 'restart' }
      ]) +
      '</div>';
  };

  SCREENS.end = function (s) {
    return '<div class="screen screen-end">' +
      '<p class="label">End of demo</p>' +
      '<h2 class="display t-section">That is the whole loop.</h2>' +
      '<div class="recap">' +
        '<p class="recap-line"><span class="recap-n">1</span> You arrived with something you needed now.</p>' +
        '<p class="recap-line"><span class="recap-n">2</span> BACKTRACK checked what you could already do.</p>' +
        '<p class="recap-line"><span class="recap-n">3</span> It kept what you proved and routed only the rest.</p>' +
        '<p class="recap-line"><span class="recap-n">4</span> Khan Academy carried the learning.</p>' +
        '<p class="recap-line"><span class="recap-n">5</span> You proved the change on a fresh question.</p>' +
        '<p class="recap-line"><span class="recap-n">6</span> The route got shorter, and it offered one useful next turn.</p>' +
      '</div>' +
      '<p class="honest-note"><strong>Status.</strong> This is an illustrative prototype built for KEIC 2026. It has no pilot results, no users and no partner schools yet. What you just used is the product logic, not evidence that it works.</p>' +
      actions([
        { label: 'Start again', action: 'restart', primary: true },
        { label: 'See the evidence plan', action: 'link', value: '/evidence' }
      ]) +
      '</div>';
  };

  function choiceById(q, id) {
    var found = null;
    q.choices.forEach(function (c) { if (c.id === id) found = c; });
    return found || q.choices[0];
  }

  /* ======================================================================
     TRANSITIONS
     ====================================================================== */

  function record(qid, cid, correct, confidence) {
    state.evidence.push({
      questionId: qid,
      answerId: cid,
      correct: !!correct,
      confidence: confidence || null,
      assisted: state.assisted || false,
      mode: state.mode
    });
  }

  function applyConfidence(conf) {
    var ev = evidenceFor(state, 'first_step');
    if (ev) ev.confidence = conf;
    var correct = ev && ev.correct;
    var unsureAnswer = state.answer === 'unsure';

    if (correct) {
      /* Correct is correct. Confidence only decides how much review the route
         is willing to drop on the strength of it. */
      if (conf === 'confident') {
        state.removed = ['rev_expand', 'rev_negative'];
        state.keepToVerify = false;
      } else if (conf === 'remember') {
        state.removed = ['rev_expand'];
        state.keepToVerify = true;
      } else {
        state.removed = [];
        state.keepToVerify = true;
      }
      state.annotation = { nodeId: 'bracket', text: 'Known — kept', tone: 'route' };
      go('shortcut');
      return;
    }

    if (unsureAnswer) {
      /* "I don't know yet" is information, not failure. */
      if (conf === 'never_learned') { state.gapSkill = 'expand'; go('gap_found'); }
      else go('probe');
      return;
    }

    /* Wrong answer. What gets checked next depends on what they told us. */
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
    var q = BANK[qid];
    var c = choiceById(q, cid);
    var correct = !!c.correct;

    if (qid === 'first_step') {
      state.answer = cid;
      record(qid, cid, correct, null);
      go('task1_result');
      return;
    }

    if (qid === 'probe') {
      record(qid, cid, correct, null);
      if (correct) {
        state.annotation = { nodeId: 'bracket', text: 'Verified — no review added', tone: 'route' };
        go('probe_verified');
      } else {
        state.gapSkill = 'expand';
        state.annotation = { nodeId: 'rev_expand', text: 'Repair this step', tone: 'caution' };
        go('gap_found');
      }
      return;
    }

    if (qid === 'contrast') {
      record(qid, cid, correct, null);
      if (correct) {
        state.annotation = { nodeId: 'bracket', text: 'A slip, not a gap', tone: 'route' };
        go('probe_verified');
      } else {
        state.gapSkill = 'expand';
        state.annotation = { nodeId: 'rev_expand', text: 'Rule needs repair', tone: 'caution' };
        go('gap_found');
      }
      return;
    }

    if (qid === 'fresh') {
      if (correct) {
        record(qid, cid, true, null);
        state.retry = null;
        state.unlocked = true;
        state.annotation = { nodeId: 'rev_expand', text: 'Repaired', tone: 'success' };
        go('capability');
      } else {
        state.attempts++;
        state.retry = { why: c.why, hint: c.hint };
        render();   /* stay on the question; wrong stays wrong */
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
        state.gapSkill = 'expand';
        state.unlocked = false;
        state.annotation = { nodeId: 'rev_expand', text: 'Re-opened', tone: 'caution' };
      }
      go('comeback_result');
      return;
    }
  }

  /* ======================================================================
     NAVIGATION
     ====================================================================== */

  function snapshot() { return JSON.parse(JSON.stringify(state)); }

  function go(screen) {
    stack.push(snapshot());
    state.screen = screen;
    state.retry = null;
    if (screen !== 'destination_task') state.showMethods = false;
    push();
    render();
    focusStage();
  }

  function push() {
    if (suppressPush) return;
    try { history.pushState({ bt: stack.length }, ''); } catch (e) {}
  }

  function back() {
    if (!stack.length) return;
    state = stack.pop();
    render();
    focusStage();
  }

  function restart() {
    stack = [];
    state = initialState();
    clearSaved();
    render();
    focusStage();
  }

  function focusStage() {
    var h = stage.querySelector('h1, h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    var bar = document.querySelector('.demo-bar');
    if (bar && window.scrollY > bar.offsetTop + 120) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function announce(msg) {
    if (liveRegion) { liveRegion.textContent = ''; setTimeout(function () { liveRegion.textContent = msg; }, 40); }
  }

  /* ======================================================================
     PERSISTENCE — local only, and easy to erase
     ====================================================================== */

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify({ s: state, k: stack.slice(-12) })); } catch (e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return false;
      var d = JSON.parse(raw);
      if (!d || !d.s || !d.s.screen) return false;
      state = d.s; stack = d.k || [];
      return true;
    } catch (e) { return false; }
  }
  function clearSaved() { try { localStorage.removeItem(STORE); } catch (e) {} }

  /* ======================================================================
     RENDER
     ====================================================================== */

  function render() {
    var fn = SCREENS[state.screen] || SCREENS.mode;
    stage.innerHTML = fn(state);

    document.body.classList.toggle('is-guided', state.mode === 'guided');
    var banner = document.getElementById('guided-banner');
    if (banner) banner.hidden = state.mode !== 'guided';

    var destBar = document.getElementById('dest-bar');
    if (destBar) destBar.hidden = (state.screen === 'mode');

    if (backBtn) backBtn.disabled = stack.length === 0;

    if (route) route.setModel(routeFor(state), true);
    renderSide();

    if (state.screen === 'learn') buildDistributeWidget();

    save();
  }

  function renderSide() {
    if (!sidePanel) return;
    var ev = state.evidence;
    var html = '';

    html += '<div class="side-block">' +
      '<p class="label">What BACKTRACK has seen</p>' +
      (state.budget ? '<p class="note session-note">Session: ' + state.budget + ' min</p>' : '');
    if (!ev.length) {
      html += '<p class="note">Nothing yet. The route below is provisional until you answer something.</p>';
    } else {
      html += '<ul class="evidence">';
      ev.forEach(function (e) {
        var q = BANK[e.questionId];
        html += '<li>' +
          '<span class="ev-mark ' + (e.correct ? 'is-ok' : 'is-no') + '" aria-hidden="true">' +
            (e.correct ? '✓' : '✗') + '</span>' +
          '<span class="ev-body">' +
            '<span class="ev-q">' + esc(q ? q.task : e.questionId) + '</span>' +
            '<span class="ev-meta">' + (e.correct ? 'correct' : 'not correct') +
              (e.confidence ? ' · said: ' + esc(confLabel(e.confidence)) : '') +
              (e.assisted ? ' · used help' : '') +
            '</span>' +
          '</span>' +
        '</li>';
      });
      html += '</ul>';
    }
    html += '</div>';

    sidePanel.innerHTML = html;
  }

  function confLabel(id) {
    var f = CONFIDENCE.filter(function (c) { return c.id === id; })[0];
    return f ? f.label.toLowerCase() : id;
  }

  /* ======================================================================
     DISTRIBUTION EXPLAINER
     Click or keyboard, never drag. Three deliberate steps.
     ====================================================================== */

  function buildDistributeWidget() {
    var host = document.getElementById('distribute-widget');
    if (!host) return;
    var step = 0;

    function draw() {
      var html = '' +
        '<div class="dist-stage" aria-live="polite">' +
          '<div class="dist-row dist-row-1' + (step >= 0 ? ' on' : '') + '">' +
            '<span class="dist-term dist-mult' + (step >= 1 ? ' lit' : '') + '">2</span>' +
            '<span class="dist-brk">(</span>' +
            '<span class="dist-term dist-a' + (step >= 1 ? ' lit' : '') + '">y</span>' +
            '<span class="dist-op">+</span>' +
            '<span class="dist-term dist-b' + (step >= 1 ? ' lit' : '') + '">4</span>' +
            '<span class="dist-brk">)</span>' +
          '</div>' +
          (step >= 1
            ? '<div class="dist-arcs" aria-hidden="true">' +
                '<svg viewBox="0 0 260 44" preserveAspectRatio="none">' +
                  '<path class="dist-arc" d="M18,4 C18,30 74,18 74,40" fill="none"/>' +
                  '<path class="dist-arc" d="M18,4 C18,34 150,20 150,40" fill="none"/>' +
                '</svg>' +
              '</div>'
            : '') +
          (step >= 1
            ? '<div class="dist-row dist-row-2">' +
                '<span class="dist-pair">2 × y</span>' +
                '<span class="dist-op">+</span>' +
                '<span class="dist-pair">2 × 4</span>' +
              '</div>'
            : '') +
          (step >= 2
            ? '<div class="dist-row dist-row-3">' +
                eq('2y + 8', '2 y plus 8', 'eq-lg') +
              '</div>'
            : '') +
        '</div>' +
        '<p class="dist-say">' + esc(
            step === 0 ? 'The number outside the bracket multiplies everything inside it — not just the first thing it touches.'
          : step === 1 ? 'Two products, because there are two terms inside the bracket.'
          : 'Multiply each one out and add them. That is the whole rule.'
        ) + '</p>' +
        '<div class="dist-controls">' +
          (step < 2
            ? '<button class="btn btn-primary btn-sm" data-dist="next">' +
                (step === 0 ? 'Show the two products' : 'Multiply them out') + '</button>'
            : '<button class="btn btn-ghost btn-sm" data-dist="reset">Play it again</button>') +
          '<span class="dist-step">Step ' + (step + 1) + ' of 3</span>' +
        '</div>';
      host.innerHTML = html;
    }

    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dist]');
      if (!b) return;
      if (b.getAttribute('data-dist') === 'next') step = Math.min(step + 1, 2);
      else step = 0;
      draw();
      var nb = host.querySelector('[data-dist]');
      if (nb) nb.focus();
    });

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

    if (action === 'mode') {
      state.mode = value;
      go('intro');
    } else if (action === 'budget') {
      state.budget = parseInt(value, 10);
      go('task1');
    } else if (action === 'answer') {
      handleAnswer(t.getAttribute('data-q'), t.getAttribute('data-c'));
    } else if (action === 'confidence') {
      applyConfidence(value);
    } else if (action === 'goto') {
      go(value);
    } else if (action === 'switch_guided') {
      state.mode = 'guided';
      state.gapSkill = null;
      state.unlocked = false;
      state.removed = [];
      state.evidence = state.evidence.filter(function (x) { return x.questionId !== 'first_step'; });
      state.answer = null;
      state.annotation = null;
      go('task1');
      announce('Switched to the example learner. This path is illustrative.');
    } else if (action === 'assist') {
      state.assisted = true;
      go('learn');
    } else if (action === 'show_methods') {
      state.showMethods = !state.showMethods;
      render();
    } else if (action === 'restart') {
      restart();
    } else if (action === 'back') {
      back();
    } else if (action === 'clear') {
      restart();
      announce('Demo progress cleared.');
    } else if (action === 'link') {
      window.location.href = value;
    }
  }

  function onSubmit(e) {
    var form = e.target.closest('[data-action="solve"]');
    if (!form) return;
    e.preventDefault();
    var input = form.querySelector('.answer-input');
    var raw = (input.value || '').trim();

    /* Deliberately a normaliser, not an evaluator. Nothing the visitor types
       is ever executed. */
    var norm = raw.toLowerCase().replace(/\s+/g, '').replace(/^x=/, '');
    var ok = (norm === '8' || norm === '8.0' || norm === '+8');

    if (ok) {
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
    sidePanel = document.getElementById('demo-side');
    liveRegion = document.getElementById('demo-live');
    backBtn = document.querySelector('[data-action="back"]');
    if (!stage) return;

    var routeHost = document.getElementById('demo-route');
    if (routeHost && window.BacktrackRoute) {
      route = window.BacktrackRoute.create(routeHost, { compactAt: 640, labelMax: 13 });
    }

    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);

    window.addEventListener('popstate', function () {
      if (stack.length) {
        suppressPush = true;
        back();
        suppressPush = false;
      }
    });

    if (!load()) state = initialState();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
