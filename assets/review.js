/* Chapter review engine: quizzes and item drills. Data is embedded in the page as
   <script type="application/json" id="review-data">. Everything stays in the browser:
   answers persist in localStorage under one key per page, and the learner can download
   a plain-text record to submit. No network requests. */
(function () {
  "use strict";
  var node = document.getElementById("review-data");
  if (!node) return;
  var D = JSON.parse(node.textContent);
  var KEY = "qm_review_" + D.key;
  var root = document.getElementById("review");
  var state = load();

  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || "{}"); return s && typeof s === "object" ? s : {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in (attrs || {})) { if (attrs[k] == null) continue; if (k === "class") n.className = attrs[k]; else if (k === "html") n.innerHTML = attrs[k]; else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]); else n.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  var items = D.items;
  var status = el("p", { class: "rv-status", role: "status", "aria-live": "polite" });
  function tally() {
    var answered = 0, right = 0;
    items.forEach(function (it, i) { var a = state[i]; if (a != null) { answered++; if (a === it.answer) right++; } });
    status.textContent = answered ? (answered + " of " + items.length + " answered, " + right + " correct" + (answered === items.length ? ". " + (right === items.length ? "Every one." : right >= items.length * 0.8 ? "Strong. Reread the feedback on the ones you missed." : "Reread the sections the feedback names, then try again.") : "")) : "Choose an answer for each item; feedback appears as you go.";
    return { answered: answered, right: right };
  }
  root.appendChild(status);
  var list = el("ol", { class: "rv-list" });
  items.forEach(function (it, i) {
    var li = el("li", { class: "rv-item", id: "q" + (i + 1) });
    li.appendChild(el("p", { class: "rv-q", html: "<span class='rv-n'>" + (i + 1) + "</span> " + it.q }));
    var fb = el("div", { class: "rv-fb", role: "status", "aria-live": "polite" });
    var opts = el("div", { class: "rv-opts", role: "group", "aria-label": "Answers to question " + (i + 1) });
    it.options.forEach(function (o, j) {
      var b = el("button", { type: "button", class: "rv-opt", "data-j": j }, [el("span", { class: "rv-letter" }, [String.fromCharCode(65 + j)]), el("span", {}, [o])]);
      b.addEventListener("click", function () { answer(i, j); });
      opts.appendChild(b);
    });
    li.appendChild(opts); li.appendChild(fb);
    list.appendChild(li);
    if (state[i] != null) paint(li, it, state[i]);
  });
  root.appendChild(list);
  function paint(li, it, j) {
    var btns = li.querySelectorAll(".rv-opt");
    btns.forEach(function (b, k) { b.classList.toggle("good", k === it.answer); b.classList.toggle("bad", k === j && j !== it.answer); b.classList.toggle("chosen", k === j); b.setAttribute("aria-pressed", String(k === j)); });
    var fb = li.querySelector(".rv-fb");
    fb.innerHTML = (j === it.answer ? "<b class='ok'>Correct.</b> " : "<b class='no'>Not quite.</b> The answer is " + String.fromCharCode(65 + it.answer) + ". ") + it.why;
    fb.classList.add("show");
  }
  function answer(i, j) { if (state[i] != null && !D.retry) return; state[i] = j; save(); paint(list.children[i], items[i], j); tally(); }
  tally();

  /* reset + record */
  var tools = el("div", { class: "rv-tools" });
  tools.appendChild(el("button", { type: "button", class: "btn ghost", onclick: function () { if (confirm("Clear your answers on this page?")) { state = {}; save(); location.reload(); } } }, ["Start over"]));
  root.appendChild(tools);

  var rec = el("section", { class: "rv-record", "aria-labelledby": "rec-h" });
  rec.appendChild(el("h2", { id: "rec-h" }, ["Download your record"]));
  rec.appendChild(el("p", {}, ["A plain-text file of your answers and this reflection, to submit if your instructor asks for it. Nothing is sent anywhere; the file is made in your browser."]));
  var ta = el("textarea", { rows: 4, id: "rv-reflect", placeholder: D.prompt || "What surprised you, and which section will you reread?" });
  rec.appendChild(el("label", { for: "rv-reflect" }, ["Reflection (optional)"]));
  rec.appendChild(ta);
  rec.appendChild(el("p", {}, [el("button", { type: "button", class: "btn", onclick: download }, ["Download record (.txt)"])]));
  rec.appendChild(el("p", { class: "rv-note" }, ["Your answers are saved in this browser only (localStorage). Start over clears them."]));
  root.appendChild(rec);
  function download() {
    var t = tally(), lines = [];
    lines.push(D.title); lines.push(D.chapter); lines.push("Date: " + new Date().toLocaleString()); lines.push("Score: " + t.right + " / " + items.length + " (" + t.answered + " answered)"); lines.push("");
    items.forEach(function (it, i) {
      var a = state[i];
      lines.push((i + 1) + ". " + it.q);
      lines.push("   Your answer: " + (a == null ? "(not answered)" : String.fromCharCode(65 + a) + ". " + it.options[a]) + (a == null ? "" : a === it.answer ? "  [correct]" : "  [incorrect; answer " + String.fromCharCode(65 + it.answer) + "]"));
    });
    lines.push(""); lines.push("Reflection:"); lines.push(ta.value || "(none)");
    var blob = new Blob([lines.join("\n")], { type: "text/plain" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = D.key + "-record.txt"; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
})();
