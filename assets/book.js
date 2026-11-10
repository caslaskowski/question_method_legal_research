/* Page behaviour for the book: (1) size embedded interactives to their content,
   (2) remember the show/hide draft-flags choice, (3) highlight the current section in "On this page".
   Everything degrades gracefully: with scripts off, iframes keep the height set in the HTML. */
(function () {
  "use strict";

  /* 1. iframe auto-height (works when served over http(s); on file:// the browser blocks
        reading the frame, so the fixed height in the markup stays). */
  function fit(frame) {
    try {
      var doc = frame.contentDocument;
      if (!doc || !doc.documentElement) return;
      var min = parseInt(frame.getAttribute("data-minheight") || "480", 10);
      var h = Math.max(doc.documentElement.scrollHeight, doc.body ? doc.body.scrollHeight : 0, min);
      h = Math.min(h, 1000);   // long modules scroll inside the frame instead of stretching the chapter
      frame.style.height = h + "px";
    } catch (e) { /* cross-origin or file:// -- keep the fixed height */ }
  }
  function watch(frame) {
    function go() {
      fit(frame);
      try {
        var doc = frame.contentDocument;
        if (window.ResizeObserver && doc && doc.body) {
          new ResizeObserver(function () { fit(frame); }).observe(doc.body);
        }
        // pages inside the frame change height when the learner navigates inside the module
        frame.contentWindow.addEventListener("pageshow", function () { setTimeout(function () { fit(frame); }, 50); });
      } catch (e) {}
    }
    frame.addEventListener("load", go);
  }
  var frames = document.querySelectorAll(".embed iframe");
  for (var i = 0; i < frames.length; i++) watch(frames[i]);

  /* 2. draft-flag toggle */
  var btn = document.getElementById("flagtoggle");
  function setHidden(hidden) {
    document.body.classList.toggle("hide-flags", hidden);
    if (btn) { btn.setAttribute("aria-pressed", String(hidden)); btn.textContent = hidden ? "Show flags" : "Hide flags"; }
    try { localStorage.setItem("qm_book_hide_flags", hidden ? "1" : "0"); } catch (e) {}
  }
  if (btn) {
    var saved = false;
    try { saved = localStorage.getItem("qm_book_hide_flags") === "1"; } catch (e) {}
    setHidden(saved);
    btn.addEventListener("click", function () { setHidden(!document.body.classList.contains("hide-flags")); });
  }

  /* 3. current section in the on-this-page list */
  var links = document.querySelectorAll(".toc a");
  if (links.length && "IntersectionObserver" in window) {
    var map = {};
    for (var j = 0; j < links.length; j++) map[links[j].getAttribute("href").slice(1)] = links[j];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          for (var k in map) map[k].removeAttribute("aria-current");
          map[en.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-10% 0px -80% 0px" });
    for (var id in map) { var t = document.getElementById(id); if (t) io.observe(t); }
  }
})();

/* 4. collapse the on-this-page list on narrow screens (it would otherwise push the chapter down a full screen) */
(function () {
  var box = document.querySelector(".tocbox");
  if (!box) return;
  var mq = window.matchMedia("(max-width: 1079px)");
  function apply() { box.open = !mq.matches; }
  apply();
  if (mq.addEventListener) mq.addEventListener("change", apply);
})();

/* 5. search page: load the index built by build.py, rank by term hits, show snippets */
(function () {
  var q = document.getElementById("q"), out = document.getElementById("results"), status = document.getElementById("search-status");
  if (!q || !out) return;
  var idx = null;
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function load(cb) {
    if (idx) return cb();
    var x = new XMLHttpRequest();
    x.open("GET", "index.json");
    x.onload = function () { try { idx = JSON.parse(x.responseText); } catch (e) { idx = []; } cb(); };
    x.onerror = function () { status.textContent = "The search index could not be loaded. Open the site over http (python3 -m http.server) rather than from a file."; };
    x.send();
  }
  function run() {
    var terms = q.value.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 1; });
    out.innerHTML = "";
    if (!terms.length) { status.textContent = ""; return; }
    load(function () {
      var hits = [];
      idx.forEach(function (e) {
        var hay = (e.s + " " + e.t).toLowerCase(), score = 0;
        for (var i = 0; i < terms.length; i++) {
          var n = hay.split(terms[i]).length - 1;
          if (!n) { score = 0; break; }
          score += n + (e.s.toLowerCase().indexOf(terms[i]) >= 0 ? 5 : 0);
        }
        if (score) hits.push([score, e]);
      });
      hits.sort(function (a, b) { return b[0] - a[0]; });
      hits = hits.slice(0, 40);
      status.textContent = hits.length ? hits.length + " section" + (hits.length === 1 ? "" : "s") + " match." : "No sections match.";
      hits.forEach(function (h) {
        var e = h[1], low = e.t.toLowerCase(), at = -1;
        for (var i = 0; i < terms.length && at < 0; i++) at = low.indexOf(terms[i]);
        var start = Math.max(0, at - 90), snip = (start ? "…" : "") + e.t.substr(start, 220) + "…";
        var html = esc(snip);
        terms.forEach(function (t) { html = html.replace(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>"); });
        var li = document.createElement("li");
        li.innerHTML = '<span class="r-page">' + esc(e.p) + '</span><a href="../' + esc(e.u) + '">' + esc(e.s) + "</a><p>" + html + "</p>";
        out.appendChild(li);
      });
    });
  }
  var t; q.addEventListener("input", function () { clearTimeout(t); t = setTimeout(run, 120); });
  if (q.value) run();
})();
