/* Shared helpers for every page of the Hierarchy of Authorities module.
   Classic script (no modules) so the site runs by simply opening index.html
   — no local server and no network beyond web fonts. All state stays in the
   browser; nothing is transmitted (FERPA-safe by construction). */
(function () {
  "use strict";

  /* ---- tiny DOM helper ---- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null) return;
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k === "text") node.textContent = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function getParam(name) {
    var m = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  /* forgiving comparison for short free-text answers (court & reporter names) */
  function normalize(s) {
    return String(s == null ? "" : s)
      .toLowerCase()
      .replace(/[.,;:'"\u2018\u2019\u201c\u201d]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^the\s+/, "")
      .replace(/\s+/g, "");   /* drop remaining spaces: "F. 3d" = "F.3d" = "f3d" */
  }
  function matchesAny(input, accepted) {
    var n = normalize(input);
    if (!n) return false;
    return (accepted || []).some(function (a) { return normalize(a) === n; });
  }

  /* ---- accessible dropdown menu ---- */
  var openMenus = [];
  function navItem(id) {
    return (window.NAV || []).filter(function (n) { return n.id === id; })[0];
  }
  function buildDropdown(label, itemIds, activeId, extraClass) {
    var inSection = itemIds.indexOf(activeId) !== -1;
    var listId = "menu-" + label.toLowerCase().replace(/\s+/g, "-");
    var btn = el("button", {
      class: "menu-btn" + (inSection ? " in-section" : ""), type: "button",
      "aria-haspopup": "true", "aria-expanded": "false", "aria-controls": listId
    }, [label, el("span", { class: "caret", "aria-hidden": "true" }, ["\u25be"])]);

    var ul = el("ul", { class: "menu-list", id: listId, role: "menu" });
    itemIds.forEach(function (id) {
      var item = navItem(id);
      if (!item) return;
      var a = el("a", {
        role: "menuitem", href: item.page,
        "aria-current": id === activeId ? "page" : null
      }, [item.label]);
      ul.appendChild(el("li", { role: "none" }, [a]));
    });

    function close() { btn.setAttribute("aria-expanded", "false"); ul.classList.remove("open"); }
    function open() { closeAll(); btn.setAttribute("aria-expanded", "true"); ul.classList.add("open"); }
    function toggle() { (btn.getAttribute("aria-expanded") === "true") ? close() : open(); }

    btn.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); open(); var first = ul.querySelector("a"); if (first) first.focus(); }
      else if (e.key === "Escape") { close(); }
    });
    ul.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { close(); btn.focus(); }
    });
    openMenus.push({ close: close });
    return el("div", { class: "menu" + (extraClass ? " " + extraClass : "") }, [btn, ul]);
  }
  function closeAll() { openMenus.forEach(function (m) { m.close(); }); }

  /* ---- masthead + nav ---- */
  function navlink(id, activeId, extraClass) {
    var item = navItem(id);
    if (!item) return null;
    return el("a", {
      class: "navlink" + (extraClass ? " " + extraClass : ""), href: item.page,
      "aria-current": id === activeId ? "page" : null
    }, [item.label]);
  }
  function buildHeader(activeId) {
    var practiceIds = ["practice", "primary-secondary", "binding-persuasive", "statute-common", "rank", "courts"];
    var isPractice = practiceIds.indexOf(activeId) !== -1;

    var links = [
      el("a", { class: "navlink", href: "../../index.html" }, ["Home"]),
      el("a", { class: "navlink", href: "../../ch-1/" }, ["Ch.\u00a01"])
    ];

    links.push(el("a", {
      class: "navlink navlink-title", href: "index.html",
      "aria-current": activeId === "home" ? "page" : null
    }, ["Hierarchy of Authorities"]));
    links.push(buildDropdown("Module pages",
      ["hierarchy", "practice", "primary-secondary", "binding-persuasive", "statute-common", "rank", "courts"],
      activeId, "nav-sub"));
    var lrMenu = buildDropdown("Learning resources", ["quiz"], activeId, "nav-sub");
    (function () {
      var ul = lrMenu.querySelector(".menu-list");
      var nb = el("a", { role: "menuitem", href: "#", onclick: function (e) { e.preventDefault(); downloadCompanion(); } },
                  ["\u2193 Companion Notes"]);
      ul.appendChild(el("li", { role: "none" }, [nb]));
    })();
    links.push(lrMenu);

    var topnav = el("nav", { class: "topnav", "aria-label": "Primary" }, links.filter(Boolean));
    var bmSrc = document.getElementById("browse-menu-src");
    if (bmSrc && bmSrc.firstElementChild) {
      topnav.appendChild(bmSrc.firstElementChild);
      bmSrc.remove();
    }

    var navArea = el("div", { class: "nav-area", id: "primary-nav" }, [topnav]);

    var toggle = el("button", {
      class: "nav-toggle", type: "button", "aria-expanded": "false",
      "aria-controls": "primary-nav", "aria-label": "Open menu"
    }, ["\u2630"]);
    toggle.addEventListener("click", function () {
      var open = navArea.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    document.addEventListener("click", function (e) { if (!e.target.closest(".menu")) closeAll(); });

    return el("header", { class: "masthead" }, [
      el("div", { class: "wrap" }, [
        el("div", { class: "masthead-inner" }, [
          el("a", { class: "brand", href: "../../index.html" }, [
            el("span", { class: "mark" }, ["The Question Method of Legal Research"]),
            el("span", { class: "sub" }, ["Interactive Legal Research Modules"])
          ]),
          toggle,
          navArea
        ])
      ])
    ]);
  }

  function buildFooter() {
    return el("footer", { class: "foot" }, [
      el("p", { class: "foot-contact" }, [
        "Found a problem, or wish a module existed? ",
        el("a", { href: "https://github.com/caslaskowski/legal_research_interactive/issues", target: "_blank", rel: "noopener" },
          ["Report an issue or suggest a feature"]),
        " (opens GitHub in a new tab \u2014 nothing is sent from this site)."
      ]),

      el("span", {}, ["Hierarchy of Authorities \u2014 an interactive skill-builder for the Question Method of Legal Research."]),
      el("span", {}, ["Primary over secondary \u00b7 binding over persuasive \u00b7 higher court over lower"])
    ]);
  }

  function mountChrome(activeId) {
    document.body.classList.add("shell");
    var main = document.querySelector("main");
    if (main && !main.id) main.id = "main";
    var skip = el("a", { class: "skip", href: "#main" }, ["Skip to content"]);
    document.body.insertBefore(skip, document.body.firstChild);
    document.body.insertBefore(buildHeader(activeId), main);
    document.body.appendChild(buildFooter());
    /* FERPA disclosure: these pages persist answers in this browser only */
    var storing = ["practice", "primary-secondary", "binding-persuasive",
                   "statute-common", "rank", "courts"];
    if (window.QM && storing.indexOf(activeId) !== -1) {
      QM.storageNotice({ prefix: "rta_", parent: main });
    }
  }

  /* ---- companion notes -> downloadable .txt (generated locally) ---- */
  function wrap(text, width) {
    var words = String(text).split(/\s+/), out = [], line = "";
    words.forEach(function (w) {
      if ((line + " " + w).trim().length > width) { if (line) out.push(line); line = w; }
      else line = (line ? line + " " : "") + w;
    });
    if (line) out.push(line);
    return out;
  }
  function buildCompanionText() {
    var C = window.COMPANION, W = 52, lines = [], bar = "=".repeat(60);
    lines.push(bar); lines.push(C.title.toUpperCase()); lines.push(bar); lines.push("");
    wrap(C.intro, 64).forEach(function (l) { lines.push(l); });
    lines.push("");
    C.sections.forEach(function (sec) {
      lines.push(""); lines.push(sec.heading); lines.push("-".repeat(sec.heading.length));
      sec.fields.forEach(function (f) {
        lines.push("  " + f.label + ":");
        lines.push("    " + "_".repeat(W));
        lines.push("    " + "_".repeat(W));
        lines.push("");
      });
    });
    lines.push(""); lines.push(C.footer); lines.push("");
    return lines.join("\n");
  }
  function downloadCompanion() {
    var blob = new Blob([buildCompanionText()], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = el("a", { href: url, download: "rank-the-authorities-companion-notes.txt" });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  window.LP = {
    el: el, getParam: getParam, normalize: normalize, matchesAny: matchesAny,
    mountChrome: mountChrome, downloadCompanion: downloadCompanion
  };
})();
