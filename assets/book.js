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
