/* watchlist — renders window.SHOW = {title, meta, note, groups:[{label,count,href(i),url}]} */
(function () {
  var S = window.SHOW;
  var KEY = 'wl_' + location.pathname;
  var seen = {}, last = null, gi = 0;
  try { seen = JSON.parse(localStorage.getItem(KEY + '_seen') || '{}'); } catch (e) {}
  try { last = localStorage.getItem(KEY + '_last'); } catch (e) {}

  var tabs = document.getElementById('tabs');
  var grid = document.getElementById('grid');

  function group(i) { return S.groups[i]; }
  function gkey(i, n) { return group(i).label + ':' + n; }

  function paint() {
    var g = group(gi);
    grid.innerHTML = '';
    if (g.count === 1) {                       // single movie -> one big button
      var h = document.createElement('a');
      h.className = 'hero';
      h.href = g.href(1);
      h.rel = 'noopener';
      h.dataset.k = gkey(gi, 1);
      h.innerHTML = '&#9654; Tonton sekarang';
      grid.appendChild(h);
      grid.style.gridTemplateColumns = '1fr';
      return;
    }
    grid.style.gridTemplateColumns = '';
    for (var n = 1; n <= g.count; n++) {
      var k = gkey(gi, n);
      var a = document.createElement('a');
      a.className = 'ep' + (seen[k] ? ' seen' : '') + (last === k ? ' last' : '');
      a.textContent = n;
      a.href = g.href(n);
      a.rel = 'noopener';
      a.dataset.k = k;
      grid.appendChild(a);
    }
    if (tabs) {
      [].forEach.call(tabs.children, function (b) {
        b.setAttribute('aria-pressed', String(Number(b.dataset.i) === gi));
      });
    }
  }

  if (tabs && S.groups.length > 1) {
    S.groups.forEach(function (g, i) {
      var b = document.createElement('button');
      b.textContent = g.label;
      b.dataset.i = i;
      b.onclick = function () { gi = i; paint(); window.scrollTo(0, 0); };
      tabs.appendChild(b);
    });
  } else if (tabs) {
    tabs.style.display = 'none';
  }

  // mark watched on the way out — the localStorage write is synchronous, so it survives
  // the same-tab navigation to the player (Safari back-swipe brings the grid back)
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('a.ep, a.hero');
    if (!a) return;
    var k = a.dataset.k;
    seen[k] = 1; last = k;
    try {
      localStorage.setItem(KEY + '_seen', JSON.stringify(seen));
      localStorage.setItem(KEY + '_last', k);
    } catch (e) {}
    [].forEach.call(grid.children, function (x) {
      x.classList.toggle('seen', !!seen[x.dataset.k]);
      x.classList.toggle('last', x.dataset.k === k);
    });
  });

  ['title', 'meta'].forEach(function (f) {
    var el = document.querySelector('[data-f=' + f + ']');
    if (el) el.textContent = S[f];
  });
  document.title = S.title;

  // resume season: default to the one holding the last-watched episode
  if (last) {
    S.groups.forEach(function (g, i) { if (String(last).indexOf(g.label + ':') === 0) gi = i; });
  }
  paint();
})();
