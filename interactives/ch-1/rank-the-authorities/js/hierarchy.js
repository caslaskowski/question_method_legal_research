(function () {
  var el = LP.el, app = document.getElementById("app");
  var D = window.HIERARCHY;
  LP.mountChrome("hierarchy");

  /* intro */
  app.appendChild(el("section", { class: "reveal" }, [
    el("p", { class: "eyebrow" }, ["Orient"]),
    el("h1", {}, ["The Hierarchy"]),
    el("p", { class: "lede measure" }, [D.intro])
  ]));

  /* ---- the authority ladder (interactive) ---- */
  var P = D.pyramid;
  var ladderSection = el("section", { class: "reveal d1 block" }, [
    el("p", { class: "eyebrow" }, [P.eyebrow]),
    el("h2", {}, ["Higher law controls lower law"]),
    el("p", { class: "measure" }, [P.lede])
  ]);
  var ladder = el("ol", { class: "ladder", "aria-label": "Hierarchy of authority, highest first" });
  P.levels.forEach(function (lv, i) {
    var detailId = "rung-" + i;
    var btn = el("button", {
      class: "rung tier-" + lv.tier, type: "button",
      "aria-expanded": "false", "aria-controls": detailId
    }, [
      el("span", { class: "rung-rank", "aria-hidden": "true" }, [String(i + 1)]),
      el("span", { class: "rung-label" }, [lv.label]),
      el("span", { class: "rung-tier" }, [lv.tier]),
      el("span", { class: "rung-caret", "aria-hidden": "true" }, ["\u25be"])
    ]);
    var detail = el("div", { class: "rung-detail", id: detailId, hidden: "hidden" }, [el("p", {}, [lv.note])]);
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      if (open) {
        detail.classList.remove("open");
        detail.setAttribute("hidden", "hidden");
      } else {
        detail.removeAttribute("hidden");
        detail.classList.add("open");
      }
    });
    ladder.appendChild(el("li", {}, [btn, detail]));
  });
  ladderSection.appendChild(ladder);
  ladderSection.appendChild(el("p", { class: "callout measure" }, [P.note]));
  app.appendChild(ladderSection);

  /* ---- primary vs secondary ---- */
  var PS = D.primarySecondary;
  app.appendChild(el("section", { class: "reveal d2 block" }, [
    el("p", { class: "eyebrow" }, [PS.eyebrow]),
    el("h2", {}, ["The law itself, and the map to it"]),
    el("p", { class: "measure" }, [PS.body]),
    el("p", { class: "callout measure" }, [PS.callout])
  ]));

  /* ---- binding vs persuasive: forum explorers ---- */
  (D.forumExplorers || []).forEach(function (F, fi) {
    var section = el("section", { class: "reveal d3 block" }, [
      el("p", { class: "eyebrow" }, [F.eyebrow]),
      el("h2", {}, [F.heading]),
      el("p", { class: "measure" }, [F.lede])
    ]);

    var selectId = "forum-select-" + fi;
    var select = el("select", { id: selectId, class: "forum-select" },
      F.forums.map(function (fm) { return el("option", { value: fm.id }, [fm.label]); }));
    section.appendChild(el("div", { class: "forum-picker" }, [
      el("label", { for: selectId }, ["Deciding court:"]),
      select
    ]));

    var live = el("p", { class: "sr-only", role: "status", "aria-live": "polite" });
    section.appendChild(live);

    var rows = [];
    var list = el("ul", { class: "weigh-list", "aria-label": "Authorities and their weight before the selected court" });
    F.authorities.forEach(function (a) {
      var badge = el("span", { class: "weigh-badge" });
      var why = el("p", { class: "weigh-why" });
      list.appendChild(el("li", { class: "weigh-row" }, [
        el("div", { class: "weigh-main" }, [el("span", { class: "weigh-label" }, [a.label]), badge]),
        why
      ]));
      rows.push({ a: a, badge: badge, why: why });
    });
    section.appendChild(list);
    app.appendChild(section);

    (function (F, select, rows, live) {
      function paint(forumId) {
        var fname = F.forums.filter(function (x) { return x.id === forumId; })[0].label;
        rows.forEach(function (r) {
          var w = r.a.weight[forumId];
          r.badge.className = "weigh-badge " + w;
          r.badge.textContent = w === "binding" ? "Binding" : "Persuasive";
          r.badge.setAttribute("aria-label", (w === "binding" ? "Binding" : "Persuasive") + " before this court");
          r.why.textContent = r.a.why[forumId];
        });
        live.textContent = "Showing how each authority weighs before the " + fname + ".";
      }
      select.addEventListener("change", function () { paint(select.value); });
      paint(F.forums[0].id);
    }(F, select, rows, live));
  });
})();
