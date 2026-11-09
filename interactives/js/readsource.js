/* =============================================================================
   readsource.js — the shared engine behind the four "How to Read a …" pages
   (Appendices A–D). Classic script; load js/lib.js, js/export-reflect.js and
   js/research-log.js first.

   What it does, page-independently:
     • reading modes  — the select swaps the mode note and the engage steps;
                        the answer mode (cfg.answerMode) turns the chain on.
     • question callout — while the chain runs, the question the student is
                        holding sits in a pinned parchment callout above the
                        source, with the starting question kept visible as
                        the root and a strip of what was answered here and
                        what was logged for a different source.
     • the chain      — each step is a question. Kind "find": click the part
                        of the document that answers it (elements carry
                        data-ans="key"). Kind "choice": pick among options.
                        After every answer the scoped answer is shown, the
                        student may draft a Research Log entry (their words,
                        never ours), and the answer produces the next
                        question. Stay or go: is the next question answered
                        in this source, or does it need a different one?
     • Research Log   — student-initiated only. "Add to my Research Log"
                        prefills Question / Type / Source / Citation and
                        leaves What I Found, How This Answers, Next Question
                        for the student. Nothing is written until they save.

   FERPA: all state is in-memory or in this browser's localStorage/session
   storage (via the shared log and record components). Nothing leaves.

   Usage — see any of the four pages. Minimal shape:
     ReadSource.init({
       module, chapter, session,             // record identity
       answerMode: "answer",                 // which select value runs the chain
       modes: [{value, label, note, steps:[html…]}, …],
       source: "what to prefill as Source",  // log draft default
       chain: [ step, … ],                   // see the pages for the fields
       onModeChange: function(value){},      // optional page hook
       onStepStart: function(step, i){}      // optional page hook (e.g. reset a viewer)
     });
     ReadSource.answer(key, label)  -> true if the click was consumed as an answer
     ReadSource.active()            -> a "find" question is open
   ========================================================================== */
