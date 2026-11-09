/* Shared knowledge-check engine. Renders one-shot multiple-choice checks with
   per-option reveal, kind feedback, and ExportReflect logging. */
(function () {
  "use strict";
  function render(wrapId, fbId, logName, opts) {
    var wrap = document.getElementById(wrapId), fb = document.getElementById(fbId), done = false;
    if (!wrap || !fb) return;
    opts.forEach(function (o) {
      var b = QM.el("button", { class: "opt", type: "button" }, [o.t]);
      b.addEventListener("click", function () {
        if (done) return;
        done = true;
        wrap.querySelectorAll(".opt").forEach(function (x, i) {
          x.disabled = true;
          if (opts[i].good) x.classList.add("good");
          else if (x === b) x.classList.add("bad");
        });
        QM.announce(fb, o.fb);
        if (window.ExportReflect) ExportReflect.log(logName, o.good ? "correct" : "incorrect \u2014 chose " + o.t);
      });
      wrap.appendChild(b);
    });
  }
  window.QMKC = { render: render };
})();
