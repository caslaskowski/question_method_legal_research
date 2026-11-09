(function () {
  var el = LP.el, app = document.getElementById("app");
  var R = window.RANK;
  LP.mountChrome("rank");

  var TIERS = R.tiers;
  var tierLabel = {}, tierBlurb = {}, tierIndex = {};
  TIERS.forEach(function (t, i) { tierLabel[t.id] = t.label; tierBlurb[t.id] = t.blurb; tierIndex[t.id] = i; });

  app.appendChild(el("section", { class: "reveal" }, [
    el("p", { class: "eyebrow" }, [R.eyebrow]),
    el("h1", {}, [R.title]),
    el("p", { class: "lede measure" }, [R.instructions])
  ]));

  /* tier legend */
  var legend = el("ol", { class: "tier-legend", "aria-label": "The tiers, highest binding effect first" });
  TIERS.forEach(function (t) {
    legend.appendChild(el("li", { class: "tier-legend-item tier-" + t.id }, [
      el("span", { class: "tl-name" }, [t.label]),
      el("span", { class: "tl-blurb" }, [t.blurb])
    ]));
  });
  app.appendChild(el("section", { class: "reveal d1 block" }, [
    el("p", { class: "eyebrow" }, ["The tiers"]), legend
  ]));

  /* scenario tabs */
  var tabWrap = el("div", { class: "scenario-tabs reveal d1", role: "tablist", "aria-label": "Scenarios" });
  var panels = el("div", { class: "reveal d2" });
  app.appendChild(tabWrap);
  app.appendChild(panels);

  var current = 0, tabs = [];
  R.scenarios.forEach(function (sc, i) {
    var tab = el("button", {
      class: "scenario-tab", type: "button", role: "tab",
      id: "tab-" + sc.id, "aria-controls": "panel-" + sc.id,
      "aria-selected": i === 0 ? "true" : "false", tabindex: i === 0 ? "0" : "-1"
    }, [sc.title]);
    tab.addEventListener("click", function () { selectTab(i); });
    tab.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        var n = (i + (e.key === "ArrowRight" ? 1 : R.scenarios.length - 1)) % R.scenarios.length;
        selectTab(n); tabs[n].focus();
      }
    });
    tabs.push(tab); tabWrap.appendChild(tab);
  });

  function selectTab(i) {
    current = i;
    tabs.forEach(function (t, j) {
      t.setAttribute("aria-selected", j === i ? "true" : "false");
      t.setAttribute("tabindex", j === i ? "0" : "-1");
    });
    renderScenario(R.scenarios[i]);
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function renderScenario(sc) {
    panels.innerHTML = "";
    var panel = el("section", { class: "scenario-panel", id: "panel-" + sc.id, role: "tabpanel", "aria-labelledby": "tab-" + sc.id });
    panel.appendChild(el("p", { class: "scenario-context measure" }, [sc.context]));

    var live = el("p", { class: "sr-only", role: "status", "aria-live": "polite" });
    panel.appendChild(live);

    var grid = el("div", { class: "rank-grid" });
    var assignWrap = el("div", { class: "assign-col" });
    var stackWrap = el("aside", { class: "stack-col", "aria-label": "Your ranking so far" });
    grid.appendChild(assignWrap);
    grid.appendChild(stackWrap);

    var state = {}; // authorityId -> chosen tier id
    var cardEls = {};

    shuffle(sc.authorities).forEach(function (a) {
      var fs = el("fieldset", { class: "assign-card", id: "auth-" + a.id });
      fs.appendChild(el("legend", {}, [a.label]));
      var chips = el("div", { class: "chips" });
      TIERS.forEach(function (t) {
        var inputId = sc.id + "-" + a.id + "-" + t.id;
        var input = el("input", { type: "radio", name: sc.id + "-" + a.id, id: inputId, value: t.id, class: "chip-input" });
        input.addEventListener("change", function () {
          state[a.id] = t.id;
          live.textContent = "Assigned \u2018" + a.label + "\u2019 to " + t.label + ".";
          paintStack();
        });
        chips.appendChild(input);
        chips.appendChild(el("label", { class: "chip tier-" + t.id, for: inputId }, [t.label]));
      });
      fs.appendChild(chips);
      var res = el("p", { class: "assign-result", role: "status", "aria-live": "polite" });
      fs.appendChild(res);
      assignWrap.appendChild(fs);
      cardEls[a.id] = { fs: fs, res: res };
    });

    function paintStack() {
      stackWrap.innerHTML = "";
      stackWrap.appendChild(el("h3", { class: "stack-title" }, ["Your ranking"]));
      var any = false;
      TIERS.forEach(function (t) {
        var inTier = sc.authorities.filter(function (a) { return state[a.id] === t.id; });
        if (!inTier.length) return;
        any = true;
        stackWrap.appendChild(el("div", { class: "stack-tier tier-" + t.id }, [
          el("span", { class: "stack-tier-name" }, [t.label]),
          el("ul", {}, inTier.map(function (a) { return el("li", {}, [a.label]); }))
        ]));
      });
      if (!any) stackWrap.appendChild(el("p", { class: "stack-empty" }, ["Assign a tier to each authority and it will stack up here."]));
    }
    paintStack();

    var checkBtn = el("button", { class: "btn", type: "button" }, ["Check ranking"]);
    var resetBtn = el("button", { class: "btn ghost", type: "button" }, ["Clear"]);
    var summary = el("div", { class: "rank-summary", role: "status", "aria-live": "polite" });

    checkBtn.addEventListener("click", function () {
      try {
        var all = JSON.parse(localStorage.getItem("rta_rank") || "{}");
        all[sc.id] = sc.authorities.map(function (a) {
          return { id: a.id, label: a.label, chosen: state[a.id] || null, correct: a.tier, isRight: state[a.id] === a.tier };
        });
        localStorage.setItem("rta_rank", JSON.stringify(all));
      } catch (e) { /* localStorage unavailable */ }
      var done = 0, right = 0;
      sc.authorities.forEach(function (a) {
        var c = cardEls[a.id];
        c.fs.classList.remove("ok", "no");
        c.res.className = "assign-result show";
        if (!state[a.id]) {
          c.res.textContent = "Not yet assigned \u2014 pick a tier.";
          c.res.className = "assign-result show pending";
          return;
        }
        done++;
        if (state[a.id] === a.tier) {
          right++;
          c.fs.classList.add("ok");
          c.res.innerHTML = "";
          c.res.appendChild(el("b", {}, ["\u2713 " + tierLabel[a.tier] + ". "]));
          c.res.appendChild(document.createTextNode(a.why));
        } else {
          c.fs.classList.add("no");
          c.res.innerHTML = "";
          c.res.appendChild(el("b", {}, ["You placed this in " + tierLabel[state[a.id]] + "; it belongs in " + tierLabel[a.tier] + ". "]));
          c.res.appendChild(document.createTextNode(a.why));
        }
      });
      summary.className = "rank-summary show";
      summary.innerHTML = "";
      summary.appendChild(el("p", { class: "rs-score" }, [right + " of " + sc.authorities.length + " placed in the right tier."]));
      if (done < sc.authorities.length) summary.appendChild(el("p", {}, ["Assign every authority, then check again for the full picture."]));
      if (sc.tiePairs && sc.tiePairs.length) {
        var names = sc.tiePairs.map(function (pair) {
          return pair.map(function (id) { return sc.authorities.filter(function (a) { return a.id === id; })[0].label; }).join(" and ");
        });
        summary.appendChild(el("p", { class: "rs-tie" }, [
          el("b", {}, ["A deliberate tie: "]),
          names.join("; ") + " sit in the same tier. Within a tier, order does not matter \u2014 you cannot rank a controlling statute beneath the high-court decision reading it, or vice versa. Both control."
        ]));
      }
      summary.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    resetBtn.addEventListener("click", function () {
      state = {};
      Object.keys(cardEls).forEach(function (id) {
        var c = cardEls[id];
        c.fs.classList.remove("ok", "no");
        c.res.className = "assign-result";
        c.res.textContent = "";
        c.fs.querySelectorAll("input").forEach(function (inp) { inp.checked = false; });
      });
      summary.className = "rank-summary"; summary.innerHTML = "";
      live.textContent = "Cleared.";
      paintStack();
    });

    panel.appendChild(grid);
    panel.appendChild(el("div", { class: "rank-actions" }, [checkBtn, resetBtn]));
    panel.appendChild(summary);
    panels.appendChild(panel);
  }

  selectTab(0);
})();