(function () {
  "use strict";
  var el = window.QM ? QM.el : null;
  if (!el) return;

  var CFG = null;
  var ST = { i: -1, stage: "idle", answered: [], later: [], mode: "" };
  var N = {}; /* nodes */

  function $(id) { return document.getElementById(id); }
  function log(a, b) { if (window.ExportReflect) ExportReflect.log(a, b); }
  function announce(node, html) {
    /* clear-then-set so identical messages still announce */
    node.innerHTML = "";
    window.setTimeout(function () { node.innerHTML = html; }, 30);
  }
  function typeBadge(t) {
    if (!t) return null;
    var cls = /Definitional/i.test(t) ? "t-def" : /Exploratory/i.test(t) ? "t-exp" : /Application/i.test(t) ? "t-app" : "t-foc";
    return el("span", { class: "rs-type " + cls }, [t]);
  }

  /* ---------------------------------------------------------------- modes */
  function applyMode(v, announceIt) {
    ST.mode = v;
    var m = CFG.modes.filter(function (x) { return x.value === v; })[0];
    if (!m) return;
    if (announceIt) announce(N.note, m.note); else N.note.innerHTML = m.note;
    if (N.engage) {
      N.engagewrap.hidden = !(m.steps && m.steps.length);
      N.engage.innerHTML = (m.steps || []).map(function (x) { return "<li>" + x + "</li>"; }).join("");
    }
    var on = (v === CFG.answerMode);
    N.callout.hidden = !on;
    N.wk.hidden = !on;
    if (on && ST.stage === "idle") renderIdle(true);
    if (!on) { ST.stage = "idle"; ST.i = -1; clearHits(); }
    if (CFG.onModeChange) CFG.onModeChange(v);
  }

  /* -------------------------------------------------------------- callout */
  function renderCallout() {
    var c = N.callout;
    c.innerHTML = "";
    var step = ST.i >= 0 ? CFG.chain[ST.i] : null;
    var head = el("p", { class: "rs-ck" }, [step ? "The question you are holding" : "Start the chain to see the question you will read for"]);
    c.appendChild(head);
    if (step) {
      c.appendChild(el("p", { class: "rs-cq" }, ["\u201c" + step.q + "\u201d", " ", typeBadge(step.type)]));
      if (ST.i > 0) c.appendChild(el("p", { class: "rs-croot" }, ["Started from: \u201c" + CFG.chain[0].q + "\u201d"]));
      else if (CFG.rootNote) c.appendChild(el("p", { class: "rs-croot" }, [CFG.rootNote]));
    } else if (CFG.chain.length) {
      c.appendChild(el("p", { class: "rs-cq muted" }, ["\u201c" + CFG.chain[0].q + "\u201d", " ", typeBadge(CFG.chain[0].type)]));
      if (CFG.rootNote) c.appendChild(el("p", { class: "rs-croot" }, [CFG.rootNote]));
    }
    var strip = el("div", { class: "rs-strip" });
    strip.appendChild(stripList("Answered in this source", ST.answered, "a"));
    strip.appendChild(stripList("Logged for a different source", ST.later, "l"));
    c.appendChild(strip);
  }
  function stripList(title, items, kind) {
    var d = el("details", { class: "rs-sl rs-sl-" + kind });
    d.appendChild(el("summary", {}, [title + " ", el("span", { class: "rs-n" }, [String(items.length)])]));
    var ul = el("ul", {});
    if (!items.length) ul.appendChild(el("li", { class: "rs-empty" }, ["nothing yet"]));
    items.forEach(function (it) {
      ul.appendChild(el("li", {}, [el("span", { class: "rs-q" }, [it.q]), it.meta ? el("span", { class: "rs-meta" }, [" \u2014 " + it.meta]) : null]));
    });
    d.appendChild(ul);
    return d;
  }

  /* ---------------------------------------------------------------- chain */
  function clearHits() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-ans].rs-hit"), function (x) { x.classList.remove("rs-hit"); });
  }
  function renderIdle(first) {
    ST.stage = "idle"; ST.i = -1; ST.answered = []; ST.later = [];
    clearHits();
    renderCallout();
    var h = N.wkbody; h.innerHTML = "";
    h.appendChild(el("p", { class: "ws" }, [first
      ? (CFG.idleText || "You arrive holding a question. Read only as much of the source as it takes to answer it, write the answer down, and let it hand you the next question. Anatomy clicks pause while a question is open.")
      : "Chain complete for this source. Run it again, or switch modes to explore freely."]));
    var b = el("button", { class: "wbtn", type: "button", onclick: function () { start(0); } }, [first ? "Start with the first question" : "Run the chain again"]);
    h.appendChild(b);
  }
  function start(i) {
    ST.i = i; ST.stage = "find";
    var s = CFG.chain[i];
    clearHits();
    renderCallout();
    if (CFG.onStepStart) CFG.onStepStart(s, i);
    var h = N.wkbody; h.innerHTML = "";
    h.appendChild(el("p", { class: "ws" }, ["Question " + (i + 1) + " of " + CFG.chain.length]));
    h.appendChild(el("p", { class: "wq" }, ["\u201c" + s.q + "\u201d"]));
    if (s.kind === "choice") {
      h.appendChild(el("p", { class: "ws" }, [s.prompt || "Decide from what the source shows you."]));
      var opts = el("div", { class: "rs-opts", role: "group", "aria-label": "Your options" });
      s.options.forEach(function (o) {
        opts.appendChild(el("button", { class: "wbtn ghost", type: "button", onclick: function () { choose(o, opts); } }, [o.label]));
      });
      h.appendChild(opts);
    } else {
      h.appendChild(el("p", { class: "ws" }, [s.hint || "Click the part of the document that answers it."]));
    }
    h.appendChild(el("div", { class: "wf", id: "rs-fb", role: "status", "aria-live": "polite" }));
    N.callout.focus && N.callout.focus();
    log("Question " + (i + 1) + " opened", s.q);
  }
  function choose(o, opts) {
    var s = CFG.chain[ST.i], fb = $("rs-fb");
    if (!fb || ST.stage !== "find") return;
    if (o.ok) {
      Array.prototype.forEach.call(opts.querySelectorAll("button"), function (b) { b.disabled = true; });
      fb.className = "wf good";
      announce(fb, "<b>" + o.label + "</b> \u2014 right. " + o.why);
      log("Question " + (ST.i + 1) + " decided", o.label);
      afterAnswer();
    } else {
      fb.className = "wf bad";
      announce(fb, "<b>" + o.label + "</b> \u2014 not this one: " + o.why);
      log("Question " + (ST.i + 1) + " miss", o.label);
    }
  }
  function answer(key, label) {
    if (ST.stage !== "find" || ST.i < 0) return false;
    var s = CFG.chain[ST.i];
    if (s.kind === "choice") return false;
    var fb = $("rs-fb"); if (!fb) return false;
    var hit = (s.targets || []).indexOf(key) !== -1;
    if (hit) {
      fb.className = "wf good";
      announce(fb, "<b>" + label + "</b> \u2014 right. " + (s.why || ""));
      var node = document.querySelector('[data-ans="' + key + '"]');
      if (node) node.classList.add("rs-hit");
      log("Question " + (ST.i + 1) + " answered", "found in: " + label);
      afterAnswer();
    } else {
      fb.className = "wf bad";
      var miss = (s.miss && s.miss[key]) ? s.miss[key] : "that part answers a different question.";
      announce(fb, "<b>" + label + "</b> \u2014 not this one: " + miss + " Hold the question and scan again.");
      log("Question " + (ST.i + 1) + " miss", "picked " + label);
    }
    return true;
  }
  function afterAnswer() {
    var s = CFG.chain[ST.i];
    ST.stage = "after";
    ST.answered.push({ q: s.q, meta: s.cite || "" });
    renderCallout();
    if (CFG.onAnswered) CFG.onAnswered(s, ST.i);
    var h = N.wkbody;
    var box = el("div", { class: "rs-found" }, [
      el("p", { class: "rs-fk" }, ["What you found, scoped to the question"]),
      el("div", { class: "rs-ft", html: s.found || "" }),
      s.cite ? el("p", { class: "rs-fc" }, ["Where: " + s.cite]) : null
    ]);
    h.appendChild(box);
    if (s.caveat) h.appendChild(el("p", { class: "rs-caveat", html: s.caveat }));
    /* student-initiated log draft */
    if (window.ResearchLog && ResearchLog.draft) {
      var lb = el("button", { class: "wbtn", type: "button", onclick: function () {
        var ok = ResearchLog.draft({
          question: s.q, type: s.logType || s.type.replace(/\s.*$/, ""),
          source: s.source || CFG.source || "", citation: s.cite || "",
          notes: s.logNotes || ""
        });
        if (ok) { log("Research Log draft opened", s.q); lb.disabled = true; lb.textContent = "Draft opened in your Research Log below"; }
      } }, ["Add to my Research Log"]);
      h.appendChild(el("p", { class: "ws rs-logwhy" }, ["Only you write \u201cWhat I found\u201d \u2014 the button fills in the question, type, source and citation and hands the rest to you."]));
      h.appendChild(lb);
    }
    /* stay or go */
    if (s.next) {
      var nx = s.next;
      h.appendChild(el("p", { class: "rs-nk" }, ["That answer produces your next question:"]));
      h.appendChild(el("p", { class: "wq" }, ["\u201c" + nx.q + "\u201d", " ", typeBadge(nx.type || "Focusing")]));
      h.appendChild(el("p", { class: "ws" }, ["Is it answered in this source, or do you need a different one?"]));
      var g = el("div", { class: "rs-opts", role: "group", "aria-label": "Stay or go" });
      var fb2 = el("div", { class: "wf", role: "status", "aria-live": "polite" });
      function pick(stay) {
        if (stay === !!nx.inSource) {
          Array.prototype.forEach.call(g.querySelectorAll("button"), function (b) { b.disabled = true; });
          fb2.className = "wf good";
          announce(fb2, (stay ? "Stay. " : "Go. ") + (nx.why || ""));
          log("Stay or go", (stay ? "stay" : "go") + " \u2014 " + nx.q);
          var b;
          if (nx.inSource && ST.i + 1 < CFG.chain.length) {
            b = el("button", { class: "wbtn", type: "button", onclick: function () { start(ST.i + 1); } }, ["Read for the next question"]);
          } else {
            ST.later.push({ q: nx.q, meta: nx.sourceHint || "different source" });
            renderCallout();
            if (ST.i + 1 < CFG.chain.length) {
              b = el("button", { class: "wbtn", type: "button", onclick: function () { start(ST.i + 1); } }, [nx.continueLabel || "Logged. Continue with what this source can still answer"]);
            } else {
              b = el("button", { class: "wbtn", type: "button", onclick: function () { finish(); } }, ["Close out this source"]);
            }
          }
          h.appendChild(b);
        } else {
          fb2.className = "wf bad";
          announce(fb2, stay ? (nx.whyNotStay || "Not here. Scan the headings once more: nothing in this source addresses it, and reading on hoping it will is the single-source trap.")
                             : (nx.whyNotGo || "Stay a moment longer. The source does address it \u2014 leaving now would send you searching for what is already in front of you."));
          log("Stay or go miss", stay ? "stayed" : "left");
        }
      }
      g.appendChild(el("button", { class: "wbtn ghost", type: "button", onclick: function () { pick(true); } }, ["It\u2019s here \u2014 keep reading this source"]));
      g.appendChild(el("button", { class: "wbtn ghost", type: "button", onclick: function () { pick(false); } }, ["Not here \u2014 log it for a different source"]));
      h.appendChild(g); h.appendChild(fb2);
    } else {
      h.appendChild(el("button", { class: "wbtn", type: "button", onclick: function () { finish(); } }, ["Close out this source"]));
    }
    if (typeof h.scrollTop === "number") h.scrollTop = h.scrollHeight;
  }
  function finish() {
    ST.stage = "done";
    log("Chain complete", ST.answered.length + " answered here; " + ST.later.length + " logged for other sources");
    var h = N.wkbody; h.innerHTML = "";
    h.appendChild(el("p", { class: "rs-fk" }, ["Closing out this source"]));
    h.appendChild(el("p", { class: "ws", html: CFG.closing || ("You came with one question and leave with " + ST.answered.length + " answered and " + ST.later.length + " logged for another source. That is one source, read once, for exactly what it could give you.") }));
    var b = el("button", { class: "wbtn", type: "button", onclick: function () { renderIdle(false); start(0); } }, ["Run the chain again"]);
    h.appendChild(b);
    ST.i = -1; renderCallout();
  }

  /* ----------------------------------------------------------------- init */
  function init(cfg) {
    CFG = cfg;
    if (window.ExportReflect && cfg.module) ExportReflect.collect({ module: cfg.module, chapter: cfg.chapter, session: cfg.session });
    N.sel = $("readmode"); N.note = $("modenote"); N.engage = $("engage"); N.engagewrap = $("engagewrap");
    N.callout = $("qcallout"); N.wk = $("wkpanel"); N.wkbody = $("wkbody");
    if (N.sel && !N.sel.options.length) {
      cfg.modes.forEach(function (m) { N.sel.appendChild(el("option", { value: m.value }, [m.label])); });
    }
    N.callout.setAttribute("tabindex", "-1");
    applyMode(N.sel.value || cfg.modes[0].value, false);
    N.sel.addEventListener("change", function () {
      applyMode(N.sel.value, true);
      log("Reading mode selected", N.sel.options[N.sel.selectedIndex].text);
    });
  }

  /* ----------------------------------------------------- node viewer help */
  /* A small navigable "database viewer": crumbs + body, nodes keyed by name,
     each with crumbs, kick, title, cite, hint, render(). Buttons inside a
     node carry data-go (navigate) or data-comp (explain) or data-ans (answer). */
  function viewer(opts) {
    var crumbs = $(opts.crumbsId), body = $(opts.bodyId), info = $(opts.infoId);
    var cur = null, hist = [];
    function showInfo(o) {
      if (!info || !o) return;
      var ps = o.p == null ? [] : (typeof o.p === "string" ? [o.p] : o.p);
      var html = '<p class="ik">' + (o.ik || "") + '</p><h2>' + (o.h || "") + '</h2>' +
        ps.map(function (x) { return "<p>" + x + "</p>"; }).join("");
      if (o.tie) html += '<p class="tie">' + o.tie + '</p>';
      if (o.warn) html += '<p class="warn">' + o.warn + '</p>';
      if (o.go) html += '<p><button class="goact" type="button" data-go="' + o.go.to + '">' + o.go.label + '</button></p>';
      info.innerHTML = html;
      info.focus();
    }
    function go(name, viaInfo) {
      var n = opts.nodes[name]; if (!n) return;
      if (cur && cur !== name) hist.push(cur);
      cur = name;
      crumbs.innerHTML = "";
      (n.crumbs || []).forEach(function (c, i) {
        if (i) crumbs.appendChild(el("span", { class: "sep", "aria-hidden": "true" }, ["\u203a"]));
        crumbs.appendChild(el("span", {}, [c]));
      });
      body.innerHTML = '<p class="vkick">' + (n.kick || "") + '</p><h2 class="vtitle">' + (n.title || "") + '</h2>' +
        (n.cite ? '<p class="vcite">' + n.cite + '</p>' : "") + n.render();
      if (n.hint) showInfo(n.hint);
      log("Opened", n.title);
      if (opts.onGo) opts.onGo(name);
      if (!viaInfo) body.focus && body.focus();
    }
    function handle(e) {
      var b = e.target.closest("button"); if (!b) return;
      /* An element that can answer the open question does that first, so a row
         that also navigates does not carry the reader away mid-question.
         Plain navigation buttons always navigate, because a student holding a
         question still has to move around the code to find the answer. */
      var key = b.dataset.ans;
      var label = b.dataset.label || (b.querySelector(".lab") ? b.querySelector(".lab").textContent : b.textContent.slice(0, 60));
      if (key && window.ReadSource.answer(key, label)) return;
      if (b.dataset.go) { go(b.dataset.go); return; }
      if (b.dataset.comp && opts.components[b.dataset.comp]) {
        showInfo(opts.components[b.dataset.comp]);
        log("Inspected", opts.components[b.dataset.comp].h);
      }
    }
    body.addEventListener("click", handle);
    if (info) info.addEventListener("click", function (e) { var b = e.target.closest("button[data-go]"); if (b) go(b.dataset.go, true); });
    return { go: go, current: function () { return cur; } };
  }

  window.ReadSource = { init: init, answer: answer, active: function () { return ST.stage === "find"; }, viewer: viewer,
                        mode: function () { return ST.mode; } };
})();
