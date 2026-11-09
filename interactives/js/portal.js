/* Firebrand home page — renders the chapter index from window.REGISTRY.
   Classic script (no modules, no fetch) so opening index.html locally works.
   Each chapter links to its static page (ch-N/), which lists that
   chapter's modules. */
(function () {
  "use strict";
  var R = window.REGISTRY || {};
  var app = document.getElementById("app");
  if (!app) return;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k]; if (v == null) return;
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else n.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  // status precedence for a chapter's summary badge (everything shipping is live;
  // dev/plan remain for any future work-in-progress)
  var STATUS = {
    live: { cls: "count", rank: 3 },
    dev:  { cls: "dev",  rank: 2, label: "In development" },
    plan: { cls: "plan", rank: 1, label: "Planned" }
  };

  function chapterStatus(mods) {
    var best = "plan";
    (mods || []).forEach(function (m) {
      if ((STATUS[m.status] || STATUS.plan).rank > STATUS[best].rank) best = m.status;
    });
    return best;
  }

  // footer tagline
  var ft = document.getElementById("foot-tag");
  if (ft && R.suite) ft.textContent = R.suite.tagline || "";

  /* ---- hero ---- */
  var s = R.suite || {};
  app.appendChild(el("section", { class: "hero reveal" }, [
    el("p", { class: "eyebrow" }, ["Interactive companion to the textbook"]),
    el("h1", {}, [s.title || "The Question Method of Legal Research"]),
    el("p", { class: "lede" }, [s.lede || ""])
  ]));

  /* ---- the method strip: five steps + a checkpoint ---- */
  var method = R.method;
  if (method && method.steps && method.steps.length) {
    var ol = el("ol", { class: "method-steps" });
    method.steps.forEach(function (m) {
      ol.appendChild(el("li", {}, [el("b", {}, [m.t]), m.d]));
    });
    var kids = [
      el("p", { class: "eyebrow" }, [method.eyebrow || "The Question Method, in brief"])
    ];
    if (method.intro) kids.push(el("p", { class: "method-intro" }, [method.intro]));
    kids.push(ol);
    if (method.checkpoint) {
      kids.push(el("p", { class: "method-checkpoint" }, [
        el("b", {}, [method.checkpoint.t + ". "]),
        method.checkpoint.d
      ]));
    }
    app.appendChild(el("section", { class: "method reveal d1", "aria-label": "The Question Method in brief" }, kids));
  }

  /* ---- spotlight: why it matters ---- */
  var sp = R.spotlight;
  if (sp && sp.items && sp.items.length) {
    var it = sp.items[0];
    app.appendChild(el("section", { class: "spotlight reveal d1" }, [
      el("p", { class: "spot-eyebrow" }, [sp.eyebrow || "Why It Matters"]),
      el("a", { class: "spot-card", href: it.href }, [
        el("div", { class: "spot-body" }, [
          el("h2", {}, [it.title]),
          el("p", {}, [it.desc || sp.intro || ""])
        ]),
        el("span", { class: "spot-go", "aria-hidden": "true" }, ["\u2192"])
      ])
    ]));
  }

  /* ---- parts + chapter index ---- */
  var parts = R.parts || [];
  var chapters = R.chapters || [];

  parts.forEach(function (part, pi) {
    var inPart = chapters.filter(function (c) { return c.part === part.id; });
    if (!inPart.length) return;

    var ledger = el("div", { class: "ledger" });
    inPart.forEach(function (c) {
      var mods = c.modules || [];
      var st = STATUS[chapterStatus(mods)] || STATUS.plan;
      var liveN = mods.filter(function (m) { return m.status === "live"; }).length;
      var isGuide = !!c.overview && !liveN;
      var countTxt = liveN + (liveN === 1 ? " module" : " modules");
      var pillTxt = isGuide ? "Guide" : (st.label || countTxt);

      var meta = el("div", { class: "ch-meta" }, [
        el("span", { class: "pill " + (isGuide ? "count" : st.cls) }, [pillTxt]),
        el("span", { class: "go", "aria-hidden": "true" }, ["\u2192"])
      ]);

      ledger.appendChild(el("a", {
        class: "entry" + ((liveN || isGuide) ? " is-live" : " is-plan"),
        href: "ch-" + c.ch + "/",
        "aria-label": "Chapter " + c.ch + " \u2014 " + c.title + " (" + pillTxt + ")"
      }, [
        el("div", { class: "ch-no", "aria-hidden": "true" }, [String(c.ch)]),
        el("div", { class: "ch-body" }, [
          el("p", { class: "ch-title" }, [c.title]),
          el("p", { class: "ch-desc" }, [c.desc || ""])
        ]),
        meta
      ]));
    });

    app.appendChild(el("section", { class: "part reveal d" + Math.min(pi + 2, 4) }, [
      el("div", { class: "part-head" }, [
        el("span", { class: "pnum" }, ["Part " + part.id]),
        el("h2", {}, [part.name]),
        el("span", { class: "pcount" }, [
          inPart.length + " chapters"
        ])
      ]),
      part.blurb ? el("p", { class: "part-blurb" }, [part.blurb]) : null,
      ledger
    ]));
  });

  /* ---- appendices & glossary ---- */
  var ap = R.appendices;
  if (ap && ap.items && ap.items.length) {
    var ledgerA = el("div", { class: "ledger" });
    ap.items.forEach(function (a) {
      ledgerA.appendChild(el("a", {
        class: "entry is-live",
        href: a.href,
        "aria-label": a.id + " \u2014 " + a.title
      }, [
        el("div", { class: "ch-no", "aria-hidden": "true" }, [String(a.id)]),
        el("div", { class: "ch-body" }, [
          el("p", { class: "ch-title" }, [a.title]),
          el("p", { class: "ch-desc" }, [a.also || ""])
        ]),
        el("div", { class: "ch-meta" }, [
          el("span", { class: "go", "aria-hidden": "true" }, ["\u2192"])
        ])
      ]));
    });
    app.appendChild(el("section", { class: "part reveal d4" }, [
      el("div", { class: "part-head" }, [
        el("span", { class: "pnum" }, ["Appendices"]),
        el("h2", {}, [ap.eyebrow || "Appendices & Glossary"])
      ]),
      ap.intro ? el("p", { class: "part-blurb" }, [ap.intro]) : null,
      ledgerA
    ]));
  }

  /* ---- toolkit & resources ---- */
  var tk = R.toolkit;
  if (tk && tk.items && tk.items.length) {
    var ledgerT = el("div", { class: "ledger" });
    tk.items.forEach(function (a) {
      ledgerT.appendChild(el("a", {
        class: "entry is-live",
        href: a.href,
        "aria-label": a.id + " \u2014 " + a.title
      }, [
        el("div", { class: "ch-no", "aria-hidden": "true" }, [String(a.id)]),
        el("div", { class: "ch-body" }, [
          el("p", { class: "ch-title" }, [a.title]),
          el("p", { class: "ch-desc" }, [a.also || ""])
        ]),
        el("div", { class: "ch-meta" }, [
          el("span", { class: "go", "aria-hidden": "true" }, ["\u2192"])
        ])
      ]));
    });
    app.appendChild(el("section", { class: "part reveal d4" }, [
      el("div", { class: "part-head" }, [
        el("span", { class: "pnum" }, ["Toolkit"]),
        el("h2", {}, [tk.eyebrow || "Toolkit & Resources"])
      ]),
      tk.intro ? el("p", { class: "part-blurb" }, [tk.intro]) : null,
      ledgerT
    ]));
  }
})();
