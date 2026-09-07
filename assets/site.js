/* ==========================================================================
   BACKTRACK — site behaviour
   Progressive enhancement only. Every section reads correctly with this file
   blocked: nothing here reveals content, it only makes the route respond.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /* ---- mobile navigation ------------------------------------------------ */

  function initNav() {
    var btn = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  /* ---- hero route -------------------------------------------------------
     The hero's memorable moment comes from the learning logic itself: the
     destination is pinned, and one honest answer visibly changes the path to
     it. Both answers lead somewhere real — one removes work, one opens a
     detour that reconnects. Neither is a canned animation. */

  var HERO = {
    base: function () {
      return { nodes: [
        { id: 'h1', label: 'You are here', status: 'checked' },
        { id: 'h2', label: 'Bracket step', status: 'unknown', active: true },
        { id: 'h3', label: 'Expanding brackets', note: 'provisional', branch: true, status: 'unknown' },
        { id: 'h4', label: 'Negative terms', note: 'provisional', branch: true, status: 'unknown' },
        { id: 'h5', kind: 'destination', label: 'Today’s equation', status: 'unknown' }
      ] };
    },
    known: function () {
      return { nodes: [
        { id: 'h1', label: 'You are here', status: 'checked' },
        { id: 'h2', label: 'Bracket step', status: 'checked' },
        { id: 'h5', kind: 'destination', label: 'Today’s equation', status: 'ready_to_try', active: true }
      ], annotation: { nodeId: 'h2', text: '2 reviews removed', tone: 'route' } };
    },
    unsure: function () {
      return { nodes: [
        { id: 'h1', label: 'You are here', status: 'checked' },
        { id: 'h2', label: 'Bracket step', status: 'uncertain' },
        { id: 'h3', label: 'Expanding brackets', note: 'repair this', branch: true, status: 'practice_suggested', active: true },
        { id: 'h6', label: 'Fresh check', branch: true, status: 'unknown' },
        { id: 'h5', kind: 'destination', label: 'Today’s equation', status: 'unknown' }
      ], annotation: { nodeId: 'h3', text: 'Checking one step earlier', tone: 'caution' } };
    }
  };

  var HERO_SAY = {
    base: 'BACKTRACK has not checked anything yet, so the route still carries the review steps this destination might need.',
    known: 'Two review steps left the route because you showed you did not need them. The destination did not move.',
    unsure: 'The route bends to one earlier step and reconnects. Nothing was added anywhere else, and the destination did not move.'
  };

  function initHeroRoute() {
    var host = document.getElementById('hero-route');
    if (!host || !window.BacktrackRoute) return;

    var view = window.BacktrackRoute.create(host, { compactAt: 420, labelMax: 11 });
    view.setModel(HERO.base(), false);

    var say = document.getElementById('hero-say');
    var group = document.querySelector('.hero-ask');
    if (!group) return;

    group.addEventListener('click', function (e) {
      var b = e.target.closest('[data-hero]');
      if (!b) return;
      var key = b.getAttribute('data-hero');

      group.querySelectorAll('[data-hero]').forEach(function (x) {
        x.setAttribute('aria-pressed', x === b && key !== 'base' ? 'true' : 'false');
      });

      if (key === 'known') {
        /* Steps physically leave the route, then it re-lays out. */
        view.collapse(['h3', 'h4'], function () { view.setModel(HERO.known(), true); });
      } else {
        view.setModel(HERO[key](), true);
      }
      if (say) say.textContent = HERO_SAY[key];
    });
  }

  /* ---- recalculating section -------------------------------------------
     Scroll advances the argument; it never gates it. Each step's text is in
     the document and readable on its own. The route simply keeps up. */

  var RECALC = [
    { nodes: [
        { id: 'r1', label: 'Absent Tuesday', status: 'checked' },
        { id: 'r2', label: 'Missed step', status: 'unknown' },
        { id: 'r3', label: 'Next topic', status: 'unknown' },
        { id: 'r4', kind: 'destination', label: 'Today’s lesson', status: 'unknown' }
      ] },
    { nodes: [
        { id: 'r1', label: 'Absent Tuesday', status: 'checked' },
        { id: 'r2', label: 'Missed step', status: 'uncertain' },
        { id: 'r3', label: 'Next topic', status: 'uncertain' },
        { id: 'r4', kind: 'destination', label: 'Today’s lesson', status: 'unknown' }
      ], annotation: { nodeId: 'r3', text: 'and the one after that', tone: 'caution' } },
    { nodes: [
        { id: 'r1', label: 'Absent Tuesday', status: 'checked' },
        { id: 'r2', label: 'Missed step', status: 'practice_suggested', branch: true, active: true },
        { id: 'r3', label: 'Next topic', status: 'checked' },
        { id: 'r4', kind: 'destination', label: 'Today’s lesson', status: 'unknown' }
      ], annotation: { nodeId: 'r2', text: 'Recalculating', tone: 'route' } },
    { nodes: [
        { id: 'r2', label: 'Step repaired', status: 'capability_unlocked' },
        { id: 'r3', label: 'Next topic', status: 'checked' },
        { id: 'r4', kind: 'destination', label: 'Today’s lesson', status: 'ready_to_try', active: true }
      ], annotation: { nodeId: 'r4', text: 'Reconnected', tone: 'success' } }
  ];

  function initRecalc() {
    var host = document.getElementById('recalc-route');
    var steps = [].slice.call(document.querySelectorAll('.recalc-step'));
    if (!host || !steps.length || !window.BacktrackRoute) return;

    var view = window.BacktrackRoute.create(host, { compactAt: 620, labelMax: 12 });
    var current = -1;

    function show(i) {
      if (i === current) return;
      current = i;
      view.setModel(RECALC[Math.min(i, RECALC.length - 1)], true);
      steps.forEach(function (s, k) { s.classList.toggle('is-live', k === i); });
    }

    show(0);

    if (!('IntersectionObserver' in window)) { show(RECALC.length - 1); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) show(steps.indexOf(en.target));
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    steps.forEach(function (s) { io.observe(s); });
  }

  /* ---- small static routes used as section illustrations ---------------- */

  function initStaticRoutes() {
    document.querySelectorAll('[data-route]').forEach(function (host) {
      if (!window.BacktrackRoute) return;
      var model;
      try { model = JSON.parse(host.getAttribute('data-route')); }
      catch (e) { return; }
      var view = window.BacktrackRoute.create(host, {
        compactAt: parseInt(host.getAttribute('data-compact-at') || '520', 10),
        labelMax: 13
      });
      view.setModel(model, false);
    });
  }

  /* ---- reveal ------------------------------------------------------------
     Opt-in and non-blocking: the class is only added once we know an observer
     exists, so content is never left hidden by a failed script. */

  function initReveal() {
    if (reduced || !('IntersectionObserver' in window)) return;
    var items = [].slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    document.documentElement.classList.add('reveal-armed');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    items.forEach(function (i) { io.observe(i); });
  }

  /* ---- route panel: open on desktop, collapsed on small screens --------- */

  function initRoutePanels() {
    document.querySelectorAll('.route-panel').forEach(function (d) {
      if (window.innerWidth >= 1000) d.open = true;
    });
  }

  function boot() {
    initNav();
    initHeroRoute();
    initRecalc();
    initStaticRoutes();
    initReveal();
    initRoutePanels();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
