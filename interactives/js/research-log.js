/* =============================================================================
   research-log.js — the textbook's Research Log as a mountable widget.

   One log, shared across every module that mounts it (a single localStorage
   key), exactly as the book instructs: "keep a Research Log for every drill,
   the same one you will keep in practice." Eight fields per entry, matching
   the book's template:

     Question · Type · Source · What I Found · How This Answers My Question ·
     Citation · Next Question · Notes

   Usage (classic script; load js/lib.js first):
     <script src="../../js/lib.js"></script>
     <script src="../../js/research-log.js"></script>
     <script>ResearchLog.mount({ parent: node, before: optionalSibling });</script>

   FERPA: entries live only in this browser's localStorage; the student can
   export the whole log as a formatted .txt and clear it at any time.
   ========================================================================== */
(function () {
  "use strict";
  var KEY = "qm_research_log_v1";
  var el = window.QM ? QM.el : null;
  if (!el) return; /* lib.js is required */

  var FIELDS = [
    ["question", "Question", "text", "The single question you are researching right now"],
    ["type", "Type", "select", ["Definitional", "Exploratory", "Focusing", "Application"]],
    ["source", "Source", "text", "What you consulted (e.g., state encyclopedia; annotated code)"],
    ["found", "What I Found", "textarea", "The answer, scoped to the question \u2014 no more"],
    ["answers", "How This Answers My Question", "textarea", "Fully, partially, or not \u2014 and why"],
    ["citation", "Citation", "text", "Where a reader could verify it"],
    ["next", "Next Question", "text", "The question this answer produces (deepen or go lateral)"],
    ["notes", "Notes", "text", "Anything else future-you needs"]
  ];

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var s = JSON.parse(raw); if (s && Array.isArray(s.entries)) return s; }
    } catch (e) {}
    return { v: 1, entries: [] };
  }
  function save(state) {
    state.saved = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function css() {
    if (document.getElementById("rlog-css")) return;
    var s = document.createElement("style");
    s.id = "rlog-css";
    s.textContent =
      ".rlog{max-width:860px;margin:34px auto 0;border:1.5px solid var(--rule-strong,#b6b6b6);border-radius:10px;background:var(--panel,#f6f6f4);}" +
      ".rlog>summary{list-style:none;cursor:pointer;padding:14px 18px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;}" +
      ".rlog>summary::-webkit-details-marker{display:none;}" +
      ".rlog>summary:focus-visible{outline:3px solid var(--flame,#c73e1d);outline-offset:2px;}" +
      ".rlog-title{font-weight:700;font-size:1rem;}" +
      ".rlog-count{font-family:var(--mono,monospace);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft,#54534d);}" +
      ".rlog-chev{margin-left:auto;color:var(--flame,#c73e1d);}" +
      ".rlog-body{padding:4px 18px 18px;}" +
      ".rlog-blurb{font-size:.88rem;color:var(--ink-soft,#54534d);line-height:1.55;margin:0 0 14px;}" +
      ".rlog-form{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;}" +
      "@media(max-width:700px){.rlog-form{grid-template-columns:1fr;}}" +
      ".rlog-field{display:flex;flex-direction:column;gap:3px;}" +
      ".rlog-field.wide{grid-column:1/-1;}" +
      ".rlog-field label{font-family:var(--mono,monospace);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft,#54534d);}" +
      ".rlog-field input,.rlog-field select,.rlog-field textarea{font:inherit;font-size:.9rem;padding:8px 10px;border:1px solid var(--rule-strong,#b6b6b6);border-radius:7px;background:#fff;color:var(--ink,#262622);}" +
      ".rlog-field :focus-visible{outline:3px solid var(--flame,#c73e1d);outline-offset:2px;}" +
      ".rlog-actions{grid-column:1/-1;display:flex;gap:10px;flex-wrap:wrap;align-items:center;}" +
      ".rlog-btn{font:inherit;font-size:.86rem;font-weight:600;background:#fff;border:1.5px solid var(--rule-strong,#b6b6b6);border-radius:8px;padding:8px 14px;cursor:pointer;color:var(--ink,#262622);}" +
      ".rlog-btn:hover{border-color:var(--flame,#c73e1d);}" +
      ".rlog-btn:focus-visible{outline:3px solid var(--flame,#c73e1d);outline-offset:2px;}" +
      ".rlog-btn.accent{border-color:var(--flame,#c73e1d);color:var(--flame,#c73e1d);}" +
      ".rlog-entries{margin:16px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;}" +
      ".rlog-entry{background:#fff;border:1px solid var(--rule,#cfcfcf);border-radius:8px;padding:12px 14px;}" +
      ".rlog-ehead{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;}" +
      ".rlog-eno{font-family:var(--mono,monospace);font-size:.7rem;color:var(--flame,#c73e1d);}" +
      ".rlog-eq{font-weight:600;font-size:.92rem;}" +
      ".rlog-etype{font-family:var(--mono,monospace);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft,#54534d);border:1px solid var(--rule-strong,#b6b6b6);border-radius:99px;padding:1px 8px;}" +
      ".rlog-edel{margin-left:auto;font:inherit;font-size:.72rem;background:none;border:0;color:var(--ink-soft,#54534d);cursor:pointer;text-decoration:underline;}" +
      ".rlog-edel:focus-visible{outline:3px solid var(--flame,#c73e1d);outline-offset:2px;}" +
      ".rlog-edl{display:grid;grid-template-columns:max-content 1fr;gap:2px 12px;margin:8px 0 0;font-size:.85rem;line-height:1.5;}" +
      ".rlog-edl dt{font-family:var(--mono,monospace);font-size:.64rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft,#54534d);padding-top:2px;}" +
      ".rlog-edl dd{margin:0;}" +
      ".rlog-note{font-size:.8rem;color:var(--ink-soft,#54534d);margin:12px 0 0;}";
    document.head.appendChild(s);
  }

  function fmt(state) {
    var bar = new Array(63).join("=");
    var L = [bar, "RESEARCH LOG", bar,
      "Exported: " + new Date().toLocaleString(),
      "Entries: " + state.entries.length, ""];
    state.entries.forEach(function (e, i) {
      L.push("ENTRY " + (i + 1) + (e.when ? "  (" + e.when + ")" : ""));
      L.push(new Array(43).join("-"));
      FIELDS.forEach(function (f) {
        var v = (e[f[0]] || "").trim();
        L.push(f[1] + ": " + (v || "\u2014"));
      });
      L.push("");
    });
    L.push("Generated locally in the student's browser \u2014 no data was sent anywhere.");
    return L.join("\n");
  }

  function mount(opts) {
    opts = opts || {};
    css();
    var state = load();
    var status = QM.live(el("span", { class: "rlog-count" }));

    /* ---- entry form ---- */
    var inputs = {};
    var form = el("div", { class: "rlog-form" });
    FIELDS.forEach(function (f) {
      var id = "rlog-" + f[0];
      var input;
      if (f[2] === "select") {
        input = el("select", { id: id }, []);
        input.appendChild(el("option", { value: "" }, ["\u2014 pick the type \u2014"]));
        f[3].forEach(function (o) { input.appendChild(el("option", { value: o }, [o])); });
      } else if (f[2] === "textarea") {
        input = el("textarea", { id: id, rows: "2", placeholder: f[3] });
      } else {
        input = el("input", { id: id, type: "text", placeholder: f[3] });
      }
      inputs[f[0]] = input;
      var wide = (f[2] === "textarea" || f[0] === "question");
      form.appendChild(el("div", { class: "rlog-field" + (wide ? " wide" : "") }, [
        el("label", { for: id }, [f[1]]), input
      ]));
    });

    var list = el("ul", { class: "rlog-entries" });
    function renderEntries() {
      list.innerHTML = "";
      state.entries.forEach(function (e, i) {
        var dl = el("dl", { class: "rlog-edl" });
        FIELDS.slice(2).forEach(function (f) {
          var v = (e[f[0]] || "").trim();
          if (!v) return;
          dl.appendChild(el("dt", {}, [f[1]]));
          dl.appendChild(el("dd", {}, [v]));
        });
        list.appendChild(el("li", { class: "rlog-entry" }, [
          el("div", { class: "rlog-ehead" }, [
            el("span", { class: "rlog-eno" }, ["#" + (i + 1)]),
            el("span", { class: "rlog-eq" }, [e.question || "(no question recorded)"]),
            e.type ? el("span", { class: "rlog-etype" }, [e.type]) : null,
            el("button", { class: "rlog-edel", type: "button", onclick: function () {
              if (!window.confirm("Delete entry #" + (i + 1) + "?")) return;
              state.entries.splice(i, 1); save(state); renderEntries(); updateCount("Entry deleted.");
            } }, ["delete"])
          ]),
          dl
        ]));
      });
    }
    function updateCount(msg) {
      var n = state.entries.length;
      countEl.textContent = n + (n === 1 ? " entry" : " entries");
      if (msg) QM.announce(status, msg);
    }

    function addEntry() {
      if (!inputs.question.value.trim()) {
        QM.announce(status, "Add the question first \u2014 the log runs on questions.");
        inputs.question.focus();
        return;
      }
      var e = { when: new Date().toLocaleDateString() };
      FIELDS.forEach(function (f) { e[f[0]] = inputs[f[0]].value; });
      state.entries.push(e);
      save(state);
      FIELDS.forEach(function (f) { inputs[f[0]].value = ""; });
      renderEntries();
      updateCount("Entry " + state.entries.length + " logged.");
      inputs.question.focus();
    }

    var actions = el("div", { class: "rlog-actions" }, [
      el("button", { class: "rlog-btn accent", type: "button", onclick: addEntry }, ["+ Log this entry"]),
      el("button", { class: "rlog-btn", type: "button", onclick: function () {
        if (!state.entries.length) { QM.announce(status, "Nothing to export yet."); return; }
        var blob = new Blob([fmt(state)], { type: "text/plain" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "research-log.txt";
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
        QM.announce(status, "Research log downloaded.");
      } }, ["\u2193 Download the log (.txt)"]),
      el("button", { class: "rlog-btn", type: "button", onclick: function () {
        if (!window.confirm("Clear the entire Research Log from this browser? Download it first if you need it.")) return;
        state = { v: 1, entries: [] }; save(state); renderEntries(); updateCount("Log cleared.");
      } }, ["Clear the log"]),
      status
    ]);

    var countEl = el("span", { class: "rlog-count" });
    var box = el("details", { class: "rlog" }, [
      el("summary", {}, [
        el("span", { class: "rlog-title" }, ["Research Log"]),
        countEl,
        el("span", { class: "rlog-chev", "aria-hidden": "true" }, ["\u25be"])
      ]),
      el("div", { class: "rlog-body" }, [
        el("p", { class: "rlog-blurb" }, [
          "The same log follows you between modules \u2014 one running record, exactly as in practice. " +
          "Eight fields per entry: the question, its type, the source, what you found (scoped to the question), " +
          "how it answers, the citation, the next question, and notes. Saved only in this browser; " +
          "download it any time."]),
        form, actions, list
      ])
    ]);

    var parent = opts.parent || document.body;
    if (opts.before) parent.insertBefore(box, opts.before);
    else parent.appendChild(box);
    renderEntries();
    updateCount();
    MOUNTED = { box: box, inputs: inputs, status: status };
    return box;
  }

  /* ---- student-initiated drafts ------------------------------------------
     A module may PREFILL an entry (question, type, source, citation, notes)
     but never the student's own fields: What I Found, How This Answers My
     Question, Next Question stay empty for them to write. Nothing is saved
     until the student presses "Log this entry". Returns false if no log is
     mounted on the page. */
  var MOUNTED = null;
  function draft(fields) {
    if (!MOUNTED) return false;
    fields = fields || {};
    var inp = MOUNTED.inputs;
    ["question", "type", "source", "citation", "notes"].forEach(function (k) {
      if (fields[k] != null) inp[k].value = fields[k];
    });
    ["found", "answers", "next"].forEach(function (k) { inp[k].value = ""; });
    MOUNTED.box.open = true;
    if (typeof MOUNTED.box.scrollIntoView === "function") {
      try { MOUNTED.box.scrollIntoView({ block: "start" }); } catch (e) { /* older engines */ }
    }
    QM.announce(MOUNTED.status, "Draft prefilled. Write what you found in your own words, scoped to the question, then log it.");
    window.setTimeout(function () { inp.found.focus(); }, 60);
    return true;
  }

  window.ResearchLog = { mount: mount, draft: draft, KEY: KEY };
})();
