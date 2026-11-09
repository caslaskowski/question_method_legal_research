(function () {
  var el = LP.el, app = document.getElementById("app");
  var Q = window.QUIZ;
  LP.mountChrome("quiz");

  var TOPIC = {
    "hierarchy": "The hierarchy",
    "primary-secondary": "Primary vs. secondary",
    "binding": "Binding vs. persuasive",
    "statute-common-law": "Statute vs. common law"
  };
  var KEYS = ["A", "B", "C", "D"];

  var answered = 0, correct = 0, total = Q.questions.length;

  app.appendChild(el("section", { class: "reveal" }, [
    el("p", { class: "eyebrow" }, ["Assessment"]),
    el("h1", {}, ["Knowledge Check"]),
    el("p", { class: "lede measure" }, [Q.instructions])
  ]));

  var scoreEl = el("span", { class: "score" }, ["0 / " + total]);
  var prog = el("i");
  var bar = el("div", { class: "quiz-bar reveal d1" }, [
    scoreEl,
    el("div", { class: "progress", role: "progressbar", "aria-label": "Progress" }, [prog]),
    el("button", { class: "btn-notes", type: "button", onclick: reset }, ["Reset"])
  ]);
  app.appendChild(bar);

  var listWrap = el("div", { class: "reveal d1" });
  app.appendChild(listWrap);

  var endCard = el("div", { class: "quiz-end" });
  app.appendChild(endCard);

  render();

  function render() {
    listWrap.innerHTML = "";
    Q.questions.forEach(function (q) { listWrap.appendChild(renderQ(q)); });
  }

  function renderQ(q) {
    var card = el("div", { class: "q", id: "q-" + q.id });
    card.appendChild(el("div", { class: "tag" }, [TOPIC[q.topic] || q.topic]));
    card.appendChild(el("div", { class: "prompt" }, [q.prompt]));

    var opts = el("div", { class: "opts" });
    var optButtons = {};
    q.options.forEach(function (o, idx) {
      var b = el("button", { class: "opt", type: "button" }, [
        el("span", { class: "key" }, [KEYS[idx]]),
        el("span", {}, [o.text])
      ]);
      b.addEventListener("click", function () { choose(q, o.id, optButtons, fb); });
      optButtons[o.id] = b;
      opts.appendChild(b);
    });
    card.appendChild(opts);

    var fb = el("div", { class: "fb" });
    card.appendChild(fb);
    return card;
  }

  function choose(q, chosen, optButtons, fb) {
    if (Object.keys(optButtons).some(function (k) { return optButtons[k].disabled; })) return;
    var isRight = chosen === q.correct;
    answered++; if (isRight) correct++;

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
      fb.appendChild(el("div", { class: "why-correct" }, [
        el("b", {}, ["Why the answer is "]),
        KEYS[q.options.map(function (o) { return o.id; }).indexOf(q.correct)] + ": " + q.feedback.correct
      ]));
    }
    update();
  }

  function update() {
    scoreEl.textContent = correct + " / " + total;
    prog.style.width = Math.round((answered / total) * 100) + "%";
    if (answered === total) showEnd();
  }

  function showEnd() {
    var pct = Math.round((correct / total) * 100);
    var msg = pct >= 90 ? "Excellent — you have a firm grip on the hierarchy."
      : pct >= 70 ? "Solid. Revisit the few you missed and you are there."
      : pct >= 50 ? "A reasonable start. The feedback above is where the learning is — reread it."
      : "Worth another pass. Review the orientation pages, then try again.";
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
    render();
    update();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
})();
