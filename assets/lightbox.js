/* Maison Angie : agrandissement des photos (flèches, clavier, balayage) */
(function () {
  'use strict';
  var doc = document, list = [], idx = 0, lastFocus = null, box, img, cap, link, prevB, nextB, closeB;

  var css = '.lb{position:fixed;inset:0;z-index:9999;background:rgba(31,27,26,.97);display:none;align-items:center;justify-content:center;flex-direction:column;padding:56px 72px 24px;color:#F2EEEB;font-family:Karla,sans-serif}' +
    '.lb.on{display:flex}' +
    '.lb img{max-width:100%;max-height:calc(100vh - 170px);object-fit:contain;display:block;opacity:1;transition:opacity .25s}' +
    '.lb img.sw{opacity:0}' +
    '.lb-cap{margin-top:16px;text-align:center;line-height:1.5}' +
    '.lb-cap b{display:block;font:500 24px "Cormorant Garamond",serif;font-weight:500}' +
    '.lb-cap span{font-size:13px;opacity:.75}' +
    '.lb-cap a{display:inline-block;margin-top:8px;color:#F2EEEB;font-size:11px;letter-spacing:.2em;text-transform:uppercase;text-decoration:underline;text-underline-offset:4px}' +
    '.lb button{position:absolute;background:none;border:1px solid rgba(242,238,235,.45);color:#F2EEEB;width:48px;height:48px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}' +
    '.lb button:hover,.lb button:focus-visible{background:rgba(242,238,235,.14);outline:none;border-color:#F2EEEB}' +
    '.lb-p{left:16px;top:50%;margin-top:-24px}.lb-n{right:16px;top:50%;margin-top:-24px}.lb-x{right:16px;top:16px}' +
    '.lb-c{position:absolute;left:20px;top:24px;font-size:11px;letter-spacing:.2em;opacity:.7}' +
    '.js .stag .tile img,figure img{cursor:zoom-in}' +
    '@media(max-width:640px){.lb{padding:64px 12px 16px}.lb-p,.lb-n{top:auto;bottom:20px;margin:0}.lb-p{left:16px}.lb-n{right:16px}.lb img{max-height:calc(100vh - 230px)}}';
  var st = doc.createElement('style'); st.textContent = css; doc.head.appendChild(st);

  var arrow = function (d) { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="' + d + '"/></svg>'; };

  function build() {
    box = doc.createElement('div');
    box.className = 'lb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Photo agrandie');
    box.innerHTML = '<div class="lb-c" aria-live="polite"></div>' +
      '<button type="button" class="lb-x" aria-label="Fermer">' + arrow('M6 6l12 12M18 6 6 18') + '</button>' +
      '<button type="button" class="lb-p" aria-label="Gâteau précédent">' + arrow('M15 5l-7 7 7 7') + '</button>' +
      '<button type="button" class="lb-n" aria-label="Gâteau suivant">' + arrow('M9 5l7 7-7 7') + '</button>' +
      '<img alt=""><div class="lb-cap"><b></b><span></span><br><a href="#"></a></div>';
    doc.body.appendChild(box);
    img = box.querySelector('img'); cap = box.querySelector('.lb-cap');
    link = cap.querySelector('a'); link.textContent = 'Voir la catégorie';
    prevB = box.querySelector('.lb-p'); nextB = box.querySelector('.lb-n'); closeB = box.querySelector('.lb-x');
    prevB.addEventListener('click', function () { go(-1); });
    nextB.addEventListener('click', function () { go(1); });
    closeB.addEventListener('click', close);
    link.addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    });
  }

  function show() {
    var it = list[idx];
    img.classList.add('sw');
    setTimeout(function () {
      img.src = it.src; img.alt = it.nom;
      img.classList.remove('sw');
    }, 120);
    cap.querySelector('b').textContent = it.nom;
    cap.querySelector('span').textContent = it.legende || '';
    if (it.cat) { link.hidden = false; link.setAttribute('href', '#collection/' + it.cat); } else { link.hidden = true; }
    box.querySelector('.lb-c').textContent = (idx + 1) + ' / ' + list.length;
    var multi = list.length > 1;
    prevB.hidden = nextB.hidden = !multi;
  }
  function go(d) { idx = (idx + d + list.length) % list.length; show(); }
  function open(items, i) {
    if (!box) build();
    list = items; idx = i; lastFocus = doc.activeElement;
    box.classList.add('on'); doc.body.style.overflow = 'hidden';
    show(); closeB.focus();
  }
  function close() {
    if (!box || !box.classList.contains('on')) return;
    box.classList.remove('on'); doc.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  doc.addEventListener('keydown', function (e) {
    if (!box || !box.classList.contains('on')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
  });
  window.addEventListener('hashchange', close);

  function fromCat(src) {
    var cat = (window.MA_CAT || []).filter(function (c) { return c.img; });
    var items = cat.map(function (c) { return { src: c.img, nom: c.nom, legende: c.legende, cat: c.cat }; });
    var base = src.split('/').pop(), i = 0;
    items.forEach(function (it, k) { if (it.src.split('/').pop() === base) i = k; });
    items.forEach(function (it) { it.src = src.replace(/[^\/]*$/, '') + it.src.split('/').pop(); });
    return { items: items, i: i };
  }

  doc.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'IMG') return;
    var tile = t.closest('.stag .tile'), fig = t.closest('figure');
    if (!tile && !(fig && fig.parentNode && /Gal$/.test(fig.parentNode.id))) return;
    e.preventDefault();
    var r = fromCat(t.getAttribute('src'));
    if (fig) {
      var figs = Array.prototype.slice.call(fig.parentNode.querySelectorAll('figure img')).filter(function (m) { return m.getAttribute('src'); });
      var items = figs.map(function (m) {
        var c = (window.MA_CAT || []).filter(function (x) { return x.img && x.img.split('/').pop() === m.getAttribute('src').split('/').pop(); })[0] || {};
        return { src: m.getAttribute('src'), nom: c.nom || m.alt, legende: c.legende, cat: c.cat };
      });
      open(items, figs.indexOf(t));
    } else open(r.items, r.i);
  });
})();
