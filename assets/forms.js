/* Envoi des formulaires vers le service de réception de Maison Angie.
   Tant que ENDPOINT est vide, les formulaires restent en mode test (rien n'est transmis). */
(function () {
  'use strict';
  var ENDPOINT = 'https://maison-angie-api.ashleymubama.workers.dev';
  if (!ENDPOINT) return;

  var pj = document.getElementById('pj');
  if (pj) {
    var wrap = pj.parentNode;
    wrap.innerHTML = '<span class="lbl">Photo d\'inspiration</span><p style="margin:0;font-size:15px;color:#555;line-height:1.6">Vous avez une photo ou un modèle ? Répondez simplement à l\'e-mail de confirmation en le joignant.</p>';
  }

  function setup(formId, okId, path) {
    var f = document.getElementById(formId), ok = document.getElementById(okId);
    if (!f || !ok) return;
    var small = ok.querySelector('small'); if (small) small.remove();
    var hp = document.createElement('input');
    hp.type = 'text'; hp.name = 'website'; hp.tabIndex = -1; hp.autocomplete = 'off'; hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-5000px;width:1px;height:1px;opacity:0';
    f.appendChild(hp);
    var err = document.createElement('p');
    err.className = 'notice'; err.setAttribute('role', 'alert'); err.hidden = true;
    err.textContent = "Une erreur est survenue : votre demande n'a pas pu être envoyée. Réessayez dans un instant.";
    ok.parentNode.insertBefore(err, ok.nextSibling);

    f.addEventListener('submit', function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      var btn = f.querySelector('button[type=submit]'), label = btn.innerHTML;
      var fd = new FormData(f), data = {};
      fd.forEach(function (v, k) { if (typeof v === 'string') data[k] = v; });
      var s = [data.saveur1, data.saveur2, data.saveur3, data.autre_saveur].filter(function (x) { return x && x.indexOf('Autre (') !== 0 && x.indexOf('choisir') < 0; });
      if (s.length) data.saveurs = s.join(', ');
      btn.disabled = true; btn.textContent = 'Envoi en cours…'; err.hidden = true;
      fetch(ENDPOINT + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error('refus');
          f.reset(); ok.hidden = false; ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(function () { err.hidden = false; err.scrollIntoView({ behavior: 'smooth', block: 'center' }); })
        .then(function () { btn.disabled = false; btn.innerHTML = label; });
    }, true);
  }
  setup('contactForm', 'contactOk', '/contact');
  setup('devisForm', 'devisOk', '/devis');
})();
