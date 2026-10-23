/* Maison Angie : un balayage vers la droite ouvre le menu, vers la gauche le ferme */
(function () {
  'use strict';
  var d = document, x0 = 0, y0 = 0, t0 = 0, ok = false;
  var st = d.createElement('style'); st.textContent = 'html,body{overscroll-behavior-x:none}'; d.head.appendChild(st);
  function blocked(t) {
    return !t || !t.closest || t.closest('input,textarea,select,video,.lb,[role=tab],.tabs');
  }
  d.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) { ok = false; return; }
    var t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now();
    ok = !blocked(e.target) && !(d.querySelector('.lb.on'));
  }, { passive: true });
  d.addEventListener('touchend', function (e) {
    if (!ok) return; ok = false;
    var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    if (Math.abs(dx) < 70 || Math.abs(dy) > 60 || Math.abs(dx) < Math.abs(dy) * 2 || Date.now() - t0 > 700) return;
    var drawer = d.getElementById('drawer');
    if (!drawer) return;
    if (dx > 0 && drawer.hidden) d.getElementById('menuBtn').click();
    else if (dx < 0 && !drawer.hidden) d.getElementById('menuClose').click();
  }, { passive: true });
})();
