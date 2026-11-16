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
      return { html: html, bin: bin, fb: fb(li) };
    });
    var bins = splitBar(opt(root, "bins"));
    if (!bins.length) items.forEach(function (it) { if (bins.indexOf(it.bin) < 0) bins.push(it.bin); });
    var done = 0, score = h("p", { "class": "try-score", role: "status", "aria-live": "polite" });
    var wrap = h("ol", { "class": "try-sort" });
    function tally() { score.textContent = done + " of " + items.length + " placed" + (done === items.length ? ". All sorted." : ""); }
    shuffled(items.length, idx + 3).forEach(function (k) {
      var it = items[k], misses = 0, note = h("div", { "class": "try-note" });
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
          } else {
            btn.classList.add("no"); btn.disabled = true; misses++;
            note.innerHTML = '<p class="bad">Not ' + b.toLowerCase() + ". " + (misses > 1 ? "Look at what the item <em>is</em> before what it is about. " : "") + "Try again.</p>";
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
          h("span", { "class": "try-move" }, [
            h("button", { type: "button", "aria-label": "Move up", disabled: i === 0 ? "" : null, text: "↑", onclick: function () { swap(i, i - 1); } }),
            h("button", { type: "button", "aria-label": "Move down", disabled: i === cur.length - 1 ? "" : null, text: "↓", onclick: function () { swap(i, i + 1); } })
          ]),
          h("div", { "class": "try-item", html: it.html + (checked && allRight() && it.fb ? '<span class="try-why">' + it.fb + "</span>" : "") })
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
        : '<p class="bad"><strong>' + n + " of " + cur.length + " in place.</strong> The highlighted rows are right where they are. Move the others and check again.</p>";
    } })]));
    root.appendChild(out);
  };

  /* ---- explore: a diagram or set of parts; select one to read about it ------------------- */
  KINDS.explore = function (root) {
    var list = topList(root); if (!list) return;
    var layout = opt(root, "layout") || "tabs";
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
    } else if (layout === "database") {
      /* A generic legal database. Every control is one item of the list, in this order: five header
         tools, the search box, the filter, advanced search, the browse tabs (items that carry a
         nested list, shown as that tab's collections), and the support link. */
      var tabsI = [], plain = [];
      items.forEach(function (it, i) {
        var d = document.createElement("div"); d.innerHTML = it.body; var ul = d.querySelector("ul");
        if (ul) { it.links = Array.prototype.map.call(ul.children, function (li) { return li.textContent; }); ul.remove(); it.body = d.innerHTML; tabsI.push(i); } else plain.push(i);
        btns[i].className = "hot"; btns[i].innerHTML = it.label;
      });
      var links = h("div", { "class": "db-links", "aria-hidden": "true" });
      var head = h("div", { "class": "db-head" }, [h("span", { "class": "db-logo", html: "<em>LR</em>LegalResearch" })]);
      plain.slice(0, 5).forEach(function (i) { head.appendChild(btns[i]); });
      var row = h("div", { "class": "db-row" }), search = h("div", { "class": "db-search" }, [row]);
      if (plain[5] !== undefined) { btns[plain[5]].className = "hot db-box"; btns[plain[5]].innerHTML = "<span>" + items[plain[5]].label + "</span><b>Search</b>"; row.appendChild(btns[plain[5]]); }
      if (plain[6] !== undefined) { btns[plain[6]].className = "hot db-filter"; btns[plain[6]].innerHTML = items[plain[6]].label + " \u25BE"; row.appendChild(btns[plain[6]]); }
      if (plain[7] !== undefined) { btns[plain[7]].className = "hot db-adv"; search.appendChild(btns[plain[7]]); }
      var tabbar = h("div", { "class": "db-tabs" });
      tabsI.forEach(function (i) { btns[i].className = "hot db-tab"; tabbar.appendChild(btns[i]); btns[i].addEventListener("click", function () { showLinks(i); }); });
      function showLinks(i) { links.innerHTML = ""; items[i].links.forEach(function (t) { links.appendChild(h("span", { text: t })); }); }
      var foot = h("div", { "class": "db-foot" }, [h("span", { text: "Demonstration platform" })]);
      plain.slice(8).forEach(function (i) { foot.appendChild(btns[i]); });
      fig.className = "try-db";
      fig.appendChild(h("div", { "class": "db-bar", "aria-hidden": "true", html: "<i></i><i></i><i></i><span>your-legal-database.example</span><b>Demonstration</b>" }));
      fig.appendChild(head); fig.appendChild(search); search.appendChild(tabbar); search.appendChild(links); fig.appendChild(foot);
      if (tabsI.length) showLinks(tabsI[0]);
      var seenN = 0, counter = h("p", { "class": "try-score", role: "status" });
      btns.forEach(function (b) { b.addEventListener("click", function () { if (!b.classList.contains("seen")) { b.classList.add("seen"); seenN++; } counter.textContent = seenN + " of " + btns.length + " parts explored"; }); });
      root._counter = counter; counter.textContent = "0 of " + btns.length + " parts explored";
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
    if (layout === "database") { shell.appendChild(root._counter); panel.innerHTML = '<p class="try-hint">Select any part of the screen to read about it here.</p>'; }
    else pick(0);
  };

  /* ---- annotate: a passage with marked spans; select a span to read the note -------------- */
  KINDS.annotate = function (root) {
    var marks = Array.prototype.slice.call(root.querySelectorAll(".m")); if (!marks.length) return;
    var cite = opt(root, "layout") === "cite";
    var panel = h("div", { "class": "try-panel", role: "region", "aria-live": "polite", "aria-label": "Explanation: " + (opt(root, "title") || ""), html: '<p class="try-hint">Select a highlighted part. Its explanation appears here.</p>' });
    var count = h("p", { "class": "try-score" }), seen = 0, head = root.querySelector(".try-head");
    if (cite) root.classList.add("try-cite");
    /* the passage sits in a document card; the explanation stays beside it (or, on a small screen,
       opens directly under the part that was selected) so the reader never has to hunt for it */
    var doc = h("div", { "class": "try-doc" }), side = h("div", { "class": "try-side" }, [panel, count]);
    Array.prototype.slice.call(root.children).forEach(function (c) { if (c !== head) doc.appendChild(c); });
    root.appendChild(h("div", { "class": cite ? "try-under" : "try-two" }, [doc, side]));
    if (opt(root, "hint")) head.insertAdjacentElement("afterend", h("p", { "class": "try-lead", text: opt(root, "hint") }));
    var narrow = window.matchMedia("(max-width: 820px)");
    marks.forEach(function (m) {
      var label = opt(m, "label"), note = opt(m, "note"), verdict = opt(m, "verdict"), par = m.parentElement;
      m.setAttribute("role", "button"); m.setAttribute("tabindex", "0"); m.setAttribute("aria-pressed", "false");
      if (label && cite) {
        var tok = h("span", { "class": "tok" }); while (m.firstChild) tok.appendChild(m.firstChild);
        m.appendChild(tok); m.appendChild(h("small", { text: label }));
      } else if (label && par && par.tagName === "P" && par.textContent.trim() === m.textContent.trim()) {
        m.classList.add("blk"); par.classList.add("part"); par.insertBefore(h("span", { "class": "m-label", text: label }), m);   /* a whole part of the document: name it, as the page of an opinion would */
      }
      function open() {
        marks.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        m.setAttribute("aria-pressed", "true");
        if (!m.classList.contains("seen")) { m.classList.add("seen"); seen++; }
        if (verdict) m.classList.add("v-" + verdict);
        panel.innerHTML = (label ? '<p class="try-panel-h">' + label + "</p>" : "") + "<p>" + note + "</p>";
        count.textContent = seen + " of " + marks.length + " read";
        if (!cite) { if (narrow.matches) (m.closest("p,blockquote,li") || m).insertAdjacentElement("afterend", panel); else side.insertBefore(panel, count); }
      }
      m.addEventListener("click", open);
      m.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    count.textContent = "0 of " + marks.length + " read";
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
    var ta = h("textarea", { rows: "3", "aria-label": "Your answer", placeholder: opt(root, "placeholder") || "Write your answer first. It stays in this browser." });
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
      out.innerHTML = i > 0 && steps[i - 1].note ? "<p>" + steps[i - 1].note + "</p>" : "";
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
    var pos = h("span", { "class": "try-score" });
    function draw() {
      if (!pool.length) { face.innerHTML = "<span>No term matches.</span>"; pos.textContent = ""; return; }
      var c = pool[i];
      face.innerHTML = flipped ? '<small>' + strip(c.t) + "</small><span class=\"def\">" + c.d + "</span>" : "<strong>" + c.t + "</strong><small>Select to see the definition</small>";
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
    settings.forEach(function (t, i) { seg.appendChild(h("button", { type: "button", html: t, onclick: function () { pick(i); } })); });
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
    var modeBar = h("div", { "class": "try-seg", role: "group", "aria-label": "Search mode" });
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
    function dragChip(b, tok) { b.setAttribute("draggable", "true"); b.addEventListener("dragstart", function (e) { e.dataTransfer.setData("text/plain", tok + " "); }); }
    [["AND", "both terms"], ["OR", "either term"], ["NOT", "exclude a term"], ['""', "exact phrase"], ["()", "group terms"], ["!", "any ending"], ["/5", "within 5 words"], ["/s", "close together"], ["/p", "loosely together"]].forEach(function (x) {
      var b = h("button", { type: "button", "class": "try-chip", title: x[1], "aria-label": "Add " + (x[0] === '""' ? "quotation marks" : x[0] === "()" ? "parentheses" : x[0]) + ": " + x[1], text: x[0] === '""' ? '" "' : x[0] === "()" ? "( )" : x[0], onclick: function () { insert(x[0]); } });
      if (x[0] !== '""' && x[0] !== "()") dragChip(b, x[0]);
      build.appendChild(b);
    });
    build.appendChild(h("button", { type: "button", "class": "try-chip", text: "Clear", onclick: function () { input.value = ""; input.focus(); go(); } }));
    /* every term the reader might need, as chips: select one (or drag it) to drop it into the search */
    var termList = splitBar(opt(root, "terms")), terms = null;
    if (termList.length) {
      terms = h("div", { "class": "try-terms", role: "group", "aria-label": "Terms to use" });
      termList.forEach(function (t) { var b = h("button", { type: "button", "class": "try-chip term", text: t, onclick: function () { insert(t); } }); dragChip(b, t); terms.appendChild(b); });
    }
    input.addEventListener("drop", function () { setTimeout(go, 0); });
    /* coverage meter: one square per document, filled when the search retrieves it */
    var meter = h("div", { "class": "try-meter", "aria-hidden": "true" }), meterText = h("p", { "class": "visually-hidden", role: "status" });
    /* the search as a tree, the way the big platforms draw it: every term with its own count, every connector with the count it produced */
    var treeBox = h("div", { "class": "try-tree", hidden: "" }), treeBtn = h("button", { type: "button", "class": "try-btn ghost small", "aria-expanded": "false", text: "Show the search as a tree" });
    treeBtn.addEventListener("click", function () { var open = treeBox.hidden; treeBox.hidden = !open; treeBtn.setAttribute("aria-expanded", String(open)); treeBtn.textContent = open ? "Hide the tree" : "Show the search as a tree"; });
    function countDocs(n) { return docs.filter(function (d) { return run(n, d).length; }).length; }
    function treeNode(n) {
      var label, cls;
      if (n.k === "T") { label = n.txt; cls = /^"/.test(n.txt) ? "phrase" : "term"; }
      else { label = n.k === "PROX" ? (n.op.unit ? (n.op.ord ? "+" : "/") + n.op.unit : (n.op.ord ? "+" : "/") + n.op.n) : n.k.toLowerCase(); cls = "op"; }
      var el = h("div", { "class": "st-node" }, [h("span", { "class": "st-pill " + cls }, [h("span", { text: label }), h("b", { text: String(countDocs(n)) })])]);
      if (n.k !== "T") el.appendChild(h("div", { "class": "st-kids" }, [treeNode(n.l), treeNode(n.r)]));
      return el;
    }
    function setMode(m) {
      mode = m;
      Array.prototype.forEach.call(modeBar.children, function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-m") === m)); });
      chipBar.innerHTML = "";
      (m === "nl" ? nat : presets).forEach(function (q) { chipBar.appendChild(h("button", { type: "button", "class": "try-chip", text: q, onclick: function () { input.value = q; go(); } })); });
      build.hidden = m === "nl"; if (terms) terms.hidden = m === "nl"; treeBtn.hidden = m === "nl";
      input.placeholder = m === "nl" ? "Describe the issue in plain words" : "Type terms, and add connectors with the buttons below";
    }
    if (nat.length) {
      [["nl", "Natural language"], ["tc", "Terms and connectors"]].forEach(function (x) { modeBar.appendChild(h("button", { type: "button", "data-m": x[0], text: x[1], onclick: function () { setMode(x[0]); input.value = ""; go(); input.focus(); } })); });
    }
    function go() {
      var q = input.value.trim(), rows = [], tree = null;
      res.innerHTML = ""; read.textContent = "";
      if (!q) { stats.textContent = docs.length + " documents in this practice database. " + (mode === "nl" ? "Describe the problem in your own words." : "Build a search, or open the examples."); meter.innerHTML = ""; treeBox.innerHTML = ""; return; }
      if (mode === "tc") { tree = parse(lex(q)); if (!tree) { stats.textContent = "The lab could not read that search."; return; } read.textContent = "Read as: " + show(tree) + (/[\/+][sp]\b/i.test(q) ? "   (in this lab /s stands in for /" + UNIT.s + " and /p for /" + UNIT.p + "; real platforms do not publish their numbers)" : ""); }
      docs.forEach(function (d) {
        var r = mode === "nl" ? natural(q, d) : { hits: run(tree, d), score: 1 };
        rows.push({ d: d, hits: r.hits, score: r.hits.length ? r.score : 0 });
      });
      var got = rows.filter(function (r) { return r.hits.length; }), relAll = docs.filter(function (d) { return d.rel; }).length;
      meter.innerHTML = ""; meterText.textContent = "";
      if (relAll) {
        var onRow = h("div", { "class": "m-row" }, [h("span", { "class": "m-lab", text: "On point" })]), offRow = h("div", { "class": "m-row" }, [h("span", { "class": "m-lab", text: "Off point" })]);
        rows.forEach(function (r) { (r.d.rel ? onRow : offRow).appendChild(h("i", { "class": (r.hits.length ? "hit " : "") + (r.d.rel ? "on" : "off"), title: r.d.title })); });
        var onGot = rows.filter(function (r) { return r.d.rel && r.hits.length; }).length, offGot = rows.filter(function (r) { return !r.d.rel && r.hits.length; }).length;
        onRow.appendChild(h("span", { "class": "m-n", text: onGot + " of " + relAll + " caught" })); offRow.appendChild(h("span", { "class": "m-n", text: offGot + " of " + (docs.length - relAll) + " let in" }));
        meter.appendChild(onRow); meter.appendChild(offRow);
        meterText.textContent = "Coverage: " + onGot + " of " + relAll + " on-point documents caught; " + offGot + " of " + (docs.length - relAll) + " off-point documents let in.";
      }
      treeBox.innerHTML = "";
      if (mode === "tc" && tree) treeBox.appendChild(h("div", { "class": "st-root" }, [h("span", { "class": "st-pill root", text: got.length + " result" + (got.length === 1 ? "" : "s") + " found" }), h("div", { "class": "st-kids" }, [treeNode(tree)])]));
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
      terms, build, h("p", { "class": "try-actions" }, [exBtn, treeBtn]), chipBar, treeBox, read, stats, meter, meterText, res,
      h("p", { "class": "try-fiction", text: "The cases in this practice database are fictional. They were written for instruction only and are not real authority." })]);
    list.replaceWith(ui);
    setMode(nat.length ? "nl" : "tc"); go();
  };

  /* shared bits for the kinds below */
  function pill(kind) { return h("span", { "class": "try-pill k-" + kind.toLowerCase().replace(/[^a-z]+/g, "-"), text: kind }); }
  function lead(li) {                 /* "<strong>Head.</strong> rest" -> { head, rest } */
    var html = own(li), m = html.match(/^\s*<strong>([\s\S]*?)<\/strong>\s*([\s\S]*)$/);
    return m ? { head: strip(m[1]).replace(/[.:]\s*$/, ""), rest: m[2].trim() } : { head: "", rest: html };
  }

  /* ---- resolve: a legal text whose unclear phrases sharpen one research step at a time. The passage
          carries [phrase]{.m label="key"} marks. The list that follows has one item per key:
          "**key.** the research question", with a nested list of steps, each "**Source | Kind.** finding".
          Kinds: Statute, Regulation, Case, Preamble, Secondary, Guidance, History, Gap. Every step the
          reader takes writes a Research Log entry. ---------------------------------------------------- */
  KINDS.resolve = function (root) {
    var list = topList(root), marks = Array.prototype.slice.call(root.querySelectorAll(".m")); if (!list || !marks.length) return;
    var head = root.querySelector(".try-head"), items = {}, order = [];
    kids(list, "li").forEach(function (li) {
      var L = lead(li), steps = kids(li, "ul,ol")[0];
      items[L.head.toLowerCase()] = { key: L.head, q: L.rest, taken: 0, steps: steps ? kids(steps, "li").map(function (s) {
        var S = lead(s), parts = S.head.split("|").map(function (x) { return x.trim(); });
        return { source: parts[0], kind: parts[1] || "Source", body: S.rest };
      }) : [] };
      order.push(L.head.toLowerCase());
    });
    list.remove();
    var doc = h("div", { "class": "try-doc r-doc" }), panel = h("div", { "class": "try-panel r-panel", role: "region", "aria-live": "polite", "aria-label": "Research: " + (opt(root, "title") || "") });
    Array.prototype.slice.call(root.children).forEach(function (c) { if (c !== head) doc.appendChild(c); });
    if (opt(root, "source")) doc.appendChild(h("p", { "class": "r-src", text: opt(root, "source") }));
    var log = h("ol", { "class": "r-log" }), logWrap = h("div", { "class": "r-logwrap" }, [h("p", { "class": "r-logh", html: "<strong>Research Log</strong> <span>written as you go</span>" }), log]);
    var score = h("p", { "class": "try-score", role: "status", "aria-live": "polite" }), cur = null, nEntries = 0;
    var reset = h("button", { type: "button", "class": "try-btn ghost small", text: "Start over" });
    function badge(m, it) {
      var b = m.querySelector(".r-badge"), n = it.steps.length, done = it.taken >= n, gap = done && n && /gap/i.test(it.steps[n - 1].kind);
      b.textContent = !it.taken ? "?" : (done ? (gap ? "open" : "✓") : it.taken + "/" + n);
      m.className = "m r-m " + (!it.taken ? "r0" : done ? (gap ? "r-gap" : "r-done") : "r-part") + (cur === it ? " r-sel" : "");
      m.setAttribute("aria-pressed", String(cur === it));
      m.setAttribute("aria-label", strip(m.textContent.replace(/[?✓]|open|\d\/\d/g, "")) + ": " + (!it.taken ? "not yet researched" : done ? (gap ? "researched, still open" : "resolved") : it.taken + " of " + n + " sources read"));
    }
    function tally() {
      var done = 0, total = order.length;
      order.forEach(function (k) { var it = items[k]; if (it.steps.length && it.taken >= it.steps.length) done++; });
      score.textContent = done + " of " + total + " unclear phrases researched. " + nEntries + " log entr" + (nEntries === 1 ? "y" : "ies") + ".";
    }
    function draw() {
      marks.forEach(function (m) { var it = items[(opt(m, "label") || "").toLowerCase()]; if (it) badge(m, it); });
      panel.innerHTML = "";
      if (!cur) { panel.appendChild(h("p", { "class": "try-hint", text: "Select a phrase that is out of focus. Its research question opens here." })); tally(); return; }
      panel.appendChild(h("p", { "class": "try-panel-h", html: "Research question <small>" + cur.key + "</small>" }));
      panel.appendChild(h("p", { "class": "r-q", html: cur.q }));
      /* earlier steps fold to one line each, so the panel stays about a screen tall; the newest step is open */
      cur.steps.slice(0, cur.taken).forEach(function (s, i) {
        var last = i === cur.taken - 1, box = h("details", { "class": "r-step k-" + s.kind.toLowerCase().replace(/[^a-z]+/g, "-"), open: last ? "" : null }, [
          h("summary", { "class": "r-steph" }, [pill(s.kind), h("strong", { html: s.source })]), h("p", { html: s.body })]);
        panel.appendChild(box);
      });
      var n = cur.steps.length, left = n - cur.taken;
      if (left > 0) {
        var btn = h("button", { type: "button", "class": "try-btn", text: cur.taken ? "Take the next research step" : "Research it" });
        btn.addEventListener("click", function () {
          var s = cur.steps[cur.taken]; cur.taken++; nEntries++;
          var found = strip(s.body).replace(/\s*Next question:.*$/, ""), cut = found.length > 170 ? found.slice(0, 170).replace(/\s+\S*$/, "") + "\u2026" : found;
          logAdd({ q: strip(cur.q), type: "Definitional", source: strip(s.source), found: found, next: (strip(s.body).match(/Next question:\s*(.*)$/) || [])[1] || "" });
          log.appendChild(h("li", {}, [h("p", {}, [pill(s.kind), h("span", { "class": "r-lq", html: cur.q })]), h("p", { "class": "r-lf", html: "<b>Source:</b> " + s.source + " <b>Found:</b> " + cut })]));
          logWrap.hidden = false; draw(); btn = panel.querySelector(".try-btn"); if (btn) btn.focus();
        });
        panel.appendChild(h("p", { "class": "try-actions" }, [btn, h("span", { "class": "try-hint", text: left + " source" + (left === 1 ? "" : "s") + " to go" })]));
      } else {
        var gap = n && /gap/i.test(cur.steps[n - 1].kind);
        panel.appendChild(h("p", { "class": gap ? "r-end warn" : "r-end good", html: gap ? "<strong>As clear as the sources make it, and still open.</strong> The gap is the finding. Log it and move on." : "<strong>In focus.</strong> The phrase now means what the sources say it means. Notice how many cycles that took." }));
      }
      tally();
    }
    marks.forEach(function (m) {
      var it = items[(opt(m, "label") || "").toLowerCase()]; if (!it) return;
      m.setAttribute("role", "button"); m.setAttribute("tabindex", "0"); m.appendChild(h("sup", { "class": "r-badge", "aria-hidden": "true", text: "?" }));
      function open() { cur = it; draw(); }
      m.addEventListener("click", open);
      m.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    reset.addEventListener("click", function () { order.forEach(function (k) { items[k].taken = 0; }); cur = null; nEntries = 0; log.innerHTML = ""; logWrap.hidden = true; draw(); });
    logWrap.hidden = true;
    root.appendChild(h("div", { "class": "try-two r-two" }, [doc, h("div", { "class": "try-side" }, [panel])]));
    root.appendChild(logWrap);
    root.appendChild(h("p", { "class": "try-actions" }, [score, reset]));
    if (opt(root, "hint")) head.insertAdjacentElement("afterend", h("p", { "class": "try-lead", text: opt(root, "hint") }));
    draw();
  };

  /* ---- cycle: replay a research demonstration while the three documents fill. One list item per cycle:
          "**Q1 | Exploratory, no-clue.** the question", with nested lines whose bold lead says what they are:
          Source, Found, Adds (new map questions, separated by |), Closes (map numbers answered, e.g. "1, 2"),
          Outline (an entry), Note (a bracketed application note under the last outline entry), Aside. --------- */
  KINDS.cycle = function (root) {
    var list = topList(root); if (!list) return;
    var cycles = kids(list, "li").map(function (li) {
      var L = lead(li), parts = L.head.split("|").map(function (x) { return x.trim(); }), c = { id: parts[0], type: parts[1] || "", q: L.rest, adds: [], closes: [] };
      var sub = kids(li, "ul,ol")[0];
      if (sub) kids(sub, "li").forEach(function (s) {
        var S = lead(s), k = S.head.toLowerCase();
        if (k === "adds") c.adds = S.rest.split("|").map(function (x) { return x.trim(); }).filter(Boolean);
        else if (k === "closes") c.closes = S.rest.replace(/<[^>]+>/g, "").split(/[,\s]+/).map(Number).filter(Boolean);
        else c[k] = S.rest;
      });
      return c;
    });
    var i = 0, macro = opt(root, "macro");
    var card = h("div", { "class": "cy-card", role: "region", "aria-live": "polite", "aria-label": "Current cycle" });
    var map = h("ol", { "class": "cy-list cy-map" }), logL = h("ol", { "class": "cy-list cy-log" }), outL = h("ol", { "class": "cy-list cy-out" });
    var prev = h("button", { type: "button", "class": "try-btn ghost", text: "← Back" }), next = h("button", { type: "button", "class": "try-btn", text: "Run the first cycle" }), pos = h("span", { "class": "try-score", role: "status" });
    function col(title, sub, ol) { return h("div", { "class": "cy-col" }, [h("p", { "class": "cy-colh", html: "<strong>" + title + "</strong> <span>" + sub + "</span>" }), ol]); }
    function draw() {
      var mapQ = [], out = [], k;
      map.innerHTML = ""; logL.innerHTML = ""; outL.innerHTML = "";
      for (k = 0; k < i; k++) {
        var c = cycles[k];
        c.adds.forEach(function (q) { mapQ.push({ q: q, open: true, fresh: k === i - 1 }); });
        c.closes.forEach(function (n) { if (mapQ[n - 1]) mapQ[n - 1].open = false; });
        if (c.outline) out.push({ t: c.outline, notes: [], fresh: k === i - 1 });
        if (c.note && out.length) { out[out.length - 1].notes.push(c.note); out[out.length - 1].fresh = k === i - 1; }
      }
      mapQ.forEach(function (m) { map.appendChild(h("li", { "class": (m.open ? "open" : "done") + (m.fresh ? " fresh" : "") }, [h("span", { "class": "cy-chip", text: m.open ? "open" : "answered" }), h("span", { html: m.q })])); });
      if (!mapQ.length) map.appendChild(h("li", { "class": "empty", text: "Nothing yet." }));
      for (k = 0; k < i; k++) logL.appendChild(h("li", { "class": k === i - 1 ? "fresh" : "" }, [h("span", { "class": "cy-chip", text: cycles[k].id }), h("span", { html: "<em>" + cycles[k].type + "</em> " + (cycles[k].source ? "— " + strip(cycles[k].source) : "") })]));
      if (!i) logL.appendChild(h("li", { "class": "empty", text: "Nothing yet." }));
      out.forEach(function (o) { outL.appendChild(h("li", { "class": o.fresh ? "fresh" : "" }, [h("span", { html: o.t }), o.notes.length ? h("span", { "class": "cy-note", html: o.notes.map(function (n) { return "[" + n + "]"; }).join(" ") }) : null])); });
      if (!out.length) outL.appendChild(h("li", { "class": "empty", text: i ? "Still empty: the answer so far came from a secondary source." : "Nothing yet." }));
      card.innerHTML = "";
      if (!i) card.appendChild(h("p", { "class": "cy-macro", html: (macro ? "<strong>Macro question.</strong> " + macro + " " : "") + "<span class=\"try-hint\">The three documents below are empty. Run the cycles and watch each one fill.</span>" }));
      else {
        var c2 = cycles[i - 1];
        card.appendChild(h("p", { "class": "cy-q" }, [h("span", { "class": "cy-chip big", text: c2.id }), pill(c2.type), h("span", { html: c2.q })]));
        if (c2.source) card.appendChild(h("p", { html: "<b>Source.</b> " + c2.source }));
        if (c2.found) card.appendChild(h("p", { html: "<b>Found.</b> " + c2.found }));
        if (c2.aside) card.appendChild(h("p", { "class": "cy-aside", html: c2.aside }));
      }
      prev.disabled = !i; next.disabled = i >= cycles.length;
      next.textContent = !i ? "Run the first cycle" : i >= cycles.length ? "Done" : "Next cycle";
      pos.textContent = i ? "Cycle " + i + " of " + cycles.length : cycles.length + " cycles";
    }
    next.addEventListener("click", function () { if (i < cycles.length) { i++; draw(); } });
    prev.addEventListener("click", function () { if (i) { i--; draw(); } });
    var ui = h("div", { "class": "try-cycle" }, [card, h("p", { "class": "try-actions" }, [prev, next, pos]),
      h("div", { "class": "cy-cols" }, [col("Research map", "where you are going", map), col("Research log", "where you have been", logL), col("Annotated outline", "what you know", outL)])]);
    list.replaceWith(ui); draw();
  };

  /* ---- funnel: toggle filters and watch a results count collapse. start="48000" goal="300".
          Items: "**Filter name | ÷ 40.** why it helps". --------------------------------------------------- */
  KINDS.funnel = function (root) {
    var list = topList(root); if (!list) return;
    var start = +opt(root, "start") || 10000, goal = +opt(root, "goal") || 0, unit = opt(root, "unit") || "results";
    var filters = kids(list, "li").map(function (li) {
      var L = lead(li), parts = L.head.split("|").map(function (x) { return x.trim(); }), m = (parts[1] || "").match(/([÷\/x×])\s*([\d.]+)/i);
      return { name: parts[0], f: m ? (/[x×]/i.test(m[1]) ? 1 / +m[2] : +m[2]) : 1, why: L.rest, on: false };
    });
    var count = h("p", { "class": "fn-count", role: "status", "aria-live": "polite" }), bar = h("div", { "class": "fn-bar" }, [h("i")]), verdict = h("p", { "class": "fn-verdict" });
    var bins = h("div", { "class": "fn-filters", role: "group", "aria-label": "Filters" }), why = h("div", { "class": "try-panel fn-why" });
    function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
    function draw() {
      var n = start; filters.forEach(function (f) { if (f.on) n = n / f.f; });
      n = Math.max(1, n);
      count.innerHTML = "<strong>" + fmt(n) + "</strong> " + unit;
      bar.firstChild.style.width = (100 * Math.log(n) / Math.log(start)) + "%";
      bar.className = "fn-bar" + (goal && n <= goal ? " ok" : "");
      verdict.innerHTML = goal ? (n <= goal ? "<strong>A set you can actually read.</strong> Now the search terms can do their work." : n > start / 2 ? "<strong>A wall.</strong> No search term will dig you out of this; the filters have to." : "<strong>Still too many.</strong> Every one of these could never have answered the question.") : "";
    }
    filters.forEach(function (f) {
      var b = h("button", { type: "button", "class": "fn-filter", "aria-pressed": "false", html: "<span>" + f.name + "</span><small>÷ " + (f.f >= 1 ? f.f : "1/" + Math.round(1 / f.f)) + "</small>" });
      b.addEventListener("click", function () { f.on = !f.on; b.setAttribute("aria-pressed", String(f.on)); why.innerHTML = '<p class="try-panel-h">' + f.name + '</p><p>' + f.why + "</p>"; draw(); });
      bins.appendChild(b);
    });
    why.innerHTML = '<p class="try-hint">Select a filter to apply it and read what it does.</p>';
    list.replaceWith(h("div", { "class": "try-funnel" }, [count, bar, verdict, bins, why, h("p", { "class": "try-fiction", text: "The counts are illustrative. Real result counts vary by platform and by day; the collapse does not." })]));
    draw();
  };

  /* ---- timeline: scrub a year and watch milestones light up. Items: "**1975 | California.** what happened".
          from="1900" to="2000" start="1960" count="states" (the noun for the running count). ------------------ */
  KINDS.timeline = function (root) {
    var list = topList(root); if (!list) return;
    var items = kids(list, "li").map(function (li) {
      var L = lead(li), parts = L.head.split("|").map(function (x) { return x.trim(); });
      return { year: +parts[0], place: parts[1] || "", body: L.rest };
    }).filter(function (x) { return x.year; }).sort(function (a, b) { return a.year - b.year; });
    var lo = +opt(root, "from") || items[0].year, hi = +opt(root, "to") || items[items.length - 1].year, year = +opt(root, "start") || lo, noun = opt(root, "count") || "milestones";
    var range = h("input", { type: "range", min: lo, max: hi, step: 1, value: year, "aria-label": "Year" });
    var readout = h("p", { "class": "tl-year", role: "status", "aria-live": "polite" }), track = h("div", { "class": "tl-track", role: "group", "aria-label": "Milestones" }), panel = h("div", { "class": "try-panel tl-panel" });
    var play = h("button", { type: "button", "class": "try-btn ghost small", text: "Play" }), timer = null;
    var years = []; items.forEach(function (it) { if (years.indexOf(it.year) < 0) years.push(it.year); });   /* one dot per year, however many milestones share it */
    var dots = years.map(function (y) {
      var here = items.filter(function (it) { return it.year === y; }), d = h("button", { type: "button", "class": "tl-dot" + (here.length > 1 ? " multi" : ""), "aria-label": y + ": " + here.map(function (it) { return strip(it.place); }).join("; "), style: "left:" + (100 * (y - lo) / (hi - lo)) + "%", text: here.length > 1 ? String(here.length) : "" });
      d.addEventListener("click", function () { year = y; range.value = year; draw(); }); track.appendChild(d); return d;
    });
    function draw() {
      var lit = items.filter(function (it) { return it.year <= year; }), now = items.filter(function (it) { return it.year === year; });
      dots.forEach(function (d, k) { d.className = "tl-dot" + (d.textContent ? " multi" : "") + (years[k] <= year ? " lit" : "") + (years[k] === year ? " now" : ""); });
      readout.innerHTML = "<strong>" + year + "</strong> <span>" + lit.length + " of " + items.length + " " + noun + " so far</span>";
      var show = now.length ? now : lit.slice(-1);
      panel.innerHTML = show.length ? show.map(function (it) { return '<p class="try-panel-h">' + it.year + " <small>" + it.place + "</small></p><p>" + it.body + "</p>"; }).join("") : '<p class="try-hint">Nothing on this timeline has happened yet. Drag the slider forward.</p>';
      track.style.setProperty("--fill", (100 * (year - lo) / (hi - lo)) + "%");
    }
    range.addEventListener("input", function () { year = +range.value; stop(); draw(); });
    function stop() { if (timer) { clearInterval(timer); timer = null; play.textContent = "Play"; } }
    play.addEventListener("click", function () {
      if (timer) { stop(); return; }
      if (year >= hi) year = lo;
      var fast = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      play.textContent = "Pause";
      timer = setInterval(function () { year = Math.min(hi, year + (fast ? 5 : 1)); range.value = year; draw(); if (year >= hi) stop(); }, fast ? 600 : 220);
    });
    list.replaceWith(h("div", { "class": "try-timeline" }, [readout, h("div", { "class": "tl-slider" }, [track, range]), h("p", { "class": "tl-ends", html: "<span>" + lo + "</span><span>" + hi + "</span>" }), h("p", { "class": "try-actions" }, [play, h("span", { "class": "try-hint", text: "Drag the slider, or select a dot." })]), panel]));
    draw();
  };

  /* ---- path: choose a route and pay for it. Items are nodes: "**id | cost.** what happens here", each with a
          nested list of choices "**target-id.** the choice". start="id" names the first node. The trail adds
          up the costs ($0.30, 12 min). A node without choices ends the route. ------------------------------ */
  KINDS.path = function (root) {
    var list = topList(root); if (!list) return;
    var nodes = {}, first = opt(root, "start");
    kids(list, "li").forEach(function (li) {
      var L = lead(li), parts = L.head.split("|").map(function (x) { return x.trim(); }), sub = kids(li, "ul,ol")[0];
      nodes[parts[0]] = { id: parts[0], cost: parts[1] || "", body: L.rest, choices: sub ? kids(sub, "li").map(function (c) { var C = lead(c); return { to: C.head, text: C.rest }; }) : [] };
      if (!first) first = parts[0];
    });
    var trail = [], card = h("div", { "class": "try-panel pa-card", role: "region", "aria-live": "polite" }), trailL = h("ol", { "class": "pa-trail" }), total = h("p", { "class": "pa-total", role: "status" });
    function money(c) { var m = c.match(/([$£€]?)\s*([\d.]+)\s*(\w*)/); return m ? { n: +m[2], pre: m[1], unit: m[3] } : null; }
    function sum() { var n = 0, pre = "", unit = ""; trail.forEach(function (id) { var m = money(nodes[id].cost); if (m) { n += m.n; pre = pre || m.pre; unit = unit || m.unit; } }); return pre ? pre + n.toFixed(2) : (n ? n + (unit ? " " + unit : "") : ""); }
    function go(id) {
      var n = nodes[id]; if (!n) return;
      trail.push(id);
      trailL.innerHTML = ""; trail.forEach(function (t, k) { trailL.appendChild(h("li", { "class": k === trail.length - 1 ? "now" : "" }, [h("span", { html: strip(nodes[t].body).split(/(?<=[.?!])\s/)[0] }), nodes[t].cost ? h("b", { text: nodes[t].cost }) : null])); });
      var s = sum(); total.innerHTML = s ? "Running total: <strong>" + s + "</strong> over " + trail.length + " step" + (trail.length === 1 ? "" : "s") : trail.length + " step" + (trail.length === 1 ? "" : "s");
      card.innerHTML = "";
      card.appendChild(h("p", { html: n.body }));
      if (n.choices.length) {
        var opts = h("div", { "class": "try-opts" });
        n.choices.forEach(function (c) { opts.appendChild(h("button", { type: "button", "class": "try-opt", html: c.text, onclick: function () { go(c.to); } })); });
        card.appendChild(opts);
      } else {
        card.appendChild(h("p", { "class": "try-actions" }, [h("button", { type: "button", "class": "try-btn ghost", text: "Start over", onclick: function () { trail = []; go(first); } })]));
        logAdd({ q: strip(nodes[first].body).split(/(?<=[.?!])\s/).slice(-1)[0], type: "Procedural", source: "Docket route, " + trail.length + " steps", found: "Reached the document" + (s ? " at a cost of " + s : "") + "." });
      }
      var b = card.querySelector("button"); if (b && trail.length > 1) b.focus();
    }
    list.replaceWith(h("div", { "class": "try-path" }, [card, h("div", { "class": "pa-side" }, [h("p", { "class": "cy-colh", html: "<strong>Your trail</strong> <span>what each step cost</span>" }), trailL, total])]));
    go(first);
  };

  function logAdd(e) { if (window.qmLog) window.qmLog.add(e); }
  function wordDiff(a, b) {           /* word-level LCS diff: [{t, k}] with k = same | del | ins */
    var A = a.split(/(\s+)/).filter(Boolean), B = b.split(/(\s+)/).filter(Boolean), n = A.length, m = B.length, L = [], i, j, out = [];
    for (i = 0; i <= n; i++) { L.push([]); for (j = 0; j <= m; j++) L[i].push(0); }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    i = 0; j = 0;
    while (i < n && j < m) { if (A[i] === B[j]) { out.push({ t: A[i], k: "same" }); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) { out.push({ t: A[i], k: "del" }); i++; } else { out.push({ t: B[j], k: "ins" }); j++; } }
    while (i < n) out.push({ t: A[i++], k: "del" }); while (j < m) out.push({ t: B[j++], k: "ins" });
    return out;
  }

  /* ---- draft: write a first research question and have it diagnosed. One item per client:
          "**Client | expected type.** the file", with nested lines led by "Not yet yours" (terms of art the file
          did not supply, separated by |), "Model" (the model question) and "Map" (the questions it would start, |). ---- */
  KINDS.draft = function (root, idx) {
    var list = topList(root); if (!list) return;
    var TYPES = splitBar(opt(root, "types")) || [];
    if (!TYPES.length) TYPES = ["Vocabulary first", "Exploratory", "Focusing", "Definitional", "Application"];
    var clients = kids(list, "li").map(function (li) {
      var L = lead(li), parts = L.head.split("|").map(function (x) { return x.trim(); }), c = { name: parts[0], type: parts[1] || "", file: L.rest, terms: [], model: "", map: [] }, sub = kids(li, "ul,ol")[0];
      if (sub) kids(sub, "li").forEach(function (x) { var X = lead(x), k = X.head.toLowerCase(); if (k.indexOf("not yet") === 0) c.terms = strip(X.rest).split("|").map(function (t) { return t.trim().toLowerCase(); }).filter(Boolean); else if (k === "model") c.model = X.rest; else if (k === "map") c.map = X.rest.split("|").map(function (t) { return t.trim(); }).filter(Boolean); });
      return c;
    });
    var cur = 0, key = "qm:" + location.pathname + ":draft:" + idx, saved = store.get(key, {});
    var tabs = h("div", { "class": "try-seg", role: "group", "aria-label": "Choose a client" }), file = h("div", { "class": "try-panel dr-file" });
    var ta = h("textarea", { rows: "2", "aria-label": "Your first research question", placeholder: "Write the first question you would log. One question, one question mark." });
    var typeBar = h("div", { "class": "fn-filters", role: "group", "aria-label": "What type of question is it?" }), picked = "";
    var out = live(), model = h("div", { "class": "try-answer", hidden: "" });
    var diag = h("button", { type: "button", "class": "try-btn", text: "Diagnose my question" }), cmp = h("button", { type: "button", "class": "try-btn ghost", text: "Compare with the model question", hidden: "" });
    function pickType(t) { picked = t; Array.prototype.forEach.call(typeBar.children, function (b) { b.setAttribute("aria-pressed", String(b.textContent === t)); }); }
    TYPES.forEach(function (t) { typeBar.appendChild(h("button", { type: "button", "class": "fn-filter", "aria-pressed": "false", text: t, onclick: function () { pickType(t); } })); });
    function show(i) {
      cur = i; Array.prototype.forEach.call(tabs.children, function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
      file.innerHTML = '<p class="try-panel-h">' + clients[i].name + "</p><p>" + clients[i].file + "</p>";
      ta.value = saved[i] || ""; pickType(""); out.innerHTML = ""; model.hidden = true; cmp.hidden = true;
    }
    clients.forEach(function (c, i) { tabs.appendChild(h("button", { type: "button", text: c.name, onclick: function () { show(i); } })); });
    ta.addEventListener("input", function () { saved[cur] = ta.value; store.set(key, saved); });
    diag.addEventListener("click", function () {
      var q = ta.value.trim(), c = clients[cur], notes = [], low = q.toLowerCase(), ok = true;
      if (!q) { out.innerHTML = '<p class="bad">Write the question first.</p>'; return; }
      if (q.indexOf("?") < 0) { notes.push("<p class=\"bad\"><strong>Write it as a question.</strong> A topic can be browsed forever. A question can be answered, and answered means done.</p>"); ok = false; }
      if ((q.match(/\?/g) || []).length > 1 || /\?\s*\S/.test(q) || /\b(and|, and) (what|how|whether|does|is|can|when|which)\b/i.test(q)) { notes.push("<p class=\"bad\"><strong>Two questions are sharing a sentence.</strong> Split them. Each needs its own source, its own answer, and its own log entry.</p>"); ok = false; }
      var leaked = c.terms.filter(function (t) { return low.indexOf(t) >= 0; });
      if (leaked.length) { notes.push("<p class=\"bad\"><strong>The file did not hand you “" + leaked[0] + ".”</strong> A term of art belongs in a question only after the file supplied it or an earlier answer turned it up. Where did this one come from?</p>"); ok = false; }
      if (/\b(my client|our client|the client|she|he|her son|his daughter)\b/i.test(q) && /\b(can|may|is|does|did|will)\b/i.test(q.split(/\s+/).slice(0, 2).join(" "))) { notes.push("<p class=\"bad\"><strong>No database holds your file.</strong> A question that starts from the client’s facts is a writing question. Ask what the law says first; apply it to the client in the outline.</p>"); ok = false; }
      if (q.split(/\s+/).length < 6) { notes.push("<p class=\"bad\"><strong>Too short to search.</strong> A vague question gives you vague results. Say what you need to know, in terms that reflect what you currently understand.</p>"); ok = false; }
      if (picked && c.type && picked.toLowerCase() !== c.type.toLowerCase()) { notes.push("<p class=\"bad\"><strong>Check the type.</strong> Reread your diagnosis of what you already know. The model treats this client’s first question as <em>" + c.type + "</em>.</p>"); ok = false; }
      if (!picked) notes.push("<p class=\"bad\"><strong>Name the type.</strong> The type tells you which source to open first.</p>");
      if (ok && picked) notes.push("<p class=\"good\"><strong>Nothing to flag.</strong> One question, no borrowed vocabulary, written where your knowledge actually is. Now compare it with the model and the map it would start.</p>");
      out.innerHTML = notes.join(""); cmp.hidden = false;
    });
    cmp.addEventListener("click", function () {
      var c = clients[cur]; model.hidden = false;
      model.innerHTML = '<p><strong>Model first question</strong> <span class="try-pill">' + c.type + "</span></p><p>" + c.model + "</p>" + (c.map.length ? '<p><strong>The map it would start</strong></p><ol class="cy-list cy-map">' + c.map.map(function (q) { return '<li class="open"><span class="cy-chip">open</span><span>' + q + "</span></li>"; }).join("") + "</ol>" : "");
      logAdd({ q: ta.value.trim(), type: picked || "(untyped)", source: "Drafted in Chapter 3, " + c.name, found: "First question drafted and diagnosed. Model: " + strip(c.model) });
    });
    list.replaceWith(h("div", { "class": "try-draft" }, [tabs, file, ta, h("p", { "class": "try-hint", text: "What type of question is it?" }), typeBar, h("p", { "class": "try-actions" }, [diag, cmp]), out, model]));
    show(0);
  };

  /* ---- highlight: read an opinion for one question. The passage's sentences carry [..]{.m tag="answer|dictum|facts|dispositive|procedure" note="..."}.
          The reader selects the sentences that answer the question, then checks. question="..." --------------------------- */
  KINDS.highlight = function (root) {
    var marks = Array.prototype.slice.call(root.querySelectorAll(".m")); if (!marks.length) return;
    var head = root.querySelector(".try-head"), doc = h("div", { "class": "try-doc hl-doc" }), panel = h("div", { "class": "try-panel", role: "region", "aria-live": "polite" }), checked = false;
    Array.prototype.slice.call(root.children).forEach(function (c) { if (c !== head) doc.appendChild(c); });
    var q = opt(root, "question"), qline = h("p", { "class": "hl-q", html: "<strong>Read for this question:</strong> " + q });
    var check = h("button", { type: "button", "class": "try-btn", text: "Check my reading" }), facts = h("button", { type: "button", "class": "try-btn ghost", text: "Show the dispositive facts", hidden: "" }), reset = h("button", { type: "button", "class": "try-btn ghost small", text: "Start over" });
    marks.forEach(function (m) {
      m.setAttribute("role", "button"); m.setAttribute("tabindex", "0"); m.setAttribute("aria-pressed", "false"); m.classList.add("hl-s");
      function toggle() { if (checked) return; m.setAttribute("aria-pressed", m.getAttribute("aria-pressed") === "true" ? "false" : "true"); }
      m.addEventListener("click", toggle); m.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    });
    panel.innerHTML = '<p class="try-hint">Select every sentence that answers the question. Nothing else. Then check.</p>';
    check.addEventListener("click", function () {
      checked = true; var html = "", hit = 0, need = 0, dicta = 0;
      marks.forEach(function (m) {
        var on = m.getAttribute("aria-pressed") === "true", tag = (opt(m, "tag") || "other").toLowerCase(), note = opt(m, "note");
        if (tag === "answer") need++;
        if (on && tag === "answer") { hit++; m.classList.add("hl-ok"); html += '<p class="good"><strong>Yes.</strong> ' + note + "</p>"; }
        else if (on && tag === "dictum") { dicta++; m.classList.add("hl-no"); html += '<p class="bad"><strong>Dictum.</strong> ' + note + "</p>"; }
        else if (on) { m.classList.add("hl-no"); html += '<p class="bad"><strong>Not the answer.</strong> ' + note + "</p>"; }
        else if (tag === "answer") { m.classList.add("hl-miss"); html += '<p class="bad"><strong>Missed.</strong> ' + note + "</p>"; }
      });
      panel.innerHTML = '<p class="try-panel-h">' + hit + " of " + need + " answering sentence" + (need === 1 ? "" : "s") + " found" + (dicta ? ", " + dicta + " dictum selected" : "") + "</p>" + html;
      check.hidden = true; facts.hidden = false;
      logAdd({ q: q, type: "Focusing", source: "Read for the answer, Chapter 5", found: hit + " of " + need + " answering sentences found; " + dicta + " dictum selected." });
    });
    facts.addEventListener("click", function () {
      var html = "";
      marks.forEach(function (m) { if ((opt(m, "tag") || "").toLowerCase() === "dispositive") { m.classList.add("hl-fact"); html += "<p>" + opt(m, "note") + "</p>"; } });
      panel.innerHTML = '<p class="try-panel-h">Dispositive facts</p><p class="try-hint">Change any of these and the court’s reasoning no longer reaches its result. Everything else in the opinion is background.</p>' + html; facts.hidden = true;
    });
    reset.addEventListener("click", function () { checked = false; marks.forEach(function (m) { m.setAttribute("aria-pressed", "false"); m.className = "m hl-s"; }); panel.innerHTML = '<p class="try-hint">Select every sentence that answers the question. Nothing else. Then check.</p>'; check.hidden = false; facts.hidden = true; });
    head.insertAdjacentElement("afterend", qline);
    root.appendChild(h("div", { "class": "try-two" }, [doc, h("div", { "class": "try-side" }, [panel])]));
    root.appendChild(h("p", { "class": "try-actions" }, [check, facts, reset]));
  };

  /* ---- citator: a citator the reader can run. Each item is a case: "**Name | year | court.** summary", with nested
          "**Holds.** a point of law" lines (numbered in order) and "**Citing case (year) | treatment | n.** note" lines,
          where treatment is followed, cited, distinguished, criticized, questioned, limited, overruled in part, overruled,
          superseded, or disapproved, and n is the point it reaches. The reader picks a case, reads the citator, and says which
          point they want to cite it for; the page says whether the history reaches that point. ------------------------------ */
  KINDS.citator = function (root) {
    var list = topList(root); if (!list) return;
    var RED = /overrul|supersed|revers|disapprov|abrogat/i, YEL = /distinguish|critici|question|limit/i;
    var cases = kids(list, "li").map(function (li) {
      var L = lead(li), parts = L.head.split("|").map(function (x) { return x.trim(); }), c = { name: parts[0], year: parts[1] || "", court: parts[2] || "", summary: L.rest, points: [], cites: [] }, sub = kids(li, "ul,ol")[0];
      if (sub) kids(sub, "li").forEach(function (x) {
        var X = lead(x), p = X.head.split("|").map(function (y) { return y.trim(); });
        if (/^holds?$/i.test(p[0])) c.points.push(X.rest); else c.cites.push({ by: p[0], treat: p[1] || "cited", n: +p[2] || 0, note: X.rest });
      });
      c.flag = c.cites.some(function (t) { return RED.test(t.treat); }) ? "red" : c.cites.some(function (t) { return YEL.test(t.treat); }) ? "yellow" : "green";
      return c;
    });
    var picker = h("div", { "class": "ct-list", role: "group", "aria-label": "Cases in the practice citator" }), view = h("div", { "class": "try-panel ct-view", role: "region", "aria-live": "polite" }), out = live();
    function flagEl(f) { return h("span", { "class": "ct-flag f-" + f, text: f === "red" ? "Red flag" : f === "yellow" ? "Yellow flag" : "No negative treatment" }); }
    function show(c) {
      Array.prototype.forEach.call(picker.children, function (b) { b.setAttribute("aria-pressed", String(b.textContent === c.name)); });
      view.innerHTML = ""; out.innerHTML = "";
      view.appendChild(h("p", { "class": "try-panel-h" }, [h("em", { text: c.name }), h("small", { text: (c.year ? " (" + c.year + ")" : "") + (c.court ? " · " + c.court : "") }), flagEl(c.flag)]));
      view.appendChild(h("p", { html: c.summary }));
      var pts = h("ol", { "class": "ct-points" }); c.points.forEach(function (p) { pts.appendChild(h("li", { html: p })); });
      view.appendChild(h("p", { "class": "ct-h", text: "Points of law in the opinion" })); view.appendChild(pts);
      view.appendChild(h("p", { "class": "ct-h", text: "Citing decisions (select one to read the treatment)" }));
      var rows = h("div", { "class": "ct-cites" });
      if (!c.cites.length) rows.appendChild(h("p", { "class": "try-hint", text: "No citing decisions yet. An unflagged case is not a verified one; it is an uncited one." }));
      c.cites.forEach(function (t) {
        var cls = RED.test(t.treat) ? "neg" : YEL.test(t.treat) ? "warn" : "pos";
        rows.appendChild(h("details", { "class": "ct-cite " + cls }, [h("summary", {}, [h("span", { "class": "try-pill k-" + cls, text: t.treat }), h("strong", { html: t.by }), t.n ? h("small", { text: "point " + t.n }) : null]), h("p", { html: t.note })]));
      });
      view.appendChild(rows);
      view.appendChild(h("p", { "class": "ct-h", text: "I want to cite this case for:" }));
      var ask = h("div", { "class": "try-opts" });
      c.points.forEach(function (p, i) {
        ask.appendChild(h("button", { type: "button", "class": "try-opt", html: "Point " + (i + 1) + ": " + p, onclick: function () {
          var reach = c.cites.filter(function (t) { return t.n === i + 1 && (RED.test(t.treat) || YEL.test(t.treat)); }), dead = reach.filter(function (t) { return RED.test(t.treat); });
          var msg, verdict;
          if (dead.length) { verdict = "Do not cite it for this point."; msg = "The negative treatment reaches exactly this point: " + dead.map(function (t) { return "<em>" + strip(t.by) + "</em> (" + t.treat + ")"; }).join("; ") + ". Cite the later decision instead, and if it cuts against you, Chapter 12 says you may have to disclose it."; }
          else if (reach.length) { verdict = "Citable, with care."; msg = "A later court " + reach[0].treat + " this point in <em>" + strip(reach[0].by) + "</em>. Read that opinion before you rely on this one, and be ready to say why its facts differ from yours."; }
          else if (c.flag === "red") { verdict = "Citable for this point."; msg = "The red flag is real, and it attaches to a different point of law. Say so in the citation’s subsequent history so no one thinks you missed it."; }
          else if (c.flag === "yellow") { verdict = "Citable for this point."; msg = "The yellow flag concerns another point. A signal starts an inquiry, and you have just finished it."; }
          else { verdict = "Citable."; msg = "No negative treatment on any point. Now read the opinion for the proposition before you cite it; a clean flag is not a reading."; }
          out.innerHTML = '<p class="' + (dead.length ? "bad" : "good") + '"><strong>' + verdict + "</strong> " + msg + "</p>";
          logAdd({ q: "Is " + strip(c.name) + " still good law for point " + (i + 1) + "?", type: "Verification", source: "Practice citator", found: verdict + " " + strip(msg) });
        } }));
      });
      view.appendChild(ask);
    }
    cases.forEach(function (c) { picker.appendChild(h("button", { type: "button", "class": "ct-case f-" + c.flag, "aria-pressed": "false", html: "<em>" + c.name + "</em>" + (c.year ? " <small>" + c.year + "</small>" : ""), onclick: function () { show(c); } })); });
    list.replaceWith(h("div", { "class": "try-citator" }, [picker, view, out, h("p", { "class": "try-fiction", text: "Every case in this citator is fictional. The flags behave the way KeyCite and Shepard’s flags behave: they attach to the case, while the treatment attaches to points of law." })]));
    show(cases[0]);
  };

  /* ---- preamble: a Federal Register final rule, read the way a researcher reads it. Items: "**Title | kind.** text", where kind is
          header, summary, dates, comment, source. A comment carries nested "**Response.** ..." and "**Rule text.** ..." lines. ---- */
  KINDS.preamble = function (root) {
    var list = topList(root); if (!list) return;
    var parts = kids(list, "li").map(function (li) {
      var L = lead(li), p = L.head.split("|").map(function (x) { return x.trim(); }), it = { title: p[0], kind: (p[1] || "").toLowerCase(), body: L.rest }, sub = kids(li, "ul,ol")[0];
      if (sub) kids(sub, "li").forEach(function (x) { var X = lead(x), k = X.head.toLowerCase(); if (k === "response") it.response = X.rest; else if (k.indexOf("rule") === 0) it.rule = X.rest; });
      return it;
    });
    var page = h("div", { "class": "fr-page" }), side = h("div", { "class": "try-panel fr-side", role: "region", "aria-live": "polite" }), seen = 0, count = h("p", { "class": "try-score", role: "status" });
    var comments = parts.filter(function (p) { return p.kind === "comment"; });
    parts.forEach(function (p) {
      if (p.kind === "comment") {
        var b = h("button", { type: "button", "class": "fr-comment", "aria-pressed": "false", html: "<small>Comment</small>" + p.title + "<span>" + p.body + "</span>" });
        b.addEventListener("click", function () {
          Array.prototype.forEach.call(page.querySelectorAll(".fr-comment"), function (x) { x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true");
          if (!b.classList.contains("seen")) { b.classList.add("seen"); seen++; count.textContent = seen + " of " + comments.length + " comments read"; }
          side.innerHTML = '<p class="try-panel-h">The agency’s response</p><p>' + (p.response || "") + "</p>" + (p.rule ? '<p class="fr-ruleh">The words it produced, as codified</p><blockquote class="fr-rule">' + p.rule + "</blockquote><p class=\"try-hint\">In the CFR you see only the quotation. The reason above it lives here, in the Federal Register, and nowhere else.</p>" : "");
        });
        page.appendChild(b);
      } else page.appendChild(h("div", { "class": "fr-" + (p.kind || "part") }, [h("p", { "class": "fr-h", text: p.title }), h("p", { html: p.body })]));
    });
    side.innerHTML = '<p class="try-hint">Select a comment to read how the agency answered it and the rule text the answer produced.</p>';
    count.textContent = "0 of " + comments.length + " comments read";
    list.replaceWith(h("div", { "class": "try-preamble" }, [page, h("div", { "class": "try-side" }, [side, count])]));
  };

  /* ---- curve: when to stop. hours="40" budget="12". Items: "**hour | must.** what was found at that hour" (must marks a finding
          without which closure is not honest). The reader drags to the hour they would stop and reads what that choice means. ---- */
  KINDS.curve = function (root) {
    var list = topList(root); if (!list) return;
    var H = +opt(root, "hours") || 40, budget = +opt(root, "budget") || 0, unit = opt(root, "unit") || "hours";
    var items = kids(list, "li").map(function (li) { var L = lead(li), p = L.head.split("|").map(function (x) { return x.trim(); }); return { at: +p[0], must: /must/i.test(p[1] || ""), body: L.rest }; }).filter(function (x) { return x.at >= 0; }).sort(function (a, b) { return a.at - b.at; });
    var W = 320, Hh = 120, NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 " + W + " " + Hh); svg.setAttribute("class", "cv-chart"); svg.setAttribute("aria-hidden", "true");
    function x(t) { return 8 + (W - 16) * t / H; } function y(n) { return Hh - 14 - (Hh - 28) * n / items.length; }
    var path = "M" + x(0) + " " + y(0), n = 0;
    items.forEach(function (it) { path += " H" + x(it.at) + " V" + y(++n); }); path += " H" + x(H);
    var line = document.createElementNS(NS, "path"); line.setAttribute("d", path); line.setAttribute("class", "cv-line"); svg.appendChild(line);
    if (budget) { var bl = document.createElementNS(NS, "line"); bl.setAttribute("x1", x(budget)); bl.setAttribute("x2", x(budget)); bl.setAttribute("y1", 4); bl.setAttribute("y2", Hh - 14); bl.setAttribute("class", "cv-budget"); svg.appendChild(bl); var bt = document.createElementNS(NS, "text"); bt.setAttribute("x", x(budget) + 3); bt.setAttribute("y", 12); bt.setAttribute("class", "cv-txt"); bt.textContent = "budget"; svg.appendChild(bt); }
    var dots = items.map(function (it, i) { var c = document.createElementNS(NS, "circle"); c.setAttribute("cx", x(it.at)); c.setAttribute("cy", y(i + 1)); c.setAttribute("r", 4); c.setAttribute("class", "cv-dot" + (it.must ? " must" : "")); svg.appendChild(c); return c; });
    var marker = document.createElementNS(NS, "line"); marker.setAttribute("y1", 4); marker.setAttribute("y2", Hh - 14); marker.setAttribute("class", "cv-mark"); svg.appendChild(marker);
    var ax = document.createElementNS(NS, "text"); ax.setAttribute("x", W - 8); ax.setAttribute("y", Hh - 2); ax.setAttribute("class", "cv-txt"); ax.setAttribute("text-anchor", "end"); ax.textContent = unit + " →"; svg.appendChild(ax);
    var ay = document.createElementNS(NS, "text"); ay.setAttribute("x", 2); ay.setAttribute("y", 12); ay.setAttribute("class", "cv-txt"); ay.textContent = "new authority found ↑"; svg.appendChild(ay);
    var range = h("input", { type: "range", min: 0, max: H, step: 1, value: Math.round(H / 4), "aria-label": "Hour at which you stop" }), read = h("p", { "class": "tl-year", role: "status", "aria-live": "polite" }), panel = h("div", { "class": "try-panel" });
    function draw() {
      var t = +range.value, got = items.filter(function (it) { return it.at <= t; }), left = items.filter(function (it) { return it.at > t; }), mustLeft = left.filter(function (it) { return it.must; }), last = items.length ? items[items.length - 1].at : 0, lastMust = items.filter(function (it) { return it.must; }).slice(-1)[0];
      marker.setAttribute("x1", x(t)); marker.setAttribute("x2", x(t)); dots.forEach(function (d, i) { d.classList.toggle("lit", items[i].at <= t); });
      read.innerHTML = "<strong>" + t + "</strong> <span>" + unit + " in: " + got.length + " of " + items.length + " findings made</span>";
      var verdict;
      if (mustLeft.length) verdict = '<p class="bad"><strong>You stopped. You did not close.</strong> Still unfound: ' + mustLeft.map(function (it) { return strip(it.body).split(/(?<=[.?!])\s/)[0]; }).join(" ") + "</p>";
      else if (t <= last + 2) verdict = '<p class="good"><strong>Analytical closure is defensible here.</strong> Every finding the analysis needs is in, the outline accounts for the question, and the log can say why you stopped.</p>';
      else verdict = '<p class="bad"><strong>The last new authority arrived at hour ' + last + ".</strong> Every hour since is polish, and the client is paying for it. Closure was available " + (t - last) + " hours ago.</p>";
      if (budget && t > budget) verdict += '<p class="bad"><strong>Past the budget.</strong> Practical closure arrived at hour ' + budget + (lastMust && lastMust.at > budget ? ", before the research was done. The honest move was to stop there, write down what remained, and tell the supervisor." : ". If you kept going, someone has to approve the overrun.") + "</p>";
      panel.innerHTML = verdict + (got.length ? '<p class="ct-h">Found so far</p><ul class="cv-found">' + got.map(function (it) { return "<li><b>" + it.at + "h</b> " + it.body + (it.must ? ' <span class="try-pill k-case">needed</span>' : "") + "</li>"; }).join("") + "</ul>" : '<p class="try-hint">Nothing yet. Drag forward.</p>');
    }
    range.addEventListener("input", draw);
    list.replaceWith(h("div", { "class": "try-curve" }, [read, svg, h("div", { "class": "tl-slider cv-slider" }, [range]), h("p", { "class": "tl-ends", html: "<span>0</span><span>" + H + " " + unit + "</span>" }), panel]));
    draw();
  };

  /* ---- diff: two versions of a bill's text. First paragraph as introduced, second as reported or enacted, then a task list asking
          what the change signals (the [x] option is right), then a --- line and the committee report's explanation. ------------- */
  KINDS.diff = function (root) {
    var ps = kids(root, "p").filter(function (p) { return !p.classList.contains("try-head") && !p.classList.contains("try-lead"); }), list = topList(root), hr = kids(root, "hr")[0];
    if (ps.length < 2) return;
    var a = ps[0].innerHTML, b = ps[1].innerHTML, labels = splitBar(opt(root, "versions")); if (labels.length < 2) labels = ["As introduced", "As reported"];
    var seg = h("div", { "class": "try-seg", role: "group", "aria-label": "Version" }), text = h("p", { "class": "df-text" }), mode = 2;
    function draw() {
      Array.prototype.forEach.call(seg.children, function (x, i) { x.setAttribute("aria-pressed", String(i === mode)); });
      if (mode === 0) text.innerHTML = a; else if (mode === 1) text.innerHTML = b;
      else text.innerHTML = wordDiff(strip(a), strip(b)).map(function (w) { return w.k === "same" ? w.t : "<" + (w.k === "del" ? "del" : "ins") + ">" + w.t + "</" + (w.k === "del" ? "del" : "ins") + ">"; }).join("");
    }
    [labels[0], labels[1], "What changed"].forEach(function (t, i) { seg.appendChild(h("button", { type: "button", text: t, onclick: function () { mode = i; draw(); } })); });
    ps[0].replaceWith(h("div", { "class": "try-diff" }, [seg, text])); ps[1].remove(); draw();
    var after = h("div", { "class": "try-answer", hidden: "" }), n;
    if (hr) { while ((n = hr.nextSibling)) after.appendChild(n); hr.replaceWith(after); }
    if (list) {
      var items = kids(list, "li"), box = h("div", { "class": "try-opts" }), out = live();
      items.forEach(function (li) {
        var btn = h("button", { type: "button", "class": "try-opt", html: own(li) });
        btn.addEventListener("click", function () {
          Array.prototype.forEach.call(box.children, function (x) { x.classList.remove("ok", "no"); });
          var ok = isRight(li); btn.classList.add(ok ? "ok" : "no");
          out.innerHTML = '<p class="' + (ok ? "good" : "bad") + '"><strong>' + (ok ? "Yes." : "Not this one.") + "</strong> " + fb(li) + "</p>";
          if (ok) after.hidden = false;
        });
        box.appendChild(btn);
      });
      list.replaceWith(h("div", {}, [h("p", { "class": "try-hint", text: opt(root, "ask") || "What does the change signal?" }), box, out]));
    }
  };

  /* ---- pairs: terms students confuse, two at a time. Items: "**term A | term B.**" with two nested lines, A's definition then B's.
          The reader is shown the two definitions and assigns the terms before the card flips. ------------------------------------- */
  KINDS.pairs = function (root) {
    var list = topList(root); if (!list) return;
    var pairs = kids(list, "li").map(function (li) { var L = lead(li), t = L.head.split("|").map(function (x) { return x.trim(); }), sub = kids(li, "ul,ol")[0], d = sub ? kids(sub, "li").map(function (x) { return own(x); }) : []; return { a: t[0], b: t[1] || "", da: d[0] || "", db: d[1] || "", why: L.rest }; }).filter(function (p) { return p.b && p.db; });
    var i = 0, flip = false, score = 0, tried = 0, card = h("div", { "class": "pr-card" }), out = live(), pos = h("span", { "class": "try-score" });
    var next = h("button", { type: "button", "class": "try-btn ghost", text: "Next pair →" });
    function draw() {
      var p = pairs[i], first = flip ? p.b : p.a, second = flip ? p.a : p.b, d1 = flip ? p.db : p.da, d2 = flip ? p.da : p.db, answered = false;
      card.innerHTML = ""; out.innerHTML = "";
      card.appendChild(h("p", { "class": "pr-h", html: "<em>" + p.a + "</em> or <em>" + p.b + "</em>? Which definition is which?" }));
      [[d1, first], [d2, second]].forEach(function (row, k) {
        var def = h("div", { "class": "pr-def" }, [h("p", { html: row[0] })]), opts = h("div", { "class": "try-seg" });
        [p.a, p.b].forEach(function (t) { opts.appendChild(h("button", { type: "button", text: t, onclick: function () {
          if (answered) return; answered = true; tried++;
          var ok = t === row[1]; if (ok) score++;
          Array.prototype.forEach.call(opts.children, function (x) { x.setAttribute("aria-pressed", String(x.textContent === t)); });
          var other = card.querySelectorAll(".pr-def")[1 - k].querySelector(".try-seg"); Array.prototype.forEach.call(other.children, function (x) { x.setAttribute("aria-pressed", String(x.textContent === (k ? first : second))); });
          card.querySelectorAll(".pr-def").forEach(function (d, j) { d.insertBefore(h("span", { "class": "pr-tag", text: j === 0 ? first : second }), d.firstChild); });
          out.innerHTML = '<p class="' + (ok ? "good" : "bad") + '"><strong>' + (ok ? "Right." : "The other way round.") + "</strong> " + p.why + "</p>";
          pos.textContent = score + " of " + tried + " right";
        } })); });
        def.appendChild(opts); card.appendChild(def);
      });
      pos.textContent = tried ? score + " of " + tried + " right" : (i + 1) + " of " + pairs.length;
    }
    next.addEventListener("click", function () { i = (i + 1) % pairs.length; flip = Math.random() < 0.5; draw(); });
    list.replaceWith(h("div", { "class": "try-pairs" }, [card, out, h("p", { "class": "try-actions" }, [next, pos])]));
    flip = Math.random() < 0.5; draw();
  };

  Array.prototype.forEach.call(blocks, function (root, idx) {
    var k = root.getAttribute("data-kind");
    if (KINDS[k]) { try { KINDS[k](root, idx); root.classList.add("live"); } catch (e) { if (window.console) console.error("interactive failed:", k, e); } }
  });
})();

/* 7. Defined terms: the glossary definition opens on hover, keyboard focus, or tap. It stays open while
      the pointer is on it and closes with Escape. */
(function () {
  var terms = document.querySelectorAll(".gloss[data-def]");
  if (!terms.length) return;
  var tip = document.createElement("div"), cur = null, timer = null;
  tip.className = "gloss-tip"; tip.id = "gloss-tip"; tip.setAttribute("role", "tooltip"); tip.hidden = true;
  document.body.appendChild(tip);
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
    t.setAttribute("tabindex", "0");
    t.addEventListener("mouseenter", function () { show(t); });
    t.addEventListener("mouseleave", later);
    t.addEventListener("focus", function () { show(t); });
    t.addEventListener("blur", later);
    t.addEventListener("click", function (e) { e.stopPropagation(); if (cur === t && !tip.hidden) hide(); else show(t); });
  });
  tip.addEventListener("mouseenter", function () { clearTimeout(timer); });
  tip.addEventListener("mouseleave", later);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
  document.addEventListener("click", function (e) { if (!tip.contains(e.target)) hide(); });
})();

/* 8. The reader's Research Log: one log for the whole book, kept in this browser. Interactives add entries
      (every step of a resolver, every citator verdict, every drafted question); the reader opens it from the
      masthead, downloads it as text, or clears it. Nothing leaves the device. */
(function () {
  var KEY = "qm:log:v1";
  function all() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a.slice(-400))); } catch (e) {} }
  var nav = document.querySelector(".topnav"); if (!nav) return;
  var btn = document.createElement("button"); btn.type = "button"; btn.id = "qm-logbtn"; btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "qm-logpanel");
  var panel = document.createElement("aside"); panel.id = "qm-logpanel"; panel.hidden = true; panel.setAttribute("aria-label", "Your Research Log");
  function esc(t) { return String(t || "").replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function count() { var n = all().length; btn.textContent = "Research Log" + (n ? " (" + n + ")" : ""); }
  function render() {
    var a = all(), html = '<div class="lg-head"><strong>Your Research Log</strong><span>' + a.length + ' entr' + (a.length === 1 ? "y" : "ies") + ', kept in this browser only</span><button type="button" class="lg-close" aria-label="Close">×</button></div>';
    if (!a.length) html += '<p class="lg-empty">Empty so far. The resolvers in Chapters 6 and 7, the citator in Chapter 5, the first-question drafter in Chapter 3, and the docket route in Chapter 13 each write entries here as you work them. Treat it as the log Chapter 3 asks you to keep: question, type, source, findings, next question.</p>';
    else html += '<ol class="lg-list">' + a.slice().reverse().map(function (e) { return "<li><p class=\"lg-q\"><span class=\"lg-type\">" + esc(e.type) + "</span>" + esc(e.q) + "</p><p class=\"lg-f\"><b>Source</b> " + esc(e.source) + "</p><p class=\"lg-f\"><b>Findings</b> " + esc(e.found) + "</p>" + (e.next ? "<p class=\"lg-f\"><b>Next question</b> " + esc(e.next) + "</p>" : "") + "<p class=\"lg-meta\">" + esc(e.page) + " · " + esc(e.when) + "</p></li>"; }).join("") + "</ol>";
    html += '<p class="lg-actions"><button type="button" class="try-btn small" id="lg-dl">Download as text</button> <button type="button" class="try-btn ghost small" id="lg-clear">Clear the log</button></p>';
    panel.innerHTML = html;
    panel.querySelector(".lg-close").addEventListener("click", close);
    panel.querySelector("#lg-clear").addEventListener("click", function () { if (confirm("Clear every entry in your Research Log?")) { save([]); render(); count(); } });
    panel.querySelector("#lg-dl").addEventListener("click", function () {
      var txt = "RESEARCH LOG\n\n" + all().map(function (e, i) { return (i + 1) + ". Research Question: " + e.q + "\n   Question Type: " + e.type + "\n   Source Consulted: " + e.source + "\n   Findings: " + e.found + (e.next ? "\n   Next Question: " + e.next : "") + "\n   (" + e.page + ", " + e.when + ")\n"; }).join("\n");
      var blob = new Blob([txt], { type: "text/plain" }), u = URL.createObjectURL(blob), a2 = document.createElement("a"); a2.href = u; a2.download = "research-log.txt"; document.body.appendChild(a2); a2.click(); a2.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 500);
    });
  }
  function open() { render(); panel.hidden = false; btn.setAttribute("aria-expanded", "true"); var c = panel.querySelector(".lg-close"); if (c) c.focus(); }
  function close() { panel.hidden = true; btn.setAttribute("aria-expanded", "false"); btn.focus(); }
  btn.addEventListener("click", function () { if (panel.hidden) open(); else close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });
  nav.appendChild(btn); document.body.appendChild(panel); count();
  window.qmLog = {
    add: function (e) {
      var a = all(), t = document.title.replace(/\s*&mdash;.*$|\s*—.*$/, ""), d = new Date();
      a.push({ q: e.q || "", type: e.type || "", source: e.source || "", found: e.found || "", next: e.next || "", page: t, when: d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
      save(a); count(); if (!panel.hidden) render();
    },
    all: all
  };
})();
