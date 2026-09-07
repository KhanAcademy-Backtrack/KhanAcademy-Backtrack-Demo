/* ==========================================================================
   BACKTRACK — route renderer
   The route is the product's central visual language, not decoration.
   It must always answer: where were you going, what evidence changed the
   path, what was preserved, what is being checked now, how do you get back.

   A route is one continuous stroke. Prerequisite work is a spur that dips
   below the spine and rejoins it. The destination is anchored at the end and
   never moves. Shape changes are morphed (path resampling) so the visitor
   sees the route change rather than being shown a different picture.
   ========================================================================== */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var SAMPLES = 64;

  var reduced = global.matchMedia
    ? global.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  /* Status vocabulary. Every status carries a glyph and a word, so the route
     is never readable by colour alone. */
  var STATUS = {
    unknown:             { cls: 'is-unknown',   glyph: '',  word: 'Not checked yet' },
    checked:             { cls: 'is-checked',   glyph: '✓', word: 'Known' },
    uncertain:           { cls: 'is-uncertain', glyph: '?', word: 'Uncertain' },
    practice_suggested:  { cls: 'is-practice',  glyph: '',  word: 'Practice suggested' },
    capability_unlocked: { cls: 'is-unlocked',  glyph: '✓', word: 'New capability' },
    reached:             { cls: 'is-reached',   glyph: '✓', word: 'Reached' },
    ready_to_try:        { cls: 'is-ready',     glyph: '',  word: 'Ready to try' },
    active:              { cls: 'is-active',    glyph: '',  word: 'Working here now' }
  };

  /* Hidden svg used only for path measurement. */
  var measureSvg = null;
  function measurer() {
    if (!measureSvg) {
      measureSvg = document.createElementNS(NS, 'svg');
      measureSvg.setAttribute('width', '0');
      measureSvg.setAttribute('height', '0');
      measureSvg.style.cssText =
        'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
      document.body.appendChild(measureSvg);
    }
    return measureSvg;
  }

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---- geometry ---------------------------------------------------------- */

  /* A smooth stroke through the node points. Horizontal spurs dip below the
     spine and rejoin, which is what makes a detour read as a detour. */
  function pathThrough(pts, horizontal) {
    if (!pts.length) return 'M0,0';
    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      if (horizontal) {
        var mx = (a[0] + b[0]) / 2;
        d += ' C' + mx + ',' + a[1] + ' ' + mx + ',' + b[1] + ' ' + b[0] + ',' + b[1];
      } else {
        var my = (a[1] + b[1]) / 2;
        d += ' C' + a[0] + ',' + my + ' ' + b[0] + ',' + my + ' ' + b[0] + ',' + b[1];
      }
    }
    return d;
  }

  function samplePath(d, n) {
    var p = el('path', { d: d }, measurer());
    var out = [];
    try {
      var len = p.getTotalLength();
      for (var i = 0; i < n; i++) {
        var pt = p.getPointAtLength(len * (i / (n - 1)));
        out.push([pt.x, pt.y]);
      }
    } catch (e) {
      out = null;
    }
    measurer().removeChild(p);
    return out;
  }

  function polyline(pts) {
    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var i = 1; i < pts.length; i++) d += ' L' + pts[i][0] + ',' + pts[i][1];
    return d;
  }

  /* ---- label wrapping ---------------------------------------------------- */

  function wrapLabel(text, max) {
    var words = String(text || '').split(/\s+/), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var next = cur ? cur + ' ' + words[i] : words[i];
      if (next.length > max && cur) { lines.push(cur); cur = words[i]; }
      else cur = next;
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 2);
  }

  /* ---- view -------------------------------------------------------------- */

  function RouteView(host, opts) {
    opts = opts || {};
    this.host = host;
    this.compactAt = opts.compactAt || 720;   // below this, route goes vertical
    this.labelMax = opts.labelMax || 15;
    this.model = { nodes: [] };
    this.currentD = null;
    this.raf = 0;

    host.classList.add('routeview');

    this.svg = el('svg', {
      'class': 'routeview-svg',
      preserveAspectRatio: 'xMidYMid meet',
      focusable: 'false',
      'aria-hidden': 'true'
    }, host);

    this.gPath = el('g', { 'class': 'rv-lines' }, this.svg);
    this.gNodes = el('g', { 'class': 'rv-nodes' }, this.svg);
    this.gNotes = el('g', { 'class': 'rv-notes' }, this.svg);

    /* Text equivalent. Carries the same state as the drawing, so the route is
       fully available to screen readers and when motion is disabled. */
    this.summary = document.createElement('ol');
    this.summary.className = 'routeview-summary';
    host.appendChild(this.summary);

    var self = this;
    this.onResize = function () {
      clearTimeout(self._rt);
      self._rt = setTimeout(function () { self.render(false); }, 120);
    };
    global.addEventListener('resize', this.onResize);
  }

  RouteView.prototype.setModel = function (model, animate) {
    this.model = model || { nodes: [] };
    this.render(animate !== false);
  };

  /* Fade the named nodes out, then re-layout without them. This is what a
     shortcut looks like: work physically leaving the route. */
  RouteView.prototype.collapse = function (ids, done) {
    var self = this;
    var marks = [];
    (ids || []).forEach(function (id) {
      var g = self.gNodes.querySelector('[data-node="' + id + '"]');
      if (g) { g.classList.add('is-removing'); marks.push(g); }
    });
    var wait = (marks.length && !reduced.matches) ? 300 : 0;
    setTimeout(function () {
      self.model.nodes = self.model.nodes.filter(function (n) {
        return (ids || []).indexOf(n.id) === -1;
      });
      self.render(true);
      if (done) done();
    }, wait);
  };

  RouteView.prototype.layout = function () {
    var nodes = this.model.nodes || [];
    var w = Math.max(this.host.clientWidth || 0, 280);
    var horizontal = w >= this.compactAt;
    var pts = [], i;

    if (horizontal) {
      var padX = 40, spineY = 64, dip = 62;
      var innerW = Math.max(w - padX * 2, 120);
      var step = nodes.length > 1 ? innerW / (nodes.length - 1) : 0;
      for (i = 0; i < nodes.length; i++) {
        pts.push([padX + step * i, nodes[i].branch ? spineY + dip : spineY]);
      }
      this.viewW = w;
      this.viewH = 205;
    } else {
      var padY = 34, spineX = 30, jog = 26;
      /* Room for a two-line label, a sub-note and an annotation under each
         node without them running into the next row. */
      var rowH = 74;
      for (i = 0; i < nodes.length; i++) {
        pts.push([nodes[i].branch ? spineX + jog : spineX, padY + rowH * i]);
      }
      this.viewW = w;
      this.viewH = padY * 2 + rowH * Math.max(nodes.length - 1, 0);
    }
    this.horizontal = horizontal;
    return pts;
  };

  RouteView.prototype.render = function (animate) {
    var self = this;
    var nodes = this.model.nodes || [];
    var pts = this.layout();

    this.svg.setAttribute('viewBox', '0 0 ' + this.viewW + ' ' + this.viewH);
    this.svg.setAttribute('width', this.viewW);
    this.svg.setAttribute('height', this.viewH);
    this.host.classList.toggle('is-vertical', !this.horizontal);

    /* ---- stroke ---- */
    var nextD = pts.length ? pathThrough(pts, this.horizontal) : 'M0,0';

    if (!this.spine) {
      this.trace = el('path', { 'class': 'rv-trace', fill: 'none' }, this.gPath);
      this.spine = el('path', { 'class': 'rv-spine', fill: 'none' }, this.gPath);
    }
    /* The trace is the faint full-length route; the spine is the live one. */
    this.trace.setAttribute('d', nextD);

    if (this.currentD && animate && !reduced.matches) {
      this.morph(this.currentD, nextD);
    } else {
      cancelAnimationFrame(this.raf);
      this.spine.setAttribute('d', nextD);
    }
    this.currentD = nextD;

    /* ---- nodes ----
       On the first render nothing is "new", so the route arrives composed
       rather than animating in piece by piece. */
    if (!this.seen) this.seen = nodes.map(function (n) { return n.id; });
    this.gNodes.textContent = '';
    nodes.forEach(function (n, idx) {
      self.drawNode(n, pts[idx]);
    });
    this.seen = nodes.map(function (n) { return n.id; });

    /* ---- annotation ---- */
    this.gNotes.textContent = '';
    var ann = this.model.annotation;
    if (ann) {
      var ai = -1;
      nodes.forEach(function (n, k) { if (n.id === ann.nodeId) ai = k; });
      if (ai >= 0) this.drawNote(ann, pts[ai]);
    }

    this.writeSummary();
  };

  RouteView.prototype.morph = function (fromD, toD) {
    var a = samplePath(fromD, SAMPLES), b = samplePath(toD, SAMPLES);
    var self = this;
    cancelAnimationFrame(this.raf);
    if (!a || !b) { this.spine.setAttribute('d', toD); return; }

    var start = 0, dur = 420;
    function frame(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var e = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;   // ease in-out
      var mid = [];
      for (var i = 0; i < SAMPLES; i++) {
        mid.push([
          a[i][0] + (b[i][0] - a[i][0]) * e,
          a[i][1] + (b[i][1] - a[i][1]) * e
        ]);
      }
      self.spine.setAttribute('d', polyline(mid));
      if (t < 1) self.raf = requestAnimationFrame(frame);
      else self.spine.setAttribute('d', toD);   /* exact curve at rest */
    }
    this.raf = requestAnimationFrame(frame);
  };

  RouteView.prototype.drawNode = function (n, pt) {
    var meta = STATUS[n.status] || STATUS.unknown;
    var isDest = n.kind === 'destination';
    var isNew = this.seen && this.seen.indexOf(n.id) === -1;
    var g = el('g', {
      'class': 'rv-node ' + meta.cls + (isDest ? ' is-destination' : '') +
               (n.active ? ' is-current' : '') + (isNew ? ' is-new' : ''),
      transform: 'translate(' + pt[0] + ',' + pt[1] + ')',
      'data-node': n.id
    }, this.gNodes);

    /* Marks live in their own group so they can scale about their own centre
       without disturbing the node's placement transform. */
    var mark = el('g', { 'class': 'rv-mark' }, g);

    if (isDest) {
      /* The destination is a different object from a step: an anchored target
         that stays put while everything around it recalculates. */
      el('circle', { 'class': 'rv-dest-ring', r: 14 }, mark);
      el('rect', { 'class': 'rv-dest-core', x: -5.5, y: -5.5, width: 11, height: 11, rx: 2 }, mark);
    } else {
      el('circle', { 'class': 'rv-halo', r: 15 }, mark);
      el('circle', { 'class': 'rv-disc', r: 9 }, mark);
      if (n.status === 'practice_suggested') {
        el('circle', { 'class': 'rv-pip', r: 3.4 }, mark);
      } else if (meta.glyph) {
        var t = el('text', { 'class': 'rv-glyph', x: 0, y: 0,
          'text-anchor': 'middle', 'dominant-baseline': 'central' }, mark);
        t.textContent = meta.glyph;
      }
    }

    /* Label, then an optional sub-note stacked clear of it. Horizontal routes
       caption below the node; vertical routes caption to the right. */
    var lines = wrapLabel(n.label, this.labelMax);
    var lead = this.horizontal ? 15 : 16;
    var labelX = this.horizontal ? 0 : 22;
    var labelY = this.horizontal ? 30 : 2;

    var lg = el('text', {
      'class': 'rv-label',
      'text-anchor': this.horizontal ? 'middle' : 'start',
      x: labelX,
      y: labelY
    }, g);
    lines.forEach(function (ln, i) {
      var ts = el('tspan', { x: labelX, dy: i === 0 ? 0 : lead }, lg);
      ts.textContent = ln;
    });

    if (n.note) {
      var sub = el('text', {
        'class': 'rv-sub',
        'text-anchor': this.horizontal ? 'middle' : 'start',
        x: labelX,
        y: labelY + lines.length * lead
      }, g);
      sub.textContent = n.note;
    }
  };

  RouteView.prototype.drawNote = function (ann, pt) {
    /* Spine nodes are captioned above the line; nodes sitting down in a spur
       are captioned below their own label, which is already under them. */
    var up = this.horizontal ? (pt[1] > 90 ? -1 : 1) : 1;
    var g = el('g', { 'class': 'rv-note tone-' + (ann.tone || 'route') }, this.gNotes);
    var x = pt[0], y = pt[1];
    if (this.horizontal) {
      var ny = y + (up > 0 ? -34 : 68);
      el('line', { 'class': 'rv-leader', x1: x, y1: y + (up > 0 ? -17 : 17), x2: x, y2: ny + (up > 0 ? 6 : -10) }, g);
      var t = el('text', { 'class': 'rv-note-text', x: x, y: ny, 'text-anchor': 'middle' }, g);
      t.textContent = ann.text;
    } else {
      var t2 = el('text', { 'class': 'rv-note-text', x: x + 22, y: y + 52, 'text-anchor': 'start' }, g);
      t2.textContent = ann.text;
    }
  };

  RouteView.prototype.writeSummary = function () {
    var nodes = this.model.nodes || [];
    var html = '';
    nodes.forEach(function (n) {
      var meta = STATUS[n.status] || STATUS.unknown;
      var kind = n.kind === 'destination' ? 'Destination' : (n.branch ? 'Detour step' : 'Step');
      html += '<li><span class="rs-kind">' + kind + ':</span>' +
              '<span class="rs-name">' + esc(n.label) + '</span>' +
              '<span class="rs-state">' + meta.word + '</span></li>';
    });
    this.summary.innerHTML = html;
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  global.BacktrackRoute = {
    create: function (host, opts) { return new RouteView(host, opts); },
    STATUS: STATUS
  };
})(window);
