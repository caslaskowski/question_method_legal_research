(function () {
  var el = LP.el, P = window.PRACTICE, app = document.getElementById("app");
  LP.mountChrome("practice");

  /* hero */
  app.appendChild(el("section", { class: "hero reveal" }, [
    el("p", { class: "eyebrow" }, [P.eyebrow]),
    el("h1", {}, [P.title]),
    el("p", { class: "lede measure" }, [P.intro])
  ]));

  /* exercise nav cards */
  app.appendChild(el("h2", { class: "reveal d2", style: "margin:40px 0 16px" }, ["Exercises"]));
  var grid = el("div", { class: "card-grid reveal d3" });
  P.nav.forEach(function (n) {
    grid.appendChild(el("a", { class: "card", href: n.page }, [
      el("span", { class: "kicker" }, [n.kicker]),
      el("h3", {}, [n.label]),
      el("p", {}, [n.blurb]),
      el("span", { class: "arrow", "aria-hidden": "true" }, ["Open →"])
    ]));
  });
  app.appendChild(grid);

  /* submission download + reflection */
  var reflectionId = "rta-reflection";
  var reflection = el("textarea", {
    id: reflectionId, class: "reflection-input",
    placeholder: "What do you still find confusing or challenging? (optional — helps your instructor tailor feedback)"
  });
  reflection.setAttribute("rows", "5");

  app.appendChild(el("section", { class: "submit-callout reveal d4", style: "margin-top:40px" }, [
    el("h3", {}, ["Download Your Submission"]),
    el("p", {}, ["Download a record of your completed exercises to submit for credit. Your answers are collected automatically as you work through each page — come back here when you are done to generate the file."]),
    el("label", { for: reflectionId }, ["Reflection (optional)"]),
    reflection,
    el("div", { class: "submit-actions" }, [
      el("button", { class: "btn", type: "button",
        onclick: function () { downloadSubmission(reflection.value); }
      }, ["Download Submission (.txt)"])
    ])
  ]));

  function downloadSubmission(reflectionText) {
    var lines = [];
    var bar = "=".repeat(62);
    var sep = "-".repeat(42);

    lines.push(bar);
    lines.push("APPLYING THE HIERARCHY — MODULE SUBMISSION");
    lines.push(bar);
    lines.push("Date: " + new Date().toLocaleDateString());
    lines.push("");

    /* ---- drills ---- */
    lines.push("DRILLS");
    lines.push(sep);
    var drillDefs = [
      { key: "primary-secondary",  title: "Primary vs. Secondary" },
      { key: "binding-persuasive", title: "Binding vs. Persuasive" },
      { key: "statute-common",     title: "Statute vs. Common Law" }
    ];
    drillDefs.forEach(function (dd) {
      lines.push("");
      lines.push(dd.title);
      var D = (window.DRILLS || {})[dd.key];
      var stored = {};
      try { stored = JSON.parse(localStorage.getItem("rta_drill_" + dd.key) || "{}"); } catch (e) {}
      var answered = Object.keys(stored).length;
      var correct = 0;
      Object.keys(stored).forEach(function (k) { if (stored[k].isRight) correct++; });
      if (!answered) {
        lines.push("  [not completed]");
      } else {
        lines.push("  Score: " + correct + " / " + answered);
        if (D) {
          D.items.forEach(function (q) {
            var a = stored[q.id];
            if (!a) return;
            var opts = q.options || D.options;
            var chosenText = "", correctText = "";
            opts.forEach(function (o) {
              if (o.id === a.chosen) chosenText = o.text;
              if (o.id === a.correct) correctText = o.text;
            });
            var prompt = q.prompt.length > 80 ? q.prompt.substring(0, 77) + "..." : q.prompt;
            lines.push("  Q: " + prompt);
            lines.push("  A: " + (chosenText || a.chosen) + (a.isRight ? "  ✓" : "  ✗"));
            if (!a.isRight && correctText) lines.push("     Correct answer: " + correctText);
            lines.push("");
          });
        }
      }
    });

    /* ---- rank the stack ---- */
    lines.push("");
    lines.push("RANK THE STACK");
    lines.push(sep);
    var rankStored = {};
    try { rankStored = JSON.parse(localStorage.getItem("rta_rank") || "{}"); } catch (e) {}
    var R = window.RANK;
    if (R) {
      var tierLabel = {};
      R.tiers.forEach(function (t) { tierLabel[t.id] = t.label; });
      R.scenarios.forEach(function (sc) {
        lines.push("");
        lines.push("Scenario: " + sc.title);
        var data = rankStored[sc.id];
        if (!data || !data.length) {
          lines.push("  [not completed]");
        } else {
          data.forEach(function (a) {
            var chosen = a.chosen ? (tierLabel[a.chosen] || a.chosen) : "[not assigned]";
            var expected = tierLabel[a.correct] || a.correct;
            var label = a.label.length > 55 ? a.label.substring(0, 52) + "..." : a.label;
            var mark = a.chosen ? (a.isRight ? "  ✓" : "  ✗ (correct: " + expected + ")") : "";
            lines.push("  " + label);
            lines.push("    Tier: " + chosen + mark);
          });
        }
      });
    }

    /* ---- court up / court down ---- */
    lines.push("");
    lines.push("COURT UP / COURT DOWN");
    lines.push(sep);
    var courtsStored = [];
    try { courtsStored = JSON.parse(localStorage.getItem("rta_courts") || "[]"); } catch (e) {}
    if (!courtsStored.length) {
      lines.push("  [not completed]");
    } else {
      var byId = {}, idOrder = [], seenIds = {};
      courtsStored.forEach(function (e) {
        if (!byId[e.courtId]) { byId[e.courtId] = { name: e.courtName, entries: [] }; idOrder.push(e.courtId); }
        byId[e.courtId].entries.push(e);
      });
      idOrder = idOrder.filter(function (id) {
        if (seenIds[id]) return false; seenIds[id] = true; return true;
      });
      idOrder.forEach(function (id) {
        var court = byId[id];
        lines.push("");
        lines.push(court.name + ":");
        court.entries.forEach(function (e) {
          var lbl = e.key === "above" ? "Court above" : e.key === "below" ? "Court below" : "Reporter";
          lines.push("  " + lbl + ": " + (e.value.trim() || "[blank]"));
          lines.push("  Canonical: " + e.canonical);
        });
      });
    }

    /* ---- reflection ---- */
    lines.push("");
    lines.push("");
    lines.push("REFLECTION");
    lines.push(sep);
    lines.push("What I still find confusing or challenging:");
    lines.push("");
    lines.push(reflectionText.trim() || "[not provided]");
    lines.push("");

    var text = lines.join("\n");
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = LP.el("a", { href: url, download: "applying-the-hierarchy-submission.txt" });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }
})();
