/* =============================================================================
   lib.js — shared helpers for every module. Classic script (no bundler, no
   modules) so pages keep working from file:// with no server.

   Provides window.QM with:
     QM.el(tag, attrs, kids)      DOM builder (class, html, text, on* handlers)
     QM.param(name)               query-string reader
     QM.live(container?)          create/get an aria-live region for feedback —
                                  create it BEFORE injecting feedback so screen
                                  readers announce the change
     QM.announce(el, text)        set feedback text on a live region
     QM.storageNotice(opts)       FERPA disclosure + "Clear my saved work":
                                  { keys: [..] or prefix: "qm_", parent: node,
                                    onCleared: fn }
   ========================================================================== */
(function () {
  "use strict";

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k]; if (v == null) return;
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k === "text") n.textContent = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  function param(name) {
    var m = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  /* Feedback that screen readers hear: give every dynamic right/wrong panel a
     polite live region that exists before its content changes. */
  function live(container) {
    var n = container || el("div");
    n.setAttribute("role", "status");
    n.setAttribute("aria-live", "polite");
    return n;
  }
  function announce(node, text) {
    /* clear-then-set so repeated identical messages still announce */
    node.textContent = "";
    window.setTimeout(function () { node.textContent = text; }, 30);
  }

  /* FERPA disclosure for modules that persist work in this browser. */
  function storageNotice(opts) {
    opts = opts || {};
    function clearKeys() {
      try {
        if (opts.keys) opts.keys.forEach(function (k) { localStorage.removeItem(k); });
        if (opts.prefix) {
          var doomed = [];
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.indexOf(opts.prefix) === 0) doomed.push(k);
          }
          doomed.forEach(function (k) { localStorage.removeItem(k); });
        }
      } catch (e) { /* storage unavailable — nothing to clear */ }
      if (opts.onCleared) opts.onCleared();
      else window.location.reload();
    }
    var status = live(el("span", { class: "storage-status" }));
    var note = el("div", { class: "storage-note" }, [
      el("span", {}, ["Your work in this module is saved only in this browser, " +
        "on this device \u2014 nothing is sent anywhere."]),
      el("button", { type: "button", onclick: function () {
        if (window.confirm("Clear your saved work for this module on this device?")) clearKeys();
      } }, ["Clear my saved work"]),
      status
    ]);
    (opts.parent || document.body).appendChild(note);
    return note;
  }

  window.QM = { el: el, param: param, live: live, announce: announce,
                storageNotice: storageNotice };
})();
