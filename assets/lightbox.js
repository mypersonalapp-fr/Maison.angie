/* Maison Angie : plateau tournant pour les photos de la collection */
(function () {
  'use strict';
  var doc = document, items = [], idx = 0, lastFocus = null, box, ring, stage, nameEl, legEl, link, cnt, imgs = [], thetaDeg = 0;

  var css = '.lb{position:fixed;inset:0;z-index:2147483647;background:#FFFFFF;display:none;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;color:#1F1B1A;font-family:Karla,sans-serif}' +
    '.lb.on{display:flex}' +
    '.lb-stage{position:relative;width:100%;height:calc(100vh - 230px);min-height:300px;perspective:1500px;perspective-origin:50% 45%}' +
    '.lb-ring{position:absolute;left:50%;top:50%;transform-style:preserve-3d;transition:transform .9s cubic-bezier(.45,.05,.25,1)}' +
    '.lb-it{position:absolute;left:0;top:0;transform-style:preserve-3d;-webkit-transform-style:preserve-3d;cursor:pointer}' +
    '.lb-f,.lb-b{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transition:filter .9s ease}' +
    '.lb-f{background:#FFFFFF}.lb-f img{width:100%;height:100%;object-fit:contain;display:block}' +
    '.lb-b{transform:rotateY(180deg);background:#F2EEEB;box-shadow:inset 0 0 0 1px rgba(31,27,26,.12)}' +
    '.lb-clip{position:absolute;left:50%;top:-12px;width:16px;height:34px;margin-left:-8px;background:#B9A27A;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.5);backface-visibility:hidden;-webkit-backface-visibility:hidden}' +
    '.lb-clip.k{transform:rotateY(180deg)}' +
    '.lb-cap{margin-top:12px;text-align:center;line-height:1.5;padding:0 72px}' +
    '.lb-cap b{display:block;font:500 24px "Cormorant Garamond",serif}' +
    '.lb-cap span{font-size:13px;opacity:.75}' +
    '.lb-cap a{display:inline-block;margin-top:8px;color:#1F1B1A;font-size:11px;letter-spacing:.2em;text-transform:uppercase;text-decoration:underline;text-underline-offset:4px}' +
    '.lb button{position:absolute;background:#FFFFFF;border:1px solid rgba(31,27,26,.5);color:#1F1B1A;width:48px;height:48px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;z-index:5}' +
    '.lb button:hover,.lb button:focus-visible{background:#F2EEEB;outline:none;border-color:#1F1B1A}' +
    '.lb-p{left:16px;top:45%}.lb-n{right:16px;top:45%}.lb-x{right:16px;top:16px}' +
    '.lb-c{position:absolute;left:20px;top:28px;font-size:11px;letter-spacing:.2em;opacity:.7}' +
    'figure img{cursor:zoom-in}' +
    '@media(max-width:640px){.lb-p,.lb-n{top:auto;bottom:18px}.lb-cap{padding:0 76px}}' +
    '@media(prefers-reduced-motion:reduce){.lb-ring,.lb-it{transition:none}}';
  var st = doc.createElement('style'); st.textContent = css; doc.head.appendChild(st);

  var ic = function (d) { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="' + d + '"/></svg>'; };

  function build() {
    box = doc.createElement('div');
    box.className = 'lb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Photos de la collection');
    box.innerHTML = '<div class="lb-c" aria-live="polite"></div>' +
      '<button type="button" class="lb-x" aria-label="Fermer">' + ic('M6 6l12 12M18 6 6 18') + '</button>' +
      '<button type="button" class="lb-p" aria-label="Gâteau précédent">' + ic('M15 5l-7 7 7 7') + '</button>' +
      '<button type="button" class="lb-n" aria-label="Gâteau suivant">' + ic('M9 5l7 7-7 7') + '</button>' +
      '<div class="lb-stage"><div class="lb-ring"></div></div>' +
      '<div class="lb-cap"><b></b><span></span><br><a href="#">Voir la catégorie</a></div>';
    doc.body.appendChild(box);
    stage = box.querySelector('.lb-stage'); ring = box.querySelector('.lb-ring');
    nameEl = box.querySelector('b'); legEl = box.querySelector('span'); link = box.querySelector('.lb-cap a'); cnt = box.querySelector('.lb-c');
    box.querySelector('.lb-p').addEventListener('click', function () { go(-1); });
    box.querySelector('.lb-n').addEventListener('click', function () { go(1); });
    box.querySelector('.lb-x').addEventListener('click', close);
    link.addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box || e.target === stage) close(); });
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    });
    window.addEventListener('resize', function () { if (box.classList.contains('on')) layout(); });
  }

  /* Dispose les photos sur un cylindre : la photo choisie est devant, les autres tournent autour */
  function layout() {
    var n = items.length, vw = window.innerWidth, vh = stage.clientHeight;
    var h = Math.min(vh * 0.92, 560), w = Math.min(h * 0.8, vw * 0.74);
    h = Math.min(h, w / 0.8);
    var R = n > 2 ? Math.max((w / 2 + 14) / Math.tan(Math.PI / n), w * 0.9) : w * 0.9;
    thetaDeg = 360 / n;
    ring.style.width = ring.style.height = '0px';
    imgs.forEach(function (it, i) {
      it.style.width = w + 'px'; it.style.height = h + 'px';
      it.style.marginLeft = (-w / 2) + 'px'; it.style.marginTop = (-h / 2) + 'px';
      it.style.transform = 'rotateY(' + (i * thetaDeg) + 'deg) translateZ(' + R + 'px)';
    });
    ring.dataset.r = R;
    turn(true);
  }

  var rot = 0;
  function turn(instant) {
    var R = parseFloat(ring.dataset.r || 0);
    if (instant) ring.style.transition = 'none';
    ring.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + (-rot) + 'deg)';
    if (instant) { void ring.offsetWidth; ring.style.transition = ''; }
    var n = items.length;
    imgs.forEach(function (it, i) {
      var d = Math.min((i - idx + n) % n, (idx - i + n) % n);
      var fl = d === 0 ? 'none' : 'brightness(.8)';
      it.querySelector('.lb-f').style.filter = fl; it.querySelector('.lb-b').style.filter = fl;
      it.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
    });
    var c = items[idx];
    nameEl.textContent = c.nom; legEl.textContent = c.legende || '';
    if (c.cat) { link.hidden = false; link.setAttribute('href', '#collection/' + c.cat); } else link.hidden = true;
    cnt.textContent = (idx + 1) + ' / ' + n;
  }

  /* d = ±1 : le plateau tourne d'un cran, toujours dans le même sens (rotation continue) */
  function go(d) {
    idx = (idx + d + items.length) % items.length;
    rot += d * thetaDeg;
    turn(false);
  }

  function open(list, i) {
    if (!box) build();
    items = list; idx = i; rot = i * (360 / list.length); lastFocus = doc.activeElement;
    ring.textContent = ''; imgs = [];
    items.forEach(function (c, k) {
      var it = doc.createElement('div'); it.className = 'lb-it';
      var f = doc.createElement('div'); f.className = 'lb-f'; var im = doc.createElement('img'); im.src = c.src; im.alt = c.nom; f.appendChild(im);
      var bk = doc.createElement('div'); bk.className = 'lb-b';
      it.appendChild(bk); it.appendChild(f);
      it.addEventListener('click', function () {
        var n = items.length, diff = ((k - idx) % n + n) % n;
        if (diff === 1) go(1); else if (diff === n - 1) go(-1);
      });
      ring.appendChild(it); imgs.push(it);
    });
    box.classList.add('on'); doc.body.style.overflow = 'hidden';
    box.querySelector('.lb-p').hidden = box.querySelector('.lb-n').hidden = items.length < 2;
    layout();
    box.querySelector('.lb-x').focus();
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

  doc.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'IMG') return;
    var fig = t.closest('figure');
    if (!(fig && fig.parentNode && /Gal$/.test(fig.parentNode.id))) return;
    e.preventDefault();
    var figs = Array.prototype.slice.call(fig.parentNode.querySelectorAll('figure img')).filter(function (m) { return m.getAttribute('src'); });
    var list = figs.map(function (m) {
      var f = m.getAttribute('src').split('/').pop();
      var c = (window.MA_CAT || []).filter(function (x) { return x.img && x.img.split('/').pop() === f; })[0] || {};
      return { src: m.getAttribute('src'), nom: c.nom || m.alt, legende: c.legende, cat: c.cat };
    });
    open(list, figs.indexOf(t));
  });
})();
