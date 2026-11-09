/* =============================================================================
   export-reflect.js  —  shared "prove engagement" component
   One source of truth for every module's submission export.

   FERPA model: everything happens in the browser. The student fills in a
   reflection, the script assembles a plain-text (.txt) record of the decisions
   they made plus their reflection, and triggers a local download. NOTHING is
   transmitted or stored on a server. The student submits the downloaded file
   themselves through the professor's normal channel (LMS upload, email).

   Usage (classic script — no modules):
     <script src="../../js/export-reflect.js"></script>
     ExportReflect.mount(document.getElementById("export-slot"), {
       module:  "Database Interface Explorer",
       chapter: "Chapter 2 — Introduction to Legal Research Platforms",
       intro:   "optional sentence shown above the reflection",
       prompts: [
         "What is one feature you had not noticed on a database before?",
         "On a database you have never used, how will you find that feature?"
       ]
     });

   Anywhere a real choice/decision is made, log it:
     ExportReflect.log("Chose entry point", "Practice area for employment law");

   The export is built from that running log + the reflection answers.
   ========================================================================== */
(function () {
  "use strict";

  var state = {
    module: "",
    chapter: "",
    prompts: [],
    log: [],
    started: new Date()
  };

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function stamp(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
      " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function log(label, detail) {
    state.log.push({ at: new Date(), label: String(label), detail: detail == null ? "" : String(detail) });
    persist();
  }

  /* ---- multi-page modules: one record across pages, for this session ---- */
  var sessionKey = null;
  function persist() {
    if (!sessionKey) return;
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify({
        started: state.started.toISOString(),
        log: state.log.map(function (e) {
          return { at: (e.at instanceof Date ? e.at.toISOString() : e.at), label: e.label, detail: e.detail };
        })
      }));
    } catch (e) {}
  }
  function hydrate(key) {
    sessionKey = key;
    try {
      var raw = sessionStorage.getItem(key);
      if (!raw) return;
      var d = JSON.parse(raw);
      if (d && Array.isArray(d.log)) {
        state.log = d.log.map(function (e) {
          return { at: new Date(e.at), label: e.label, detail: e.detail };
        });
        if (d.started) state.started = new Date(d.started);
      }
    } catch (e) {}
  }
  /* pages that only contribute to the record call collect(); the page with
     the download UI calls mount() with the same session key. */
  function collect(opts) {
    if (opts && opts.session) hydrate(opts.session);
    if (opts && opts.module) state.module = opts.module;
    if (opts && opts.chapter) state.chapter = opts.chapter;
  }

  function buildText(name, answers) {
    var L = [];
    var rule = "======================================================================";
    L.push(rule);
    L.push("THE QUESTION METHOD OF LEGAL RESEARCH — MODULE SUBMISSION");
    L.push(rule);
    L.push("Module:   " + state.module);
    L.push("Chapter:  " + state.chapter);
    L.push("Student:  " + (name && name.trim() ? name.trim() : "(name not entered)"));
    L.push("Started:  " + stamp(state.started));
    L.push("Exported: " + stamp(new Date()));
    L.push("");
    L.push("This file was generated entirely in the student's browser and was not");
    L.push("transmitted or stored anywhere. It is submitted by the student.");
    L.push("");
    L.push("----------------------------------------------------------------------");
    L.push("WHAT I DID  (decisions and interactions, in order)");
    L.push("----------------------------------------------------------------------");
    if (!state.log.length) {
      L.push("(no recorded interactions for this module)");
    } else {
      state.log.forEach(function (e, i) {
        var line = (i + 1) + ". [" + stamp(e.at) + "] " + e.label;
        if (e.detail) line += " — " + e.detail;
        L.push(line);
      });
    }
    L.push("");
    L.push("----------------------------------------------------------------------");
    L.push("MY REFLECTION");
    L.push("----------------------------------------------------------------------");
    state.prompts.forEach(function (p, i) {
      L.push("Q" + (i + 1) + ". " + p);
      var a = (answers[i] || "").trim();
      L.push(a ? a : "(left blank)");
      L.push("");
    });
    L.push(rule);
    L.push("End of submission.");
    return L.join("\n");
  }

  function download(name, answers) {
    var text = buildText(name, answers);
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var slug = state.module.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    var who = (name && name.trim() ? name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") : "submission");
    var a = document.createElement("a");
    a.href = url;
    a.download = who + "_" + slug + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  }

  function injectCSS() {
    if (document.getElementById("er-css")) return;
    var css =
      ".er{margin-top:14px;border:1px solid var(--rule-strong,#b6b6b6);border-radius:var(--radius,4px);" +
      "background:var(--panel,#f6f6f4);padding:22px 24px;box-shadow:var(--shadow,0 6px 22px rgba(20,20,18,.07));}" +
      ".er-eyebrow{font-family:var(--sans,sans-serif);text-transform:uppercase;letter-spacing:.14em;" +
      "font-size:.7rem;font-weight:700;color:var(--flame,#135169);margin:0 0 .5rem;}" +
      ".er h2{margin:0 0 .4em;}" +
      ".er-intro{color:var(--ink-soft,#54534d);font-size:.95rem;margin:0 0 1rem;}" +
      ".er-field{margin:0 0 14px;}" +
      ".er-field label{display:block;font-weight:600;font-size:.92rem;margin:0 0 5px;color:var(--ink,#262622);}" +
      ".er-input{width:100%;font:inherit;font-size:.95rem;padding:9px 11px;border:1.5px solid var(--rule-strong,#b6b6b6);" +
      "border-radius:var(--radius,4px);background:#fff;color:var(--ink,#262622);}" +
      ".er-input:focus-visible{outline:3px solid var(--flame,#135169);outline-offset:1px;border-color:var(--flame,#135169);}" +
      ".er-area{resize:vertical;min-height:64px;line-height:1.5;}" +
      ".er-btn{margin-top:4px;}" +
      ".er-status{margin:10px 0 0;font-size:.9rem;color:var(--regulation,#2f6d56);font-weight:600;min-height:1.2em;}";
    var s = document.createElement("style");
    s.id = "er-css";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function mount(node, cfg) {
    if (cfg && cfg.session) hydrate(cfg.session);
    if (!node) return;
    injectCSS();
    state.module = cfg.module || "Module";
    state.chapter = cfg.chapter || "";
    state.prompts = cfg.prompts || [];

    node.innerHTML = "";
    var sec = el("section", { class: "er", "aria-labelledby": "er-h" });

    sec.appendChild(el("p", { class: "er-eyebrow" }, "Submit your work"));
    sec.appendChild(el("h2", { id: "er-h" }, "Reflect &amp; export"));
    sec.appendChild(el("p", { class: "er-intro" },
      (cfg.intro ? cfg.intro + " " : "") +
      "This builds a plain-text file in your browser only \u2014 nothing is sent or saved online. " +
      "Download it and submit it the way your professor asks."));

    // name
    var nameWrap = el("div", { class: "er-field" });
    var nameId = "er-name";
    nameWrap.appendChild(el("label", { for: nameId }, "Your name (optional, stays on your device until you submit)"));
    var nameInput = el("input", { id: nameId, type: "text", autocomplete: "name", class: "er-input" });
    nameWrap.appendChild(nameInput);
    sec.appendChild(nameWrap);

    // prompts
    var areas = [];
    state.prompts.forEach(function (p, i) {
      var id = "er-r" + i;
      var w = el("div", { class: "er-field" });
      w.appendChild(el("label", { for: id }, p));
      var ta = el("textarea", { id: id, rows: "3", class: "er-input er-area" });
      w.appendChild(ta);
      sec.appendChild(w);
      areas.push(ta);
    });

    var btn = el("button", { type: "button", class: "btn er-btn" }, "Download my submission (.txt)");
    sec.appendChild(btn);
    var live = el("p", { class: "er-status", role: "status", "aria-live": "polite" }, "");
    sec.appendChild(live);

    btn.addEventListener("click", function () {
      log("Exported submission", "");
      download(nameInput.value, areas.map(function (a) { return a.value; }));
      live.textContent = "Your file downloaded. Check your downloads folder, then submit it to your professor.";
    });

    node.appendChild(sec);
  }

  window.ExportReflect = { mount: mount, log: log, collect: collect };
})();
