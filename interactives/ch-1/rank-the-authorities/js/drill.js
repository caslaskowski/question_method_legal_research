(function () {
  var el = LP.el, app = document.getElementById("app");
  var type = LP.getParam("type") || "primary-secondary";
  var D = (window.DRILLS || {})[type];
  LP.mountChrome(type);

  if (!D) {
    app.appendChild(el("section", {}, [
      el("h1", {}, ["Drill not found"]),
      el("p", {}, ["No drill matched \u201c" + type + ".\u201d Use the Drills menu above to pick one."])
    ]));
    return;
  }

  var KEYS = ["A", "B", "C", "D"];
  var total = D.items.length, answered = 0, correct = 0;

  app.appendChild(el("section", { class: "reveal" }, [
    el("p", { class: "eyebrow" }, [D.eyebrow]),
    el("h1", {}, [D.title]),
    el("p", { class: "lede measure" }, [D.instructions])
  ]));

  var scoreEl = el("span", { class: "score" }, ["0 / " + total]);
  var prog = el("i");
  app.appendChild(el("div", { class: "quiz-bar reveal d1" }, [
    scoreEl,
    el("div", { class: "progress", role: "progressbar", "aria-label": "Progress", "aria-valuemin": "0", "aria-valuemax": String(total), "aria-valuenow": "0" }, [prog]),
    el("button", { class: "btn-notes", type: "button", onclick: reset }, ["Reset"])
  ]));

  var listWrap = el("div", { class: "reveal d1" });
  app.appendChild(listWrap);
  var endCard = el("div", { class: "quiz-end" });
  app.appendChild(endCard);

  var bar = app.querySelector(".progress");
  render();

  function render() { listWrap.innerHTML = ""; D.items.forEach(function (q) { listWrap.appendChild(renderItem(q)); }); }

  function renderItem(q) {
    var options = q.options || D.options;
    var card = el("div", { class: "q", id: "q-" + q.id });
    card.appendChild(el("div", { class: "prompt" }, [q.prompt]));
    var opts = el("div", { class: "opts" });
    var optButtons = {};
    options.forEach(function (o, idx) {
      var b = el("button", { class: "opt", type: "button" }, [
        el("span", { class: "key", "aria-hidden": "true" }, [KEYS[idx]]),
        el("span", {}, [o.text])
      ]);
      b.addEventListener("click", function () { choose(q, options, o.id, optButtons, fb); });
      optButtons[o.id] = b;
      opts.appendChild(b);
    });
    card.appendChild(opts);
    var fb = el("div", { class: "fb", role: "status", "aria-live": "polite" });
    card.appendChild(fb);
    return card;
  }

  function choose(q, options, chosen, optButtons, fb) {
    if (Object.keys(optButtons).some(function (k) { return optButtons[k].disabled; })) return;
    var isRight = chosen === q.correct;
    answered++; if (isRight) correct++;
    try {
      var stored = JSON.parse(localStorage.getItem("rta_drill_" + type) || "{}");
      stored[q.id] = { chosen: chosen, correct: q.correct, isRight: isRight };
      localStorage.setItem("rta_drill_" + type, JSON.stringify(stored));
    } catch (e) { /* localStorage unavailable */ }

    Object.keys(optButtons).forEach(function (k) {
      var b = optButtons[k];
      b.disabled = true;
      if (k === q.correct) b.classList.add("correct");
      else if (k === chosen) b.classList.add("wrong");
      else b.classList.add("muted");
    });

    fb.className = "fb show " + (isRight ? "ok" : "no");
    fb.innerHTML = "";
    fb.appendChild(el("div", { class: "verdict" }, [isRight ? "Correct." : "Not quite."]));
    fb.appendChild(el("div", {}, [isRight ? q.feedback.correct : q.feedback[chosen]]));
    if (!isRight) {
      var correctIdx = options.map(function (o) { return o.id; }).indexOf(q.correct);
      fb.appendChild(el("div", { class: "why-correct" }, [
        el("b", {}, ["The answer is " + KEYS[correctIdx] + ". "]), q.feedback.correct
      ]));
    }
    update();
  }

  function update() {
    scoreEl.textContent = correct + " / " + total;
    prog.style.width = Math.round((answered / total) * 100) + "%";
    bar.setAttribute("aria-valuenow", String(answered));
    if (answered === total) showEnd();
  }

  function showEnd() {
    var pct = Math.round((correct / total) * 100);
    var msg = pct >= 90 ? "Excellent \u2014 you can tell weight on sight."
      : pct >= 70 ? "Solid. Reread the few you missed and you\u2019re there."
      : pct >= 50 ? "A start. The learning is in the feedback above \u2014 reread it, then reset."
      : "Worth another pass. Revisit The Hierarchy, then try again.";
    endCard.innerHTML = "";
    endCard.appendChild(el("p", { class: "eyebrow" }, ["Your result"]));
    endCard.appendChild(el("div", { class: "big" }, [correct + " / " + total]));
    endCard.appendChild(el("p", { style: "margin:6px 0 16px;color:var(--ink-soft)" }, [msg]));
    endCard.appendChild(el("button", { class: "btn ghost", type: "button", onclick: reset }, ["Try again"]));
    endCard.classList.add("show");
    endCard.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function reset() {
    answered = 0; correct = 0;
    endCard.classList.remove("show");
    render(); update();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
})();
