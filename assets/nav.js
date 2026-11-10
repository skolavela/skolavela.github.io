/* ==========================================================================
   Velappky - pravidlo zobrazení složek (sdílí ho rozcestník i odkaz „zpět“ v appkách)
   - složka bez appek se nezobrazuje nikde
   - složka s méně než MIN_FOLDER appkami se na úvodu rozpustí: její appky jsou přímo na úvodu
   - složka s MIN_FOLDER a více appkami se zobrazuje jako složka
   Data jsou v assets/data.js (window.VELAPPKY).
   ========================================================================== */
(function (root) {
  "use strict";
  var MIN_FOLDER = 3; // práh: od kolika appek se složka na úvodu ukazuje jako složka

  var countApps = function (node) {
    if (node.type === "app") return 1;
    return (node.items || []).reduce(function (s, c) { return s + countApps(c); }, 0);
  };
  var isEmpty = function (node) { return node.type === "folder" && countApps(node) === 0; };
  // rozpuštěná = složka na úvodu (nejvyšší úroveň) s 1 až MIN_FOLDER-1 appkami
  var isDissolved = function (node, depth) {
    if (node.type !== "folder" || depth) return false;
    var n = countApps(node);
    return n > 0 && n < MIN_FOLDER;
  };
  // obsah složky bez prázdných podsložek
  var visibleItems = function (items) { return (items || []).filter(function (c) { return !isEmpty(c); }); };
  // co je na úvodu: nejdřív složky (MIN_FOLDER+ appek), pak appky z rozpuštěných složek (a appky z nejvyšší úrovně), v pořadí dat
  var homeItems = function (data) {
    var folders = [], loose = [];
    (data || []).forEach(function (n) {
      if (n.type === "app") { loose.push(n); return; }
      if (isEmpty(n)) return;
      if (isDissolved(n, 0)) visibleItems(n.items).forEach(function (c) { loose.push(c); });
      else folders.push(n);
    });
    return folders.concat(loose);
  };
  // najde cestu složek k appce podle adresy
  var trailFor = function (data, path) {
    var clean = function (u) { return String(u || "").replace(/index\.html$/, "").replace(/\/?$/, "/"); };
    var want = clean(path), found = null;
    var walk = function (items, trail) {
      (items || []).forEach(function (n) {
        if (found) return;
        if (n.type === "folder") walk(n.items, trail.concat(n));
        else if (clean(n.url) === want) found = trail;
      });
    };
    walk(data, []);
    return found;
  };
  // kam vede „‹ zpět“ z appky: do složky, nebo na úvod, když se složka na úvodu nezobrazuje
  var backFor = function (data, path) {
    var trail = trailFor(data, path);
    if (!trail || !trail.length || isDissolved(trail[0], 0)) return { href: "/", label: "Velappky" };
    return { href: "/#/" + trail.map(function (f) { return f.id; }).join("/"), label: trail[trail.length - 1].name };
  };

  root.VELAPPKY_NAV = { MIN_FOLDER: MIN_FOLDER, countApps: countApps, isEmpty: isEmpty, isDissolved: isDissolved,
    visibleItems: visibleItems, homeItems: homeItems, trailFor: trailFor, backFor: backFor };

  // v appce: přepíše odkaz zpět podle dat (v HTML zůstává správná výchozí hodnota pro případ bez JS)
  if (root.document && root.VELAPPKY) {
    var apply = function () {
      var a = document.querySelector(".a-back");
      if (!a || a.hasAttribute("data-back-fixed") || !trailFor(root.VELAPPKY, location.pathname)) return;
      var b = backFor(root.VELAPPKY, location.pathname);
      a.setAttribute("href", b.href);
      var l = a.querySelector(".a-back__label");
      if (l) l.textContent = b.label;
      a.setAttribute("aria-label", "Zpět: " + b.label);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
  }
})(typeof window !== "undefined" ? window : this);
