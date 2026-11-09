(function () {
  var el = LP.el, H = window.HOME, app = document.getElementById("app");
  LP.mountChrome("home");

  /* hero */
  app.appendChild(el("section", { class: "hero reveal" }, [
    el("p", { class: "eyebrow" }, [H.eyebrow]),
    el("h1", {}, [H.title]),
    el("p", { class: "lede measure" }, [H.intro])
  ]));

  /* how this relates to the Question Method */
  app.appendChild(el("section", { class: "method-note reveal d1" }, [
    el("p", { class: "eyebrow" }, [H.method.eyebrow]),
    el("p", {}, [H.method.body])
  ]));

  app.appendChild(el("p", { class: "reveal d1", style: "margin:18px 0 6px" }, [
    el("a", { class: "start-cta", href: "hierarchy.html" }, ["Start the module \u2192"])
  ]));

  /* at a glance */
  var g = H.atAGlance;
  var thead = el("thead", {}, [el("tr", {}, g.columns.map(function (c) { return el("th", { scope: "col" }, [c]); }))]);
  var tbody = el("tbody");
  g.rows.forEach(function (r) {
    var tr = el("tr");
    r.forEach(function (cell, idx) {
      tr.appendChild(idx === 0 ? el("th", { scope: "row" }, [cell]) : el("td", {}, [cell]));
    });
    tbody.appendChild(tr);
  });
  app.appendChild(el("section", { class: "reveal d2", style: "margin-top:40px" }, [
    el("p", { class: "eyebrow" }, ["At a glance"]),
    el("div", { class: "table-wrap" }, [
      el("table", { class: "glance" }, [
        el("caption", { class: "sr-only" }, [g.caption]),
        thead, tbody
      ])
    ])
  ]));

  /* companion notes */
  app.appendChild(el("section", { class: "reveal d3", style: "margin-top:32px" }, [
    el("div", { class: "notes-callout" }, [
      el("div", { class: "txt" }, [
        el("h3", {}, [H.companion.title]),
        el("p", {}, [H.companion.description])
      ]),
      el("button", { class: "btn", type: "button", onclick: LP.downloadCompanion }, [H.companion.buttonText])
    ])
  ]));

  /* navigation cards */
  var navSection = el("section", { class: "reveal d4", style: "margin-top:42px" });
  navSection.appendChild(el("p", { class: "eyebrow" }, ["In this module"]));
  H.nav.forEach(function (item) {
    navSection.appendChild(el("div", { class: "notes-callout", style: "background:var(--paper-2);margin-top:16px" }, [
      el("div", { class: "txt" }, [
        el("p", { class: "eyebrow", style: "margin-bottom:6px" }, [item.kicker]),
        el("h3", {}, [item.label]),
        el("p", {}, [item.blurb])
      ]),
      el("a", { class: "btn", href: item.page }, [item.kicker === "Assessment" ? "Open check →" : "Begin exploring →"])
    ]));
  });
  app.appendChild(navSection);
})();
