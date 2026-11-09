(function () {
  var el = LP.el, app = document.getElementById("app");
  var C = window.COURTS;
  LP.mountChrome("courts");

  var level = "intro"; // in-memory only (FERPA-safe; resets on reload)

  app.appendChild(el("section", { class: "reveal" }, [
    el("p", { class: "eyebrow" }, [C.eyebrow]),
    el("h1", {}, [C.title]),
    el("p", { class: "lede measure" }, [C.intro])
  ]));

  /* ---- difficulty toggle (native radios styled as a segmented control) ---- */
  var modeBlurb = el("p", { class: "diff-blurb measure" });
  var live = el("p", { class: "sr-only", role: "status", "aria-live": "polite" });

  var seg = el("div", { class: "diff-seg" });
  ["intro", "advanced"].forEach(function (lv) {
    var id = "diff-" + lv;
    var input = el("input", {
      type: "radio", name: "difficulty", id: id, value: lv, class: "diff-input"
    });
    if (lv === level) input.setAttribute("checked", "checked");
    input.addEventListener("change", function () { setLevel(lv); });
    seg.appendChild(input);
    seg.appendChild(el("label", { class: "diff-opt", for: id }, [C.modes[lv].label]));
  });

  var toggle = el("fieldset", { class: "diff-toggle reveal d1" }, [
    el("legend", {}, ["Difficulty"]),
    seg,
    modeBlurb,
    live
  ]);
  app.appendChild(toggle);

  /* ---- reference + guidance callouts ---- */
  var calloutWrap = el("section", { class: "reveal d1 block" }, [
    el("p", { class: "callout measure" }, [el("b", {}, ["Bluebook: "]), C.bluebookNote]),
    el("p", { class: "callout warn measure" }, [el("b", {}, ["Watch out: "]), C.watchOut])
  ]);
  var reporterCallout = el("p", { class: "callout measure" }, [el("b", {}, ["Reporters: "]), C.reporterNote]);
  app.appendChild(calloutWrap);

  /* ---- drill ---- */
  app.appendChild(el("h2", { class: "reveal d2" }, ["Place the court"]));
  var wrap = el("div", { class: "reveal d2" });
  app.appendChild(wrap);

  function setLevel(lv) {
    level = lv;
    modeBlurb.textContent = C.modes[lv].blurb;
    // surface the reporter guidance only in advanced mode
    if (lv === "advanced") { if (!reporterCallout.parentNode) calloutWrap.appendChild(reporterCallout); }
    else if (reporterCallout.parentNode) calloutWrap.removeChild(reporterCallout);
    renderList();
    var shown = C.items.filter(function (it) { return lv === "advanced" || it.level !== "advanced"; }).length;
    live.textContent = C.modes[lv].label + " mode \u2014 " + shown + " courts" +
      (lv === "advanced" ? ", reporter required." : ".");
  }

  function renderList() {
    wrap.innerHTML = "";
    C.items
      .filter(function (it) { return level === "advanced" || it.level !== "advanced"; })
      .forEach(function (item) { wrap.appendChild(renderItem(item)); });
  }

  var LABELS = {
    above: "Court directly above (its decisions bind this court):",
    below: "Court directly below (this court binds it):",
    reporter: "Reporter \u2014 where its decisions are published:"
  };

  function blankRow(item, key) {
    var slot = item[key];
    if (!slot || !slot.ask) return null;
    var inputId = item.id + "-" + key;
    var input = el("input", {
      type: "text", id: inputId, class: "court-input", autocomplete: "off",
      autocapitalize: "off", spellcheck: "false",
      placeholder: key === "reporter" ? "Type the reporter, or \u2018none\u2019" : "Type the court\u2019s name, or \u2018none\u2019"
    });
    var res = el("p", { class: "court-result", role: "status", "aria-live": "polite" });
    return {
      key: key, slot: slot, input: input, res: res,
      node: el("div", { class: "court-blank" }, [
        el("label", { for: inputId }, [LABELS[key]]), input, res
      ])
    };
  }

  function renderItem(item) {
    var card = el("div", { class: "court-card", id: "court-" + item.id });
    var head = el("div", { class: "court-head" }, [
      el("span", { class: "court-sys" }, [item.system]),
      el("h3", { class: "court-name" }, [item.court])
    ]);
    if (item.level === "advanced") head.appendChild(el("span", { class: "court-badge" }, ["Advanced"]));
    card.appendChild(head);
    if (item.note) card.appendChild(el("p", { class: "court-note" }, [item.note]));

    var keys = level === "advanced" ? ["above", "below", "reporter"] : ["above", "below"];
    var blanks = [];
    keys.forEach(function (k) {
      var b = blankRow(item, k);
      if (b) { blanks.push(b); card.appendChild(b.node); }
    });

    var checkBtn = el("button", { class: "btn", type: "button" }, ["Check"]);
    var revealBtn = el("button", { class: "btn ghost", type: "button" }, ["Reveal answers"]);
    checkBtn.addEventListener("click", function () {
      blanks.forEach(function (b) { grade(b, false); });
      saveAnswers(item, blanks);
    });
    revealBtn.addEventListener("click", function () {
      blanks.forEach(function (b) { grade(b, true); });
      saveAnswers(item, blanks);
    });
    card.appendChild(el("div", { class: "court-actions" }, [checkBtn, revealBtn]));
    return card;
  }

  function saveAnswers(item, blanks) {
    try {
      var stored = JSON.parse(localStorage.getItem("rta_courts") || "[]");
      stored = stored.filter(function (e) { return e.courtId !== item.id; });
      blanks.forEach(function (b) {
        stored.push({
          courtId: item.id,
          courtName: item.court,
          key: b.key,
          value: b.input.value,
          canonical: b.slot.canonical
        });
      });
      localStorage.setItem("rta_courts", JSON.stringify(stored));
    } catch (e) { /* localStorage unavailable */ }
  }

  function grade(b, revealOnly) {
    var val = b.input.value;
    var noun = b.key === "reporter" ? "a reporter" : "a court name";
    b.res.className = "court-result show";
    b.res.innerHTML = "";
    if (!revealOnly && !val.trim()) {
      b.res.classList.add("pending");
      b.res.textContent = "Type " + noun + " (or \u2018none\u2019), then check.";
      return;
    }
    var ok = !revealOnly && LP.matchesAny(val, b.slot.accept);
    if (ok) {
      b.res.classList.add("ok");
      b.res.appendChild(el("b", {}, ["\u2713 Correct \u2014 " + b.slot.canonical + ". "]));
    } else if (revealOnly) {
      b.res.classList.add("revealed");
      b.res.appendChild(el("b", {}, ["Answer: " + b.slot.canonical + ". "]));
    } else {
      b.res.classList.add("no");
      b.res.appendChild(el("b", {}, ["Check your Bluebook \u2014 the canonical form is " + b.slot.canonical + ". "]));
    }
    b.res.appendChild(document.createTextNode(b.slot.why));
  }

  setLevel("intro");
})();
