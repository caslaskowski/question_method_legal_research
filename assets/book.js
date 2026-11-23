/* Page behaviour for the book: remember the show/hide draft-flags choice, highlight the current
   section in "On this page", run the search page, and bring the in-text interactives to life.
   Every interactive is ordinary page content (a list, a paragraph, a definition list) that this
   script enhances in place: nothing is framed in from another site, and with scripts off the
   content still reads as text. */
(function () {
  "use strict";

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

/* 3b. the Contents menu closes on Escape (focus returns to its button) and on a click elsewhere */
(function () {
  var menu = document.querySelector(".menu");
  if (!menu) return;
  menu.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); } });
  document.addEventListener("click", function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
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

/* 6. In-text interactives. Each is a <div class="try" data-kind="..."> written in the chapter's
      Markdown (see README, "Interactives"). One screen each; no paging, no frames. */
(function () {
  "use strict";
  var blocks = document.querySelectorAll(".try[data-kind]");
  if (!blocks.length) return;

  function h(tag, attrs, kids) {
    var e = document.createElement(tag), k;
    for (k in attrs || {}) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== false) e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function opt(el, name) { return el.getAttribute("data-" + name) || el.getAttribute(name) || ""; }
  function kids(el, sel) { return Array.prototype.filter.call(el.children, function (c) { return c.matches(sel); }); }
  function splitBar(s) { return s.split("|").map(function (x) { return x.trim(); }).filter(Boolean); }
  /* an <li>'s own content (without the nested list that carries its feedback) */
  function own(li) {
    var c = li.cloneNode(true);
    Array.prototype.slice.call(c.querySelectorAll("ul,ol")).forEach(function (n) { n.remove(); });
    Array.prototype.slice.call(c.querySelectorAll("input")).forEach(function (n) { n.remove(); });
    var lab = c.querySelector("label"); if (lab) { while (lab.firstChild) lab.parentNode.insertBefore(lab.firstChild, lab); lab.remove(); }
    var ps = kids(c, "p"); if (ps.length === 1 && c.children.length === 1) return ps[0].innerHTML.trim();
    return c.innerHTML.trim();
  }
  function fb(li) {
    var sub = kids(li, "ul,ol")[0];
    return sub ? kids(sub, "li").map(function (x) { return x.innerHTML; }).join("<br>") : "";
  }
  function isRight(li) { var i = li.querySelector("input[type=checkbox]"); return !!(i && i.checked); }
  function topList(el) { return kids(el, "ul,ol")[0]; }
  function shuffled(n, seed) {          /* stable, never the identity for n > 1 */
    var a = [], i, j, t, x = seed * 9301 + 49297;
    for (i = 0; i < n; i++) a.push(i);
    for (i = n - 1; i > 0; i--) { x = (x * 9301 + 49297) % 233280; j = Math.floor(x / 233280 * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    if (n > 1 && a.every(function (v, k) { return v === k; })) { t = a[0]; a[0] = a[n - 1]; a[n - 1] = t; }
    return a;
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function live() { return h("div", { "class": "try-out", role: "status", "aria-live": "polite" }); }
  /* arrow keys walk a row of buttons that works as one control (a segmented switch, a tab strip):
     Left/Up and Right/Down move to the neighbour and press it, Home and End to the ends */
  function arrows(group, roving) {
    group.addEventListener("keydown", function (e) {
      var bs = Array.prototype.filter.call(group.querySelectorAll("button"), function (b) { return !b.disabled; }), i = bs.indexOf(document.activeElement), j;
      if (i < 0 || !bs.length) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % bs.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i + bs.length - 1) % bs.length;
      else if (e.key === "Home") j = 0; else if (e.key === "End") j = bs.length - 1; else return;
      e.preventDefault(); bs[j].focus(); bs[j].click();
    });
    if (roving) group.addEventListener("click", function () {      /* one tab stop: only the pressed button is in the Tab order */
      Array.prototype.forEach.call(group.querySelectorAll("button"), function (b) { b.setAttribute("tabindex", b.getAttribute("aria-selected") === "true" || b.getAttribute("aria-pressed") === "true" ? "0" : "-1"); });
    });
  }
  /* when the control that had focus is disabled or rebuilt, move focus to a sensible neighbour */
  function focusFirst(scope) { var b = scope && scope.querySelector("button:not(:disabled), [tabindex='0']"); if (b) b.focus(); return !!b; }
  function strip(s) { return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); }

  var KINDS = {};

  /* ---- choice: one question, feedback on every option -------------------------------- */
  KINDS.choice = function (root) {
    var list = topList(root); if (!list) return;
    var items = kids(list, "li"), multi = items.filter(isRight).length > 1, out = live();
    var box = h("div", { "class": "try-opts", role: "group" });
    var btns = items.map(function (li, i) {
      var b = h("button", { type: "button", "class": "try-opt", "aria-pressed": "false", html: own(li) });
      b.addEventListener("click", function () {
        if (multi) { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); b.classList.remove("ok", "no"); return; }
        btns.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        var ok = isRight(li); b.classList.add(ok ? "ok" : "no");
        out.innerHTML = '<p class="' + (ok ? "good" : "bad") + '"><strong>' + (ok ? "Yes." : "Not this one.") + "</strong> " + fb(li) + "</p>";
      });
      box.appendChild(b); return b;
    });
    list.replaceWith(box);
    if (multi) {
      box.insertAdjacentElement("afterend", h("p", { "class": "try-actions" }, [h("button", { type: "button", "class": "try-btn", text: "Check my picks", onclick: function () {
        var html = "", all = true;
        items.forEach(function (li, i) {
          var picked = btns[i].getAttribute("aria-pressed") === "true", ok = picked === isRight(li);
          btns[i].classList.remove("ok", "no"); if (picked) btns[i].classList.add(isRight(li) ? "ok" : "no");
          if (!ok) all = false;
          if (picked || !ok) html += '<p class="' + (ok ? "good" : "bad") + '"><strong>' + strip(own(li)) + ":</strong> " + (ok ? "" : (picked ? "Not this one. " : "You missed this one. ")) + fb(li) + "</p>";
        });
        out.innerHTML = (all ? '<p class="good"><strong>All correct.</strong></p>' : "") + html;
      } })]));
      box.insertAdjacentElement("beforebegin", h("p", { "class": "try-hint", text: "Select every answer that applies, then check." }));
    }
    root.appendChild(out);
  };

  /* ---- sort: put each item in a bin ---------------------------------------------------- */
  KINDS.sort = function (root, idx) {
    var list = topList(root); if (!list) return;
    var items = kids(list, "li").map(function (li) {
      var c = li.cloneNode(true), strongs, bin = "";
      Array.prototype.slice.call(c.querySelectorAll("ul,ol")).forEach(function (n) { n.remove(); });
      strongs = c.querySelectorAll("strong");
      if (strongs.length) { bin = strongs[strongs.length - 1].textContent.trim(); strongs[strongs.length - 1].remove(); }
      var ps = kids(c, "p"); var html = (ps.length ? ps[0].innerHTML : c.innerHTML).replace(/(\s|&nbsp;|[—–:-])+$/, "").trim();
      var subs = kids(li, "ul,ol")[0], notes = subs ? kids(subs, "li").map(function (x) { return x.innerHTML; }) : [];
      return { html: html, bin: bin, fb: notes[0] || "", miss: notes[1] || "" };
    });
    var bins = splitBar(opt(root, "bins"));
    if (!bins.length) items.forEach(function (it) { if (bins.indexOf(it.bin) < 0) bins.push(it.bin); });
    var done = 0, score = h("p", { "class": "try-score", role: "status", "aria-live": "polite" });
    var wrap = h("ol", { "class": "try-sort" + (bins.length > 3 ? " many" : "") });
    function tally() { score.textContent = done + " of " + items.length + " placed" + (done === items.length ? ". All sorted." : ""); }
    shuffled(items.length, idx + 3).forEach(function (k) {
      var it = items[k], misses = 0, note = h("div", { "class": "try-note", role: "status" });
      var row = h("li", {}, [h("div", { "class": "try-item", html: it.html })]);
      var bar = h("div", { "class": "try-bins", role: "group", "aria-label": "Choose a category" });
      bins.forEach(function (b) {
        var btn = h("button", { type: "button", "class": "try-bin", text: b });
        btn.addEventListener("click", function () {
          if (row.classList.contains("done")) return;
          if (b === it.bin) {
            row.classList.add("done"); btn.classList.add("ok"); done++;
            Array.prototype.forEach.call(bar.children, function (x) { x.disabled = true; });
            note.innerHTML = '<p class="good"><strong>' + b + ".</strong> " + it.fb + "</p>"; tally();
            /* the row's buttons are now disabled: carry focus to the next row still to be sorted, or to the tally */
            var rest = Array.prototype.filter.call(wrap.children, function (r) { return !r.classList.contains("done"); });
            if (!focusFirst(rest[0])) { score.setAttribute("tabindex", "-1"); score.focus(); }
          } else {
            btn.classList.add("no"); btn.disabled = true; misses++;
            note.innerHTML = '<p class="bad">Not ' + b.toLowerCase() + ". " + (it.miss ? it.miss + " " : (misses > 1 ? "Look at what the item <em>is</em> before what it is about. " : "")) + "Try again.</p>";
            focusFirst(bar);
          }
        });
        bar.appendChild(btn);
      });
      row.appendChild(bar); row.appendChild(note); wrap.appendChild(row);
    });
    list.replaceWith(wrap);
    wrap.insertAdjacentElement("afterend", score); tally();
  };

  /* ---- order: arrange the rows, then check ---------------------------------------------- */
  KINDS.order = function (root, idx) {
    var list = topList(root); if (!list) return;
    var items = kids(list, "li").map(function (li, i) { return { html: own(li), fb: fb(li), pos: i }; });
    var cur = shuffled(items.length, idx + 7).map(function (k) { return items[k]; }), out = live();
    var wrap = h("ol", { "class": "try-order" });
    function draw(checked) {
      wrap.innerHTML = "";
      cur.forEach(function (it, i) {
        var good = checked && it.pos === i;
        var li = h("li", { "class": checked ? (good ? "ok" : "no") : "" }, [
          h("span", { "class": "try-move", onkeydown: function (e) {
            if (e.key === "ArrowUp" && i > 0) { e.preventDefault(); swap(i, i - 1); }
            else if (e.key === "ArrowDown" && i < cur.length - 1) { e.preventDefault(); swap(i, i + 1); }
          } }, [
            h("button", { type: "button", "aria-label": "Move up", disabled: i === 0 ? "" : null, text: "↑", onclick: function () { swap(i, i - 1); } }),
            h("button", { type: "button", "aria-label": "Move down", disabled: i === cur.length - 1 ? "" : null, text: "↓", onclick: function () { swap(i, i + 1); } })
          ]),
          h("div", { "class": "try-item", html: it.html + (checked && allRight() && it.fb ? '<span class="try-why">' + it.fb + "</span>" : "") }),
          checked ? h("span", { "class": "try-mark", text: good ? "\u2713 in place" : "\u2717 move" }) : null
        ]);
        wrap.appendChild(li);
      });
    }
    function allRight() { return cur.every(function (it, i) { return it.pos === i; }); }
    function swap(a, b) {
      var t = cur[a]; cur[a] = cur[b]; cur[b] = t; out.innerHTML = ""; draw(false);
      var bs = wrap.children[b].querySelectorAll("button"); (bs[b < a ? 0 : 1].disabled ? bs[b < a ? 1 : 0] : bs[b < a ? 0 : 1]).focus();
    }
    list.replaceWith(wrap); draw(false);
    wrap.insertAdjacentElement("afterend", h("p", { "class": "try-actions" }, [h("button", { type: "button", "class": "try-btn", text: "Check the order", onclick: function () {
      draw(true);
      var n = cur.filter(function (it, i) { return it.pos === i; }).length;
      out.innerHTML = allRight() ? '<p class="good"><strong>That is the order.</strong> The reason for each position is now shown beside it.</p>'
        : '<p class="bad"><strong>' + n + " of " + cur.length + " in place.</strong> The rows marked \u201cin place\u201d are right where they are. Move the others and check again.</p>";
    } })]));
    root.appendChild(out);
  };

  /* ---- explore: a diagram or set of parts; select one to read about it ------------------- */
  KINDS.explore = function (root) {
    var layout = opt(root, "layout") || "tabs";
    if (layout === "database") return dbExplorer(root);
    var list = topList(root); if (!list) return;
    var items = kids(list, "li").map(function (li) {
      var c = li.cloneNode(true), st = c.querySelector("strong"), label = "", tag = "", x = null, y = null, m;
      if (st) { label = st.innerHTML.replace(/[.:]\s*$/, ""); st.remove(); }
      if ((m = label.match(/^(.*?)\s*\|\s*(.*)$/))) { label = m[1]; tag = m[2]; }
      if (layout === "plot" && (m = tag.match(/^(\d+)\s*,\s*(\d+)$/))) { x = +m[1]; y = +m[2]; tag = ""; }
      var ps = kids(c, "p"); if (ps.length && ps[0].innerHTML.trim() === "") ps[0].remove();
      return { label: label, tag: tag, x: x, y: y, body: (c.children.length ? c.innerHTML : "<p>" + c.innerHTML + "</p>").replace(/^<p>\s+/, "<p>") };
    });
    var panel = h("div", { "class": "try-panel", role: "region", "aria-live": "polite", "aria-label": "Details: " + (opt(root, "title") || "") });
    var fig = h("div", { "class": "try-fig try-" + layout, role: "group" });
    var btns = items.map(function (it, i) {
      var b = h("button", { type: "button", "class": "try-node", "aria-pressed": "false", html: "<span>" + it.label + "</span>" + (it.tag ? '<small>' + it.tag + "</small>" : "") });
      b.addEventListener("click", function () { pick(i); });
      return b;
    });
    function pick(i) {
      btns.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i ? "true" : "false"); });
      panel.innerHTML = '<p class="try-panel-h">' + (layout === "database" && items[i].tag ? items[i].tag : items[i].label + (items[i].tag ? " <small>" + items[i].tag + "</small>" : "")) + "</p>" + items[i].body;
    }
    if (layout === "ring") {
      var n = items.length, edges = opt(root, "edges").split("|").map(function (x) { return x.trim(); }), both = opt(root, "arrows") === "both";
      var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 160 90"); svg.setAttribute("aria-hidden", "true");
      svg.innerHTML = '<defs><marker id="qm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker></defs>';
      var centre = opt(root, "center") === "last" ? n - 1 : -1; if (centre >= 0) n = n - 1;       /* the last item floats in the middle, outside the cycle */
      var pts = items.slice(0, n).map(function (_it, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [80 + 54 * Math.cos(a), (n === 3 ? 50 : 45) + 33 * Math.sin(a)]; });
      var curved = n >= 4 && !opt(root, "edges");
      function curve(p, q) {
        var dx = q[0] - p[0], dy = q[1] - p[1], f = Math.min(Math.min(22 / Math.abs(dx || 1e-6), 9.5 / Math.abs(dy || 1e-6)), 0.45);
        var a = [p[0] + dx * f, p[1] + dy * f], b = [q[0] - dx * f, q[1] - dy * f], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        var ox = mx - 80, oy = my - 45, ol = Math.sqrt(ox * ox + oy * oy) || 1, path = document.createElementNS(NS, "path");
        path.setAttribute("d", "M" + a[0] + " " + a[1] + " Q" + (mx + ox / ol * 7) + " " + (my + oy / ol * 5) + " " + b[0] + " " + b[1]);
        path.setAttribute("marker-end", "url(#qm-arrow)"); svg.appendChild(path);
      }
      /* an edge label may be "forward ~ backward": two arrows, one each way, each carrying its own label.
         "~ backward" alone draws only the return arrow. */
      function arrow(p, q, off, label, twoHeads) {
        var dx = q[0] - p[0], dy = q[1] - p[1], len = Math.sqrt(dx * dx + dy * dy), ux = -dy / len, uy = dx / len;
        var f = Math.min(Math.min(23 / Math.abs(dx || 1e-6), 9.5 / Math.abs(dy || 1e-6)), 0.45), line = document.createElementNS(NS, "line");
        line.setAttribute("x1", p[0] + dx * f + ux * off); line.setAttribute("y1", p[1] + dy * f + uy * off);
        line.setAttribute("x2", q[0] - dx * f + ux * off); line.setAttribute("y2", q[1] - dy * f + uy * off);
        line.setAttribute("marker-end", "url(#qm-arrow)"); if (twoHeads) line.setAttribute("marker-start", "url(#qm-arrow)");
        svg.appendChild(line);
        if (!label) return;
        /* the label sits beside its own arrow, never on it: a paired arrow keeps its side, a lone one takes the outside */
        var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, side = off ? 1 : ((mx + ux - 80) * (mx + ux - 80) + (my + uy - 45) * (my + uy - 45) > (mx - 80) * (mx - 80) + (my - 45) * (my - 45) ? 1 : -1);
        var d = off + side * (Math.abs(ux) > 0.5 ? 13 : 7);
        fig.appendChild(h("span", { "class": "try-edge", style: "left:" + ((mx + ux * d) / 1.6) + "%;top:" + ((my + uy * d) / 0.9) + "%", text: label }));
      }
      pts.forEach(function (p, i) {
        if (n < 2) return;
        var q = pts[(i + 1) % n], e = edges[i] || "";
        if (curved) { curve(p, q); return; }
        if (e.indexOf("~") >= 0) {
          var parts = e.split("~").map(function (x) { return x.trim(); }), pair = parts[0] && parts[1];
          if (parts[0]) arrow(p, q, pair ? 2.2 : 0, parts[0], false);
          if (parts[1]) arrow(q, p, pair ? 2.2 : 0, parts[1], false);
        } else arrow(p, q, 0, e, both);
      });
      fig.appendChild(svg);
      btns.forEach(function (b, i) {
        if (i === centre) { b.classList.add("centre"); b.style.left = "50%"; b.style.top = "50%"; }
        else { b.style.left = (pts[i][0] / 1.6) + "%"; b.style.top = (pts[i][1] / 0.9) + "%"; }
        fig.appendChild(b);
      });
    } else if (layout === "plot") {
      fig.appendChild(h("span", { "class": "try-axis-y", text: opt(root, "ylabel") }));
      fig.appendChild(h("span", { "class": "try-axis-x", text: opt(root, "xlabel") }));
      var area = h("div", { "class": "try-plotarea" });
      btns.forEach(function (b, i) { b.style.left = items[i].x + "%"; b.style.bottom = items[i].y + "%"; area.appendChild(b); });
      fig.appendChild(area);
    } else {
      btns.forEach(function (b) { fig.appendChild(b); });
    }
    var shell = h("div", { "class": "try-explore try-explore-" + layout }, [fig, panel]);
    list.replaceWith(shell);
    pick(0);
  };

  /* ---- the Database Interface Explorer: a generic legal database, three screens ----------
     Each top-level list in the block is one screen, named by the bold paragraph before it
     (Start page, Results, Document by default). Every list item is one part of that screen, in
     the order README.md gives; a nested list is the part's sub-items (a tab's collections, the
     filter facets). find="question => part name | ..." adds a find-it challenge. */
  function parseParts(list) {
    return kids(list, "li").map(function (li) {
      var c = li.cloneNode(true), st = c.querySelector("strong"), label = "", tag = "", m;
      if (st) { label = st.innerHTML.replace(/[.:]\s*$/, ""); st.remove(); }
      if ((m = label.match(/^(.*?)\s*\|\s*(.*)$/))) { label = m[1]; tag = m[2]; }
      var ul = c.querySelector("ul"), links = [];
      if (ul) { links = Array.prototype.map.call(ul.children, function (x) { return x.textContent.trim(); }); ul.remove(); }
      var ps = kids(c, "p"); if (ps.length && ps[0].innerHTML.trim() === "") ps[0].remove();
      return { label: label, tag: tag || label.replace(/<[^>]+>/g, ""), links: links, body: (c.children.length ? c.innerHTML : "<p>" + c.innerHTML + "</p>").replace(/^<p>\s+/, "<p>") };
    });
  }
  function dbExplorer(root) {
    var head = root.querySelector(".try-head"), names = ["Start page", "Results", "Case", "Statute", "Regulation"], screens = [], pending = null;
    Array.prototype.slice.call(root.children).forEach(function (c) {
      if (c.tagName === "P" && c.children.length === 1 && c.firstElementChild.tagName === "STRONG" && c.textContent.trim() === c.firstElementChild.textContent.trim()) { pending = c; return; }
      if (c.tagName === "UL" || c.tagName === "OL") {
        screens.push({ name: pending ? pending.textContent.replace(/[.:]\s*$/, "").trim() : names[screens.length] || "Screen " + (screens.length + 1), parts: parseParts(c), list: c });
        if (pending) pending.remove(); pending = null;
      }
    });
    if (!screens.length) return;
    var all = [], panel = h("div", { "class": "try-panel", role: "region", "aria-live": "polite", "aria-label": "Details: " + (opt(root, "title") || ""), html: '<p class="try-hint">Select any part of the screen to read about it here.</p>' });
    var counter = h("p", { "class": "try-score", role: "status", "aria-live": "polite" }), seenN = 0, finding = null;
    function hot(it, cls, html) {
      var b = h("button", { type: "button", "class": "hot " + (cls || ""), "aria-pressed": "false", html: html || it.label });
      it.btn = b; all.push(it);
      b.addEventListener("click", function () {
        all.forEach(function (x) { x.btn.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        if (!b.classList.contains("seen")) { b.classList.add("seen"); seenN++; }
        panel.innerHTML = '<p class="try-panel-h">' + it.tag + "</p>" + it.body;
        counter.textContent = seenN + " of " + all.length + " parts explored";
        if (finding) finding.check(it);
      });
      return b;
    }
    function at(parts, i) { return parts[i]; }
    function logo() { return h("span", { "class": "db-logo", html: "<em>LR</em>LegalResearch" }); }
    function foot(P, from) { var f = h("div", { "class": "db-foot" }, [h("span", { text: "Demonstration platform" })]); P.slice(from).forEach(function (it) { f.appendChild(hot(it)); }); return f; }
    var AI = '<i class="ai" aria-hidden="true">✦</i>';
    /* screen 1: the start page */
    function startScreen(sc) {
      var P = sc.parts, tabsI = [], plain = [];
      P.forEach(function (it, i) { if (it.links.length) tabsI.push(i); else plain.push(i); });
      var fig = h("div", { "class": "db-screen" });
      var hd = h("div", { "class": "db-head" }, [logo()]);
      plain.slice(0, 5).forEach(function (i) { hd.appendChild(hot(P[i])); });
      var row = h("div", { "class": "db-row" }), search = h("div", { "class": "db-search" }, [row]);
      if (at(P, plain[5])) row.appendChild(hot(P[plain[5]], "db-box", "<span>" + P[plain[5]].label + "</span><b>Search</b>"));
      if (at(P, plain[6])) row.appendChild(hot(P[plain[6]], "db-filter", P[plain[6]].label + " ▾"));
      if (at(P, plain[7])) search.appendChild(hot(P[plain[7]], "db-adv"));
      var tabbar = h("div", { "class": "db-tabs" }), links = h("div", { "class": "db-links", "aria-hidden": "true" });
      function showLinks(i) { links.innerHTML = ""; P[i].links.forEach(function (t) { links.appendChild(h("span", { text: t })); }); }
      tabsI.forEach(function (i) { var b = hot(P[i], "db-tab"); tabbar.appendChild(b); b.addEventListener("click", function () { showLinks(i); }); });
      search.appendChild(tabbar); search.appendChild(links); if (tabsI.length) showLinks(tabsI[0]);
      var f = h("div", { "class": "db-foot" }, [h("span", { text: "Demonstration platform" })]);
      plain.slice(8).forEach(function (i) { f.appendChild(hot(P[i])); });
      fig.appendChild(hd); fig.appendChild(search); fig.appendChild(f);
      return fig;
    }
    /* screen 2: a results list. Order: the suggested answer, the filter rail (nested: its other
       facets), content type (nested: the types with counts), jurisdiction, source, the count, sort,
       search within results, then one result's title, citation line, snippet, citator flag, save,
       and the summarize button. */
    function resultsScreen(sc) {
      var P = sc.parts, fig = h("div", { "class": "db-screen" });
      var hd = h("div", { "class": "db-head" }, [logo(), h("span", { "class": "db-crumb", "aria-hidden": "true", text: "Cases › duty of care /s invitee /s park" })]);
      var side = h("div", { "class": "db-side" }), main = h("div", { "class": "db-main" });
      if (at(P, 1)) side.appendChild(hot(P[1], "db-facets", "<b>" + P[1].label + "</b>"));
      if (at(P, 2)) side.appendChild(hot(P[2], "db-facet db-types", "<b>" + P[2].label + " ▾</b>" + P[2].links.map(function (t) { var m = t.match(/^(.*?)\s*\((.*)\)$/); return "<span>" + (m ? m[1] + "<i>" + m[2] + "</i>" : t) + "</span>"; }).join("")));
      if (at(P, 3)) side.appendChild(hot(P[3], "db-facet", P[3].label + " ▾"));
      if (at(P, 4)) side.appendChild(hot(P[4], "db-facet", P[4].label + " ▾"));
      if (at(P, 1)) P[1].links.forEach(function (t) { side.appendChild(h("span", { "class": "db-facet quiet", "aria-hidden": "true", text: t + " ▾" })); });
      if (at(P, 0)) main.appendChild(hot(P[0], "db-answer", "<b>" + AI + P[0].label + "</b><span>Public land held open to visitors carries a duty to take some precautions against hazards the possessor should foresee; the duty does not depend on posted warnings. <u>Markowitz</u>; <u>Reyes</u>. Generated summary. Verify in the sources.</span>"));
      var bar = h("div", { "class": "db-resbar" });
      if (at(P, 5)) bar.appendChild(hot(P[5], "db-count"));
      if (at(P, 6)) bar.appendChild(hot(P[6], "db-sort", P[6].label + " ▾"));
      main.appendChild(bar);
      if (at(P, 7)) main.appendChild(hot(P[7], "db-within", "<span>" + P[7].label + "</span>"));
      var card = h("div", { "class": "db-result" }), top = h("div", { "class": "db-restop" });
      if (at(P, 11)) top.appendChild(hot(P[11], "db-flag", '<i class="flag red" aria-hidden="true"></i>' + P[11].label));
      if (at(P, 8)) top.appendChild(hot(P[8], "db-restitle"));
      if (at(P, 12)) top.appendChild(hot(P[12], "db-save", "☆ " + P[12].label));
      card.appendChild(top);
      if (at(P, 9)) card.appendChild(hot(P[9], "db-rescite"));
      if (at(P, 13)) card.appendChild(hot(P[13], "db-summ", AI + P[13].label));
      if (at(P, 10)) card.appendChild(hot(P[10], "db-snip"));
      main.appendChild(card);
      main.appendChild(h("div", { "class": "db-result ghost", "aria-hidden": "true", html: '<div class="db-restop"><span class="db-flagq"><i class="flag yellow"></i>Caution</span><span class="db-t">Reyes v. Pima County Parks Dep’t</span></div><div class="db-c">221 Ariz. 304, 211 P.3d 1183 (Ct. App. 2009)</div><div class="db-s">…the county’s duty to <mark>invitees</mark> at a public <mark>park</mark> extends to hazards it should discover…</div>' }));
      fig.appendChild(hd); fig.appendChild(h("div", { "class": "db-cols" }, [side, main])); fig.appendChild(foot(P, 14));
      return fig;
    }
    /* screen 3: one case. Order: caption, citator flag and treatment, synopsis, a headnote, the
       headnote's classification link, the opinion text, citing references, history, outline, copy
       with citation, add to folder, previous and next, search-term navigation, summarize. */
    function caseScreen(sc) {
      var P = sc.parts, fig = h("div", { "class": "db-screen" });
      var hd = h("div", { "class": "db-head" }, [logo()]);
      var tools = h("div", { "class": "db-tools" });
      if (at(P, 11)) tools.appendChild(hot(P[11], "db-tool", "‹ " + P[11].label + " ›"));
      if (at(P, 12)) tools.appendChild(hot(P[12], "db-tool"));
      if (at(P, 9)) tools.appendChild(hot(P[9], "db-tool"));
      if (at(P, 10)) tools.appendChild(hot(P[10], "db-tool", "☆ " + P[10].label));
      if (at(P, 13)) tools.appendChild(hot(P[13], "db-tool db-ai", AI + P[13].label));
      var body = h("div", { "class": "db-docbody" }), docc = h("div", { "class": "db-doc" }), side = h("div", { "class": "db-doctabs" });
      if (at(P, 0)) docc.appendChild(hot(P[0], "db-doctitle"));
      if (at(P, 1)) docc.appendChild(hot(P[1], "db-flag", '<i class="flag yellow" aria-hidden="true"></i>' + P[1].label));
      if (at(P, 2)) docc.appendChild(hot(P[2], "db-syn", "<b>Synopsis</b>" + P[2].label));
      if (at(P, 3) || at(P, 4)) {
        var hn = h("div", { "class": "db-headnote" }, [h("b", { text: "Headnote 1" })]);
        if (at(P, 4)) hn.appendChild(hot(P[4], "db-topic", P[4].label));
        if (at(P, 3)) hn.appendChild(hot(P[3], "db-hn", P[3].label));
        docc.appendChild(hn);
      }
      if (at(P, 5)) docc.appendChild(hot(P[5], "db-text", "<b>Opinion</b>" + P[5].label));
      [6, 7, 8].forEach(function (i) { if (at(P, i)) side.appendChild(hot(P[i], "db-doctab")); });
      body.appendChild(docc); body.appendChild(side);
      fig.appendChild(hd); fig.appendChild(tools); fig.appendChild(body); fig.appendChild(foot(P, 14));
      return fig;
    }
    /* screens 4 and 5: a statute or a regulation. Order: the hierarchy, the effective date, the
       section text, Notes of Decisions, History and versions, Citing references, Table of
       Contents, previous and next section, Outline, the source note, copy with citation. */
    function codeScreen(sc) {
      var P = sc.parts, fig = h("div", { "class": "db-screen" });
      var hd = h("div", { "class": "db-head" }, [logo()]);
      var tabs = h("div", { "class": "db-doctabs-top" }, [h("span", { "class": "db-doctab-top on", "aria-hidden": "true", text: "Document" })]);
      [3, 4, 5].forEach(function (i) { if (at(P, i)) tabs.appendChild(hot(P[i], "db-doctab-top", P[i].label + (i === 4 ? " ▾" : ""))); });
      var tools = h("div", { "class": "db-tools" });
      if (at(P, 6)) tools.appendChild(hot(P[6], "db-tool"));
      if (at(P, 7)) tools.appendChild(hot(P[7], "db-tool", "‹ § ›"));
      if (at(P, 8)) tools.appendChild(hot(P[8], "db-tool"));
      if (at(P, 10)) tools.appendChild(hot(P[10], "db-tool"));
      var docc = h("div", { "class": "db-doc" });
      if (at(P, 0)) docc.appendChild(hot(P[0], "db-crumbs", P[0].links.map(function (t, i) { return '<span style="padding-left:' + (i * 14) + 'px">' + t + "</span>"; }).join("") || P[0].label));
      if (at(P, 1)) docc.appendChild(hot(P[1], "db-eff"));
      if (at(P, 2)) docc.appendChild(hot(P[2], "db-text", "<b>" + (sc.name) + "</b>" + P[2].label));
      if (at(P, 9)) docc.appendChild(hot(P[9], "db-credit", "<b>Source</b>" + P[9].label));
      fig.appendChild(hd); fig.appendChild(tabs); fig.appendChild(tools); fig.appendChild(docc); fig.appendChild(foot(P, 11));
      return fig;
    }
    var byName = { start: startScreen, "start page": startScreen, results: resultsScreen, "case": caseScreen, document: caseScreen, statute: codeScreen, regulation: codeScreen };
    var figs = screens.map(function (sc, i) { return (byName[sc.name.toLowerCase()] || [startScreen, resultsScreen, caseScreen, codeScreen, codeScreen][i] || startScreen)(sc); });
    /* the browser chrome, with one tab per screen */
    var tid = (root.id || "db") + "-tab-", tabs = h("div", { "class": "db-wintabs", role: "tablist", "aria-label": "Screens of the demonstration database" }), tabBtns = screens.map(function (sc, i) {
      var b = h("button", { type: "button", role: "tab", id: tid + i, "aria-controls": tid + i + "-panel", "class": "db-wintab", "aria-selected": i ? "false" : "true", tabindex: i ? "-1" : "0", text: sc.name });
      b.addEventListener("click", function () { showScreen(i); });
      figs[i].id = tid + i + "-panel"; figs[i].setAttribute("role", "tabpanel"); figs[i].setAttribute("aria-labelledby", tid + i);
      return b;
    });
    tabBtns.forEach(function (b) { tabs.appendChild(b); });
    arrows(tabs, true);
    var bar = h("div", { "class": "db-bar" }, [h("i"), h("i"), h("i"), tabs, h("b", { text: "Demonstration" })]);
    var fig = h("div", { "class": "try-db", role: "group" }, [bar]);
    figs.forEach(function (f, i) { f.hidden = i > 0; fig.appendChild(f); });
    function showScreen(i) { figs.forEach(function (f, k) { f.hidden = k !== i; }); tabBtns.forEach(function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); }); }
    /* the find-it challenge */
    var find = opt(root, "find") ? splitBar(opt(root, "find")).map(function (x) { var m = x.match(/^(.*?)\s*=>\s*(.*)$/); return m ? { q: m[1], tag: m[2] } : null; }).filter(Boolean) : [];
    var actions = h("p", { "class": "try-actions" }), quiz = null;
    if (find.length) {
      var startBtn = h("button", { type: "button", "class": "try-btn ghost", text: "Test yourself: find it on the screen" });
      quiz = h("div", { "class": "db-quiz", role: "region", "aria-live": "polite", hidden: "" });
      var k = 0, right = 0;
      function tagOf(x) { return x.replace(/<[^>]+>/g, "").toLowerCase().replace(/\s+/g, " ").trim(); }
      function screenOf(tag) { for (var i = 0; i < screens.length; i++) { for (var j = 0; j < screens[i].parts.length; j++) if (tagOf(screens[i].parts[j].tag) === tagOf(tag)) return screens[i].name; } return ""; }
      function ask() {
        if (k >= find.length) { quiz.innerHTML = '<p class="good"><strong>' + right + " of " + find.length + " found on the first try.</strong> Every part you needed is somewhere on these screens, whichever platform you sit down at.</p>"; finding = null; return; }
        quiz.innerHTML = '<p><strong>Find it (' + (k + 1) + " of " + find.length + "):</strong> " + find[k].q + "</p>";
        var skip = h("button", { type: "button", "class": "try-btn small ghost", text: "Skip" }); skip.addEventListener("click", function () { k++; ask(); });
        quiz.appendChild(h("p", { "class": "try-actions" }, [skip]));
        finding = { tried: false, check: function (it) {
          if (tagOf(it.tag) === tagOf(find[k].tag)) {
            if (!finding.tried) right++; finding = null; k++;
            var nextBtn = h("button", { type: "button", "class": "try-btn small", text: k < find.length ? "Next one" : "See the score", onclick: ask });
            quiz.appendChild(h("p", { "class": "good", html: "<strong>Found it.</strong> " + it.tag + ". " })); quiz.appendChild(h("p", { "class": "try-actions" }, [nextBtn])); nextBtn.focus();
          }
          else { finding.tried = true; var sc = screenOf(find[k].tag); quiz.appendChild(h("p", { "class": "bad", html: "<strong>Not that one.</strong> That is the " + it.tag.toLowerCase().replace(/^the /, "") + ". " + (sc ? "Look on the " + sc + " screen." : "Try again.") })); }
        } };
      }
      startBtn.addEventListener("click", function () { var on = quiz.hidden; quiz.hidden = !on; startBtn.textContent = on ? "Stop the challenge" : "Test yourself: find it on the screen"; if (on) { k = 0; right = 0; ask(); } else finding = null; });
      actions.appendChild(startBtn);
    }
    var shell = h("div", { "class": "try-explore try-explore-database" }, [fig, panel]);
    screens[0].list.replaceWith(shell);
    screens.slice(1).forEach(function (sc) { sc.list.remove(); });
    shell.appendChild(counter); if (quiz) { shell.appendChild(actions); shell.appendChild(quiz); }
    counter.textContent = "0 of " + all.length + " parts explored";
  }

  /* ---- annotate: a passage with marked spans; select a span to read the note --------------
     Options on the block: parts="unlabeled" hides the part names in the passage, so the reader
     meets the document as it is printed and learns what each sentence is by selecting it.
     lenses="A | B" adds a switch that reads the same passage two ways; each mark then carries
     label/note for the first lens and label2/note2 for the second (hint2 for the second hint). */
  KINDS.annotate = function (root) {
    var marks = Array.prototype.slice.call(root.querySelectorAll(".m")); if (!marks.length) return;
    var cite = opt(root, "layout") === "cite", unlabeled = opt(root, "parts") === "unlabeled";
    var lenses = opt(root, "lenses") ? splitBar(opt(root, "lenses")) : [], lens = 0, current = null;
    var hints = [opt(root, "hint"), opt(root, "hint2"), opt(root, "hint3")];
    function sfx(k) { return k ? String(k + 1) : ""; }
    function L(m, k) { return opt(m, "label" + sfx(k)) || opt(m, "label"); }
    function N(m, k) { return opt(m, "note" + sfx(k)) || opt(m, "note"); }
    var panel = h("div", { "class": "try-panel", role: "region", "aria-live": "polite", "aria-label": "Explanation: " + (opt(root, "title") || ""), html: '<p class="try-hint">Select a highlighted part. Its explanation appears here.</p>' });
    var count = h("p", { "class": "try-score", role: "status", "aria-live": "polite" }), seen = lenses.length ? lenses.map(function () { return 0; }) : [0], head = root.querySelector(".try-head");
    if (cite) root.classList.add("try-cite");
    if (unlabeled) root.classList.add("try-unlabeled");
    /* the passage sits in a document card; the explanation stays beside it (or, on a small screen,
       opens directly under the part that was selected) so the reader never has to hunt for it */
    var doc = h("div", { "class": "try-doc" }), side = h("div", { "class": "try-side" }, [panel, count]);
    Array.prototype.slice.call(root.children).forEach(function (c) { if (c !== head) doc.appendChild(c); });
    root.appendChild(h("div", { "class": cite ? "try-under" : "try-two" }, [doc, side]));
    var lead = h("p", { "class": "try-lead", text: hints[0] });
    if (hints[0]) head.insertAdjacentElement("afterend", lead);
    if (lenses.length > 1) {
      /* the lens switch: the same passage, read for a different purpose */
      var seg = h("div", { "class": "try-seg try-lens", role: "group", "aria-label": "Read it" }), segBtns = lenses.map(function (name, k) {
        var b = h("button", { type: "button", "class": "try-btn" + (k ? " ghost" : ""), "aria-pressed": k ? "false" : "true", text: name });
        b.addEventListener("click", function () { setLens(k); });
        return b;
      });
      segBtns.forEach(function (b) { seg.appendChild(b); }); arrows(seg);
      (hints[0] ? lead : head).insertAdjacentElement("afterend", h("p", { "class": "try-actions" }, [h("span", { "class": "try-read", text: "Read it:" }), seg]));
    }
    function setLens(k) {
      lens = k;
      if (segBtns) segBtns.forEach(function (b, i) { b.setAttribute("aria-pressed", i === k ? "true" : "false"); b.classList.toggle("ghost", i !== k); });
      marks.forEach(function (x) { x.classList.toggle("seen", !!x._seen[k]); });
      if (hints[k]) lead.textContent = hints[k];
      if (current) show(current); else panel.innerHTML = '<p class="try-hint">Select a highlighted part. Its explanation appears here.</p>';
      tally();
    }
    function tally() { count.textContent = seen[lens] + " of " + marks.length + " read" + (lenses.length > 1 ? " (" + lenses[lens] + ")" : ""); }
    var narrow = window.matchMedia("(max-width: 820px)");
    function show(m) {
      var label = L(m, lens), note = N(m, lens), verdict = opt(m, "verdict");
      if (!m._seen[lens]) { m._seen[lens] = true; seen[lens]++; }
      m.classList.add("seen");
      if (verdict) m.classList.add("v-" + verdict);
      /* a verdict colours the mark; the word beside the label carries it for anyone who does not see the colour */
      var word = { ok: "sound", warn: "caution", bad: "problem" }[verdict];
      panel.innerHTML = (label || word ? '<p class="try-panel-h">' + (label || "") + (word ? " <small>" + word + "</small>" : "") + "</p>" : "") + "<p>" + note + "</p>";
      tally();
      if (!cite) { if (narrow.matches) (m.closest("p,blockquote,li") || m).insertAdjacentElement("afterend", panel); else side.insertBefore(panel, count); }
    }
    marks.forEach(function (m) {
      var label = opt(m, "label"), par = m.parentElement;
      m._seen = {};
      m.setAttribute("role", "button"); m.setAttribute("tabindex", "0"); m.setAttribute("aria-pressed", "false");
      if (label && cite) {
        var tok = h("span", { "class": "tok" }); while (m.firstChild) tok.appendChild(m.firstChild);
        m.appendChild(tok); m.appendChild(h("small", { text: label }));
        if (opt(m, "pull")) m.classList.add("pull");
      } else if (label && par && par.tagName === "P" && par.textContent.trim() === m.textContent.trim()) {
        m.classList.add("blk"); par.classList.add("part");
        if (!unlabeled) par.insertBefore(h("span", { "class": "m-label", text: label }), m);   /* a whole part of the document: name it, as the page of an opinion would */
      }
      function open() {
        marks.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        m.setAttribute("aria-pressed", "true"); current = m;
        show(m);
      }
      m.addEventListener("click", open);
      m.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    tally();
    if (cite && opt(root, "pull")) {
      /* which parts you type to retrieve the document: a toggle outlines them and shows the string */
      var pullBtn = h("button", { type: "button", "class": "try-btn ghost small", "aria-pressed": "false", text: "Show what you type to retrieve it" });
      var pullOut = h("p", { "class": "try-pull", role: "status", hidden: "" });
      pullBtn.addEventListener("click", function () {
        var on = !root.classList.contains("pull-on"); root.classList.toggle("pull-on", on);
        pullBtn.setAttribute("aria-pressed", String(on)); pullOut.hidden = !on;
        pullOut.innerHTML = on ? "Type into the search box: <code>" + opt(root, "pull") + "</code>. The outlined parts are the address; the rest is description." : "";
      });
      side.appendChild(h("p", { "class": "try-actions" }, [pullBtn])); side.appendChild(pullOut);
    }
  };

  /* ---- checklist: tick boxes that remember ------------------------------------------------ */
  KINDS.checklist = function (root, idx) {
    var list = topList(root); if (!list) return;
    var key = "qm:" + location.pathname + ":check:" + idx, state = store.get(key, {});
    var score = h("p", { "class": "try-score", role: "status", "aria-live": "polite" });
    var wrap = h(list.tagName.toLowerCase(), { "class": "try-check" + (kids(list, "li").length > 6 ? " cols" : "") }), boxes = [];
    kids(list, "li").forEach(function (li, i) {
      var id = "qmc-" + idx + "-" + i, cb = h("input", { type: "checkbox", id: id });
      cb.checked = !!state[i]; boxes.push(cb);
      cb.addEventListener("change", function () { state[i] = cb.checked; store.set(key, state); tally(); });
      var extra = fb(li), text = own(li), m = text.match(/^<strong>(.*?)<\/strong>\s*([\s\S]*)$/);
      if (m && m[2]) { text = m[1].replace(/[.:]\s*$/, ""); extra = m[2] + (extra ? "<br>" + extra : ""); }   /* bold lead is the label; the rest is the detail */
      wrap.appendChild(h("li", {}, [cb, h("label", { "for": id, html: text }), extra ? h("div", { "class": "try-why", html: extra }) : null]));
    });
    function tally() { var n = boxes.filter(function (b) { return b.checked; }).length; score.textContent = n + " of " + boxes.length + " done" + (n === boxes.length ? ". Complete." : ""); }
    list.replaceWith(wrap);
    wrap.insertAdjacentElement("afterend", h("p", { "class": "try-actions" }, [score, h("button", { type: "button", "class": "try-btn ghost", text: "Clear", onclick: function () { boxes.forEach(function (b) { b.checked = false; }); state = {}; store.set(key, state); tally(); } })]));
    tally();
  };

  /* ---- reveal: commit to an answer, then compare ------------------------------------------- */
  KINDS.reveal = function (root, idx) {
    var hr = kids(root, "hr")[0]; if (!hr) return;
    var key = "qm:" + location.pathname + ":reveal:" + idx, ans = h("div", { "class": "try-answer", hidden: "" }), n;
    while ((n = hr.nextSibling)) ans.appendChild(n);
    var ta = h("textarea", { rows: "3", "aria-label": "Your answer" + (opt(root, "title") ? ": " + opt(root, "title") : ""), placeholder: opt(root, "placeholder") || "Write your answer first. It stays in this browser." });
    ta.value = store.get(key, ""); ta.addEventListener("input", function () { store.set(key, ta.value); });
    var btn = h("button", { type: "button", "class": "try-btn", "aria-expanded": "false", text: opt(root, "button") || "Compare with a model answer" });
    btn.addEventListener("click", function () { var open = ans.hidden; ans.hidden = !open; btn.setAttribute("aria-expanded", String(open)); btn.textContent = open ? "Hide the model answer" : (opt(root, "button") || "Compare with a model answer"); });
    hr.replaceWith(h("div", {}, [ta, h("p", { "class": "try-actions" }, [btn]), ans]));
  };

  /* ---- tokens: watch a sentence get predicted one piece at a time --------------------------- */
  KINDS.tokens = function (root) {
    var list = topList(root); if (!list) return;
    var steps = kids(list, "li").map(function (li) {
      var note = fb(li);
      return { note: note, cands: strip(own(li)).split(/\s*;\s*/).map(function (c) { var m = c.match(/^(.*?)\s+(\d+)%$/); return m ? { t: m[1], p: +m[2] } : { t: c, p: 0 }; }) };
    });
    var i = 0, line = h("p", { "class": "try-line" }), bars = h("div", { "class": "try-bars" }), out = live();
    var start = opt(root, "start");
    var next = h("button", { type: "button", "class": "try-btn", text: "Predict the next piece" });
    var reset = h("button", { type: "button", "class": "try-btn ghost", text: "Start over" });
    function draw() {
      line.innerHTML = "<span>" + start + "</span>" + steps.slice(0, i).map(function (s) { return " <mark>" + s.cands[0].t + "</mark>"; }).join("") + (i < steps.length ? ' <span class="try-caret">▁</span>' : "");
      bars.innerHTML = "";
      if (i < steps.length) steps[i].cands.forEach(function (c, k) {
        bars.appendChild(h("div", { "class": "try-bar" + (k === 0 ? " top" : "") }, [h("span", { text: c.t }), h("i", { style: "width:" + c.p + "%" }), h("b", { text: c.p + "%" })]));
      });
      out.innerHTML = i > 0 ? "<p><strong>Predicted:</strong> " + steps[i - 1].cands[0].t + " (" + steps[i - 1].cands[0].p + "%)." + (steps[i - 1].note ? " " + steps[i - 1].note : "") + "</p>" : "";
      next.disabled = i >= steps.length;
      next.textContent = i >= steps.length ? "Done" : "Predict the next piece";
    }
    next.addEventListener("click", function () { if (i < steps.length) { i++; draw(); } });
    reset.addEventListener("click", function () { i = 0; draw(); });
    list.replaceWith(h("div", { "class": "try-tokens" }, [line, h("p", { "class": "try-hint", text: "Candidates for the next piece, with the model's probability for each:" }), bars, h("p", { "class": "try-actions" }, [next, reset])]));
    root.appendChild(out); draw();
  };

  /* ---- flashcards: a definition list you can flip through and filter ------------------------ */
  KINDS.flashcards = function (root) {
    var dl = root.querySelector("dl"); if (!dl) return;
    var cards = [], dts = dl.querySelectorAll("dt");
    Array.prototype.forEach.call(dts, function (dt) { var dd = dt.nextElementSibling; cards.push({ dt: dt, dd: dd, t: dt.innerHTML, d: dd ? dd.innerHTML : "" }); });
    var pool = cards.slice(), i = 0, flipped = false;
    var face = h("button", { type: "button", "class": "try-card", "aria-live": "polite" });
    var pos = h("span", { "class": "try-score", role: "status" });
    function flat(x) { return x.replace(/<a\b[^>]*>/g, "").replace(/<\/a>/g, ""); }   /* the full list below keeps the links */
    function draw() {
      if (!pool.length) { face.innerHTML = "<span>No term matches.</span>"; pos.textContent = ""; return; }
      var c = pool[i];
      face.innerHTML = flipped ? '<small>' + strip(c.t) + "</small><span class=\"def\">" + flat(c.d) + "</span>" : "<strong>" + flat(c.t) + "</strong><small>Select to see the definition</small>";
      pos.textContent = (i + 1) + " of " + pool.length;
    }
    face.addEventListener("click", function () { flipped = !flipped; draw(); });
    function go(d) { if (!pool.length) return; i = (i + d + pool.length) % pool.length; flipped = false; draw(); }
    var filter = h("input", { type: "search", placeholder: "Filter terms", "aria-label": "Filter terms" });
    filter.addEventListener("input", function () {
      var q = filter.value.toLowerCase();
      pool = cards.filter(function (c) { var hit = !q || (strip(c.t) + " " + strip(c.d)).toLowerCase().indexOf(q) >= 0; c.dt.hidden = !hit; if (c.dd) c.dd.hidden = !hit; return hit; });
      i = 0; flipped = false; draw();
    });
    var bar = h("p", { "class": "try-actions" }, [
      h("button", { type: "button", "class": "try-btn ghost", text: "← Previous", onclick: function () { go(-1); } }),
      h("button", { type: "button", "class": "try-btn ghost", text: "Next →", onclick: function () { go(1); } }),
      h("button", { type: "button", "class": "try-btn ghost", text: "Shuffle", onclick: function () { var o = shuffled(pool.length, Date.now() % 997); pool = o.map(function (k) { return pool[k]; }); i = 0; flipped = false; draw(); } }),
      pos, filter]);
    dl.insertAdjacentElement("beforebegin", face); dl.insertAdjacentElement("beforebegin", bar);
    dl.classList.add("glosslist"); root.insertAdjacentElement("afterend", dl);   /* the full list reads as page text, below the cards */
    draw();
  };

  /* ---- switch: one table, read under different conditions. The reader changes the setting and
          watches every row change with it. Written as a table: first column the rows, each further
          column a setting; a cell may open with a bold status ("**Binding.** why"). ------------------- */
  KINDS["switch"] = function (root) {
    var table = root.querySelector("table"); if (!table) return;
    var heads = Array.prototype.slice.call(table.querySelectorAll("thead th")), rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
    if (heads.length < 3) return;
    var settings = heads.slice(1).map(function (th) { return th.innerHTML; }), seen = [];
    var data = rows.map(function (tr) {
      var tds = tr.children;
      return { item: tds[0].innerHTML, cells: Array.prototype.slice.call(tds, 1).map(function (td) {
        var c = td.cloneNode(true), st = c.querySelector("strong"), status = "";
        if (st && c.textContent.trim().indexOf(st.textContent.trim()) === 0) { status = st.textContent.replace(/[.:]\s*$/, "").trim(); st.remove(); if (seen.indexOf(status) < 0) seen.push(status); }
        return { status: status, note: c.innerHTML.trim() };
      }) };
    });
    var seg = h("div", { "class": "try-seg", role: "group", "aria-label": opt(root, "label") || heads[0].textContent }), list = h("ul", { "class": "try-switch" }), sum = h("p", { "class": "try-score", role: "status", "aria-live": "polite" });
    function pick(k) {
      Array.prototype.forEach.call(seg.children, function (b, i) { b.setAttribute("aria-pressed", String(i === k)); });
      list.innerHTML = ""; var count = {};
      data.forEach(function (r) {
        var c = r.cells[k] || { status: "", note: "" }; if (c.status) count[c.status] = (count[c.status] || 0) + 1;
        list.appendChild(h("li", { "class": c.status ? "s" + seen.indexOf(c.status) : "" }, [
          h("div", { "class": "try-item", html: r.item }),
          c.status ? h("span", { "class": "try-status", text: c.status }) : null,
          h("div", { "class": "try-why", html: c.note })]));
      });
      sum.textContent = seen.length ? seen.filter(function (x) { return count[x]; }).map(function (x) { return count[x] + " " + x.toLowerCase(); }).join(", ") + "." : "";
    }
    settings.forEach(function (t, i) { seg.appendChild(h("button", { type: "button", html: t, onclick: function () { pick(i); } })); }); arrows(seg);
    var wrap = table.closest(".table-wrap") || table;
    wrap.replaceWith(h("div", {}, [h("p", { "class": "try-hint", text: opt(root, "label") || heads[0].textContent }), seg, list, sum]));
    pick(0);
  };

  /* ---- search: a small corpus and a working terms-and-connectors engine ------------------------ */
  KINDS.search = function (root) {
    var list = topList(root); if (!list) return;
    var STOP = "a an and are as at be but by can do does for from has have how i in is it my of on or that the their this to was what when which who will with under me you your our they them she her his him having because there".split(" ");
    var docs = kids(list, "li").map(function (li) {
      var c = li.cloneNode(true), st = c.querySelector("strong"), title = st ? st.textContent.replace(/[.:]\s*$/, "") : "", rel = false, m;
      if (st) st.remove();
      if ((m = title.match(/^(.*?)\s*\|\s*(.*)$/))) { title = m[1]; rel = /on point|relevant/i.test(m[2]) && !/off|not/i.test(m[2]); }
      var paras = kids(c, "p").map(function (p) { return p.textContent.trim(); }).filter(Boolean);
      if (!paras.length) paras = [c.textContent.trim()];
      var words = [], pi, si = 0;
      for (pi = 0; pi < paras.length; pi++) {
        paras[pi].split(/(?<=[.?!])\s+/).forEach(function (sent) {
          sent.replace(/[A-Za-z0-9§'’-]+|[^A-Za-z0-9§'’\s-]+|\s+/g, function (tok) {
            words.push({ raw: tok, w: /[A-Za-z0-9]/.test(tok) ? tok.toLowerCase().replace(/[’']s$/, "").replace(/[’']/g, "") : null, s: si, p: pi });
            return tok;
          });
          words.push({ raw: " ", w: null, s: si, p: pi }); si++;
        });
        words.push({ raw: "\n", w: null, s: si, p: pi });
      }
      var seq = []; words.forEach(function (t, k) { if (t.w) { t.i = seq.length; seq.push(k); } });
      return { title: title, rel: rel, words: words, seq: seq };
    });
    function termRe(t) {
      t = t.toLowerCase().replace(/[’']/g, "");
      var bang = /!$/.test(t); t = t.replace(/!$/, "");
      return new RegExp("^" + t.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[a-z0-9]") + (bang ? "[a-z0-9-]*" : "") + "$");
    }
    /* tokenise and parse: OR binds tightest, then proximity, then AND, then NOT (Westlaw's order) */
    function lex(q) {
      var out = [], m, re = /\s*(\(|\)|"[^"]*"|“[^”]*”|\/\d+|\/[sp]\b|\+\d+|\+[sp]\b|pre\/\d+|w\/\d+|&|%|[^\s()"]+)/gi;
      while ((m = re.exec(q))) {
        var t = m[1], u = t.toUpperCase();
        if (t === "(" || t === ")") out.push({ k: t });
        else if (u === "AND" || t === "&") out.push({ k: "AND" });
        else if (u === "OR") out.push({ k: "OR" });
        else if (u === "NOT" || t === "%") { if (out.length && out[out.length - 1].k === "AND" && u === "NOT") out.pop(); out.push({ k: "NOT" }); }
        else if (u === "BUT") continue;
        else if (/^(\/|w\/)\d+$/i.test(t)) out.push({ k: "PROX", n: +t.replace(/\D/g, ""), ord: false });
        else if (/^(\+|pre\/)\d+$/i.test(t)) out.push({ k: "PROX", n: +t.replace(/\D/g, ""), ord: true });
        else if (/^[\/+][sp]$/i.test(t)) out.push({ k: "PROX", unit: t[1].toLowerCase(), ord: t[0] === "+" });
        else if (/^["“]/.test(t)) out.push({ k: "T", phrase: t.slice(1, -1).trim().split(/\s+/).filter(Boolean).map(termRe), txt: '"' + t.slice(1, -1) + '"' });
        else out.push({ k: "T", phrase: [termRe(t)], txt: t });
      }
      return out;
    }
    function parse(toks) {
      var i = 0;
      function atom() {
        var t = toks[i];
        if (!t) return null;
        if (t.k === "(") { i++; var e = notx(); if (toks[i] && toks[i].k === ")") i++; return e; }
        if (t.k === "T") { i++; return t; }
        return null;
      }
      function orx() { var l = atom(), r; if (!l) return null; while (toks[i] && (toks[i].k === "OR" || toks[i].k === "T" || toks[i].k === "(")) { if (toks[i].k === "OR") i++; r = atom(); if (!r) break; l = { k: "OR", l: l, r: r }; } return l; }
      function prox() { var l = orx(), op, r; while (l && toks[i] && toks[i].k === "PROX") { op = toks[i++]; r = orx(); if (!r) break; l = { k: "PROX", op: op, l: l, r: r }; } return l; }
      function andx() { var l = prox(), r; while (l && toks[i] && toks[i].k === "AND") { i++; r = prox(); if (!r) break; l = { k: "AND", l: l, r: r }; } return l; }
      function notx() { var l = andx(), r; while (l && toks[i] && toks[i].k === "NOT") { i++; r = andx(); if (!r) break; l = { k: "NOT", l: l, r: r }; } return l; }
      return notx();
    }
    function show(n) {
      if (!n) return "";
      if (n.k === "T") return n.txt;
      var op = n.k === "PROX" ? (n.op.unit ? (n.op.ord ? "+" : "/") + n.op.unit : (n.op.ord ? "+" : "/") + n.op.n) : n.k;
      function par(c) { return c.k === "T" || c.k === n.k ? show(c) : "(" + show(c) + ")"; }
      return par(n.l) + " " + op + " " + par(n.r);
    }
    var UNIT = { s: 15, p: 50 };
    function uniq(a) { var s = {}, o = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }
    function run(n, d) {            /* returns the word indexes (into d.seq) that satisfy the node, or [] */
      var a, b, out = [];
      if (n.k === "T") {
        for (var s = 0; s + n.phrase.length <= d.seq.length; s++) {
          for (var j = 0; j < n.phrase.length && n.phrase[j].test(d.words[d.seq[s + j]].w); j++) {}
          if (j === n.phrase.length) for (j = 0; j < n.phrase.length; j++) out.push(s + j);
        }
        return uniq(out);
      }
      a = run(n.l, d); b = run(n.r, d);
      if (n.k === "OR") return uniq(a.concat(b));
      if (n.k === "AND") return a.length && b.length ? uniq(a.concat(b)) : [];
      if (n.k === "NOT") return b.length ? [] : a;
      a.forEach(function (x) { b.forEach(function (y) {
        var wx = d.words[d.seq[x]], wy = d.words[d.seq[y]], ok;
        /* /s and /p are not sentence or paragraph tests. On a real platform each is shorthand for a
           word distance the vendor does not publish; the lab uses stand-in distances and says so. */
        ok = Math.abs(y - x) <= (n.op.unit ? UNIT[n.op.unit] : n.op.n);
        if (ok && n.op.ord) ok = y > x;
        if (ok && x !== y) { out.push(x); out.push(y); }
      }); });
      return uniq(out);
    }
    function natural(q, d) {
      var terms = uniq(q.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(function (t) { return t.length > 2 && STOP.indexOf(t) < 0; }));
      var hits = [], distinct = 0;
      terms.forEach(function (t) {
        var stem = t.length > 4 ? t.replace(/(ing|ed|es|s)$/, "") : t, found = false;
        d.seq.forEach(function (k, i) { if (d.words[k].w.indexOf(stem) === 0) { hits.push(i); found = true; } });
        if (found) distinct++;
      });
      return { hits: uniq(hits), score: terms.length ? distinct / terms.length : 0, n: terms.length };
    }
    var presets = splitBar(opt(root, "queries")), nat = splitBar(opt(root, "natural"));
    var mode = "tc", input = h("input", { type: "text", "class": "try-q", "aria-label": "Your search", spellcheck: "false", autocomplete: "off" });
    var read = h("p", { "class": "try-read" }), stats = h("p", { "class": "try-score", role: "status", "aria-live": "polite" }), res = h("ol", { "class": "try-results" });
    var modeBar = h("div", { "class": "try-seg", role: "group", "aria-label": "Search mode" }); arrows(modeBar);
    var chipBar = h("div", { "class": "try-chips", hidden: "" }), build = h("div", { "class": "try-build", role: "group", "aria-label": "Add a connector to your search" });
    var exBtn = h("button", { type: "button", "class": "try-btn ghost small", "aria-expanded": "false", text: "Show example searches" });
    exBtn.addEventListener("click", function () { var open = chipBar.hidden; chipBar.hidden = !open; exBtn.setAttribute("aria-expanded", String(open)); exBtn.textContent = open ? "Hide example searches" : "Show example searches"; });
    function insert(tok, caretBack) {          /* drop a connector in at the cursor */
      var a = input.selectionStart === null ? input.value.length : input.selectionStart, b = input.selectionEnd === null ? a : input.selectionEnd, v = input.value;
      var sel = v.slice(a, b), piece = tok === '""' ? '"' + sel + '"' : tok === "()" ? "(" + sel + ")" : tok === "!" ? "!" : (a && v[a - 1] !== " " && v[a - 1] !== "(" ? " " : "") + tok + " ";
      input.value = v.slice(0, a) + piece + v.slice(b);
      var pos = a + piece.length - ((tok === '""' || tok === "()") && !sel ? 1 : 0);
      input.focus(); input.setSelectionRange(pos, pos); go();
    }
    [["AND", "both terms"], ["OR", "either term"], ["NOT", "exclude a term"], ['""', "exact phrase"], ["()", "group terms"], ["!", "any ending"], ["/5", "within 5 words"], ["/s", "close together"], ["/p", "loosely together"]].forEach(function (x) {
      build.appendChild(h("button", { type: "button", "class": "try-chip", title: x[1], "aria-label": "Add " + (x[0] === '""' ? "quotation marks" : x[0] === "()" ? "parentheses" : x[0]) + ": " + x[1], text: x[0] === '""' ? '" "' : x[0] === "()" ? "( )" : x[0], onclick: function () { insert(x[0]); } }));
    });
    build.appendChild(h("button", { type: "button", "class": "try-chip", text: "Clear", onclick: function () { input.value = ""; input.focus(); go(); } }));
    function setMode(m) {
      mode = m;
      Array.prototype.forEach.call(modeBar.children, function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-m") === m)); });
      chipBar.innerHTML = "";
      (m === "nl" ? nat : presets).forEach(function (q) { chipBar.appendChild(h("button", { type: "button", "class": "try-chip", text: q, onclick: function () { input.value = q; go(); } })); });
      build.hidden = m === "nl";
      input.placeholder = m === "nl" ? "Describe the issue in plain words" : "Type terms, and add connectors with the buttons below";
    }
    if (nat.length) {
      [["nl", "Natural language"], ["tc", "Terms and connectors"]].forEach(function (x) { modeBar.appendChild(h("button", { type: "button", "data-m": x[0], text: x[1], onclick: function () { setMode(x[0]); input.value = ""; go(); input.focus(); } })); });
    }
    function go() {
      var q = input.value.trim(), rows = [], tree = null;
      res.innerHTML = ""; read.textContent = "";
      if (!q) { stats.textContent = docs.length + " documents in this practice database. " + (mode === "nl" ? "Describe the problem in your own words." : "Build a search, or open the examples."); return; }
      if (mode === "tc") { tree = parse(lex(q)); if (!tree) { stats.textContent = "The lab could not read that search."; return; } read.textContent = "Read as: " + show(tree) + (/[\/+][sp]\b/i.test(q) ? "   (in this lab /s stands in for /" + UNIT.s + " and /p for /" + UNIT.p + "; real platforms do not publish their numbers)" : ""); }
      docs.forEach(function (d) {
        var r = mode === "nl" ? natural(q, d) : { hits: run(tree, d), score: 1 };
        rows.push({ d: d, hits: r.hits, score: r.hits.length ? r.score : 0 });
      });
      var got = rows.filter(function (r) { return r.hits.length; }), relAll = docs.filter(function (d) { return d.rel; }).length;
      if (mode === "nl") got.sort(function (a, b) { return b.score - a.score || b.hits.length - a.hits.length; });
      var relGot = got.filter(function (r) { return r.d.rel; }).length;
      stats.innerHTML = "<strong>" + got.length + " of " + docs.length + "</strong> documents retrieved" + (mode === "nl" ? ", ranked by the engine's guess at relevance" : "") + "." +
        (relAll ? " On point: <strong>" + relGot + " of the " + relAll + "</strong> on-point documents" + (got.length ? "; " + (got.length - relGot) + " result" + (got.length - relGot === 1 ? "" : "s") + " off point." : ".") : "");
      got.forEach(function (r) {
        var hit = {}; r.hits.forEach(function (i) { hit[r.d.seq[i]] = 1; });
        var first = r.hits.length ? Math.min.apply(null, r.hits) : 0, sIdx = r.d.words[r.d.seq[first]].s, html = "";
        r.d.words.forEach(function (t, k) {
          if (Math.abs(t.s - sIdx) > 1 && !(mode === "tc" && hasHitIn(r, t.s))) return;
          html += hit[k] ? "<mark>" + esc(t.raw) + "</mark>" : esc(t.raw);
        });
        res.appendChild(h("li", { "class": r.d.rel ? "rel" : "" }, [h("p", { "class": "r-t", html: esc(r.d.title) + (relAll ? ' <small class="' + (r.d.rel ? "on" : "off") + '">' + (r.d.rel ? "on point" : "off point") + "</small>" : "") }), h("p", { "class": "r-x", html: html.trim() })]));
      });
      var miss = rows.filter(function (r) { return !r.hits.length; });
      if (miss.length) res.appendChild(h("li", { "class": "missed" }, [h("p", { "class": "r-t", html: "Not retrieved: " + miss.map(function (r) { return esc(r.d.title) + (r.d.rel ? ' <small class="on">on point</small>' : ""); }).join("; ") })]));
    }
    function hasHitIn(r, s) { return r.hits.some(function (i) { return r.d.words[r.d.seq[i]].s === s; }); }
    function esc(s) { return s.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
    var t; input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(go, 150); });
    var ui = h("div", { "class": "try-search" }, [nat.length ? modeBar : null,
      h("form", { onsubmit: function (e) { e.preventDefault(); go(); } }, [input, h("button", { type: "submit", "class": "try-btn", text: "Search" })]),
      build, h("p", { "class": "try-actions" }, [exBtn]), chipBar, read, stats, res,
      h("p", { "class": "try-fiction", text: "The cases in this practice database are fictional. They were written for instruction only and are not real authority." })]);
    list.replaceWith(ui);
    setMode(nat.length ? "nl" : "tc"); go();
  };

  Array.prototype.forEach.call(blocks, function (root, idx) {
    var k = root.getAttribute("data-kind");
    if (!KINDS[k]) return;
    /* the block as written (answers beside the items) is kept, hidden, so that the page prints as text */
    var print = h("div", { "class": "try-print", hidden: "" });
    Array.prototype.forEach.call(root.children, function (c) { if (!c.classList.contains("try-head")) print.appendChild(c.cloneNode(true)); });
    try { KINDS[k](root, idx); root.classList.add("live"); root.appendChild(print); } catch (e) { if (window.console) console.error("interactive failed:", k, e); }
  });
})();

/* 7. Defined terms: the glossary definition opens on hover, keyboard focus, or tap. It stays open while
      the pointer is on it and closes with Escape. */
(function () {
  var terms = document.querySelectorAll(".gloss[data-def]");
  if (!terms.length) return;
  var tip = document.createElement("div"), cur = null, timer = null;
  tip.className = "gloss-tip"; tip.id = "gloss-tip"; tip.setAttribute("role", "tooltip"); tip.hidden = true;
  (document.querySelector("main") || document.body).appendChild(tip);
  function show(t) {
    clearTimeout(timer); cur = t;
    tip.textContent = t.getAttribute("data-def"); tip.hidden = false;
    var r = t.getBoundingClientRect(), w = Math.min(520, window.innerWidth - 24);
    tip.style.width = w + "px";
    tip.style.left = Math.max(12, Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - w - 12)) + "px";
    var below = r.bottom + 8 + tip.offsetHeight < window.innerHeight - 60;
    tip.style.top = (below ? r.bottom + window.scrollY + 8 : r.top + window.scrollY - tip.offsetHeight - 8) + "px";
    t.setAttribute("aria-describedby", "gloss-tip");
  }
  function hide() { if (cur) cur.removeAttribute("aria-describedby"); cur = null; tip.hidden = true; }
  function later() { clearTimeout(timer); timer = setTimeout(hide, 180); }
  Array.prototype.forEach.call(terms, function (t) {
    t.addEventListener("mouseenter", function () { show(t); });
    t.addEventListener("mouseleave", later);
    if (t.closest("button, a, [role=button]")) return;      /* a control may not contain another tab stop; the control's own focus still reads the term */
    t.setAttribute("tabindex", "0");
    t.addEventListener("focus", function () { show(t); });
    t.addEventListener("blur", later);
    t.addEventListener("click", function (e) { e.stopPropagation(); if (cur === t && !tip.hidden) hide(); else show(t); });
  });
  tip.addEventListener("mouseenter", function () { clearTimeout(timer); });
  tip.addEventListener("mouseleave", later);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
  document.addEventListener("click", function (e) { if (!tip.contains(e.target)) hide(); });
})();
